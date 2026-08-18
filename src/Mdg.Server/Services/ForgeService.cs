using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Mdg.Core.Features.Items;
using Mdg.Core.Features.Items.Crafting;

namespace Mdg.Server.Services
{
    public sealed class ForgeService
    {
        private readonly GenesisCraftingEngine _craftingEngine = new();

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

    public record ForgeRequestDto(
        string? CurrencyType,
        LootItemDto? Item);

    public record ForgeResultDto(
        bool Success,
        string Message,
        LootItemDto? Item);
}
