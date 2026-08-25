using System.Collections.Generic;
using System.Linq;
using Mdg.Core.Features.Combat;
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
        public void GenerateZone_WhisperingPlains_ContainsCamouflageBushesAndDestructibleWalls()
        {
            var plains = ZoneMapGenerator.GenerateZone("WhisperingPlains", 1337);

            bool hasBushes = plains.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_CAMOUFLAGE_BUSH));
            bool hasDestructible = plains.Grid.Any(row => row.Contains(ZoneMapGenerator.TILE_DESTRUCTIBLE_WALL));

            Assert.True(hasBushes, "Whispering Plains should contain Camouflage Bushes (Tile 14)");
            Assert.True(hasDestructible, "Whispering Plains should contain Destructible Barricades (Tile 15)");
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

        [Fact]
        public void GenerateZone_DeterministicSeed_ReturnsIdenticalGrid()
        {
            const int seed = 998877;
            var map1 = ZoneMapGenerator.GenerateZone("WhisperingPlains", seed);
            var map2 = ZoneMapGenerator.GenerateZone("WhisperingPlains", seed);

            Assert.Equal(map1.Grid.Count, map2.Grid.Count);
            Assert.Equal(map1.Grid[0].Count, map2.Grid[0].Count);

            for (int y = 0; y < map1.Grid.Count; y++)
            {
                for (int x = 0; x < map1.Grid[0].Count; x++)
                {
                    Assert.Equal(map1.Grid[y][x], map2.Grid[y][x]);
                }
            }
        }

        [Fact]
        public void GenerateZone_DifferentSeeds_ProduceVariations()
        {
            var map1 = ZoneMapGenerator.GenerateZone("WhisperingPlains", 1111);
            var map2 = ZoneMapGenerator.GenerateZone("WhisperingPlains", 9999);

            bool hasDifference = false;
            for (int y = 0; y < map1.Grid.Count; y++)
            {
                for (int x = 0; x < map1.Grid[0].Count; x++)
                {
                    if (map1.Grid[y][x] != map2.Grid[y][x])
                    {
                        hasDifference = true;
                        break;
                    }
                }
                if (hasDifference) break;
            }

            Assert.True(hasDifference, "Different seeds should produce variations in procedural terrain.");
        }

        [Theory]
        [InlineData("SanctuaryHaven")]
        [InlineData("WhisperingPlains")]
        [InlineData("FrostpeakTundra")]
        [InlineData("MoltenCaldera")]
        [InlineData("ForgottenCrypt")]
        [InlineData("StormpeakRidge")]
        [InlineData("VoidAbyss")]
        public void GenerateZone_AllPortals_AreReachableFromSpawn(string zoneId)
        {
            var map = ZoneMapGenerator.GenerateZone(zoneId, 42);
            int spawnTx = (int)(map.SpawnX / ZoneMapGenerator.TILE_SIZE);
            int spawnTy = (int)(map.SpawnY / ZoneMapGenerator.TILE_SIZE);

            // BFS Flood Fill Reachability Verification
            var visited = new bool[map.HeightInTiles, map.WidthInTiles];
            var queue = new Queue<(int x, int y)>();

            visited[spawnTy, spawnTx] = true;
            queue.Enqueue((spawnTx, spawnTy));

            int[] dx = [0, 0, 1, -1];
            int[] dy = [1, -1, 0, 0];

            while (queue.Count > 0)
            {
                var (cx, cy) = queue.Dequeue();

                for (int i = 0; i < 4; i++)
                {
                    int nx = cx + dx[i];
                    int ny = cy + dy[i];

                    if (nx >= 0 && nx < map.WidthInTiles && ny >= 0 && ny < map.HeightInTiles && !visited[ny, nx])
                    {
                        if (MapConnectivityValidator.IsTileWalkable(map.Grid[ny][nx]))
                        {
                            visited[ny, nx] = true;
                            queue.Enqueue((nx, ny));
                        }
                    }
                }
            }

            foreach (var portal in map.Portals)
            {
                int ptx = (int)(portal.X / ZoneMapGenerator.TILE_SIZE);
                int pty = (int)(portal.Y / ZoneMapGenerator.TILE_SIZE);
                Assert.True(visited[pty, ptx], $"Portal '{portal.Name}' at ({ptx},{pty}) in {zoneId} must be reachable from spawn!");
            }
        }

        [Fact]
        public void SkillTerrainCollision_DestructibleWall_BlocksProjectiles()
        {
            Assert.True(SkillTerrainCollision.IsProjectileBlockedByTile(ZoneMapGenerator.TILE_WALL));
            Assert.True(SkillTerrainCollision.IsProjectileBlockedByTile(ZoneMapGenerator.TILE_ANCIENT_PILLAR));
            Assert.True(SkillTerrainCollision.IsProjectileBlockedByTile(ZoneMapGenerator.TILE_DESTRUCTIBLE_WALL));
            Assert.False(SkillTerrainCollision.IsProjectileBlockedByTile(ZoneMapGenerator.TILE_CAMOUFLAGE_BUSH));
            Assert.False(SkillTerrainCollision.IsProjectileBlockedByTile(ZoneMapGenerator.TILE_FLOOR));
        }
    }
}
