/**
 * MDG: Aethelis - Dynamic Map Incursions & Random Encounters Engine
 * 1. Void Breach (Expanding dimensional rift with timed monster waves & Void Cache loot explosion)
 * 2. Aethel Goblin (Treasure goblin with Flee AI, coin trail and massive loot fountain on death)
 * 3. Corrupted Shrines (Cursed shrines guarded by elite waves for double duration blessings)
 */

import { player, mapIncursions, monsters, particles, groundLoot } from '../state.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber, dropMonsterLoot } from '../combat.js';
import { POSSIBLE_LOOT } from '../data/items.js';

export function spawnMapIncursions(zoneId, zoneWidth, zoneHeight, canWalkFn) {
  mapIncursions.length = 0;
  if (zoneId === 'SanctuaryHaven') return;

  // 1. Spawn Void Breach
  const breachCoord = findValidIncursionSpot(zoneWidth, zoneHeight, canWalkFn, 300);
  if (breachCoord) {
    mapIncursions.push({
      id: `breach_${Date.now()}`,
      type: 'void_breach',
      x: breachCoord.x,
      y: breachCoord.y,
      radius: 45,
      maxRadius: 220,
      state: 'dormant', // 'dormant' | 'active' | 'completed'
      timer: 20, // 20 seconds event
      totalTime: 20,
      spawnTimer: 0,
      slainCount: 0,
      pulseTimer: 0
    });
  }

  // 2. Spawn Aethel Goblin (30% chance in combat maps)
  if (Math.random() < 0.30) {
    const goblinCoord = findValidIncursionSpot(zoneWidth, zoneHeight, canWalkFn, 400);
    if (goblinCoord) {
      monsters.push({
        id: `goblin_${Date.now()}`,
        name: 'Aethel Hoarder Goblin',
        type: 'treasure_goblin',
        rarity: 'Unique',
        family: 'Beast',
        x: goblinCoord.x,
        y: goblinCoord.y,
        vx: 0,
        vy: 0,
        speed: 210,
        life: 450,
        maxLife: 450,
        damage: 0, // Does not attack
        color: '#ffd700',
        icon: '👺',
        isGoblin: true,
        escapeTimer: 18,
        sparkleTimer: 0,
        facing: 'down',
        stats: { armor: 100, evasion: 200 }
      });
    }
  }
}

function findValidIncursionSpot(width, height, canWalkFn, minPlayerDist) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const x = Math.floor(Math.random() * (width - 200)) + 100;
    const y = Math.floor(Math.random() * (height - 200)) + 100;
    const distToPlayer = Math.hypot(x - player.x, y - player.y);

    if (distToPlayer >= minPlayerDist && (!canWalkFn || canWalkFn(x, y))) {
      return { x, y };
    }
  }
  return null;
}

export function updateMapIncursions(dt) {
  for (let i = mapIncursions.length - 1; i >= 0; i--) {
    const incursion = mapIncursions[i];
    if (!incursion) continue;

    incursion.pulseTimer = (incursion.pulseTimer || 0) + dt;

    if (incursion.type === 'void_breach') {
      const distToPlayer = Math.hypot(player.x - incursion.x, player.y - incursion.y);

      // Trigger activation when player touches the breach
      if (incursion.state === 'dormant') {
        if (distToPlayer <= 60) {
          incursion.state = 'active';
          AudioEngine.playTone(220, 'sawtooth', 0.4, 0.3);
          spawnDamageNumber(incursion.x, incursion.y - 40, '🌌 VOID BREACH OPENED!', true, '#c084fc');
        }
      } else if (incursion.state === 'active') {
        incursion.timer -= dt;

        // Expand radius smoothly
        const progress = 1 - (incursion.timer / incursion.totalTime);
        incursion.radius = 45 + progress * (incursion.maxRadius - 45);

        // Spawn ambient void particles around circle perimeter
        if (Math.random() < 0.4) {
          const angle = Math.random() * Math.PI * 2;
          const px = incursion.x + Math.cos(angle) * incursion.radius;
          const py = incursion.y + Math.sin(angle) * incursion.radius;
          particles.push({
            x: px,
            y: py,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20 - 15,
            color: Math.random() < 0.5 ? '#9333ea' : '#c084fc',
            radius: Math.random() * 4 + 2,
            life: 0.6,
            maxLife: 0.6
          });
        }

        // Spawn monster waves inside breach
        incursion.spawnTimer += dt;
        if (incursion.spawnTimer >= 2.5) {
          incursion.spawnTimer = 0;
          spawnVoidBreachWave(incursion);
        }

        // Breach completed!
        if (incursion.timer <= 0) {
          completeVoidBreach(incursion);
          mapIncursions.splice(i, 1);
        }
      }
    }
  }

  // Update Treasure Goblins Flee AI
  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    if (m && m.isGoblin) {
      m.escapeTimer -= dt;
      m.sparkleTimer = (m.sparkleTimer || 0) + dt;

      const dist = Math.hypot(player.x - m.x, player.y - m.y);

      // Flee away from player
      if (dist < 320 && dist > 1) {
        const dx = (m.x - player.x) / dist;
        const dy = (m.y - player.y) / dist;
        m.x += dx * m.speed * dt;
        m.y += dy * m.speed * dt;
      }

      // Drop gold coins/sparkles while running
      if (m.sparkleTimer >= 0.8) {
        m.sparkleTimer = 0;
        particles.push({
          x: m.x,
          y: m.y,
          vx: (Math.random() - 0.5) * 30,
          vy: -30,
          color: '#ffd700',
          radius: 3,
          life: 0.8,
          maxLife: 0.8
        });
      }

      // Escape through portal if time runs out
      if (m.escapeTimer <= 0) {
        spawnDamageNumber(m.x, m.y - 30, '🌀 GOBLIN ESCAPED!', true, '#eab308');
        AudioEngine.playTone(300, 'triangle', 0.2, 0.15);
        monsters.splice(i, 1);
      }
    }
  }
}

