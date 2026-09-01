Add-Type -AssemblyName System.Drawing

$assetsDir = "d:\Project\mdg\src\Mdg.Client.Godot\Assets"
$outBase = "d:\Project\mdg\src\Mdg.Client.Godot\Assets\Individual"

function Process-ChromaKeyAndSave($srcPath, $outPath, $col, $row, $totalCols, $totalRows, $chromaKey) {
    if (-not (Test-Path $srcPath)) { return }
    $dir = [System.IO.Path]::GetDirectoryName($outPath)
    if (-not (Test-Path $dir)) { [System.IO.Directory]::CreateDirectory($dir) | Out-Null }

    $srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)
    $cellW = [int]($srcBmp.Width / $totalCols)
    $cellH = [int]($srcBmp.Height / $totalRows)
    $srcX = $col * $cellW
    $srcY = $row * $cellH

    $destBmp = New-Object System.Drawing.Bitmap($cellW, $cellH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    for ($y = 0; $y -lt $cellH; $y++) {
        for ($x = 0; $x -lt $cellW; $x++) {
            $px = $srcBmp.GetPixel($srcX + $x, $srcY + $y)
            $r = $px.R / 255.0
            $g = $px.G / 255.0
            $b = $px.B / 255.0
            $a = $px.A / 255.0

            if ($chromaKey -eq "black") {
                if ($r -lt 0.12 -and $g -lt 0.12 -and $b -lt 0.12) {
                    $destBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                } elseif ($r -lt 0.24 -and $g -lt 0.24 -and $b -lt 0.24) {
                    $maxV = [Math]::Max($r, [Math]::Max($g, $b))
                    $alpha = [int](255 * (($maxV - 0.12) / 0.12))
                    $destBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $px.R, $px.G, $px.B))
                } else {
                    $destBmp.SetPixel($x, $y, $px)
                }
            } elseif ($chromaKey -eq "white") {
                if ($r -gt 0.88 -and $g -gt 0.88 -and $b -gt 0.88) {
                    $destBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
                } elseif ($r -gt 0.74 -and $g -gt 0.74 -and $b -gt 0.74) {
                    $minV = [Math]::Min($r, [Math]::Min($g, $b))
                    $alpha = [int](255 * ((0.88 - $minV) / 0.14))
                    $destBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $px.R, $px.G, $px.B))
                } else {
                    $destBmp.SetPixel($x, $y, $px)
                }
            } else {
                $destBmp.SetPixel($x, $y, $px)
            }
        }
    }

    $destBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBmp.Dispose()
    $srcBmp.Dispose()
}

Write-Host "🚀 Bắt đầu trích xuất toàn bộ bộ ảnh đơn lập (Individual Assets)..."

# 1. Heroes (4x2, White Chroma-Key)
$hSrc = "$assetsDir\aethelis_heroes_classes_pack.jpg"
Process-ChromaKeyAndSave $hSrc "$outBase\Heroes\hero_novice_male.png" 0 0 4 2 "white"
Process-ChromaKeyAndSave $hSrc "$outBase\Heroes\hero_novice_female.png" 1 0 4 2 "white"
Process-ChromaKeyAndSave $hSrc "$outBase\Heroes\hero_vanguard_male.png" 2 0 4 2 "white"
Process-ChromaKeyAndSave $hSrc "$outBase\Heroes\hero_vanguard_female.png" 3 0 4 2 "white"
Process-ChromaKeyAndSave $hSrc "$outBase\Heroes\hero_arcanist_male.png" 0 1 4 2 "white"
Process-ChromaKeyAndSave $hSrc "$outBase\Heroes\hero_arcanist_female.png" 1 1 4 2 "white"
Process-ChromaKeyAndSave $hSrc "$outBase\Heroes\hero_shadowrogue_male.png" 2 1 4 2 "white"
Process-ChromaKeyAndSave $hSrc "$outBase\Heroes\hero_shadowrogue_female.png" 3 1 4 2 "white"

