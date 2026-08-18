/**
 * Canvas Rendering Pipeline (With Procedural Map Tiles, Environmental Weather FX & Biome Hazard Visuals)
 */

import { TILE_SIZE, camera, player, monsters, trainingDummies, npcs, portals, props, projectiles, particles, floatingTexts, groundLoot } from './state.js';
import { assets } from './assets.js';
import { RARITY_COLORS } from './data/items.js';
import { getMonsterLoreBonus } from './combat.js';

export function renderGame(canvas, ctx, minimapCanvas, mmCtx, currentZone, zoneData) {
  ctx.fillStyle = '#0c0e14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-player.x, -player.y);

  drawSeamlessTerrain(canvas, ctx, currentZone, zoneData);

  const renderList = [];

  portals.forEach(p => renderList.push({ y: p.y, render: () => drawPortal(ctx, p) }));
  props.forEach(p => renderList.push({ y: p.y, render: () => drawPropClean(ctx, p) }));
  npcs.forEach(n => renderList.push({ y: n.y, render: () => drawNpc(ctx, n) }));
  trainingDummies.forEach(d => renderList.push({ y: d.y, render: () => drawDummy(ctx, d) }));
  groundLoot.forEach((loot, idx) => renderList.push({ y: loot.y, render: () => drawGroundLoot(ctx, loot, idx) }));

  monsters.forEach(m => {
    if (m.isAlive) renderList.push({ y: m.y, render: () => drawMonsterClean(ctx, m) });
  });

  renderList.push({ y: player.y, render: () => drawPlayerClean(ctx) });

  renderList.sort((a, b) => a.y - b.y);
  renderList.forEach(item => item.render());

  // Projectiles
  projectiles.forEach(p => {
    ctx.save();
    ctx.translate(p.x, p.y);

    if (assets.spells.complete && assets.spells.naturalWidth > 0) {
      const sW = assets.spells.naturalWidth / 3;
      const sH = assets.spells.naturalHeight / 3;

      let sx = 0, sy = 0;
      if (p.type === 'windblade') {
        sx = 0; sy = sH; // Middle-Left: Slash
      } else if (p.type === 'frost') {
        sx = sW; sy = 0; // Top-Center: Frost Nova
      } else if (p.type === 'meteor') {
        sx = sW * 2; sy = 0; // Top-Right: Meteor
      } else {
        sx = 0; sy = 0; // Top-Left: Fireball
      }

      const angle = Math.atan2(p.vy, p.vx);
      ctx.rotate(angle);
      const dw = (p.radius || 16) * 2.5;
      const dh = (p.radius || 16) * 2.5;
      ctx.drawImage(assets.spells, sx, sy, sW, sH, -dw / 2, -dh / 2, dw, dh);
    } else {
      ctx.fillStyle = p.type === 'windblade' ? '#00f2fe' : '#ff7849';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius || 12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  // Particles
  particles.forEach(pt => {
    ctx.fillStyle = pt.color;
    if (pt.isRing) {
      ctx.strokeStyle = pt.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
    }
  });

  // Floating Damage Numbers
  floatingTexts.forEach(ft => {
    ctx.font = ft.isCrit ? 'bold 15px "Outfit", sans-serif' : 'bold 12px "Outfit", sans-serif';
    ctx.fillStyle = ft.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillText(ft.text, ft.x, ft.y);
  });

  ctx.restore();

  renderMinimap(minimapCanvas, mmCtx, zoneData);
}

export function drawGroundLoot(ctx, loot, idx) {
  ctx.save();
  ctx.translate(loot.x, loot.y);

  const rarityColor = RARITY_COLORS[loot.item.rarity] || '#ffffff';

  if (loot.beamHeight > 0) {
    const pulse = (Math.sin(performance.now() / 200) + 1) * 0.5;
    const beamGrad = ctx.createLinearGradient(0, 0, 0, -loot.beamHeight);
    beamGrad.addColorStop(0, rarityColor);
    beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = beamGrad;
    ctx.fillRect(-3 - pulse * 2, -loot.beamHeight, 6 + pulse * 4, loot.beamHeight);
  }

  ctx.font = 'bold 10px "Outfit", sans-serif';
  const text = `${loot.item.icon || '📦'} ${loot.item.name}`;
  const textWidth = ctx.measureText(text).width;
  const cardW = textWidth + 16;
  const cardH = 22;

  ctx.fillStyle = 'rgba(10, 12, 16, 0.94)';
  ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);

  ctx.strokeStyle = rarityColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-cardW / 2, -cardH / 2, cardW, cardH);

  ctx.fillStyle = rarityColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);

  ctx.restore();
}

