import os
from PIL import Image

assets_dir = r"E:\15. Other\mdg\src\Mdg.Server\wwwroot\assets"

def make_transparent(input_name, output_name, threshold_white=215, threshold_gray_diff=25):
    input_path = os.path.join(assets_dir, input_name)
    output_path = os.path.join(assets_dir, output_name)
    
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return
        
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        r, g, b, a = item
        # Detect white, light gray, grid colors
        is_light = r > threshold_white and g > threshold_white and b > threshold_white
        is_neutral_gray = abs(r - g) < threshold_gray_diff and abs(g - b) < threshold_gray_diff and abs(r - b) < threshold_gray_diff and r > 180
        is_blue_gray_grid = r > 190 and g > 195 and b > 200
        
        if is_light or is_neutral_gray or is_blue_gray_grid:
            new_data.append((255, 255, 255, 0)) # Fully transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Successfully converted {input_name} -> {output_name} with transparent background.")

# Convert all 3 asset files
make_transparent("character_spritesheet.jpg", "character_spritesheet.png", threshold_white=200, threshold_gray_diff=30)
make_transparent("monsters_pack.jpg", "monsters_pack.png", threshold_white=200, threshold_gray_diff=30)
make_transparent("world_tileset.jpg", "world_tileset.png", threshold_white=200, threshold_gray_diff=30)