# 2. Bosses (4x4, Transparent)
$bSrc = "$assetsDir\bosses_pack.png"
Process-ChromaKeyAndSave $bSrc "$outBase\Monsters\boss_malakor.png" 0 0 4 4 "none"
Process-ChromaKeyAndSave $bSrc "$outBase\Monsters\boss_vael.png" 0 1 4 4 "none"
Process-ChromaKeyAndSave $bSrc "$outBase\Monsters\boss_ignis.png" 0 2 4 4 "none"
Process-ChromaKeyAndSave $bSrc "$outBase\Monsters\boss_drake.png" 0 3 4 4 "none"

# 3. Aethelis Monsters (4x2, Black Chroma-Key)
$mSrc = "$assetsDir\aethelis_monsters_pack.jpg"
Process-ChromaKeyAndSave $mSrc "$outBase\Monsters\monster_fire_imp.png" 0 0 4 2 "black"
Process-ChromaKeyAndSave $mSrc "$outBase\Monsters\monster_void_wraith.png" 1 0 4 2 "black"
Process-ChromaKeyAndSave $mSrc "$outBase\Monsters\monster_skeleton.png" 2 0 4 2 "black"
Process-ChromaKeyAndSave $mSrc "$outBase\Monsters\monster_wolf.png" 3 0 4 2 "black"
Process-ChromaKeyAndSave $mSrc "$outBase\Monsters\monster_scorpion.png" 0 1 4 2 "black"
Process-ChromaKeyAndSave $mSrc "$outBase\Monsters\monster_goblin.png" 1 1 4 2 "black"
Process-ChromaKeyAndSave $mSrc "$outBase\Monsters\monster_spider.png" 2 1 4 2 "black"
Process-ChromaKeyAndSave $mSrc "$outBase\Monsters\monster_dreadknight.png" 3 1 4 2 "black"

# 4. Void Monsters (4x4, White Chroma-Key)
$vSrc = "$assetsDir\abyssal_void_monsters_pack.png"
Process-ChromaKeyAndSave $vSrc "$outBase\Monsters\monster_void_spectre.png" 0 0 4 4 "white"
Process-ChromaKeyAndSave $vSrc "$outBase\Monsters\monster_chaos_eye.png" 0 1 4 4 "white"
Process-ChromaKeyAndSave $vSrc "$outBase\Monsters\monster_tentacle_fiend.png" 0 2 4 4 "white"
Process-ChromaKeyAndSave $vSrc "$outBase\Monsters\monster_horror_stalker.png" 0 3 4 4 "white"

# 5. Elemental Beasts (4x4, White Chroma-Key)
$eSrc = "$assetsDir\elemental_beasts_pack.png"
Process-ChromaKeyAndSave $eSrc "$outBase\Monsters\monster_storm_drake.png" 0 0 4 4 "white"
Process-ChromaKeyAndSave $eSrc "$outBase\Monsters\monster_fire_salamander.png" 0 1 4 4 "white"
Process-ChromaKeyAndSave $eSrc "$outBase\Monsters\monster_crystal_serpent.png" 0 2 4 4 "white"
Process-ChromaKeyAndSave $eSrc "$outBase\Monsters\monster_thunder_roc.png" 0 3 4 4 "white"

# 6. Trees (4x3, Black Chroma-Key)
$tSrc = "$assetsDir\aethelis_trees_master_pack.jpg"
Process-ChromaKeyAndSave $tSrc "$outBase\Trees\tree_oak.png" 0 0 4 3 "black"
Process-ChromaKeyAndSave $tSrc "$outBase\Trees\tree_pine.png" 1 0 4 3 "black"
Process-ChromaKeyAndSave $tSrc "$outBase\Trees\tree_aether.png" 2 0 4 3 "black"
Process-ChromaKeyAndSave $tSrc "$outBase\Trees\tree_volcanic.png" 3 0 4 3 "black"
Process-ChromaKeyAndSave $tSrc "$outBase\Trees\tree_autumn.png" 0 1 4 3 "black"
Process-ChromaKeyAndSave $tSrc "$outBase\Trees\tree_giant_mushroom.png" 1 1 4 3 "black"
Process-ChromaKeyAndSave $tSrc "$outBase\Trees\tree_willow.png" 2 1 4 3 "black"
Process-ChromaKeyAndSave $tSrc "$outBase\Trees\tree_cherry.png" 3 2 4 3 "black"

