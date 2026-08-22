/**
 * MDG: Aethelis - Interactive NPC Dialogue & Service System
 * Dark Fantasy ARPG Dialog Modal with Lore, Service Hooks & Interactive Choices (English)
 */

import { player } from '../state.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber } from '../combat.js';
import { renderForgeBenchModal } from './forge-ui.js';
import { renderSharedStashModal } from './stash-ui.js';
import { renderMapDeviceModal } from './map-device-ui.js';
import { renderDevotionModal } from './devotion-ui.js';
import { sendPetToTown } from '../companion.js';
import { SET_ITEMS_DATABASE } from '../data/items.js';
import { updateBackpackUI, updatePaperdollUI } from './inventory.js';
import { renderHunterGuildModal } from './hunter-guild-ui.js';

let activeNpc = null;

export const NPC_DIALOGUES = {
  'Valeria (Hunter Guildmaster)': {
    title: 'Hunter Guild Commander',
    avatarIcon: '🦅',
    color: '#ffd700',
    greeting: 'Welcome to the Hunter’s Guild, slayer. Bring me monster pelts, trophies and beast cores to trade for Gold and earn Hunter Rank Promotions!',
    options: [
      {
        label: '📜 Hunter Guild Bounty Board & Rank Ascension',
        action: () => renderHunterGuildModal()
      },
      {
        label: '💰 Quick Sell All Monster Trophies (Pelts, Fangs & Bones)',
        action: () => renderHunterGuildModal()
      },
      {
        label: '👑 Inquire on Hunter Ranks (F -> S Monarch)',
        response: 'Every beast trophy you exchange earns Bounty Reputation. Advance through 7 ranks (F -> E -> D -> C -> B -> A -> S Monarch) to unlock huge gold sales bonuses, item rarity, and the golden Sovereign Aura!'
      }
    ]
  },
  'Elder Aethel': {
    title: 'High Elder Sage',
    avatarIcon: '🧙‍♂️',
    color: '#61afef',
    greeting: 'Welcome back to Sanctuary Haven, Chosen One. The Void surges relentlessly from the depths of Aethelis...',
    options: [
      {
        label: '📜 Lore of Aethelis',
        response: 'Eras ago, our continent was guarded by four ancient constellations. When Malakor shattered the barrier, darkness spilled across the realm. Reclaim the Genesis Orbs to rekindle the Eternal Shrine.'
      },
      {
        label: '💊 Blessed Blessing: Restore Full Life & Mana',
        action: () => {
          player.life = player.maxLife;
          player.mana = player.maxMana;
          player.es = player.maxEs;
          AudioEngine.playTone(659, 'sine', 0.3, 0.3);
          spawnDamageNumber(player.x, player.y - 50, '✨ Life & Mana Fully Restored!', true, '#98c379');
        },
        response: 'May the primal light cleanse your wounds and restore your spirit!'
      },
      {
        label: '✨ Open Celestial Devotion Grid',
        action: () => renderDevotionModal()
      },
      {
        label: '💎 Where can I find Skill Gems?',
        response: 'Skill & Support Gems are crystallized shards of the shattered Eternal Core. They cannot be bought with mere gold; you must venture into wild biomes, defeat monsters and slay Dungeon Bosses to farm and harvest them!'
      }
    ]
  },
  'Doran (Blacksmith)': {
    title: 'Master Craftsman & Smith',
    avatarIcon: '🔨',
    color: '#e5c07b',
    greeting: 'My forge burns day and night! Have you brought Genesis Orbs to reforge your weapons and armor?',
    options: [
      {
        label: '🔨 Open Genesis Crafting Forge',
        action: () => renderForgeBenchModal()
      },
      {
        label: '🎁 Claim Sacred Vanguard Set (4-Piece Set Demo)',
        action: () => {
          const vanguardPieces = SET_ITEMS_DATABASE.filter(it => it.setId === 'set_vanguard');
          vanguardPieces.forEach(p => player.bag.push({ ...p }));
          AudioEngine.playPickup();
          spawnDamageNumber(player.x, player.y - 50, '🎁 Received 4 Vanguard Set Items!', true, '#00e676');
          updateBackpackUI();
          updatePaperdollUI();
        },
        response: 'Take these consecrated relics! Wear all 4 pieces to unlock the Sacred Bastion and unleash Triple Holy Blade Waves!'
      },
      {
        label: '❓ Socket Reforging & Metamods Guide',
        response: 'Use Socketing Cores to re-roll sockets, and Harmonic Tethers to harmonize link chains. To preserve critical prefixes or suffixes, spend 2x Fracture Cores to lock mods before re-rolling!'
      }
    ]
  },
  'Kaelen (Vault Keeper)': {
    title: 'Keeper of the Vault',
    avatarIcon: '📦',
    color: '#98c379',
    greeting: 'This vault is bound by ancient celestial seals, linking the soul inventory across all your heroes in Aethelis.',
    options: [
      {
        label: '📦 Open Account Shared Stash',
        action: () => renderSharedStashModal()
      },
      {
        label: '🔮 Currency Vault Storage Advice',
        response: 'In the Currency Vault tab, all 8 Genesis Orbs stack without limit. You can withdraw 1x or 10x stacks instantly anytime!'
      }
    ]
  },
  'Lyra (Astromancer)': {
    title: 'Astromancer of the Void',
    avatarIcon: '🌌',
    color: '#c678dd',
    greeting: 'The constellations align... The Gate of Eternity is ready to receive Map Keystones to open dimensional rifts to Pinnacle Bosses.',
    options: [
      {
        label: '🌌 Open Gate of Eternity (Map Device)',
        action: () => renderMapDeviceModal()
      },
      {
        label: '✨ Open Celestial Devotion Grid',
        action: () => renderDevotionModal()
      },
      {
        label: '👹 Inquire on Pinnacle Boss Arenas',
        response: 'At Tier 14+, you will challenge Ignis (Caldera of Fire), Vael (Glacial Sovereign), and Malakor (Ultimate Void). Ensure 75% elemental resistances before entering the fracture!'
      }
    ]
  },
  'Mira (Beastmaster)': {
    title: 'Companion Beastmaster',
    avatarIcon: '🐾',
    color: '#00f2fe',
    greeting: 'Your Spirit Companion stands ever vigilant, collecting ground spoils and carrying your burden.',
    options: [
      {
        label: '🐾 Send Companion to Town to Sell Loot',
        action: () => sendPetToTown()
      },
      {
        label: '🕊️ Learn Companion Auras',
        response: 'Your companion bestows 3 blessings: Swift Wings (+15% Move Speed), Aegis Shell (+20% Armor Rating), or Ward Song (+15% All Elemental Resistances).'
      }
    ]
  },
  'Valen (Scout)': {
    title: 'Outpost Ranger & Scout',
    avatarIcon: '🏹',
    color: '#e06c75',
    greeting: 'Venture carefully into Whispering Plains! Just beyond the ridge lies the Forgotten Crypt, crawling with undead.',
    options: [
      {
        label: '🏰 Inquire on Forgotten Crypt Path',
        response: 'Head eastward through the plains until you reach the ancient portal archway leading directly into the crypt chambers.'
      },
      {
        label: '💊 Field First Aid (Restore Health)',
        action: () => {
          player.life = player.maxLife;
          AudioEngine.playTone(523, 'sine', 0.25, 0.2);
          spawnDamageNumber(player.x, player.y - 40, '+250 HP Restored!', false, '#98c379');
        },
        response: 'Wounds bound and stitched. Stand tall and fight for Aethelis!'
      }
    ]
  }
};

