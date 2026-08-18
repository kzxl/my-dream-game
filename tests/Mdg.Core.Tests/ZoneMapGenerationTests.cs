using System.Linq;
using Mdg.Core.Features.Maps;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class ZoneMapGenerationTests
    {
        [Theory]
        [InlineData("SanctuaryHaven")]
        [InlineData("WhisperingPlains")]
        [InlineData("FrostpeakTundra")]
        [InlineData("MoltenCaldera")]
        [InlineData("ForgottenCrypt")]
        public void GenerateZone_ValidZone_ReturnsStructuredMapDto(string zoneId)
        {
            var map = ZoneMapGenerator.GenerateZone(zoneId);

            Assert.NotNull(map);
            Assert.Equal(zoneId, map.Id);
            Assert.True(map.WidthInTiles >= 28);
            Assert.True(map.HeightInTiles >= 28);
            Assert.NotNull(map.Grid);
            Assert.Equal(map.HeightInTiles, map.Grid.Count);
            Assert.Equal(map.WidthInTiles, map.Grid[0].Count);
            Assert.True(map.SpawnX > 0);
            Assert.True(map.SpawnY > 0);
        }

        [Fact]
        public void GenerateZone_WhisperingPlains_ContainsRiverSandbarsAndBridges()
        {
            var plains = ZoneMapGenerator.GenerateZone("WhisperingPlains");

            bool hasDeepWater = plains.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_WATER_DEEP));
            bool hasSandbars = plains.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_SHALLOW_WATER_SAND));
            bool hasPaths = plains.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_PATH));

            Assert.True(hasDeepWater);
            Assert.True(hasSandbars);
            Assert.True(hasPaths);
        }

        [Fact]
        public void GenerateZone_MoltenCaldera_ContainsLavaAndBurntGround()
        {
            var caldera = ZoneMapGenerator.GenerateZone("MoltenCaldera");

            bool hasLava = caldera.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_LAVA));
            bool hasBurntGround = caldera.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_BURNT_GROUND));
            bool hasPillars = caldera.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_ANCIENT_PILLAR));

            Assert.True(hasLava);
            Assert.True(hasBurntGround);
            Assert.True(hasPillars);
        }

        [Fact]
        public void GenerateZone_ForgottenCrypt_ContainsPillarsAndToxicMiasma()
        {
            var crypt = ZoneMapGenerator.GenerateZone("ForgottenCrypt");

            bool hasPillars = crypt.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_ANCIENT_PILLAR));
            bool hasToxic = crypt.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_TOXIC_MIASMA));

            Assert.True(hasPillars);
            Assert.True(hasToxic);
        }
    }
}
