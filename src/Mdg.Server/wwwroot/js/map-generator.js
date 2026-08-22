/**
 * Procedural Map, On-Demand Chunk Streaming & Organic Terrain Generator for MDG (ARPG Engine)
 * Vast Expanded World Maps (128x128 to 160x160 tiles) & 6 Interactive Terrain Mechanics:
 *  1. CAMOUFLAGE_BUSH (14): 80% Stealth Ambush (+50% Dmg & 100% Crit on strike from bush)
 *  2. GLACIAL_ICE (7): Inertial Drift & +25% Movement Speed
 *  3. ELECTRIC_GROUND (8): +20% Attack/Cast Speed Leyline
 *  4. TOXIC_MIASMA (6): Slow -35% & Poison Hazard
 *  5. LAVA (5): 20 Fire Dmg/s Hazard
 *  6. DESTRUCTIBLE_WALL (15): Breakable Barricade with 120 HP for secret shortcuts!
 */

export const TILE_SIZE = 48;

export const TILE_TYPES = {
  FLOOR: 0,
  WALL: 1,
  WATER_DEEP: 2,
  PATH: 3,
  PLAZA: 4,
  LAVA: 5,
  TOXIC_MIASMA: 6,
  GLACIAL_ICE: 7,
  ELECTRIC_GROUND: 8,
  SHALLOW_WATER_SAND: 9,
  ANCIENT_PILLAR: 10,
  CHASM: 11,
  DEEP_SNOW: 12,
  BURNT_GROUND: 13,
  CAMOUFLAGE_BUSH: 14,
  DESTRUCTIBLE_WALL: 15
};

export class MapGenerator {
  static generateZone(zoneId) {
    if (zoneId === 'SanctuaryHaven' || zoneId === 'GlacialOutpost' || zoneId === 'AshenRedoubt' || zoneId === 'OasisSanctum' || zoneId === 'AethelisCitadel') {
      return this.generateHaven(64, 64);
    } else if (zoneId === 'WhisperingPlains') {
      return this.generatePlains(160, 160);
    } else if (zoneId === 'VerdantCanopy') {
      return this.generateCanopy(140, 140);
    } else if (zoneId === 'ForgottenCrypt' || zoneId === 'DreadTombs' || zoneId === 'NecropolisOfSouls') {
      return this.generateCryptDungeon(128, 128);
    } else if (zoneId === 'FrostpeakTundra') {
      return this.generateTundra(160, 160);
    } else if (zoneId === 'HowlingIceCaverns') {
      return this.generateIceCaverns(128, 128);
    } else if (zoneId === 'StormpeakRidge') {
      return this.generateStormpeak(160, 160);
    } else if (zoneId === 'ObsidianWastes') {
      return this.generateObsidianWastes(140, 140);
    } else if (zoneId === 'MoltenCaldera' || zoneId === 'InfernalHeart') {
      return this.generateCaldera(160, 160);
    } else if (zoneId === 'ShiftingDunes') {
      return this.generateShiftingDunes(140, 140);
    } else if (zoneId === 'VoidAbyss' || zoneId === 'CitadelOfTheVoid') {
      return this.generateVoidAbyss(128, 128);
    } else if (zoneId === 'SpireArena') {
      return this.generateSpireArena(64, 64);
    }

    return this.generateHaven(64, 64);
  }

