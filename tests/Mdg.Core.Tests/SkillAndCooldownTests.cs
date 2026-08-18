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
    }
}
