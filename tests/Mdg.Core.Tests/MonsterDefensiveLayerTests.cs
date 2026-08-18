using Mdg.Core.Features.Combat;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class MonsterDefensiveLayerTests
    {
        [Fact]
        public void MonsterDefensiveLayer_Evasion100Percent_DodgesAllDamage()
        {
            var monster = new MonsterEntity("Agile Rogue", MonsterRarity.Normal, 500f, 20f)
            {
                EvasionChance = 100f // Always dodges
            };

            var result = MonsterDefensiveLayer.ProcessIncomingHit(monster, rawPhys: 100f, rawFire: 50f, rawCold: 0f, rawLight: 0f, rawChaos: 0f);

            Assert.True(result.IsDodged);
            Assert.Equal(0f, result.FinalDamage);
            Assert.Equal("DODGED!", result.CombatMessage);
            Assert.Equal(500f, monster.CurrentHealth);
        }

        [Fact]
        public void MonsterDefensiveLayer_Block100Percent_ReducesDamageBy75Percent()
        {
            var monster = new MonsterEntity("Shield Knight", MonsterRarity.Normal, 1000f, 20f)
            {
                BlockChance = 100f, // Always blocks
                BlockMitigation = 75f
            };

            var result = MonsterDefensiveLayer.ProcessIncomingHit(monster, rawPhys: 100f, rawFire: 0f, rawCold: 0f, rawLight: 0f, rawChaos: 0f);

            Assert.True(result.IsBlocked);
            Assert.Equal("BLOCKED!", result.CombatMessage);
            Assert.Equal(25f, result.FinalDamage); // 100 * (1 - 75%) = 25
            Assert.Equal(975f, monster.CurrentHealth);
        }

        [Fact]
        public void MonsterDefensiveLayer_Resistances_MitigatesElementalDamage()
        {
            var monster = new MonsterEntity("Frost Golem", MonsterRarity.Normal, 1000f, 20f)
            {
                ColdResistance = 50f
            };

            var result = MonsterDefensiveLayer.ProcessIncomingHit(monster, rawPhys: 0f, rawFire: 0f, rawCold: 100f, rawLight: 0f, rawChaos: 0f);

            Assert.False(result.IsDodged);
            Assert.False(result.IsBlocked);
            Assert.Equal(50f, result.FinalDamage); // 100 * (1 - 50%) = 50
        }
    }
}