# 7. Flora & Foliage (4x4, Black Chroma-Key)
$fSrc = "$assetsDir\nature_props_master_pack.png"
Process-ChromaKeyAndSave $fSrc "$outBase\Flora\flora_flowers_red.png" 0 0 4 4 "black"
Process-ChromaKeyAndSave $fSrc "$outBase\Flora\flora_flowers_blue.png" 1 0 4 4 "black"
Process-ChromaKeyAndSave $fSrc "$outBase\Flora\flora_flowers_gold.png" 2 0 4 4 "black"
Process-ChromaKeyAndSave $fSrc "$outBase\Flora\flora_mana_bloom.png" 3 0 4 4 "black"
Process-ChromaKeyAndSave $fSrc "$outBase\Flora\flora_bush.png" 0 1 4 4 "black"
Process-ChromaKeyAndSave $fSrc "$outBase\Flora\flora_tall_grass.png" 2 1 4 4 "black"
Process-ChromaKeyAndSave $fSrc "$outBase\Flora\flora_mushroom_glow.png" 0 2 4 4 "black"
Process-ChromaKeyAndSave $fSrc "$outBase\Flora\flora_mushroom_cyan.png" 1 2 4 4 "black"
Process-ChromaKeyAndSave $fSrc "$outBase\Flora\flora_clover.png" 2 2 4 4 "black"
Process-ChromaKeyAndSave $fSrc "$outBase\Flora\flora_water_lily.png" 3 2 4 4 "black"
Process-ChromaKeyAndSave $fSrc "$outBase\Flora\flora_wildflowers.png" 3 3 4 4 "black"

# 8. Interactive Props (4x4, Black Chroma-Key)
$pSrc = "$assetsDir\props_interactive_grid.png"
Process-ChromaKeyAndSave $pSrc "$outBase\Props\prop_chest.png" 0 0 4 4 "black"
Process-ChromaKeyAndSave $pSrc "$outBase\Props\prop_chest_gold.png" 1 0 4 4 "black"
Process-ChromaKeyAndSave $pSrc "$outBase\Props\prop_chest_crystal.png" 2 0 4 4 "black"
Process-ChromaKeyAndSave $pSrc "$outBase\Props\prop_waypoint.png" 3 0 4 4 "black"
Process-ChromaKeyAndSave $pSrc "$outBase\Props\prop_barrel.png" 0 1 4 4 "black"
Process-ChromaKeyAndSave $pSrc "$outBase\Props\prop_vase.png" 1 1 4 4 "black"
Process-ChromaKeyAndSave $pSrc "$outBase\Props\prop_lever.png" 2 1 4 4 "black"
Process-ChromaKeyAndSave $pSrc "$outBase\Props\prop_campfire.png" 3 1 4 4 "black"
Process-ChromaKeyAndSave $pSrc "$outBase\Props\prop_torch.png" 0 2 4 4 "black"
Process-ChromaKeyAndSave $pSrc "$outBase\Props\prop_gold_pile.png" 1 2 4 4 "black"
Process-ChromaKeyAndSave $pSrc "$outBase\Props\prop_gargoyle.png" 2 2 4 4 "black"
Process-ChromaKeyAndSave $pSrc "$outBase\Props\prop_iron_gate.png" 3 2 4 4 "black"