export function drawSeamlessTerrain(canvas, ctx, currentZone, zoneData) {
  if (!zoneData || !zoneData.grid) return;

  const viewW = canvas.width / camera.zoom;
  const viewH = canvas.height / camera.zoom;
  const tileSize = 48;

  const startTileX = Math.max(0, Math.floor((player.x - viewW / 2) / tileSize) - 1);
  const endTileX = Math.min(zoneData.widthInTiles, Math.ceil((player.x + viewW / 2) / tileSize) + 1);
  const startTileY = Math.max(0, Math.floor((player.y - viewH / 2) / tileSize) - 1);
  const endTileY = Math.min(zoneData.heightInTiles, Math.ceil((player.y + viewH / 2) / tileSize) + 1);

  const isCrypt = currentZone.id === 'ForgottenCrypt';
  const isTundra = currentZone.id === 'FrostpeakTundra';
  const isCaldera = currentZone.id === 'MoltenCaldera';
  const isHaven = currentZone.id === 'SanctuaryHaven';
  const time = performance.now() / 1000;

  for (let y = startTileY; y < endTileY; y++) {
    for (let x = startTileX; x < endTileX; x++) {
      const tile = zoneData.grid[y][x];
      const px = x * tileSize;
      const py = y * tileSize;

      const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const rand = hash - Math.floor(hash);

      if (tile === 1) {
        // WALL (3D Stone / Dungeon Wall with Shadow)
        if (isCrypt) {
          ctx.fillStyle = '#181424';
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = '#2b213a';
          ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 8);
          ctx.fillStyle = '#3f3254';
          ctx.fillRect(px + 4, py + 4, tileSize - 8, 4);
        } else if (isCaldera) {
          ctx.fillStyle = '#1c1316';
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = '#3d1c1a';
          ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
        } else if (isTundra) {
          ctx.fillStyle = '#1e334a';
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = '#3a5f85';
          ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
        } else {
          ctx.fillStyle = '#1b2612';
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = '#384d20';
          ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 8);
        }
      } else if (tile === 2) {
        // DEEP WATER
        const wave = Math.sin(time * 2 + x * 0.5 + y) * 15;
        ctx.fillStyle = `rgb(28, ${95 + wave}, 175)`;
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(px + 4, py + (time * 15 + x * 5) % tileSize, tileSize - 8, 3);
      } else if (tile === 3) {
        // COBBLESTONE PATH
        ctx.fillStyle = isCrypt ? '#312940' : (isHaven ? '#6e6259' : (isTundra ? '#354d63' : '#5a6b47'));
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.strokeRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
      } else if (tile === 4) {
        // TOWN PLAZA
        ctx.fillStyle = '#596173';
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.strokeStyle = '#434b59';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = '#656e82';
          ctx.fillRect(px + 8, py + 8, tileSize - 16, tileSize - 16);
        }
      } else if (tile === 5) {
        // MOLTEN LAVA (Hazard)
        const lavaWave = Math.sin(time * 3 + x + y) * 20;
        ctx.fillStyle = `rgb(${225 + lavaWave}, 60, 20)`;
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(px + 8 + Math.sin(time * 4 + x) * 4, py + 8 + Math.cos(time * 4 + y) * 4, 8, 8);
      } else if (tile === 6) {
        // TOXIC MIASMA BOG (Hazard)
        const bubble = Math.sin(time * 2.5 + x * 2 + y) * 10;
        ctx.fillStyle = `rgb(${45 + bubble}, 18, 55)`;
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.fillStyle = '#8bc34a';
        ctx.fillRect(px + 12, py + 12, 6, 6);
      } else if (tile === 7) {
        // GLACIAL SLIPPERY ICE (Hazard)
        ctx.fillStyle = '#00f2fe';
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(px + 4, py + 4, tileSize - 8, 3);
        ctx.fillRect(px + 10, py + 14, tileSize - 20, 2);
      } else if (tile === 8) {
        // STATIC ELECTRIC GROUND (Hazard)
        ctx.fillStyle = '#1a2238';
        ctx.fillRect(px, py, tileSize, tileSize);
        if (Math.random() < 0.25) {
          ctx.fillStyle = '#4facfe';
          ctx.fillRect(px + Math.random() * 36, py + Math.random() * 36, 12, 2);
        }
      } else if (tile === 9) {
        // SHALLOW SAND & SHOALS
        ctx.fillStyle = '#c2a677';
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.fillStyle = 'rgba(28, 95, 175, 0.2)';
        ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
      } else if (tile === 10) {
        // ANCIENT STONE PILLAR (Obstacle / Cover)
        ctx.fillStyle = '#10141d';
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.fillStyle = '#3a4454';
        ctx.fillRect(px + 6, py + 4, tileSize - 12, tileSize - 8);
        ctx.fillStyle = '#65738a';
        ctx.fillRect(px + 4, py + 2, tileSize - 8, 6);
      } else if (tile === 11) {
        // ABYSSAL CHASM
        ctx.fillStyle = '#0a0812';
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.fillStyle = 'rgba(75, 40, 120, 0.2)';
        ctx.fillRect(px + 4, py + 4, tileSize - 8, tileSize - 8);
      } else if (tile === 12) {
        // DEEP SNOW DRIFT
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.fillStyle = '#d0e3f2';
        ctx.fillRect(px + 6, py + 6, tileSize - 12, tileSize - 12);
      } else if (tile === 13) {
        // SCORCHED EARTH
        ctx.fillStyle = '#241a18';
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.fillStyle = '#ff5722';
        ctx.fillRect(px + 14, py + 14, 4, 4);
      } else {
        // NATURAL FLOOR / DIRT / DUNGEON GROUND (Tile 0)
        if (isCrypt) {
          ctx.fillStyle = rand > 0.5 ? '#241b2f' : '#2b2038';
          ctx.fillRect(px, py, tileSize, tileSize);
          if (rand > 0.85) {
            ctx.fillStyle = '#1c1524';
            ctx.fillRect(px + 10, py + 10, 8, 8);
          }
        } else if (isCaldera) {
          ctx.fillStyle = rand > 0.5 ? '#2b1b1f' : '#331d22';
          ctx.fillRect(px, py, tileSize, tileSize);
        } else if (isTundra) {
          ctx.fillStyle = rand > 0.5 ? '#e2ecf5' : '#c8dceb';
          ctx.fillRect(px, py, tileSize, tileSize);
          if (rand > 0.8) {
            ctx.fillStyle = '#a6c6e0';
            ctx.fillRect(px + 12, py + 12, 10, 10);
          }
        } else {
          // Lush Grass Field
          ctx.fillStyle = rand > 0.6 ? '#4b7529' : (rand > 0.3 ? '#456d25' : '#3e6320');
          ctx.fillRect(px, py, tileSize, tileSize);
          if (rand > 0.8) {
            ctx.fillStyle = '#5f9134';
            ctx.fillRect(px + 6, py + 10, 3, 6);
            ctx.fillRect(px + 10, py + 8, 3, 8);
          }
          if (rand > 0.94) {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(px + 18, py + 18, 4, 4);
          }
        }
      }
    }
  }
}

