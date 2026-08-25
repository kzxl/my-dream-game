using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Maps;

public sealed class FlowFieldResult
{
    public int Width { get; set; }
    public int Height { get; set; }
    public int TargetTileX { get; set; }
    public int TargetTileY { get; set; }
    public int[,] IntegrationField { get; set; } = new int[0, 0];
    public float[,] VectorFieldX { get; set; } = new float[0, 0];
    public float[,] VectorFieldY { get; set; } = new float[0, 0];
}

/// <summary>
/// High-Performance Swarm Flow Field (Dijkstra + Vector Field) Pathfinding Engine.
/// Allows 100+ monsters to swarm the player with O(1) per-entity lookup cost and smooth obstacle avoidance.
/// </summary>
public static class FlowFieldPathfinder
{
    private const int UNREACHABLE = 999999;
    private static readonly int[] Dx = [0, 0, 1, -1, 1, -1, 1, -1];
    private static readonly int[] Dy = [1, -1, 0, 0, 1, 1, -1, -1];
    private static readonly int[] Cost = [10, 10, 10, 10, 14, 14, 14, 14]; // 10 for cardinal, 14 for diagonal (approx sqrt(2)*10)

    public static FlowFieldResult GenerateFlowField(List<List<int>> grid, int targetTx, int targetTy)
    {
        int h = grid.Count;
        int w = h > 0 ? grid[0].Count : 0;

        var result = new FlowFieldResult
        {
            Width = w,
            Height = h,
            TargetTileX = targetTx,
            TargetTileY = targetTy,
            IntegrationField = new int[h, w],
            VectorFieldX = new float[h, w],
            VectorFieldY = new float[h, w]
        };

        if (w == 0 || h == 0) return result;

        targetTx = Math.Clamp(targetTx, 0, w - 1);
        targetTy = Math.Clamp(targetTy, 0, h - 1);

        // 1. Initialize Integration Field
        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                result.IntegrationField[y, x] = UNREACHABLE;
            }
        }

        // 2. BFS Dijkstra from Target
        var queue = new Queue<(int x, int y)>();
        result.IntegrationField[targetTy, targetTx] = 0;
        queue.Enqueue((targetTx, targetTy));

        while (queue.Count > 0)
        {
            var (cx, cy) = queue.Dequeue();
            int currentDist = result.IntegrationField[cy, cx];

            for (int i = 0; i < 8; i++)
            {
                int nx = cx + Dx[i];
                int ny = cy + Dy[i];

                if (nx >= 0 && nx < w && ny >= 0 && ny < h)
                {
                    if (MapConnectivityValidator.IsTileWalkable(grid[ny][nx]))
                    {
                        int newDist = currentDist + Cost[i];
                        if (newDist < result.IntegrationField[ny, nx])
                        {
                            result.IntegrationField[ny, nx] = newDist;
                            queue.Enqueue((nx, ny));
                        }
                    }
                }
            }
        }

        // 3. Compute Gradient Vector Field
        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                if (x == targetTx && y == targetTy)
                {
                    result.VectorFieldX[y, x] = 0f;
                    result.VectorFieldY[y, x] = 0f;
                    continue;
                }

                if (!MapConnectivityValidator.IsTileWalkable(grid[y][x]) || result.IntegrationField[y, x] == UNREACHABLE)
                {
                    result.VectorFieldX[y, x] = 0f;
                    result.VectorFieldY[y, x] = 0f;
                    continue;
                }

                int lowestCost = result.IntegrationField[y, x];
                int bestNx = x;
                int bestNy = y;

                for (int i = 0; i < 8; i++)
                {
                    int nx = x + Dx[i];
                    int ny = y + Dy[i];

                    if (nx >= 0 && nx < w && ny >= 0 && ny < h)
                    {
                        if (result.IntegrationField[ny, nx] < lowestCost)
                        {
                            lowestCost = result.IntegrationField[ny, nx];
                            bestNx = nx;
                            bestNy = ny;
                        }
                    }
                }

                float vx = bestNx - x;
                float vy = bestNy - y;
                float len = MathF.Sqrt(vx * vx + vy * vy);

                if (len > 0.001f)
                {
                    result.VectorFieldX[y, x] = vx / len;
                    result.VectorFieldY[y, x] = vy / len;
                }
            }
        }

        return result;
    }

    public static (float DirX, float DirY) GetSteeringVector(FlowFieldResult field, double worldX, double worldY, int tileSize = 48)
    {
        int tx = (int)Math.Floor(worldX / tileSize);
        int ty = (int)Math.Floor(worldY / tileSize);

        if (tx < 0 || tx >= field.Width || ty < 0 || ty >= field.Height)
        {
            return (0f, 0f);
        }

        return (field.VectorFieldX[ty, tx], field.VectorFieldY[ty, tx]);
    }
}