  // =========================================================================
  // 1. SANCTUARY HAVEN (64x64 - 3072x3072 px)
  // =========================================================================
  static generateHaven(w = 64, h = 64) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);

    // Grand Plaza Area
    for (let y = cy - 12; y <= cy + 12; y++) {
      for (let x = cx - 12; x <= cx + 12; x++) {
        if (Math.abs(x - cx) + Math.abs(y - cy) <= 16) {
          grid[y][x] = TILE_TYPES.PLAZA;
        }
      }
    }

    // Ancient Pillars
    grid[cy - 8][cx - 8] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy - 8][cx + 8] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy + 8][cx - 8] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy + 8][cx + 8] = TILE_TYPES.ANCIENT_PILLAR;

    // Sacred Lotus Pond (North)
    for (let py = cy - 22; py <= cy - 15; py++) {
      for (let px = cx - 10; px <= cx + 10; px++) {
        const dist = Math.hypot(px - cx, py - (cy - 18));
        if (dist <= 7.0) {
          grid[py][px] = dist <= 4.5 ? TILE_TYPES.WATER_DEEP : TILE_TYPES.SHALLOW_WATER_SAND;
        }
      }
    }

    // Camouflage Garden Bushes (East & West)
    for (let dy = -4; dy <= 4; dy++) {
      grid[cy + dy][cx - 16] = TILE_TYPES.CAMOUFLAGE_BUSH;
      grid[cy + dy][cx + 16] = TILE_TYPES.CAMOUFLAGE_BUSH;
    }

    // Main Roads
    for (let x = 1; x < w - 1; x++) {
      grid[cy][x] = TILE_TYPES.PATH;
      grid[cy + 1][x] = TILE_TYPES.PATH;
    }
    for (let y = 1; y < h - 1; y++) {
      grid[y][cx] = TILE_TYPES.PATH;
      grid[y][cx + 1] = TILE_TYPES.PATH;
    }

    return {
      id: 'SanctuaryHaven',
      name: 'Sanctuary Haven',
      subtitle: '🌿 Capital Haven of Aethelis (Grand Plaza, Guild District & Crafting Forge)',
      levelRange: 'Lv. 1-5',
      hazard: {
        hazardName: 'Breeze of Peace',
        description: 'Restorative winds grant +5% Life/Mana regeneration while inside the town.'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: cx * TILE_SIZE, y: cy * TILE_SIZE },
      portals: [
        { x: (w - 3) * TILE_SIZE, y: cy * TILE_SIZE, targetZone: 'WhisperingPlains', targetX: 250, targetY: (h / 2) * TILE_SIZE, name: '🌀 To Whispering Plains' },
        { x: cx * TILE_SIZE, y: (h - 3) * TILE_SIZE, targetZone: 'FrostpeakTundra', targetX: (w / 2) * TILE_SIZE, targetY: 250, name: '❄️ Journey to Frostpeak' }
      ]
    };
  }

  // =========================================================================
  // 2. WHISPERING PLAINS (160x160 - 7680x7680 px - Vast Wilderness & Camouflage Bushes)
  // =========================================================================
  static generatePlains(w = 160, h = 160) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    const riverBaseX = Math.floor(w / 2);
    const bridgeYPositions = [30, 60, 90, 120];

    // Winding River
    for (let y = 1; y < h - 1; y++) {
      const wave = Math.sin(y / 10.0) * 14.0 + Math.cos(y / 5.0) * 5.0;
      const rx = Math.round(riverBaseX + wave);

      if (rx - 3 >= 1) grid[y][rx - 3] = TILE_TYPES.SHALLOW_WATER_SAND;
      if (rx + 3 < w - 1) grid[y][rx + 3] = TILE_TYPES.SHALLOW_WATER_SAND;

      grid[y][rx - 2] = TILE_TYPES.WATER_DEEP;
      grid[y][rx - 1] = TILE_TYPES.WATER_DEEP;
      grid[y][rx] = TILE_TYPES.WATER_DEEP;
      grid[y][rx + 1] = TILE_TYPES.WATER_DEEP;
      grid[y][rx + 2] = TILE_TYPES.WATER_DEEP;
    }

    // Bridges
    bridgeYPositions.forEach(by => {
      for (let dy = -2; dy <= 2; dy++) {
        const y = by + dy;
        for (let x = riverBaseX - 18; x <= riverBaseX + 18; x++) {
          if (grid[y][x] === TILE_TYPES.WATER_DEEP || grid[y][x] === TILE_TYPES.SHALLOW_WATER_SAND) {
            grid[y][x] = TILE_TYPES.PATH;
          }
        }
      }
    });

    // Camouflage Stealth Bushes Clusters (Tall Grass for Ambush)
    for (let cy = 10; cy < h - 10; cy += 18) {
      for (let cx = 10; cx < w - 10; cx += 22) {
        if (grid[cy][cx] === TILE_TYPES.FLOOR) {
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -3; dx <= 3; dx++) {
              if (Math.random() < 0.75 && grid[cy + dy][cx + dx] === TILE_TYPES.FLOOR) {
                grid[cy + dy][cx + dx] = TILE_TYPES.CAMOUFLAGE_BUSH;
              }
            }
          }
        }
      }
    }

    // Secret Destructible Barricades (Blocking shortcut caves)
    for (let i = 0; i < 6; i++) {
      const bx = 30 + i * 20;
      const by = 40 + (i % 2) * 50;
      grid[by][bx] = TILE_TYPES.DESTRUCTIBLE_WALL;
      grid[by + 1][bx] = TILE_TYPES.DESTRUCTIBLE_WALL;
    }

    // Main East-West Highway
    const midY = Math.floor(h / 2);
    for (let x = 1; x < w - 1; x++) {
      if (grid[midY][x] !== TILE_TYPES.WATER_DEEP) {
        grid[midY][x] = TILE_TYPES.PATH;
        grid[midY + 1][x] = TILE_TYPES.PATH;
      }
    }

    return {
      id: 'WhisperingPlains',
      name: 'Whispering Plains',
      subtitle: '🌾 Vast Wilderness with Winding River, Beast Outposts & Camouflage Ambush Bushes',
      levelRange: 'Lv. 5-15',
      hazard: {
        hazardName: 'Wild Winds',
        description: 'Dense camouflage bushes grant 80% stealth and +50% Ambush Strike damage!'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 250, y: midY * TILE_SIZE },
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'SanctuaryHaven', targetX: 2800, targetY: 1536, name: '🌿 Back to Haven' },
        { x: (w - 3) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'FrostpeakTundra', targetX: 250, targetY: midY * TILE_SIZE, name: '❄️ To Frostpeak Tundra' },
        { x: (w / 2) * TILE_SIZE, y: (h - 3) * TILE_SIZE, targetZone: 'ForgottenCrypt', targetX: 250, targetY: 250, name: '🏰 Into Forgotten Crypt' }
      ],
      monsterSpawns: [
        { x: 1200, y: 1200, count: 8, type: 'slime' },
        { x: 2200, y: 3500, count: 10, type: 'wolf' },
        { x: 5000, y: 1800, count: 12, type: 'goblin' },
        { x: 5500, y: 5500, count: 10, type: 'wolf' },
        { x: 3500, y: 4000, count: 8, type: 'slime' }
      ]
    };
  }

  // =========================================================================
  // 3. FROSTPEAK TUNDRA (160x160 - 7680x7680 px - Permafrost Slick Ice)
  // =========================================================================
  static generateTundra(w = 160, h = 160) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    // Glacier Permafrost Slick Ice Fields (Inertial Drifting & +25% Speed)
    for (let y = 8; y < h - 8; y++) {
      for (let x = 8; x < w - 8; x++) {
        const n = Math.sin(x * 0.12) * Math.cos(y * 0.12) + Math.sin((x + y) * 0.08) * 0.5;
        if (n > 0.45) {
          grid[y][x] = TILE_TYPES.GLACIAL_ICE;
        } else if (n < -0.55) {
          grid[y][x] = TILE_TYPES.WALL;
        }
      }
    }

    const midY = Math.floor(h / 2);
    for (let x = 1; x < w - 1; x++) {
      grid[midY][x] = TILE_TYPES.PATH;
      grid[midY + 1][x] = TILE_TYPES.PATH;
    }

    return {
      id: 'FrostpeakTundra',
      name: 'Frostpeak Tundra',
      subtitle: '❄️ Endless Permafrost Glacier (Slick Ice Fields & Howling Cryomancers)',
      levelRange: 'Lv. 15-28',
      hazard: {
        hazardName: 'Permafrost Slickness',
        description: 'Slick ice fields reduce friction by 60% and boost movement speed by +25%!'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 250, y: midY * TILE_SIZE },
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'WhisperingPlains', targetX: 7400, targetY: midY * TILE_SIZE, name: '🌾 Back to Plains' },
        { x: (w - 3) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'MoltenCaldera', targetX: 250, targetY: midY * TILE_SIZE, name: '🔥 To Molten Caldera' }
      ],
      monsterSpawns: [
        { x: 1800, y: 1800, count: 8, type: 'frost_ghoul' },
        { x: 4500, y: 3500, count: 9, type: 'frost_golem' },
        { x: 6000, y: 5500, count: 10, type: 'frost_ghoul' }
      ]
    };
  }

  // =========================================================================
  // 4. MOLTEN CALDERA (160x160 - 7680x7680 px - Lava & Destructible Rocks)
  // =========================================================================
  static generateCaldera(w = 160, h = 160) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);

    // Multi-Caldera Magma Chambers
    for (let y = 10; y < h - 10; y++) {
      for (let x = 10; x < w - 10; x++) {
        const dist = Math.hypot(x - cx, y - cy);
        if (dist <= 28 && dist >= 12) {
          grid[y][x] = TILE_TYPES.LAVA;
        } else if (dist > 28 && dist <= 33) {
          grid[y][x] = TILE_TYPES.BURNT_GROUND;
        }
      }
    }

    // Breakable Obsidian Barricades
    for (let i = 0; i < 8; i++) {
      const bx = cx - 20 + i * 5;
      grid[cy - 10][bx] = TILE_TYPES.DESTRUCTIBLE_WALL;
      grid[cy + 10][bx] = TILE_TYPES.DESTRUCTIBLE_WALL;
    }

    const midY = Math.floor(h / 2);
    for (let x = 1; x < w - 1; x++) {
      grid[midY][x] = TILE_TYPES.PATH;
      grid[midY + 1][x] = TILE_TYPES.PATH;
    }

    return {
      id: 'MoltenCaldera',
      name: 'Molten Caldera',
      subtitle: '🔥 Colossal Volcanic Crater (Lava Rivers, Magma Pools & Destructible Walls)',
      levelRange: 'Lv. 28-45',
      hazard: {
        hazardName: 'Molten Lava',
        description: 'Molten lava deals 20 Fire Dmg/s. Break obsidian walls to reveal hidden caverns!'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 250, y: midY * TILE_SIZE },
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'FrostpeakTundra', targetX: 7400, targetY: midY * TILE_SIZE, name: '❄️ To Frostpeak' },
        { x: (w - 3) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'StormpeakRidge', targetX: 250, targetY: midY * TILE_SIZE, name: '⚡ To Stormpeak Ridge' }
      ],
      monsterSpawns: [
        { x: 2000, y: 2000, count: 9, type: 'fire_imp' },
        { x: 5000, y: 5000, count: 10, type: 'magma_golem' }
      ]
    };
  }

  // =========================================================================
  // 5. STORMPEAK RIDGE (160x160 - 7680x7680 px - Electric Leylines)
  // =========================================================================
  static generateStormpeak(w = 160, h = 160) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    for (let y = 10; y < h - 10; y++) {
      for (let x = 10; x < w - 10; x++) {
        const noise = Math.sin(x * 0.15) * Math.cos(y * 0.15);
        if (noise > 0.42) {
          grid[y][x] = TILE_TYPES.CHASM;
        } else if (noise < -0.38) {
          grid[y][x] = TILE_TYPES.ELECTRIC_GROUND;
        }
      }
    }

    const midY = Math.floor(h / 2);
    for (let x = 1; x < w - 1; x++) {
      grid[midY][x] = TILE_TYPES.PATH;
      grid[midY + 1][x] = TILE_TYPES.PATH;
    }

    return {
      id: 'StormpeakRidge',
      name: 'Stormpeak Ridge',
      subtitle: '⚡ High Mountain Peaks (Electric Leylines: +20% Cast Speed & Thunder Storms)',
      levelRange: 'Lv. 40-55',
      hazard: {
        hazardName: 'Electric Leylines',
        description: 'Electric leylines empower heroes with +20% Attack/Cast Speed and +15% Lightning Dmg!'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 250, y: midY * TILE_SIZE },
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'MoltenCaldera', targetX: 7400, targetY: midY * TILE_SIZE, name: '🔥 To Caldera' },
        { x: (w - 3) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'VoidAbyss', targetX: 250, targetY: midY * TILE_SIZE, name: '🌌 To Void Abyss' }
      ]
    };
  }

  // =========================================================================
  // 6. FORGOTTEN CRYPT DUNGEON (128x128 - 6144x6144 px - Toxic Miasma)
  // =========================================================================
  static generateCryptDungeon(w = 128, h = 128) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.WALL));

    const rooms = [
      { x: 10, y: 10, rw: 24, rh: 24 },
      { x: 75, y: 10, rw: 28, rh: 24 },
      { x: 10, y: 75, rw: 24, rh: 28 },
      { x: 75, y: 75, rw: 32, rh: 32 },
      { x: 45, y: 45, rw: 28, rh: 28 }
    ];

    rooms.forEach(r => {
      for (let y = r.y; y < r.y + r.rh; y++) {
        for (let x = r.x; x < r.x + r.rw; x++) {
          grid[y][x] = TILE_TYPES.FLOOR;
        }
      }
    });

    // Toxic Miasma Pools in central crypt
    for (let y = 52; y <= 66; y++) {
      for (let x = 52; x <= 66; x++) {
        if (Math.random() < 0.6) grid[y][x] = TILE_TYPES.TOXIC_MIASMA;
      }
    }

    // Corridors
    for (let x = 20; x <= 90; x++) { grid[20][x] = TILE_TYPES.FLOOR; grid[21][x] = TILE_TYPES.FLOOR; }
    for (let x = 20; x <= 90; x++) { grid[85][x] = TILE_TYPES.FLOOR; grid[86][x] = TILE_TYPES.FLOOR; }
    for (let y = 20; y <= 85; y++) { grid[y][55] = TILE_TYPES.FLOOR; grid[y][56] = TILE_TYPES.FLOOR; }

    return {
      id: 'ForgottenCrypt',
      name: 'Forgotten Crypt',
      subtitle: '💀 Multi-Chamber Catacombs (Toxic Miasma Pools & Undead Legion)',
      levelRange: 'Lv. 12-22',
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 18 * TILE_SIZE, y: 18 * TILE_SIZE },
      portals: [
        { x: 14 * TILE_SIZE, y: 14 * TILE_SIZE, targetZone: 'WhisperingPlains', targetX: 3800, targetY: 7400, name: '🌾 Back to Plains' }
      ]
    };
  }

  static generateCanopy(w = 140, h = 140) { return this.generatePlains(w, h); }
  static generateIceCaverns(w = 128, h = 128) { return this.generateTundra(w, h); }
  static generateObsidianWastes(w = 140, h = 140) { return this.generateCaldera(w, h); }
  static generateShiftingDunes(w = 140, h = 140) { return this.generatePlains(w, h); }
  static generateVoidAbyss(w = 128, h = 128) { return this.generateHaven(w, h); }
  static generateSpireArena(w = 64, h = 64) { return this.generateHaven(w, h); }
}
