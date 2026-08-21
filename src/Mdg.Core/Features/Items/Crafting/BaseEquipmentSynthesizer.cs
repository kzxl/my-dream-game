using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Items.Crafting
{
    public sealed class ForgingRecipe
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string BaseType { get; set; } = string.Empty;
        public ItemSlot Slot { get; set; }
        public int RequiredLevel { get; set; } = 1;
        public string Icon { get; set; } = "⚔️";
        public Dictionary<string, int> RequiredMaterials { get; set; } = new();
    }

    public sealed class BaseEquipmentSynthesizer
    {
        public static readonly List<ForgingRecipe> AvailableRecipes = new()
        {
            new ForgingRecipe
            {
                Id = "forge_iron_sword",
                Name = "Iron Longsword",
                BaseType = "sword_1h",
                Slot = ItemSlot.MainHand,
                RequiredLevel = 1,
                Icon = "🗡️",
                RequiredMaterials = new Dictionary<string, int>
                {
                    { "mat_iron_ore", 5 },
                    { "mat_beast_leather", 2 }
                }
            },
            new ForgingRecipe
            {
                Id = "forge_mithril_blade",
                Name = "Mithril Arcane Blade",
                BaseType = "sword_1h",
                Slot = ItemSlot.MainHand,
                RequiredLevel = 25,
                Icon = "⚔️",
                RequiredMaterials = new Dictionary<string, int>
                {
                    { "mat_mithril_chunk", 8 },
                    { "mat_aether_crystal", 3 }
                }
            },
            new ForgingRecipe
            {
                Id = "forge_adamantite_greatsword",
                Name = "Adamantite Colossus Greatsword",
                BaseType = "sword_2h",
                Slot = ItemSlot.MainHand,
                RequiredLevel = 50,
                Icon = "🗡️",
                RequiredMaterials = new Dictionary<string, int>
                {
                    { "mat_adamantite_ingot", 12 },
                    { "mat_aether_crystal", 4 }
                }
            },
            new ForgingRecipe
            {
                Id = "forge_iron_armor",
                Name = "Reinforced Iron Cuirass",
                BaseType = "body_armor",
                Slot = ItemSlot.BodyArmor,
                RequiredLevel = 1,
                Icon = "🛡️",
                RequiredMaterials = new Dictionary<string, int>
                {
                    { "mat_iron_ore", 6 },
                    { "mat_beast_leather", 4 }
                }
            },
            new ForgingRecipe
            {
                Id = "forge_mithril_hauberk",
                Name = "Mithril Ward Hauberk",
                BaseType = "body_armor",
                Slot = ItemSlot.BodyArmor,
                RequiredLevel = 25,
                Icon = "🛡️",
                RequiredMaterials = new Dictionary<string, int>
                {
                    { "mat_mithril_chunk", 10 },
                    { "mat_beast_leather", 6 }
                }
            },
            new ForgingRecipe
            {
                Id = "forge_adamantite_plate",
                Name = "Adamantite Titan Warplate",
                BaseType = "body_armor",
                Slot = ItemSlot.BodyArmor,
                RequiredLevel = 50,
                Icon = "🛡️",
                RequiredMaterials = new Dictionary<string, int>
                {
                    { "mat_adamantite_ingot", 15 },
                    { "mat_aether_crystal", 6 }
                }
            },
            new ForgingRecipe
            {
                Id = "forge_aether_ring",
                Name = "Aetherium Band of Resilience",
                BaseType = "ring",
                Slot = ItemSlot.Ring,
                RequiredLevel = 20,
                Icon = "💍",
                RequiredMaterials = new Dictionary<string, int>
                {
                    { "mat_mithril_chunk", 4 },
                    { "mat_aether_crystal", 4 }
                }
            },
            new ForgingRecipe
            {
                Id = "forge_prismatic_amulet",
                Name = "Prismatic Star Amulet",
                BaseType = "amulet",
                Slot = ItemSlot.Amulet,
                RequiredLevel = 40,
                Icon = "📿",
                RequiredMaterials = new Dictionary<string, int>
                {
                    { "mat_adamantite_ingot", 6 },
                    { "mat_aether_crystal", 8 },
                    { "mat_shard_genesis", 2 }
                }
            }
        };

        public bool TryForgeBase(string recipeId, Dictionary<string, int> playerMaterials, out ItemEntity? forgedItem, out string message)
        {
            forgedItem = null;
            var recipe = AvailableRecipes.Find(r => r.Id == recipeId);
            if (recipe == null)
            {
                message = $"Recipe with ID '{recipeId}' not found.";
                return false;
            }

            foreach (var kvp in recipe.RequiredMaterials)
            {
                var matKey = kvp.Key;
                var requiredCount = kvp.Value;
                var currentCount = playerMaterials.TryGetValue(matKey, out var count) ? count : 0;
                if (currentCount < requiredCount)
                {
                    message = $"Insufficient material '{matKey}'. Required: {requiredCount}, Available: {currentCount}.";
                    return false;
                }
            }

            // Deduct materials
            foreach (var kvp in recipe.RequiredMaterials)
            {
                playerMaterials[kvp.Key] -= kvp.Value;
            }

            // Create new Base Normal Item with 1-2 initial Sockets
            var sockets = (recipe.Slot == ItemSlot.MainHand || recipe.Slot == ItemSlot.BodyArmor) ? 2 : (recipe.Slot == ItemSlot.Ring || recipe.Slot == ItemSlot.Amulet ? 0 : 1);
            var links = sockets > 1 ? 1 : 0;

            forgedItem = new ItemEntity(
                name: recipe.Name,
                baseType: recipe.BaseType,
                rarity: ItemRarity.Normal,
                slot: recipe.Slot,
                itemLevel: recipe.RequiredLevel,
                icon: recipe.Icon,
                sockets: sockets,
                links: links
            );

            message = $"Successfully forged {recipe.Name} (Level {recipe.RequiredLevel})!";
            return true;
        }
    }
}
