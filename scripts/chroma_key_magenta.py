import os
import math
from PIL import Image

output_dir = r"E:\15. Other\mdg\src\Mdg.Server\wwwroot\assets"
os.makedirs(output_dir, exist_ok=True)

def chroma_key_magenta(src_path, dst_path, threshold=75):
    img = Image.open(src_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    # Target magenta: (255, 0, 255)
    for r, g, b, a in data:
        # Distance to magenta
        dist = math.sqrt((r - 255)**2 + (g - 0)**2 + (b - 255)**2)
        if dist < threshold or (r > 190 and g < 90 and b > 190):
            new_data.append((0, 0, 0, 0)) # 100% transparent
        else:
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    img.save(dst_path, "PNG")
    print(f"Saved transparent PNG: {dst_path}")

# Source paths
hero_src = r"C:\Users\phong.vo\.gemini\antigravity-ide\brain\a209798e-590c-4df3-821d-232299764764\clean_hero_spritesheet_1787019056394.jpg"
monsters_src = r"C:\Users\phong.vo\.gemini\antigravity-ide\brain\a209798e-590c-4df3-821d-232299764764\clean_monsters_sheet_1787019408312.jpg"
props_src = r"C:\Users\phong.vo\.gemini\antigravity-ide\brain\a209798e-590c-4df3-821d-232299764764\clean_props_sheet_1787019859881.jpg"

chroma_key_magenta(hero_src, os.path.join(output_dir, "character_spritesheet.png"), threshold=90)
chroma_key_magenta(monsters_src, os.path.join(output_dir, "monsters_pack.png"), threshold=90)
chroma_key_magenta(props_src, os.path.join(output_dir, "props_pack.png"), threshold=90)
chroma_key_magenta(props_src, os.path.join(output_dir, "world_tileset.png"), threshold=90)
