using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Maps;

public enum DungeonKeyType
{
    AncientBoneKey,
    RunicSilverKey,
    GoldenSanctumKey,
    VoidAetherSeal
}

public sealed class DungeonGate
{
    public string Id { get; set; } = string.Empty;
    public int TileX { get; set; }
    public int TileY { get; set; }
    public DungeonKeyType RequiredKey { get; set; } = DungeonKeyType.AncientBoneKey;
    public bool IsLocked { get; set; } = true;
    public bool IsQuarantineEncounter { get; set; }
    public int AssociatedRoomId { get; set; } = -1;
    public string GateName { get; set; } = "Ancient Iron Gate";
}

/// <summary>
/// Lock & Key Mechanics and Quarantine Combat Enclosures.
/// Manages progression seals, key item consumption, and encounter gates.
/// </summary>
public static class DungeonKeyLockSystem
{
    public static bool TryUnlockGate(
        DungeonGate gate,
        HashSet<DungeonKeyType> playerKeys,
        out string message)
    {
        if (!gate.IsLocked)
        {
            message = $"{gate.GateName} is already unlocked.";
            return true;
        }

        if (gate.IsQuarantineEncounter)
        {
            message = "⚠️ The gate is magically sealed! Defeat all hostile abominations in the chamber to break the barrier!";
            return false;
        }

        if (playerKeys.Contains(gate.RequiredKey))
        {
            gate.IsLocked = false;
            playerKeys.Remove(gate.RequiredKey);
            message = $"🔓 Used {gate.RequiredKey} to unlock {gate.GateName}!";
            return true;
        }

        message = $"🔒 {gate.GateName} is locked! Requires: [{gate.RequiredKey}]. Hunt the chamber Elite to acquire it.";
        return false;
    }

    public static bool UnlockQuarantineGate(DungeonGate gate, int livingMonstersInRoom, out string message)
    {
        if (!gate.IsQuarantineEncounter)
        {
            message = "This gate is not an encounter barrier.";
            return false;
        }

        if (livingMonstersInRoom <= 0)
        {
            gate.IsLocked = false;
            gate.IsQuarantineEncounter = false;
            message = "⚔️ ENCOUNTER CLEARED! The magic barrier dispels and the iron gate opens!";
            return true;
        }

        message = $"⚠️ Barrier remains active. {livingMonstersInRoom} enemies still lurking!";
        return false;
    }
}
