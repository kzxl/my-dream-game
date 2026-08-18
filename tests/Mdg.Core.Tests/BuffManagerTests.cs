using System;
using Mdg.Core.Features.Buffs;
using Mdg.Core.Features.Stats;
using Xunit;

namespace Mdg.Core.Tests
{
    public class BuffManagerTests
    {
        [Fact]
        public void ApplyBuff_ModifiesStats_AndExpiresAfterDuration()
        {
            var stats = new StatCollection();
            stats.SetBaseValue(StatType.MovementSpeed, 5.0f);

            var buffManager = new BuffManager(stats);
            var hasteBuff = new BuffDefinition("haste", "Haste Aura", BuffType.Buff, duration: 3.0f)
                .AddModifier(StatType.MovementSpeed, ModifierType.Increased, 50f);

            buffManager.ApplyBuff(hasteBuff);

            // Speed = 5 * (1 + 0.5) = 7.5
            Assert.Equal(7.5f, stats.GetValue(StatType.MovementSpeed));

            // Trôi qua 2s -> vẫn còn hiệu lực
            buffManager.Update(2.0f);
            Assert.Equal(7.5f, stats.GetValue(StatType.MovementSpeed));

            // Trôi qua thêm 1.1s -> Hết hiệu lực, stat trở về ban đầu
            buffManager.Update(1.1f);
            Assert.Equal(5.0f, stats.GetValue(StatType.MovementSpeed));
            Assert.Empty(buffManager.ActiveBuffs);
        }

        [Fact]
        public void Buff_PeriodicDamageTick_TriggersEvent()
        {
            var stats = new StatCollection();
            var buffManager = new BuffManager(stats);

            var poison = new BuffDefinition("poison", "Poison DoT", BuffType.Debuff, duration: 4.0f, maxStacks: 5, periodicTickInterval: 1.0f, periodicDamageAmount: 10f);

            float totalDamageTickReceived = 0f;
            buffManager.OnPeriodicTick += (instance, damage) =>
            {
                totalDamageTickReceived += damage;
            };

            buffManager.ApplyBuff(poison, stacks: 2); // 2 stacks = 20 damage/s

            buffManager.Update(1.0f); // Tick 1: 20
            buffManager.Update(1.0f); // Tick 2: 20

            Assert.Equal(40f, totalDamageTickReceived);
        }
    }
}