# 9. NPCs (4x2, White Chroma-Key)
$nSrc = "$assetsDir\aethelis_npcs_pack.jpg"
Process-ChromaKeyAndSave $nSrc "$outBase\Npcs\npc_lisbeth.png" 0 0 4 2 "white"
Process-ChromaKeyAndSave $nSrc "$outBase\Npcs\npc_merchant.png" 1 0 4 2 "white"
Process-ChromaKeyAndSave $nSrc "$outBase\Npcs\npc_elder_verin.png" 2 0 4 2 "white"
Process-ChromaKeyAndSave $nSrc "$outBase\Npcs\npc_alchemist_elina.png" 3 0 4 2 "white"
Process-ChromaKeyAndSave $nSrc "$outBase\Npcs\npc_hunter_valen.png" 0 1 4 2 "white"
Process-ChromaKeyAndSave $nSrc "$outBase\Npcs\npc_lorekeeper_lyra.png" 1 1 4 2 "white"
Process-ChromaKeyAndSave $nSrc "$outBase\Npcs\npc_guard_kaelen.png" 2 1 4 2 "white"
Process-ChromaKeyAndSave $nSrc "$outBase\Npcs\npc_priestess.png" 3 1 4 2 "white"

# 10. Shrines (4x1, Black Chroma-Key)
$sSrc = "$assetsDir\shrines_monoliths_pack.jpg"
Process-ChromaKeyAndSave $sSrc "$outBase\Shrines\shrine_tempest.png" 0 0 4 1 "black"
Process-ChromaKeyAndSave $sSrc "$outBase\Shrines\shrine_solar.png" 1 0 4 1 "black"
Process-ChromaKeyAndSave $sSrc "$outBase\Shrines\shrine_monolith.png" 2 0 4 1 "black"
Process-ChromaKeyAndSave $sSrc "$outBase\Shrines\shrine_cave.png" 3 0 4 1 "black"

# 11. Gathering Nodes (4x2, Black Chroma-Key)
$gSrc = "$assetsDir\gathering_nodes_pack.jpg"
Process-ChromaKeyAndSave $gSrc "$outBase\Gathering\node_iron_ore.png" 0 0 4 2 "black"
Process-ChromaKeyAndSave $gSrc "$outBase\Gathering\node_silver_ore.png" 1 0 4 2 "black"
Process-ChromaKeyAndSave $gSrc "$outBase\Gathering\node_gold_ore.png" 2 0 4 2 "black"
Process-ChromaKeyAndSave $gSrc "$outBase\Gathering\node_aether_crystal.png" 3 0 4 2 "black"
Process-ChromaKeyAndSave $gSrc "$outBase\Gathering\node_peacebloom.png" 0 1 4 2 "black"
Process-ChromaKeyAndSave $gSrc "$outBase\Gathering\node_silverleaf.png" 1 1 4 2 "black"
Process-ChromaKeyAndSave $gSrc "$outBase\Gathering\node_bloodthistle.png" 2 1 4 2 "black"
Process-ChromaKeyAndSave $gSrc "$outBase\Gathering\node_lotus.png" 3 1 4 2 "black"

# 12. Spells (4x4, Transparent)
$spSrc = "$assetsDir\spells_fx_master_pack.png"
Process-ChromaKeyAndSave $spSrc "$outBase\Spells\spell_fireball.png" 0 0 4 4 "none"
Process-ChromaKeyAndSave $spSrc "$outBase\Spells\spell_frost_orb.png" 1 0 4 4 "none"
Process-ChromaKeyAndSave $spSrc "$outBase\Spells\spell_arcane_bolt.png" 2 0 4 4 "none"
Process-ChromaKeyAndSave $spSrc "$outBase\Spells\spell_slash.png" 3 0 4 4 "none"

# 13. Flasks (4x2, Black Chroma-Key)
$flSrc = "$assetsDir\alchemy_flasks_pack.jpg"
Process-ChromaKeyAndSave $flSrc "$outBase\Flasks\flask_life.png" 0 0 4 2 "black"
Process-ChromaKeyAndSave $flSrc "$outBase\Flasks\flask_mana.png" 1 0 4 2 "black"
Process-ChromaKeyAndSave $flSrc "$outBase\Flasks\flask_quicksilver.png" 2 0 4 2 "black"
Process-ChromaKeyAndSave $flSrc "$outBase\Flasks\flask_diamond.png" 3 0 4 2 "black"

Write-Host "✅ [AssetSplitter] Đã trích xuất xong toàn bộ ảnh đơn lập thành công!"
