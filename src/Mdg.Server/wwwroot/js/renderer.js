/**
 * Canvas Rendering Pipeline
 */

import { WORLD_SIZE, TILE_SIZE, camera, player, monsters, trainingDummies, npcs, portals, props, projectiles, particles, floatingTexts, groundLoot } from './state.js';
import { assets } from './assets.js';
import { RARITY_COLORS } from './data/items.js';

export function renderGame(canvas, ctx, minimapCanvas, mmCtx, currentZone) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-player.x, -player.y);

  drawSeamlessTerrain(canvas, ctx, currentZone);

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
    ctx.fillStyle = '#ff7849';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius || 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe066';
    ctx.beginPath();
    ctx.arc(p.x, p.y, (p.radius || 12) * 0.6, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.font = ft.isCrit ? 'bold 16px "Press Start 2P", monospace' : 'bold 12px "Press Start 2P", monospace';
    ctx.fillStyle = ft.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillText(ft.text, ft.x, ft.y);
  });

  ctx.restore();

  renderMinimap(minimapCanvas, mmCtx);
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

export function drawSeamlessTerrain(canvas, ctx, currentZone) {
  const viewW = canvas.width / camera.zoom;
  const viewH = canvas.height / camera.zoom;
  const startX = Math.max(0, Math.floor((player.x - viewW / 2) / TILE_SIZE) * TILE_SIZE);
  const endX = Math.min(WORLD_SIZE, startX + viewW + TILE_SIZE * 2);
  const startY = Math.max(0, Math.floor((player.y - viewH / 2) / TILE_SIZE) * TILE_SIZE);
  const endY = Math.min(WORLD_SIZE, startY + viewH + TILE_SIZE * 2);

  const isCrypt = currentZone.id === 'ForgottenCrypt';
  const isHaven = currentZone.id === 'SanctuaryHaven';

  ctx.fillStyle = isCrypt ? '#241b2f' : '#4d752c';
  ctx.fillRect(startX - 10, startY - 10, endX - startX + 20, endY - startY + 20);

  for (let x = startX; x < endX; x += TILE_SIZE) {
    for (let y = startY; y < endY; y += TILE_SIZE) {
      const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const rand = hash - Math.floor(hash);

      if (isCrypt) {
        if (rand > 0.6) {
          ctx.fillStyle = '#2f233d';
          ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        }
        if (rand > 0.85) {
          ctx.fillStyle = '#3d2e50';
          ctx.fillRect(x + 14, y + 14, 12, 12);
        }
      } else if (isHaven) {
        const distToCenter = Math.hypot(x - 2000, y - 2000);
        if (distToCenter < 240) {
          ctx.fillStyle = '#6b7280';
          ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = '#565d6b';
          ctx.fillRect(x + 12, y + 12, 24, 24);
        } else {
          if (rand > 0.7) {
            ctx.fillStyle = '#588334';
            ctx.fillRect(x + 10, y + 12, 4, 8);
            ctx.fillRect(x + 14, y + 10, 4, 10);
          }
          if (rand > 0.92) {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(x + 24, y + 24, 5, 5);
          }
        }
      } else {
        if (rand > 0.65) {
          ctx.fillStyle = '#598436';
          ctx.fillRect(x + 8, y + 14, 4, 8);
          ctx.fillRect(x + 14, y + 10, 4, 12);
        }
        if (rand > 0.90) {
          ctx.fillStyle = rand > 0.95 ? '#ff416c' : '#ffd700';
          ctx.fillRect(x + 22, y + 22, 6, 6);
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

  const img = assets.monsters;
  if (img.complete && img.naturalWidth > 0) {
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

  ctx.font = m.type === 'boss' ? 'bold 11px "Outfit", sans-serif' : '9px "Outfit", sans-serif';
  ctx.fillStyle = m.type === 'boss' ? '#e5c07b' : '#abb2bf';
  ctx.textAlign = 'center';
  ctx.fillText(m.name, 0, -38 * scale);

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
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 16, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = n.color || '#e5c07b';
  ctx.fillRect(-8, -12, 16, 24);
  ctx.fillStyle = '#ffdbac';
  ctx.fillRect(-6, -22, 12, 10);
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(-4, -18, 2, 2);
  ctx.fillRect(2, -18, 2, 2);

  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.fillStyle = '#ffd700';
  ctx.textAlign = 'center';
  ctx.fillText(`«${n.title}»`, 0, -38);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(n.name, 0, -26);
  ctx.restore();
}

export function drawDummy(ctx, d) {
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 14, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8c6239';
  ctx.fillRect(-6, -16, 12, 28);
  ctx.fillStyle = '#d19a66';
  ctx.fillRect(-12, -8, 24, 6);

  ctx.font = '9px "Outfit", sans-serif';
  ctx.fillStyle = '#abb2bf';
  ctx.textAlign = 'center';
  ctx.fillText(d.name, 0, -26);
  ctx.restore();
}

export function renderMinimap(minimapCanvas, mmCtx) {
  mmCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  const scaleX = minimapCanvas.width / WORLD_SIZE;
  const scaleY = minimapCanvas.height / WORLD_SIZE;

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
