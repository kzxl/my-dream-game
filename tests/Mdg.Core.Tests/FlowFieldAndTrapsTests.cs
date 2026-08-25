using System.Collections.Generic;
using Mdg.Core.Features.Maps;
using Xunit;

namespace Mdg.Core.Tests;

public sealed class FlowFieldAndTrapsTests
{
    [Fact]
    public void FlowFieldPathfinder_GenerateFlowField_CreatesVectorsPointingToTarget()
    {
        var grid = new List<List<int>>();
        for (int y = 0; y < 20; y++)
        {
            var row = new List<int>();
            for (int x = 0; x < 20; x++) row.Add(0); // Floor
            grid.Add(row);
        }

        // Target at center (10, 10)
        var flowField = FlowFieldPathfinder.GenerateFlowField(grid, 10, 10);

        Assert.NotNull(flowField);
        Assert.Equal(20, flowField.Width);
        Assert.Equal(20, flowField.Height);

        // A point to the left of the target (5, 10) should have VectorX > 0 (pointing right)
        var (dirX, dirY) = FlowFieldPathfinder.GetSteeringVector(flowField, 5 * 48, 10 * 48, 48);
        Assert.True(dirX > 0.5f, $"Expected positive dirX pointing towards target at X=10, got {dirX}");
    }

    [Fact]
    public void FlowFieldPathfinder_UnreachableWallTile_HasZeroVector()
    {
        var grid = new List<List<int>>();
        for (int y = 0; y < 10; y++)
        {
            var row = new List<int>();
            for (int x = 0; x < 10; x++) row.Add(0);
            grid.Add(row);
        }

        // Make tile (2, 2) a solid wall
        grid[2][2] = ZoneMapGenerator.TILE_WALL;

        var flowField = FlowFieldPathfinder.GenerateFlowField(grid, 8, 8);
        var (dirX, dirY) = FlowFieldPathfinder.GetSteeringVector(flowField, 2 * 48, 2 * 48, 48);

        Assert.Equal(0f, dirX);
        Assert.Equal(0f, dirY);
    }

    [Fact]
    public void DungeonTrapSystem_UpdateTraps_TogglesPrimedState()
    {
        var trap = new DungeonTrapEntity
        {
            Id = "Spike_1",
            Type = DungeonTrapType.SpikeTrap,
            TileX = 5,
            TileY = 5,
            IntervalSeconds = 2.0f,
            Timer = 0f,
            IsPrimed = false
        };

        var traps = new List<DungeonTrapEntity> { trap };

        // Update with 1.0s (not primed yet)
        DungeonTrapSystem.UpdateTraps(traps, 1.0f);
        Assert.False(trap.IsPrimed);

        // Update with another 1.1s (total 2.1s -> should toggle to primed)
        DungeonTrapSystem.UpdateTraps(traps, 1.1f);
        Assert.True(trap.IsPrimed);
    }

    [Fact]
    public void DungeonTrapSystem_CheckTrapTrigger_DealsDamageWhenInRadius()
    {
        var trap = new DungeonTrapEntity
        {
            Id = "Spike_1",
            Type = DungeonTrapType.SpikeTrap,
            TileX = 5,
            TileY = 5,
            Damage = 50,
            DamageType = "physical",
            TriggerRadius = 36f,
            IsPrimed = true
        };

        // Entity directly on top of trap
        var (triggered, damage, dmgType) = DungeonTrapSystem.CheckTrapTrigger(trap, trap.WorldX, trap.WorldY);
        Assert.True(triggered);
        Assert.Equal(50, damage);
        Assert.Equal("physical", dmgType);

        // Entity far away
        var (farTriggered, farDamage, _) = DungeonTrapSystem.CheckTrapTrigger(trap, trap.WorldX + 500, trap.WorldY + 500);
        Assert.False(farTriggered);
        Assert.Equal(0, farDamage);
    }
}
