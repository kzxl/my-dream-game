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
            "SanctuaryHaven" => GenerateHaven(),
            "WhisperingPlains" => GeneratePlains(),
            "FrostpeakTundra" => GenerateTundra(),
            "MoltenCaldera" => GenerateCaldera(),
            "ForgottenCrypt" => GenerateCrypt(),
            _ => GenerateHaven()
        };
    }

    // 1. SANCTUARY HAVEN (Vibrant Town Plaza & Perimeter Stone Walls)
    private static ZoneMapDto GenerateHaven()
    {
        const int w = 32, h = 32;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        // Natural stone perimeter walls
        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int cx = w / 2, cy = h / 2;

        // Central Stone Plaza
        for (int y = cy - 6; y <= cy + 6; y++)
        {
            for (int x = cx - 6; x <= cx + 6; x++)
            {
                if (Math.Abs(x - cx) + Math.Abs(y - cy) <= 9)
                {
                    grid[y][x] = TILE_PLAZA;
                }
            }
        }

        // Town Fountain / Pillars in corners of plaza
        grid[cy - 4][cx - 4] = TILE_ANCIENT_PILLAR;
        grid[cy - 4][cx + 4] = TILE_ANCIENT_PILLAR;
        grid[cy + 4][cx - 4] = TILE_ANCIENT_PILLAR;
        grid[cy + 4][cx + 4] = TILE_ANCIENT_PILLAR;

        // East Gate and Main Path
        for (int x = cx + 5; x < w - 1; x++)
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
                new() { X = (cx - 5) * TILE_SIZE, Y = (cy - 2) * TILE_SIZE, Type = "chest" },
                new() { X = (cx + 5) * TILE_SIZE, Y = (cy - 2) * TILE_SIZE, Type = "barrel" }
            }
        };
    }

    // 2. WHISPERING PLAINS (Organic Spline River, Sandbars & Stone Bridges)
    private static ZoneMapDto GeneratePlains()
    {
        const int w = 44, h = 44;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int riverBaseX = w / 2;
        var bridgeYPositions = new List<int> { 12, 22, 32 };

        for (int y = 1; y < h - 1; y++)
        {
            // Organic multi-sine wave river curve
            double wave = Math.Sin(y / 4.2) * 4.5 + Math.Cos(y / 2.1) * 1.5;
            int rx = (int)Math.Round(riverBaseX + wave);

            // Shallow Sand Borders
            if (rx - 2 >= 1) grid[y][rx - 2] = TILE_SHALLOW_WATER_SAND;
            if (rx + 2 < w - 1) grid[y][rx + 2] = TILE_SHALLOW_WATER_SAND;

            // Deep River Water
            grid[y][rx - 1] = TILE_WATER_DEEP;
            grid[y][rx] = TILE_WATER_DEEP;
            grid[y][rx + 1] = TILE_WATER_DEEP;
        }

        // Carve Stone Bridges over River
        foreach (int by in bridgeYPositions)
        {
            for (int dy = -1; dy <= 1; dy++)
            {
                int y = by + dy;
                for (int x = riverBaseX - 6; x <= riverBaseX + 6; x++)
                {
                    if (grid[y][x] == TILE_WATER_DEEP || grid[y][x] == TILE_SHALLOW_WATER_SAND)
                    {
                        grid[y][x] = TILE_PATH;
                    }
                }
            }
        }

        // Spline Path from West Portal to East Portal
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
            Subtitle = "🌾 Vast Wilderness with Winding River & Roaming Beasts",
            Biome = ZoneBiomeType.WhisperingPlains,
            LevelRange = "Lv. 5-10",
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
            SpawnX = 180,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "SanctuaryHaven", TargetX = 1250, TargetY = 672, Name = "🌿 Back to Haven" },
                new() { X = (w - 2) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "ForgottenCrypt", TargetX = 180, TargetY = 960, Name = "🏰 To Forgotten Crypt" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 500, Y = 500, Count = 5, Type = "slime" },
                new() { X = 550, Y = 1200, Count = 6, Type = "wolf" },
                new() { X = 1400, Y = 600, Count = 7, Type = "goblin" },
                new() { X = 1500, Y = 1350, Count = 5, Type = "wolf" }
            }
        };
    }

    // 3. FROSTPEAK TUNDRA (Glacial Crevasses, Deep Snow & Slippery Ice)
    private static ZoneMapDto GenerateTundra()
    {
        const int w = 42, h = 42;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        // Glacial Ice Patches & Deep Snow Crevasses
        for (int y = 5; y < h - 5; y++)
        {
            for (int x = 5; x < w - 5; x++)
            {
                double noise = Math.Sin(x * 0.3) * Math.Cos(y * 0.35);
                if (noise > 0.45)
                {
                    grid[y][x] = TILE_GLACIAL_ICE; // Slippery Ice Hazard
                }
                else if (noise < -0.40)
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
            Subtitle = "❄️ Permafrost Glacier (Blizzards & Freezing Terrain)",
            Biome = ZoneBiomeType.FrostpeakTundra,
            LevelRange = "Lv. 10-18",
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
            SpawnX = 180,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "WhisperingPlains", TargetX = 1800, TargetY = 960, Name = "🌾 To Plains" },
                new() { X = (w - 2) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "MoltenCaldera", TargetX = 180, TargetY = 960, Name = "🔥 To Molten Caldera" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 600, Y = 600, Count = 6, Type = "frost_golem" },
                new() { X = 1300, Y = 1100, Count = 7, Type = "ice_elemental" }
            }
        };
    }

    // 4. MOLTEN CALDERA (Branching Lava Fissures, Scorched Earth & Obsidian Pillars)
    private static ZoneMapDto GenerateCaldera()
    {
        const int w = 44, h = 44;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int cx = w / 2, cy = h / 2;

        // Central Magma Lake with Obsidian Island
        for (int y = cy - 8; y <= cy + 8; y++)
        {
            for (int x = cx - 8; x <= cx + 8; x++)
            {
                double dist = Math.Sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
                if (dist <= 7.5 && dist >= 3.5)
                {
                    grid[y][x] = TILE_LAVA; // Lava Hazard Ring
                }
                else if (dist > 7.5 && dist <= 9.0)
                {
                    grid[y][x] = TILE_BURNT_GROUND; // Scorched Earth
                }
            }
        }

        // Obsidian Pillars around Caldera Ring
        grid[cy - 5][cx - 5] = TILE_ANCIENT_PILLAR;
        grid[cy - 5][cx + 5] = TILE_ANCIENT_PILLAR;
        grid[cy + 5][cx - 5] = TILE_ANCIENT_PILLAR;
        grid[cy + 5][cx + 5] = TILE_ANCIENT_PILLAR;

        // Natural Stone Bridges to Island
        for (int x = cx - 8; x <= cx + 8; x++)
        {
            grid[cy][x] = TILE_PATH;
            grid[cy + 1][x] = TILE_PATH;
        }

        int midY = h / 2;
        return new ZoneMapDto
        {
            Id = "MoltenCaldera",
            Name = "Molten Caldera",
            Subtitle = "🔥 Volcanic Crater (Lava Fissures & Scorched Earth)",
            Biome = ZoneBiomeType.MoltenCaldera,
            LevelRange = "Lv. 18-28",
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
            SpawnX = 180,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "FrostpeakTundra", TargetX = 1800, TargetY = 960, Name = "❄️ To Frostpeak" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 650, Y = 650, Count = 6, Type = "fire_imp" },
                new() { X = 1400, Y = 1350, Count = 6, Type = "magma_golem" }
            }
        };
    }

    // 5. FORGOTTEN CRYPT (Organic BSP Dungeon with Beveled Corners & Toxic Miasma)
    private static ZoneMapDto GenerateCrypt()
    {
        const int w = 42, h = 42;
        var grid = InitializeGrid(w, h, TILE_WALL);

        var rooms = new List<(int x, int y, int rw, int rh)>
        {
            (4, 4, 10, 10),
            (24, 4, 12, 10),
            (4, 24, 10, 12),
            (22, 22, 14, 14),
            (14, 14, 12, 12)
        };

        // Carve organic rooms with beveled corners & pillars
        foreach (var r in rooms)
        {
            for (int y = r.y; y < r.y + r.rh; y++)
            {
                for (int x = r.x; x < r.x + r.rw; x++)
                {
                    // Bevel corners
                    bool isCorner = (x == r.x && y == r.y) || (x == r.x + r.rw - 1 && y == r.y) ||
                                    (x == r.x && y == r.y + r.rh - 1) || (x == r.x + r.rw - 1 && y == r.y + r.rh - 1);
                    if (!isCorner)
                    {
                        grid[y][x] = TILE_FLOOR;
                    }
                }
            }

            // Central Pillars in big rooms
            if (r.rw >= 12 && r.rh >= 12)
            {
                grid[r.y + 3][r.x + 3] = TILE_ANCIENT_PILLAR;
                grid[r.y + 3][r.x + r.rw - 4] = TILE_ANCIENT_PILLAR;
                grid[r.y + r.rh - 4][r.x + 3] = TILE_ANCIENT_PILLAR;
                grid[r.y + r.rh - 4][r.x + r.rw - 4] = TILE_ANCIENT_PILLAR;

                // Toxic miasma pool in room 4
                if (r.x == 22)
                {
                    grid[r.y + r.rh / 2][r.x + r.rw / 2] = TILE_TOXIC_MIASMA;
                    grid[r.y + r.rh / 2 + 1][r.x + r.rw / 2] = TILE_TOXIC_MIASMA;
                }
            }
        }

        // Corridors between rooms
        CarveCorridor(grid, 9, 9, 20, 9);
        CarveCorridor(grid, 20, 9, 20, 20);
        CarveCorridor(grid, 9, 20, 20, 20);
        CarveCorridor(grid, 9, 9, 9, 20);
        CarveCorridor(grid, 20, 20, 28, 28);

        return new ZoneMapDto
        {
            Id = "ForgottenCrypt",
            Name = "Forgotten Crypt",
            Subtitle = "🏰 Ancient Underground Catacombs (Toxic Miasma & Undead)",
            Biome = ZoneBiomeType.ForgottenCrypt,
            LevelRange = "Lv. 8-15",
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
            SpawnX = 6 * TILE_SIZE,
            SpawnY = 6 * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 5 * TILE_SIZE, Y = 5 * TILE_SIZE, TargetZone = "WhisperingPlains", TargetX = 1800, TargetY = 960, Name = "🌾 Back to Plains" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 1200, Y = 500, Count = 6, Type = "skeleton" },
                new() { X = 500, Y = 1300, Count = 6, Type = "zombie" },
                new() { X = 1350, Y = 1350, Count = 8, Type = "undead_knight" }
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
