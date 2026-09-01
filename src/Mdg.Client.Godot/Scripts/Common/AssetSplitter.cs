using Godot;
using System;
using System.IO;

namespace Mdg.Client.Godot.Scripts.Common
{
    public static class AssetSplitter
    {
        private static bool _isGenerated = false;

        public static void GenerateAllIndividualAssets()
        {
            if (_isGenerated) return;
            _isGenerated = true;

            string baseDir = ProjectSettings.GlobalizePath("res://Assets");
            string outDir = Path.Combine(baseDir, "Individual");

            if (!Directory.Exists(outDir))
            {
                Directory.CreateDirectory(outDir);
            }

            // 1. Split Heroes (4x2, White Chroma-Key)
            SplitSheet(
                Path.Combine(baseDir, "aethelis_heroes_classes_pack.jpg"),
                Path.Combine(outDir, "Heroes"),
                4, 2, "white",
                new[] {
                    ("hero_novice_male.png", 0, 0),
                    ("hero_novice_female.png", 1, 0),
                    ("hero_vanguard_male.png", 2, 0),
                    ("hero_vanguard_female.png", 3, 0),
                    ("hero_arcanist_male.png", 0, 1),
                    ("hero_arcanist_female.png", 1, 1),
                    ("hero_shadowrogue_male.png", 2, 1),
                    ("hero_shadowrogue_female.png", 3, 1),
                }
            );

            // 2. Split Bosses (4x4, Transparency)
            SplitSheet(
                Path.Combine(baseDir, "bosses_pack.png"),
                Path.Combine(outDir, "Monsters"),
                4, 4, "none",
                new[] {
                    ("boss_malakor.png", 0, 0),
                    ("boss_vael.png", 0, 1),
                    ("boss_ignis.png", 0, 2),
                    ("boss_drake.png", 0, 3),
                }
            );

            // 3. Split Aethelis Regular Monsters (4x2, Black Chroma-Key)
            SplitSheet(
                Path.Combine(baseDir, "aethelis_monsters_pack.jpg"),
                Path.Combine(outDir, "Monsters"),
                4, 2, "black",
                new[] {
                    ("monster_fire_imp.png", 0, 0),
                    ("monster_void_wraith.png", 1, 0),
                    ("monster_skeleton.png", 2, 0),
                    ("monster_wolf.png", 3, 0),
                    ("monster_scorpion.png", 0, 1),
                    ("monster_goblin.png", 1, 1),
                    ("monster_spider.png", 2, 1),
                    ("monster_dreadknight.png", 3, 1),
                }
            );

            // 4. Split Void Monsters (4x4, White Chroma-Key)
            SplitSheet(
                Path.Combine(baseDir, "abyssal_void_monsters_pack.png"),
                Path.Combine(outDir, "Monsters"),
                4, 4, "white",
                new[] {
                    ("monster_void_spectre.png", 0, 0),
                    ("monster_chaos_eye.png", 0, 1),
                    ("monster_tentacle_fiend.png", 0, 2),
                    ("monster_horror_stalker.png", 0, 3),
                }
            );

            // 5. Split Elemental Beasts (4x4, White Chroma-Key)
            SplitSheet(
                Path.Combine(baseDir, "elemental_beasts_pack.png"),
                Path.Combine(outDir, "Monsters"),
                4, 4, "white",
                new[] {
                    ("monster_storm_drake.png", 0, 0),
                    ("monster_fire_salamander.png", 0, 1),
                    ("monster_crystal_serpent.png", 0, 2),
                    ("monster_thunder_roc.png", 0, 3),
                }
            );

            // 6. Split Trees (4x3, Black Chroma-Key)
            SplitSheet(
                Path.Combine(baseDir, "aethelis_trees_master_pack.jpg"),
                Path.Combine(outDir, "Trees"),
                4, 3, "black",
                new[] {
                    ("tree_oak.png", 0, 0),
                    ("tree_pine.png", 1, 0),
                    ("tree_aether.png", 2, 0),
                    ("tree_volcanic.png", 3, 0),
                    ("tree_autumn.png", 0, 1),
                    ("tree_giant_mushroom.png", 1, 1),
                    ("tree_willow.png", 2, 1),
                    ("tree_cherry.png", 3, 2),
                }
            );

            // 7. Split Flora & Foliage (4x4, Black Chroma-Key)
            SplitSheet(
                Path.Combine(baseDir, "nature_props_master_pack.png"),
                Path.Combine(outDir, "Flora"),
                4, 4, "black",
                new[] {
                    ("flora_flowers_red.png", 0, 0),
                    ("flora_flowers_blue.png", 1, 0),
                    ("flora_flowers_gold.png", 2, 0),
                    ("flora_mana_bloom.png", 3, 0),
                    ("flora_bush.png", 0, 1),
                    ("flora_tall_grass.png", 2, 1),
                    ("flora_mushroom_glow.png", 0, 2),
                    ("flora_mushroom_cyan.png", 1, 2),
                    ("flora_clover.png", 2, 2),
                    ("flora_water_lily.png", 3, 2),
                    ("flora_wildflowers.png", 3, 3),
                }
            );

            // 8. Split Interactive Props (4x4, Black Chroma-Key)
            SplitSheet(
                Path.Combine(baseDir, "props_interactive_grid.png"),
                Path.Combine(outDir, "Props"),
                4, 4, "black",
                new[] {
                    ("prop_chest.png", 0, 0),
                    ("prop_chest_gold.png", 1, 0),
                    ("prop_chest_crystal.png", 2, 0),
                    ("prop_waypoint.png", 3, 0),
                    ("prop_barrel.png", 0, 1),
                    ("prop_vase.png", 1, 1),
                    ("prop_lever.png", 2, 1),
                    ("prop_campfire.png", 3, 1),
                    ("prop_torch.png", 0, 2),
                    ("prop_gold_pile.png", 1, 2),
                    ("prop_gargoyle.png", 2, 2),
                    ("prop_iron_gate.png", 3, 2),
                }
            );

            // 9. Split NPCs (4x2, White Chroma-Key)
            SplitSheet(
                Path.Combine(baseDir, "aethelis_npcs_pack.jpg"),
                Path.Combine(outDir, "Npcs"),
                4, 2, "white",
                new[] {
                    ("npc_lisbeth.png", 0, 0),
                    ("npc_merchant.png", 1, 0),
                    ("npc_elder_verin.png", 2, 0),
                    ("npc_alchemist_elina.png", 3, 0),
                    ("npc_hunter_valen.png", 0, 1),
                    ("npc_lorekeeper_lyra.png", 1, 1),
                    ("npc_guard_kaelen.png", 2, 1),
                    ("npc_priestess.png", 3, 1),
                }
            );

            // 10. Split Shrines (4x1, Black Chroma-Key)
            SplitSheet(
                Path.Combine(baseDir, "shrines_monoliths_pack.jpg"),
                Path.Combine(outDir, "Shrines"),
                4, 1, "black",
                new[] {
                    ("shrine_tempest.png", 0, 0),
                    ("shrine_solar.png", 1, 0),
                    ("shrine_monolith.png", 2, 0),
                    ("shrine_cave.png", 3, 0),
                }
            );

            // 11. Split Gathering Nodes (4x2, Black Chroma-Key)
            SplitSheet(
                Path.Combine(baseDir, "gathering_nodes_pack.jpg"),
                Path.Combine(outDir, "Gathering"),
                4, 2, "black",
                new[] {
                    ("node_iron_ore.png", 0, 0),
                    ("node_silver_ore.png", 1, 0),
                    ("node_gold_ore.png", 2, 0),
                    ("node_aether_crystal.png", 3, 0),
                    ("node_peacebloom.png", 0, 1),
                    ("node_silverleaf.png", 1, 1),
                    ("node_bloodthistle.png", 2, 1),
                    ("node_lotus.png", 3, 1),
                }
            );

            // 12. Split Spells (4x4)
            SplitSheet(
                Path.Combine(baseDir, "spells_fx_master_pack.png"),
                Path.Combine(outDir, "Spells"),
                4, 4, "none",
                new[] {
                    ("spell_fireball.png", 0, 0),
                    ("spell_frost_orb.png", 1, 0),
                    ("spell_arcane_bolt.png", 2, 0),
                    ("spell_slash.png", 3, 0),
                }
            );

            // 13. Split Flasks (4x2, Black Chroma-Key)
            SplitSheet(
                Path.Combine(baseDir, "alchemy_flasks_pack.jpg"),
                Path.Combine(outDir, "Flasks"),
                4, 2, "black",
                new[] {
                    ("flask_life.png", 0, 0),
                    ("flask_mana.png", 1, 0),
                    ("flask_quicksilver.png", 2, 0),
                    ("flask_diamond.png", 3, 0),
                }
            );

            GD.Print("🎉 [AssetSplitter] Đã tạo thành công toàn bộ bộ ảnh đơn lập (Individual Assets) cho Godot!");
        }

