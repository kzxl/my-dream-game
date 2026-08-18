using Mdg.Core.Features.Progression;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class MonsterLoreMasteryTests
    {
        [Theory]
        [InlineData(0, MonsterLoreTier.None)]
        [InlineData(49, MonsterLoreTier.None)]
        [InlineData(50, MonsterLoreTier.Novice)]
        [InlineData(250, MonsterLoreTier.Adept)]
        [InlineData(1000, MonsterLoreTier.Master)]
        [InlineData(3000, MonsterLoreTier.Apex)]
        public void CalculateTier_NormalMonster_ReturnsCorrectTier(int killCount, MonsterLoreTier expectedTier)
        {
            var tier = MonsterLoreMastery.CalculateTier(killCount, isBoss: false);
            Assert.Equal(expectedTier, tier);
        }

        [Theory]
        [InlineData(4, MonsterLoreTier.None)]
        [InlineData(5, MonsterLoreTier.Novice)]
        [InlineData(20, MonsterLoreTier.Adept)]
        [InlineData(50, MonsterLoreTier.Master)]
        [InlineData(120, MonsterLoreTier.Apex)]
        public void CalculateTier_BossMonster_ScalesWithLowerThresholds(int killCount, MonsterLoreTier expectedTier)
        {
            var tier = MonsterLoreMastery.CalculateTier(killCount, isBoss: true);
            Assert.Equal(expectedTier, tier);
        }

        [Fact]
        public void ApplyDamageBonus_ApexTier_IncreasesDamageBy25Percent()
        {
            float baseDamage = 100f;
            float amplified = MonsterLoreMastery.ApplyDamageBonus(baseDamage, killCount: 3500, isBoss: false);

            Assert.Equal(125f, amplified);
        }

        [Fact]
        public void ApplyCritBonus_MasterTier_IncreasesCritChanceAndMultiplier()
        {
            float baseCrit = 20f;
            float baseMulti = 150f;

            var (effectiveCrit, effectiveMulti) = MonsterLoreMastery.ApplyCritBonus(baseCrit, baseMulti, killCount: 1200, isBoss: false);

            Assert.Equal(30f, effectiveCrit); // 20 + 10 = 30%
            Assert.Equal(175f, effectiveMulti); // 150 + 25 = 175%
        }
    }
}
