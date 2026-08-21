/**
 * MDG: Aethelis - Endless Spire 100 Floors Data & Modifiers (Aincrad Style)
 */

export const MAX_SPIRE_FLOOR = 100;

export function getSpireFloorData(floor) {
  floor = Math.max(1, Math.min(MAX_SPIRE_FLOOR, floor));
  const isBoss = (floor % 10 === 0);
  
  let bossName = '';
  if (floor === 100) bossName = 'The Corrupted Genesis Sovereign (Apex 100)';
  else if (floor >= 70) bossName = 'Archon of the Void (Void Lord)';
  else if (floor >= 40) bossName = 'Lord Ignis the Ash Titan';
  else if (floor >= 10) bossName = 'Malakor the Shadow Fiend';

  const mods = [];
  if (floor >= 15) mods.push('⚡ Turbo Monsters (+25% Move & Attack Speed)');
  if (floor >= 30) mods.push('❄️ Elemental Exposure (-15% Player Resistances)');
  if (floor >= 50) mods.push('💥 Volatile Explosions on Monster Death');
  if (floor >= 75) mods.push('🌌 Apex Void Empowerment (+60% Monster Damage)');

  return {
    floor,
    name: isBoss ? `Floor ${floor}: Guardian Sovereign Chamber` : `Floor ${floor}: Ascendant Spire Trial`,
    isBoss,
    bossName,
    hpScale: 1.0 + (floor * 0.08),
    dmgScale: 1.0 + (floor * 0.05),
    resPenalty: Math.floor(floor / 5) * 2,
    iirBonus: floor * 3, // +300% at floor 100
    iiqBonus: floor * 1.5, // +150% at floor 100
    mods: mods.length > 0 ? mods : ['• Standard Spire Arena Monsters']
  };
}