export function drawPlayerClean(ctx) {
  ctx.save();
  ctx.translate(player.x, player.y);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 18, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  const img = player.gender === 'Female' ? assets.femaleHero : assets.maleHero;
  if (img.complete && img.naturalWidth > 0) {
    const frameW = img.naturalWidth / 4;
    const frameH = img.naturalHeight / 4;

    let row = 0;
    let col = player.isMoving ? (player.animFrame % 3) : 0;

    if (player.facing === 'down') row = 0;
    else if (player.facing === 'up') row = 1;
    else if (player.facing === 'right') row = 2;
    else if (player.facing === 'left') row = 3;

    const sx = col * frameW;
    const sy = row * frameH;
    const destW = 56;
    const destH = 56;

    ctx.drawImage(img, sx, sy, frameW, frameH, -destW / 2, -destH + 20, destW, destH);
  } else {
    ctx.fillStyle = '#2b5c8f';
    ctx.fillRect(-12, -12, 24, 24);
  }

  const titleColor = player.classSpec === 'Vanguard' ? '#e5c07b' : (player.classSpec === 'Arcanist' ? '#61afef' : (player.classSpec === 'ShadowRogue' ? '#c678dd' : '#ffffff'));
  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.fillStyle = titleColor;
  ctx.textAlign = 'center';
  ctx.fillText(`${player.gender === 'Male' ? '♂' : '♀'} ${player.classSpec} [Lv.${player.level}]`, 0, -42);

  // Player Frozen Ice Aura
  if (player.freezeTimer > 0) {
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.strokeRect(-22, -48, 44, 68);
  }

  ctx.restore();
}

