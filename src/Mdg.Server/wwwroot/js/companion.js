/**
 * MDG: Aethelis - Companion & Pet Engine (Torchlight / PoE Style)
 * Auto-Looting, Mule Backpack (8 Slots), Town Delivery Service & Companion Auras
 */

import { player, groundLoot, particles } from './state.js';
import { AudioEngine } from './audio.js';
import { spawnDamageNumber } from './combat.js';

export const COMPANION_AURAS = {
  SWIFT_WINGS: {
    id: 'swift_wings',
    name: '🕊️ Swift Wings Aura',
    description: '+15% Movement Speed',
    icon: '💨',
    apply: () => { player.speedBonusPct = 0.15; }
  },
  AEGIS_SHELL: {
    id: 'aegis_shell',
    name: '🛡️ Aegis Shell Aura',
    description: '+20% Armor & Physical Mitigation',
    icon: '🛡️',
    apply: () => { player.armorBonusPct = 0.20; }
  },
  WARD_SONG: {
    id: 'ward_song',
    name: '✨ Ward Song Aura',
    description: '+15% All Elemental & Chaos Resistances',
    icon: '✨',
    apply: () => { player.resBonusFlat = 15; }
  }
};

export const companion = {
  name: 'Genesis Sprite',
  species: 'Celestial Wisp',
  x: 672,
  y: 672,
  targetX: 672,
  targetY: 672,
  vx: 0,
  vy: 0,
  hoverTimer: 0,
  activeAura: 'swift_wings',

  autoLootCurrency: true,
  autoLootGems: true,
  autoLootRares: true,
  pickupRadius: 350,

  muleBag: [],
  muleMaxSlots: 8,

  isDeliveringToTown: false,
  deliveryTimer: 0,
  deliveryDuration: 20.0, // 20s round trip

  goldOrCurrencyEarned: 0
};

export function updateCompanion(dt) {
  companion.hoverTimer += dt * 3;

  // 1. If Pet is delivering to town
  if (companion.isDeliveringToTown) {
    companion.deliveryTimer -= dt;
    if (companion.deliveryTimer <= 0) {
      companion.isDeliveringToTown = false;
      companion.deliveryTimer = 0;

      // Convert junk in bag to currency reward
      const itemCount = companion.muleBag.length;
      companion.goldOrCurrencyEarned = Math.max(1, Math.floor(itemCount / 2) + 1);
      companion.muleBag = [];

      // Add currency directly to player bag
      player.bag.push({
        id: 'c_spark_' + Date.now(),
        name: 'Aether Spark',
        slot: 'Currency',
        rarity: 'Currency',
        color: '#aa9e82',
        description: 'Returned from Town Market: Awakens latent magic in normal items.',
        stats: {}
      });

      spawnDamageNumber(player.x, player.y - 60, `🐾 Pet returned with ${companion.goldOrCurrencyEarned}x Aether Spark!`, false, '#ffd700');
      AudioEngine.playTone(523, 'sine', 0.2, 0.15);
    }
    return;
  }

  // 2. Follow Player Target with Smooth Spring
  const followDist = 55;
  const angle = Math.atan2(player.y - companion.y, player.x - companion.x);
  const targetX = player.x - Math.cos(angle) * followDist;
  const targetY = player.y - Math.sin(angle) * followDist + Math.sin(companion.hoverTimer) * 12;

  companion.x += (targetX - companion.x) * (dt * 6.5);
  companion.y += (targetY - companion.y) * (dt * 6.5);

  // 3. Companion Sparkle Particles
  if (Math.random() < 0.25) {
    particles.push({
      x: companion.x + (Math.random() - 0.5) * 16,
      y: companion.y + (Math.random() - 0.5) * 16,
      vx: (Math.random() - 0.5) * 20,
      vy: -20 - Math.random() * 25,
      color: companion.activeAura === 'swift_wings' ? '#00f2fe' : (companion.activeAura === 'aegis_shell' ? '#ffd700' : '#c678dd'),
      life: 0.4,
      maxLife: 0.4,
      size: 2.5
    });
  }

  // 4. Auto-Loot Scan within pickupRadius
  if (companion.muleBag.length < companion.muleMaxSlots || player.bag.length < 16) {
    for (let i = groundLoot.length - 1; i >= 0; i--) {
      const loot = groundLoot[i];
      if (!loot || loot.isLanded === false) continue;

      const dist = Math.hypot(loot.x - companion.x, loot.y - companion.y);
      if (dist <= companion.pickupRadius) {
        const item = loot.item;
        const isCurrency = item && item.slot === 'Currency';
        const isGem = item && (item.slot === 'Gem' || item.name.includes('Gem'));
        const isRare = item && item.rarity === 'Rare';

        if ((isCurrency && companion.autoLootCurrency) ||
            (isGem && companion.autoLootGems) ||
            (isRare && companion.autoLootRares) ||
            (dist <= 80)) {

          // Pick up item
          groundLoot.splice(i, 1);
          if (companion.muleBag.length < companion.muleMaxSlots) {
            companion.muleBag.push(item);
            spawnDamageNumber(companion.x, companion.y - 25, `🐾 +${item.name}`, false, item.color || '#fff');
          } else if (player.bag.length < 16) {
            player.bag.push(item);
            spawnDamageNumber(player.x, player.y - 45, `+${item.name}`, false, item.color || '#fff');
          }

          AudioEngine.playTone(440, 'triangle', 0.08, 0.08);
          break; // One item per tick for natural flow
        }
      }
    }
  }

  // 5. Apply Companion Active Aura
  applyActiveCompanionAura();
}

function applyActiveCompanionAura() {
  player.speedBonusPct = 0;
  player.armorBonusPct = 0;
  player.resBonusFlat = 0;

  if (companion.isDeliveringToTown) return;

  if (companion.activeAura === 'swift_wings') {
    player.speedBonusPct = 0.15;
  } else if (companion.activeAura === 'aegis_shell') {
    player.armorBonusPct = 0.20;
  } else if (companion.activeAura === 'ward_song') {
    player.resBonusFlat = 15;
  }
}

export function sendPetToTown() {
  if (companion.muleBag.length === 0) {
    alert('🐾 Companion backpack is currently empty. Put junk items in Pet Bag before sending to town.');
    return;
  }
  if (companion.isDeliveringToTown) {
    alert('🐾 Companion is already in town selling items.');
    return;
  }

  companion.isDeliveringToTown = true;
  companion.deliveryTimer = companion.deliveryDuration;
  AudioEngine.playTone(330, 'square', 0.2, 0.12);
}

export function setCompanionAura(auraId) {
  if (COMPANION_AURAS[auraId.toUpperCase()]) {
    companion.activeAura = auraId;
    AudioEngine.playTone(660, 'sine', 0.15, 0.1);
  }
}
