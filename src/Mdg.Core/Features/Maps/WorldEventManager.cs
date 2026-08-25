using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Maps;

public enum WorldEventType
{
    RedGateIncursion,
    AetherStorm,
    RoamingWorldBoss
}

public sealed class WorldEventState
{
    public string EventId { get; set; } = Guid.NewGuid().ToString();
    public WorldEventType Type { get; set; } = WorldEventType.RedGateIncursion;
    public string EventName { get; set; } = "🌀 Red Gate Incursion";
    public double CenterX { get; set; }
    public double CenterY { get; set; }
    public double Radius { get; set; } = 350.0;
    public float TimeRemaining { get; set; } = 90.0f;
    public int CurrentWave { get; set; } = 1;
    public int MaxWaves { get; set; } = 3;
    public bool IsActive { get; set; } = true;
    public bool IsCompleted { get; set; }
    public string RewardDesc { get; set; } = "Guaranteed 2x Genesis Prisms + Ascendant Catalysts";
}

/// <summary>
/// Dynamic Real-Time World Events & Void Rift Incursion Layer.
/// </summary>
public static class WorldEventManager
{
    public static WorldEventState CreateRedGateIncursion(double x, double y, int waves = 3)
    {
        return new WorldEventState
        {
            Type = WorldEventType.RedGateIncursion,
            EventName = "🌌 Void Rift Breach (Survive All Waves)",
            CenterX = x,
            CenterY = y,
            Radius = 400.0,
            TimeRemaining = 120.0f,
            CurrentWave = 1,
            MaxWaves = waves,
            IsActive = true,
            IsCompleted = false
        };
    }

    public static List<MonsterClusterSpawnDto> GenerateIncursionWaveSpawns(WorldEventState state)
    {
        var list = new List<MonsterClusterSpawnDto>();
        if (!state.IsActive || state.IsCompleted) return list;

        int count = 6 + state.CurrentWave * 2;
        string monsterType = state.CurrentWave switch
        {
            1 => "undead_knight",
            2 => "fire_imp",
            _ => "magma_golem"
        };

        list.Add(new MonsterClusterSpawnDto
        {
            X = state.CenterX - 80,
            Y = state.CenterY - 80,
            Count = count / 2,
            Type = monsterType
        });

        list.Add(new MonsterClusterSpawnDto
        {
            X = state.CenterX + 80,
            Y = state.CenterY + 80,
            Count = count / 2,
            Type = monsterType
        });

        return list;
    }

    public static bool AdvanceWave(WorldEventState state, out string message)
    {
        if (state.CurrentWave >= state.MaxWaves)
        {
            state.IsActive = false;
            state.IsCompleted = true;
            message = $"🎉 INCURSION CONQUERED! Claim your reward: [{state.RewardDesc}]!";
            return true;
        }

        state.CurrentWave++;
        message = $"⚠️ WAVE {state.CurrentWave}/{state.MaxWaves} SPAWNING! Prepare for elite reinforcements!";
        return false;
    }
}
