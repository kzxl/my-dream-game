using System.Collections.Generic;

namespace Mdg.Core.Features.Maps;

/// <summary>
/// Pillar 3: Cellular Automata Smoothing Engine.
/// Polishes jagged 90-degree corners and corridor junctions into smooth, natural cave / ancient catacomb walls.
/// </summary>
public static class CellularAutomataSmoother
{
    public static void SmoothDungeonGrid(List<List<int>> grid, int passes = 2)
    {
        int h = grid.Count;
        if (h <= 4) return;
        int w = grid[0].Count;
        if (w <= 4) return;

        for (int p = 0; p < passes; p++)
        {
            var buffer = new int[h, w];
            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    buffer[y, x] = grid[y][x];
                }
            }

            for (int y = 2; y < h - 2; y++)
            {
                for (int x = 2; x < w - 2; x++)
                {
                    int currentTile = buffer[y, x];

                    // Preserve critical functional tiles (Portals, Hazards, Bushes, Barricades, Pillars)
                    if (currentTile == ZoneMapGenerator.TILE_ANCIENT_PILLAR ||
                        currentTile == ZoneMapGenerator.TILE_TOXIC_MIASMA ||
                        currentTile == ZoneMapGenerator.TILE_LAVA ||
                        currentTile == ZoneMapGenerator.TILE_DESTRUCTIBLE_WALL ||
                        currentTile == ZoneMapGenerator.TILE_CAMOUFLAGE_BUSH)
                    {
                        continue;
                    }

                    int wallNeighbors = CountSurroundingWalls(buffer, x, y, w, h);

                    if (currentTile == ZoneMapGenerator.TILE_WALL)
                    {
                        // Outer sharp corner: Surrounded mostly by open ground -> bevel it
                        if (wallNeighbors <= 2)
                        {
                            grid[y][x] = ZoneMapGenerator.TILE_FLOOR;
                        }
                    }
                    else if (currentTile == ZoneMapGenerator.TILE_FLOOR)
                    {
                        // Inner concave nook: Surrounded mostly by walls -> fill smoothly
                        if (wallNeighbors >= 6)
                        {
                            grid[y][x] = ZoneMapGenerator.TILE_WALL;
                        }
                    }
                }
            }
        }
    }

    private static int CountSurroundingWalls(int[,] grid, int cx, int cy, int w, int h)
    {
        int count = 0;
        for (int dy = -1; dy <= 1; dy++)
        {
            for (int dx = -1; dx <= 1; dx++)
            {
                if (dx == 0 && dy == 0) continue;
                int nx = cx + dx;
                int ny = cy + dy;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h)
                {
                    if (grid[ny, nx] == ZoneMapGenerator.TILE_WALL) count++;
                }
                else
                {
                    count++;
                }
            }
        }
        return count;
    }
}
