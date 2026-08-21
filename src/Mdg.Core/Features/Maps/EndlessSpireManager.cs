using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Maps;

public sealed class SpireFloorInfoDto
{
    public int FloorNumber { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public int MonsterLevel { get; set; }
    public bool IsBossFloor { get; set; }
    public string BossName { get; set; } = string.Empty;
    public List<string> Modifiers { get; set; } = new();
    public string FirstClearReward { get; set; } = string.Empty;
    public bool IsUnlocked { get; set; }
    public bool IsCleared { get; set; }
}

public static class EndlessSpireManager
{
    public const int MAX_SPIRE_FLOORS = 100;

    public static SpireFloorInfoDto GetFloorInfo(int floorNumber, int highestClearedFloor = 0)
    {
        floorNumber = Math.Clamp(floorNumber, 1, MAX_SPIRE_FLOORS);
        bool isBoss = floorNumber % 10 == 0 || floorNumber == 100;
        int monsterLevel = 10 + (int)(floorNumber * 0.9);

        string bossName = floorNumber switch
        {
            10 => "Goliath Warden of the Lower Spire",
            20 => "Cryomantic Drake Lord",
            30 => "Infernal Cinder Archon",
            40 => "Shadow Weaver Malphas",
            50 => "Void Stalker Titan",
            60 => "Astral Sentinel Omega",
            70 => "Oblivion Behemoth",
            80 => "Bloodforged Juggernaut",
            90 => "High Seraph of Aethelis",
            100 => "👑 Apex Celestial Sovereign (Floor 100 Boss)",
            _ => isBoss ? $"Floor {floorNumber} Guardian" : string.Empty
        };

        var modifiers = new List<string>();
        if (floorNumber >= 5) modifiers.Add("⚡ Monster Movement Speed +15%");
        if (floorNumber >= 15) modifiers.Add("🔥 Environmental Lava Eruptions");
        if (floorNumber >= 25) modifiers.Add("☠️ Monsters inflict Deadly Poison on Hit");
        if (floorNumber >= 45) modifiers.Add("🛡️ Monsters possess +25% Elemental Resistance");
        if (floorNumber >= 75) modifiers.Add("👑 Slay or be Slain: Monster Damage +35%");

        string reward = floorNumber switch
        {
            10 => "1x Genesis Prism + 500 EXP",
            25 => "2x Fracture Core + Unique Spire Boots",
            50 => "1x Ascendant Catalyst + Unique Spire Ring",
            75 => "2x Origin Matrix + Unique Spire Cuirass",
            100 => "👑 God-Tier Title: 'Conqueror of the 100th Floor' + 5x Ascendant Catalysts",
            _ => $"{100 + floorNumber * 20} EXP + Random Genesis Currency"
        };

        return new SpireFloorInfoDto
        {
            FloorNumber = floorNumber,
            Name = isBoss ? $"⚔️ Spire Floor {floorNumber}: {bossName}" : $"🏰 Spire Floor {floorNumber}: The Ascending Vault",
            Subtitle = isBoss ? $"[BOSS CHAMBER] Defeat {bossName} to break the Spire seal!" : $"Labyrinth Tier {floorNumber} (Lv. {monsterLevel})",
            MonsterLevel = monsterLevel,
            IsBossFloor = isBoss,
            BossName = bossName,
            Modifiers = modifiers,
            FirstClearReward = reward,
            IsUnlocked = floorNumber <= highestClearedFloor + 1,
            IsCleared = floorNumber <= highestClearedFloor
        };
    }

    public static ZoneMapDto GenerateSpireFloor(int floorNumber)
    {
        floorNumber = Math.Clamp(floorNumber, 1, MAX_SPIRE_FLOORS);
        bool isBoss = floorNumber % 10 == 0 || floorNumber == 100;
        int w = isBoss ? 50 : 70;
        int h = isBoss ? 50 : 70;
        const int tileSize = 48;

        var grid = new List<List<int>>(h);
        for (int y = 0; y < h; y++)
        {
            var row = new List<int>(w);
            for (int x = 0; x < w; x++)
            {
                row.Add(0); // Floor
            }
            grid.Add(row);
        }

        // Perimeter walls
        for (int x = 0; x < w; x++) { grid[0][x] = 1; grid[h - 1][x] = 1; }
        for (int y = 0; y < h; y++) { grid[y][0] = 1; grid[y][w - 1] = 1; }

        int cx = w / 2, cy = h / 2;

        // Pillars & Spire Architecture
        for (int py = 6; py < h - 6; py += 10)
        {
            for (int px = 6; px < w - 6; px += 10)
            {
                if (px != cx && py != cy)
                {
                    grid[py][px] = 10; // Ancient Pillar
                }
            }
        }

        var pois = new List<ZonePoiDto>();
        // Add Aether Shrine on non-boss floors
        if (!isBoss && floorNumber % 2 == 1)
        {
            pois.Add(new ZonePoiDto
            {
                Id = $"SpireShrine_F{floorNumber}",
                Type = "shrine",
                Name = "⚡ Tempest Spire Shrine",
                Description = "Kích hoạt bão sét hộ thân và +30% Tốc chạy trong 60 giây.",
                X = (cx - 8) * tileSize,
                Y = (cy - 8) * tileSize,
                BuffType = "TempestAura",
                BuffDuration = 60,
                Color = "#00f2fe",
                Icon = "⚡"
            });
        }

        var spawns = new List<MonsterClusterSpawnDto>();
        if (isBoss)
        {
            spawns.Add(new MonsterClusterSpawnDto
            {
                X = cx * tileSize,
                Y = cy * tileSize,
                Count = 1,
                Type = "boss"
            });
        }
        else
        {
            spawns.Add(new MonsterClusterSpawnDto { X = (cx - 15) * tileSize, Y = (cy - 15) * tileSize, Count = 6, Type = "undead_knight" });
            spawns.Add(new MonsterClusterSpawnDto { X = (cx + 15) * tileSize, Y = (cy - 15) * tileSize, Count = 6, Type = "frost_golem" });
            spawns.Add(new MonsterClusterSpawnDto { X = (cx - 15) * tileSize, Y = (cy + 15) * tileSize, Count = 6, Type = "magma_golem" });
            spawns.Add(new MonsterClusterSpawnDto { X = (cx + 15) * tileSize, Y = (cy + 15) * tileSize, Count = 7, Type = "goblin" });
        }

        return new ZoneMapDto
        {
            Id = $"EndlessSpire_F{floorNumber}",
            Name = $"Endless Spire: Floor {floorNumber}",
            Subtitle = isBoss ? $"👑 Boss Guardian Chamber (Floor {floorNumber})" : $"Ascending Floor {floorNumber} (Lv. {10 + (int)(floorNumber * 0.9)})",
            Biome = ZoneBiomeType.VoidAbyss,
            LevelRange = $"Lv. {10 + (int)(floorNumber * 0.9)}",
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = tileSize,
            WorldWidth = w * tileSize,
            WorldHeight = h * tileSize,
            Grid = grid,
            SpawnX = 4 * tileSize,
            SpawnY = cy * tileSize,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 3 * tileSize, Y = cy * tileSize, TargetZone = "SanctuaryHaven", TargetX = 960, TargetY = 960, Name = "🌿 Exit to Haven" },
                new() { X = (w - 3) * tileSize, Y = cy * tileSize, TargetZone = $"EndlessSpire_F{floorNumber + 1}", TargetX = 4 * tileSize, TargetY = cy * tileSize, Name = $"🌀 Ascend to Floor {floorNumber + 1}" }
            },
            Pois = pois,
            MonsterSpawns = spawns
        };
    }
}