export function drawMonsterClean(ctx, m) {
  ctx.save();
  ctx.translate(m.x, m.y);

  const scale = m.scale || 1.2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 16 * scale, 14 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Render Boss from assets.bosses
  if (m.type === 'boss' && assets.bosses.complete && assets.bosses.naturalWidth > 0) {
    const bImg = assets.bosses;
    const bHalfW = bImg.naturalWidth / 2;
    const bHalfH = bImg.naturalHeight / 2;

    let sx = 0, sy = 0;
    if (m.name.includes('Cryomancer') || m.name.includes('Vael')) {
      sx = bHalfW; sy = 0; // Top-Right
    } else if (m.name.includes('Ignis') || m.name.includes('Tyrant')) {
      sx = 0; sy = bHalfH; // Bottom-Left
    } else {
      sx = 0; sy = 0; // Top-Left: Malakor
    }

    const dw = 78 * scale;
    const dh = 78 * scale;
    ctx.drawImage(bImg, sx, sy, bHalfW, bHalfH, -dw / 2, -dh + 22 * scale, dw, dh);
  } else if (assets.monsters.complete && assets.monsters.naturalWidth > 0) {
    const img = assets.monsters;
    const colW = img.naturalWidth / 4;
    const rowH = img.naturalHeight / 4;

    let sx = 0, sy = 0;
    const isMoving = Math.floor(m.animTimer) % 2 === 1;

    if (m.type === 'slime') {
      sx = (isMoving ? 1 : 0) * colW;
      sy = 0 * rowH;
    } else if (m.type === 'skeleton') {
      sx = (isMoving ? 3 : 2) * colW;
      sy = 0 * rowH;
    } else if (m.type === 'goblin') {
      sx = (isMoving ? 1 : 0) * colW;
      sy = 2 * rowH;
    } else {
      sx = (isMoving ? 3 : 2) * colW;
      sy = 2 * rowH;
    }

    const dw = 52 * scale;
    const dh = 52 * scale;

    ctx.drawImage(img, sx, sy, colW, rowH, -dw / 2, -dh + 18 * scale, dw, dh);
  } else {
    ctx.fillStyle = m.type === 'slime' ? '#98c379' : '#dcdfe4';
    ctx.beginPath();
    ctx.arc(0, 0, 14 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  const hpPct = Math.max(0, m.life / m.maxLife);
  const barW = 34 * scale;
  ctx.fillStyle = '#1e222b';
  ctx.fillRect(-barW / 2, -34 * scale, barW, 5);
  ctx.fillStyle = hpPct > 0.5 ? '#98c379' : '#e06c75';
  ctx.fillRect(-barW / 2 + 1, -34 * scale + 1, (barW - 2) * hpPct, 3);

  // Ailment Badges Rendering (Ignite, Freeze, Bleed)
  let ailmentIcons = '';
  if (m.igniteTimer > 0) ailmentIcons += ' 🔥';
  if (m.freezeTimer > 0) ailmentIcons += ' ❄️';
  if (m.bleedTimer > 0) ailmentIcons += ' 🩸';

  // Lore Mastery Tier Badge
  const lore = getMonsterLoreBonus(m.type || 'monster', m.type === 'boss');
  let loreBadge = '';
  if (lore.tier === 4) loreBadge = ' 👑';
  else if (lore.tier === 3) loreBadge = ' 🥇';
  else if (lore.tier === 2) loreBadge = ' 🥈';
  else if (lore.tier === 1) loreBadge = ' 🎖️';

  ctx.font = m.type === 'boss' ? 'bold 11px "Outfit", sans-serif' : '9px "Outfit", sans-serif';
  ctx.fillStyle = m.type === 'boss' ? '#e5c07b' : '#abb2bf';
  ctx.textAlign = 'center';
  ctx.fillText(`${m.name}${loreBadge}${ailmentIcons}`, 0, -38 * scale);

  // Frozen ice crystal glow
  if (m.freezeTimer > 0) {
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.strokeRect(-20 * scale, -42 * scale, 40 * scale, 50 * scale);
  }

  ctx.restore();
}

export function drawPropClean(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);

  const img = assets.props;
  if (img.complete && img.naturalWidth > 0) {
    const W = img.naturalWidth;
    const H = img.naturalHeight;

    if (p.type === 'tree') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 36, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(img, W * 0.05, H * 0.02, W * 0.55, H * 0.48, -55, -120, 110, 130);
    } else if (p.type === 'rock') {
      ctx.drawImage(img, W * 0.60, H * 0.01, W * 0.38, H * 0.36, -30, -26, 60, 52);
    } else if (p.type === 'barrel') {
      ctx.drawImage(img, W * 0.01, H * 0.38, W * 0.28, H * 0.34, -18, -20, 36, 42);
    } else if (p.type === 'chest') {
      ctx.drawImage(img, W * 0.64, H * 0.46, W * 0.26, H * 0.26, -22, -16, 44, 32);
    } else if (p.type === 'campfire') {
      ctx.drawImage(img, W * 0.35, H * 0.70, W * 0.30, H * 0.28, -32, -32, 64, 64);
    }
  } else {
    ctx.fillStyle = '#6b4f2c';
    ctx.fillRect(-6, -10, 12, 24);
  }

  ctx.restore();
}

