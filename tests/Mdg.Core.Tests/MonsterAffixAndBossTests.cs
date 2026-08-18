using Mdg.Core.Features.Combat;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class MonsterAffixAndBossTests
    {
        [Fact]
        public void MonsterEntity_RarityScaling_IncreasesHpAndDamage()
        {
            var normal = new MonsterEntity("Skeleton Warrior", MonsterRarity.Normal, 100f, 20f);
            var rare = new MonsterEntity("Skeleton Warrior", MonsterRarity.Rare, 100f, 20f);

            Assert.Equal(100f, normal.MaxHealth);
            Assert.Equal(800f, rare.MaxHealth); // 8x scaling
            Assert.True(rare.BaseDamage > normal.BaseDamage);
        }

        [Fact]
        public void MonsterEntity_GargantuanAffix_IncreasesHealthAndReducesSpeed()
        {
            var rare = new MonsterEntity("Gargoyle", MonsterRarity.Rare, 100f, 20f, 100f);
            float baseHp = rare.MaxHealth;
            float baseSpeed = rare.MoveSpeed;

            rare.AddAffix(MonsterAffixType.Gargantuan);

            Assert.True(rare.MaxHealth > baseHp);
            Assert.True(rare.MoveSpeed < baseSpeed);
        }

        [Fact]
        public void MonsterEntity_AetherWardAffix_AbsorbsPortionOfIncomingDamage()
        {
            var rare = new MonsterEntity("Archmage", MonsterRarity.Rare, 100f, 20f);
            rare.AddAffix(MonsterAffixType.AetherWard);

            float initialHp = rare.CurrentHealth;
            float initialWard = rare.WardShield;

            rare.TakeDamage(100f);

            Assert.True(rare.WardShield < initialWard);
            Assert.True(rare.CurrentHealth < initialHp);
        }

        [Fact]
        public void BossStateMachine_TransitionsThrough3Phases()
        {
            var boss = new MonsterEntity("Ignis, The Molten Archon", MonsterRarity.PinnacleBoss, 1000f, 50f);
            var fsm = new BossStateMachine(boss);

            Assert.Equal(BossPhase.Phase1, fsm.CurrentPhase);
            Assert.False(fsm.IsEnraged);

            // Deal damage down to 60% HP
            fsm.ProcessIncomingDamage(boss.MaxHealth * 0.40f);
            Assert.Equal(BossPhase.Phase2, fsm.CurrentPhase);
            Assert.True(fsm.IsInvulnerable);

            // Break shield
            fsm.BreakPhase2Shield();
            Assert.False(fsm.IsInvulnerable);

            // Deal damage down to 20% HP
            fsm.ProcessIncomingDamage(boss.MaxHealth * 0.45f);
            Assert.Equal(BossPhase.Phase3, fsm.CurrentPhase);
            Assert.True(fsm.IsEnraged);
            Assert.Equal(1.4f, fsm.AttackSpeedMultiplier);
        }
    }
}
