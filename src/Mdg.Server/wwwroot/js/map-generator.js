/**
 * Procedural Map & Organic Terrain Generator for MDG (ARPG Engine)
 * Algorithms:
 *  - Sanctuary Haven: Village Plaza & Perimeter Stone Walls
 *  - Whispering Plains: Cellular Automata & Organic River/Forest Trails
 *  - Forgotten Crypt: Room-and-Corridor BSP Dungeon Generator
 *  - Molten Caldera: Volcanic Islands & Magma River Caves
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
    let widthInTiles = 32;
    let heightInTiles = 32;

    if (zoneId === 'SanctuaryHaven') {
      widthInTiles = 28; // 1344px
      heightInTiles = 28;
      return this.generateHaven(widthInTiles, heightInTiles);
    } else if (zoneId === 'WhisperingPlains') {
      widthInTiles = 40; // 1920px
      heightInTiles = 40;
      return this.generatePlains(widthInTiles, heightInTiles);
    } else if (zoneId === 'ForgottenCrypt') {
      widthInTiles = 40; // 1920px
      heightInTiles = 40;
      return this.generateCryptDungeon(widthInTiles, heightInTiles);
    } else if (zoneId === 'MoltenCaldera') {
      widthInTiles = 40; // 1920px
      heightInTiles = 40;
      return this.generateCaldera(widthInTiles, heightInTiles);
    }

    return this.generateHaven(28, 28);
  }

  // 1. SANCTUARY HAVEN (Vibrant Town Plaza with Stone Wall Boundaries)
  static generateHaven(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    const worldWidth = w * TILE_SIZE;
    const worldHeight = h * TILE_SIZE;

    // Outer Perimeter Walls
    for (let x = 0; x < w; x++) {
      grid[0][x] = TILE_TYPES.WALL;
      grid[h - 1][x] = TILE_TYPES.WALL;
    }
    for (let y = 0; y < h; y++) {
      grid[y][0] = TILE_TYPES.WALL;
      grid[y][w - 1] = TILE_TYPES.WALL;
    }

    // East Gate Opening for Portal
    const midY = Math.floor(h / 2);
    grid[midY - 1][w - 1] = TILE_TYPES.PATH;
    grid[midY][w - 1] = TILE_TYPES.PATH;
    grid[midY + 1][w - 1] = TILE_TYPES.PATH;

    // Central Stone Plaza
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);
    for (let y = cy - 5; y <= cy + 5; y++) {
      for (let x = cx - 5; x <= cx + 5; x++) {
        grid[y][x] = TILE_TYPES.PLAZA;
      }
    }

    // Cobblestone Path to East Gate
    for (let x = cx + 5; x < w - 1; x++) {
      grid[cy - 1][x] = TILE_TYPES.PATH;
      grid[cy][x] = TILE_TYPES.PATH;
      grid[cy + 1][x] = TILE_TYPES.PATH;
    }

    const spawn = { x: cx * TILE_SIZE, y: cy * TILE_SIZE };
    const portal = { x: (w - 3) * TILE_SIZE, y: cy * TILE_SIZE, targetZone: 'WhisperingPlains', targetX: 180, targetY: 960, name: '🌀 To Whispering Plains' };

    const npcs = [
      { x: (cx - 3) * TILE_SIZE, y: (cy - 2) * TILE_SIZE, name: 'Doran (Blacksmith)', title: 'Blacksmith & Crafter', color: '#e5c07b' },
      { x: (cx + 3) * TILE_SIZE, y: (cy - 2) * TILE_SIZE, name: 'Elder Aethel', title: 'Sage of Aethelis', color: '#61afef' },
      { x: (cx - 3) * TILE_SIZE, y: (cy + 2) * TILE_SIZE, name: 'Kaelen (Stash Keeper)', title: 'Shared Vault', color: '#ffd700' }
    ];

    const dummies = [
      { x: (cx + 2) * TILE_SIZE, y: (cy + 4) * TILE_SIZE, name: 'Training Dummy (Alpha)' },
      { x: (cx + 4) * TILE_SIZE, y: (cy + 4) * TILE_SIZE, name: 'Training Dummy (Beta)' }
    ];

    const props = [
      { x: cx * TILE_SIZE, y: cy * TILE_SIZE, type: 'campfire' },
      { x: (cx - 4) * TILE_SIZE, y: (cy - 2) * TILE_SIZE, type: 'chest' },
      { x: (cx - 4) * TILE_SIZE, y: (cy + 2) * TILE_SIZE, type: 'chest' },
      { x: (cx + 4) * TILE_SIZE, y: (cy - 2) * TILE_SIZE, type: 'barrel' }
    ];

    // Decorative perimeter trees
    for (let i = 0; i < 24; i++) {
      const rx = Math.random() < 0.5 ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 4) + (w - 5);
      const ry = Math.floor(Math.random() * (h - 4)) + 2;
      if (grid[ry][rx] === TILE_TYPES.FLOOR) {
        props.push({ x: rx * TILE_SIZE, y: ry * TILE_SIZE, type: 'tree' });
      }
    }

    return { grid, w, h, worldWidth, worldHeight, spawn, portals: [portal], npcs, dummies, props, monsterSpawns: [] };
  }

  // 2. WHISPERING PLAINS (Organic Forest Pathways & Winding River)
  static generatePlains(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    const worldWidth = w * TILE_SIZE;
    const worldHeight = h * TILE_SIZE;

    // Boundaries
    for (let x = 0; x < w; x++) {
      grid[0][x] = TILE_TYPES.WALL;
      grid[h - 1][x] = TILE_TYPES.WALL;
    }
    for (let y = 0; y < h; y++) {
      grid[y][0] = TILE_TYPES.WALL;
      grid[y][w - 1] = TILE_TYPES.WALL;
    }

    // Winding River down the middle with 2 Stone Bridges
    const riverX = Math.floor(w / 2);
    for (let y = 1; y < h - 1; y++) {
      const curve = Math.round(Math.sin(y / 3.5) * 3);
      const rx = riverX + curve;
      grid[y][rx - 1] = TILE_TYPES.WATER_LAVA;
      grid[y][rx] = TILE_TYPES.WATER_LAVA;
      grid[y][rx + 1] = TILE_TYPES.WATER_LAVA;
    }

    // Bridges across river
    const bridgeY1 = Math.floor(h * 0.35);
    const bridgeY2 = Math.floor(h * 0.70);
    [bridgeY1, bridgeY2].forEach(by => {
      const rx = riverX + Math.round(Math.sin(by / 3.5) * 3);
      for (let bx = rx - 2; bx <= rx + 2; bx++) {
        grid[by - 1][bx] = TILE_TYPES.PATH;
        grid[by][bx] = TILE_TYPES.PATH;
        grid[by + 1][bx] = TILE_TYPES.PATH;
      }
    });

    // West Road to Haven, East Road to Crypt
    const midY = Math.floor(h / 2);
    for (let x = 1; x < w - 1; x++) {
      if (grid[midY][x] !== TILE_TYPES.WATER_LAVA) {
        grid[midY][x] = TILE_TYPES.PATH;
      }
    }

    const spawn = { x: 180, y: midY * TILE_SIZE };
    const portals = [
      { x: 140, y: midY * TILE_SIZE, targetZone: 'SanctuaryHaven', targetX: 1100, targetY: 672, name: '🌀 Return to Haven' },
      { x: (w - 3) * TILE_SIZE, y: midY * TILE_SIZE, targetZone: 'ForgottenCrypt', targetX: 180, targetY: midY * TILE_SIZE, name: '🌀 Enter Forgotten Crypt' }
    ];

    const props = [];
    // Random Nature Rocks & Trees
    for (let i = 0; i < 40; i++) {
      const rx = Math.floor(Math.random() * (w - 4)) + 2;
      const ry = Math.floor(Math.random() * (h - 4)) + 2;
      if (grid[ry][rx] === TILE_TYPES.FLOOR && Math.abs(rx - riverX) > 2) {
        props.push({ x: rx * TILE_SIZE, y: ry * TILE_SIZE, type: Math.random() < 0.6 ? 'tree' : 'rock' });
      }
    }

    // Dense Monster Clusters
    const monsterSpawns = [
      { x: w * 0.25 * TILE_SIZE, y: h * 0.3 * TILE_SIZE, count: 6, type: 'slime' },
      { x: w * 0.25 * TILE_SIZE, y: h * 0.75 * TILE_SIZE, count: 7, type: 'goblin' },
      { x: w * 0.75 * TILE_SIZE, y: h * 0.3 * TILE_SIZE, count: 8, type: 'goblin' },
      { x: w * 0.75 * TILE_SIZE, y: h * 0.75 * TILE_SIZE, count: 9, type: 'skeleton' }
    ];

    return { grid, w, h, worldWidth, worldHeight, spawn, portals, npcs: [], dummies: [], props, monsterSpawns };
  }

  // 3. FORGOTTEN CRYPT (BSP Dungeon: Interconnected Rooms & Corridors with Boss Chamber)
  static generateCryptDungeon(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.WALL));
    const worldWidth = w * TILE_SIZE;
    const worldHeight = h * TILE_SIZE;

    const rooms = [
      { x: 3, y: Math.floor(h / 2) - 4, w: 8, h: 8, name: 'Entrance' },
      { x: 15, y: 5, w: 10, h: 8, name: 'North Hall' },
      { x: 15, y: h - 14, w: 10, h: 9, name: 'South Crypt' },
      { x: w - 13, y: Math.floor(h / 2) - 6, w: 11, h: 12, name: 'Boss Chamber' }
    ];

    // Carve out rooms
    rooms.forEach(r => {
      for (let y = r.y; y < r.y + r.h; y++) {
        for (let x = r.x; x < r.x + r.w; x++) {
          grid[y][x] = TILE_TYPES.FLOOR;
        }
      }
    });

    // Helper: Carve Corridors
    const carveH = (x1, x2, y) => {
      const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
      for (let x = minX; x <= maxX; x++) grid[y][x] = TILE_TYPES.FLOOR;
    };
    const carveV = (y1, y2, x) => {
      const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
      for (let y = minY; y <= maxY; y++) grid[y][x] = TILE_TYPES.FLOOR;
    };

    // Connect Entrance to North & South Halls
    const entCenter = { x: 7, y: Math.floor(h / 2) };
    const northCenter = { x: 20, y: 9 };
    const southCenter = { x: 20, y: h - 10 };
    const bossCenter = { x: w - 8, y: Math.floor(h / 2) };

    carveH(entCenter.x, northCenter.x, entCenter.y);
    carveV(entCenter.y, northCenter.y, northCenter.x);

    carveH(entCenter.x, southCenter.x, entCenter.y);
    carveV(entCenter.y, southCenter.y, southCenter.x);

    // Connect Halls to Boss Chamber
    carveH(northCenter.x, bossCenter.x, northCenter.y);
    carveV(northCenter.y, bossCenter.y, bossCenter.x);

    carveH(southCenter.x, bossCenter.x, southCenter.y);
    carveV(southCenter.y, bossCenter.y, bossCenter.x);

    const spawn = { x: entCenter.x * TILE_SIZE, y: entCenter.y * TILE_SIZE };
    const portals = [
      { x: (entCenter.x - 2) * TILE_SIZE, y: entCenter.y * TILE_SIZE, targetZone: 'WhisperingPlains', targetX: 1750, targetY: 960, name: '🌀 Escape Dungeon' }
    ];

    const props = [];
    rooms.forEach(r => {
      props.push({ x: r.x * TILE_SIZE + 20, y: r.y * TILE_SIZE + 20, type: 'chest' });
      props.push({ x: (r.x + r.w - 1) * TILE_SIZE, y: (r.y + r.h - 1) * TILE_SIZE, type: 'barrel' });
    });

    const monsterSpawns = [
      { x: northCenter.x * TILE_SIZE, y: northCenter.y * TILE_SIZE, count: 7, type: 'skeleton' },
      { x: southCenter.x * TILE_SIZE, y: southCenter.y * TILE_SIZE, count: 8, type: 'goblin' },
      { x: bossCenter.x * TILE_SIZE, y: bossCenter.y * TILE_SIZE, count: 1, type: 'boss' }
    ];

    return { grid, w, h, worldWidth, worldHeight, spawn, portals, npcs: [], dummies: [], props, monsterSpawns };
  }

  // 4. MOLTEN CALDERA (Volcano Magma Rivers & Obsidian Rocks)
  static generateCaldera(w, h) {
    const grid = Array.from({ length: h }, () => Array(w).fill(TILE_TYPES.FLOOR));
    const worldWidth = w * TILE_SIZE;
    const worldHeight = h * TILE_SIZE;

    // Boundaries
    for (let x = 0; x < w; x++) {
      grid[0][x] = TILE_TYPES.WALL;
      grid[h - 1][x] = TILE_TYPES.WALL;
    }
    for (let y = 0; y < h; y++) {
      grid[y][0] = TILE_TYPES.WALL;
      grid[y][w - 1] = TILE_TYPES.WALL;
    }

    // Magma Pools
    for (let i = 0; i < 15; i++) {
      const mx = Math.floor(Math.random() * (w - 8)) + 4;
      const my = Math.floor(Math.random() * (h - 8)) + 4;
      const r = Math.floor(Math.random() * 2) + 2;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy <= r * r) {
            grid[my + dy][mx + dx] = TILE_TYPES.WATER_LAVA;
          }
        }
      }
    }

    const spawn = { x: 200, y: (h / 2) * TILE_SIZE };
    const portals = [
      { x: 150, y: (h / 2) * TILE_SIZE, targetZone: 'SanctuaryHaven', targetX: 672, targetY: 672, name: '🌀 Return to Haven' }
    ];

    const props = [];
    for (let i = 0; i < 30; i++) {
      const rx = Math.floor(Math.random() * (w - 4)) + 2;
      const ry = Math.floor(Math.random() * (h - 4)) + 2;
      if (grid[ry][rx] === TILE_TYPES.FLOOR) {
        props.push({ x: rx * TILE_SIZE, y: ry * TILE_SIZE, type: 'rock' });
      }
    }

    const monsterSpawns = [
      { x: w * 0.5 * TILE_SIZE, y: h * 0.5 * TILE_SIZE, count: 10, type: 'skeleton' },
      { x: w * 0.8 * TILE_SIZE, y: h * 0.5 * TILE_SIZE, count: 1, type: 'boss' }
    ];

    return { grid, w, h, worldWidth, worldHeight, spawn, portals, npcs: [], dummies: [], props, monsterSpawns };
  }
}
