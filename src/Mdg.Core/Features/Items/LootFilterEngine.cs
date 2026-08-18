namespace Mdg.Core.Features.Items
{
    public enum LootFilterMode
    {
        Normal = 0,     // Hiển thị tất cả
        SemiStrict = 1, // Ẩn đồ Normal không có sockets
        Strict = 2,     // Ẩn đồ Normal & Magic thông thường
        UberStrict = 3  // Chỉ hiện Unique, Rare iLvl 60+, High Currency
    }

    public static class LootFilterEngine
    {
        public static bool ShouldDisplay(ItemEntity item, LootFilterMode filterMode)
        {
            if (filterMode == LootFilterMode.Normal)
                return true;

            // Unique items and high currency are ALWAYS displayed across all filter tiers
            if (item.Rarity == ItemRarity.Unique)
                return true;

            if (item.Rarity == ItemRarity.Currency)
            {
                if (filterMode == LootFilterMode.UberStrict)
                {
                    // In UberStrict, only show Genesis Prism, Fracture Core, Ascendant Catalyst
                    return item.Name == "Fracture Core" || 
                           item.Name == "Ascendant Catalyst" || 
                           item.Name == "Genesis Prism";
                }
                return true;
            }

            if (filterMode == LootFilterMode.SemiStrict)
            {
                // In SemiStrict, hide normal items without sockets
                if (item.Rarity == ItemRarity.Normal && item.Sockets < 2)
                    return false;
                return true;
            }

            if (filterMode == LootFilterMode.Strict)
            {
                // In Strict, hide all Normal items and Magic items
                if (item.Rarity == ItemRarity.Normal) return false;
                if (item.Rarity == ItemRarity.Magic && item.Sockets < 3) return false;
                return true;
            }

            if (filterMode == LootFilterMode.UberStrict)
            {
                // In UberStrict, hide Normal & Magic, only show Rare with iLvl >= 50 or 4 sockets
                if (item.Rarity != ItemRarity.Rare) return false;
                return item.ItemLevel >= 50 || item.Sockets >= 4;
            }

            return true;
        }
    }
}
