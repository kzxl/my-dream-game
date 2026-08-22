/**
 * Gamepad Controller & Virtual Radial Wheel System
 * Supports Xbox, PlayStation, and Standard Gamepads with Soft Target Auto-Lock and 8-Direction Radial Navigation.
 */

import { player, monsters, mouse, camera } from '../state.js';
import { castSlash, castFireball, castFrostNova, castMeteor, castDash } from '../combat.js';
import { useFlask } from './flask-system.js';
import { toggleModal } from '../ui/hud.js';
import { toggleCompendiumUI } from '../ui/compendium-ui.js';
import { toggleMarketModal } from '../ui/trade-market-ui.js';
import { AudioEngine } from '../audio.js';

let isGamepadConnected = false;
let activeGamepadIndex = -1;
let isRadialWheelOpen = false;
let focusedRadialIndex = 0;
let lastButtonStates = {};
let lastStickAngle = 0;

const RADIAL_MENU_ITEMS = [
  { id: 'inventory', icon: '🎒', label: 'INVENTORY', action: () => toggleModal('inventory-modal') },
  { id: 'skills', icon: '📜', label: 'SKILLS', action: () => toggleModal('skills-modal') },
  { id: 'stats', icon: '📊', label: 'STATS', action: () => toggleModal('stats-modal') },
  { id: 'forge', icon: '🔨', label: 'FORGE', action: () => toggleModal('forgeBenchModal') },
  { id: 'bestiary', icon: '📖', label: 'BESTIARY', action: () => toggleCompendiumUI('bestiary') },
  { id: 'market', icon: '🏛️', label: 'MARKET', action: () => toggleMarketModal() },
  { id: 'devotion', icon: '⭐', label: 'DEVOTION', action: () => toggleModal('devotionModal') },
  { id: 'worldmap', icon: '🗺️', label: 'WORLD MAP', action: () => toggleModal('worldmap-modal') }
];

export function initGamepadSystem() {
  window.addEventListener('gamepadconnected', (e) => {
    isGamepadConnected = true;
    activeGamepadIndex = e.gamepad.index;
    console.log(`🎮 Gamepad connected: ${e.gamepad.id} at index ${e.gamepad.index}`);
    AudioEngine.playLevelUp?.();
  });

  window.addEventListener('gamepaddisconnected', (e) => {
    if (activeGamepadIndex === e.gamepad.index) {
      isGamepadConnected = false;
      activeGamepadIndex = -1;
      console.log('🎮 Gamepad disconnected.');
    }
  });

  createRadialWheelHtml();
}

export function updateGamepad(dt) {
  if (!isGamepadConnected) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        isGamepadConnected = true;
        activeGamepadIndex = i;
        break;
      }
    }
  }

  if (!isGamepadConnected || activeGamepadIndex < 0) return;

  const gp = navigator.getGamepads()[activeGamepadIndex];
  if (!gp) return;

  const deadzone = 0.22;

  // 1. Left Stick: Character Movement
  const lx = gp.axes[0];
  const ly = gp.axes[1];
  let moveX = Math.abs(lx) > deadzone ? lx : 0;
  let moveY = Math.abs(ly) > deadzone ? ly : 0;

  if (moveX !== 0 || moveY !== 0) {
    player.gamepadMoving = true;
    player.gamepadVx = moveX;
    player.gamepadVy = moveY;
    lastStickAngle = Math.atan2(moveY, moveX);
  } else {
    player.gamepadMoving = false;
    player.gamepadVx = 0;
    player.gamepadVy = 0;
  }

  // 2. Right Stick: Aiming & Soft Target Lock
  const rx = gp.axes[2] || 0;
  const ry = gp.axes[3] || 0;
  let aimX = Math.abs(rx) > deadzone ? rx : (moveX !== 0 || moveY !== 0 ? moveX : 0);
  let aimY = Math.abs(ry) > deadzone ? ry : (moveX !== 0 || moveY !== 0 ? moveY : 0);

  if (aimX !== 0 || aimY !== 0) {
    let aimAngle = Math.atan2(aimY, aimX);

    // Soft Target Auto-Lock in 45-degree cone
    const lockedTarget = getNearestTargetInCone(player, aimAngle, 45, 550);
    if (lockedTarget) {
      aimAngle = Math.atan2(lockedTarget.y - player.y, lockedTarget.x - player.x);
    }

    const aimDist = 220;
    mouse.worldX = player.x + Math.cos(aimAngle) * aimDist;
    mouse.worldY = player.y + Math.sin(aimAngle) * aimDist;
  }

  // 3. Radial Wheel Open/Close & Navigation
  const btnSelect = gp.buttons[8]?.pressed;
  const btnStart = gp.buttons[9]?.pressed;

  if ((btnSelect || btnStart) && !lastButtonStates['radialToggle']) {
    toggleRadialWheel();
  }
  lastButtonStates['radialToggle'] = btnSelect || btnStart;

  if (isRadialWheelOpen) {
    handleRadialWheelInput(moveX, moveY, gp);
    return; // Don't trigger combat skills while radial menu is open
  }

  // 4. Combat Buttons Mapping
  // Button 0 (A / Cross): Primary Slash
  checkButton(gp, 0, 'btnA', () => castSlash());
  // Button 2 (X / Square): Fireball
  checkButton(gp, 2, 'btnX', () => castFireball());
  // Button 3 (Y / Triangle): Frost Nova
  checkButton(gp, 3, 'btnY', () => castFrostNova());
  // Button 1 (B / Circle): Meteor
  checkButton(gp, 1, 'btnB', () => castMeteor());
  // Button 4 (LB) / Button 6 (LT): Dash
  checkButton(gp, 4, 'btnLB', () => castDash());
  checkButton(gp, 6, 'btnLT', () => castDash());

  // Button 5 (RB) / Button 7 (RT): Interact Key F
  checkButton(gp, 5, 'btnRB', () => triggerInteractF());
  checkButton(gp, 7, 'btnRT', () => triggerInteractF());

  // D-Pad Flasks 1-4
  checkButton(gp, 12, 'dpadUp', () => useFlask(0));
  checkButton(gp, 13, 'dpadDown', () => useFlask(1));
  checkButton(gp, 14, 'dpadLeft', () => useFlask(2));
  checkButton(gp, 15, 'dpadRight', () => useFlask(3));
}

