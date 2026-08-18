using System;
using Mdg.Core.Features.Combat;
using Mdg.Core.Features.Stats;
using Xunit;

namespace Mdg.Core.Tests
{
    public class DamageCalculatorTests
    {
        [Fact]
        public void CalculateHit_ArmorMitigation_ReducesPhysicalDamageCorrectly()
        {
            // Defender: Armor = 500
            // Attacker: Raw Physical Damage = 100
            // Mitigation = Armor / (Armor + 5 * Damage) = 500 / (500 + 500) = 50%
            // Damage Taken = 100 * (1 - 0.5) = 50

            var defenderStats = new StatCollection();
            defenderStats.SetBaseValue(StatType.Armor, 500f);
            defenderStats.SetBaseValue(StatType.Evasion, 0f);

            var payload = new DamagePayload { CanCrit = false, AccuracyRating = 99999f };
            payload.AddPortion(DamageType.Physical, 100f);

            float es = 0f;
            float life = 200f;

            var hit = DamageCalculator.CalculateHit(payload, defenderStats, ref es, ref life, new Random(42));

            Assert.True(hit.IsHit);
            Assert.Equal(50f, hit.TotalDamageDealt, precision: 2);
            Assert.Equal(150f, life, precision: 2);
        }

        [Fact]
        public void CalculateHit_ElementalResistanceAndPenetration_AppliedCorrectly()
        {
            // Defender: Fire Resist = 60%
            // Attacker: Fire Damage = 200, Fire Penetration = 20%
            // Effective Resist = 60 - 20 = 40%
            // Final Damage = 200 * (1 - 0.40) = 120

            var defenderStats = new StatCollection();
            defenderStats.SetBaseValue(StatType.FireResistance, 60f);

            var payload = new DamagePayload { CanCrit = false, AccuracyRating = 99999f };
            payload.AddPortion(DamageType.Fire, 200f);
            payload.SetPenetration(DamageType.Fire, 20f);

            float es = 0f;
            float life = 500f;

            var hit = DamageCalculator.CalculateHit(payload, defenderStats, ref es, ref life);

            Assert.Equal(120f, hit.TotalDamageDealt, precision: 2);
            Assert.Equal(380f, life, precision: 2);
        }

        [Fact]
        public void CalculateHit_EnergyShield_AbsorbsNonChaosDamageFirst()
        {
            var defenderStats = new StatCollection();

            var payload = new DamagePayload { CanCrit = false, AccuracyRating = 99999f };
            payload.AddPortion(DamageType.Cold, 150f);

            float es = 100f;
            float life = 200f;

            var hit = DamageCalculator.CalculateHit(payload, defenderStats, ref es, ref life);

            Assert.Equal(100f, hit.DamageTakenByEnergyShield, precision: 2);
            Assert.Equal(50f, hit.DamageTakenByLife, precision: 2);
            Assert.Equal(0f, es);
            Assert.Equal(150f, life);
        }

        [Fact]
        public void CalculateHit_ChaosDamage_BypassesEnergyShield()
        {
            var defenderStats = new StatCollection();

            var payload = new DamagePayload { CanCrit = false, AccuracyRating = 99999f };
            payload.AddPortion(DamageType.Chaos, 80f);

            float es = 100f;
            float life = 200f;

            var hit = DamageCalculator.CalculateHit(payload, defenderStats, ref es, ref life);

            Assert.Equal(0f, hit.DamageTakenByEnergyShield);
            Assert.Equal(80f, hit.DamageTakenByLife);
            Assert.Equal(100f, es); // ES remains intact
            Assert.Equal(120f, life);
        }
    }
}
