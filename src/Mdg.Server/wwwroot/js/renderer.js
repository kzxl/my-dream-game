import { TILE_SIZE, camera, player, monsters, trainingDummies, npcs, portals, props, projectiles, particles, floatingTexts, groundLoot } from './state.js';
import { assets } from './assets.js';
import { RARITY_COLORS } from './data/items.js';
import { getMonsterLoreBonus } from './combat.js';
import { companion } from './companion.js';

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
  if (!companion.isDeliveringToTown) {
    renderList.push({ y: companion.y, render: () => drawCompanion(ctx) });
  }

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
    let flipX = false;

    if (player.facing === 'down') row = 0;
    else if (player.facing === 'up') row = 1;
    else if (player.facing === 'right') row = 2;
    else if (player.facing === 'left') {
      row = 2;
      flipX = true;
    }

    const sx = col * frameW;
    const sy = row * frameH;
    const destW = 56;
    const destH = 56;

    if (flipX) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(img, sx, sy, frameW, frameH, -destW / 2, -destH + 20, destW, destH);
      ctx.restore();
    } else {
      ctx.drawImage(img, sx, sy, frameW, frameH, -destW / 2, -destH + 20, destW, destH);
    }
  } else {
    ctx.fillStyle = '#2b5c8f';
    ctx.fillRect(-12, -12, 24, 24);
  }

  const titleColor = player.isDead ? '#e06c75' : (player.classSpec === 'Vanguard' ? '#e5c07b' : (player.classSpec === 'Arcanist' ? '#61afef' : (player.classSpec === 'ShadowRogue' ? '#c678dd' : '#ffffff')));
  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.fillStyle = titleColor;
  ctx.textAlign = 'center';
  const statusBadge = player.isDead ? ' ☠️ [FALLEN]' : '';
  ctx.fillText(`${player.gender === 'Male' ? '♂' : '♀'} ${player.classSpec} [Lv.${player.level}]${statusBadge}`, 0, -42);

  // Player Frozen Ice Aura
  if (player.freezeTimer > 0) {
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.strokeRect(-22, -48, 44, 68);
  }

  // Divine Holy Invulnerability Shield
  if (player.invulnerableTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
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

  // Render Boss from assets.bosses (4x4 Animated Spritesheet)
  if (m.type === 'boss' && assets.bosses.complete && assets.bosses.naturalWidth > 0) {
    const bImg = assets.bosses;
    const colW = bImg.naturalWidth / 4;
    const rowH = bImg.naturalHeight / 4;

    let row = 0;
    if (m.name.includes('Cryomancer') || m.name.includes('Vael')) {
      row = 1; // Row 1: Cryomancer Knight
    } else if (m.name.includes('Ignis') || m.name.includes('Tyrant')) {
      row = 2; // Row 2: Molten Fire Tyrant
    } else if (m.name.includes('Drake') || m.name.includes('Dragon') || m.name.includes('Storm')) {
      row = 3; // Row 3: Thunder Dragon
    } else {
      row = 0; // Row 0: Shadow Lord Malakor
    }

    const animCol = Math.floor(m.animTimer * 1.8) % 4;
    const sx = animCol * colW;
    const sy = row * rowH;

    const hoverY = (row === 0 || row === 3) ? Math.sin(performance.now() / 220) * 5 : 0;
    const dw = 84 * scale;
    const dh = 84 * scale;

    // Boss Elemental Aura Glow
    ctx.save();
    if (row === 2) {
      ctx.shadowColor = 'rgba(255, 87, 34, 0.65)';
      ctx.shadowBlur = 16;
    } else if (row === 1) {
      ctx.shadowColor = 'rgba(0, 242, 254, 0.65)';
      ctx.shadowBlur = 16;
    } else if (row === 3) {
      ctx.shadowColor = 'rgba(79, 172, 254, 0.65)';
      ctx.shadowBlur = 16;
    } else {
      ctx.shadowColor = 'rgba(198, 120, 221, 0.65)';
      ctx.shadowBlur = 16;
    }

    ctx.drawImage(bImg, sx, sy, colW, rowH, -dw / 2, -dh + 24 * scale + hoverY, dw, dh);
    ctx.restore();
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

  // 1. Check Nature Pack Props (Vector SVG Spritesheet 4x4)
  const natImg = assets.nature;
  if (natImg.complete && natImg.naturalWidth > 0) {
    const cellSize = 128;
    let col = -1, row = -1;
    let dw = 64, dh = 64, offX = -32, offY = -52;

    if (p.type === 'oak_tree' || p.type === 'tree') {
      col = 0; row = 0; dw = 110; dh = 110; offX = -55; offY = -95;
    } else if (p.type === 'pine_tree') {
      col = 1; row = 0; dw = 100; dh = 110; offX = -50; offY = -95;
    } else if (p.type === 'cherry_tree') {
      col = 2; row = 0; dw = 110; dh = 110; offX = -55; offY = -95;
    } else if (p.type === 'autumn_tree') {
      col = 3; row = 0; dw = 110; dh = 110; offX = -55; offY = -95;
    } else if (p.type === 'bush' || p.type === 'lush_bush') {
      col = 0; row = 1; dw = 58; dh = 58; offX = -29; offY = -42;
    } else if (p.type === 'tall_grass') {
      col = 1; row = 1; dw = 52; dh = 52; offX = -26; offY = -40;
    } else if (p.type === 'flowers_red') {
      col = 2; row = 1; dw = 48; dh = 48; offX = -24; offY = -38;
    } else if (p.type === 'flowers_blue') {
      col = 3; row = 1; dw = 48; dh = 48; offX = -24; offY = -38;
    } else if (p.type === 'flowers_gold') {
      col = 0; row = 2; dw = 52; dh = 52; offX = -26; offY = -40;
    } else if (p.type === 'mushroom_glow') {
      col = 1; row = 2; dw = 50; dh = 50; offX = -25; offY = -38;
    } else if (p.type === 'mossy_rock' || p.type === 'rock') {
      col = 2; row = 2; dw = 60; dh = 52; offX = -30; offY = -38;
    } else if (p.type === 'crystal_spire') {
      col = 3; row = 2; dw = 56; dh = 68; offX = -28; offY = -56;
    }

    if (col !== -1 && row !== -1) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        natImg,
        col * cellSize, row * cellSize, cellSize, cellSize,
        offX, offY, dw, dh
      );
      ctx.restore();
      return;
    }
  }

  // 2. Check Master Buildings Pack
  const bldImg = assets.buildings;
  if (bldImg && bldImg.complete && bldImg.naturalWidth > 0) {
    const bW = bldImg.naturalWidth;
    const bH = bldImg.naturalHeight;
    ctx.imageSmoothingEnabled = false;

    if (p.type === 'castle') {
      ctx.drawImage(bldImg, bW * 0.58, 0, bW * 0.42, bH * 0.58, -90, -140, 180, 160);
      ctx.restore();
      return;
    } else if (p.type === 'house_blue') {
      ctx.drawImage(bldImg, 0, 0, bW * 0.28, bH * 0.40, -45, -70, 90, 80);
      ctx.restore();
      return;
    } else if (p.type === 'house_shop') {
      ctx.drawImage(bldImg, bW * 0.29, 0, bW * 0.28, bH * 0.40, -45, -70, 90, 80);
      ctx.restore();
      return;
    } else if (p.type === 'windmill') {
      ctx.drawImage(bldImg, 0, bH * 0.42, bW * 0.28, bH * 0.45, -45, -80, 90, 95);
      ctx.restore();
      return;
    } else if (p.type === 'blacksmith') {
      ctx.drawImage(bldImg, bW * 0.29, bH * 0.42, bW * 0.29, bH * 0.45, -48, -75, 96, 90);
      ctx.restore();
      return;
    } else if (p.type === 'watchtower') {
      ctx.drawImage(bldImg, bW * 0.82, bH * 0.42, bW * 0.18, bH * 0.55, -28, -90, 56, 105);
      ctx.restore();
      return;
    }
  }

  // 3. Fallback to Legacy Props Sheet (barrel, chest, campfire, tent, well)
  const img = assets.props;
  if (img.complete && img.naturalWidth > 0) {
    const W = img.naturalWidth;
    const H = img.naturalHeight;

    if (p.type === 'map_device') {
      const now = performance.now() / 300;
      // Ancient Stone Platform
      ctx.fillStyle = '#1b2230';
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 10, 42, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rotating Rune Arcs
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 10, 32 + Math.sin(now) * 3, 14, now * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Cosmic Glowing Core
      const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.5, '#00f2fe');
      coreGrad.addColorStop(1, 'rgba(127, 0, 255, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 18 + Math.sin(now * 2) * 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = 'bold 9px "Outfit", sans-serif';
      ctx.fillStyle = '#00f2fe';
      ctx.textAlign = 'center';
      ctx.fillText('🌌 [F] Map Device', 0, -32);

      ctx.restore();
      return;
    } else if (p.type === 'barrel') {
      ctx.drawImage(img, W * 0.01, H * 0.38, W * 0.28, H * 0.34, -18, -20, 36, 42);
    } else if (p.type === 'chest') {
      ctx.drawImage(img, W * 0.64, H * 0.46, W * 0.26, H * 0.26, -22, -16, 44, 32);
    } else if (p.type === 'campfire') {
      ctx.drawImage(img, W * 0.35, H * 0.70, W * 0.30, H * 0.28, -32, -32, 64, 64);
    } else {
      ctx.fillStyle = '#6b4f2c';
      ctx.fillRect(-6, -10, 12, 24);
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
  const now = performance.now();

  if (p.isRift) {
    // --- SPATIAL RIFT / DIMENSIONAL FRACTURE ANIMATION ---
    const t = now / 150;
    const riftColor = p.color || '#00f2fe';

    // 1. Cosmic Void Swirl Aura
    const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 55);
    auraGrad.addColorStop(0, '#ffffff');
    auraGrad.addColorStop(0.3, riftColor);
    auraGrad.addColorStop(0.7, '#7f00ff');
    auraGrad.addColorStop(1, 'rgba(127, 0, 255, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 52 + Math.sin(t * 1.5) * 6, 0, Math.PI * 2);
    ctx.fill();

    // 2. Spatial Jagged Tear / Fracture Shape
    ctx.save();
    ctx.rotate(Math.sin(t * 0.5) * 0.15);
    ctx.fillStyle = '#0a0515';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = riftColor;
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.moveTo(0, -45);
    ctx.lineTo(12 + Math.sin(t * 2) * 5, -20);
    ctx.lineTo(24 + Math.cos(t * 2) * 6, 0);
    ctx.lineTo(10 + Math.sin(t * 3) * 4, 25);
    ctx.lineTo(0, 45);
    ctx.lineTo(-10 + Math.cos(t * 2) * 4, 22);
    ctx.lineTo(-22 + Math.sin(t * 2) * 5, 0);
    ctx.lineTo(-12 + Math.cos(t * 3) * 4, -22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 3. Rotating Electric Lightning Arcs
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const angle = (t + i * (Math.PI / 2)) % (Math.PI * 2);
      const dist = 32 + Math.sin(t * 3 + i) * 10;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * (dist * 0.5) + (Math.random() - 0.5) * 8, Math.sin(angle) * (dist * 0.5) + (Math.random() - 0.5) * 8);
      ctx.lineTo(Math.cos(angle) * dist, Math.sin(angle) * dist);
      ctx.stroke();
    }

    // 4. Rift Title & Interaction Label
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText(p.name, 0, -56);
    ctx.font = '9px "Outfit", sans-serif';
    ctx.fillStyle = '#00f2fe';
    ctx.fillText('[F] Enter Rift', 0, -42);

  } else {
    // --- STANDARD WORLD PORTAL ---
    const pulse = (Math.sin(now / 250) + 1) * 0.5;
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
  }

  ctx.restore();
}

