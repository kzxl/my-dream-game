/**
 * Real-Time Multiplayer Client via ASP.NET Core SignalR GameHub
 * Synchronizes player movements, visual skill casts, and Multi-Channel Chat across players in the same zone and channel.
 */

import { otherPlayers, player, zoneChatMessages } from '../state.js';
import { spawnDamageNumber } from '../combat.js';
import { AudioEngine } from '../audio.js';
import { CHANNELS } from '../data/channels.js';

export { CHANNELS };

class MultiplayerClient {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.isInitialized = false;
    this.reconnectTimer = null;
    this.lastSentPos = { x: 0, y: 0 };
    this.posSendInterval = null;
    this.processedChatIds = new Set();
    this.currentChannel = localStorage.getItem('mdg_current_channel') || 'CH-1';
    this.pingInterval = null;
    this.pingMs = 18;
    this.serverTickRate = 30;
  }

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.connect();
    this.setupChannelUI();
    this.startPingMonitor();
    
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

    // SignalR Keep-Alive Ping Loop (every 10s)
    if (!this.pingInterval) {
      this.pingInterval = setInterval(() => {
        if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
          try { this.ws.send('{"type":6}\x1e'); } catch (e) {}
        }
      }, 10000);
    }
  }

  startPingMonitor() {
    this.measurePing();
    setInterval(() => this.measurePing(), 3000);
  }

  async measurePing() {
    try {
      const t0 = performance.now();
      const res = await fetch('/api/v1/health', { cache: 'no-store' });
      if (res.ok) {
        const t1 = performance.now();
        this.pingMs = Math.max(1, Math.round(t1 - t0));
        const data = await res.json();
        if (data.tickRate) this.serverTickRate = data.tickRate;
        this.updateChannelUI();
      }
    } catch (e) {
      // Offline / network issue
    }
  }

  getPingInfo() {
    const ping = Math.max(1, this.pingMs || 20);
    let color = '#4ade80';
    let label = 'Rất Tốt (Stable)';
    let emoji = '🟢';
    if (ping > 120) {
      color = '#ef4444';
      label = 'Chậm (High Latency)';
      emoji = '🔴';
    } else if (ping > 60) {
      color = '#f59e0b';
      label = 'Ổn Định (Good)';
      emoji = '🟡';
    }
    return { pingMs: ping, color, label, emoji };
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (this.ws) {
      try {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.onmessage = null;
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }

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
            // Non-JSON packet or empty handshake
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
          }, 2500);
        }
      };

      this.ws.onerror = () => {
        if (this.ws) {
          try { this.ws.close(); } catch (e) {}
        }
      };
    } catch (err) {
      console.warn('[MultiplayerClient] Connection error:', err);
    }
  }

  handleHubMessage(data) {
    // Ping message from server (type 6) -> Acknowledge ping
    if (data.type === 6) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try { this.ws.send('{"type":6}\x1e'); } catch (e) {}
      }
      return;
    }

    // Handshake ACK (empty object)
    if (Object.keys(data).length === 0) {
      this.isConnected = true;
      this.updateConnectionStatus(true);
      // Join current zone & channel
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
          spawnDamageNumber(p.x, p.y - 40, `👋 ${p.characterName} entered zone [${this.currentChannel}]`, false, '#4ade80');
          this.updateConnectionStatus(true);
        }
      } else if (target === 'ZonePeersSnapshot' && Array.isArray(args[0])) {
        otherPlayers.clear();
        for (const p of args[0]) {
          if (p.characterId !== player.id) {
            otherPlayers.set(p.characterId, {
              ...p,
              targetX: p.x,
              targetY: p.y
            });
          }
        }
        this.updateConnectionStatus(true);
      } else if (target === 'ChannelChanged' && args[0]) {
        const info = args[0];
        spawnDamageNumber(player.x, player.y - 60, `🌐 Switched to ${info.channelId} (${info.peersCount} peers nearby)`, true, '#ffd700');
        this.updateChannelUI();
        this.updateConnectionStatus(true);
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
        const msgKey = chat.id || `${chat.characterName}_${chat.timestamp}_${chat.message}`;
        if (this.processedChatIds.has(msgKey)) {
          return;
        }
        this.processedChatIds.add(msgKey);
        if (this.processedChatIds.size > 200) {
          const firstKey = this.processedChatIds.values().next().value;
          this.processedChatIds.delete(firstKey);
        }

        zoneChatMessages.push(chat);
        if (zoneChatMessages.length > 50) zoneChatMessages.shift();
        this.appendChatMessage(chat);
      } else if (target === 'PlayerLeft' && args[0]) {
        const id = args[0].characterId;
        const peer = otherPlayers.get(id);
        if (peer) {
          spawnDamageNumber(peer.x, peer.y - 40, `${peer.characterName} left zone`, false, '#a0a8b7');
          otherPlayers.delete(id);
          this.updateConnectionStatus(true);
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
      player.gender || 'Male',
      zoneId,
      this.currentChannel,
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

  changeChannel(newChannelId) {
    if (newChannelId === this.currentChannel && this.isConnected) return;
    this.currentChannel = newChannelId;
    localStorage.setItem('mdg_current_channel', newChannelId);
    otherPlayers.clear();
    if (this.isConnected) {
      this.sendInvocation('ChangeChannel', [newChannelId]);
    }
    this.updateChannelUI();
    this.updateConnectionStatus(this.isConnected);
  }

  broadcastSkill(skillKey, originX, originY, targetX, targetY) {
    if (!this.isConnected) return;
    this.sendInvocation('CastSkill', [skillKey, originX, originY, targetX, targetY]);
  }

  sendChat(message, scope = 'zone') {
    if (!this.isConnected || !message.trim()) return;
    this.sendInvocation('SendZoneChat', [message, scope]);
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

  setupChannelUI() {
    this.updateChannelUI();
  }

  updateChannelUI() {
    const chEl = document.getElementById('channelSelectBtn');
    if (chEl) {
      const chObj = CHANNELS.find(c => c.id === this.currentChannel) || CHANNELS[0];
      const p = this.getPingInfo();
      chEl.innerHTML = `${chObj.icon} ${chObj.id} <span class="ch-ping-indicator" style="color:${p.color}; font-weight:800; font-size:10px; margin-left:3px;">● ${p.pingMs}ms</span> ▾`;
      chEl.title = `Kênh Hiện Tại: ${chObj.name} | Độ trễ Server: ${p.pingMs}ms (${p.label})`;
    }
  }

  updateConnectionStatus(connected) {
    const el = document.getElementById('multiplayerStatusPill');
    if (el) {
      if (connected) {
        el.className = 'mp-pill mp-online';
        el.innerHTML = `🟢 ${this.currentChannel} (${otherPlayers.size + 1} heroes)`;
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
    const scopeTag = chat.scope === 'world' ? '<span class="ce-scope world">[World]</span>' : `<span class="ce-scope channel">[${chat.channelId || 'CH-1'}]</span>`;
    div.innerHTML = `${scopeTag} <span class="ce-time">[${chat.timestamp}]</span> <b class="ce-name ${(chat.classSpec || 'novice').toLowerCase()}">${chat.characterName}:</b> <span class="ce-msg">${chat.message}</span>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }
}

export const MPClient = new MultiplayerClient();

