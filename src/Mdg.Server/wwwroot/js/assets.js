/**
 * Asset Loader & Sprite Sheet Coordinates (Modular Grid Assets)
 */

export const assets = {
  maleHero: new Image(),
  femaleHero: new Image(),
  heroAnim: new Image(),
  equipment: new Image(),
  masterEquipment: new Image(),
  equipmentGrid: new Image(),
  monsters: new Image(),
  masterMonsters: new Image(),
  monstersGrid: null,
  voidMonsters: null,
  elementalBeasts: null,
  ancientConstructs: null,
  bosses: new Image(),
  npcs: new Image(),
  spells: new Image(),
  masterSpells: new Image(),
  awakenedFx: new Image(),
  props: new Image(),
  propsGrid: null,
  nature: new Image(),
  masterNature: new Image(),
  natureFoliage: new Image(),
  terrainRocks: new Image(),
  aethelisTerrain: new Image(),
  aethelisFoliage: null,
  aethelisWater: new Image(),
  shrinesMonoliths: new Image(),
  aethelRunes: new Image(),
  awakeningEssences: new Image(),
  buildings: new Image(),
  uiMaster: new Image(),
  loaded: 0
};

const cacheBust = '?v=' + Date.now();

/**
 * In-Memory Dynamic Canvas Color-Keyer & Alpha Masking Engine
 * Strips solid white or black backgrounds with smooth feathered edge blending
 */