        private static void SplitSheet(string srcPath, string destDir, int cols, int rows, string chromaKey, (string filename, int col, int row)[] items)
        {
            srcPath = Path.GetFullPath(srcPath);
            destDir = Path.GetFullPath(destDir);

            if (!File.Exists(srcPath))
            {
                GD.PrintErr($"[AssetSplitter] File nguồn không tồn tại: {srcPath}");
                return;
            }

            if (!Directory.Exists(destDir)) Directory.CreateDirectory(destDir);

            var img = Image.LoadFromFile(srcPath);
            if (img == null || img.IsEmpty())
            {
                GD.PrintErr($"[AssetSplitter] Không thể mở ảnh: {srcPath}");
                return;
            }

            // Xử lý tách nền Chroma-Key
            if (chromaKey == "black")
            {
                img = ProcessChromaKeyBlack(img);
            }
            else if (chromaKey == "white")
            {
                img = ProcessChromaKeyWhite(img);
            }

            int cellW = img.GetWidth() / cols;
            int cellH = img.GetHeight() / rows;

            foreach (var item in items)
            {
                string outPath = Path.Combine(destDir, item.filename);
                if (File.Exists(outPath)) continue;

                int x = item.col * cellW;
                int y = item.row * cellH;
                var regionRect = new Rect2I(x, y, cellW, cellH);

                var regionImg = img.GetRegion(regionRect);
                regionImg.SavePng(outPath);
                GD.Print($"[AssetSplitter] ✅ Đã lưu: {item.filename}");
            }
        }

