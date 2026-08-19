/**
 * Real-Time Multiplayer Client via ASP.NET Core SignalR GameHub
 * Synchronizes player movements, visual skill casts, and Zone Chat across players in the same zone.
 */

import { otherPlayers, player, zoneChatMessages } from '../state.js';
import { spawnDamageNumber } from '../combat.js';
import { AudioEngine } from '../audio.js';

class MultiplayerClient {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectTimer = null;
    this.lastSentPos = { x: 0, y: 0 };
    this.posSendInterval = null;
  }

  init() {
    this.connect();
    
    // Position broadcast loop (20 TPS)
    setInterval(() => {
      if (!this.isConnected) return;
      const dx = Math.abs(player.x - this.lastSentPos.x);
      const dy = Math.abs(player.y - this.lastSentPos.y);
      if (dx > 2 || dy > 2) {
        this.sendInvocation('UpdatePosition', [player.x, player.y, player.vx || 0, player.vy || 0, player.facing || 'down']);
        this.lastSentPos = { x: player.x, y: player.y };
      }
    }, 50);
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hubUrl = `${protocol}//${window.location.host}/gamehub`;

    try {
      this.ws = new WebSocket(hubUrl);

      this.ws.onopen = () => {
        // Send SignalR JSON handshake
        this.ws.send(JSON.stringify({ protocol: 'json', version: 1 }) + '\x1e');
      };

      this.ws.onmessage = (event) => {
        const raw = event.data;
        if (!raw) return;

        // Split messages by record separator \x1e
        const messages = raw.split('\x1e').filter(m => m.trim().length > 0);
        for (const msgStr of messages) {
          try {
            const data = JSON.parse(msgStr);
            this.handleHubMessage(data);
          } catch (e) {
            // Handshake response or ping
          }
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.updateConnectionStatus(false);
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
          }, 3000);
        }
      };

      this.ws.onerror = () => {
        this.ws.close();
      };
    } catch (err) {
      console.warn('[MultiplayerClient] Connection error:', err);
    }
  }

  handleHubMessage(data) {
    // Handshake ACK
    if (Object.keys(data).length === 0) {
      this.isConnected = true;
      this.updateConnectionStatus(true);
      // Join current zone
      this.joinCurrentZone();
      return;
    }

    // SignalR Invocation message type 1
    if (data.type === 1) {
      const target = data.target;
      const args = data.arguments || [];

      if (target === 'PlayerJoined' && args[0]) {
        const p = args[0];
        if (p.characterId !== player.id) {
          otherPlayers.set(p.characterId, {
            ...p,
            targetX: p.x,
            targetY: p.y
          });
          spawnDamageNumber(p.x, p.y - 40, `👋 ${p.characterName} entered zone`, false, '#4ade80');
        }
      } else if (target === 'ZonePeersSnapshot' && Array.isArray(args[0])) {
        for (const p of args[0]) {
          if (p.characterId !== player.id) {
            otherPlayers.set(p.characterId, {
              ...p,
              targetX: p.x,
              targetY: p.y
            });
          }
        }
      } else if (target === 'PlayerMoved' && args[0]) {
        const m = args[0];
        const peer = otherPlayers.get(m.characterId);
        if (peer) {
          peer.targetX = m.x;
          peer.targetY = m.y;
          peer.vx = m.vx;
          peer.vy = m.vy;
          peer.facing = m.facing;
        }
      } else if (target === 'PlayerSkillCast' && args[0]) {
        const sc = args[0];
        this.triggerRemoteSkillVisual(sc);
      } else if (target === 'ZoneChatMessage' && args[0]) {
        const chat = args[0];
        zoneChatMessages.push(chat);
        if (zoneChatMessages.length > 50) zoneChatMessages.shift();
        this.appendChatMessage(chat);
      } else if (target === 'PlayerLeft' && args[0]) {
        const id = args[0].characterId;
        const peer = otherPlayers.get(id);
        if (peer) {
          spawnDamageNumber(peer.x, peer.y - 40, `${peer.characterName} left zone`, false, '#a0a8b7');
          otherPlayers.delete(id);
        }
      }
    }
  }

  joinCurrentZone() {
    if (!this.isConnected) return;
    const zoneId = window.currentZoneId || player.zoneId || 'SanctuaryHaven';
    this.sendInvocation('JoinZone', [
      player.id || 'hero_default',
      player.name || 'The Unbound',
      player.classSpec || 'Novice',
      zoneId,
      player.x,
      player.y,
      player.level || 1,
      player.life || 500,
      player.maxLife || 500
    ]);
  }

  changeZone(newZoneId, newX, newY) {
    otherPlayers.clear();
    if (!this.isConnected) return;
    this.sendInvocation('ChangeZone', [newZoneId, newX, newY]);
  }

  broadcastSkill(skillKey, originX, originY, targetX, targetY) {
    if (!this.isConnected) return;
    this.sendInvocation('CastSkill', [skillKey, originX, originY, targetX, targetY]);
  }

  sendChat(message) {
    if (!this.isConnected || !message.trim()) return;
    this.sendInvocation('SendZoneChat', [message]);
  }

  sendInvocation(target, args) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const invocation = {
      type: 1,
      target: target,
      arguments: args
    };
    this.ws.send(JSON.stringify(invocation) + '\x1e');
  }

  triggerRemoteSkillVisual(sc) {
    // Play remote skill sound & animation
    if (sc.skillKey === 'fireball') {
      AudioEngine.playTone(480, 'sawtooth', 0.15, 0.1);
    } else if (sc.skillKey === 'frost') {
      AudioEngine.playTone(320, 'sine', 0.2, 0.15);
    } else if (sc.skillKey === 'slash') {
      AudioEngine.playSlash();
    }
  }

  updateConnectionStatus(connected) {
    const el = document.getElementById('multiplayerStatusPill');
    if (el) {
      if (connected) {
        el.className = 'mp-pill mp-online';
        el.innerHTML = `🟢 Online (${otherPlayers.size + 1})`;
      } else {
        el.className = 'mp-pill mp-offline';
        el.innerHTML = `🔴 Offline`;
      }
    }
  }

  appendChatMessage(chat) {
    const box = document.getElementById('zoneChatLog');
    if (!box) return;

    const div = document.createElement('div');
    div.className = 'chat-entry';
    div.innerHTML = `<span class="ce-time">[${chat.timestamp}]</span> <b class="ce-name ${chat.classSpec.toLowerCase()}">${chat.characterName}:</b> <span class="ce-msg">${chat.message}</span>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }
}

export const MPClient = new MultiplayerClient();
