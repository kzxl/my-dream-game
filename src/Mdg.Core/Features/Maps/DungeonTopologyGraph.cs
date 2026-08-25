using System;
using System.Collections.Generic;
using System.Linq;

namespace Mdg.Core.Features.Maps;

public enum DungeonNodeType
{
    Start,
    Combat,
    Elite,
    Treasure,
    Shop,
    Boss,
    Secret
}

public sealed class DungeonNode
{
    public int Id { get; set; }
    public DungeonNodeType Type { get; set; }
    public int GridX { get; set; }
    public int GridY { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public int Depth { get; set; }
    public List<int> Neighbors { get; set; } = new();
}

public sealed class DungeonEdge
{
    public int FromId { get; set; }
    public int ToId { get; set; }
    public bool IsMainPath { get; set; }
    public bool IsLoopEdge { get; set; }

    public DungeonEdge(int from, int to, bool isMain = true, bool isLoop = false)
    {
        FromId = Math.Min(from, to);
        ToId = Math.Max(from, to);
        IsMainPath = isMain;
        IsLoopEdge = isLoop;
    }

    public override bool Equals(object? obj) =>
        obj is DungeonEdge other && FromId == other.FromId && ToId == other.ToId;

    public override int GetHashCode() => HashCode.Combine(FromId, ToId);
}

/// <summary>
/// Pillar 1: Topology-First Graph Generator.
/// Decouples game pacing, quest progression, and room intent from raw spatial coordinates.
/// </summary>
public sealed class DungeonTopologyGraph
{
    public List<DungeonNode> Nodes { get; } = new();
    public HashSet<DungeonEdge> Edges { get; } = new();

    public static DungeonTopologyGraph Build(int seed, int targetRooms = 7)
    {
        var graph = new DungeonTopologyGraph();
        var rng = new Random(seed);

        targetRooms = Math.Clamp(targetRooms, 5, 12);

        // 1. Root Start Room (Depth 0)
        var startNode = new DungeonNode
        {
            Id = 0,
            Type = DungeonNodeType.Start,
            Depth = 0,
            Width = 14,
            Height = 14
        };
        graph.Nodes.Add(startNode);

        // 2. Main Spine: Start -> Combat1 -> Combat2 -> ... -> Elite -> Boss
        int spineLength = Math.Max(3, targetRooms - 2);
        int prevId = 0;

        for (int i = 1; i < spineLength - 1; i++)
        {
            var combatNode = new DungeonNode
            {
                Id = i,
                Type = DungeonNodeType.Combat,
                Depth = i,
                Width = rng.Next(14, 20),
                Height = rng.Next(14, 20)
            };
            graph.Nodes.Add(combatNode);
            graph.AddEdge(prevId, combatNode.Id, true);
            prevId = combatNode.Id;
        }

        // Elite Gatekeeper Room
        var eliteNode = new DungeonNode
        {
            Id = spineLength - 1,
            Type = DungeonNodeType.Elite,
            Depth = spineLength - 1,
            Width = 18,
            Height = 18
        };
        graph.Nodes.Add(eliteNode);
        graph.AddEdge(prevId, eliteNode.Id, true);
        prevId = eliteNode.Id;

        // Apex Boss Chamber (Depth MAX, Largest Room)
        var bossNode = new DungeonNode
        {
            Id = spineLength,
            Type = DungeonNodeType.Boss,
            Depth = spineLength,
            Width = 24,
            Height = 24
        };
        graph.Nodes.Add(bossNode);
        graph.AddEdge(prevId, bossNode.Id, true);

        // 3. Branching Side Rooms (Treasure, Shop, Secret)
        int currentId = spineLength + 1;
        int remaining = targetRooms - graph.Nodes.Count;

        if (remaining > 0)
        {
            // Treasure Room (attached to an early/mid spine room)
            int attachId = Math.Min(1, spineLength - 2);
            var treasureNode = new DungeonNode
            {
                Id = currentId++,
                Type = DungeonNodeType.Treasure,
                Depth = graph.Nodes[attachId].Depth + 1,
                Width = 12,
                Height = 12
            };
            graph.Nodes.Add(treasureNode);
            graph.AddEdge(attachId, treasureNode.Id, false);
            remaining--;
        }

        if (remaining > 0)
        {
            // Secret / Shrine Room (attached to mid/late spine room)
            int attachId = Math.Max(1, spineLength - 2);
            var secretNode = new DungeonNode
            {
                Id = currentId++,
                Type = DungeonNodeType.Secret,
                Depth = graph.Nodes[attachId].Depth + 1,
                Width = 12,
                Height = 12
            };
            graph.Nodes.Add(secretNode);
            graph.AddEdge(attachId, secretNode.Id, false);
        }

        return graph;
    }

    public void AddEdge(int from, int to, bool isMain = true, bool isLoop = false)
    {
        var edge = new DungeonEdge(from, to, isMain, isLoop);
        if (Edges.Add(edge))
        {
            var n1 = Nodes.FirstOrDefault(n => n.Id == from);
            var n2 = Nodes.FirstOrDefault(n => n.Id == to);
            if (n1 != null && !n1.Neighbors.Contains(to)) n1.Neighbors.Add(to);
            if (n2 != null && !n2.Neighbors.Contains(from)) n2.Neighbors.Add(from);
        }
    }
}