function spawnVoidBreachWave(incursion) {
  const spawnCount = Math.floor(Math.random() * 2) + 2;
  for (let s = 0; s < spawnCount; s++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * (incursion.radius * 0.75);
    const mx = incursion.x + Math.cos(angle) * r;
    const my = incursion.y + Math.sin(angle) * r;

    monsters.push({
      id: `void_fiend_${Date.now()}_${s}`,
      name: 'Abyssal Void Fiend',
      type: 'void_fiend',
      rarity: 'Magic',
      family: 'Fiend',
      x: mx,
      y: my,
      vx: 0,
      vy: 0,
      speed: 165,
      life: 180,
      maxLife: 180,
      damage: 24,
      color: '#a855f7',
      icon: '👾',
      stats: { armor: 80, evasion: 60 }
    });

    particles.push({
      x: mx,
      y: my,
      vx: 0,
      vy: -20,
      color: '#9333ea',
      radius: 6,
      life: 0.5,
      maxLife: 0.5
    });
  }
}

function completeVoidBreach(incursion) {
  AudioEngine.playTone(600, 'sine', 0.4, 0.3);
  spawnDamageNumber(incursion.x, incursion.y - 50, '✨ VOID BREACH CONQUERED! (VOID CACHE EXPLODED)', true, '#ffd700');

  // Spawn Void Cache Loot Explosion (Catalysts, Ores, Rare Relics)
  const lootItems = [
    { name: 'Fracture Core', slot: 'Currency', rarity: 'Rare', color: '#ffd700', icon: '🔮' },
    { name: 'Ascendant Catalyst', slot: 'Currency', rarity: 'Rare', color: '#f59e0b', icon: '✨' },
    { name: 'Adamantite Ingot', slot: 'Currency', rarity: 'Rare', color: '#ffd700', icon: '🪨' },
    POSSIBLE_LOOT[Math.floor(Math.random() * POSSIBLE_LOOT.length)]
  ];

  lootItems.forEach(item => {
    if (!item) return;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 60 + 20;
    groundLoot.push({
      id: `loot_${Date.now()}_${Math.random()}`,
      name: item.name,
      rarity: item.rarity || 'Rare',
      slot: item.slot || 'Gear',
      color: item.color || '#ffd700',
      icon: item.icon || '📦',
      x: incursion.x + Math.cos(angle) * dist,
      y: incursion.y + Math.sin(angle) * dist,
      itemData: item
    });
  });

  // Massive celebration particle ring
  for (let p = 0; p < 30; p++) {
    const angle = (p / 30) * Math.PI * 2;
    particles.push({
      x: incursion.x,
      y: incursion.y,
      vx: Math.cos(angle) * 120,
      vy: Math.sin(angle) * 120,
      color: '#c084fc',
      radius: 4,
      life: 1.0,
      maxLife: 1.0
    });
  }
}

export function renderMapIncursions(ctx) {
  mapIncursions.forEach(incursion => {
    const sx = incursion.x;
    const sy = incursion.y;

    if (incursion.type === 'void_breach') {
      ctx.save();

      if (incursion.state === 'dormant') {
        // Glowing dormant vortex
        const pulse = Math.sin(incursion.pulseTimer * 4) * 5;
        const grad = ctx.createRadialGradient(sx, sy, 5, sx, sy, 35 + pulse);
        grad.addColorStop(0, 'rgba(168, 85, 247, 0.9)');
        grad.addColorStop(0.6, 'rgba(126, 34, 206, 0.4)');
        grad.addColorStop(1, 'rgba(88, 28, 135, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, 35 + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(sx, sy, 40 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#f3e8ff';
        ctx.font = 'bold 12px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🌌 Void Breach (Walk Near)', sx, sy - 45);
      } else if (incursion.state === 'active') {
        // Expanding active containment ring
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sx, sy, incursion.radius, 0, Math.PI * 2);
        ctx.stroke();

        const grad = ctx.createRadialGradient(sx, sy, 10, sx, sy, incursion.radius);
        grad.addColorStop(0, 'rgba(88, 28, 135, 0.35)');
        grad.addColorStop(1, 'rgba(147, 51, 234, 0.08)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, incursion.radius, 0, Math.PI * 2);
        ctx.fill();

        // Timer badge
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 13px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`⏳ Void Wave: ${Math.ceil(incursion.timer)}s`, sx, sy - incursion.radius - 10);
      }

      ctx.restore();
    }
  });
}
