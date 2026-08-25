using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Maps;

/// <summary>
/// Verifies that all portals, critical POIs and spawn points are 100% interconnected and reachable.
/// Employs Flood-Fill (BFS) with automatic dynamic bridge/path carving to prevent trapped layouts.
/// </summary>
public static class MapConnectivityValidator
{
    private static readonly int[] Dx = [0, 0, 1, -1];
    private static readonly int[] Dy = [1, -1, 0, 0];

    public static bool IsTileWalkable(int tileType)
    {
        return tileType switch
        {
            ZoneMapGenerator.TILE_WALL => false,
            ZoneMapGenerator.TILE_WATER_DEEP => false,
            ZoneMapGenerator.TILE_ANCIENT_PILLAR => false,
            ZoneMapGenerator.TILE_CHASM => false,
            ZoneMapGenerator.TILE_DESTRUCTIBLE_WALL => false,
            _ => true
        };
    }

    public static void EnsureAllPortalsReachable(
        List<List<int>> grid,
        int spawnTileX,
        int spawnTileY,
        List<ZonePortalDto> portals,
        int tileSize = 48)
    {
        int h = grid.Count;
        if (h == 0) return;
        int w = grid[0].Count;
        if (w == 0) return;

        spawnTileX = Math.Clamp(spawnTileX, 1, w - 2);
        spawnTileY = Math.Clamp(spawnTileY, 1, h - 2);

        // Ensure spawn tile itself is walkable
        if (!IsTileWalkable(grid[spawnTileY][spawnTileX]))
        {
            grid[spawnTileY][spawnTileX] = ZoneMapGenerator.TILE_FLOOR;
        }

        var visited = new bool[h, w];
        var queue = new Queue<(int x, int y)>();

        visited[spawnTileY, spawnTileX] = true;
        queue.Enqueue((spawnTileX, spawnTileY));

        while (queue.Count > 0)
        {
            var (cx, cy) = queue.Dequeue();

            for (int i = 0; i < 4; i++)
            {
                int nx = cx + Dx[i];
                int ny = cy + Dy[i];

                if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny, nx])
                {
                    if (IsTileWalkable(grid[ny][nx]))
                    {
                        visited[ny, nx] = true;
                        queue.Enqueue((nx, ny));
                    }
                }
            }
        }

        // Check each portal
        foreach (var portal in portals)
        {
            int ptx = Math.Clamp((int)Math.Round(portal.X / tileSize), 1, w - 2);
            int pty = Math.Clamp((int)Math.Round(portal.Y / tileSize), 1, h - 2);

            // Make portal spot walkable
            grid[pty][ptx] = ZoneMapGenerator.TILE_PATH;

            if (!visited[pty, ptx])
            {
                // Carve a guaranteed path from spawn to this portal
                CarveSafePath(grid, spawnTileX, spawnTileY, ptx, pty);

                // Re-run flood fill from portal
                visited[pty, ptx] = true;
                queue.Enqueue((ptx, pty));
                while (queue.Count > 0)
                {
                    var (cx, cy) = queue.Dequeue();
                    for (int i = 0; i < 4; i++)
                    {
                        int nx = cx + Dx[i];
                        int ny = cy + Dy[i];
                        if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny, nx])
                        {
                            if (IsTileWalkable(grid[ny][nx]))
                            {
                                visited[ny, nx] = true;
                                queue.Enqueue((nx, ny));
                            }
                        }
                    }
                }
            }
        }
    }

    private static void CarveSafePath(List<List<int>> grid, int x1, int y1, int x2, int y2)
    {
        int curX = x1;
        int curY = y1;

        while (curX != x2)
        {
            grid[curY][curX] = ZoneMapGenerator.TILE_PATH;
            curX += (x2 > curX) ? 1 : -1;
        }

        while (curY != y2)
        {
            grid[curY][curX] = ZoneMapGenerator.TILE_PATH;
            curY += (y2 > curY) ? 1 : -1;
        }

        grid[curY][curX] = ZoneMapGenerator.TILE_PATH;
    }
}
