using System;
using System.Collections.Generic;
using System.Linq;

namespace Mdg.Core.Features.Items.Crafting
{
    public sealed class GenesisCraftingEngine
    {
        private readonly Random _rng;

        public GenesisCraftingEngine(Random? rng = null)
        {
            _rng = rng ?? new Random();
        }

        public bool ApplyAetherSpark(ItemEntity item, out string message)
        {
            if (item.Rarity != ItemRarity.Normal)
            {
                message = "Aether Spark can only be used on Normal items.";
                return false;
            }

            item.Rarity = ItemRarity.Magic;
            item.ClearMods();

            int modCount = _rng.Next(1, 3); // 1 or 2
            var existingKeys = new List<string>();

            // Always add 1 Prefix
            var prefix = AffixPool.RollRandomAffix(AffixClassification.Prefix, existingKeys, _rng);
            item.AddMod(prefix.Description, prefix.StatKey, prefix.CurrentValue);
            existingKeys.Add(prefix.Key);

            if (modCount == 2)
            {
                var suffix = AffixPool.RollRandomAffix(AffixClassification.Suffix, existingKeys, _rng);
                item.AddMod(suffix.Description, suffix.StatKey, suffix.CurrentValue);
            }

            message = $"Awakened into a Magic item with {modCount} modifier(s).";
            return true;
        }

        public bool ApplyFluxCatalyst(ItemEntity item, out string message)
        {
            if (item.Rarity != ItemRarity.Magic)
            {
                message = "Flux Catalyst can only be used on Magic items.";
                return false;
            }

            item.ClearMods();
            int modCount = _rng.Next(1, 3); // 1 or 2
            var existingKeys = new List<string>();

            var prefix = AffixPool.RollRandomAffix(AffixClassification.Prefix, existingKeys, _rng);
            item.AddMod(prefix.Description, prefix.StatKey, prefix.CurrentValue);
            existingKeys.Add(prefix.Key);

            if (modCount == 2)
            {
                var suffix = AffixPool.RollRandomAffix(AffixClassification.Suffix, existingKeys, _rng);
                item.AddMod(suffix.Description, suffix.StatKey, suffix.CurrentValue);
            }

            message = $"Reforged Magic item modifiers ({modCount} mod(s)).";
            return true;
        }

        public bool ApplyGenesisPrism(ItemEntity item, out string message)
        {
            if (item.Rarity != ItemRarity.Normal)
            {
                message = "Genesis Prism can only be used on Normal items.";
                return false;
            }

            item.Rarity = ItemRarity.Rare;
            item.ClearMods();

            int modCount = _rng.Next(4, 7); // 4 to 6
            int prefixCount = Math.Min(3, modCount / 2);
            int suffixCount = modCount - prefixCount;

            var existingKeys = new List<string>();

            for (int i = 0; i < prefixCount; i++)
            {
                var prefix = AffixPool.RollRandomAffix(AffixClassification.Prefix, existingKeys, _rng);
                item.AddMod(prefix.Description, prefix.StatKey, prefix.CurrentValue);
                existingKeys.Add(prefix.Key);
            }

            for (int i = 0; i < suffixCount; i++)
            {
                var suffix = AffixPool.RollRandomAffix(AffixClassification.Suffix, existingKeys, _rng);
                item.AddMod(suffix.Description, suffix.StatKey, suffix.CurrentValue);
                existingKeys.Add(suffix.Key);
            }

            message = $"Manifested into a Rare item with {modCount} modifiers ({prefixCount} prefixes, {suffixCount} suffixes).";
            return true;
        }

        public bool ApplyFractureCore(ItemEntity item, out string message)
        {
            if (item.Rarity != ItemRarity.Rare)
            {
                message = "Fracture Core can only be used on Rare items.";
                return false;
            }

            // Respect Prefix / Suffix Locks if applicable
            bool keepPrefixes = item.PrefixesLocked;
            bool keepSuffixes = item.SuffixesLocked;

            if (!keepPrefixes && !keepSuffixes)
            {
                item.ClearMods();
            }

            int modCount = _rng.Next(4, 7); // 4 to 6
            int prefixCount = Math.Min(3, modCount / 2);
            int suffixCount = modCount - prefixCount;

            var existingKeys = new List<string>();

            if (!keepPrefixes)
            {
                for (int i = 0; i < prefixCount; i++)
                {
                    var prefix = AffixPool.RollRandomAffix(AffixClassification.Prefix, existingKeys, _rng);
                    item.AddMod(prefix.Description, prefix.StatKey, prefix.CurrentValue);
                    existingKeys.Add(prefix.Key);
                }
            }

            if (!keepSuffixes)
            {
                for (int i = 0; i < suffixCount; i++)
                {
                    var suffix = AffixPool.RollRandomAffix(AffixClassification.Suffix, existingKeys, _rng);
                    item.AddMod(suffix.Description, suffix.StatKey, suffix.CurrentValue);
                    existingKeys.Add(suffix.Key);
                }
            }

            message = $"Restructured Rare item with new modifiers.";
            return true;
        }

        public bool ApplyAscendantCatalyst(ItemEntity item, out string message)
        {
            if (item.Rarity != ItemRarity.Rare)
            {
                message = "Ascendant Catalyst can only be used on Rare items.";
                return false;
            }

            if (item.ExplicitMods.Count >= 6)
            {
                message = "Item already has the maximum of 6 modifiers.";
                return false;
            }

            // Decide whether to add Prefix or Suffix
            var existingKeys = new List<string>();
            var classification = (_rng.Next(2) == 0) ? AffixClassification.Prefix : AffixClassification.Suffix;
            var newAffix = AffixPool.RollRandomAffix(classification, existingKeys, _rng);
            item.AddMod(newAffix.Description, newAffix.StatKey, newAffix.CurrentValue);

            message = $"Augmented Rare item with high-tier modifier: {newAffix.Description}.";
            return true;
        }

        public bool ApplyOriginMatrix(ItemEntity item, out string message)
        {
            if (item.StatBonuses.Count == 0)
            {
                message = "Item has no numeric modifiers to calibrate.";
                return false;
            }

            var keys = item.StatBonuses.Keys.ToList();
            foreach (var key in keys)
            {
                float current = item.StatBonuses[key];
                // Roll new value within 80% to 120% range or reroll based on pool
                float factor = 0.85f + (float)_rng.NextDouble() * 0.35f;
                item.StatBonuses[key] = MathF.Round(current * factor);
            }

            message = "Calibrated all numeric modifier values towards perfection.";
            return true;
        }

        public bool ApplySocketingCore(ItemEntity item, out string message)
        {
            if (item.Slot == ItemSlot.Ring || item.Slot == ItemSlot.Amulet || item.Slot == ItemSlot.None)
            {
                message = "Accessories cannot have gem sockets.";
                return false;
            }

            int maxSockets = 4;
            int newSockets = _rng.Next(1, maxSockets + 1);
            item.Sockets = newSockets;
            item.SocketLinks = Math.Min(item.SocketLinks, item.Sockets);

            message = $"Item sockets modified to {newSockets}.";
            return true;
        }

        public bool ApplyHarmonicTether(ItemEntity item, out string message)
        {
            if (item.Sockets <= 1)
            {
                message = "Item needs at least 2 sockets to forge links.";
                return false;
            }

            // Roll links between 2 and item.Sockets
            int newLinks = _rng.Next(2, item.Sockets + 1);
            item.SocketLinks = newLinks;

            message = $"Harmonized sockets with {newLinks}-linked chain.";
            return true;
        }
    }
}
