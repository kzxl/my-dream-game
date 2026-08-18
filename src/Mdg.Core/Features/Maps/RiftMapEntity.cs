using System;
using System.Collections.Generic;
using Mdg.Core.Features.Items;

namespace Mdg.Core.Features.Maps
{
    public sealed class RiftMapAffix
    {
        public string Key { get; }
        public string Description { get; }
        public float QuantityBonus { get; }
        public float RarityBonus { get; }
        public float PackSizeBonus { get; }

        public RiftMapAffix(string key, string description, float quantityBonus, float rarityBonus, float packSizeBonus = 0f)
        {
            Key = key;
            Description = description;
            QuantityBonus = quantityBonus;
            RarityBonus = rarityBonus;
            PackSizeBonus = packSizeBonus;
        }
    }

    public sealed class RiftMapEntity
    {
        public Guid Id { get; } = Guid.NewGuid();
        public string ZoneName { get; set; }
        public int Tier { get; set; } // 1 to 16
        public ItemRarity Rarity { get; set; } = ItemRarity.Normal;
        public bool IsCorrupted { get; set; } = false;

        public List<RiftMapAffix> Affixes { get; } = new();

        public float TotalQuantityBonus
        {
            get
            {
                float total = Tier * 2.0f; // Base quantity per tier
                foreach (var affix in Affixes) total += affix.QuantityBonus;
                return total;
            }
        }

        public float TotalRarityBonus
        {
            get
            {
                float total = Tier * 3.5f; // Base rarity per tier
                foreach (var affix in Affixes) total += affix.RarityBonus;
                return total;
            }
        }

        public float TotalPackSizeBonus
        {
            get
            {
                float total = 0f;
                foreach (var affix in Affixes) total += affix.PackSizeBonus;
                return total;
            }
        }

        public RiftMapEntity(string zoneName, int tier, ItemRarity rarity = ItemRarity.Normal)
        {
            ZoneName = zoneName;
            Tier = Math.Clamp(tier, 1, 16);
            Rarity = rarity;
        }

        public void AddAffix(RiftMapAffix affix)
        {
            Affixes.Add(affix);
        }

        public void ClearAffixes()
        {
            Affixes.Clear();
        }
    }
}
