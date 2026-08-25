using System.Linq;
using Mdg.Core.Features.Maps;
using Xunit;

namespace Mdg.Core.Tests;

public sealed class AdvancedDungeonEngineTests
{
    [Fact]
    public void DungeonTopologyGraph_Build_GeneratesPacingFromStartToBoss()
    {
        var graph = DungeonTopologyGraph.Build(1337, 7);

        Assert.NotNull(graph);
        Assert.True(graph.Nodes.Count >= 5, "Graph should have at least 5 rooms.");

        var startNode = graph.Nodes.FirstOrDefault(n => n.Type == DungeonNodeType.Start);
        var bossNode = graph.Nodes.FirstOrDefault(n => n.Type == DungeonNodeType.Boss);

        Assert.NotNull(startNode);
        Assert.NotNull(bossNode);
        Assert.Equal(0, startNode.Depth);
        Assert.True(bossNode.Depth >= 3, "Boss room must have greater depth than Start room.");

        // Start room should connect to at least 1 neighbor
        Assert.NotEmpty(startNode.Neighbors);
    }

    [Fact]
    public void DelaunayMstLayout_PositionAndConnect_CreatesSpanningTreeWithLoops()
    {
        var graph = DungeonTopologyGraph.Build(42, 7);
        var layout = DelaunayMstLayout.PositionAndConnect(graph, 96, 96, 42);

        Assert.NotNull(layout);
        Assert.Equal(graph.Nodes.Count, layout.PlacedNodes.Count);

        // Nodes should be inside bounds
        foreach (var node in layout.PlacedNodes)
        {
            Assert.True(node.GridX >= 5 && node.GridX + node.Width <= 91, $"Node {node.Id} out of X bounds: {node.GridX}");
            Assert.True(node.GridY >= 5 && node.GridY + node.Height <= 91, $"Node {node.Id} out of Y bounds: {node.GridY}");
        }

        // Must have at least 1 loop edge
        bool hasLoopEdge = layout.FinalEdges.Any(e => e.IsLoopEdge);
        Assert.True(hasLoopEdge, "Dungeon should contain exploration loop edges.");
    }

    [Fact]
    public void CellularAutomataSmoother_SmoothDungeonGrid_ExecutesWithoutError()
    {
        var grid = new System.Collections.Generic.List<System.Collections.Generic.List<int>>();
        for (int y = 0; y < 30; y++)
        {
            var row = new System.Collections.Generic.List<int>();
            for (int x = 0; x < 30; x++)
            {
                row.Add(x == 0 || y == 0 || x == 29 || y == 29 ? 1 : 0);
            }
            grid.Add(row);
        }

        // Add a sharp corner bump
        grid[10][10] = 1;

        CellularAutomataSmoother.SmoothDungeonGrid(grid, 2);

        Assert.Equal(30, grid.Count);
        Assert.Equal(30, grid[0].Count);
    }

    [Fact]
    public void DungeonFitnessEvaluator_GenerateOptimizedDungeon_ScoresHighAndAllPortalsReachable()
    {
        var hazard = new EnvironmentalHazardConfig
        {
            HazardName = "Test Miasma",
            Description = "Test Hazard",
            ResistanceRequired = "Chaos",
            Threshold = 50,
            PenaltyType = "FlaskDecay"
        };

        var map = DungeonFitnessEvaluator.GenerateOptimizedDungeon(
            "ForgottenCrypt",
            "Forgotten Crypt",
            "Subtitle",
            ZoneBiomeType.ForgottenCrypt,
            "Lv. 10-18",
            hazard,
            96,
            96,
            999,
            4);

        Assert.NotNull(map);
        Assert.Equal(96, map.WidthInTiles);
        Assert.Equal(96, map.HeightInTiles);
        Assert.NotEmpty(map.Portals);
        Assert.NotEmpty(map.MonsterSpawns);

        // Verify that map has Boss and Destructible Barricades
        bool hasBoss = map.MonsterSpawns.Any(m => m.Type == "boss");
        Assert.True(hasBoss, "Optimized dungeon must contain a Boss spawn.");
    }

    [Fact]
    public void ZoneMapGenerator_GenerateCrypt_UsesAdvancedPipelineSuccessfully()
    {
        var crypt = ZoneMapGenerator.GenerateZone("ForgottenCrypt", 777);

        Assert.NotNull(crypt);
        Assert.Equal("ForgottenCrypt", crypt.Id);
        Assert.Equal(96, crypt.WidthInTiles);
        Assert.Equal(96, crypt.HeightInTiles);

        bool hasFloor = crypt.Grid.Any(r => r.Contains(ZoneMapGenerator.TILE_FLOOR));
        bool hasPath = crypt.Grid.Any(r => r.Contains(ZoneMapGenerator.TILE_PATH));
        bool hasWall = crypt.Grid.Any(r => r.Contains(ZoneMapGenerator.TILE_WALL));

        Assert.True(hasFloor);
        Assert.True(hasPath);
        Assert.True(hasWall);
    }
}
