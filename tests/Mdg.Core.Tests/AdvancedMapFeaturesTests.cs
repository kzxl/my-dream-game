using System.Collections.Generic;
using Mdg.Core.Features.Maps;
using Xunit;

namespace Mdg.Core.Tests;

public sealed class AdvancedMapFeaturesTests
{
    // 1. Fog of War & Exploration Matrix Tests
    [Fact]
    public void ZoneExplorationTracker_RevealAround_UpdatesExploredStatusAndPercentage()
    {
        var tracker = new ZoneExplorationTracker(64, 64, 48, false);

        Assert.Equal(0, tracker.ExploredTileCount);
        Assert.Equal(0.0, tracker.GetExplorationPercentage());

        // Player at (500, 500) with radius 5 tiles
        int revealed = tracker.RevealAround(500, 500, 5);

        Assert.True(revealed > 0, "Should reveal tiles within radius.");
        Assert.True(tracker.ExploredTileCount > 0);
        Assert.True(tracker.GetExplorationPercentage() > 0.0);

        int tx = (int)(500 / 48);
        int ty = (int)(500 / 48);
        Assert.True(tracker.IsTileExplored(tx, ty), "Center tile must be marked as explored.");
    }

    // 2. Lock & Key Mechanics Tests
    [Fact]
    public void DungeonKeyLockSystem_TryUnlockGate_UnlocksWithKeyAndConsumesIt()
    {
        var gate = new DungeonGate
        {
            Id = "Gate_Boss_Room",
            GateName = "Cổng Phong Ấn Boss",
            RequiredKey = DungeonKeyType.AncientBoneKey,
            IsLocked = true
        };

        var playerKeys = new HashSet<DungeonKeyType> { DungeonKeyType.AncientBoneKey };

        bool success = DungeonKeyLockSystem.TryUnlockGate(gate, playerKeys, out string msg);

        Assert.True(success);
        Assert.False(gate.IsLocked, "Gate should now be unlocked.");
        Assert.DoesNotContain(DungeonKeyType.AncientBoneKey, playerKeys);
    }

    [Fact]
    public void DungeonKeyLockSystem_TryUnlockGate_FailsWithoutRequiredKey()
    {
        var gate = new DungeonGate
        {
            Id = "Gate_Treasure",
            GateName = "Cổng Rương Báu",
            RequiredKey = DungeonKeyType.GoldenSanctumKey,
            IsLocked = true
        };

        var playerKeys = new HashSet<DungeonKeyType> { DungeonKeyType.AncientBoneKey };

        bool success = DungeonKeyLockSystem.TryUnlockGate(gate, playerKeys, out string msg);

        Assert.False(success);
        Assert.True(gate.IsLocked);
    }

    [Fact]
    public void DungeonKeyLockSystem_UnlockQuarantineGate_UnlocksOnlyWhenMonstersZero()
    {
        var gate = new DungeonGate
        {
            Id = "Gate_Quarantine",
            IsLocked = true,
            IsQuarantineEncounter = true
        };

        bool fail = DungeonKeyLockSystem.UnlockQuarantineGate(gate, 3, out string msgFail);
        Assert.False(fail);
        Assert.True(gate.IsLocked);

        bool success = DungeonKeyLockSystem.UnlockQuarantineGate(gate, 0, out string msgSuccess);
        Assert.True(success);
        Assert.False(gate.IsLocked);
    }

    // 3. Handcrafted Prefab Modules Tests
    [Fact]
    public void DungeonPrefabManager_StampBloodSacrificeAltar_PlacesPillarsAndPoi()
    {
        var grid = new List<List<int>>();
        for (int y = 0; y < 30; y++)
        {
            var row = new List<int>();
            for (int x = 0; x < 30; x++) row.Add(0);
            grid.Add(row);
        }

        var room = new DungeonNode { Id = 1, GridX = 5, GridY = 5, Width = 16, Height = 16 };
        var props = new List<ZonePropDto>();
        var pois = new List<ZonePoiDto>();

        DungeonPrefabManager.StampBloodSacrificeAltar(grid, room, props, pois, 48);

        Assert.NotEmpty(pois);
        Assert.Contains(pois, p => p.BuffType == "BloodFrenzy");
    }

    // 4. Dynamic World Events & Incursions Tests
    [Fact]
    public void WorldEventManager_CreateRedGateIncursion_GeneratesWavesAndAdvances()
    {
        var incursion = WorldEventManager.CreateRedGateIncursion(1000, 1000, 3);

        Assert.NotNull(incursion);
        Assert.True(incursion.IsActive);
        Assert.Equal(1, incursion.CurrentWave);

        var wave1Spawns = WorldEventManager.GenerateIncursionWaveSpawns(incursion);
        Assert.NotEmpty(wave1Spawns);

        // Advance to wave 2
        bool done = WorldEventManager.AdvanceWave(incursion, out string msg2);
        Assert.False(done);
        Assert.Equal(2, incursion.CurrentWave);

        // Advance to wave 3
        done = WorldEventManager.AdvanceWave(incursion, out string msg3);
        Assert.False(done);
        Assert.Equal(3, incursion.CurrentWave);

        // Complete final wave
        done = WorldEventManager.AdvanceWave(incursion, out string msgDone);
        Assert.True(done);
        Assert.True(incursion.IsCompleted);
        Assert.False(incursion.IsActive);
    }

    // 5. Spatial Chunk Partitioning Tests
    [Fact]
    public void SpatialChunkManager_GetActiveChunks_ReturnsChunksWithinRadius()
    {
        var chunkManager = new SpatialChunkManager(128, 128);

        Assert.Equal(4, chunkManager.ChunksWide);
        Assert.Equal(4, chunkManager.ChunksHigh);

        // Player in top-left chunk (coord 500, 500) with radius 1
        var activeChunks = chunkManager.GetActiveChunks(500, 500, 1);

        Assert.NotEmpty(activeChunks);
        Assert.True(activeChunks.Count <= 9, "Radius 1 should return at most 3x3=9 chunks.");
        Assert.Contains(activeChunks, c => c.ChunkX == 0 && c.ChunkY == 0);
    }
}