export function drawNpc(ctx, n) {
  ctx.save();
  ctx.translate(n.x, n.y);

  // NPC Aura Glow Ring on Ground
  const auraColor = n.color || '#ffd700';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = auraColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 18, 22, 9, 0, 0, Math.PI * 2);
  ctx.stroke();

  const img = assets.npcs;
  if (img.complete && img.naturalWidth > 0) {
    const halfW = img.naturalWidth / 2;
    const halfH = img.naturalHeight / 2;

    let sx = 0, sy = 0;
    if (n.name.includes('Doran') || n.name.includes('Blacksmith')) {
      sx = halfW; sy = 0; // Top-Right (Smith)
    } else if (n.name.includes('Kaelen') || n.name.includes('Vault') || n.name.includes('Stash')) {
      sx = 0; sy = halfH; // Bottom-Left (Vault Keeper)
    } else if (n.name.includes('Lyra') || n.name.includes('Astromancer') || n.name.includes('Valen')) {
      sx = halfW; sy = halfH; // Bottom-Right (Astromancer/Scout)
    } else {
      sx = 0; sy = 0; // Top-Left (Elder Sage / Beastmaster)
    }

    const dw = 60;
    const dh = 60;
    ctx.drawImage(img, sx, sy, halfW, halfH, -dw / 2, -dh + 18, dw, dh);
  } else {
    ctx.fillStyle = n.color || '#e5c07b';
    ctx.fillRect(-10, -14, 20, 28);
  }

  // NPC Title & Name Tag
  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.fillStyle = auraColor;
  ctx.textAlign = 'center';
  ctx.fillText(`«${n.title}»`, 0, -44);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(n.name, 0, -31);

  // Interaction prompt hint indicator
  ctx.font = '8px "Outfit", sans-serif';
  ctx.fillStyle = '#ffd700';
  ctx.fillText('[F] Talk', 0, -56);

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

