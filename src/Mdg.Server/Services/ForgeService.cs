using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using Mdg.Core.Features.Items;
using Mdg.Core.Features.Items.Crafting;

namespace Mdg.Server.Services
{
    public sealed class ForgeService
    {
        private readonly GenesisCraftingEngine _craftingEngine = new();
        private readonly SalvageAnvil _salvageAnvil = new();
        private readonly BaseEquipmentSynthesizer _baseSynthesizer = new();
        private readonly CraftingRecipeEngine _recipeEngine = new();

        public SalvageResultDto Salvage(SalvageRequestDto req)
        {
            if (req.Item == null)
            {
                return new SalvageResultDto(false, "No item provided for salvage.", new());
            }

            var item = MapDtoToEntity(req.Item);
            var result = _salvageAnvil.Salvage(item);

            return new SalvageResultDto(result.Success, result.Message, result.ProducedMaterials);
        }

        public CraftBaseResultDto CraftBaseEquipment(CraftBaseRequestDto req)
        {
            var recipe = _recipeEngine.GetRecipe(req.RecipeId ?? "");
            if (recipe == null)
            {
                return new CraftBaseResultDto(false, $"Recipe '{req.RecipeId}' not found.", null, false, false, 0, new());
            }

            var unlocked = req.UnlockedRecipes?.ToHashSet() ?? _recipeEngine.GetDefaultUnlockedRecipeIds();
            var materials = req.Materials != null ? new Dictionary<string, int>(req.Materials) : new();

            if (!_recipeEngine.CanCraft(req.RecipeId!, req.CharacterLevel, unlocked, materials, out var failureReason))
            {
                return new CraftBaseResultDto(false, failureReason, null, false, false, 0, materials);
            }

            var masteryState = CraftingMasteryEngine.CalculateState(req.CraftingMasteryLevel, req.CraftingMasteryExp);
            var outcome = CraftingMasteryEngine.EvaluateCrafting(masteryState);

            // Deduct materials unless resource was saved
            if (!outcome.IsResourceSaved)
            {
                foreach (var (matId, reqCount) in recipe.MaterialCosts)
                {
                    if (materials.ContainsKey(matId))
                    {
                        materials[matId] = Math.Max(0, materials[matId] - reqCount);
                    }
                }
            }

            // Sockets and Links
            var slotEnum = Enum.TryParse<ItemSlot>(recipe.Slot, true, out var s) ? s : ItemSlot.None;
            int sockets = (slotEnum == ItemSlot.MainHand || slotEnum == ItemSlot.BodyArmor) ? 2 : (slotEnum == ItemSlot.Ring || slotEnum == ItemSlot.Amulet ? 0 : 1);
            if (outcome.BonusSocketsAwarded > 0 && sockets < 6 && slotEnum != ItemSlot.Ring && slotEnum != ItemSlot.Amulet)
            {
                sockets = Math.Min(6, sockets + outcome.BonusSocketsAwarded);
            }
            int links = sockets > 1 ? 1 : 0;

            // Stats calculation
            float baseDmg = slotEnum == ItemSlot.MainHand ? (recipe.RequiredLevel * 2 + 15) : 0;
            float baseArmor = slotEnum == ItemSlot.BodyArmor ? (recipe.RequiredLevel * 4 + 40) : 0;
            float baseLife = slotEnum == ItemSlot.BodyArmor ? (recipe.RequiredLevel * 2 + 20) : 0;

            if (outcome.IsMasterworkCrit)
            {
                baseDmg = MathF.Round(baseDmg * 1.25f);
                baseArmor = MathF.Round(baseArmor * 1.25f);
                baseLife = MathF.Round(baseLife * 1.25f);
            }

            var statBonuses = new Dictionary<string, float>();
            if (baseDmg > 0) statBonuses["damage"] = baseDmg;
            if (baseArmor > 0) statBonuses["armor"] = baseArmor;
            if (baseLife > 0) statBonuses["life"] = baseLife;

            var explicitMods = new List<string>();
            if (outcome.IsMasterworkCrit)
            {
                explicitMods.Add("✨ Masterwork: +25% Superior Base Stats");
            }

            var itemDto = new LootItemDto
            {
                Id = Guid.NewGuid().ToString("N"),
                Name = outcome.IsMasterworkCrit ? $"⭐ Masterwork {recipe.Name}" : recipe.Name,
                BaseType = recipe.BaseType,
                Rarity = outcome.IsMasterworkCrit ? "Rare" : "Normal",
                Slot = recipe.Slot.ToLowerInvariant(),
                ItemLevel = recipe.RequiredLevel,
                Icon = slotEnum == ItemSlot.MainHand ? "🗡️" : (slotEnum == ItemSlot.BodyArmor ? "🛡️" : (slotEnum == ItemSlot.Ring ? "💍" : "📿")),
                Sockets = sockets,
                SocketLinks = links,
                ExplicitMods = explicitMods,
                StatBonuses = statBonuses,
                BeamHeight = outcome.IsMasterworkCrit ? 240 : 0
            };

            int awardedExp = outcome.IsMasterworkCrit ? 50 : 35;
            string msg = outcome.IsMasterworkCrit 
                ? $"⭐ Masterwork Great Success! Forged {itemDto.Name}." 
                : $"✨ Successfully forged {itemDto.Name}.";

            return new CraftBaseResultDto(true, msg, itemDto, outcome.IsMasterworkCrit, outcome.IsResourceSaved, awardedExp, materials);
        }

