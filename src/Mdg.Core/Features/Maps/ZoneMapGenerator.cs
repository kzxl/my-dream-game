using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Maps;

public static class ZoneMapGenerator
{
    public const int TILE_SIZE = 48;
    public const int TILE_FLOOR = 0;
    public const int TILE_WALL = 1;
    public const int TILE_WATER_DEEP = 2;
    public const int TILE_PATH = 3;
    public const int TILE_PLAZA = 4;
    public const int TILE_LAVA = 5;
    public const int TILE_TOXIC_MIASMA = 6;
    public const int TILE_GLACIAL_ICE = 7;
    public const int TILE_ELECTRIC_GROUND = 8;
    public const int TILE_SHALLOW_WATER_SAND = 9;
    public const int TILE_ANCIENT_PILLAR = 10;
    public const int TILE_CHASM = 11;
    public const int TILE_DEEP_SNOW = 12;
    public const int TILE_BURNT_GROUND = 13;

    public static ZoneMapDto GenerateZone(string zoneId)
    {
        return zoneId switch
        {
            // Act 1
            "SanctuaryHaven" => GenerateHaven(),
            "WhisperingPlains" => GeneratePlains(),
            "VerdantCanopy" => GenerateCanopy(),
            "ForgottenCrypt" => GenerateCrypt(),

            // Act 2
            "GlacialOutpost" => GenerateHaven(),
            "FrostpeakTundra" => GenerateTundra(),
            "HowlingIceCaverns" => GenerateIceCaverns(),
            "StormpeakRidge" => GenerateStormpeak(),

            // Act 3
            "AshenRedoubt" => GenerateHaven(),
            "ObsidianWastes" => GenerateObsidianWastes(),
            "MoltenCaldera" => GenerateCaldera(),
            "InfernalHeart" => GenerateCaldera(),

            // Act 4
            "OasisSanctum" => GenerateHaven(),
            "ShiftingDunes" => GenerateShiftingDunes(),
            "DreadTombs" => GenerateCrypt(),
            "NecropolisOfSouls" => GenerateCrypt(),

            // Act 5 & Pinnacle
            "AethelisCitadel" => GenerateHaven(),
            "VoidAbyss" => GenerateVoidAbyss(),
            "CitadelOfTheVoid" => GenerateVoidAbyss(),
            "ArenaCaldera" => GenerateArenaCaldera(),
            "ArenaGlacial" => GenerateArenaGlacial(),
            "ArenaVoid" => GenerateArenaVoid(),

            _ => GenerateHaven()
        };
    }

