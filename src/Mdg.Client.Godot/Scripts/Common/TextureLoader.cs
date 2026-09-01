using Godot;
using System;
using System.Collections.Generic;
using System.IO;
using Mdg.Core.Features.Combat;

namespace Mdg.Client.Godot.Scripts.Common
{
    public static class TextureLoader
    {
        private static readonly Dictionary<string, Texture2D> _cache = new();
        private static readonly Dictionary<string, AtlasTexture> _frameCache = new();

        public static void EnsureAssetsExtracted()
        {
            // Pixel Crawler pack uses direct PNGs without requiring generation
        }

        public static Texture2D? LoadTexture(string resPath, string keyColor = "none")
        {
            if (string.IsNullOrEmpty(resPath)) return null;

            if (_cache.TryGetValue(resPath, out var cachedTex))
            {
                return cachedTex;
            }

            Image? image = null;
            string globalPath = ProjectSettings.GlobalizePath(resPath);

            if (File.Exists(globalPath))
            {
                try
                {
                    image = Image.LoadFromFile(globalPath);
                }
                catch (Exception ex)
                {
                    GD.PrintErr($"[TextureLoader] Lỗi load file: {globalPath} - {ex.Message}");
                }
            }

            if (image == null && ResourceLoader.Exists(resPath))
            {
                try
                {
                    var res = GD.Load<Texture2D>(resPath);
                    if (res != null)
                    {
                        _cache[resPath] = res;
                        return res;
                    }
                }
                catch { }
            }

            if (image == null)
            {
                GD.PrintErr($"[TextureLoader] Không tìm thấy file: {resPath}");
                return null;
            }

            var tex = ImageTexture.CreateFromImage(image);
            _cache[resPath] = tex;
            return tex;
        }

        public static AtlasTexture? GetFirstFrame(string sheetPath, int frameWidth = 32, int frameHeight = 32)
        {
            string cacheKey = $"{sheetPath}_{frameWidth}x{frameHeight}";
            if (_frameCache.TryGetValue(cacheKey, out var cachedAtlas))
            {
                return cachedAtlas;
            }

            var baseTex = LoadTexture(sheetPath);
            if (baseTex == null) return null;

            int w = Math.Min(frameWidth, (int)baseTex.GetWidth());
            int h = Math.Min(frameHeight, (int)baseTex.GetHeight());

            var atlas = new AtlasTexture
            {
                Atlas = baseTex,
                Region = new Rect2(0, 0, w, h)
            };

            _frameCache[cacheKey] = atlas;
            return atlas;
        }

        public static Texture2D? LoadHeroTexture(string classSpec, string gender)
        {
            string spec = (classSpec ?? "").ToLowerInvariant();

            if (spec.Contains("vanguard") || spec.Contains("knight") || spec.Contains("warrior") || spec.Contains("paladin"))
            {
                return GetFirstFrame("res://Assets/PixelCrawler/Entities/Npc's/Knight/Idle/Idle-Sheet.png", 32, 32);
            }
            if (spec.Contains("arcanist") || spec.Contains("mage") || spec.Contains("wizard") || spec.Contains("sorcerer"))
            {
                return GetFirstFrame("res://Assets/PixelCrawler/Entities/Npc's/Wizzard/Idle/Idle-Sheet.png", 32, 32);
            }
            if (spec.Contains("rogue") || spec.Contains("shadow") || spec.Contains("assassin"))
            {
                return GetFirstFrame("res://Assets/PixelCrawler/Entities/Npc's/Rogue/Idle/Idle-Sheet.png", 32, 32);
            }

            return GetFirstFrame("res://Assets/PixelCrawler/Entities/Npc's/Citizen_F/Peasant_A/Idle/Idle-Sheet.png", 32, 32);
        }

        public static Texture2D? LoadMonsterTexture(string monsterName, MonsterRarity rarity)
        {
            string name = (monsterName ?? "").ToLowerInvariant();

            if (rarity == MonsterRarity.PinnacleBoss || name.Contains("boss") || name.Contains("malakor") || name.Contains("ignis") || name.Contains("vael") || name.Contains("drake"))
            {
                return GetFirstFrame("res://Assets/PixelCrawler/Entities/Mobs/Orc Crew/Orc - Warrior/Idle/Idle-Sheet.png", 32, 32);
            }

            if (name.Contains("shaman") || name.Contains("imp") || name.Contains("fire") || name.Contains("magma") || name.Contains("golem"))
            {
                return GetFirstFrame("res://Assets/PixelCrawler/Entities/Mobs/Orc Crew/Orc - Shaman/Idle/Idle-Sheet.png", 32, 32);
            }

            if (name.Contains("wolf") || name.Contains("goblin") || name.Contains("rogue") || name.Contains("raider") || name.Contains("spider"))
            {
                return GetFirstFrame("res://Assets/PixelCrawler/Entities/Mobs/Orc Crew/Orc - Rogue/Idle/Idle-Sheet.png", 32, 32);
            }

            if (name.Contains("skeleton") && (name.Contains("mage") || name.Contains("spectre") || name.Contains("chaos") || name.Contains("void")))
            {
                return GetFirstFrame("res://Assets/PixelCrawler/Entities/Mobs/Skeleton Crew/Skeleton - Mage/Idle/Idle-Sheet.png", 32, 32);
            }

            if (name.Contains("skeleton") && (name.Contains("warrior") || name.Contains("guard") || name.Contains("knight")))
            {
                return GetFirstFrame("res://Assets/PixelCrawler/Entities/Mobs/Skeleton Crew/Skeleton - Warrior/Idle/Idle-Sheet.png", 32, 32);
            }

            if (name.Contains("skeleton") && name.Contains("rogue"))
            {
                return GetFirstFrame("res://Assets/PixelCrawler/Entities/Mobs/Skeleton Crew/Skeleton - Rogue/Idle/Idle-Sheet.png", 32, 32);
            }

            if (name.Contains("skeleton"))
            {
                return GetFirstFrame("res://Assets/PixelCrawler/Entities/Mobs/Skeleton Crew/Skeleton - Base/Idle/Idle-Sheet.png", 32, 32);
            }

            return GetFirstFrame("res://Assets/PixelCrawler/Entities/Mobs/Orc Crew/Orc/Idle/Idle-Sheet.png", 32, 32);
        }

