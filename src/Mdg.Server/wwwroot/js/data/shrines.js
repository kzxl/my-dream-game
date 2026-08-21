/**
 * MDG: Aethelis - Shrines & Celestial Blessings Data Dictionary
 * 7 Unique High-Fantasy Shrine Archetypes with Custom Buff Mechanics
 */

export const SHRINE_TYPES = {
  shrine_swiftness: {
    id: 'shrine_swiftness',
    name: '⚡ Shrine of Divine Swiftness',
    buffType: 'Swiftness',
    icon: '⚡',
    color: '#00e676',
    duration: 90,
    lore: 'Infuses the hero with tempest winds. +50% Movement Speed, +40% Attack & Cast Speed, Immune to Slow/Chill.',
    description: '+50% Move Speed • +40% Attack & Cast Speed • Slow Immunity',
    mods: {
      speedMult: 1.50,
      attackSpeedMult: 1.40,
      slowImmune: true
    }
  },

  shrine_might: {
    id: 'shrine_might',
    name: '⚔️ Shrine of Cataclysmic Might',
    buffType: 'CataclysmicMight',
    icon: '⚔️',
    color: '#ff3d00',
    duration: 90,
    lore: 'Awakens primordial rage. +60% All Damage Dealt, +35% Critical Strike Chance, +75% Critical Multiplier.',
    description: '+60% All Damage • +35% Crit Chance • +75% Crit Multiplier',
    mods: {
      damageMult: 1.60,
      critChanceAdd: 35,
      critMultiAdd: 75
    }
  },

  shrine_sanctuary: {
    id: 'shrine_sanctuary',
    name: '🛡️ Shrine of Aegis Sanctuary',
    buffType: 'AegisSanctuary',
    icon: '🛡️',
    color: '#ffd700',
    duration: 90,
    lore: 'Conjures a sacred celestial shield. +80% Armor, +35% All Resistances, Regenerates 6% Max Life/sec.',
    description: '+80% Armor • +35% All Resistances • 6% Life Regen/sec',
    mods: {
      armorMult: 1.80,
      allResAdd: 35,
      lifeRegenPct: 0.06
    }
  },

  shrine_fortune: {
    id: 'shrine_fortune',
    name: '👑 Shrine of Celestial Fortune',
    buffType: 'CelestialFortune',
    icon: '👑',
    color: '#f1c40f',
    duration: 90,
    lore: 'Aligns the stars for opulent bounty. +150% Item Rarity (IIR), +100% Item Quantity (IIQ), Double Gold & EXP.',
    description: '+150% Item Rarity • +100% Quantity • 2x Gold & EXP Drops',
    mods: {
      iirAdd: 150,
      iiqAdd: 100,
      expMult: 2.0,
      goldMult: 2.0
    }
  },

  shrine_aether: {
    id: 'shrine_aether',
    name: '🔮 Shrine of Infinite Aether',
    buffType: 'InfiniteAether',
    icon: '🔮',
    color: '#00f2fe',
    duration: 90,
    lore: 'Channels the boundless font of Genesis. -50% Skill Cooldowns, 0 Mana Cost for all skills, 15% MP/ES Regen/sec.',
    description: '-50% Skill Cooldowns • Zero Mana Costs • 15% MP & ES Regen/sec',
    mods: {
      cooldownReduction: 0.50,
      zeroManaCost: true,
      manaRegenPct: 0.15,
      esRegenPct: 0.15
    }
  },

  shrine_frost: {
    id: 'shrine_frost',
    name: '❄️ Shrine of Absolute Frost',
    buffType: 'AbsoluteFrost',
    icon: '❄️',
    color: '#80deea',
    duration: 90,
    lore: 'Surrounds the hero in an icy blizzard. Attacks discharge Glacial Freezes (1.5s stun) and aura slows nearby foes by 50%.',
    description: 'Blizzard Aura (-50% Enemy Speed) • All Attacks Freeze Targets (1.5s)',
    mods: {
      frostProc: true,
      chillAura: true
    }
  },

  shrine_inferno: {
    id: 'shrine_inferno',
    name: '🔥 Shrine of Solar Inferno',
    buffType: 'SolarInferno',
    icon: '🔥',
    color: '#ff7849',
    duration: 90,
    lore: 'Ignites a blazing solar ring. Burns nearby enemies for 160 Fire DPS and triggers fiery corpse explosions on death.',
    description: 'Solar Fire Aura (160 DPS) • Corpse Explosions on Monster Defeat',
    mods: {
      fireAuraDps: 160,
      corpseExplosion: true
    }
  }
};

export const ALL_SHRINE_KEYS = Object.keys(SHRINE_TYPES);