    // 1. SANCTUARY HAVEN (40x40 - 1920x1920 px: Vibrant Town Plaza, Crafting District & Paved Paths)
    private static ZoneMapDto GenerateHaven()
    {
        const int w = 40, h = 40;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        // Natural stone perimeter walls
        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int cx = w / 2, cy = h / 2;

        // Central Grand Stone Plaza (Diamond + Octagon)
        for (int y = cy - 8; y <= cy + 8; y++)
        {
            for (int x = cx - 8; x <= cx + 8; x++)
            {
                if (Math.Abs(x - cx) + Math.Abs(y - cy) <= 11)
                {
                    grid[y][x] = TILE_PLAZA;
                }
            }
        }

        // Town Fountain / Stone Pillars in corners of plaza
        grid[cy - 5][cx - 5] = TILE_ANCIENT_PILLAR;
        grid[cy - 5][cx + 5] = TILE_ANCIENT_PILLAR;
        grid[cy + 5][cx - 5] = TILE_ANCIENT_PILLAR;
        grid[cy + 5][cx + 5] = TILE_ANCIENT_PILLAR;

        // North Pond & Garden
        for (int py = 5; py <= 10; py++)
        {
            for (int px = 8; px <= 14; px++)
            {
                grid[py][px] = (py == 5 || py == 10 || px == 8 || px == 14) ? TILE_SHALLOW_WATER_SAND : TILE_WATER_DEEP;
            }
        }

        // East Gate and Main Path to Plains
        for (int x = cx + 7; x < w - 1; x++)
        {
            grid[cy - 1][x] = TILE_PATH;
            grid[cy][x] = TILE_PATH;
            grid[cy + 1][x] = TILE_PATH;
        }

        // South Gate and Path to Crypt
        for (int y = cy + 7; y < h - 1; y++)
        {
            grid[y][cx - 1] = TILE_PATH;
            grid[y][cx] = TILE_PATH;
            grid[y][cx + 1] = TILE_PATH;
        }

        return new ZoneMapDto
        {
            Id = "SanctuaryHaven",
            Name = "Sanctuary Haven",
            Subtitle = "🌿 Capital Haven of Aethelis (Grand Plaza, Guild District & Crafting Forge)",
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
                new() { X = (w - 2) * TILE_SIZE, Y = cy * TILE_SIZE, TargetZone = "WhisperingPlains", TargetX = 400, TargetY = 1536, Name = "🌀 To Whispering Plains" },
                new() { X = cx * TILE_SIZE, Y = (h - 2) * TILE_SIZE, TargetZone = "ForgottenCrypt", TargetX = 550, TargetY = 550, Name = "🏰 To Forgotten Crypt" }
            },
            Npcs = new List<ZoneNpcDto>
            {
                new() { X = (cx - 4) * TILE_SIZE, Y = (cy - 3) * TILE_SIZE, Name = "Doran (Blacksmith)", Title = "Master Blacksmith", Color = "#e5c07b" },
                new() { X = cx * TILE_SIZE, Y = (cy - 4) * TILE_SIZE, Name = "Elder Aethel", Title = "High Elder Sage", Color = "#61afef" },
                new() { X = (cx - 3) * TILE_SIZE, Y = (cy - 3) * TILE_SIZE, Name = "Kaelen (Vault Keeper)", Title = "Keeper of the Vault", Color = "#98c379" },
                new() { X = (cx + 3) * TILE_SIZE, Y = (cy - 3) * TILE_SIZE, Name = "Lyra (Astromancer)", Title = "Astromancer of the Void", Color = "#c678dd" },
                new() { X = (cx + 4) * TILE_SIZE, Y = (cy + 1) * TILE_SIZE, Name = "Mira (Beastmaster)", Title = "Companion Beastmaster", Color = "#00f2fe" }
            },
            Dummies = new List<ZoneDummyDto>
            {
                new() { X = (cx + 3) * TILE_SIZE, Y = (cy + 5) * TILE_SIZE, Name = "Training Dummy (Alpha)" },
                new() { X = (cx + 5) * TILE_SIZE, Y = (cy + 5) * TILE_SIZE, Name = "Training Dummy (Beta)" }
            },
            Props = new List<ZonePropDto>
            {
                new() { X = cx * TILE_SIZE, Y = cy * TILE_SIZE, Type = "campfire" },
                new() { X = (cx - 6) * TILE_SIZE, Y = (cy - 3) * TILE_SIZE, Type = "chest" },
                new() { X = (cx + 6) * TILE_SIZE, Y = (cy - 3) * TILE_SIZE, Type = "barrel" },
                new() { X = (cx - 7) * TILE_SIZE, Y = (cy - 5) * TILE_SIZE, Type = "oak_tree" },
                new() { X = (cx + 7) * TILE_SIZE, Y = (cy - 5) * TILE_SIZE, Type = "cherry_tree" },
                new() { X = (cx - 7) * TILE_SIZE, Y = (cy + 5) * TILE_SIZE, Type = "cherry_tree" },
                new() { X = (cx + 7) * TILE_SIZE, Y = (cy + 5) * TILE_SIZE, Type = "oak_tree" },
                new() { X = (cx - 2) * TILE_SIZE, Y = (cy - 4) * TILE_SIZE, Type = "flowers_gold" },
                new() { X = (cx + 2) * TILE_SIZE, Y = (cy - 4) * TILE_SIZE, Type = "flowers_blue" },
                new() { X = (cx - 5) * TILE_SIZE, Y = (cy + 2) * TILE_SIZE, Type = "lush_bush" },
                new() { X = (cx + 5) * TILE_SIZE, Y = (cy + 2) * TILE_SIZE, Type = "lush_bush" },
                new() { X = (cx - 2) * TILE_SIZE, Y = (cy + 4) * TILE_SIZE, Type = "mossy_rock" },
                new() { X = (cx + 2) * TILE_SIZE, Y = (cy + 4) * TILE_SIZE, Type = "mossy_rock" }
            }
        };
    }

    // 2. WHISPERING PLAINS (64x64 - 3072x3072 px: Expansive Wilderness, Winding Rivers, Outposts)
    private static ZoneMapDto GeneratePlains()
    {
        const int w = 64, h = 64;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int riverBaseX = w / 2;
        var bridgeYPositions = new List<int> { 16, 32, 48 };

        for (int y = 1; y < h - 1; y++)
        {
            // Organic multi-sine wave river curve
            double wave = Math.Sin(y / 5.5) * 6.5 + Math.Cos(y / 2.8) * 2.2;
            int rx = (int)Math.Round(riverBaseX + wave);

            // Shallow Sand Borders
            if (rx - 2 >= 1) grid[y][rx - 2] = TILE_SHALLOW_WATER_SAND;
            if (rx + 2 < w - 1) grid[y][rx + 2] = TILE_SHALLOW_WATER_SAND;

            // Deep River Water
            grid[y][rx - 1] = TILE_WATER_DEEP;
            grid[y][rx] = TILE_WATER_DEEP;
            grid[y][rx + 1] = TILE_WATER_DEEP;
        }

        // Stone Bridges over River
        foreach (int by in bridgeYPositions)
        {
            for (int dy = -1; dy <= 1; dy++)
            {
                int y = by + dy;
                for (int x = riverBaseX - 8; x <= riverBaseX + 8; x++)
                {
                    if (grid[y][x] == TILE_WATER_DEEP || grid[y][x] == TILE_SHALLOW_WATER_SAND)
                    {
                        grid[y][x] = TILE_PATH;
                    }
                }
            }
        }

        // Main Highway Spline Path from West Portal to East Portal
        int midY = h / 2;
        for (int x = 1; x < w - 1; x++)
        {
            if (grid[midY][x] != TILE_WATER_DEEP)
            {
                grid[midY][x] = TILE_PATH;
                grid[midY + 1][x] = TILE_PATH;
            }
        }

        return new ZoneMapDto
        {
            Id = "WhisperingPlains",
            Name = "Whispering Plains",
            Subtitle = "🌾 Vast Wilderness with Winding River, Beast Outposts & Ancient Ruins",
            Biome = ZoneBiomeType.WhisperingPlains,
            LevelRange = "Lv. 5-12",
            Hazard = new EnvironmentalHazardConfig
            {
                HazardName = "Wild Winds",
                Description = "Howling crosswinds increase monster movement speed by +15%.",
                ResistanceRequired = "Physical / Evasion",
                Threshold = 20,
                PenaltyType = "MonsterSpeed"
            },
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            Grid = grid,
            SpawnX = 220,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "SanctuaryHaven", TargetX = 1800, TargetY = 960, Name = "🌿 Back to Haven" },
                new() { X = (w - 2) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "FrostpeakTundra", TargetX = 220, TargetY = 1440, Name = "❄️ To Frostpeak Tundra" }
            },
            Npcs = new List<ZoneNpcDto>
            {
                new() { X = 280, Y = midY * TILE_SIZE + 60, Name = "Valen (Scout)", Title = "Trinh Sát Tiền Đồn", Color = "#e06c75" }
            },
            Props = new List<ZonePropDto>
            {
                new() { X = 600, Y = 1950, Type = "pine_tree" },
                new() { X = 750, Y = 2000, Type = "autumn_tree" },
                new() { X = 1200, Y = 1800, Type = "tall_grass" },
                new() { X = 1400, Y = 1900, Type = "flowers_red" },
                new() { X = 1600, Y = 2100, Type = "mossy_rock" },
                new() { X = 2000, Y = 1900, Type = "pine_tree" },
                new() { X = 2200, Y = 2200, Type = "autumn_tree" },
                new() { X = 2500, Y = 1800, Type = "mushroom_glow" },
                new() { X = 2800, Y = 2000, Type = "tall_grass" },
                new() { X = 3100, Y = 1950, Type = "flowers_red" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 600, Y = 600, Count = 6, Type = "slime" },
                new() { X = 750, Y = 1800, Count = 7, Type = "wolf" },
                new() { X = 2100, Y = 700, Count = 8, Type = "goblin" },
                new() { X = 2300, Y = 2200, Count = 7, Type = "wolf" },
                new() { X = 1500, Y = 1500, Count = 5, Type = "slime" }
            }
        };
    }

    // 3. FORGOTTEN CRYPT (60x60 - 2880x2880 px: Multi-Chamber Catacombs & Toxic Miasma)
    private static ZoneMapDto GenerateCrypt()
    {
        const int w = 60, h = 60;
        var grid = InitializeGrid(w, h, TILE_WALL);

        var rooms = new List<(int x, int y, int rw, int rh)>
        {
            (5, 5, 14, 14),
            (38, 5, 16, 14),
            (5, 38, 14, 16),
            (36, 36, 18, 18),
            (22, 22, 16, 16),
            (5, 22, 12, 12),
            (42, 22, 12, 12)
        };

        // Carve organic rooms with beveled corners & pillars
        foreach (var r in rooms)
        {
            for (int y = r.y; y < r.y + r.rh; y++)
            {
                for (int x = r.x; x < r.x + r.rw; x++)
                {
                    bool isCorner = (x == r.x && y == r.y) || (x == r.x + r.rw - 1 && y == r.y) ||
                                    (x == r.x && y == r.y + r.rh - 1) || (x == r.x + r.rw - 1 && y == r.y + r.rh - 1);
                    if (!isCorner)
                    {
                        grid[y][x] = TILE_FLOOR;
                    }
                }
            }

            // Pillars in large rooms
            if (r.rw >= 14 && r.rh >= 14)
            {
                grid[r.y + 3][r.x + 3] = TILE_ANCIENT_PILLAR;
                grid[r.y + 3][r.x + r.rw - 4] = TILE_ANCIENT_PILLAR;
                grid[r.y + r.rh - 4][r.x + 3] = TILE_ANCIENT_PILLAR;
                grid[r.y + r.rh - 4][r.x + r.rw - 4] = TILE_ANCIENT_PILLAR;

                // Toxic miasma in boss chamber (Room 4)
                if (r.x == 36)
                {
                    grid[r.y + r.rh / 2][r.x + r.rw / 2] = TILE_TOXIC_MIASMA;
                    grid[r.y + r.rh / 2 + 1][r.x + r.rw / 2] = TILE_TOXIC_MIASMA;
                    grid[r.y + r.rh / 2][r.x + r.rw / 2 + 1] = TILE_TOXIC_MIASMA;
                }
            }
        }

        // Interconnecting Corridors
        CarveCorridor(grid, 12, 12, 30, 12);
        CarveCorridor(grid, 30, 12, 30, 30);
        CarveCorridor(grid, 12, 30, 30, 30);
        CarveCorridor(grid, 12, 12, 12, 45);
        CarveCorridor(grid, 30, 30, 45, 45);
        CarveCorridor(grid, 12, 28, 48, 28);

        return new ZoneMapDto
        {
            Id = "ForgottenCrypt",
            Name = "Forgotten Crypt",
            Subtitle = "🏰 Ancient Multi-Chamber Catacombs (Toxic Miasma & Undead Dread)",
            Biome = ZoneBiomeType.ForgottenCrypt,
            LevelRange = "Lv. 10-18",
            Hazard = new EnvironmentalHazardConfig
            {
                HazardName = "Curse of Miasma",
                Description = "Deadly chướng khí độc. Stepping on Toxic Miasma deals 30 Chaos Dmg/s. Reduces Flask recovery if Chaos Resistance < 50%!",
                ResistanceRequired = "Chaos",
                Threshold = 50,
                PenaltyType = "FlaskDecay"
            },
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            Grid = grid,
            SpawnX = 8 * TILE_SIZE,
            SpawnY = 8 * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 6 * TILE_SIZE, Y = 6 * TILE_SIZE, TargetZone = "SanctuaryHaven", TargetX = 960, TargetY = 1800, Name = "🌿 Back to Haven" },
                new() { X = 48 * TILE_SIZE, Y = 48 * TILE_SIZE, TargetZone = "VoidAbyss", TargetX = 240, TargetY = 1440, Name = "🌌 To Void Abyss" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 600, Y = 600, Count = 6, Type = "skeleton" },
                new() { X = 2100, Y = 600, Count = 7, Type = "undead_knight" },
                new() { X = 600, Y = 2100, Count = 6, Type = "skeleton" },
                new() { X = 2200, Y = 2200, Count = 1, Type = "boss" }
            }
        };
    }

    // 4. FROSTPEAK TUNDRA (60x60 - 2880x2880 px: Permafrost Glacier, Deep Snow & Ice Caves)
    private static ZoneMapDto GenerateTundra()
    {
        const int w = 60, h = 60;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        // Glacial Ice Patches & Deep Snow Crevasses
        for (int y = 6; y < h - 6; y++)
        {
            for (int x = 6; x < w - 6; x++)
            {
                double noise = Math.Sin(x * 0.22) * Math.Cos(y * 0.25);
                if (noise > 0.45)
                {
                    grid[y][x] = TILE_GLACIAL_ICE; // Slippery Ice Hazard
                }
                else if (noise < -0.42)
                {
                    grid[y][x] = TILE_DEEP_SNOW; // Deep snow drift
                }
            }
        }

        int midY = h / 2;
        for (int x = 1; x < w - 1; x++)
        {
            grid[midY][x] = TILE_PATH;
        }

        return new ZoneMapDto
        {
            Id = "FrostpeakTundra",
            Name = "Frostpeak Tundra",
            Subtitle = "❄️ Permafrost Glacier (Glacial Fissures, Blizzards & Ice Golems)",
            Biome = ZoneBiomeType.FrostpeakTundra,
            LevelRange = "Lv. 16-25",
            Hazard = new EnvironmentalHazardConfig
            {
                HazardName = "Permafrost Blizzard",
                Description = "Freezing cold hazards. If Cold Resistance < 75%, attacks have a 35% chance to Freeze you for 1.0s!",
                ResistanceRequired = "Cold",
                Threshold = 75,
                PenaltyType = "FreezeOnHit"
            },
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            Grid = grid,
            SpawnX = 220,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "WhisperingPlains", TargetX = 2950, TargetY = 1536, Name = "🌾 To Plains" },
                new() { X = (w - 2) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "MoltenCaldera", TargetX = 220, TargetY = 1440, Name = "🔥 To Molten Caldera" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 800, Y = 800, Count = 7, Type = "frost_golem" },
                new() { X = 2000, Y = 1800, Count = 8, Type = "frost_golem" },
                new() { X = 1500, Y = 800, Count = 7, Type = "wolf" }
            }
        };
    }

    // 5. MOLTEN CALDERA (60x60 - 2880x2880 px: Volcanic Caldera, Magma Rivers & Obsidian Islands)
    private static ZoneMapDto GenerateCaldera()
    {
        const int w = 60, h = 60;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int cx = w / 2, cy = h / 2;

        // Central Magma Lake with Obsidian Island
        for (int y = cy - 12; y <= cy + 12; y++)
        {
            for (int x = cx - 12; x <= cx + 12; x++)
            {
                double dist = Math.Sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
                if (dist <= 11.5 && dist >= 5.0)
                {
                    grid[y][x] = TILE_LAVA; // Lava Hazard Ring
                }
                else if (dist > 11.5 && dist <= 13.5)
                {
                    grid[y][x] = TILE_BURNT_GROUND; // Scorched Earth
                }
            }
        }

        // Obsidian Pillars around Caldera Ring
        grid[cy - 8][cx - 8] = TILE_ANCIENT_PILLAR;
        grid[cy - 8][cx + 8] = TILE_ANCIENT_PILLAR;
        grid[cy + 8][cx - 8] = TILE_ANCIENT_PILLAR;
        grid[cy + 8][cx + 8] = TILE_ANCIENT_PILLAR;

        // Natural Stone Bridges to Island
        for (int x = cx - 12; x <= cx + 12; x++)
        {
            grid[cy][x] = TILE_PATH;
            grid[cy + 1][x] = TILE_PATH;
        }

        int midY = h / 2;
        return new ZoneMapDto
        {
            Id = "MoltenCaldera",
            Name = "Molten Caldera",
            Subtitle = "🔥 Volcanic Crater (Lava Fissures, Sulfur Pools & Magma Behemoths)",
            Biome = ZoneBiomeType.MoltenCaldera,
            LevelRange = "Lv. 24-32",
            Hazard = new EnvironmentalHazardConfig
            {
                HazardName = "Scorching Heatwave",
                Description = "Molten magma terrain. Standing on Lava deals 40 Fire Dmg/s. Heatwave deals damage if Fire Resistance < 75%!",
                ResistanceRequired = "Fire",
                Threshold = 75,
                PenaltyType = "FireDoT"
            },
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            Grid = grid,
            SpawnX = 220,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "FrostpeakTundra", TargetX = 2750, TargetY = 1440, Name = "❄️ To Frostpeak" },
                new() { X = (w - 2) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "StormpeakRidge", TargetX = 220, TargetY = 1536, Name = "⚡ To Stormpeak Ridge" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 800, Y = 800, Count = 7, Type = "fire_imp" },
                new() { X = 2000, Y = 2000, Count = 7, Type = "magma_golem" },
                new() { X = 1440, Y = 1440, Count = 8, Type = "magma_golem" }
            }
        };
    }

    // 6. STORMPEAK RIDGE (64x64 - 3072x3072 px: High Mountain Peaks, Static Lightning & Chasms)
    private static ZoneMapDto GenerateStormpeak()
    {
        const int w = 64, h = 64;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        // Abyssal Chasms and Electric Static Ground
        for (int y = 6; y < h - 6; y++)
        {
            for (int x = 6; x < w - 6; x++)
            {
                double noise = Math.Sin(x * 0.28) * Math.Cos(y * 0.28);
                if (noise > 0.48)
                {
                    grid[y][x] = TILE_CHASM; // Abyssal Chasm (unwalkable)
                }
                else if (noise < -0.42)
                {
                    grid[y][x] = TILE_ELECTRIC_GROUND; // Static Charge Hazard
                }
            }
        }

        int midY = h / 2;
        for (int x = 1; x < w - 1; x++)
        {
            grid[midY][x] = TILE_PATH;
            grid[midY + 1][x] = TILE_PATH;
        }

        return new ZoneMapDto
        {
            Id = "StormpeakRidge",
            Name = "Stormpeak Ridge",
            Subtitle = "⚡ High Mountain Peaks (Static Lightning Storms & Thunder Drakes)",
            Biome = ZoneBiomeType.StormpeakRidge,
            LevelRange = "Lv. 30-40",
            Hazard = new EnvironmentalHazardConfig
            {
                HazardName = "Static Overload",
                Description = "Fierce lightning strikes. Standing on Static Ground deals 25 Lightning Dmg/s and applies Shock (+25% damage taken)!",
                ResistanceRequired = "Lightning",
                Threshold = 75,
                PenaltyType = "ShockVulnerable"
            },
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            Grid = grid,
            SpawnX = 220,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "MoltenCaldera", TargetX = 2750, TargetY = 1440, Name = "🔥 To Caldera" },
                new() { X = (w - 2) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "VoidAbyss", TargetX = 240, TargetY = 1440, Name = "🌌 To Void Abyss" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 900, Y = 900, Count = 7, Type = "goblin" },
                new() { X = 2200, Y = 2000, Count = 8, Type = "undead_knight" },
                new() { X = 1600, Y = 1200, Count = 6, Type = "frost_golem" }
            }
        };
    }

    // 7. VOID ABYSS (60x60 - 2880x2880 px: Cosmic Void Arena, Fractured Floating Islands)
    private static ZoneMapDto GenerateVoidAbyss()
    {
        const int w = 60, h = 60;
        var grid = InitializeGrid(w, h, TILE_CHASM); // Void chasm base

        int cx = w / 2, cy = h / 2;

        // Grand Central Void Island
        for (int y = cy - 14; y <= cy + 14; y++)
        {
            for (int x = cx - 14; x <= cx + 14; x++)
            {
                double dist = Math.Sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
                if (dist <= 13.0)
                {
                    grid[y][x] = TILE_FLOOR;
                }
            }
        }

        // Inner Void Ritual Circle
        for (int y = cy - 6; y <= cy + 6; y++)
        {
            for (int x = cx - 6; x <= cx + 6; x++)
            {
                if (Math.Abs(x - cx) + Math.Abs(y - cy) <= 8)
                {
                    grid[y][x] = TILE_PLAZA;
                }
            }
        }

        // Ancient Void Pillars
        grid[cy - 6][cx - 6] = TILE_ANCIENT_PILLAR;
        grid[cy - 6][cx + 6] = TILE_ANCIENT_PILLAR;
        grid[cy + 6][cx - 6] = TILE_ANCIENT_PILLAR;
        grid[cy + 6][cx + 6] = TILE_ANCIENT_PILLAR;

        // Bridge to West Spawn
        for (int x = 4; x <= cx - 13; x++)
        {
            grid[cy][x] = TILE_PATH;
            grid[cy + 1][x] = TILE_PATH;
        }

        return new ZoneMapDto
        {
            Id = "VoidAbyss",
            Name = "The Void Abyss",
            Subtitle = "🌌 Apex Realm of Malakor (Endgame Cosmic Arena & Rift Gateway)",
            Biome = ZoneBiomeType.VoidAbyss,
            LevelRange = "Lv. 40-50 (Pinnacle)",
            Hazard = new EnvironmentalHazardConfig
            {
                HazardName = "Abyssal Singularity",
                Description = "Cosmic void energy. High Chaos & Elemental resistances required to survive the Primordial Storm!",
                ResistanceRequired = "All Resistances",
                Threshold = 75,
                PenaltyType = "VoidDecay"
            },
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            Grid = grid,
            SpawnX = 6 * TILE_SIZE,
            SpawnY = cy * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 5 * TILE_SIZE, Y = cy * TILE_SIZE, TargetZone = "StormpeakRidge", TargetX = 2950, TargetY = 1536, Name = "⚡ To Stormpeak" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = cx * TILE_SIZE, Y = cy * TILE_SIZE, Count = 1, Type = "boss" },
                new() { X = (cx - 8) * TILE_SIZE, Y = (cy - 8) * TILE_SIZE, Count = 6, Type = "undead_knight" },
                new() { X = (cx + 8) * TILE_SIZE, Y = (cy + 8) * TILE_SIZE, Count = 6, Type = "fire_imp" }
            }
        };
    }

    // 8. ARENA CALDERA - PINNACLE ARENA (Tier 14: Ignis, The Molten Archon)
    private static ZoneMapDto GenerateArenaCaldera()
    {
        const int w = 32, h = 32;
        var grid = InitializeGrid(w, h, TILE_LAVA);
        int cx = w / 2, cy = h / 2;

        // Circular Obsidian Arena platform surrounded by boiling lava
        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                float dist = MathF.Sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
                if (dist <= 11f)
                {
                    grid[y][x] = TILE_BURNT_GROUND;
                }
                if (dist <= 8f)
                {
                    grid[y][x] = TILE_PLAZA;
                }
            }
        }

        // 4 Obsidian Cover Pillars (safe cover from Supernova)
        grid[cy - 4][cx - 4] = TILE_ANCIENT_PILLAR;
        grid[cy - 4][cx + 4] = TILE_ANCIENT_PILLAR;
        grid[cy + 4][cx - 4] = TILE_ANCIENT_PILLAR;
        grid[cy + 4][cx + 4] = TILE_ANCIENT_PILLAR;

        return new ZoneMapDto
        {
            Id = "ArenaCaldera",
            Name = "🌋 Caldera of Ignis (Pinnacle Arena)",
            Subtitle = "Pinnacle Boss: Ignis, The Molten Archon",
            Biome = ZoneBiomeType.MoltenCaldera,
            LevelRange = "Lv. 80+ (Tier 14)",
            WidthInTiles = w,
            HeightInTiles = h,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            SpawnX = cx * TILE_SIZE,
            SpawnY = (cy + 7) * TILE_SIZE,
            Grid = grid,
            Portals = new List<ZonePortalDto>
            {
                new() { X = cx * TILE_SIZE, Y = (cy + 8) * TILE_SIZE, TargetZone = "SanctuaryHaven", TargetX = 960, TargetY = 960, Name = "🏛️ Return to Haven" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = cx * TILE_SIZE, Y = (cy - 2) * TILE_SIZE, Count = 1, Type = "ignis_boss" },
                new() { X = (cx - 5) * TILE_SIZE, Y = (cy - 3) * TILE_SIZE, Count = 3, Type = "fire_imp" },
                new() { X = (cx + 5) * TILE_SIZE, Y = (cy - 3) * TILE_SIZE, Count = 3, Type = "fire_imp" }
            }
        };
    }

    // 9. ARENA GLACIAL - PINNACLE ARENA (Tier 15: Vael, The Frost Sovereign)
    private static ZoneMapDto GenerateArenaGlacial()
    {
        const int w = 32, h = 32;
        var grid = InitializeGrid(w, h, TILE_GLACIAL_ICE);
        int cx = w / 2, cy = h / 2;

        // Frozen Ancient Throne Room
        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                float dist = MathF.Sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
                if (dist <= 11f)
                {
                    grid[y][x] = TILE_DEEP_SNOW;
                }
                if (dist <= 8f)
                {
                    grid[y][x] = TILE_PLAZA;
                }
            }
        }

        // Frost Monoliths
        grid[cy - 5][cx] = TILE_ANCIENT_PILLAR;
        grid[cy + 5][cx] = TILE_ANCIENT_PILLAR;
        grid[cy][cx - 5] = TILE_ANCIENT_PILLAR;
        grid[cy][cx + 5] = TILE_ANCIENT_PILLAR;

        return new ZoneMapDto
        {
            Id = "ArenaGlacial",
            Name = "❄️ Throne of the Frost Sovereign (Pinnacle Arena)",
            Subtitle = "Pinnacle Boss: Vael, The Frost Sovereign",
            Biome = ZoneBiomeType.FrostpeakTundra,
            LevelRange = "Lv. 82+ (Tier 15)",
            WidthInTiles = w,
            HeightInTiles = h,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            SpawnX = cx * TILE_SIZE,
            SpawnY = (cy + 7) * TILE_SIZE,
            Grid = grid,
            Portals = new List<ZonePortalDto>
            {
                new() { X = cx * TILE_SIZE, Y = (cy + 8) * TILE_SIZE, TargetZone = "SanctuaryHaven", TargetX = 960, TargetY = 960, Name = "🏛️ Return to Haven" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = cx * TILE_SIZE, Y = (cy - 2) * TILE_SIZE, Count = 1, Type = "vael_boss" },
                new() { X = (cx - 4) * TILE_SIZE, Y = cy * TILE_SIZE, Count = 3, Type = "frost_golem" },
                new() { X = (cx + 4) * TILE_SIZE, Y = cy * TILE_SIZE, Count = 3, Type = "frost_golem" }
            }
        };
    }

    // 10. ARENA VOID - PINNACLE ARENA (Tier 16: Malakor, The Shadow Devourer)
    private static ZoneMapDto GenerateArenaVoid()
    {
        const int w = 32, h = 32;
        var grid = InitializeGrid(w, h, TILE_CHASM);
        int cx = w / 2, cy = h / 2;

        // Void Altar floating in the abyss
        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                float dist = MathF.Sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
                if (dist <= 10f)
                {
                    grid[y][x] = TILE_TOXIC_MIASMA;
                }
                if (dist <= 7.5f)
                {
                    grid[y][x] = TILE_PLAZA;
                }
            }
        }

        // Void Resonance Obelisks
        grid[cy - 4][cx - 4] = TILE_ANCIENT_PILLAR;
        grid[cy - 4][cx + 4] = TILE_ANCIENT_PILLAR;
        grid[cy + 4][cx - 4] = TILE_ANCIENT_PILLAR;
        grid[cy + 4][cx + 4] = TILE_ANCIENT_PILLAR;

        return new ZoneMapDto
        {
            Id = "ArenaVoid",
            Name = "🌌 Void Sanctum of Malakor (Pinnacle Arena Tier 16)",
            Subtitle = "Pinnacle Boss: Malakor, The Shadow Devourer",
            Biome = ZoneBiomeType.VoidAbyss,
            LevelRange = "Lv. 85+ (Tier 16)",
            WidthInTiles = w,
            HeightInTiles = h,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            SpawnX = cx * TILE_SIZE,
            SpawnY = (cy + 6) * TILE_SIZE,
            Grid = grid,
            Portals = new List<ZonePortalDto>
            {
                new() { X = cx * TILE_SIZE, Y = (cy + 7) * TILE_SIZE, TargetZone = "SanctuaryHaven", TargetX = 960, TargetY = 960, Name = "🏛️ Return to Haven" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = cx * TILE_SIZE, Y = (cy - 2) * TILE_SIZE, Count = 1, Type = "malakor_boss" },
                new() { X = (cx - 5) * TILE_SIZE, Y = (cy - 2) * TILE_SIZE, Count = 4, Type = "undead_knight" },
                new() { X = (cx + 5) * TILE_SIZE, Y = (cy - 2) * TILE_SIZE, Count = 4, Type = "undead_knight" }
            }
        };
    }

    // 8. VERDANT CANOPY (64x64 - Deep Bioluminescent Forest)
    private static ZoneMapDto GenerateCanopy()
    {
        const int w = 64, h = 64;
        var grid = InitializeGrid(w, h, TILE_FLOOR);
        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int midY = h / 2;
        for (int x = 1; x < w - 1; x++)
        {
            grid[midY][x] = TILE_PATH;
            grid[midY + 1][x] = TILE_PATH;
        }

        // Dense ancient trees and poisonous ponds
        for (int y = 4; y < h - 4; y += 4)
        {
            for (int x = 4; x < w - 4; x += 4)
            {
                if (Math.Abs(y - midY) > 3)
                {
                    grid[y][x] = TILE_ANCIENT_PILLAR;
                    if ((x + y) % 6 == 0) grid[y][x + 1] = TILE_TOXIC_MIASMA;
                }
            }
        }

        return new ZoneMapDto
        {
            Id = "VerdantCanopy",
            Name = "Verdant Canopy",
            Subtitle = "🌲 Ancient Bioluminescent Forest & Spider Brood",
            Biome = ZoneBiomeType.WhisperingPlains,
            LevelRange = "Lv. 9-12",
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            SpawnX = 350,
            SpawnY = midY * TILE_SIZE,
            Grid = grid,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "WhisperingPlains", TargetX = 2650, TargetY = midY * TILE_SIZE, Name = "🌾 Return to Plains" },
                new() { X = (w - 2) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "ForgottenCrypt", TargetX = 550, TargetY = 550, Name = "🏰 Enter Forgotten Crypt" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 800, Y = 800, Count = 8, Type = "spider" },
                new() { X = 2000, Y = 1800, Count = 7, Type = "wolf" },
                new() { X = 1600, Y = 1200, Count = 8, Type = "slime" }
            }
        };
    }

    // 9. HOWLING ICE CAVERNS (60x60 - Glacial Chasm & Ice Crystals)
    private static ZoneMapDto GenerateIceCaverns()
    {
        const int w = 60, h = 60;
        var grid = InitializeGrid(w, h, TILE_FLOOR);
        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int midY = h / 2;
        for (int x = 1; x < w - 1; x++)
        {
            grid[midY][x] = TILE_PATH;
        }

        // Glacial Ice Slippery Patches
        for (int y = 6; y < h - 6; y++)
        {
            for (int x = 6; x < w - 6; x++)
            {
                if (Math.Abs(y - midY) > 2 && (x * y) % 7 == 0)
                {
                    grid[y][x] = TILE_GLACIAL_ICE;
                }
            }
        }

        return new ZoneMapDto
        {
            Id = "HowlingIceCaverns",
            Name = "Howling Ice Caverns",
            Subtitle = "🧊 Subterranean Ice Grotto & Crystal Guardians",
            Biome = ZoneBiomeType.FrostpeakTundra,
            LevelRange = "Lv. 22-26",
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            SpawnX = 350,
            SpawnY = midY * TILE_SIZE,
            Grid = grid,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "FrostpeakTundra", TargetX = 2500, TargetY = midY * TILE_SIZE, Name = "❄️ Return to Tundra" },
                new() { X = (w - 2) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "StormpeakRidge", TargetX = 400, TargetY = midY * TILE_SIZE, Name = "⚡ Climb Stormpeak Ridge" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 800, Y = 900, Count = 8, Type = "frost_golem" },
                new() { X = 1800, Y = 1800, Count = 7, Type = "frost_golem" }
            }
        };
    }

    // 10. OBSIDIAN WASTES (60x60 - Scorched Basalt Wilderness)
    private static ZoneMapDto GenerateObsidianWastes()
    {
        const int w = 60, h = 60;
        var grid = InitializeGrid(w, h, TILE_FLOOR);
        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int midY = h / 2;
        for (int x = 1; x < w - 1; x++)
        {
            grid[midY][x] = TILE_PATH;
            grid[midY + 1][x] = TILE_PATH;
        }

        for (int y = 5; y < h - 5; y += 3)
        {
            for (int x = 5; x < w - 5; x += 3)
            {
                if (Math.Abs(y - midY) > 3 && (x + y) % 4 == 0)
                {
                    grid[y][x] = TILE_BURNT_GROUND;
                }
            }
        }

        return new ZoneMapDto
        {
            Id = "ObsidianWastes",
            Name = "Obsidian Wastes",
            Subtitle = "🌋 Basalt Wilderness & Ash Storms",
            Biome = ZoneBiomeType.MoltenCaldera,
            LevelRange = "Lv. 34-38",
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            SpawnX = 350,
            SpawnY = midY * TILE_SIZE,
            Grid = grid,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "AshenRedoubt", TargetX = 1632, TargetY = 960, Name = "🏰 Return to Redoubt" },
                new() { X = (w - 2) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "MoltenCaldera", TargetX = 400, TargetY = midY * TILE_SIZE, Name = "🔥 Enter Molten Caldera" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 900, Y = 900, Count = 8, Type = "fire_imp" },
                new() { X = 1900, Y = 1900, Count = 7, Type = "magma_golem" }
            }
        };
    }

    // 11. SHIFTING DUNES (60x60 - Desert Canyon & Sand Vortexes)
    private static ZoneMapDto GenerateShiftingDunes()
    {
        const int w = 60, h = 60;
        var grid = InitializeGrid(w, h, TILE_FLOOR);
        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int midY = h / 2;
        for (int x = 1; x < w - 1; x++)
        {
            grid[midY][x] = TILE_PATH;
            grid[midY + 1][x] = TILE_PATH;
        }

        for (int y = 4; y < h - 4; y += 3)
        {
            for (int x = 4; x < w - 4; x += 3)
            {
                if (Math.Abs(y - midY) > 3)
                {
                    grid[y][x] = TILE_SHALLOW_WATER_SAND;
                }
            }
        }

        return new ZoneMapDto
        {
            Id = "ShiftingDunes",
            Name = "Shifting Dunes",
            Subtitle = "🏜️ Endless Desert Canyon & Sand Wyrms",
            Biome = ZoneBiomeType.ForgottenCrypt,
            LevelRange = "Lv. 48-52",
            WidthInTiles = w,
            HeightInTiles = h,
            TileSize = TILE_SIZE,
            WorldWidth = w * TILE_SIZE,
            WorldHeight = h * TILE_SIZE,
            SpawnX = 350,
            SpawnY = midY * TILE_SIZE,
            Grid = grid,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "OasisSanctum", TargetX = 1632, TargetY = 960, Name = "🌴 Return to Oasis" },
                new() { X = (w - 2) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "DreadTombs", TargetX = 550, TargetY = 550, Name = "💀 Enter Dread Tombs" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 900, Y = 900, Count = 8, Type = "undead_knight" },
                new() { X = 2000, Y = 2000, Count = 8, Type = "skeleton" }
            }
        };
    }

    private static void CarveCorridor(List<List<int>> grid, int x1, int y1, int x2, int y2)
    {
        int curX = x1;
        int curY = y1;

        while (curX != x2)
        {
            grid[curY][curX] = TILE_PATH;
            grid[curY + 1][curX] = TILE_PATH;
            curX += (x2 > curX) ? 1 : -1;
        }

        while (curY != y2)
        {
            grid[curY][curX] = TILE_PATH;
            grid[curY][curX + 1] = TILE_PATH;
            curY += (y2 > curY) ? 1 : -1;
        }
    }

    private static List<List<int>> InitializeGrid(int width, int height, int fillTile)
    {
        var grid = new List<List<int>>(height);
        for (int y = 0; y < height; y++)
        {
            var row = new List<int>(width);
            for (int x = 0; x < width; x++)
            {
                row.Add(fillTile);
            }
            grid.Add(row);
        }
        return grid;
    }
}