function checkButton(gp, btnIdx, stateKey, callback) {
  const isPressed = gp.buttons[btnIdx]?.pressed;
  if (isPressed && !lastButtonStates[stateKey]) {
    callback();
  }
  lastButtonStates[stateKey] = isPressed;
}

function triggerInteractF() {
  const event = new KeyboardEvent('keydown', { code: 'KeyF', key: 'f' });
  window.dispatchEvent(event);
}

/**
 * Soft Target Auto-Lock: Finds closest alive monster within angle cone.
 */
export function getNearestTargetInCone(origin, centerAngle, coneDegrees = 45, maxDist = 500) {
  let closest = null;
  let minDist = maxDist;
  const halfConeRad = (coneDegrees * Math.PI) / 180;

  for (let i = 0; i < monsters.length; i++) {
    const m = monsters[i];
    if (!m.isAlive) continue;

    const dist = Math.hypot(m.x - origin.x, m.y - origin.y);
    if (dist > maxDist) continue;

    const angleToTarget = Math.atan2(m.y - origin.y, m.x - origin.x);
    let diff = Math.abs(angleToTarget - centerAngle);
    while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);

    if (diff <= halfConeRad && dist < minDist) {
      minDist = dist;
      closest = m;
    }
  }

  return closest;
}

function createRadialWheelHtml() {
  const div = document.createElement('div');
  div.id = 'radialMenuOverlay';
  div.className = 'radial-menu-overlay hidden';
  div.style.display = 'none';

  const radius = 115;
  const count = RADIAL_MENU_ITEMS.length;

  const itemsHtml = RADIAL_MENU_ITEMS.map((item, idx) => {
    const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
    const x = Math.round(170 + Math.cos(angle) * radius);
    const y = Math.round(170 + Math.sin(angle) * radius);

    return `
      <div class="radial-item ${idx === 0 ? 'focused' : ''}" data-idx="${idx}" style="left: ${x}px; top: ${y}px;">
        <span class="radial-icon">${item.icon}</span>
        <span class="radial-label">${item.label}</span>
      </div>
    `;
  }).join('');

  div.innerHTML = `
    <div class="radial-wheel">
      <div class="radial-center-hub" id="radialCenterHub">
        <span id="radialHubIcon">🎒</span>
        <strong id="radialHubText">INVENTORY</strong>
      </div>
      ${itemsHtml}
    </div>
  `;

  document.body.appendChild(div);

  div.querySelectorAll('.radial-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.idx, 10);
      selectRadialItem(idx);
    });
  });
}

export function toggleRadialWheel() {
  isRadialWheelOpen = !isRadialWheelOpen;
  const overlay = document.getElementById('radialMenuOverlay');
  if (!overlay) return;

  if (isRadialWheelOpen) {
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';
    AudioEngine.playTone?.(480, 'sine', 0.12, 0.1);
    updateRadialFocus(focusedRadialIndex);
  } else {
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
  }
}

function handleRadialWheelInput(moveX, moveY, gp) {
  if (moveX !== 0 || moveY !== 0) {
    const angle = Math.atan2(moveY, moveX) + Math.PI / 2;
    let normalized = angle;
    if (normalized < 0) normalized += Math.PI * 2;

    const count = RADIAL_MENU_ITEMS.length;
    const sector = Math.floor((normalized + (Math.PI / count)) / (Math.PI * 2 / count)) % count;
    if (sector !== focusedRadialIndex) {
      focusedRadialIndex = sector;
      updateRadialFocus(focusedRadialIndex);
      AudioEngine.playTone?.(350, 'sine', 0.06, 0.05);
    }
  }

  // Button A (Confirm selection)
  if (gp.buttons[0]?.pressed && !lastButtonStates['radialConfirm']) {
    selectRadialItem(focusedRadialIndex);
  }
  lastButtonStates['radialConfirm'] = gp.buttons[0]?.pressed;

  // Button B (Close)
  if (gp.buttons[1]?.pressed && !lastButtonStates['radialClose']) {
    toggleRadialWheel();
  }
  lastButtonStates['radialClose'] = gp.buttons[1]?.pressed;
}

function updateRadialFocus(idx) {
  const overlay = document.getElementById('radialMenuOverlay');
  if (!overlay) return;

  overlay.querySelectorAll('.radial-item').forEach((el, i) => {
    el.classList.toggle('focused', i === idx);
  });

  const hubIcon = document.getElementById('radialHubIcon');
  const hubText = document.getElementById('radialHubText');
  if (hubIcon && hubText && RADIAL_MENU_ITEMS[idx]) {
    hubIcon.innerText = RADIAL_MENU_ITEMS[idx].icon;
    hubText.innerText = RADIAL_MENU_ITEMS[idx].label;
  }
}

function selectRadialItem(idx) {
  const item = RADIAL_MENU_ITEMS[idx];
  if (item && item.action) {
    toggleRadialWheel();
    item.action();
  }
}
