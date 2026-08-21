# Aethelis Visual Design & Asset Theme Specification

## 1. Core Visual Theme & Art Direction
- **World Name:** *Aethelis*
- **Genre & Tone:** High Dark-Fantasy Action RPG (ARPG) blending Sylvan Nature, Ancient Celestial Magic, and Cosmic Void Fractures.
- **Artistic Style:** 2D Top-down / Orthographic perspective with vibrant stylized painted textures, rich contrast, and glowing magical accents.
- **Visual Goal:** High visual readability, immersive atmospheric depth, and modern aesthetics (avoiding flat solid colors).

---

## 2. Regional Biome Color Palettes & Textures

| Biome / Region | Primary Ground / Wall Textures | Water & Fluid Dynamics | Flora & Foliage Accents | Lighting & Atmospheric Tone |
|---|---|---|---|---|
| **Sanctuary Haven & Whispering Plains** | Lush emerald grass (`#3e6320` - `#5f9134`), fine sandy dirt paths, weathered granite cobblestone (`#6e6259`) | Crystal-clear azure ripples, gentle shoreline foam, glowing turquoise shallows | Red roses, blue luminous bellflowers, golden sunblossoms, four-leaf clovers, lush bushes | Warm celestial sunlight, peaceful floating dust motes |
| **Forgotten Crypt & Abyssal Breach** | Dark obsidian flagstones (`#241b2f`), cracked rune slabs, ancient dungeon masonry | Eerie void-infused abyssal water, violet mist pools | Luminescent eldritch violet & cyan fungi, withered thorns | Deep purple shadows, glowing violet runes |
| **Frostpeak Tundra** | Powdered white snowdrifts, frosted slate, permafrost cobblestone | Translucent turquoise glacial ice, frozen water streams | Frosted blue pine needles, winterberry shrubs | Crisp cyan haze, falling snow particles |
| **Molten Caldera & Scorched Basin** | Charred basalt rocks, scorched ash earth (`#2b1b1f`), obsidian gravel | Pulsating molten magma rivers, bubbling orange-gold lava | Glowing cinder roots, fire moss, heat-resistant obsidian flora | Fiery amber-red rim lighting, rising embers |

---

## 3. Asset Technical Specifications

### A. Grid Standards & Dimensions
- **Base Tile Grid:** $48 \times 48\text{px}$ per tile in world space ($32\text{px}$ to $64\text{px}$ rendering scale).
- **Environment Tilesets:** Organized in structured $4\times 4$ or $8\times 8$ spritesheet grids with seamless repeating boundaries for clean UV slicing.
- **Flora & Props:** Centered sprites with bottom-center anchor points (`offX = -width / 2`, `offY = -height + 10`) for accurate Y-sorting and depth perception.

### B. Alpha Transparency & Background Keying
- **Solid Contrast Backgrounds:** Sprite packs are generated on pure pitch-black (`#000000`) or pure white (`#ffffff`) background.
- **Dynamic Feathered Color-Keyer (`loadTransparentSheet`):**
  - **Black Keying:** Threshold `r, g, b <= 28` $\to \alpha = 0$; feathered transition up to `55` for smooth anti-aliased edges without dark halos.
  - **White Keying:** Threshold `r, g, b >= 220` $\to \alpha = 0$; feathered transition down to `190`.
- **Special FX & Aura Shaders:** Additive blending (`ctx.globalCompositeOperation = 'lighter'`) for glowing runes, awakened energy rifts, and magic spells.

---

## 4. Asset Catalog Index

| Asset Key | File Path | Sheet Type | Keying Mode | Description & Use Case |
|---|---|---|---|---|
| `aethelisTerrain` | `/assets/aethelis_terrain_tileset.jpg` | 4x4 Grid Tileset | Direct Tile Mapping | Grass, dirt paths, cobblestone pavement, dungeon stones, sand & shorelines |
| `aethelisFoliage` | `/assets/aethelis_foliage_flora_pack.jpg` | 4x4 Spritesheet (16 props) | Alpha Keyed (Black) | Roses, bellflowers, sunblossoms, mana flowers, bushes, ferns, mushrooms, clovers, water lilies |
| `aethelisWater` | `/assets/aethelis_water_liquid_tileset.jpg` | 8x8 Fluid Tileset | Direct Animated Mapping | Azure ripples, shoreline foam, deep abyss, glowing aether stream, molten lava, toxic swamp |
| `propsGrid` | `/assets/props_interactive_grid.png` | 4x3 Interactive Props | Alpha Keyed (Black) | Chests, barrels, shrines, campfires, iron gates, levers |
| `awakenedFx` | `/assets/awakened_fx_grid.png` | 8x5 Animation Grid | Additive Magic Blending | Awakened skill projectiles, dimension cleave, supernova orb, permafrost nova |
| `natureFoliage` | `/assets/nature_foliage_pack.jpg` | Master Nature Foliage | Direct / Alpha Keyed | Large oak, pine, cherry trees, crystal spires, boulders |

---

## 5. Renderer Integration Guidelines
1. **Seamless Terrain Blending:** Terrain is sampled by zone ID and tile type, blending UV coordinates with slight pseudo-random variations based on tile hash to prevent repetitive patterns.
2. **Animated Fluid Shaders:** Water, lava, and toxic miasma use trigonometric UV offsets (`time * speed + x * freq`) to create dynamic living fluid ripples.
3. **Decals & Ground Flora:** High-density flora props (flowers, mushrooms, clovers) are rendered with subtle wind sway micro-animations.
