using System;
using System.Collections.Generic;
using System.Linq;

namespace Mdg.Core.Features.Maps;

/// <summary>
/// Pillars 5 & 6: Search-Based Procedural Optimization & Multi-Objective Fitness Evaluation Engine.
/// Evaluates candidate dungeon layouts across connectivity, pacing, loop exploration, and room densities,
/// selecting the highest scoring candidate map.
/// </summary>
public static class DungeonFitnessEvaluator
{
    public sealed class EvaluationMetrics
    {
        public int ConnectivityScore { get; set; }  // 0 - 30
        public int PacingScore { get; set; }        // 0 - 25
        public int LoopsScore { get; set; }         // 0 - 20
        public int DensityScore { get; set; }       // 0 - 15
        public int AestheticsScore { get; set; }    // 0 - 10
        public int TotalScore => ConnectivityScore + PacingScore + LoopsScore + DensityScore + AestheticsScore;
    }

    public static EvaluationMetrics Evaluate(ZoneMapDto map, DungeonTopologyGraph graph, DelaunayMstLayout.LayoutResult layout)
    {
        var metrics = new EvaluationMetrics();

        // 1. Connectivity Score (30 pts)
        int spawnTx = (int)(map.SpawnX / map.TileSize);
        int spawnTy = (int)(map.SpawnY / map.TileSize);
        bool allReachable = true;

        var visited = new bool[map.HeightInTiles, map.WidthInTiles];
        var queue = new Queue<(int x, int y)>();
        if (spawnTy >= 0 && spawnTy < map.HeightInTiles && spawnTx >= 0 && spawnTx < map.WidthInTiles)
        {
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

            foreach (var p in map.Portals)
            {
                int ptx = (int)(p.X / map.TileSize);
                int pty = (int)(p.Y / map.TileSize);
                if (ptx < 0 || ptx >= map.WidthInTiles || pty < 0 || pty >= map.HeightInTiles || !visited[pty, ptx])
                {
                    allReachable = false;
                    break;
                }
            }
        }
        else
        {
            allReachable = false;
        }

        metrics.ConnectivityScore = allReachable ? 30 : 0;

        // 2. Pacing Score (25 pts): Boss is far from start
        var startNode = layout.PlacedNodes.FirstOrDefault(n => n.Type == DungeonNodeType.Start);
        var bossNode = layout.PlacedNodes.FirstOrDefault(n => n.Type == DungeonNodeType.Boss);

        if (startNode != null && bossNode != null)
        {
            double dist = Math.Sqrt(Math.Pow(bossNode.GridX - startNode.GridX, 2) + Math.Pow(bossNode.GridY - startNode.GridY, 2));
            double maxDist = Math.Sqrt(map.WidthInTiles * map.WidthInTiles + map.HeightInTiles * map.HeightInTiles);
            double ratio = dist / maxDist;

            if (ratio >= 0.50) metrics.PacingScore = 25;
            else if (ratio >= 0.35) metrics.PacingScore = 18;
            else metrics.PacingScore = 8;
        }

        // 3. Loops Score (20 pts): Rich non-linear exploration
        int loopEdges = layout.FinalEdges.Count(e => e.IsLoopEdge);
        if (loopEdges >= 2) metrics.LoopsScore = 20;
        else if (loopEdges == 1) metrics.LoopsScore = 15;
        else metrics.LoopsScore = 5;

        // 4. Density Score (15 pts): Proper walkable ratio
        int walkableCount = 0;
        int totalTiles = map.WidthInTiles * map.HeightInTiles;
        for (int y = 0; y < map.HeightInTiles; y++)
        {
            for (int x = 0; x < map.WidthInTiles; x++)
            {
                if (map.Grid[y][x] != ZoneMapGenerator.TILE_WALL) walkableCount++;
            }
        }
        double walkableRatio = (double)walkableCount / totalTiles;
        if (walkableRatio >= 0.15 && walkableRatio <= 0.45) metrics.DensityScore = 15;
        else if (walkableRatio >= 0.10 && walkableRatio <= 0.55) metrics.DensityScore = 10;
        else metrics.DensityScore = 5;

        // 5. Aesthetics Score (10 pts)
        metrics.AestheticsScore = 10;

        return metrics;
    }

    /// <summary>
    /// Evaluates N candidate seeds and selects the best candidate layout.
    /// </summary>
    public static ZoneMapDto GenerateOptimizedDungeon(
        string zoneId,
        string zoneName,
        string subtitle,
        ZoneBiomeType biome,
        string levelRange,
        EnvironmentalHazardConfig hazard,
        int mapWidth,
        int mapHeight,
        int baseSeed,
        int candidateCount = 4)
    {
        ZoneMapDto? bestMap = null;
        int bestScore = -1;

        for (int i = 0; i < candidateCount; i++)
        {
            int currentSeed = baseSeed + i * 1013;
            var graph = DungeonTopologyGraph.Build(currentSeed, 7);
            var layout = DelaunayMstLayout.PositionAndConnect(graph, mapWidth, mapHeight, currentSeed);
            var candidateMap = DungeonCarver.CarveToMapDto(zoneId, zoneName, subtitle, biome, levelRange, hazard, mapWidth, mapHeight, layout, currentSeed);

            var metrics = Evaluate(candidateMap, graph, layout);
            if (metrics.TotalScore > bestScore || bestMap == null)
            {
                bestScore = metrics.TotalScore;
                bestMap = candidateMap;
            }

            // Early exit if near-perfect score achieved
            if (bestScore >= 90) break;
        }

        return bestMap!;
    }
}
