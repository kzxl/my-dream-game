Add-Type -AssemblyName System.Drawing

$srcPath = "E:\15. Other\mdg\src\Mdg.Server\wwwroot\assets\e8c23963-cd90-4b98-9a44-9bd1c6463ece.png"
$assetsDir = "E:\15. Other\mdg\src\Mdg.Server\wwwroot\assets"
$avatarsDir = "E:\15. Other\mdg\src\Mdg.Server\wwwroot\assets\avatars"

$srcImg = [System.Drawing.Bitmap]::FromFile($srcPath)
$W = $srcImg.Width
$H = $srcImg.Height
Write-Host "Source Image Size: $W x $H"

function Crop-Image($x, $y, $w, $h, $outFile) {
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $cropped = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($cropped)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $g.DrawImage($srcImg, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $cropped.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Host "Saved: $outFile ($w x $h)"
}

# 1. Characters Section (Top-Left)
# Full Characters (Knight, Mage, Archer, Rogue)
Crop-Image 0 0 ([int]($W * 0.35)) ([int]($H * 0.23)) "$assetsDir\characters_hero_showcase.png"

# Character Animations Grid (Top-Middle)
Crop-Image ([int]($W * 0.35)) 0 ([int]($W * 0.28)) ([int]($H * 0.30)) "$assetsDir\character_animations_pack.png"

# Monsters Section (Top-Right)
Crop-Image ([int]($W * 0.63)) 0 ([int]($W * 0.37)) ([int]($H * 0.34)) "$assetsDir\monsters_master_pack.png"

# Items & Equipment (Middle-Left)
Crop-Image 0 ([int]($H * 0.23)) ([int]($W * 0.34)) ([int]($H * 0.42)) "$assetsDir\equipment_master_pack.png"

# Environment Tiles & Nature (Center)
Crop-Image ([int]($W * 0.34)) ([int]($H * 0.30)) ([int]($W * 0.31)) ([int]($H * 0.36)) "$assetsDir\nature_props_master_pack.png"

# Buildings (Middle-Right)
Crop-Image ([int]($W * 0.65)) ([int]($H * 0.34)) ([int]($W * 0.35)) ([int]($H * 0.32)) "$assetsDir\buildings_master_pack.png"

# Map Sample (Bottom-Left)
Crop-Image 0 ([int]($H * 0.65)) ([int]($W * 0.355)) ([int]($H * 0.35)) "$assetsDir\map_overworld_sample.png"

# Dungeon Sample (Bottom-Middle-Left)
Crop-Image ([int]($W * 0.355)) ([int]($H * 0.65)) ([int]($W * 0.18)) ([int]($H * 0.35)) "$assetsDir\dungeon_lava_sample.png"

# UI Elements (Bottom-Middle-Right)
Crop-Image ([int]($W * 0.535)) ([int]($H * 0.65)) ([int]($W * 0.31)) ([int]($H * 0.35)) "$assetsDir\ui_master_pack.png"

# Spells & VFX Effects (Bottom-Right)
Crop-Image ([int]($W * 0.845)) ([int]($H * 0.65)) ([int]($W * 0.155)) ([int]($H * 0.35)) "$assetsDir\spells_fx_master_pack.png"

# 2. Individual Class Avatars / Portraits
# Knight Portrait
Crop-Image ([int]($W * 0.008)) ([int]($H * 0.035)) ([int]($W * 0.09)) ([int]($H * 0.18)) "$avatarsDir\portrait_knight.png"
# Mage Portrait (Luna)
Crop-Image ([int]($W * 0.105)) ([int]($H * 0.035)) ([int]($W * 0.075)) ([int]($H * 0.18)) "$avatarsDir\portrait_mage.png"
# Archer Portrait
Crop-Image ([int]($W * 0.185)) ([int]($H * 0.040)) ([int]($W * 0.075)) ([int]($H * 0.18)) "$avatarsDir\portrait_archer.png"
# Rogue Portrait
Crop-Image ([int]($W * 0.265)) ([int]($H * 0.045)) ([int]($W * 0.08)) ([int]($H * 0.18)) "$avatarsDir\portrait_rogue.png"

# UI Dialog Luna Portrait (from Dialog box)
Crop-Image ([int]($W * 0.54)) ([int]($H * 0.90)) ([int]($W * 0.075)) ([int]($H * 0.095)) "$avatarsDir\dialog_portrait_luna.png"
# UI Avatar Knight Circle
Crop-Image ([int]($W * 0.537)) ([int]($H * 0.69)) ([int]($W * 0.055)) ([int]($H * 0.075)) "$avatarsDir\hud_avatar_knight.png"

$srcImg.Dispose()
Write-Host "All assets successfully sliced and organized!"
