using System;

namespace Mdg.Core.Features.Items.Crafting
{
    public sealed class GenesisForgeBench
    {
        public const int PREFIX_LOCK_COST = 2; // 2x Fracture Core
        public const int SUFFIX_LOCK_COST = 2; // 2x Fracture Core
        public const int GUARANTEED_AFFIX_COST = 1; // 1x Ascendant Catalyst

        public bool TryLockPrefixes(ItemEntity item, int availableFractureCores, out string message)
        {
            if (item.Rarity != ItemRarity.Rare)
            {
                message = "Prefix Lock can only be applied to Rare items.";
                return false;
            }

            if (availableFractureCores < PREFIX_LOCK_COST)
            {
                message = $"Insufficient Fracture Cores. Required: {PREFIX_LOCK_COST}, Available: {availableFractureCores}.";
                return false;
            }

            item.PrefixesLocked = true;
            message = "Prefixes have been locked. Fracture Core will not alter existing prefixes.";
            return true;
        }

        public bool TryLockSuffixes(ItemEntity item, int availableFractureCores, out string message)
        {
            if (item.Rarity != ItemRarity.Rare)
            {
                message = "Suffix Lock can only be applied to Rare items.";
                return false;
            }

            if (availableFractureCores < SUFFIX_LOCK_COST)
            {
                message = $"Insufficient Fracture Cores. Required: {SUFFIX_LOCK_COST}, Available: {availableFractureCores}.";
                return false;
            }

            item.SuffixesLocked = true;
            message = "Suffixes have been locked. Fracture Core will not alter existing suffixes.";
            return true;
        }

        public bool TryCraftSpecificAffix(ItemEntity item, string affixKey, int availableAscendantCatalysts, out string message)
        {
            if (item.Rarity != ItemRarity.Rare && item.Rarity != ItemRarity.Magic)
            {
                message = "Bench Crafting can only be performed on Magic or Rare items.";
                return false;
            }

            if (availableAscendantCatalysts < GUARANTEED_AFFIX_COST)
            {
                message = $"Insufficient Ascendant Catalysts. Required: {GUARANTEED_AFFIX_COST}, Available: {availableAscendantCatalysts}.";
                return false;
            }

            if (item.ExplicitMods.Count >= 6)
            {
                message = "Item already has the maximum of 6 modifiers.";
                return false;
            }

            var affix = AffixPool.GetAffixByKey(affixKey);
            if (affix == null)
            {
                message = $"Affix with key '{affixKey}' not found in pool.";
                return false;
            }

            item.AddMod($"[Forge] {affix.Description}", affix.StatKey, affix.CurrentValue);
            message = $"Successfully forged guaranteed affix: {affix.Description}.";
            return true;
        }

        public void ClearLocks(ItemEntity item)
        {
            item.PrefixesLocked = false;
            item.SuffixesLocked = false;
        }
    }
}