export function drawPortal(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);

  const pulse = (Math.sin(performance.now() / 250) + 1) * 0.5;
  const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, 38);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.4, '#c678dd');
  grad.addColorStop(0.8, '#61afef');
  grad.addColorStop(1, 'rgba(97, 175, 239, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 32 + pulse * 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#e5c07b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = '10px "Outfit", sans-serif';
  ctx.fillStyle = '#e5c07b';
  ctx.textAlign = 'center';
  ctx.fillText(p.name, 0, -36);

  ctx.restore();
}

export function drawNpc(ctx, n) {
  ctx.save();
  ctx.translate(n.x, n.y);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 16, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  const img = assets.npcs;
  if (img.complete && img.naturalWidth > 0) {
    const halfW = img.naturalWidth / 2;
    const halfH = img.naturalHeight / 2;

    let sx = 0, sy = 0;
    if (n.name.includes('Doran') || n.name.includes('Blacksmith')) {
      sx = halfW; sy = 0; // Top-Right
    } else if (n.name.includes('Kaelen') || n.name.includes('Stash')) {
      sx = 0; sy = halfH; // Bottom-Left
    } else {
      sx = 0; sy = 0; // Top-Left: Elder Aethel
    }

    const dw = 58;
    const dh = 58;
    ctx.drawImage(img, sx, sy, halfW, halfH, -dw / 2, -dh + 18, dw, dh);
  } else {
    ctx.fillStyle = n.color || '#e5c07b';
    ctx.fillRect(-8, -12, 16, 24);
  }

  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.fillStyle = '#ffd700';
  ctx.textAlign = 'center';
  ctx.fillText(`«${n.title}»`, 0, -42);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(n.name, 0, -30);
  ctx.restore();
}

