using Mdg.Core.Features.Progression;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class MonsterLoreMasteryTests
    {
        [Theory]
        [InlineData(0, MonsterLoreTier.None)]
        [InlineData(10, MonsterLoreTier.Novice)]
        [InlineData(50, MonsterLoreTier.Adept)]
        [InlineData(150, MonsterLoreTier.Master)]
        [InlineData(500, MonsterLoreTier.Apex)]
        public void CalculateTier_NormalMonster_ReturnsCorrectTier(int killCount, MonsterLoreTier expectedTier)
        {
            var tier = MonsterLoreMastery.CalculateTier(killCount, isBoss: false);
            Assert.Equal(expectedTier, tier);
        }

        [Theory]
        [InlineData(1, MonsterLoreTier.None)]
        [InlineData(2, MonsterLoreTier.Novice)]
        [InlineData(6, MonsterLoreTier.Adept)]
        [InlineData(12, MonsterLoreTier.Master)]
        [InlineData(25, MonsterLoreTier.Apex)]
        public void CalculateTier_BossMonster_ScalesWithLowerThresholds(int killCount, MonsterLoreTier expectedTier)
        {
            var tier = MonsterLoreMastery.CalculateTier(killCount, isBoss: true);
            Assert.Equal(expectedTier, tier);
        }

        [Fact]
        public void ApplyDamageBonus_ApexTier_IncreasesDamageBy30Percent()
        {
            float baseDamage = 100f;
            float amplified = MonsterLoreMastery.ApplyDamageBonus(baseDamage, killCount: 550, isBoss: false);

            Assert.Equal(130f, amplified);
        }

        [Fact]
        public void ApplyCritBonus_MasterTier_IncreasesCritChanceAndMultiplier()
        {
            float baseCrit = 20f;
            float baseMulti = 150f;

            var (effectiveCrit, effectiveMulti) = MonsterLoreMastery.ApplyCritBonus(baseCrit, baseMulti, killCount: 160, isBoss: false);

            Assert.Equal(30f, effectiveCrit); // 20 + 10 = 30%
            Assert.Equal(175f, effectiveMulti); // 150 + 25 = 175%
        }
    }
}
