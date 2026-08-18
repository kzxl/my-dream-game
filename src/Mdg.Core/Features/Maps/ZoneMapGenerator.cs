using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Maps;

public static class ZoneMapGenerator
{
    public const int TILE_SIZE = 48;
    public const int TILE_FLOOR = 0;
    public const int TILE_WALL = 1;
    public const int TILE_WATER_LAVA = 2;
    public const int TILE_PATH = 3;
    public const int TILE_PLAZA = 4;
    public const int TILE_LAVA = 5;
    public const int TILE_TOXIC_MIASMA = 6;
    public const int TILE_GLACIAL_ICE = 7;
    public const int TILE_ELECTRIC_GROUND = 8;

    public static ZoneMapDto GenerateZone(string zoneId)
    {
        return zoneId switch
        {
            "SanctuaryHaven" => GenerateHaven(),
            "WhisperingPlains" => GeneratePlains(),
            "FrostpeakTundra" => GenerateTundra(),
            "MoltenCaldera" => GenerateCaldera(),
            "ForgottenCrypt" => GenerateCrypt(),
            _ => GenerateHaven()
        };
    }

    // 1. SANCTUARY HAVEN (Town Plaza & Stone Perimeter)
    private static ZoneMapDto GenerateHaven()
    {
        const int w = 28, h = 28;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int cx = w / 2, cy = h / 2;
        for (int y = cy - 5; y <= cy + 5; y++)
            for (int x = cx - 5; x <= cx + 5; x++)
                grid[y][x] = TILE_PLAZA;

        // East Gate and Path
        for (int x = cx + 5; x < w; x++)
        {
            grid[cy - 1][x] = TILE_PATH;
            grid[cy][x] = TILE_PATH;
            grid[cy + 1][x] = TILE_PATH;
        }

        return new ZoneMapDto
        {
            Id = "SanctuaryHaven",
            Name = "Sanctuary Haven",
            Subtitle = "🌿 Safe Starting Town (Plaza & Training Grounds)",
            Biome = ZoneBiomeType.SanctuaryHaven,
            LevelRange = "Lv. 1-5",
            Hazard = new EnvironmentalHazardConfig
            {
                HazardName = "Breeze of Peace",
                Description = "Restorative winds grant +5% Life/Mana regeneration while inside the town.",
                ResistanceRequired = "None",
                Threshold = 0,
                PenaltyType = "None"
            },
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            Grid = grid,
            SpawnX = cx * TILE_SIZE,
            SpawnY = cy * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = (w - 2) * TILE_SIZE, Y = cy * TILE_SIZE, TargetZone = "WhisperingPlains", TargetX = 180, TargetY = 960, Name = "🌀 To Whispering Plains" }
            },
            Npcs = new List<ZoneNpcDto>
            {
                new() { X = (cx - 3) * TILE_SIZE, Y = (cy - 2) * TILE_SIZE, Name = "Doran (Blacksmith)", Title = "Master Crafter", Color = "#e5c07b" },
                new() { X = (cx + 3) * TILE_SIZE, Y = (cy - 2) * TILE_SIZE, Name = "Elder Aethel", Title = "Sage of Aethelis", Color = "#61afef" },
                new() { X = (cx - 3) * TILE_SIZE, Y = (cy + 2) * TILE_SIZE, Name = "Kaelen (Stash Keeper)", Title = "Shared Vault", Color = "#ffd700" }
            },
            Dummies = new List<ZoneDummyDto>
            {
                new() { X = (cx + 2) * TILE_SIZE, Y = (cy + 4) * TILE_SIZE, Name = "Training Dummy (Alpha)" },
                new() { X = (cx + 4) * TILE_SIZE, Y = (cy + 4) * TILE_SIZE, Name = "Training Dummy (Beta)" }
            },
            Props = new List<ZonePropDto>
            {
                new() { X = cx * TILE_SIZE, Y = cy * TILE_SIZE, Type = "campfire" },
                new() { X = (cx - 4) * TILE_SIZE, Y = (cy - 2) * TILE_SIZE, Type = "chest" },
                new() { X = (cx + 4) * TILE_SIZE, Y = (cy - 2) * TILE_SIZE, Type = "barrel" }
            }
        };
    }

    // 2. WHISPERING PLAINS (Winding River & Bridges)
    private static ZoneMapDto GeneratePlains()
    {
        const int w = 40, h = 40;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int riverX = w / 2;
        for (int y = 1; y < h - 1; y++)
        {
            int curve = (int)Math.Round(Math.Sin(y / 3.5) * 3);
            int rx = riverX + curve;
            grid[y][rx - 1] = TILE_WATER_LAVA;
            grid[y][rx] = TILE_WATER_LAVA;
            grid[y][rx + 1] = TILE_WATER_LAVA;
        }

        // Bridges
        int[] bridges = { (int)(h * 0.35), (int)(h * 0.70) };
        foreach (int by in bridges)
        {
            int rx = riverX + (int)Math.Round(Math.Sin(by / 3.5) * 3);
            for (int bx = rx - 2; bx <= rx + 2; bx++)
            {
                grid[by - 1][bx] = TILE_PATH;
                grid[by][bx] = TILE_PATH;
                grid[by + 1][bx] = TILE_PATH;
            }
        }

        int midY = h / 2;
        for (int x = 1; x < w - 1; x++)
        {
            if (grid[midY][x] != TILE_WATER_LAVA) grid[midY][x] = TILE_PATH;
        }

        return new ZoneMapDto
        {
            Id = "WhisperingPlains",
            Name = "Whispering Plains",
            Subtitle = "🌾 Wild Hunting Grounds (River Crossings & Goblin Camps)",
            Biome = ZoneBiomeType.WhisperingPlains,
            LevelRange = "Lv. 5-15",
            Hazard = new EnvironmentalHazardConfig
            {
                HazardName = "Wild Tempest",
                Description = "Wild hunting grounds. Monsters possess +15% Movement Speed.",
                ResistanceRequired = "Physical",
                Threshold = 40,
                PenaltyType = "SpeedPenalty"
            },
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            Grid = grid,
            SpawnX = 180,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "SanctuaryHaven", TargetX = 1100, TargetY = 672, Name = "🌀 Return to Haven" },
                new() { X = (w - 2) * TILE_SIZE, Y = (int)(h * 0.25) * TILE_SIZE, TargetZone = "FrostpeakTundra", TargetX = 180, TargetY = 960, Name = "❄️ To Frostpeak Tundra" },
                new() { X = (w - 2) * TILE_SIZE, Y = (int)(h * 0.75) * TILE_SIZE, TargetZone = "ForgottenCrypt", TargetX = 180, TargetY = 960, Name = "🏰 Enter Forgotten Crypt" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = w * 0.25 * TILE_SIZE, Y = h * 0.30 * TILE_SIZE, Count = 6, Type = "slime" },
                new() { X = w * 0.25 * TILE_SIZE, Y = h * 0.75 * TILE_SIZE, Count = 7, Type = "goblin" },
                new() { X = w * 0.75 * TILE_SIZE, Y = h * 0.30 * TILE_SIZE, Count = 8, Type = "goblin" },
                new() { X = w * 0.75 * TILE_SIZE, Y = h * 0.75 * TILE_SIZE, Count = 9, Type = "skeleton" }
            }
        };
    }

    // 3. FROSTPEAK TUNDRA (Permafrost Blizzard Hazard & Freezing Ice Pools)
    private static ZoneMapDto GenerateTundra()
    {
        const int w = 40, h = 40;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        // Frozen Ice Pools
        for (int i = 0; i < 12; i++)
        {
            int mx = 5 + (i * 3) % (w - 10);
            int my = 5 + (i * 4) % (h - 10);
            for (int dy = -2; dy <= 2; dy++)
                for (int dx = -2; dx <= 2; dx++)
                    if (dx * dx + dy * dy <= 4) grid[my + dy][mx + dx] = TILE_WATER_LAVA;
        }

        int midY = h / 2;
        return new ZoneMapDto
        {
            Id = "FrostpeakTundra",
            Name = "Frostpeak Tundra",
            Subtitle = "❄️ Permafrost Peaks (Glacial Crevasses & Frost Fiends)",
            Biome = ZoneBiomeType.FrostpeakTundra,
            LevelRange = "Lv. 20-30",
            Hazard = new EnvironmentalHazardConfig
            {
                HazardName = "Permafrost Blizzard",
                Description = "Freezing blizzard. If Cold Resistance < 75%, enemy hits have 35% chance to Freeze you for 1s!",
                ResistanceRequired = "Cold",
                Threshold = 75.0,
                PenaltyType = "FreezeOnHit"
            },
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            Grid = grid,
            SpawnX = 180,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "WhisperingPlains", TargetX = 1750, TargetY = 480, Name = "🌀 Return to Plains" },
                new() { X = (w - 2) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "MoltenCaldera", TargetX = 180, TargetY = 960, Name = "🌋 To Molten Caldera" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = w * 0.3 * TILE_SIZE, Y = h * 0.3 * TILE_SIZE, Count = 7, Type = "slime" },
                new() { X = w * 0.7 * TILE_SIZE, Y = h * 0.7 * TILE_SIZE, Count = 8, Type = "skeleton" },
                new() { X = w * 0.8 * TILE_SIZE, Y = h * 0.4 * TILE_SIZE, Count = 1, Type = "boss" }
            }
        };
    }

    // 4. MOLTEN CALDERA (Volcanic Magma Rivers & Heatwave Fire DoT)
    private static ZoneMapDto GenerateCaldera()
    {
        const int w = 40, h = 40;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        for (int i = 0; i < 16; i++)
        {
            int mx = 4 + (i * 5) % (w - 8);
            int my = 4 + (i * 3) % (h - 8);
            for (int dy = -2; dy <= 2; dy++)
                for (int dx = -2; dx <= 2; dx++)
                    if (dx * dx + dy * dy <= 5) grid[my + dy][mx + dx] = TILE_WATER_LAVA;
        }

        int midY = h / 2;
        return new ZoneMapDto
        {
            Id = "MoltenCaldera",
            Name = "Molten Caldera",
            Subtitle = "🌋 Scorching Volcano (Magma Rivers & Infernal Lords)",
            Biome = ZoneBiomeType.MoltenCaldera,
            LevelRange = "Lv. 35-45",
            Hazard = new EnvironmentalHazardConfig
            {
                HazardName = "Scorching Heatwave",
                Description = "Extreme volcanic heat. If Fire Resistance < 75%, take continuous Burning Fire DoT!",
                ResistanceRequired = "Fire",
                Threshold = 75.0,
                PenaltyType = "FireDoT"
            },
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            Grid = grid,
            SpawnX = 180,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "FrostpeakTundra", TargetX = 1750, TargetY = 960, Name = "🌀 Return to Tundra" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = w * 0.4 * TILE_SIZE, Y = h * 0.4 * TILE_SIZE, Count = 9, Type = "skeleton" },
                new() { X = w * 0.75 * TILE_SIZE, Y = h * 0.6 * TILE_SIZE, Count = 10, Type = "goblin" },
                new() { X = w * 0.85 * TILE_SIZE, Y = h * 0.5 * TILE_SIZE, Count = 1, Type = "boss" }
            }
        };
    }

    // 5. FORGOTTEN CRYPT (BSP Dungeon: Interconnected Rooms & Shadow Fiend)
    private static ZoneMapDto GenerateCrypt()
    {
        const int w = 40, h = 40;
        var grid = InitializeGrid(w, h, TILE_WALL);

        var rooms = new[]
        {
            new { x = 3, y = h / 2 - 4, rw = 8, rh = 8 },
            new { x = 15, y = 5, rw = 10, rh = 8 },
            new { x = 15, y = h - 14, rw = 10, rh = 9 },
            new { x = w - 13, y = h / 2 - 6, rw = 11, rh = 12 }
        };

        foreach (var r in rooms)
        {
            for (int y = r.y; y < r.y + r.rh; y++)
                for (int x = r.x; x < r.x + r.rw; x++)
                    grid[y][x] = TILE_FLOOR;
        }

        // Carve corridors
        int midY = h / 2;
        for (int x = 7; x <= 20; x++) grid[midY][x] = TILE_FLOOR;
        for (int y = 9; y <= h - 10; y++) grid[y][20] = TILE_FLOOR;
        for (int x = 20; x <= w - 8; x++) grid[midY][x] = TILE_FLOOR;

        return new ZoneMapDto
        {
            Id = "ForgottenCrypt",
            Name = "Forgotten Crypt",
            Subtitle = "🏰 Shadow Crypt Lair (Miasma of Decay & Dark Lord)",
            Biome = ZoneBiomeType.ForgottenCrypt,
            LevelRange = "Lv. 15-25",
            Hazard = new EnvironmentalHazardConfig
            {
                HazardName = "Curse of Miasma",
                Description = "Choking dark miasma. If Chaos Resistance < 50%, Flask recovery is reduced by -30%!",
                ResistanceRequired = "Chaos",
                Threshold = 50.0,
                PenaltyType = "FlaskDecay"
            },
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            Grid = grid,
            SpawnX = 7 * TILE_SIZE,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 5 * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "WhisperingPlains", TargetX = 1750, TargetY = 1440, Name = "🌀 Escape Crypt" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 20 * TILE_SIZE, Y = 9 * TILE_SIZE, Count = 7, Type = "skeleton" },
                new() { X = 20 * TILE_SIZE, Y = (h - 10) * TILE_SIZE, Count = 8, Type = "goblin" },
                new() { X = (w - 8) * TILE_SIZE, Y = midY * TILE_SIZE, Count = 1, Type = "boss" }
            }
        };
    }

    private static List<List<int>> InitializeGrid(int w, int h, int fillValue)
    {
        var list = new List<List<int>>(h);
        for (int y = 0; y < h; y++)
        {
            var row = new List<int>(w);
            for (int x = 0; x < w; x++) row.Add(fillValue);
            list.Add(row);
        }
        return list;
    }
}
