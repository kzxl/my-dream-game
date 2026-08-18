using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Items
{
    public enum ItemRarity
    {
        Normal = 0,
        Magic = 1,
        Rare = 2,
        Unique = 3,
        Currency = 4
    }

    public enum ItemSlot
    {
        None = 0,
        Helm = 1,
        BodyArmor = 2,
        MainHand = 3,
        OffHand = 4,
        Ring = 5,
        Amulet = 6
    }

    public sealed class ItemEntity
    {
        public Guid Id { get; } = Guid.NewGuid();
        public string Name { get; set; }
        public string BaseType { get; set; }
        public ItemRarity Rarity { get; set; }
        public ItemSlot Slot { get; set; }
        public int ItemLevel { get; set; }
        public string Icon { get; set; } = "📦";
        public List<string> ExplicitMods { get; } = new();
        public Dictionary<string, float> StatBonuses { get; } = new();

        public ItemEntity(string name, string baseType, ItemRarity rarity, ItemSlot slot, int itemLevel = 1, string icon = "📦")
        {
            Name = name;
            BaseType = baseType;
            Rarity = rarity;
            Slot = slot;
            ItemLevel = itemLevel;
            Icon = icon;
        }

        public ItemEntity AddMod(string modText, string statKey = "", float value = 0)
        {
            ExplicitMods.Add(modText);
            if (!string.IsNullOrEmpty(statKey))
            {
                StatBonuses[statKey] = value;
            }
            return this;
        }
    }
}
