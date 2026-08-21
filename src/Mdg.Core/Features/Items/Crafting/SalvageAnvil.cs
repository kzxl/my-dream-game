using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Items.Crafting
{
    public sealed class SalvageResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Dictionary<string, int> ProducedMaterials { get; set; } = new();
    }

    public sealed class SalvageAnvil
    {
        public SalvageResult Salvage(ItemEntity item)
        {
            if (item == null)
            {
                return new SalvageResult
                {
                    Success = false,
                    Message = "No item provided for salvage."
                };
            }

            var materials = new Dictionary<string, int>();

            switch (item.Rarity)
            {
                case ItemRarity.Normal:
                    materials["mat_iron_ore"] = 3;
                    materials["mat_beast_leather"] = 1;
                    break;

                case ItemRarity.Magic:
                    materials["mat_mithril_chunk"] = 4;
                    materials["mat_aether_crystal"] = 2;
                    break;

                case ItemRarity.Rare:
                    materials["mat_adamantite_ingot"] = 6;
                    materials["mat_aether_crystal"] = 3;
                    materials["mat_shard_genesis"] = 1;
                    break;

                case ItemRarity.Unique:
                    materials["mat_adamantite_ingot"] = 12;
                    materials["mat_shard_genesis"] = 3;
                    materials["fracture_core"] = 1;
                    break;

                default:
                    materials["mat_iron_ore"] = 1;
                    break;
            }

            return new SalvageResult
            {
                Success = true,
                Message = $"Successfully salvaged {item.Name} ({item.Rarity}) into crafting materials.",
                ProducedMaterials = materials
            };
        }
    }
}
