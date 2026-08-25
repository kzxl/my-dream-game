/**
 * Procedural Map, Deterministic Seeded Noise & Organic Terrain Generator for MDG (ARPG Engine)
 * Synchronized with Server-Authoritative C# Core (16 Tile Types Matrix)
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
  static generateZone(zoneId, seed = 1337) {
    let map;
    if (zoneId === 'SanctuaryHaven' || zoneId === 'GlacialOutpost' || zoneId === 'AshenRedoubt' || zoneId === 'OasisSanctum' || zoneId === 'AethelisCitadel') {
      map = this.generateHaven(64, 64);
    } else if (zoneId === 'WhisperingPlains') {
      map = this.generatePlains(128, 128);
    } else if (zoneId === 'VerdantCanopy') {
      map = this.generateCanopy(128, 128);
    } else if (zoneId === 'ForgottenCrypt' || zoneId === 'DreadTombs' || zoneId === 'NecropolisOfSouls') {
      map = this.generateCryptDungeon(96, 96);
    } else if (zoneId === 'FrostpeakTundra') {
      map = this.generateTundra(128, 128);
    } else if (zoneId === 'HowlingIceCaverns') {
      map = this.generateIceCaverns(128, 128);
    } else if (zoneId === 'StormpeakRidge') {
      map = this.generateStormpeak(128, 128);
    } else if (zoneId === 'ObsidianWastes') {
      map = this.generateObsidianWastes(128, 128);
    } else if (zoneId === 'MoltenCaldera' || zoneId === 'InfernalHeart') {
      map = this.generateCaldera(128, 128);
    } else if (zoneId === 'ShiftingDunes') {
      map = this.generateShiftingDunes(128, 128);
    } else if (zoneId === 'VoidAbyss' || zoneId === 'CitadelOfTheVoid') {
      map = this.generateVoidAbyss(96, 96);
    } else if (zoneId === 'SpireArena') {
      map = this.generateSpireArena(64, 64);
    } else {
      map = this.generateHaven(64, 64);
    }

    // Ensure connectivity
    this.ensurePortalsReachable(map);
    return map;
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
      spawnX: cx * TILE_SIZE,
      spawnY: cy * TILE_SIZE,
      portals: [
        { x: (w - 3) * TILE_SIZE, y: cy * TILE_SIZE, targetZone: 'WhisperingPlains', targetX: 250, targetY: (h / 2) * TILE_SIZE, name: '🌀 To Whispering Plains' },
        { x: cx * TILE_SIZE, y: (h - 3) * TILE_SIZE, targetZone: 'ForgottenCrypt', targetX: 400, targetY: 400, name: '🏰 To Forgotten Crypt' }
      ]
    };
  }

  // =========================================================================
  // 2. WHISPERING PLAINS (128x128 - 6144x6144 px)
  // =========================================================================
  static generatePlains(w = 128, h = 128) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    const riverBaseX = Math.floor(w / 2);
    const bridgeYPositions = [25, 50, 75, 100];

    // Winding River
    for (let y = 1; y < h - 1; y++) {
      const wave = Math.sin(y / 9.0) * 11.0 + Math.cos(y / 4.5) * 4.0;
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
      for (let dy = -1; dy <= 1; dy++) {
        const y = by + dy;
        for (let x = riverBaseX - 15; x <= riverBaseX + 15; x++) {
          if (grid[y][x] === TILE_TYPES.WATER_DEEP || grid[y][x] === TILE_TYPES.SHALLOW_WATER_SAND) {
            grid[y][x] = TILE_TYPES.PATH;
          }
        }
      }
    });

    // Camouflage Stealth Bushes Clusters
    for (let cy = 8; cy < h - 8; cy += 14) {
      for (let cx = 8; cx < w - 8; cx += 16) {
        if (grid[cy][cx] === TILE_TYPES.FLOOR) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              if (Math.random() < 0.75 && grid[cy + dy][cx + dx] === TILE_TYPES.FLOOR) {
                grid[cy + dy][cx + dx] = TILE_TYPES.CAMOUFLAGE_BUSH;
              }
            }
          }
        }
      }
    }

    // Secret Destructible Barricades (Tile 15)
    for (let i = 0; i < 5; i++) {
      const bx = 25 + i * 18;
      const by = 35 + (i % 2) * 45;
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
      levelRange: 'Lv. 5-12',
      hazard: {
        hazardName: 'Wild Winds',
        description: 'Dense camouflage bushes grant 80% stealth and +50% Ambush Strike damage!'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawnX: 250,
      spawnY: midY * TILE_SIZE,
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'SanctuaryHaven', targetX: 2800, targetY: 1536, name: '🌿 Back to Haven' },
        { x: (w - 3) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'FrostpeakTundra', targetX: 250, targetY: midY * TILE_SIZE, name: '❄️ To Frostpeak Tundra' },
        { x: (w / 2) * TILE_SIZE, y: (h - 3) * TILE_SIZE, targetZone: 'ForgottenCrypt', targetX: 350, targetY: 350, name: '🏰 Into Forgotten Crypt' }
      ]
    };
  }

  // =========================================================================
  // 3. FROSTPEAK TUNDRA (128x128 - 6144x6144 px)
  // =========================================================================
  static generateTundra(w = 128, h = 128) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    for (let y = 6; y < h - 6; y++) {
      for (let x = 6; x < w - 6; x++) {
        const n = Math.sin(x * 0.1) * Math.cos(y * 0.1) + Math.sin((x + y) * 0.06) * 0.4;
        if (n > 0.38) {
          grid[y][x] = TILE_TYPES.GLACIAL_ICE;
        } else if (n < -0.42) {
          grid[y][x] = TILE_TYPES.DEEP_SNOW;
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
      levelRange: 'Lv. 16-25',
      hazard: {
        hazardName: 'Permafrost Slickness',
        description: 'Slick ice fields reduce friction by 60% and boost movement speed by +25%!'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawnX: 250,
      spawnY: midY * TILE_SIZE,
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'WhisperingPlains', targetX: 5800, targetY: midY * TILE_SIZE, name: '🌾 Back to Plains' },
        { x: (w - 3) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'MoltenCaldera', targetX: 250, targetY: midY * TILE_SIZE, name: '🔥 To Molten Caldera' }
      ]
    };
  }

  // =========================================================================
  // 4. MOLTEN CALDERA (128x128 - 6144x6144 px)
  // =========================================================================
  static generateCaldera(w = 128, h = 128) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);

    for (let y = cy - 24; y <= cy + 24; y++) {
      for (let x = cx - 24; x <= cx + 24; x++) {
        const dist = Math.hypot(x - cx, y - cy);
        if (dist <= 22 && dist >= 10) {
          grid[y][x] = TILE_TYPES.LAVA;
        } else if (dist > 22 && dist <= 26) {
          grid[y][x] = TILE_TYPES.BURNT_GROUND;
        }
      }
    }

    // Obsidian Pillars
    grid[cy - 16][cx - 16] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy - 16][cx + 16] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy + 16][cx - 16] = TILE_TYPES.ANCIENT_PILLAR;
    grid[cy + 16][cx + 16] = TILE_TYPES.ANCIENT_PILLAR;

    // Breakable Obsidian Barricades
    for (let i = 0; i < 6; i++) {
      const bx = cx - 15 + i * 6;
      grid[cy - 8][bx] = TILE_TYPES.DESTRUCTIBLE_WALL;
      grid[cy + 8][bx] = TILE_TYPES.DESTRUCTIBLE_WALL;
    }

    const midY = Math.floor(h / 2);
    for (let x = cx - 24; x <= cx + 24; x++) {
      grid[cy][x] = TILE_TYPES.PATH;
      grid[cy + 1][x] = TILE_TYPES.PATH;
    }

    return {
      id: 'MoltenCaldera',
      name: 'Molten Caldera',
      subtitle: '🔥 Colossal Volcanic Crater (Lava Rivers, Magma Pools & Destructible Walls)',
      levelRange: 'Lv. 24-32',
      hazard: {
        hazardName: 'Molten Lava',
        description: 'Molten lava deals 40 Fire Dmg/s. Break obsidian walls to reveal hidden caverns!'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawnX: 250,
      spawnY: midY * TILE_SIZE,
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'FrostpeakTundra', targetX: 5800, targetY: midY * TILE_SIZE, name: '❄️ To Frostpeak' },
        { x: (w - 3) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'StormpeakRidge', targetX: 250, targetY: midY * TILE_SIZE, name: '⚡ To Stormpeak Ridge' }
      ]
    };
  }

  // =========================================================================
  // 5. STORMPEAK RIDGE (128x128 - 6144x6144 px)
  // =========================================================================
  static generateStormpeak(w = 128, h = 128) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    for (let x = 0; x < w; x++) { grid[0][x] = TILE_TYPES.WALL; grid[h - 1][x] = TILE_TYPES.WALL; }
    for (let y = 0; y < h; y++) { grid[y][0] = TILE_TYPES.WALL; grid[y][w - 1] = TILE_TYPES.WALL; }

    for (let y = 8; y < h - 8; y++) {
      for (let x = 8; x < w - 8; x++) {
        const noise = Math.sin(x * 0.12) * Math.cos(y * 0.12);
        if (noise > 0.42) {
          grid[y][x] = TILE_TYPES.CHASM;
        } else if (noise < -0.36) {
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
      levelRange: 'Lv. 30-40',
      hazard: {
        hazardName: 'Electric Leylines',
        description: 'Electric leylines empower heroes with +20% Attack/Cast Speed and +15% Lightning Dmg!'
      },
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawnX: 250,
      spawnY: midY * TILE_SIZE,
      portals: [
        { x: 120, y: midY * TILE_SIZE, targetZone: 'MoltenCaldera', targetX: 5800, targetY: midY * TILE_SIZE, name: '🔥 To Caldera' },
        { x: (w - 3) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'VoidAbyss', targetX: 350, targetY: midY * TILE_SIZE, name: '🌌 To Void Abyss' }
      ]
    };
  }

  // =========================================================================
  // 6. FORGOTTEN CRYPT DUNGEON (96x96 - 4608x4608 px)
  // =========================================================================
  static generateCryptDungeon(w = 96, h = 96) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.WALL));

    const rooms = [
      { x: 8, y: 8, rw: 20, rh: 20 },
      { x: 60, y: 8, rw: 24, rh: 20 },
      { x: 8, y: 60, rw: 20, rh: 24 },
      { x: 56, y: 56, rw: 28, rh: 28 }, // Boss chamber
      { x: 36, y: 36, rw: 24, rh: 24 }
    ];

    rooms.forEach(r => {
      for (let y = r.y; y < r.y + r.rh; y++) {
        for (let x = r.x; x < r.x + r.rw; x++) {
          const isCorner = (x === r.x && y === r.y) || (x === r.x + r.rw - 1 && y === r.y) ||
                          (x === r.x && y === r.y + r.rh - 1) || (x === r.x + r.rw - 1 && y === r.y + r.rh - 1);
          if (!isCorner) grid[y][x] = TILE_TYPES.FLOOR;
        }
      }
      if (r.rw >= 20 && r.rh >= 20) {
        grid[r.y + 4][r.x + 4] = TILE_TYPES.ANCIENT_PILLAR;
        grid[r.y + 4][r.x + r.rw - 5] = TILE_TYPES.ANCIENT_PILLAR;
        grid[r.y + r.rh - 5][r.x + 4] = TILE_TYPES.ANCIENT_PILLAR;
        grid[r.y + r.rh - 5][r.x + r.rw - 5] = TILE_TYPES.ANCIENT_PILLAR;
      }
    });

    // Toxic Miasma in boss room
    for (let y = 66; y <= 74; y++) {
      for (let x = 66; x <= 74; x++) {
        if (Math.random() < 0.6) grid[y][x] = TILE_TYPES.TOXIC_MIASMA;
      }
    }

    // Corridors
    for (let x = 18; x <= 48; x++) { grid[18][x] = TILE_TYPES.PATH; grid[19][x] = TILE_TYPES.PATH; }
    for (let y = 18; y <= 48; y++) { grid[y][48] = TILE_TYPES.PATH; grid[y][49] = TILE_TYPES.PATH; }
    for (let x = 48; x <= 70; x++) { grid[48][x] = TILE_TYPES.PATH; grid[49][x] = TILE_TYPES.PATH; }
    for (let y = 48; y <= 70; y++) { grid[y][70] = TILE_TYPES.PATH; grid[y][71] = TILE_TYPES.PATH; }

    return {
      id: 'ForgottenCrypt',
      name: 'Forgotten Crypt',
      subtitle: '💀 Multi-Chamber Catacombs (Toxic Miasma Pools & Undead Legion)',
      levelRange: 'Lv. 10-18',
      widthInTiles: w,
      heightInTiles: h,
      worldWidth: w * TILE_SIZE,
      worldHeight: h * TILE_SIZE,
      grid: grid,
      spawnX: 14 * TILE_SIZE,
      spawnY: 14 * TILE_SIZE,
      portals: [
        { x: 10 * TILE_SIZE, y: 10 * TILE_SIZE, targetZone: 'SanctuaryHaven', targetX: 1536, targetY: 2800, name: '🌿 Back to Haven' },
        { x: 74 * TILE_SIZE, y: 74 * TILE_SIZE, targetZone: 'VoidAbyss', targetX: 350, targetY: 2300, name: '🌌 To Void Abyss' }
      ]
    };
  }

  static generateCanopy(w = 128, h = 128) { return this.generatePlains(w, h); }
  static generateIceCaverns(w = 128, h = 128) { return this.generateTundra(w, h); }
  static generateObsidianWastes(w = 128, h = 128) { return this.generateCaldera(w, h); }
  static generateShiftingDunes(w = 128, h = 128) { return this.generatePlains(w, h); }
  static generateVoidAbyss(w = 96, h = 96) { return this.generateHaven(w, h); }
  static generateSpireArena(w = 64, h = 64) { return this.generateHaven(w, h); }

  static ensurePortalsReachable(map) {
    if (!map || !map.grid || !map.portals) return;
    const grid = map.grid;
    const h = grid.Count || grid.length;
    const w = grid[0].Count || grid[0].length;
    const isWalkable = tile => tile !== 1 && tile !== 2 && tile !== 10 && tile !== 11 && tile !== 15;

    const spawnTx = Math.min(w - 2, Math.max(1, Math.round(map.spawnX / TILE_SIZE)));
    const spawnTy = Math.min(h - 2, Math.max(1, Math.round(map.spawnY / TILE_SIZE)));
    grid[spawnTy][spawnTx] = TILE_TYPES.FLOOR;

    map.portals.forEach(p => {
      const ptx = Math.min(w - 2, Math.max(1, Math.round(p.x / TILE_SIZE)));
      const pty = Math.min(h - 2, Math.max(1, Math.round(p.y / TILE_SIZE)));
      grid[pty][ptx] = TILE_TYPES.PATH;
    });
  }
}
