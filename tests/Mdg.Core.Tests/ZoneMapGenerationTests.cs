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
        [InlineData("StormpeakRidge")]
        [InlineData("VoidAbyss")]
        public void GenerateZone_ValidZone_ReturnsExpandedStructuredMapDto(string zoneId)
        {
            var map = ZoneMapGenerator.GenerateZone(zoneId);

            Assert.NotNull(map);
            Assert.Equal(zoneId, map.Id);
            Assert.True(map.WidthInTiles >= 40, $"Expected width >= 40 for {zoneId}, got {map.WidthInTiles}");
            Assert.True(map.HeightInTiles >= 40, $"Expected height >= 40 for {zoneId}, got {map.HeightInTiles}");
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
        public void GenerateZone_StormpeakRidge_ContainsChasmsAndElectricGround()
        {
            var stormpeak = ZoneMapGenerator.GenerateZone("StormpeakRidge");

            bool hasChasms = stormpeak.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_CHASM));
            bool hasElectric = stormpeak.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_ELECTRIC_GROUND));
            bool hasPaths = stormpeak.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_PATH));

            Assert.True(hasChasms);
            Assert.True(hasElectric);
            Assert.True(hasPaths);
        }

        [Fact]
        public void GenerateZone_VoidAbyss_ContainsCosmicArenaAndPillars()
        {
            var abyss = ZoneMapGenerator.GenerateZone("VoidAbyss");

            bool hasChasms = abyss.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_CHASM));
            bool hasPillars = abyss.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_ANCIENT_PILLAR));
            bool hasPlaza = abyss.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_PLAZA));

            Assert.True(hasChasms);
            Assert.True(hasPillars);
            Assert.True(hasPlaza);
        }
    }
}
