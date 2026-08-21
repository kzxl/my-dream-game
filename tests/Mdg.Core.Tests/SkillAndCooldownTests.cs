using System;
using Mdg.Core.Common.Math;
using Mdg.Core.Features.Combat;
using Mdg.Core.Features.Skills;
using Xunit;

namespace Mdg.Core.Tests
{
    public class SkillAndCooldownTests
    {
        [Fact]
        public void CastSkill_ConsumesMana_AndTriggersCooldown()
        {
            var manager = new SkillManager();
            var fireball = new SkillDefinition("fireball", "Fireball", SkillTargetType.Direction, baseCooldown: 2.0f, manaCost: 15f);
            manager.AddSkill(fireball);

            float mana = 50f;
            var request = new SkillCastRequest("fireball", new FixVector2(10, 5));

            bool castSuccess = manager.ExecuteSkill(request, ref mana, out string? failureReason);

            Assert.True(castSuccess);
            Assert.Null(failureReason);
            Assert.Equal(35f, mana);

            // Thử cast lại ngay lập tức -> Phải thất bại vì cooldown
            bool secondCast = manager.ExecuteSkill(request, ref mana, out string? cdReason);
            Assert.False(secondCast);
            Assert.Contains("cooldown", cdReason);

            // Simulation trôi qua 2.0s
            manager.Update(2.0f);

            // Cast lại sau khi hết cooldown -> Thành công
            bool thirdCast = manager.ExecuteSkill(request, ref mana, out _);
            Assert.True(thirdCast);
            Assert.Equal(20f, mana);
        }

        [Fact]
        public void CastSkill_WithoutEnoughMana_Fails()
        {
            var manager = new SkillManager();
            var ultimate = new SkillDefinition("meteor", "Meteor", SkillTargetType.Point, baseCooldown: 10f, manaCost: 100f);
            manager.AddSkill(ultimate);

            float mana = 30f;
            var request = new SkillCastRequest("meteor", FixVector2.Zero);

            bool castSuccess = manager.ExecuteSkill(request, ref mana, out string? failureReason);

            Assert.False(castSuccess);
            Assert.Contains("Not enough mana", failureReason);
            Assert.Equal(30f, mana);
        }

        [Fact]
        public void SkillProficiency_CalculatesRankAndBonusesCorrectly_WhenHittingTargets()
        {
            // Initial state: Rank F
            var initial = SkillProficiencyEngine.CalculateState("slash", "Heavy Slash", 0);
            Assert.Equal(SkillProficiencyRank.RankF, initial.CurrentRank);
            Assert.Equal(0, initial.DamageBonusPercent);

            // Simulating hitting monsters: Gaining 2,500 exp (Rank D threshold is 2,000)
            var hardened = SkillProficiencyEngine.CalculateState("slash", "Heavy Slash", 2500);
            Assert.Equal(SkillProficiencyRank.RankD, hardened.CurrentRank);
            Assert.Equal(14.0, hardened.DamageBonusPercent);

            // Gaining 80,000 exp (Rank A threshold is 75,000 -> Awakening Eligible)
            var grandmaster = SkillProficiencyEngine.CalculateState("slash", "Heavy Slash", 80000);
            Assert.Equal(SkillProficiencyRank.RankA, grandmaster.CurrentRank);
            Assert.Equal(65.0, grandmaster.DamageBonusPercent);
            Assert.Equal(20.0, grandmaster.AreaBonusPercent);

            // Check Awakening eligibility
            bool canAwakenWithoutEssence = SkillProficiencyEngine.CanAwaken("slash", grandmaster.CurrentRank, hasEssence: false);
            Assert.False(canAwakenWithoutEssence);

            bool canAwakenWithEssence = SkillProficiencyEngine.CanAwaken("slash", grandmaster.CurrentRank, hasEssence: true);
            Assert.True(canAwakenWithEssence);
        }
    }
}