        public static Texture2D? LoadNpcTexture(string npcName)
        {
            string name = (npcName ?? "").ToLowerInvariant();

            if (name.Contains("smith") || name.Contains("lisbeth"))
            {
                return GetFirstFrame("res://Assets/PixelCrawler/Entities/Npc's/Citizen_F/Peasant_A/Idle/Idle-Sheet.png", 32, 32);
            }
            if (name.Contains("merchant") || name.Contains("shop") || name.Contains("alchemist") || name.Contains("elina"))
            {
                return LoadTexture("res://Assets/PixelCrawler/Entities/Npc's/Citizen_F/Tavern_A/Idle/Idle_Side.png");
            }
            if (name.Contains("elder") || name.Contains("verin") || name.Contains("lore") || name.Contains("lyra"))
            {
                return LoadTexture("res://Assets/PixelCrawler/Entities/Npc's/Citizen_F/Tavern_B/Idle/Idle_Side.png");
            }
            if (name.Contains("guard") || name.Contains("kaelen") || name.Contains("hunter") || name.Contains("valen"))
            {
                return GetFirstFrame("res://Assets/PixelCrawler/Entities/Npc's/Knight/Idle/Idle-Sheet.png", 32, 32);
            }

            return GetFirstFrame("res://Assets/PixelCrawler/Entities/Npc's/Citizen_F/Peasant_A/Idle/Idle-Sheet.png", 32, 32);
        }

        public static Texture2D? LoadTreeTexture(int variant = 1)
        {
            return (variant % 3) switch
            {
                0 => LoadTexture("res://Assets/PixelCrawler/Environment/Props/Static/Trees/Model_01/Size_03.png"),
                1 => LoadTexture("res://Assets/PixelCrawler/Environment/Props/Static/Trees/Model_02/Size_03.png"),
                _ => LoadTexture("res://Assets/PixelCrawler/Environment/Props/Static/Trees/Model_03/Size_03.png")
            };
        }

        public static Texture2D? LoadPropTexture(string propType)
        {
            string type = (propType ?? "").ToLowerInvariant();

            if (type.Contains("campfire") || type.Contains("bonfire") || type.Contains("torch"))
            {
                return LoadTexture("res://Assets/PixelCrawler/Environment/Structures/Stations/Bonfire/Bonfire.png");
            }
            if (type.Contains("anvil") || type.Contains("forge") || type.Contains("smith"))
            {
                return LoadTexture("res://Assets/PixelCrawler/Environment/Structures/Stations/Anvil/Anvil.png");
            }
            if (type.Contains("alchemy") || type.Contains("shrine"))
            {
                return GetFirstFrame("res://Assets/PixelCrawler/Environment/Structures/Stations/Alchemy/Alchemy_Table_01-Sheet.png", 48, 32);
            }
            if (type.Contains("furnace"))
            {
                return LoadTexture("res://Assets/PixelCrawler/Environment/Structures/Stations/Furnace/Furnace.png");
            }
            if (type.Contains("workbench") || type.Contains("table"))
            {
                return LoadTexture("res://Assets/PixelCrawler/Environment/Structures/Stations/Workbench/Workbench.png");
            }

            return LoadTexture("res://Assets/PixelCrawler/Environment/Props/Static/Dungeon_Props.png");
        }

        public static Texture2D? LoadFloorsTileset() => LoadTexture("res://Assets/PixelCrawler/Environment/Tilesets/Floors_Tiles.png");
        public static Texture2D? LoadWallTileset() => LoadTexture("res://Assets/PixelCrawler/Environment/Tilesets/Wall_Tiles.png");
        public static Texture2D? LoadWaterTileset() => LoadTexture("res://Assets/PixelCrawler/Environment/Tilesets/Water_tiles.png");

        // TopDownBasic Pack Loaders
        public static Texture2D? LoadGrassTileset() => LoadTexture("res://Assets/TopDownBasic/TX Tileset Grass.png");
        public static Texture2D? LoadStoneGroundTileset() => LoadTexture("res://Assets/TopDownBasic/TX Tileset Stone Ground.png");
        public static Texture2D? LoadTopDownWallTileset() => LoadTexture("res://Assets/TopDownBasic/TX Tileset Wall.png");
        public static Texture2D? LoadTopDownPlantTexture() => LoadTexture("res://Assets/TopDownBasic/TX Plant with Shadow.png") ?? LoadTexture("res://Assets/TopDownBasic/TX Plant.png");
        public static Texture2D? LoadTopDownPropsTexture() => LoadTexture("res://Assets/TopDownBasic/TX Props with Shadow.png") ?? LoadTexture("res://Assets/TopDownBasic/TX Props.png");
        public static Texture2D? LoadTopDownStructTexture() => LoadTexture("res://Assets/TopDownBasic/TX Struct.png");
    }
}