export function drawCompanion(ctx) {
  ctx.save();
  ctx.translate(companion.x, companion.y);

  // 1. Companion Glowing Aura Ring on ground
  const auraColor = companion.activeAura === 'swift_wings' ? 'rgba(0, 242, 254, 0.35)' :
                   (companion.activeAura === 'aegis_shell' ? 'rgba(255, 215, 0, 0.35)' : 'rgba(198, 120, 221, 0.35)');
  
  ctx.fillStyle = auraColor;
  ctx.beginPath();
  ctx.ellipse(0, 10, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Glowing Sprite Orb (Floating Sprite)
  const floatOffset = Math.sin(companion.hoverTimer) * 4;
  
  // Outer Glow
  const grad = ctx.createRadialGradient(0, floatOffset, 2, 0, floatOffset, 12);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.4, companion.activeAura === 'swift_wings' ? '#00f2fe' : (companion.activeAura === 'aegis_shell' ? '#ffd700' : '#c678dd'));
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, floatOffset, 12, 0, Math.PI * 2);
  ctx.fill();

  // Core Star
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, floatOffset, 4, 0, Math.PI * 2);
  ctx.fill();

  // Small Fairy Wings
  const wingAngle = Math.sin(companion.hoverTimer * 4) * 0.4;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.ellipse(-6, floatOffset - 2, 6, 3, -wingAngle, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(6, floatOffset - 2, 6, 3, wingAngle, 0, Math.PI * 2);
  ctx.fill();

  // Title Label
  ctx.font = 'bold 9px "Outfit", sans-serif';
  ctx.fillStyle = '#00f2fe';
  ctx.textAlign = 'center';
  ctx.fillText('🐾 ' + companion.name, 0, floatOffset - 16);

  ctx.restore();
}

