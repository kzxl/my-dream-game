using System;
using Mdg.Core.Features.Stats;
using Xunit;

namespace Mdg.Core.Tests
{
    public class StatCollectionTests
    {
        [Fact]
        public void CalculateStat_WithPoeFormula_CalculatesCorrectValue()
        {
            // Base = 100
            // Flat = +20 (+20), Flat = +30 (+50 total flat -> Base + Flat = 150)
            // Increased = +40%, Reduced = -10% -> net +30% increased (1.3x)
            // More = 20% (1.2x), More = 10% (1.1x)
            // Expected = 150 * 1.30 * 1.20 * 1.10 = 257.4

            var stats = new StatCollection();
            stats.SetBaseValue(StatType.MaxLife, 100f);

            stats.AddModifier(StatModifier.Flat(StatType.MaxLife, 20f));
            stats.AddModifier(StatModifier.Flat(StatType.MaxLife, 30f));

            stats.AddModifier(StatModifier.Increased(StatType.MaxLife, 40f));
            stats.AddModifier(StatModifier.Increased(StatType.MaxLife, -10f)); // 10% reduced

            stats.AddModifier(StatModifier.More(StatType.MaxLife, 20f));
            stats.AddModifier(StatModifier.More(StatType.MaxLife, 10f));

            float finalLife = stats.GetValue(StatType.MaxLife);

            Assert.Equal(257.4f, finalLife, precision: 2);
        }

        [Fact]
        public void Resistance_CapsAt75PercentByDefault()
        {
            var stats = new StatCollection();
            stats.SetBaseValue(StatType.FireResistance, 0f);

            stats.AddModifier(StatModifier.Flat(StatType.FireResistance, 120f)); // Overcapped

            float fireRes = stats.GetValue(StatType.FireResistance);

            Assert.Equal(75f, fireRes);
        }

        [Fact]
        public void RemoveModifier_RecalculatesStatCorrectly()
        {
            var stats = new StatCollection();
            stats.SetBaseValue(StatType.Armor, 100f);

            var mod = StatModifier.Flat(StatType.Armor, 50f);
            stats.AddModifier(mod);
            Assert.Equal(150f, stats.GetValue(StatType.Armor));

            stats.RemoveModifier(mod);
            Assert.Equal(100f, stats.GetValue(StatType.Armor));
        }
    }
}
