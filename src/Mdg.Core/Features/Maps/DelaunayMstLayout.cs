using System;
using System.Collections.Generic;
using System.Linq;

namespace Mdg.Core.Features.Maps;

/// <summary>
/// Pillar 2: Spatial Embedding via Delaunay Triangulation + Minimum Spanning Tree (MST) + Exploration Loops.
/// Translates logical graph nodes into 2D spatial coordinates and derives an organic dungeon corridor network.
/// </summary>
public static class DelaunayMstLayout
{
    public sealed class LayoutResult
    {
        public List<DungeonNode> PlacedNodes { get; set; } = new();
        public List<DungeonEdge> FinalEdges { get; set; } = new();
    }

    public static LayoutResult PositionAndConnect(DungeonTopologyGraph graph, int mapWidth, int mapHeight, int seed)
    {
        var rng = new Random(seed);
        var nodes = graph.Nodes;
        int count = nodes.Count;

        // 1. Spatial Placement with Grid Jitter & Non-Overlap Relaxation
        int padding = 10;
        int usableW = mapWidth - 2 * padding;
        int usableH = mapHeight - 2 * padding;

        // Place Start at Top-Left, Boss at Bottom-Right, intermediate rooms distributed in-between
        for (int i = 0; i < count; i++)
        {
            var node = nodes[i];
            float t = count > 1 ? (float)node.Depth / (count - 1) : 0f;

            // Snake/Z-curve base layout with jitter
            float baseX = padding + t * (usableW - node.Width);
            float baseY = padding + t * (usableH - node.Height);

            // Add organic perpendicular oscillation based on node id
            float perp = (i % 2 == 1 ? 1 : -1) * (usableW * 0.22f);
            if (node.Type == DungeonNodeType.Start) perp = 0;
            if (node.Type == DungeonNodeType.Boss) perp = 0;

            int targetX = (int)Math.Clamp(baseX - perp * 0.5f + rng.Next(-6, 7), padding, mapWidth - padding - node.Width);
            int targetY = (int)Math.Clamp(baseY + perp * 0.5f + rng.Next(-6, 7), padding, mapHeight - padding - node.Height);

            node.GridX = targetX;
            node.GridY = targetY;
        }

        // Simple overlap relaxation pass
        for (int pass = 0; pass < 8; pass++)
        {
            for (int i = 0; i < count; i++)
            {
                for (int j = i + 1; j < count; j++)
                {
                    var n1 = nodes[i];
                    var n2 = nodes[j];

                    int minDistanceX = (n1.Width + n2.Width) / 2 + 4;
                    int minDistanceY = (n1.Height + n2.Height) / 2 + 4;

                    int c1x = n1.GridX + n1.Width / 2;
                    int c1y = n1.GridY + n1.Height / 2;
                    int c2x = n2.GridX + n2.Width / 2;
                    int c2y = n2.GridY + n2.Height / 2;

                    int dx = c2x - c1x;
                    int dy = c2y - c1y;

                    if (Math.Abs(dx) < minDistanceX && Math.Abs(dy) < minDistanceY)
                    {
                        int pushX = (minDistanceX - Math.Abs(dx)) / 2 + 1;
                        int pushY = (minDistanceY - Math.Abs(dy)) / 2 + 1;

                        if (dx >= 0) { n1.GridX -= pushX; n2.GridX += pushX; }
                        else { n1.GridX += pushX; n2.GridX -= pushX; }

                        if (dy >= 0) { n1.GridY -= pushY; n2.GridY += pushY; }
                        else { n1.GridY += pushY; n2.GridY -= pushY; }

                        n1.GridX = Math.Clamp(n1.GridX, padding, mapWidth - padding - n1.Width);
                        n1.GridY = Math.Clamp(n1.GridY, padding, mapHeight - padding - n1.Height);
                        n2.GridX = Math.Clamp(n2.GridX, padding, mapWidth - padding - n2.Width);
                        n2.GridY = Math.Clamp(n2.GridY, padding, mapHeight - padding - n2.Height);
                    }
                }
            }
        }

        // 2. Candidate Edges via Relative Proximity Graph (Pure C# Delaunay equivalent for N<=20)
        var allCandidateEdges = new List<(int from, int to, double dist)>();
        for (int i = 0; i < count; i++)
        {
            for (int j = i + 1; j < count; j++)
            {
                int c1x = nodes[i].GridX + nodes[i].Width / 2;
                int c1y = nodes[i].GridY + nodes[i].Height / 2;
                int c2x = nodes[j].GridX + nodes[j].Width / 2;
                int c2y = nodes[j].GridY + nodes[j].Height / 2;

                double dist = Math.Sqrt((c2x - c1x) * (c2x - c1x) + (c2y - c1y) * (c2y - c1y));
                allCandidateEdges.Add((nodes[i].Id, nodes[j].Id, dist));
            }
        }

        // 3. Minimum Spanning Tree (Kruskal's Algorithm)
        allCandidateEdges.Sort((a, b) => a.dist.CompareTo(b.dist));
        var parent = new int[count + 10];
        for (int i = 0; i < parent.Length; i++) parent[i] = i;

        int Find(int x) => parent[x] == x ? x : (parent[x] = Find(parent[x]));
        bool Union(int a, int b)
        {
            int rootA = Find(a);
            int rootB = Find(b);
            if (rootA == rootB) return false;
            parent[rootA] = rootB;
            return true;
        }

        var mstEdges = new HashSet<DungeonEdge>();
        var remainingEdges = new List<DungeonEdge>();

        // Incorporate Topology Graph intent first
        foreach (var graphEdge in graph.Edges)
        {
            if (Union(graphEdge.FromId, graphEdge.ToId))
            {
                mstEdges.Add(new DungeonEdge(graphEdge.FromId, graphEdge.ToId, true, false));
            }
        }

        foreach (var edge in allCandidateEdges)
        {
            if (Union(edge.from, edge.to))
            {
                mstEdges.Add(new DungeonEdge(edge.from, edge.to, true, false));
            }
            else
            {
                remainingEdges.Add(new DungeonEdge(edge.from, edge.to, false, true));
            }
        }

        // 4. Inject 20% Random Extra Loop Edges for rich exploration
        var finalEdges = new List<DungeonEdge>(mstEdges);
        int loopCount = Math.Max(1, (int)(mstEdges.Count * 0.25f));
        var shuffledRemaining = remainingEdges.OrderBy(_ => rng.Next()).Take(loopCount);

        foreach (var loopEdge in shuffledRemaining)
        {
            finalEdges.Add(loopEdge);
        }

        return new LayoutResult
        {
            PlacedNodes = nodes,
            FinalEdges = finalEdges
        };
    }
}
