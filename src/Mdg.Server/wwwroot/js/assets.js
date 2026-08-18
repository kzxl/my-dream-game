/**
 * Asset Loader & Sprite Sheet Coordinates
 */

export const assets = {
  maleHero: new Image(),
  femaleHero: new Image(),
  heroAnim: new Image(),
  equipment: new Image(),
  masterEquipment: new Image(),
  monsters: new Image(),
  masterMonsters: new Image(),
  bosses: new Image(),
  npcs: new Image(),
  spells: new Image(),
  masterSpells: new Image(),
  props: new Image(),
  nature: new Image(),
  masterNature: new Image(),
  buildings: new Image(),
  uiMaster: new Image(),
  loaded: 0
};

const cacheBust = '?v=' + Date.now();

assets.maleHero.onload = () => assets.loaded++;
assets.maleHero.src = '/assets/character_spritesheet.png' + cacheBust;

assets.femaleHero.onload = () => assets.loaded++;
assets.femaleHero.src = '/assets/female_character_spritesheet.png' + cacheBust;

assets.heroAnim.onload = () => assets.loaded++;
assets.heroAnim.src = '/assets/character_animations_pack.png' + cacheBust;

assets.equipment.onload = () => assets.loaded++;
assets.equipment.src = '/assets/equipment_pack.png' + cacheBust;

assets.masterEquipment.onload = () => assets.loaded++;
assets.masterEquipment.src = '/assets/equipment_master_pack.png' + cacheBust;

assets.monsters.onload = () => assets.loaded++;
assets.monsters.src = '/assets/monsters_pack.png' + cacheBust;

assets.masterMonsters.onload = () => assets.loaded++;
assets.masterMonsters.src = '/assets/monsters_master_pack.png' + cacheBust;

assets.bosses.onload = () => assets.loaded++;
assets.bosses.src = '/assets/bosses_pack.png' + cacheBust;

assets.npcs.onload = () => assets.loaded++;
assets.npcs.src = '/assets/npcs_pack.png' + cacheBust;

assets.spells.onload = () => assets.loaded++;
assets.spells.src = '/assets/spells_fx_pack.png' + cacheBust;

assets.masterSpells.onload = () => assets.loaded++;
assets.masterSpells.src = '/assets/spells_fx_master_pack.png' + cacheBust;

assets.props.onload = () => assets.loaded++;
assets.props.src = '/assets/props_pack.png' + cacheBust;

assets.nature.onload = () => assets.loaded++;
assets.nature.src = '/assets/nature_props_master_pack.png' + cacheBust;

assets.masterNature.onload = () => assets.loaded++;
assets.masterNature.src = '/assets/nature_props_master_pack.png' + cacheBust;

assets.buildings.onload = () => assets.loaded++;
assets.buildings.src = '/assets/buildings_master_pack.png' + cacheBust;

assets.uiMaster.onload = () => assets.loaded++;
assets.uiMaster.src = '/assets/ui_master_pack.png' + cacheBust;

export function drawItemSpriteToCanvas(targetCanvas, spriteInfo) {
  if (!targetCanvas) return;
  const tCtx = targetCanvas.getContext('2d');
  tCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  tCtx.imageSmoothingEnabled = false;

  if (assets.equipment.complete && assets.equipment.naturalWidth > 0 && spriteInfo) {
    tCtx.drawImage(
      assets.equipment,
      spriteInfo.sx, spriteInfo.sy, spriteInfo.sw, spriteInfo.sh,
      0, 0, targetCanvas.width, targetCanvas.height
    );
  }
}