export function loadTransparentSheet(src, keyColor = 'white') {
  const canvas = document.createElement('canvas');
  const img = new Image();

  canvas.complete = false;
  canvas.naturalWidth = 0;
  canvas.naturalHeight = 0;

  img.crossOrigin = 'anonymous';
  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const len = data.length;

      if (keyColor === 'white') {
        for (let i = 0; i < len; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          // Pure / near-white background removal
          if (r >= 220 && g >= 220 && b >= 220) {
            data[i + 3] = 0;
          } else if (r >= 190 && g >= 190 && b >= 190) {
            // Feathered anti-aliasing edge
            const minC = Math.min(r, g, b);
            const factor = (255 - minC) / (255 - 190);
            data[i + 3] = Math.floor(data[i + 3] * factor);
          }
        }
      } else if (keyColor === 'black') {
        for (let i = 0; i < len; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          // Pure / near-black background removal
          if (r <= 28 && g <= 28 && b <= 28) {
            data[i + 3] = 0;
          } else if (r <= 55 && g <= 55 && b <= 55) {
            const maxC = Math.max(r, g, b);
            const factor = (maxC - 28) / (55 - 28);
            data[i + 3] = Math.floor(data[i + 3] * factor);
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.warn('Canvas pixel processing fallback', e);
    }

    canvas.complete = true;
    canvas.naturalWidth = canvas.width;
    canvas.naturalHeight = canvas.height;
    assets.loaded++;
  };

  img.src = src;
  return canvas;
}

// Heroes & Animations
assets.maleHero.onload = () => assets.loaded++;
assets.maleHero.src = '/assets/character_spritesheet.png' + cacheBust;

assets.femaleHero.onload = () => assets.loaded++;
assets.femaleHero.src = '/assets/female_character_spritesheet.png' + cacheBust;

assets.heroAnim.onload = () => assets.loaded++;
assets.heroAnim.src = '/assets/character_animations_pack.png' + cacheBust;

// Equipment & Grid
assets.equipment.onload = () => assets.loaded++;
assets.equipment.src = '/assets/equipment_pack.png' + cacheBust;

assets.masterEquipment.onload = () => assets.loaded++;
assets.masterEquipment.src = '/assets/equipment_master_pack.png' + cacheBust;

assets.equipmentGrid.onload = () => assets.loaded++;
assets.equipmentGrid.src = '/assets/equipment_items_grid.png' + cacheBust;

// Transparent Monster Spritesheets (Dynamic Background Removed)
assets.monsters.onload = () => assets.loaded++;
assets.monsters.src = '/assets/monsters_pack.png' + cacheBust;

assets.masterMonsters.onload = () => assets.loaded++;
assets.masterMonsters.src = '/assets/monsters_master_pack.png' + cacheBust;

assets.monstersGrid = loadTransparentSheet('/assets/monsters_creatures_grid.png' + cacheBust, 'white');
assets.voidMonsters = loadTransparentSheet('/assets/abyssal_void_monsters_pack.png' + cacheBust, 'white');
assets.elementalBeasts = loadTransparentSheet('/assets/elemental_beasts_pack.png' + cacheBust, 'white');
assets.ancientConstructs = loadTransparentSheet('/assets/ancient_constructs_pack.png' + cacheBust, 'white');

assets.bosses.onload = () => assets.loaded++;
assets.bosses.src = '/assets/bosses_pack.png' + cacheBust;

// NPCs & Transparent Props
assets.npcs.onload = () => assets.loaded++;
assets.npcs.src = '/assets/npcs_pack.png' + cacheBust;

assets.props.onload = () => assets.loaded++;
assets.props.src = '/assets/props_pack.png' + cacheBust;

assets.propsGrid = loadTransparentSheet('/assets/props_interactive_grid.png' + cacheBust, 'black');

// Spells & Awakened FX
assets.spells.onload = () => assets.loaded++;
assets.spells.src = '/assets/spells_fx_pack.png' + cacheBust;

assets.masterSpells.onload = () => assets.loaded++;
assets.masterSpells.src = '/assets/spells_fx_master_pack.png' + cacheBust;

assets.awakenedFx.onload = () => assets.loaded++;
assets.awakenedFx.src = '/assets/awakened_fx_grid.png' + cacheBust;

// Nature, Terrain, POIs & Runes
assets.nature.onload = () => assets.loaded++;
assets.nature.src = '/assets/nature_props_master_pack.png' + cacheBust;

assets.masterNature.onload = () => assets.loaded++;
assets.masterNature.src = '/assets/nature_props_master_pack.png' + cacheBust;

assets.natureFoliage.onload = () => assets.loaded++;
assets.natureFoliage.src = '/assets/nature_foliage_pack.jpg' + cacheBust;

assets.terrainRocks.onload = () => assets.loaded++;
assets.terrainRocks.src = '/assets/terrain_rocks_pack.jpg' + cacheBust;

// Aethelis High Fantasy Tilesets & Keyed Flora
assets.aethelisTerrain.onload = () => assets.loaded++;
assets.aethelisTerrain.src = '/assets/aethelis_terrain_tileset.jpg' + cacheBust;

assets.aethelisWater.onload = () => assets.loaded++;
assets.aethelisWater.src = '/assets/aethelis_water_liquid_tileset.jpg' + cacheBust;

// Alpha-masked Transparent Flora (Black background keyed out)
assets.aethelisFoliage = loadTransparentSheet('/assets/aethelis_foliage_flora_pack.jpg' + cacheBust, 'black');

assets.shrinesMonoliths = loadTransparentSheet('/assets/shrines_monoliths_pack.jpg' + cacheBust, 'black');
assets.aethelRunes = loadTransparentSheet('/assets/aethel_runes_pack.jpg' + cacheBust, 'black');
assets.awakeningEssences = loadTransparentSheet('/assets/awakening_essences_pack.jpg' + cacheBust, 'black');

// Buildings & UI
assets.buildings.onload = () => assets.loaded++;
assets.buildings.src = '/assets/buildings_master_pack.png' + cacheBust;

assets.uiMaster.onload = () => assets.loaded++;
assets.uiMaster.src = '/assets/ui_master_pack.png' + cacheBust;

export function drawItemSpriteToCanvas(targetCanvas, spriteInfo) {
  if (!targetCanvas) return;
  const tCtx = targetCanvas.getContext('2d');
  tCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  tCtx.imageSmoothingEnabled = false;

  let targetImg = null;
  if (spriteInfo?.sheet === 'essences' || spriteInfo?.isEssence) {
    const img = assets.awakeningEssences;
    targetImg = (img && img.complete && (img.naturalWidth || img.width) > 0) ? img : null;
  } else if (spriteInfo?.sheet === 'runes' || spriteInfo?.isRune) {
    const img = assets.aethelRunes;
    targetImg = (img && img.complete && (img.naturalWidth || img.width) > 0) ? img : null;
  } else if (spriteInfo?.sheet === 'grid') {
    targetImg = (assets.equipmentGrid && assets.equipmentGrid.complete && (assets.equipmentGrid.naturalWidth || assets.equipmentGrid.width) > 0) ? assets.equipmentGrid : assets.equipment;
  } else {
    targetImg = (assets.equipment && assets.equipment.complete && assets.equipment.naturalWidth > 0)
      ? assets.equipment
      : (assets.equipmentGrid && assets.equipmentGrid.complete && (assets.equipmentGrid.naturalWidth || assets.equipmentGrid.width) > 0 ? assets.equipmentGrid : null);
  }

  if (targetImg && spriteInfo) {
    const srcW = targetImg.naturalWidth || targetImg.width;
    const srcH = targetImg.naturalHeight || targetImg.height;
    tCtx.drawImage(
      targetImg,
      spriteInfo.sx || 0, spriteInfo.sy || 0, spriteInfo.sw || srcW, spriteInfo.sh || srcH,
      0, 0, targetCanvas.width, targetCanvas.height
    );
  }
}
