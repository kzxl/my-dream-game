/**
 * Procedural Map & Organic Terrain Generator for MDG (ARPG Engine)
 * Biomes:
 *  1. Sanctuary Haven: 40x40 (Grand Town Plaza, Crafting District, Training Arena)
 *  2. Whispering Plains: 64x64 (Expansive Wilderness, Winding Rivers, Outposts)
 *  3. Forgotten Crypt: 60x60 (Multi-Chamber Catacombs & Toxic Miasma)
 *  4. Frostpeak Tundra: 60x60 (Permafrost Glacier, Deep Snow & Ice Caves)
 *  5. Molten Caldera: 60x60 (Volcanic Crater, Magma Rivers & Obsidian Islands)
 *  6. Stormpeak Ridge: 64x64 (High Mountain Peaks, Static Lightning & Chasms)
 *  7. Void Abyss: 60x60 (Cosmic Arena & Malakor's Pinnacle Gateway)
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
  BURNT_GROUND: 13
};

export class MapGenerator {
  static generateZone(zoneId) {
    if (zoneId === 'SanctuaryHaven' || zoneId === 'GlacialOutpost' || zoneId === 'AshenRedoubt' || zoneId === 'OasisSanctum' || zoneId === 'AethelisCitadel') {
      return this.generateHaven(40, 40);
    } else if (zoneId === 'WhisperingPlains') {
      return this.generatePlains(64, 64);
    } else if (zoneId === 'VerdantCanopy') {
      return this.generateCanopy(64, 64);
    } else if (zoneId === 'ForgottenCrypt' || zoneId === 'DreadTombs' || zoneId === 'NecropolisOfSouls') {
      return this.generateCryptDungeon(60, 60);
    } else if (zoneId === 'FrostpeakTundra') {
      return this.generateTundra(60, 60);
    } else if (zoneId === 'HowlingIceCaverns') {
      return this.generateIceCaverns(60, 60);
    } else if (zoneId === 'StormpeakRidge') {
      return this.generateStormpeak(64, 64);
    } else if (zoneId === 'ObsidianWastes') {
      return this.generateObsidianWastes(60, 60);
    } else if (zoneId === 'MoltenCaldera' || zoneId === 'InfernalHeart') {
      return this.generateCaldera(60, 60);
    } else if (zoneId === 'ShiftingDunes') {
      return this.generateShiftingDunes(60, 60);
    } else if (zoneId === 'VoidAbyss' || zoneId === 'CitadelOfTheVoid') {
      return this.generateVoidAbyss(60, 60);
    }

    return this.generateHaven(40, 40);
  }

  // 1. SANCTUARY HAVEN (40x40 - 1920x1920 px)
  static generateHaven(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);

    for (let y = cy - 8; y <= cy + 8; y++) {
      for (let x = cx - 8; x <= cx + 8; x++) {
        if (Math.abs(x - cx) + Math.Abs(y - cy) <= 11) {
          grid[y][x] = TILE_TYPES.PLAZA;
        }
      }
    }

    grid[cy - 5][cx - 5] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy - 5][cx + 5] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy + 5][cx - 5] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy + 5][cx + 5] = TILE_TYPES.ANCIENT_PILLAR;

    // North Pond & Garden
    for (let py = 5; py <= 10; py++) {
      for (let px = 8; px <= 14; px++) {
        grid[py][px] = (py === 5 || py === 10 || px === 8 || px === 14) ? TILE_TYPES.SHALLOW_WATER_SAND : TILE_TYPES.WATER_DEEP;
      }
    }

    for (let x = cx + 7; x < w - 1; x++) {
      grid[cy - 1][x] = TILE_TYPES.PATH;
      grid[cy][x] = TILE_TYPES.PATH;
      grid[cy + 1][x] = TILE_TYPES.PATH;
    }

    for (let y = cy + 7; y < h - 1; y++) {
      grid[y][cx - 1] = TILE_TYPES.PATH;
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
        { x: (w - 2) * TILE_SIZE, y: cy * TILE_SIZE, targetZone: 'WhisperingPlains', targetX: 220, targetY: 1536, name: '🌀 To Whispering Plains' },
        { x: cx * TILE_SIZE, y: (h - 2) * TILE_SIZE, targetZone: 'ForgottenCrypt', targetX: 280, targetY: 280, name: '🏰 To Forgotten Crypt' }
      ],
      npcs: [
        { x: (cx - 4) * TILE_SIZE, y: (cy - 3) * TILE_SIZE, name: 'Doran (Blacksmith)', title: 'Master Crafter', color: '#e5c07b' },
        { x: (cx + 4) * TILE_SIZE, y: (cy - 3) * TILE_SIZE, name: 'Elder Aethel', title: 'Sage of Aethelis', color: '#61afef' },
        { x: (cx - 4) * TILE_SIZE, y: (cy + 3) * TILE_SIZE, name: 'Kaelen (Stash Keeper)', title: 'Shared Vault', color: '#ffd700' }
      ],
      trainingDummies: [
        { x: (cx + 3) * TILE_SIZE, y: (cy + 5) * TILE_SIZE, name: 'Training Dummy (Alpha)' },
        { x: (cx + 5) * TILE_SIZE, y: (cy + 5) * TILE_SIZE, name: 'Training Dummy (Beta)' }
      ],
      props: [
        { x: cx * TILE_SIZE, y: cy * TILE_SIZE, type: 'campfire' },
        { x: (cx - 6) * TILE_SIZE, y: (cy - 3) * TILE_SIZE, type: 'chest' },
        { x: (cx + 6) * TILE_SIZE, y: (cy - 3) * TILE_SIZE, type: 'barrel' }
      ]
    };
  }

  // 2. WHISPERING PLAINS (64x64 - 3072x3072 px)
  static generatePlains(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    const riverBaseX = Math.floor(w / 2);
    const bridgeYPositions = [16, 32, 48];

    for (let y = 1; y < h - 1; y++) {
      const wave = Math.sin(y / 5.5) * 6.5 + Math.cos(y / 2.8) * 2.2;
      const rx = Math.round(riverBaseX + wave);

      if (rx - 2 >= 1) grid[y][rx - 2] = TILE_TYPES.SHALLOW_WATER_SAND;
      if (rx + 2 < w - 1) grid[y][rx + 2] = TILE_TYPES.SHALLOW_WATER_SAND;

      grid[y][rx - 1] = TILE_TYPES.WATER_DEEP;
      grid[y][rx] = TILE_TYPES.WATER_DEEP;
      grid[y][rx + 1] = TILE_TYPES.WATER_DEEP;
    }

    bridgeYPositions.forEach(by => {
      for (let dy = -1; dy <= 1; dy++) {
        const y = by + dy;
        for (let x = riverBaseX - 8; x <= riverBaseX + 8; x++) {
          if (grid[y][x] === TILE_TYPES.WATER_DEEP || grid[y][x] === TILE_TYPES.SHALLOW_WATER_SAND) {
            grid[y][x] = TILE_TYPES.PATH;
          }
        }
      }
    });

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
      subtitle: '🌾 Vast Wilderness with Winding River, Beast Outposts & Ancient Ruins',
      levelRange: 'Lv. 5-12',
      hazard: {
        hazardName: 'Wild Winds',
        description: 'Howling crosswinds increase monster movement speed by +15%.'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 220, y: midY * TILE_SIZE },
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'SanctuaryHaven', targetX: 1800, targetY: 960, name: '🌿 Back to Haven' },
        { x: (w - 2) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'FrostpeakTundra', targetX: 220, targetY: 1440, name: '❄️ To Frostpeak Tundra' }
      ],
      monsterSpawns: [
        { x: 600, y: 600, count: 6, type: 'slime' },
        { x: 750, y: 1800, count: 7, type: 'wolf' },
        { x: 2100, y: 700, count: 8, type: 'goblin' },
        { x: 2300, y: 2200, count: 7, type: 'wolf' },
        { x: 1500, y: 1500, count: 5, type: 'slime' }
      ]
    };
  }

  // 3. FORGOTTEN CRYPT (60x60 - 2880x2880 px)
  static generateCryptDungeon(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.WALL));

    const rooms = [
      { x: 5, y: 5, rw: 14, rh: 14 },
      { x: 38, y: 5, rw: 16, rh: 14 },
      { x: 5, y: 38, rw: 14, rh: 16 },
      { x: 36, y: 36, rw: 18, rh: 18 },
      { x: 22, y: 22, rw: 16, rh: 16 },
      { x: 5, y: 22, rw: 12, rh: 12 },
      { x: 42, y: 22, rw: 12, rh: 12 }
    ];

    rooms.forEach(r => {
      for (let y = r.y; y < r.y + r.rh; y++) {
        for (let x = r.x; x < r.x + r.rw; x++) {
          const isCorner = (x === r.x && y === r.y) || (x === r.x + r.rw - 1 && y === r.y) ||
                          (x === r.x && y === r.y + r.rh - 1) || (x === r.x + r.rw - 1 && y === r.y + r.rh - 1);
          if (!isCorner) grid[y][x] = TILE_TYPES.FLOOR;
        }
      }

      if (r.rw >= 14 && r.rh >= 14) {
        grid[r.y + 3][r.x + 3] = TILE_TYPES.ANCIENT_PILLAR;
        grid[r.y + 3][r.x + r.rw - 4] = TILE_TYPES.ANCIENT_PILLAR;
        grid[r.y + r.rh - 4][r.x + 3] = TILE_TYPES.ANCIENT_PILLAR;
        grid[r.y + r.rh - 4][r.x + r.rw - 4] = TILE_TYPES.ANCIENT_PILLAR;

        if (r.x === 36) {
          grid[r.y + Math.floor(r.rh / 2)][r.x + Math.floor(r.rw / 2)] = TILE_TYPES.TOXIC_MIASMA;
          grid[r.y + Math.floor(r.rh / 2) + 1][r.x + Math.floor(r.rw / 2)] = TILE_TYPES.TOXIC_MIASMA;
          grid[r.y + Math.floor(r.rh / 2)][r.x + Math.floor(r.rw / 2) + 1] = TILE_TYPES.TOXIC_MIASMA;
        }
      }
    });

    const carve = (x1, y1, x2, y2) => {
      let curX = x1, curY = y1;
      while (curX !== x2) {
        grid[curY][curX] = TILE_TYPES.PATH;
        grid[curY + 1][curX] = TILE_TYPES.PATH;
        curX += (x2 > curX) ? 1 : -1;
      }
      while (curY !== y2) {
        grid[curY][curX] = TILE_TYPES.PATH;
        grid[curY][curX + 1] = TILE_TYPES.PATH;
        curY += (y2 > curY) ? 1 : -1;
      }
    };

    carve(12, 12, 30, 12);
    carve(30, 12, 30, 30);
    carve(12, 30, 30, 30);
    carve(12, 12, 12, 45);
    carve(30, 30, 45, 45);
    carve(12, 28, 48, 28);

    return {
      id: 'ForgottenCrypt',
      name: 'Forgotten Crypt',
      subtitle: '🏰 Ancient Multi-Chamber Catacombs (Toxic Miasma & Undead Dread)',
      levelRange: 'Lv. 10-18',
      hazard: {
        hazardName: 'Curse of Miasma',
        description: 'Deadly toxic miasma. Stepping on Toxic Miasma deals 30 Chaos Dmg/s. Reduces Flask recovery if Chaos Resistance < 50%!'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 8 * TILE_SIZE, y: 8 * TILE_SIZE },
      portals: [
        { x: 6 * TILE_SIZE, y: 6 * TILE_SIZE, targetZone: 'SanctuaryHaven', targetX: 960, targetY: 1800, name: '🌿 Back to Haven' },
        { x: 48 * TILE_SIZE, y: 48 * TILE_SIZE, targetZone: 'VoidAbyss', targetX: 240, targetY: 1440, name: '🌌 To Void Abyss' }
      ],
      monsterSpawns: [
        { x: 600, y: 600, count: 6, type: 'skeleton' },
        { x: 2100, y: 600, count: 7, type: 'undead_knight' },
        { x: 600, y: 2100, count: 6, type: 'skeleton' },
        { x: 2200, y: 2200, count: 1, type: 'boss' }
      ]
    };
  }

  // 4. FROSTPEAK TUNDRA (60x60 - 2880x2880 px)
  static generateTundra(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    for (let y = 6; y < h - 6; y++) {
      for (let x = 6; x < w - 6; x++) {
        const noise = Math.sin(x * 0.22) * Math.cos(y * 0.25);
        if (noise > 0.45) {
          grid[y][x] = TILE_TYPES.GLACIAL_ICE;
        } else if (noise < -0.42) {
          grid[y][x] = TILE_TYPES.DEEP_SNOW;
        }
      }
    }

    const midY = Math.floor(h / 2);
    for (let x = 1; x < w - 1; x++) {
      grid[midY][x] = TILE_TYPES.PATH;
    }

    return {
      id: 'FrostpeakTundra',
      name: 'Frostpeak Tundra',
      subtitle: '❄️ Permafrost Glacier (Glacial Fissures, Blizzards & Ice Golems)',
      levelRange: 'Lv. 16-25',
      hazard: {
        hazardName: 'Permafrost Blizzard',
        description: 'Freezing cold hazards. If Cold Resistance < 75%, attacks have a 35% chance to Freeze you for 1.0s!'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 220, y: midY * TILE_SIZE },
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'WhisperingPlains', targetX: 2950, targetY: 1536, name: '🌾 To Plains' },
        { x: (w - 2) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'MoltenCaldera', targetX: 220, targetY: 1440, name: '🔥 To Molten Caldera' }
      ],
      monsterSpawns: [
        { x: 800, y: 800, count: 7, type: 'frost_golem' },
        { x: 2000, y: 1800, count: 8, type: 'frost_golem' },
        { x: 1500, y: 800, count: 7, type: 'wolf' }
      ]
    };
  }

  // 5. MOLTEN CALDERA (60x60 - 2880x2880 px)
  static generateCaldera(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);

    for (let y = cy - 12; y <= cy + 12; y++) {
      for (let x = cx - 12; x <= cx + 12; x++) {
        const dist = Math.hypot(x - cx, y - cy);
        if (dist <= 11.5 && dist >= 5.0) {
          grid[y][x] = TILE_TYPES.LAVA;
        } else if (dist > 11.5 && dist <= 13.5) {
          grid[y][x] = TILE_TYPES.BURNT_GROUND;
        }
      }
    }

    grid[cy - 8][cx - 8] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy - 8][cx + 8] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy + 8][cx - 8] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy + 8][cx + 8] = TILE_TYPES.ANCIENT_PILLAR;

    for (let x = cx - 12; x <= cx + 12; x++) {
      grid[cy][x] = TILE_TYPES.PATH;
      grid[cy + 1][x] = TILE_TYPES.PATH;
    }

    const midY = Math.floor(h / 2);
    return {
      id: 'MoltenCaldera',
      name: 'Molten Caldera',
      subtitle: '🔥 Volcanic Crater (Lava Fissures, Sulfur Pools & Magma Behemoths)',
      levelRange: 'Lv. 24-32',
      hazard: {
        hazardName: 'Scorching Heatwave',
        description: 'Molten magma terrain. Standing on Lava deals 40 Fire Dmg/s. Heatwave deals damage if Fire Resistance < 75%!'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 220, y: midY * TILE_SIZE },
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'FrostpeakTundra', targetX: 2750, targetY: 1440, name: '❄️ To Frostpeak' },
        { x: (w - 2) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'StormpeakRidge', targetX: 220, targetY: 1536, name: '⚡ To Stormpeak Ridge' }
      ],
      monsterSpawns: [
        { x: 800, y: 800, count: 7, type: 'fire_imp' },
        { x: 2000, y: 2000, count: 7, type: 'magma_golem' },
        { x: 1440, y: 1440, count: 8, type: 'magma_golem' }
      ]
    };
  }

  // 6. STORMPEAK RIDGE (64x64 - 3072x3072 px)
  static generateStormpeak(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    for (let y = 6; y < h - 6; y++) {
      for (let x = 6; x < w - 6; x++) {
        const noise = Math.sin(x * 0.28) * Math.cos(y * 0.28);
        if (noise > 0.48) {
          grid[y][x] = TILE_TYPES.CHASM;
        } else if (noise < -0.42) {
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
      subtitle: '⚡ High Mountain Peaks (Static Lightning Storms & Thunder Drakes)',
      levelRange: 'Lv. 30-40',
      hazard: {
        hazardName: 'Static Overload',
        description: 'Fierce lightning strikes. Standing on Static Ground deals 25 Lightning Dmg/s and applies Shock (+25% damage taken)!'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 220, y: midY * TILE_SIZE },
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'MoltenCaldera', targetX: 2750, targetY: 1440, name: '🔥 To Caldera' },
        { x: (w - 2) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'VoidAbyss', targetX: 240, targetY: 1440, name: '🌌 To Void Abyss' }
      ],
      monsterSpawns: [
        { x: 900, y: 900, count: 7, type: 'goblin' },
        { x: 2200, y: 2000, count: 8, type: 'undead_knight' },
        { x: 1600, y: 1200, count: 6, type: 'frost_golem' }
      ]
    };
  }

  // 7. VOID ABYSS (60x60 - 2880x2880 px)
  static generateVoidAbyss(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.CHASM));
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);

    for (let y = cy - 14; y <= cy + 14; y++) {
      for (let x = cx - 14; x <= cx + 14; x++) {
        const dist = Math.hypot(x - cx, y - cy);
        if (dist <= 13.0) {
          grid[y][x] = TILE_TYPES.FLOOR;
        }
      }
    }

    for (let y = cy - 6; y <= cy + 6; y++) {
      for (let x = cx - 6; x <= cx + 6; x++) {
        if (Math.abs(x - cx) + Math.abs(y - cy) <= 8) {
          grid[y][x] = TILE_TYPES.PLAZA;
        }
      }
    }

    grid[cy - 6][cx - 6] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy - 6][cx + 6] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy + 6][cx - 6] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy + 6][cx + 6] = TILE_TYPES.ANCIENT_PILLAR;

    for (let x = 4; x <= cx - 13; x++) {
      grid[cy][x] = TILE_TYPES.PATH;
      grid[cy + 1][x] = TILE_TYPES.PATH;
    }

    return {
      id: 'VoidAbyss',
      name: 'The Void Abyss',
      subtitle: '🌌 Apex Realm of Malakor (Endgame Cosmic Arena & Rift Gateway)',
      levelRange: 'Lv. 40-50 (Pinnacle)',
      hazard: {
        hazardName: 'Abyssal Singularity',
        description: 'Cosmic void energy. High Chaos & Elemental resistances required to survive the Primordial Storm!'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 6 * TILE_SIZE, y: cy * TILE_SIZE },
      portals: [
        { x: 5 * TILE_SIZE, y: cy * TILE_SIZE, targetZone: 'StormpeakRidge', targetX: 2950, targetY: 1536, name: '⚡ To Stormpeak' }
      ],
      monsterSpawns: [
        { x: cx * TILE_SIZE, y: cy * TILE_SIZE, count: 1, type: 'boss' },
        { x: (cx - 8) * TILE_SIZE, y: (cy - 8) * TILE_SIZE, count: 6, type: 'undead_knight' },
        { x: (cx + 8) * TILE_SIZE, y: (cy + 8) * TILE_SIZE, count: 6, type: 'fire_imp' }
      ]
    };
  }

  // 8. VERDANT CANOPY (64x64)
  static generateCanopy(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    const midY = Math.floor(h / 2);
    for (let x = 1; x < w - 1; x++) {
      grid[midY][x] = TILE_TYPES.PATH;
      grid[midY + 1][x] = TILE_TYPES.PATH;
    }

    for (let y = 4; y < h - 4; y += 4) {
      for (let x = 4; x < w - 4; x += 4) {
        if (Math.abs(y - midY) > 3) {
          grid[y][x] = TILE_TYPES.ANCIENT_PILLAR;
          if ((x + y) % 6 === 0) grid[y][x + 1] = TILE_TYPES.TOXIC_MIASMA;
        }
      }
    }

    return {
      id: 'VerdantCanopy',
      name: 'Verdant Canopy',
      subtitle: '🌲 Ancient Bioluminescent Forest & Spider Brood',
      levelRange: 'Lv. 9-12',
      hazard: { hazardName: 'Poison Spores', description: 'Webs slow movement. Toxic spores deal Chaos damage.' },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 350, y: midY * TILE_SIZE },
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'WhisperingPlains', targetX: 2650, targetY: midY * TILE_SIZE, name: '🌾 Return to Plains' },
        { x: (w - 2) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'ForgottenCrypt', targetX: 550, targetY: 550, name: '🏰 Enter Forgotten Crypt' }
      ],
      monsterSpawns: [
        { x: 800, y: 800, count: 8, type: 'spider' },
        { x: 2000, y: 1800, count: 7, type: 'wolf' }
      ]
    };
  }

  // 9. HOWLING ICE CAVERNS (60x60)
  static generateIceCaverns(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    const midY = Math.floor(h / 2);
    for (let x = 1; x < w - 1; x++) {
      grid[midY][x] = TILE_TYPES.PATH;
    }

    for (let y = 6; y < h - 6; y++) {
      for (let x = 6; x < w - 6; x++) {
        if (Math.abs(y - midY) > 2 && (x * y) % 7 === 0) {
          grid[y][x] = TILE_TYPES.GLACIAL_ICE;
        }
      }
    }

    return {
      id: 'HowlingIceCaverns',
      name: 'Howling Ice Caverns',
      subtitle: '🧊 Subterranean Ice Grotto & Crystal Guardians',
      levelRange: 'Lv. 22-26',
      hazard: { hazardName: 'Deep Glacial Frost', description: 'Permafrost slows speed and causes chilling spikes.' },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 350, y: midY * TILE_SIZE },
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'FrostpeakTundra', targetX: 2500, targetY: midY * TILE_SIZE, name: '❄️ Return to Tundra' },
        { x: (w - 2) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'StormpeakRidge', targetX: 400, targetY: midY * TILE_SIZE, name: '⚡ Climb Stormpeak Ridge' }
      ],
      monsterSpawns: [
        { x: 800, y: 900, count: 8, type: 'frost_golem' },
        { x: 1800, y: 1800, count: 7, type: 'frost_golem' }
      ]
    };
  }

  // 10. OBSIDIAN WASTES (60x60)
  static generateObsidianWastes(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    const midY = Math.floor(h / 2);
    for (let x = 1; x < w - 1; x++) {
      grid[midY][x] = TILE_TYPES.PATH;
      grid[midY + 1][x] = TILE_TYPES.PATH;
    }

    for (let y = 5; y < h - 5; y += 3) {
      for (let x = 5; x < w - 5; x += 3) {
        if (Math.abs(y - midY) > 3 && (x + y) % 4 === 0) {
          grid[y][x] = TILE_TYPES.BURNT_GROUND;
        }
      }
    }

    return {
      id: 'ObsidianWastes',
      name: 'Obsidian Wastes',
      subtitle: '🌋 Basalt Wilderness & Ash Storms',
      levelRange: 'Lv. 34-38',
      hazard: { hazardName: 'Ash Storm', description: 'Ash clouds obscure vision and scorching earth deals burn damage.' },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 350, y: midY * TILE_SIZE },
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'AshenRedoubt', targetX: 1632, targetY: 960, name: '🏰 Return to Redoubt' },
        { x: (w - 2) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'MoltenCaldera', targetX: 400, targetY: midY * TILE_SIZE, name: '🔥 Enter Molten Caldera' }
      ],
      monsterSpawns: [
        { x: 900, y: 900, count: 8, type: 'fire_imp' },
        { x: 1900, y: 1900, count: 7, type: 'magma_golem' }
      ]
    };
  }

  // 11. SHIFTING DUNES (60x60)
  static generateShiftingDunes(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    const midY = Math.floor(h / 2);
    for (let x = 1; x < w - 1; x++) {
      grid[midY][x] = TILE_TYPES.PATH;
      grid[midY + 1][x] = TILE_TYPES.PATH;
    }

    for (let y = 4; y < h - 4; y += 3) {
      for (let x = 4; x < w - 4; x += 3) {
        if (Math.abs(y - midY) > 3) {
          grid[y][x] = TILE_TYPES.SHALLOW_WATER_SAND;
        }
      }
    }

    return {
      id: 'ShiftingDunes',
      name: 'Shifting Dunes',
      subtitle: '🏜️ Endless Desert Canyon & Sand Wyrms',
      levelRange: 'Lv. 48-52',
      hazard: { hazardName: 'Quicksand & Sandstorms', description: 'Quicksand slows movement. Sandstorms buffet adventurers.' },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawn: { x: 350, y: midY * TILE_SIZE },
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'OasisSanctum', targetX: 1632, targetY: 960, name: '🌴 Return to Oasis' },
        { x: (w - 2) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'DreadTombs', targetX: 550, targetY: 550, name: '💀 Enter Dread Tombs' }
      ],
      monsterSpawns: [
        { x: 900, y: 900, count: 8, type: 'undead_knight' },
        { x: 2000, y: 2000, count: 8, type: 'skeleton' }
      ]
    };
  }
}