        public SmeltResultDto Smelt(SmeltRequestDto req)
        {
            var recipe = _recipeEngine.GetSmeltingRecipe(req.RecipeId ?? "");
            if (recipe == null)
            {
                return new SmeltResultDto(false, $"Smelting recipe '{req.RecipeId}' not found.", null, 0, new());
            }

            var materials = req.Materials != null ? new Dictionary<string, int>(req.Materials) : new();
            if (!_recipeEngine.CanSmelt(req.RecipeId!, req.CharacterLevel, materials, out var failureReason))
            {
                return new SmeltResultDto(false, failureReason, null, 0, materials);
            }

            // Deduct input costs
            foreach (var (matId, reqCount) in recipe.InputCosts)
            {
                materials[matId] = Math.Max(0, materials[matId] - reqCount);
            }

            // Add output item
            materials[recipe.OutputItemId] = (materials.TryGetValue(recipe.OutputItemId, out var c) ? c : 0) + recipe.OutputQuantity;

            return new SmeltResultDto(true, $"Successfully refined {recipe.Name} (x{recipe.OutputQuantity})!", recipe.OutputItemId, recipe.OutputQuantity, materials);
        }

        public BrewFlaskResultDto BrewFlask(BrewFlaskRequestDto req)
        {
            var recipe = _recipeEngine.GetAlchemyRecipe(req.RecipeId ?? "");
            if (recipe == null)
            {
                return new BrewFlaskResultDto(false, $"Alchemy recipe '{req.RecipeId}' not found.", null, new());
            }

            var materials = req.Materials != null ? new Dictionary<string, int>(req.Materials) : new();
            if (!_recipeEngine.CanBrew(req.RecipeId!, req.CharacterLevel, materials, out var failureReason))
            {
                return new BrewFlaskResultDto(false, failureReason, null, materials);
            }

            // Deduct input costs
            foreach (var (matId, reqCount) in recipe.MaterialCosts)
            {
                materials[matId] = Math.Max(0, materials[matId] - reqCount);
            }

            var flaskItem = new LootItemDto
            {
                Id = $"{recipe.OutputFlaskId}_{Guid.NewGuid():N}",
                Name = recipe.Name,
                BaseType = recipe.OutputFlaskId,
                Rarity = recipe.RequiredLevel >= 40 ? "Unique" : "Magic",
                Slot = "flask",
                ItemLevel = recipe.RequiredLevel,
                Icon = "🧪",
                Sockets = 0,
                SocketLinks = 0,
                ExplicitMods = new List<string> { recipe.Description },
                StatBonuses = new Dictionary<string, float>(),
                BeamHeight = recipe.RequiredLevel >= 40 ? 350 : 240
            };

            return new BrewFlaskResultDto(true, $"Successfully brewed {recipe.Name}!", flaskItem, materials);
        }

        public ForgeResultDto ApplyCurrency(ForgeRequestDto req)
        {
            if (req.Item == null)
            {
                return new ForgeResultDto(false, "No target item provided for crafting.", null);
            }

            var item = MapDtoToEntity(req.Item);
            string currency = req.CurrencyType?.ToLowerInvariant() ?? "";
            bool success = false;
            string message = "";

            switch (currency)
            {
                case "currency_transmute" or "transmute" or "aetherspark":
                    success = _craftingEngine.ApplyAetherSpark(item, out message);
                    break;

                case "currency_alchemy" or "alchemy" or "genesisprism":
                    success = _craftingEngine.ApplyGenesisPrism(item, out message);
                    break;

                case "currency_chaos" or "chaos" or "fracturecore":
                    success = _craftingEngine.ApplyFractureCore(item, out message);
                    break;

                case "currency_exalted" or "exalted" or "ascendantcatalyst":
                    success = _craftingEngine.ApplyAscendantCatalyst(item, out message);
                    break;

                case "currency_divine" or "divine" or "originmatrix":
                    success = _craftingEngine.ApplyOriginMatrix(item, out message);
                    break;

                case "currency_alteration" or "alteration" or "fluxcatalyst":
                    success = _craftingEngine.ApplyFluxCatalyst(item, out message);
                    break;

                case "currency_scouring" or "scouring":
                    if (item.Rarity == ItemRarity.Normal || item.Rarity == ItemRarity.Unique || item.Rarity == ItemRarity.Set)
                    {
                        message = "Scouring Orb can only be applied to Magic or Rare items.";
                        success = false;
                    }
                    else
                    {
                        item.Rarity = ItemRarity.Normal;
                        item.ClearMods();
                        message = "Item purified back to Normal base.";
                        success = true;
                    }
                    break;

                case "currency_jeweller" or "jeweller" or "socketingcore":
                    success = _craftingEngine.ApplySocketingCore(item, out message);
                    break;

                case "currency_fusing" or "fusing" or "harmonictether":
                    success = _craftingEngine.ApplyHarmonicTether(item, out message);
                    break;

                case "currency_whetstone" or "whetstone":
                    if (item.StatBonuses.TryGetValue("damage", out float dmg))
                    {
                        item.StatBonuses["damage"] = dmg + 5;
                        item.AddMod("Superior Quality (+5 Dmg)", "damage", 5);
                        message = "Weapon sharpened (+5 Physical Damage).";
                        success = true;
                    }
                    else
                    {
                        item.StatBonuses["armor"] = (item.StatBonuses.GetValueOrDefault("armor", 0)) + 15;
                        item.AddMod("Reinforced Quality (+15 Armor)", "armor", 15);
                        message = "Armour reinforced (+15 Armor Rating).";
                        success = true;
                    }
                    break;

                default:
                    message = $"Unknown currency type '{req.CurrencyType}'.";
                    success = false;
                    break;
            }

            var updatedDto = success ? MapEntityToDto(item) : req.Item;
            return new ForgeResultDto(success, message, updatedDto);
        }

