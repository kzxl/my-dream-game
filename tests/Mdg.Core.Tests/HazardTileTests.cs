using Mdg.Core.Features.Combat;
using Mdg.Core.Features.Maps;
using Mdg.Core.Features.Stats;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class HazardTileTests
    {
        [Fact]
        public void HazardTileProcessor_LavaTile_AppliesFireDamageMitigatedByResistance()
        {
            var stats = new StatCollection();
            stats.SetBaseValue(StatType.FireResistance, 50f);

            var result = HazardTileProcessor.ProcessTileHazard(ZoneMapGenerator.TILE_LAVA, stats, 1.0f);

            Assert.True(result.IsHazardous);
            Assert.Equal(DamageType.Fire, result.DamageType);
            Assert.Equal(40f, result.RawDamage);
            Assert.Equal(20f, result.MitigatedDamage); // 40 * (1 - 50%) = 20
        }

        [Fact]
        public void HazardTileProcessor_ToxicTile_AppliesChaosDamageMitigatedByChaosRes()
        {
            var stats = new StatCollection();
            stats.SetBaseValue(StatType.ChaosResistance, 0f);

            var result = HazardTileProcessor.ProcessTileHazard(ZoneMapGenerator.TILE_TOXIC_MIASMA, stats, 1.0f);

            Assert.True(result.IsHazardous);
            Assert.Equal(DamageType.Chaos, result.DamageType);
            Assert.Equal(30f, result.MitigatedDamage); // 30 * (1 - 0%) = 30
        }

        [Fact]
        public void HazardTileProcessor_GlacialTile_AppliesColdDamageAndSlow()
        {
            var stats = new StatCollection();
            stats.SetBaseValue(StatType.ColdResistance, 75f);

            var result = HazardTileProcessor.ProcessTileHazard(ZoneMapGenerator.TILE_GLACIAL_ICE, stats, 1.0f);

            Assert.True(result.IsHazardous);
            Assert.Equal(DamageType.Cold, result.DamageType);
            Assert.Equal(5f, result.MitigatedDamage); // 20 * (1 - 75%) = 5
            Assert.Equal(50f, result.SlowPercentage);
        }

        [Fact]
        public void HazardTileProcessor_SafeFloorTile_IsNotHazardous()
        {
            var stats = new StatCollection();
            var result = HazardTileProcessor.ProcessTileHazard(ZoneMapGenerator.TILE_FLOOR, stats);

            Assert.False(result.IsHazardous);
            Assert.Equal(0f, result.MitigatedDamage);
        }
    }
}
