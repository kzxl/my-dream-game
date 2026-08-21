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
  monstersGrid: new Image(),
  bosses: new Image(),
  npcs: new Image(),
  spells: new Image(),
  masterSpells: new Image(),
  awakenedFx: new Image(),
  props: new Image(),
  propsGrid: new Image(),
  nature: new Image(),
  masterNature: new Image(),
  natureFoliage: new Image(),
  terrainRocks: new Image(),
  shrinesMonoliths: new Image(),
  aethelRunes: new Image(),
  awakeningEssences: new Image(),
  buildings: new Image(),
  uiMaster: new Image(),
  loaded: 0
};

const cacheBust = '?v=' + Date.now();

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

// Monsters & Bosses
assets.monsters.onload = () => assets.loaded++;
assets.monsters.src = '/assets/monsters_pack.png' + cacheBust;

assets.masterMonsters.onload = () => assets.loaded++;
assets.masterMonsters.src = '/assets/monsters_master_pack.png' + cacheBust;

assets.monstersGrid.onload = () => assets.loaded++;
assets.monstersGrid.src = '/assets/monsters_creatures_grid.png' + cacheBust;

assets.bosses.onload = () => assets.loaded++;
assets.bosses.src = '/assets/bosses_pack.png' + cacheBust;

// NPCs & Props
assets.npcs.onload = () => assets.loaded++;
assets.npcs.src = '/assets/npcs_pack.png' + cacheBust;

assets.props.onload = () => assets.loaded++;
assets.props.src = '/assets/props_pack.png' + cacheBust;

assets.propsGrid.onload = () => assets.loaded++;
assets.propsGrid.src = '/assets/props_interactive_grid.png' + cacheBust;

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

assets.shrinesMonoliths.onload = () => assets.loaded++;
assets.shrinesMonoliths.src = '/assets/shrines_monoliths_pack.jpg' + cacheBust;

assets.aethelRunes.onload = () => assets.loaded++;
assets.aethelRunes.src = '/assets/aethel_runes_pack.jpg' + cacheBust;

assets.awakeningEssences.onload = () => assets.loaded++;
assets.awakeningEssences.src = '/assets/awakening_essences_pack.jpg' + cacheBust;

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
    targetImg = (assets.awakeningEssences.complete && assets.awakeningEssences.naturalWidth > 0) ? assets.awakeningEssences : null;
  } else if (spriteInfo?.sheet === 'runes' || spriteInfo?.isRune) {
    targetImg = (assets.aethelRunes.complete && assets.aethelRunes.naturalWidth > 0) ? assets.aethelRunes : null;
  } else {
    targetImg = (assets.equipmentGrid.complete && assets.equipmentGrid.naturalWidth > 0)
      ? assets.equipmentGrid
      : (assets.equipment.complete && assets.equipment.naturalWidth > 0 ? assets.equipment : null);
  }

  if (targetImg && spriteInfo) {
    tCtx.drawImage(
      targetImg,
      spriteInfo.sx || 0, spriteInfo.sy || 0, spriteInfo.sw || targetImg.naturalWidth, spriteInfo.sh || targetImg.naturalHeight,
      0, 0, targetCanvas.width, targetCanvas.height
    );
  }
}
