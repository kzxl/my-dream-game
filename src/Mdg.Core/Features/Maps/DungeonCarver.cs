using System;
using System.Collections.Generic;
using System.Linq;

namespace Mdg.Core.Features.Maps;

/// <summary>
/// Carves physical tiles, corridors, pillars, secret destructible barricades, and entities from a solved spatial layout.
/// </summary>
public static class DungeonCarver
{
    public static ZoneMapDto CarveToMapDto(
        string zoneId,
        string zoneName,
        string subtitle,
        ZoneBiomeType biome,
        string levelRange,
        EnvironmentalHazardConfig hazard,
        int mapWidth,
        int mapHeight,
        DelaunayMstLayout.LayoutResult layout,
        int seed)
    {
        const int tileSize = ZoneMapGenerator.TILE_SIZE;
        var grid = InitializeGrid(mapWidth, mapHeight, ZoneMapGenerator.TILE_WALL);
        var rng = new Random(seed);

        var nodes = layout.PlacedNodes;
        var edges = layout.FinalEdges;

        var portals = new List<ZonePortalDto>();
        var pois = new List<ZonePoiDto>();
        var monsterSpawns = new List<MonsterClusterSpawnDto>();
        var props = new List<ZonePropDto>();

        DungeonNode startNode = nodes.First(n => n.Type == DungeonNodeType.Start);
        DungeonNode bossNode = nodes.First(n => n.Type == DungeonNodeType.Boss);

        // 1. Carve Each Room
        foreach (var node in nodes)
        {
            for (int y = node.GridY; y < node.GridY + node.Height; y++)
            {
                for (int x = node.GridX; x < node.GridX + node.Width; x++)
                {
                    bool isCorner = (x == node.GridX && y == node.GridY) ||
                                    (x == node.GridX + node.Width - 1 && y == node.GridY) ||
                                    (x == node.GridX && y == node.GridY + node.Height - 1) ||
                                    (x == node.GridX + node.Width - 1 && y == node.GridY + node.Height - 1);
                    if (!isCorner)
                    {
                        grid[y][x] = ZoneMapGenerator.TILE_FLOOR;
                    }
                }
            }

            int cx = node.GridX + node.Width / 2;
            int cy = node.GridY + node.Height / 2;

            // Room-Specific Detailing (Pillars, Hazard pools, Chests)
            if (node.Width >= 16 && node.Height >= 16)
            {
                grid[node.GridY + 3][node.GridX + 3] = ZoneMapGenerator.TILE_ANCIENT_PILLAR;
                grid[node.GridY + 3][node.GridX + node.Width - 4] = ZoneMapGenerator.TILE_ANCIENT_PILLAR;
                grid[node.GridY + node.Height - 4][node.GridX + 3] = ZoneMapGenerator.TILE_ANCIENT_PILLAR;
                grid[node.GridY + node.Height - 4][node.GridX + node.Width - 4] = ZoneMapGenerator.TILE_ANCIENT_PILLAR;
            }

            if (node.Type == DungeonNodeType.Boss)
            {
                // Boss toxic hazard ring in center
                for (int dy = -1; dy <= 1; dy++)
                {
                    for (int dx = -1; dx <= 1; dx++)
                    {
                        if (rng.NextDouble() < 0.75) grid[cy + dy][cx + dx] = ZoneMapGenerator.TILE_TOXIC_MIASMA;
                    }
                }

                monsterSpawns.Add(new MonsterClusterSpawnDto
                {
                    X = cx * tileSize,
                    Y = cy * tileSize,
                    Count = 1,
                    Type = "boss"
                });

                portals.Add(new ZonePortalDto
                {
                    X = (node.GridX + node.Width - 2) * tileSize,
                    Y = cy * tileSize,
                    TargetZone = "VoidAbyss",
                    TargetX = 350,
                    TargetY = 2300,
                    Name = "🌌 To Void Abyss"
                });
            }
            else if (node.Type == DungeonNodeType.Start)
            {
                portals.Add(new ZonePortalDto
                {
                    X = (node.GridX + 2) * tileSize,
                    Y = cy * tileSize,
                    TargetZone = "SanctuaryHaven",
                    TargetX = 1536,
                    TargetY = 2800,
                    Name = "🌿 Back to Haven"
                });
            }
            else if (node.Type == DungeonNodeType.Treasure || node.Type == DungeonNodeType.Secret)
            {
                pois.Add(new ZonePoiDto
                {
                    Id = $"Crypt_Shrine_{node.Id}",
                    Type = "shrine",
                    Name = "☠️ Abyssal Soul Shrine",
                    Description = "Infuses weapons with 50 Chaos Damage and +20% Life Leech for 60s.",
                    X = cx * tileSize,
                    Y = cy * tileSize,
                    BuffType = "AbyssalLeech",
                    BuffDuration = 60,
                    Color = "#8e44ad",
                    Icon = "☠️"
                });
            }
            else if (node.Type == DungeonNodeType.Elite)
            {
                monsterSpawns.Add(new MonsterClusterSpawnDto
                {
                    X = cx * tileSize,
                    Y = cy * tileSize,
                    Count = 6,
                    Type = "undead_knight"
                });
            }
            else
            {
                monsterSpawns.Add(new MonsterClusterSpawnDto
                {
                    X = cx * tileSize,
                    Y = cy * tileSize,
                    Count = rng.Next(5, 8),
                    Type = rng.NextDouble() < 0.5 ? "skeleton" : "undead_knight"
                });
            }
        }

        // 2. Carve Corridors from Edges
        var nodeMap = nodes.ToDictionary(n => n.Id);
        foreach (var edge in edges)
        {
            var n1 = nodeMap[edge.FromId];
            var n2 = nodeMap[edge.ToId];

            int c1x = n1.GridX + n1.Width / 2;
            int c1y = n1.GridY + n1.Height / 2;
            int c2x = n2.GridX + n2.Width / 2;
            int c2y = n2.GridY + n2.Height / 2;

            CarveCorridor(grid, c1x, c1y, c2x, c2y);

            // If it's a secret branch, block entrance with a Destructible Wall (Tile 15)
            if (n1.Type == DungeonNodeType.Secret || n2.Type == DungeonNodeType.Secret ||
                n1.Type == DungeonNodeType.Treasure || n2.Type == DungeonNodeType.Treasure)
            {
                int midCorridorX = (c1x + c2x) / 2;
                int midCorridorY = (c1y + c2y) / 2;
                if (grid[midCorridorY][midCorridorX] == ZoneMapGenerator.TILE_PATH)
                {
                    grid[midCorridorY][midCorridorX] = ZoneMapGenerator.TILE_DESTRUCTIBLE_WALL;
                }
            }
        }

        // 3. Cellular Automata Smoothing
        CellularAutomataSmoother.SmoothDungeonGrid(grid, 2);

        int spawnX = (startNode.GridX + startNode.Width / 2) * tileSize;
        int spawnY = (startNode.GridY + startNode.Height / 2) * tileSize;

        return new ZoneMapDto
        {
            Id = zoneId,
            Name = zoneName,
            Subtitle = subtitle,
            Biome = biome,
            LevelRange = levelRange,
            Hazard = hazard,
            WidthInTiles = mapWidth,
            HeightInTiles = mapHeight,
            TileSize = tileSize,
            WorldWidth = mapWidth * tileSize,
            WorldHeight = mapHeight * tileSize,
            Grid = grid,
            SpawnX = spawnX,
            SpawnY = spawnY,
            Portals = portals,
            Pois = pois,
            MonsterSpawns = monsterSpawns,
            Props = props
        };
    }

    private static void CarveCorridor(List<List<int>> grid, int x1, int y1, int x2, int y2)
    {
        int curX = x1;
        int curY = y1;

        while (curX != x2)
        {
            grid[curY][curX] = ZoneMapGenerator.TILE_PATH;
            grid[curY + 1][curX] = ZoneMapGenerator.TILE_PATH;
            curX += (x2 > curX) ? 1 : -1;
        }

        while (curY != y2)
        {
            grid[curY][curX] = ZoneMapGenerator.TILE_PATH;
            grid[curY][curX + 1] = ZoneMapGenerator.TILE_PATH;
            curY += (y2 > curY) ? 1 : -1;
        }

        grid[curY][curX] = ZoneMapGenerator.TILE_PATH;
    }

    private static List<List<int>> InitializeGrid(int width, int height, int fillTile)
    {
        var grid = new List<List<int>>(height);
        for (int y = 0; y < height; y++)
        {
            var row = new List<int>(width);
            for (int x = 0; x < width; x++)
            {
                row.Add(fillTile);
            }
            grid.Add(row);
        }
        return grid;
    }
}
