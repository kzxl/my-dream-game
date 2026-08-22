using System;
using Mdg.Core.Features.Combat;
using Mdg.Core.Features.Stats;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class CombatResolutionTests
    {
        [Fact]
        public void ApplyResistance_OrderOfOperations_ComputesAccurately()
        {
            float baseDamage = 100f;
            float baseResist = 80f;          // Overcapped at 80%
            float exposure = 25f;            // Fire Exposure: -25%
            float curseReduction = 35f;      // Flammability: -35%
            float penetration = 20f;         // Fire Penetration: 20%

            // 1. Reduced resist = 80 - 25 - 35 = 20%
            // 2. Capped at [ -100%, 75% ] => 20%
            // 3. Effective resist = 20 - 20 = 0%
            // => Final Damage = 100 * (1 - 0/100) = 100
            float finalDmg = DamageCalculator.ApplyResistance(baseDamage, baseResist, exposure, curseReduction, penetration);
            Assert.Equal(100f, finalDmg);

            // Test âm kháng: Base 0%, Exposure 25%, Curse 35%, Pen 20%
            // Reduced = 0 - 25 - 35 = -60%
            // Capped at -60%
            // Effective = -60 - 20 = -80%
            // Final Damage = 100 * (1 - (-80/100)) = 180
            float negDmg = DamageCalculator.ApplyResistance(baseDamage, 0f, exposure, curseReduction, penetration);
            Assert.Equal(180f, negDmg);
        }

        [Fact]
        public void LeechEngine_EnforcesMaxLeechRateCap()
        {
            var leechEngine = new LeechEngine();
            float maxLife = 1000f;
            // 20% max life per second = 200 HP/sec max

            // Thêm đòn đánh gây Leech 600 HP trong 3s (200 HP/sec)
            leechEngine.AddInstance(600f, durationSeconds: 3.0f);

            // Tick 1 giây
            float healed1s = leechEngine.ProcessTick(maxLife, 1.0f);
            Assert.Equal(200f, healed1s);

            // Thêm một instance cực lớn 3000 HP (1000 HP/sec)
            leechEngine.AddInstance(3000f, durationSeconds: 3.0f);

            // Tick 1s tiếp theo: Tổng yêu cầu là 200 + 1000 = 1200 HP/sec, nhưng phải bị cap ở 200 HP/sec
            float cappedHealed = leechEngine.ProcessTick(maxLife, 1.0f);
            Assert.Equal(200f, cappedHealed);
        }

        [Fact]
        public void LeechEngine_StaticCalculateLeechTick_WorksCorrectly()
        {
            float maxLife = 500f; // 20% = 100 HP/sec
            float currentPool = 150f; // 150 HP over 3s = 50 HP/sec

            float tickHeal = LeechEngine.CalculateLeechTick(currentPool, maxLife, 0.5f);
            // 50 HP/s * 0.5s = 25 HP
            Assert.Equal(25f, tickHeal);
        }
    }
}
