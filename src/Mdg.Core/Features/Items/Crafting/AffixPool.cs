using System;
using System.Collections.Generic;
using System.Linq;

namespace Mdg.Core.Features.Items.Crafting
{
    public static class AffixPool
    {
        private static readonly List<ItemAffix> _allAffixes = new()
        {
            // Prefixes (Flat/Scaling Damage, Life, ES, Armor)
            new ItemAffix("flat_phys", AffixClassification.Prefix, "FlatPhys", 15, 45, 30, "+{0} to Physical Damage"),
            new ItemAffix("inc_phys", AffixClassification.Prefix, "IncPhys", 20, 60, 40, "+{0}% Increased Physical Damage"),
            new ItemAffix("flat_fire", AffixClassification.Prefix, "FlatFire", 10, 35, 22, "+{0} Fire Damage to Attacks"),
            new ItemAffix("flat_cold", AffixClassification.Prefix, "FlatCold", 8, 30, 18, "+{0} Cold Damage to Attacks"),
            new ItemAffix("flat_lightning", AffixClassification.Prefix, "FlatLightning", 5, 50, 25, "+{0} Lightning Damage to Attacks"),
            new ItemAffix("flat_life", AffixClassification.Prefix, "FlatLife", 30, 90, 60, "+{0} to Maximum Life"),
            new ItemAffix("flat_es", AffixClassification.Prefix, "FlatEs", 25, 80, 50, "+{0} to Maximum Energy Shield"),
            new ItemAffix("flat_armor", AffixClassification.Prefix, "Armor", 50, 200, 120, "+{0} to Armor"),

            // Suffixes (Resistances, Crit, Speeds, Attributes)
            new ItemAffix("fire_res", AffixClassification.Suffix, "FireRes", 15, 35, 25, "+{0}% to Fire Resistance"),
            new ItemAffix("cold_res", AffixClassification.Suffix, "ColdRes", 15, 35, 25, "+{0}% to Cold Resistance"),
            new ItemAffix("lightning_res", AffixClassification.Suffix, "LightningRes", 15, 35, 25, "+{0}% to Lightning Resistance"),
            new ItemAffix("chaos_res", AffixClassification.Suffix, "ChaosRes", 10, 25, 18, "+{0}% to Chaos Resistance"),
            new ItemAffix("attack_speed", AffixClassification.Suffix, "AttackSpeed", 8, 25, 15, "+{0}% Increased Attack Speed"),
            new ItemAffix("cast_speed", AffixClassification.Suffix, "CastSpeed", 8, 25, 15, "+{0}% Increased Cast Speed"),
            new ItemAffix("crit_chance", AffixClassification.Suffix, "CritChance", 15, 35, 25, "+{0}% Increased Critical Strike Chance"),
            new ItemAffix("crit_multi", AffixClassification.Suffix, "CritMulti", 15, 45, 30, "+{0}% to Global Critical Strike Multiplier"),
            new ItemAffix("all_attr", AffixClassification.Suffix, "AllAttributes", 5, 20, 12, "+{0} to All Attributes")
        };

        public static List<ItemAffix> GetAvailablePrefixes(IEnumerable<string> existingKeys)
        {
            var set = new HashSet<string>(existingKeys);
            return _allAffixes.Where(a => a.Classification == AffixClassification.Prefix && !set.Contains(a.Key)).ToList();
        }

        public static List<ItemAffix> GetAvailableSuffixes(IEnumerable<string> existingKeys)
        {
            var set = new HashSet<string>(existingKeys);
            return _allAffixes.Where(a => a.Classification == AffixClassification.Suffix && !set.Contains(a.Key)).ToList();
        }

        public static ItemAffix? GetAffixByKey(string key)
        {
            return _allAffixes.FirstOrDefault(a => a.Key.Equals(key, StringComparison.OrdinalIgnoreCase));
        }

        public static ItemAffix RollRandomAffix(AffixClassification classification, IEnumerable<string> existingKeys, Random rng)
        {
            var available = classification == AffixClassification.Prefix 
                ? GetAvailablePrefixes(existingKeys) 
                : GetAvailableSuffixes(existingKeys);

            if (available.Count == 0)
                throw new InvalidOperationException($"No available {classification} affixes left to roll.");

            var template = available[rng.Next(available.Count)];
            float rollFraction = (float)rng.NextDouble();
            return template.CloneWithRerolledValue(rollFraction);
        }
    }
}