export function openNpcDialogue(npc) {
  activeNpc = npc;
  const config = NPC_DIALOGUES[npc.name] || {
    title: npc.title || 'Villager',
    avatarIcon: '👤',
    color: npc.color || '#ffd700',
    greeting: `Greetings, traveler! I am ${npc.name}. How may I assist you on your journey?`,
    options: [
      {
        label: '💬 Wish you safe travels',
        response: 'Thank you! May the celestial stars guide your path.'
      }
    ]
  };

  let modal = document.getElementById('npcDialogueModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'npcDialogueModal';
    modal.className = 'game-modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="npc-dialog-card">
      <div class="npc-dialog-header">
        <div class="npc-portrait-circle" style="border-color:${config.color};">
          <span class="npc-avatar-emoji">${config.avatarIcon}</span>
        </div>
        <div class="npc-info-header">
          <h2 style="color:${config.color};">${npc.name}</h2>
          <span class="npc-title-tag">${config.title}</span>
        </div>
        <button class="close-btn" id="closeNpcDialogBtn">✕</button>
      </div>

      <div class="npc-dialog-body">
        <div class="npc-speech-bubble" id="npcSpeechText">
          "${config.greeting}"
        </div>

        <div class="npc-choices-group" id="npcChoicesContainer"></div>
      </div>
    </div>
  `;

  document.getElementById('closeNpcDialogBtn').onclick = () => {
    modal.style.display = 'none';
  };

  renderNpcChoices(config);
  modal.style.display = 'flex';
  AudioEngine.playTone(440, 'triangle', 0.15, 0.15);
}

function renderNpcChoices(config) {
  const container = document.getElementById('npcChoicesContainer');
  const speechText = document.getElementById('npcSpeechText');
  if (!container) return;

  container.innerHTML = '';
  config.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'npc-choice-btn';
    btn.innerText = opt.label;
    btn.onclick = () => {
      AudioEngine.playTone(587, 'sine', 0.1, 0.1);
      if (opt.action) {
        opt.action();
      } else if (opt.actionType) {
        executeNpcActionType(opt.actionType);
      }
      if (opt.response) {
        speechText.innerHTML = `"${opt.response}"`;
      }
    };
    container.appendChild(btn);
  });

  // Always add Farewell Button
  const byeBtn = document.createElement('button');
  byeBtn.className = 'npc-choice-btn btn-farewell';
  byeBtn.innerText = '🚪 Farewell';
  byeBtn.onclick = () => {
    document.getElementById('npcDialogueModal').style.display = 'none';
  };
  container.appendChild(byeBtn);
}

function executeNpcActionType(actionType) {
  switch (actionType) {
    case 'heal':
      player.life = player.maxLife;
      player.mana = player.maxMana;
      player.es = player.maxEs;
      AudioEngine.playTone(659, 'sine', 0.3, 0.3);
      spawnDamageNumber(player.x, player.y - 50, '✨ Vitality Restored!', true, '#98c379');
      break;
    case 'open_forge':
      renderForgeBenchModal();
      break;
    case 'open_stash':
      renderSharedStashModal();
      break;
    case 'open_map_device':
      renderMapDeviceModal();
      break;
    case 'open_devotion':
      renderDevotionModal();
      break;
    case 'give_vanguard_set':
      const vanguardPieces = SET_ITEMS_DATABASE.filter(it => it.setId === 'set_vanguard');
      vanguardPieces.forEach(p => player.bag.push({ ...p }));
      AudioEngine.playPickup();
      spawnDamageNumber(player.x, player.y - 50, '🎁 Received Vanguard Relics!', true, '#00e676');
      updateBackpackUI();
      updatePaperdollUI();
      break;
  }
}

export async function fetchMasterNpcsFromServer() {
  try {
    const res = await fetch('/api/v1/data/npcs');
    if (!res.ok) return;
    const serverNpcs = await res.json();
    if (Array.isArray(serverNpcs) && serverNpcs.length > 0) {
      serverNpcs.forEach(sn => {
        let options = [];
        try {
          options = typeof sn.optionsJson === 'string' ? JSON.parse(sn.optionsJson) : (sn.optionsJson || []);
        } catch { }

        NPC_DIALOGUES[sn.npcName] = {
          title: sn.title,
          avatarIcon: sn.avatarIcon,
          color: sn.color,
          greeting: sn.greeting,
          options: options
        };
      });
      console.log(`[MasterData] Hydrated ${serverNpcs.length} NPCs from SQLite database.`);
    }
  } catch (e) {
    console.warn('[MasterData] Using bundled offline NPC fallback:', e.message);
  }
}