        private static Image ProcessChromaKeyBlack(Image src)
        {
            var img = (Image)src.Duplicate();
            img.Convert(Image.Format.Rgba8);
            int w = img.GetWidth();
            int h = img.GetHeight();

            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    var c = img.GetPixel(x, y);
                    if (c.R < 0.12f && c.G < 0.12f && c.B < 0.12f)
                    {
                        img.SetPixel(x, y, new Color(0, 0, 0, 0));
                    }
                    else if (c.R < 0.22f && c.G < 0.22f && c.B < 0.22f)
                    {
                        float maxV = MathF.Max(c.R, MathF.Max(c.G, c.B));
                        float alpha = (maxV - 0.12f) / 0.10f;
                        img.SetPixel(x, y, new Color(c.R, c.G, c.B, alpha));
                    }
                }
            }
            return img;
        }

        private static Image ProcessChromaKeyWhite(Image src)
        {
            var img = (Image)src.Duplicate();
            img.Convert(Image.Format.Rgba8);
            int w = img.GetWidth();
            int h = img.GetHeight();

            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    var c = img.GetPixel(x, y);
                    if (c.R > 0.90f && c.G > 0.90f && c.B > 0.90f)
                    {
                        img.SetPixel(x, y, new Color(1, 1, 1, 0));
                    }
                    else if (c.R > 0.78f && c.G > 0.78f && c.B > 0.78f)
                    {
                        float minV = MathF.Min(c.R, MathF.Min(c.G, c.B));
                        float alpha = (0.90f - minV) / 0.12f;
                        img.SetPixel(x, y, new Color(c.R, c.G, c.B, alpha));
                    }
                }
            }
            return img;
        }
    }
}
