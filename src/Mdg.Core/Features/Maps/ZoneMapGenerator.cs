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
    public const int TILE_CAMOUFLAGE_BUSH = 14;
    public const int TILE_DESTRUCTIBLE_WALL = 15;

    public static ZoneMapDto GenerateZone(string zoneId, int? seed = null)
    {
        if (zoneId.StartsWith("EndlessSpire_F") && int.TryParse(zoneId["EndlessSpire_F".Length..], out int floor))
        {
            return EndlessSpireManager.GenerateSpireFloor(floor);
        }

        int actualSeed = seed ?? Math.Abs(zoneId.GetHashCode());

        var map = zoneId switch
        {
            // Act 1
            "SanctuaryHaven" => GenerateHaven(actualSeed),
            "WhisperingPlains" => GeneratePlains(actualSeed),
            "VerdantCanopy" => GenerateCanopy(actualSeed),
            "ForgottenCrypt" => GenerateCrypt(actualSeed),

            // Act 2
            "GlacialOutpost" => GenerateHaven(actualSeed),
            "FrostpeakTundra" => GenerateTundra(actualSeed),
            "HowlingIceCaverns" => GenerateIceCaverns(actualSeed),
            "StormpeakRidge" => GenerateStormpeak(actualSeed),

            // Act 3
            "AshenRedoubt" => GenerateHaven(actualSeed),
            "ObsidianWastes" => GenerateObsidianWastes(actualSeed),
            "MoltenCaldera" => GenerateCaldera(actualSeed),
            "InfernalHeart" => GenerateCaldera(actualSeed),

            // Act 4
            "OasisSanctum" => GenerateHaven(actualSeed),
            "ShiftingDunes" => GenerateShiftingDunes(actualSeed),
            "DreadTombs" => GenerateCrypt(actualSeed),
            "NecropolisOfSouls" => GenerateCrypt(actualSeed),

            // Act 5 & Pinnacle
            "AethelisCitadel" => GenerateHaven(actualSeed),
            "VoidAbyss" => GenerateVoidAbyss(actualSeed),
            "CitadelOfTheVoid" => GenerateVoidAbyss(actualSeed),
            "ArenaCaldera" => GenerateArenaCaldera(),
            "ArenaGlacial" => GenerateArenaGlacial(),
            "ArenaVoid" => GenerateArenaVoid(),
            "SpireArena" => EndlessSpireManager.GenerateSpireFloor(1),

            _ => GenerateHaven(actualSeed)
        };

        // Guarantee 100% path connectivity to all portals
        int spawnTileX = (int)Math.Round(map.SpawnX / TILE_SIZE);
        int spawnTileY = (int)Math.Round(map.SpawnY / TILE_SIZE);
        MapConnectivityValidator.EnsureAllPortalsReachable(map.Grid, spawnTileX, spawnTileY, map.Portals, TILE_SIZE);

        return map;
    }

    // 1. SANCTUARY HAVEN (64x64: Vibrant Town Plaza, Crafting District, Gardens & Paved Paths)
    private static ZoneMapDto GenerateHaven(int seed)
    {
        const int w = 64, h = 64;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int cx = w / 2, cy = h / 2;

        // Central Grand Stone Plaza
        for (int y = cy - 12; y <= cy + 12; y++)
        {
            for (int x = cx - 12; x <= cx + 12; x++)
            {
                if (Math.Abs(x - cx) + Math.Abs(y - cy) <= 16)
                {
                    grid[y][x] = TILE_PLAZA;
                }
            }
        }

        // Town Fountain / Stone Pillars in corners of plaza
        grid[cy - 8][cx - 8] = TILE_ANCIENT_PILLAR;
        grid[cy - 8][cx + 8] = TILE_ANCIENT_PILLAR;
        grid[cy + 8][cx - 8] = TILE_ANCIENT_PILLAR;
        grid[cy + 8][cx + 8] = TILE_ANCIENT_PILLAR;

        // North Sacred Lotus Pond & Garden
        for (int py = cy - 22; py <= cy - 15; py++)
        {
            for (int px = cx - 10; px <= cx + 10; px++)
            {
                double dist = Math.Sqrt((px - cx) * (px - cx) + (py - (cy - 18)) * (py - (cy - 18)));
                if (dist <= 7.0)
                {
                    grid[py][px] = dist <= 4.5 ? TILE_WATER_DEEP : TILE_SHALLOW_WATER_SAND;
                }
            }
        }

        // Garden Bushes (Tile 14) for stealth meditation
        for (int dy = -4; dy <= 4; dy++)
        {
            grid[cy + dy][cx - 16] = TILE_CAMOUFLAGE_BUSH;
            grid[cy + dy][cx + 16] = TILE_CAMOUFLAGE_BUSH;
        }

        // East Gate and Main Path
        for (int x = 1; x < w - 1; x++)
        {
            grid[cy][x] = TILE_PATH;
            grid[cy + 1][x] = TILE_PATH;
        }

        // South Gate and Path
        for (int y = 1; y < h - 1; y++)
        {
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
                new() { X = (w - 3) * TILE_SIZE, Y = cy * TILE_SIZE, TargetZone = "WhisperingPlains", TargetX = 350, TargetY = cy * TILE_SIZE, Name = "🌀 To Whispering Plains" },
                new() { X = cx * TILE_SIZE, Y = (h - 3) * TILE_SIZE, TargetZone = "ForgottenCrypt", TargetX = 400, TargetY = 400, Name = "🏰 To Forgotten Crypt" }
            },
            Npcs = new List<ZoneNpcDto>
            {
                new() { X = (cx - 6) * TILE_SIZE, Y = (cy - 4) * TILE_SIZE, Name = "Doran (Blacksmith)", Title = "Master Blacksmith", Color = "#e5c07b" },
                new() { X = cx * TILE_SIZE, Y = (cy - 6) * TILE_SIZE, Name = "Elder Aethel", Title = "High Elder Sage", Color = "#61afef" },
                new() { X = (cx - 4) * TILE_SIZE, Y = (cy - 4) * TILE_SIZE, Name = "Kaelen (Vault Keeper)", Title = "Keeper of the Vault", Color = "#98c379" },
                new() { X = (cx + 4) * TILE_SIZE, Y = (cy - 4) * TILE_SIZE, Name = "Lyra (Astromancer)", Title = "Astromancer of the Void", Color = "#c678dd" },
                new() { X = (cx + 6) * TILE_SIZE, Y = (cy + 2) * TILE_SIZE, Name = "Mira (Beastmaster)", Title = "Companion Beastmaster", Color = "#00f2fe" }
            },
            Dummies = new List<ZoneDummyDto>
            {
                new() { X = (cx + 4) * TILE_SIZE, Y = (cy + 7) * TILE_SIZE, Name = "Training Dummy (Alpha)" },
                new() { X = (cx + 7) * TILE_SIZE, Y = (cy + 7) * TILE_SIZE, Name = "Training Dummy (Beta)" }
            },
            Props = new List<ZonePropDto>
            {
                new() { X = cx * TILE_SIZE, Y = cy * TILE_SIZE, Type = "campfire" },
                new() { X = (cx - 8) * TILE_SIZE, Y = (cy - 4) * TILE_SIZE, Type = "chest" },
                new() { X = (cx + 8) * TILE_SIZE, Y = (cy - 4) * TILE_SIZE, Type = "barrel" },
                new() { X = (cx - 10) * TILE_SIZE, Y = (cy - 7) * TILE_SIZE, Type = "oak_tree" },
                new() { X = (cx + 10) * TILE_SIZE, Y = (cy - 7) * TILE_SIZE, Type = "cherry_tree" },
                new() { X = (cx - 10) * TILE_SIZE, Y = (cy + 7) * TILE_SIZE, Type = "cherry_tree" },
                new() { X = (cx + 10) * TILE_SIZE, Y = (cy + 7) * TILE_SIZE, Type = "oak_tree" }
            },
            Pois = new List<ZonePoiDto>
            {
                new()
                {
                    Id = "Haven_Sanctuary_Shrine",
                    Type = "shrine",
                    Name = "🌿 Ancient Shrine of Serenity",
                    Description = "Blessing of Aethelis: +15% Life and Mana recovery for 120s.",
                    X = (cx - 6) * TILE_SIZE,
                    Y = (cy + 4) * TILE_SIZE,
                    BuffType = "SerenityWard",
                    BuffDuration = 120,
                    Color = "#2ecc71",
                    Icon = "🌿"
                }
            }
        };
    }

    // 2. WHISPERING PLAINS (128x128: Organic Spline River, Sandbars, Camouflage Bushes & Destructible Shortcut Barricades)
    private static ZoneMapDto GeneratePlains(int seed)
    {
        const int w = 128, h = 128;
        var grid = InitializeGrid(w, h, TILE_FLOOR);
        var rng = new Random(seed);
        var noise = new FastNoiseLite(seed);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int riverBaseX = w / 2;
        var bridgeYPositions = new List<int> { 25, 50, 75, 100 };

        for (int y = 1; y < h - 1; y++)
        {
            // Organic multi-sine river curve influenced by noise
            double wave = Math.Sin(y / 9.0) * 11.0 + Math.Cos(y / 4.5) * 4.0 + noise.GetNoise(y * 0.1f, 10f) * 6.0;
            int rx = (int)Math.Round(riverBaseX + wave);

            if (rx - 3 >= 1) grid[y][rx - 3] = TILE_SHALLOW_WATER_SAND;
            if (rx + 3 < w - 1) grid[y][rx + 3] = TILE_SHALLOW_WATER_SAND;

            grid[y][rx - 2] = TILE_WATER_DEEP;
            grid[y][rx - 1] = TILE_WATER_DEEP;
            grid[y][rx] = TILE_WATER_DEEP;
            grid[y][rx + 1] = TILE_WATER_DEEP;
            grid[y][rx + 2] = TILE_WATER_DEEP;
        }

        // Stone Bridges over River
        foreach (int by in bridgeYPositions)
        {
            for (int dy = -1; dy <= 1; dy++)
            {
                int y = by + dy;
                for (int x = riverBaseX - 15; x <= riverBaseX + 15; x++)
                {
                    if (grid[y][x] == TILE_WATER_DEEP || grid[y][x] == TILE_SHALLOW_WATER_SAND)
                    {
                        grid[y][x] = TILE_PATH;
                    }
                }
            }
        }

        // Camouflage Ambush Bushes (Tile 14) placed procedurally via Noise
        for (int cy = 8; cy < h - 8; cy += 6)
        {
            for (int cx = 8; cx < w - 8; cx += 6)
            {
                if (grid[cy][cx] == TILE_FLOOR && noise.GetNoise(cx * 0.15f, cy * 0.15f) > 0.35f)
                {
                    for (int dy = -1; dy <= 1; dy++)
                    {
                        for (int dx = -1; dx <= 1; dx++)
                        {
                            if (grid[cy + dy][cx + dx] == TILE_FLOOR && rng.NextDouble() < 0.75)
                            {
                                grid[cy + dy][cx + dx] = TILE_CAMOUFLAGE_BUSH;
                            }
                        }
                    }
                }
            }
        }

        // Destructible Barricades (Tile 15) blocking shortcut passages
        for (int i = 0; i < 5; i++)
        {
            int bx = 25 + i * 18;
            int by = 35 + (i % 2) * 45;
            if (grid[by][bx] == TILE_FLOOR)
            {
                grid[by][bx] = TILE_DESTRUCTIBLE_WALL;
                grid[by + 1][bx] = TILE_DESTRUCTIBLE_WALL;
            }
        }

        // Main Highway Spline Path
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
            Subtitle = "🌾 Vast Wilderness with Winding River, Beast Outposts, Shrines & Camouflage Bushes",
            Biome = ZoneBiomeType.WhisperingPlains,
            LevelRange = "Lv. 5-12",
            Hazard = new EnvironmentalHazardConfig
            {
                HazardName = "Wild Winds",
                Description = "Dense camouflage bushes grant 80% stealth and +50% Ambush Strike damage!",
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
            SpawnX = 250,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "SanctuaryHaven", TargetX = 2800, TargetY = 1536, Name = "🌿 Back to Haven" },
                new() { X = (w - 3) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "FrostpeakTundra", TargetX = 250, TargetY = midY * TILE_SIZE, Name = "❄️ To Frostpeak Tundra" },
                new() { X = (w / 2) * TILE_SIZE, Y = (h - 3) * TILE_SIZE, TargetZone = "ForgottenCrypt", TargetX = 350, TargetY = 350, Name = "🏰 To Forgotten Crypt" }
            },
            Npcs = new List<ZoneNpcDto>
            {
                new() { X = 350, Y = midY * TILE_SIZE + 80, Name = "Valen (Scout)", Title = "Trinh Sát Tiền Đồn", Color = "#e06c75" }
            },
            Props = new List<ZonePropDto>
            {
                new() { X = 800, Y = 1950, Type = "pine_tree" },
                new() { X = 1200, Y = 2400, Type = "autumn_tree" },
                new() { X = 1600, Y = 1800, Type = "tall_grass" },
                new() { X = 2000, Y = 2600, Type = "flowers_red" },
                new() { X = 2600, Y = 2100, Type = "mossy_rock" },
                new() { X = 3200, Y = 1900, Type = "pine_tree" }
            },
            Pois = new List<ZonePoiDto>
            {
                new()
                {
                    Id = "Plains_Tempest_Shrine",
                    Type = "shrine",
                    Name = "⚡ Tempest Aether Shrine",
                    Description = "Calls down thunderbolts on every attack and grants +35% Movement Speed for 60s.",
                    X = 1200,
                    Y = 1200,
                    BuffType = "TempestAura",
                    BuffDuration = 60,
                    Color = "#00f2fe",
                    Icon = "⚡"
                },
                new()
                {
                    Id = "Plains_Solar_Shrine",
                    Type = "shrine",
                    Name = "🔥 Solar Flare Shrine",
                    Description = "Blazes with a solar aura dealing 120 Fire Damage per second for 60s.",
                    X = 3400,
                    Y = 1400,
                    BuffType = "SolarFlare",
                    BuffDuration = 60,
                    Color = "#ff7675",
                    Icon = "🔥"
                },
                new()
                {
                    Id = "Plains_Void_Monolith",
                    Type = "monolith",
                    Name = "🔮 Corrupted Void Monolith",
                    Description = "Awaken the monolith to survive 3 monster waves for guaranteed Genesis Catalysts!",
                    X = 2400,
                    Y = 3200,
                    BuffType = "None",
                    Color = "#9b59b6",
                    Icon = "🔮",
                    WaveCount = 3
                },
                new()
                {
                    Id = "Plains_SubCave_Goblin",
                    Type = "sub_cave",
                    Name = "🚪 Sub-Cave: Goblin Warren",
                    Description = "Enter the subterranean goblin warren to hunt the Alpha Chieftain.",
                    X = 1600,
                    Y = 3400,
                    BuffType = "None",
                    Color = "#e67e22",
                    Icon = "🚪",
                    TargetSubZone = "ForgottenCrypt"
                }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 800, Y = 800, Count = 7, Type = "slime" },
                new() { X = 1200, Y = 2200, Count = 8, Type = "wolf" },
                new() { X = 2800, Y = 1000, Count = 9, Type = "goblin" },
                new() { X = 3200, Y = 2800, Count = 8, Type = "wolf" }
            }
        };
    }

    // 3. FORGOTTEN CRYPT (96x96: Graph Topology, Delaunay MST, Cellular Automata & Multi-Objective Evaluator)
    private static ZoneMapDto GenerateCrypt(int seed)
    {
        const int w = 96, h = 96;
        var hazard = new EnvironmentalHazardConfig
        {
            HazardName = "Curse of Miasma",
            Description = "Deadly chướng khí độc. Stepping on Toxic Miasma deals 30 Chaos Dmg/s. Reduces Flask recovery if Chaos Resistance < 50%!",
            ResistanceRequired = "Chaos",
            Threshold = 50,
            PenaltyType = "FlaskDecay"
        };

        return DungeonFitnessEvaluator.GenerateOptimizedDungeon(
            zoneId: "ForgottenCrypt",
            zoneName: "Forgotten Crypt",
            subtitle: "🏰 Ancient Multi-Chamber Catacombs (Topology-First & Cellular Smoothed)",
            biome: ZoneBiomeType.ForgottenCrypt,
            levelRange: "Lv. 10-18",
            hazard: hazard,
            mapWidth: w,
            mapHeight: h,
            baseSeed: seed,
            candidateCount: 4);
    }

    // 4. FROSTPEAK TUNDRA (128x128: Permafrost Glacier, Slippery Glacial Ice & Deep Snow Drifts)
    private static ZoneMapDto GenerateTundra(int seed)
    {
        const int w = 128, h = 128;
        var grid = InitializeGrid(w, h, TILE_FLOOR);
        var noise = new FastNoiseLite(seed);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        for (int y = 6; y < h - 6; y++)
        {
            for (int x = 6; x < w - 6; x++)
            {
                float n = noise.GetFractalNoise(x * 0.08f, y * 0.08f, 3);
                if (n > 0.38f)
                {
                    grid[y][x] = TILE_GLACIAL_ICE; // Slippery Ice Hazard (+Speed & Inertial Drift)
                }
                else if (n < -0.42f)
                {
                    grid[y][x] = TILE_DEEP_SNOW; // Deep snow drift
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
            SpawnX = 250,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "WhisperingPlains", TargetX = 5800, TargetY = midY * TILE_SIZE, Name = "🌾 To Plains" },
                new() { X = (w - 3) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "MoltenCaldera", TargetX = 250, TargetY = midY * TILE_SIZE, Name = "🔥 To Molten Caldera" }
            },
            Pois = new List<ZonePoiDto>
            {
                new()
                {
                    Id = "Tundra_Glacial_Shrine",
                    Type = "shrine",
                    Name = "❄️ Glacial Ward Shrine",
                    Description = "Grants 300 Ice Shield Ward and freezeproof immunity for 60s.",
                    X = 2400,
                    Y = 1800,
                    BuffType = "GlacialWard",
                    BuffDuration = 60,
                    Color = "#74b9ff",
                    Icon = "❄️"
                }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 1400, Y = 1400, Count = 7, Type = "frost_golem" },
                new() { X = 3600, Y = 3200, Count = 8, Type = "frost_golem" }
            }
        };
    }

    // 5. MOLTEN CALDERA (128x128: Volcanic Crater, Magma Pools & Destructible Obsidian Walls)
    private static ZoneMapDto GenerateCaldera(int seed)
    {
        const int w = 128, h = 128;
        var grid = InitializeGrid(w, h, TILE_FLOOR);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        int cx = w / 2, cy = h / 2;

        // Central Magma Lake with Obsidian Island
        for (int y = cy - 24; y <= cy + 24; y++)
        {
            for (int x = cx - 24; x <= cx + 24; x++)
            {
                double dist = Math.Sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
                if (dist <= 22.0 && dist >= 10.0)
                {
                    grid[y][x] = TILE_LAVA; // Boiling Lava
                }
                else if (dist > 22.0 && dist <= 26.0)
                {
                    grid[y][x] = TILE_BURNT_GROUND; // Scorched Earth
                }
            }
        }

        // Obsidian Pillars around Caldera Ring
        grid[cy - 16][cx - 16] = TILE_ANCIENT_PILLAR;
        grid[cy - 16][cx + 16] = TILE_ANCIENT_PILLAR;
        grid[cy + 16][cx - 16] = TILE_ANCIENT_PILLAR;
        grid[cy + 16][cx + 16] = TILE_ANCIENT_PILLAR;

        // Breakable Obsidian Barricades (Tile 15)
        for (int i = 0; i < 6; i++)
        {
            int bx = cx - 15 + i * 6;
            grid[cy - 8][bx] = TILE_DESTRUCTIBLE_WALL;
            grid[cy + 8][bx] = TILE_DESTRUCTIBLE_WALL;
        }

        // Natural Stone Bridges to Island
        for (int x = cx - 24; x <= cx + 24; x++)
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
            SpawnX = 250,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "FrostpeakTundra", TargetX = 5800, TargetY = midY * TILE_SIZE, Name = "❄️ To Frostpeak" },
                new() { X = (w - 3) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "StormpeakRidge", TargetX = 250, TargetY = midY * TILE_SIZE, Name = "⚡ To Stormpeak Ridge" }
            },
            Pois = new List<ZonePoiDto>
            {
                new()
                {
                    Id = "Caldera_Greed_Shrine",
                    Type = "shrine",
                    Name = "💎 Greed Catalyst Shrine",
                    Description = "Triples all Genesis Currency drop rates for 60s!",
                    X = cx * TILE_SIZE,
                    Y = (cy - 12) * TILE_SIZE,
                    BuffType = "GreedCatalyst",
                    BuffDuration = 60,
                    Color = "#f1c40f",
                    Icon = "💎"
                }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 1400, Y = 1400, Count = 7, Type = "fire_imp" },
                new() { X = 4200, Y = 4200, Count = 8, Type = "magma_golem" }
            }
        };
    }

    // 6. STORMPEAK RIDGE (128x128: High Mountain Peaks, Static Lightning Leylines & Chasms)
    private static ZoneMapDto GenerateStormpeak(int seed)
    {
        const int w = 128, h = 128;
        var grid = InitializeGrid(w, h, TILE_FLOOR);
        var noise = new FastNoiseLite(seed);

        for (int x = 0; x < w; x++) { grid[0][x] = TILE_WALL; grid[h - 1][x] = TILE_WALL; }
        for (int y = 0; y < h; y++) { grid[y][0] = TILE_WALL; grid[y][w - 1] = TILE_WALL; }

        for (int y = 8; y < h - 8; y++)
        {
            for (int x = 8; x < w - 8; x++)
            {
                float n = noise.GetFractalNoise(x * 0.09f, y * 0.09f, 3);
                if (n > 0.42f)
                {
                    grid[y][x] = TILE_CHASM; // Abyssal Chasm (unwalkable)
                }
                else if (n < -0.36f)
                {
                    grid[y][x] = TILE_ELECTRIC_GROUND; // Static Charge Leyline (+20% Cast Speed)
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
            SpawnX = 250,
            SpawnY = midY * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 120, Y = midY * TILE_SIZE, TargetZone = "MoltenCaldera", TargetX = 5800, TargetY = midY * TILE_SIZE, Name = "🔥 To Caldera" },
                new() { X = (w - 3) * TILE_SIZE, Y = midY * TILE_SIZE, TargetZone = "VoidAbyss", TargetX = 350, TargetY = midY * TILE_SIZE, Name = "🌌 To Void Abyss" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = 1600, Y = 1600, Count = 7, Type = "goblin" },
                new() { X = 4000, Y = 3600, Count = 8, Type = "undead_knight" }
            }
        };
    }

    // 7. VOID ABYSS (96x96: Cosmic Void Arena, Fractured Floating Islands)
    private static ZoneMapDto GenerateVoidAbyss(int seed)
    {
        const int w = 96, h = 96;
        var grid = InitializeGrid(w, h, TILE_CHASM); // Void chasm base

        int cx = w / 2, cy = h / 2;

        // Grand Central Void Island
        for (int y = cy - 22; y <= cy + 22; y++)
        {
            for (int x = cx - 22; x <= cx + 22; x++)
            {
                double dist = Math.Sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
                if (dist <= 20.0)
                {
                    grid[y][x] = TILE_FLOOR;
                }
            }
        }

        // Inner Void Ritual Circle
        for (int y = cy - 10; y <= cy + 10; y++)
        {
            for (int x = cx - 10; x <= cx + 10; x++)
            {
                if (Math.Abs(x - cx) + Math.Abs(y - cy) <= 12)
                {
                    grid[y][x] = TILE_PLAZA;
                }
            }
        }

        // Ancient Void Pillars
        grid[cy - 10][cx - 10] = TILE_ANCIENT_PILLAR;
        grid[cy - 10][cx + 10] = TILE_ANCIENT_PILLAR;
        grid[cy + 10][cx - 10] = TILE_ANCIENT_PILLAR;
        grid[cy + 10][cx + 10] = TILE_ANCIENT_PILLAR;

        // Bridge to West Spawn
        for (int x = 4; x <= cx - 20; x++)
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
            SpawnX = 8 * TILE_SIZE,
            SpawnY = cy * TILE_SIZE,
            Portals = new List<ZonePortalDto>
            {
                new() { X = 6 * TILE_SIZE, Y = cy * TILE_SIZE, TargetZone = "StormpeakRidge", TargetX = 5800, TargetY = 3000, Name = "⚡ To Stormpeak" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = cx * TILE_SIZE, Y = cy * TILE_SIZE, Count = 1, Type = "boss" },
                new() { X = (cx - 12) * TILE_SIZE, Y = (cy - 12) * TILE_SIZE, Count = 6, Type = "undead_knight" }
            }
        };
    }

    // 8. ARENA CALDERA - PINNACLE ARENA (Tier 14: Ignis, The Molten Archon)
    private static ZoneMapDto GenerateArenaCaldera()
    {
        const int w = 32, h = 32;
        var grid = InitializeGrid(w, h, TILE_LAVA);
        int cx = w / 2, cy = h / 2;

        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                float dist = MathF.Sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
                if (dist <= 11f) grid[y][x] = TILE_BURNT_GROUND;
                if (dist <= 8f) grid[y][x] = TILE_PLAZA;
            }
        }

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
                new() { X = cx * TILE_SIZE, Y = (cy + 8) * TILE_SIZE, TargetZone = "SanctuaryHaven", TargetX = 1536, TargetY = 1536, Name = "🏛️ Return to Haven" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = cx * TILE_SIZE, Y = (cy - 2) * TILE_SIZE, Count = 1, Type = "ignis_boss" }
            }
        };
    }

    // 9. ARENA GLACIAL - PINNACLE ARENA (Tier 15: Vael, The Frost Sovereign)
    private static ZoneMapDto GenerateArenaGlacial()
    {
        const int w = 32, h = 32;
        var grid = InitializeGrid(w, h, TILE_GLACIAL_ICE);
        int cx = w / 2, cy = h / 2;

        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                float dist = MathF.Sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
                if (dist <= 11f) grid[y][x] = TILE_DEEP_SNOW;
                if (dist <= 8f) grid[y][x] = TILE_PLAZA;
            }
        }

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
                new() { X = cx * TILE_SIZE, Y = (cy + 8) * TILE_SIZE, TargetZone = "SanctuaryHaven", TargetX = 1536, TargetY = 1536, Name = "🏛️ Return to Haven" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = cx * TILE_SIZE, Y = (cy - 2) * TILE_SIZE, Count = 1, Type = "vael_boss" }
            }
        };
    }

    // 10. ARENA VOID - PINNACLE ARENA (Tier 16: Malakor, The Shadow Devourer)
    private static ZoneMapDto GenerateArenaVoid()
    {
        const int w = 32, h = 32;
        var grid = InitializeGrid(w, h, TILE_CHASM);
        int cx = w / 2, cy = h / 2;

        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                float dist = MathF.Sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
                if (dist <= 10f) grid[y][x] = TILE_TOXIC_MIASMA;
                if (dist <= 7.5f) grid[y][x] = TILE_PLAZA;
            }
        }

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
                new() { X = cx * TILE_SIZE, Y = (cy + 7) * TILE_SIZE, TargetZone = "SanctuaryHaven", TargetX = 1536, TargetY = 1536, Name = "🏛️ Return to Haven" }
            },
            MonsterSpawns = new List<MonsterClusterSpawnDto>
            {
                new() { X = cx * TILE_SIZE, Y = (cy - 2) * TILE_SIZE, Count = 1, Type = "malakor_boss" }
            }
        };
    }

    private static ZoneMapDto GenerateCanopy(int seed) => GeneratePlains(seed);
    private static ZoneMapDto GenerateIceCaverns(int seed) => GenerateTundra(seed);
    private static ZoneMapDto GenerateObsidianWastes(int seed) => GenerateCaldera(seed);
    private static ZoneMapDto GenerateShiftingDunes(int seed) => GeneratePlains(seed);

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