        private static ItemEntity MapDtoToEntity(LootItemDto dto)
        {
            var rarity = Enum.TryParse<ItemRarity>(dto.Rarity, true, out var r) ? r : ItemRarity.Normal;
            var slot = Enum.TryParse<ItemSlot>(dto.Slot, true, out var s) ? s : ItemSlot.None;

            var entity = new ItemEntity(
                dto.Name ?? "Item",
                dto.BaseType ?? "Base",
                rarity,
                slot,
                dto.ItemLevel > 0 ? dto.ItemLevel : 1,
                dto.Icon ?? "📦",
                dto.Sockets,
                dto.SocketLinks);

            if (dto.ExplicitMods != null)
            {
                foreach (var m in dto.ExplicitMods) entity.ExplicitMods.Add(m);
            }

            if (dto.StatBonuses != null)
            {
                foreach (var kvp in dto.StatBonuses) entity.StatBonuses[kvp.Key] = kvp.Value;
            }

            return entity;
        }

        private static LootItemDto MapEntityToDto(ItemEntity item)
        {
            int beamHeight = 0;
            if (item.Rarity == ItemRarity.Unique || item.Rarity == ItemRarity.Set || item.Rarity == ItemRarity.Gem)
            {
                beamHeight = 350;
            }
            else if (item.Rarity == ItemRarity.Rare || item.Rarity == ItemRarity.Currency || item.Rarity == ItemRarity.Consumable)
            {
                beamHeight = 240;
            }

            return new LootItemDto
            {
                Id = item.Id.ToString(),
                Name = item.Name,
                BaseType = item.BaseType,
                Rarity = item.Rarity.ToString(),
                Slot = item.Slot.ToString().ToLowerInvariant(),
                ItemLevel = item.ItemLevel,
                Icon = item.Icon,
                Sockets = item.Sockets,
                SocketLinks = item.SocketLinks,
                ExplicitMods = item.ExplicitMods,
                StatBonuses = item.StatBonuses,
                BeamHeight = beamHeight
            };
        }
    }

    public record SalvageRequestDto(LootItemDto? Item);
    public record SalvageResultDto(bool Success, string Message, Dictionary<string, int> ProducedMaterials);

    public record CraftBaseRequestDto(
        string? RecipeId,
        int CharacterLevel,
        int CraftingMasteryLevel,
        long CraftingMasteryExp,
        List<string>? UnlockedRecipes,
        Dictionary<string, int>? Materials);

    public record CraftBaseResultDto(
        bool Success,
        string Message,
        LootItemDto? Item,
        bool IsMasterwork,
        bool IsResourceSaved,
        int ExpGain,
        Dictionary<string, int> RemainingMaterials);

    public record SmeltRequestDto(
        string? RecipeId,
        int CharacterLevel,
        Dictionary<string, int>? Materials);

    public record SmeltResultDto(
        bool Success,
        string Message,
        string? OutputItemId,
        int OutputQuantity,
        Dictionary<string, int> RemainingMaterials);

    public record BrewFlaskRequestDto(
        string? RecipeId,
        int CharacterLevel,
        Dictionary<string, int>? Materials);

    public record BrewFlaskResultDto(
        bool Success,
        string Message,
        LootItemDto? FlaskItem,
        Dictionary<string, int> RemainingMaterials);

    public record ForgeRequestDto(
        string? CurrencyType,
        LootItemDto? Item);

    public record ForgeResultDto(
        bool Success,
        string Message,
        LootItemDto? Item);
}

