using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Maps;

public enum DungeonTrapType
{
    SpikeTrap,
    FlamethrowerStatue,
    AetherShockPylon
}

public sealed class DungeonTrapEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public DungeonTrapType Type { get; set; } = DungeonTrapType.SpikeTrap;
    public int TileX { get; set; }
    public int TileY { get; set; }
    public double WorldX => (TileX + 0.5) * 48;
    public double WorldY => (TileY + 0.5) * 48;
    public float IntervalSeconds { get; set; } = 2.0f;
    public float Timer { get; set; }
    public bool IsPrimed { get; set; }
    public int Damage { get; set; } = 45;
    public string DamageType { get; set; } = "physical";
    public float TriggerRadius { get; set; } = 36.0f;
}

/// <summary>
/// Interactive Dungeon Traps and Hazard Mechanisms.
/// Simulates periodic spike triggers, fire plumes, and electric shock traps.
/// </summary>
public static class DungeonTrapSystem
{
    public static void UpdateTraps(List<DungeonTrapEntity> traps, float dt)
    {
        foreach (var trap in traps)
        {
            trap.Timer += dt;
            if (trap.Timer >= trap.IntervalSeconds)
            {
                trap.Timer -= trap.IntervalSeconds;
                trap.IsPrimed = !trap.IsPrimed; // Toggle between hidden / armed & struck
            }
        }
    }

    public static (bool Triggered, int Damage, string DamageType) CheckTrapTrigger(
        DungeonTrapEntity trap,
        double entityX,
        double entityY)
    {
        if (!trap.IsPrimed) return (false, 0, trap.DamageType);

        double dist = Math.Sqrt(Math.Pow(entityX - trap.WorldX, 2) + Math.Pow(entityY - trap.WorldY, 2));
        if (dist <= trap.TriggerRadius)
        {
            return (true, trap.Damage, trap.DamageType);
        }

        return (false, 0, trap.DamageType);
    }
}