export function drawDummy(ctx, d) {
  ctx.save();
  ctx.translate(d.x, d.y);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 16, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  const img = assets.npcs;
  if (img.complete && img.naturalWidth > 0) {
    const halfW = img.naturalWidth / 2;
    const halfH = img.naturalHeight / 2;
    const sx = halfW;
    const sy = halfH; // Bottom-Right: Straw Dummy
    const dw = 54;
    const dh = 54;
    ctx.drawImage(img, sx, sy, halfW, halfH, -dw / 2, -dh + 16, dw, dh);
  } else {
    ctx.fillStyle = '#8c6239';
    ctx.fillRect(-6, -16, 12, 28);
  }

  ctx.font = '9px "Outfit", sans-serif';
  ctx.fillStyle = '#abb2bf';
  ctx.textAlign = 'center';
  ctx.fillText(d.name, 0, -38);
  ctx.restore();
}

export function renderMinimap(minimapCanvas, mmCtx, zoneData) {
  mmCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  const worldW = zoneData?.worldWidth || 1920;
  const worldH = zoneData?.worldHeight || 1920;
  const scaleX = minimapCanvas.width / worldW;
  const scaleY = minimapCanvas.height / worldH;

  // Draw Wall obstacles on minimap
  if (zoneData && zoneData.grid) {
    mmCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    for (let y = 0; y < zoneData.heightInTiles; y++) {
      for (let x = 0; x < zoneData.widthInTiles; x++) {
        if (zoneData.grid[y][x] === 1) {
          mmCtx.fillRect(x * 48 * scaleX, y * 48 * scaleY, 48 * scaleX, 48 * scaleY);
        }
      }
    }
  }

  portals.forEach(p => {
    mmCtx.fillStyle = '#c678dd';
    mmCtx.beginPath();
    mmCtx.arc(p.x * scaleX, p.y * scaleY, 4, 0, Math.PI * 2);
    mmCtx.fill();
  });

  groundLoot.forEach(loot => {
    mmCtx.fillStyle = RARITY_COLORS[loot.item.rarity] || '#ffffff';
    mmCtx.fillRect(loot.x * scaleX - 1, loot.y * scaleY - 1, 3, 3);
  });

  monsters.forEach(m => {
    if (m.isAlive) {
      mmCtx.fillStyle = m.type === 'boss' ? '#ffd700' : '#e06c75';
      const sz = m.type === 'boss' ? 5 : 3;
      mmCtx.fillRect(m.x * scaleX - 1, m.y * scaleY - 1, sz, sz);
    }
  });

  mmCtx.fillStyle = '#61afef';
  mmCtx.beginPath();
  mmCtx.arc(player.x * scaleX, player.y * scaleY, 4, 0, Math.PI * 2);
  mmCtx.fill();
}
