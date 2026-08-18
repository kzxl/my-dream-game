/**
 * Asset Loader & Sprite Sheet Coordinates
 */

export const assets = {
  maleHero: new Image(),
  femaleHero: new Image(),
  equipment: new Image(),
  monsters: new Image(),
  props: new Image(),
  loaded: 0
};

const cacheBust = '?v=' + Date.now();

assets.maleHero.onload = () => assets.loaded++;
assets.maleHero.src = '/assets/character_spritesheet.png' + cacheBust;

assets.femaleHero.onload = () => assets.loaded++;
assets.femaleHero.src = '/assets/female_character_spritesheet.png' + cacheBust;

assets.equipment.onload = () => assets.loaded++;
assets.equipment.src = '/assets/equipment_pack.png' + cacheBust;

assets.monsters.onload = () => assets.loaded++;
assets.monsters.src = '/assets/monsters_pack.png' + cacheBust;

assets.props.onload = () => assets.loaded++;
assets.props.src = '/assets/props_pack.png' + cacheBust;

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
