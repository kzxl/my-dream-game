/**
 * MDG: Aethelis - Hunter Guild & Rank Ascension System (Hiệp Hội Thợ Săn & Thăng Hạng Cảnh Giới)
 * Features:
 *   - 7 Hunter Ranks (F -> E -> D -> C -> B -> A -> S Monarch) with escalating Gold bonuses & Combat Perks
 *   - Hunter's Bounty Board (Dynamic Monster Hunting Contracts with Gold, Catalysts & EXP rewards)
 *   - Quick Sell Monster Trophies (Converting raw animal pelts, fangs & essences into Gold + Bounty EXP)
 *   - Rank Ascension Promotion Ceremony & Visual Hunter Badges
 */

import { player } from '../state.js';
import { AudioEngine } from '../audio.js';
import { saveToDatabase } from '../save-system.js';
import { spawnDamageNumber } from '../combat.js';
import { getLanguage, t } from '../i18n.js';
import { updateBackpackUI } from './inventory.js';

export const HUNTER_RANKS = [
  { rank: 'F', expReq: 0, title: 'Novice Tracker (F)', titleVi: 'Thợ Săn Tập Sự (F)', badge: '🥉', bonusGold: 0, bonusIir: 0, perkDesc: 'Base trophy exchange rate at Guild.' },
  { rank: 'E', expReq: 1200, title: 'Apprentice Hunter (E)', titleVi: 'Dò Đường Học Việc (E)', badge: '🥈', bonusGold: 8, bonusIir: 5, perkDesc: '+8% Gold from trophy sales, +5% Item Rarity.' },
  { rank: 'D', expReq: 6000, title: 'Veteran Slayer (D)', titleVi: 'Thợ Săn Dày Dạn (D)', badge: '🥇', bonusGold: 16, bonusIir: 10, perkDesc: '+16% Gold from trophy sales, +10% Item Rarity, +5% Movement Speed.' },
  { rank: 'C', expReq: 22000, title: 'Vanguard Specialist (C)', titleVi: 'Tiên Phong Diệt Ma (C)', badge: '💎', bonusGold: 26, bonusIir: 18, perkDesc: '+26% Gold from trophy sales, +18% Item Rarity, unlocks Tier 2 Contracts.' },
  { rank: 'B', expReq: 70000, title: 'Apex Nemesis (B)', titleVi: 'Đại Địch Đỉnh Cao (B)', badge: '🔮', bonusGold: 40, bonusIir: 28, perkDesc: '+40% Gold from trophy sales, +28% Item Rarity, +12% Damage to Bosses.' },
  { rank: 'A', expReq: 180000, title: 'Grandmaster Slayer (A)', titleVi: 'Đại Tông Sư Thợ Săn (A)', badge: '👑', bonusGold: 60, bonusIir: 40, perkDesc: '+60% Gold from trophy sales, +40% Item Rarity, unlocks Legendary Bounties.' },
  { rank: 'S', expReq: 500000, title: '🌟 Calamity Monarch (S)', titleVi: '🌟 Quân Vương Chinh Phạt (S)', badge: '👑', bonusGold: 100, bonusIir: 65, perkDesc: '+100% Gold from trophy sales, +65% Item Rarity, Golden Sovereign Monarch Aura.' }
];

export function getPlayerHunterRank() {
  if (!player.hunterExp) player.hunterExp = 0;
  if (!player.hunterRank) player.hunterRank = 'F';

  let currentTier = HUNTER_RANKS[0];
  for (let i = HUNTER_RANKS.length - 1; i >= 0; i--) {
    if (player.hunterExp >= HUNTER_RANKS[i].expReq) {
      currentTier = HUNTER_RANKS[i];
      break;
    }
  }
  return currentTier;
}

export function getNextHunterRank(currentRank) {
  const idx = HUNTER_RANKS.findIndex(r => r.rank === currentRank);
  if (idx !== -1 && idx < HUNTER_RANKS.length - 1) {
    return HUNTER_RANKS[idx + 1];
  }
  return null;
}

export function generateDailyBounties() {
  return [
    {
      id: 'bounty_wolves',
      name: '🐺 Purge Whispering Direwolves',
      nameVi: '🐺 Tiêu Diệt Bầy Sói Rừng Thầm Thì',
      desc: 'Slay 12 Direwolves roaming Whispering Plains.',
      targetMonster: 'wolf',
      requiredCount: 12,
      goldReward: 850,
      expReward: 350,
      itemReward: { name: 'Iron Ingot', count: 3, icon: '🧱' }
    },
    {
      id: 'bounty_ghouls',
      name: '❄️ Frostpeak Ghoul Extermination',
      nameVi: '❄️ Thanh Trừng Quỷ Băng Đỉnh Tuyết',
      desc: 'Slay 10 Frost Ghouls in Frostpeak Tundra.',
      targetMonster: 'frost_ghoul',
      requiredCount: 10,
      goldReward: 1800,
      expReward: 750,
      itemReward: { name: 'Mithril Ingot', count: 2, icon: '🔷' }
    },
    {
      id: 'bounty_cryomancer',
      name: '👑 Slay Cryomancer Knight Vael',
      nameVi: '👑 Trảm Quyết Hiệp Sĩ Băng Vael',
      desc: 'Defeat the Dungeon Boss of Frostpeak Keep.',
      targetMonster: 'vael_boss',
      requiredCount: 1,
      goldReward: 5000,
      expReward: 2500,
      itemReward: { name: 'Fracture Core', count: 1, icon: '🔮' }
    },
    {
      id: 'bounty_behemoth',
      name: '🐉 Apex Bounty: Mutated Titan Behemoth',
      nameVi: '🐉 Đại Trực Thưởng: Dị Thú Thái Cổ Behemoth',
      desc: 'Hunt down an enraged mutant elite beast in wild incursions.',
      targetMonster: 'mutant',
      requiredCount: 3,
      goldReward: 12000,
      expReward: 6000,
      itemReward: { name: 'Ascendant Catalyst', count: 2, icon: '✨' }
    }
  ];
}

export function renderHunterGuildModal() {
  let modal = document.getElementById('hunterGuildModal');
  if (modal && modal.style.display !== 'none') {
    modal.style.display = 'none';
    return;
  }

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'hunterGuildModal';
    modal.className = 'game-modal-backdrop modal-overlay';
    document.body.appendChild(modal);
  }

  // Ensure state
  if (!player.hunterExp) player.hunterExp = 0;
  if (!player.hunterBounties) player.hunterBounties = generateDailyBounties();
  if (!player.bountyProgress) player.bountyProgress = {};

  const lang = getLanguage() || 'vi';
  const currentRank = getPlayerHunterRank();
  const nextRank = getNextHunterRank(currentRank.rank);
  const isMaxRank = !nextRank;

  let progressPct = 100;
  let expLabel = 'MAX RANK (Calamity Monarch)';
  if (nextRank) {
    const curExpInTier = player.hunterExp - currentRank.expReq;
    const neededInTier = nextRank.expReq - currentRank.expReq;
    progressPct = Math.min(100, Math.round((curExpInTier / neededInTier) * 100));
    expLabel = `${player.hunterExp.toLocaleString()} / ${nextRank.expReq.toLocaleString()} EXP (${progressPct}%)`;
  }

  const trophyStats = scanTrophiesInBag();

  modal.innerHTML = `
    <div class="hunter-modal-card">
      <div class="hunter-modal-header">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:32px;">📜</span>
          <div>
            <h2 style="margin:0; font-size:19px; color:#ffd700;">HAVEN HUNTER'S GUILD & BOUNTY BOARD</h2>
            <span style="font-size:11px; color:#94a3b8;">${lang === 'vi' ? 'Hiệp Hội Thợ Săn, Bán Chiến Tích & Thăng Hạng Cảnh Giới' : 'Hunter Ranks, Trophy Exchange & Monster Bounties'}</span>
          </div>
        </div>
        <button class="close-btn" id="closeHunterGuildBtn">✕</button>
      </div>

      <!-- Hunter Rank & Ascension Banner -->
      <div class="hunter-rank-banner">
        <div class="rank-badge-box">
          <span class="rank-icon-big">${currentRank.badge}</span>
          <div>
            <div class="rank-title-text">${lang === 'vi' ? currentRank.titleVi : currentRank.title}</div>
            <div class="rank-perk-text">✨ ${currentRank.perkDesc}</div>
          </div>
        </div>

        <div class="rank-progress-wrap">
          <div class="rank-progress-label">
            <span>🌟 ${lang === 'vi' ? 'Uy Danh Thợ Săn:' : 'Bounty Reputation:'}</span>
            <b style="color:#00f2fe;">${expLabel}</b>
          </div>
          <div class="rank-progress-track">
            <div class="rank-progress-fill" style="width:${progressPct}%;"></div>
          </div>
        </div>

        ${(!isMaxRank && progressPct >= 100) ? `
          <button id="btnAscendHunterRank" class="btn-hunter-ascend-glow">
            👑 ${lang === 'vi' ? 'SÁT HẠCH THĂNG HẠNG' : 'RANK UP PROMOTION'}
          </button>
        ` : ''}
      </div>

      <!-- Main 2-Column Content Grid -->
      <div class="hunter-content-grid">
        <!-- Left: Active Hunting Bounties -->
        <div class="hunter-bounties-panel">
          <div class="panel-header-title">
            <h3>🎯 ${lang === 'vi' ? 'Hợp Đồng Săn Tiền Thưởng' : 'Active Bounty Contracts'}</h3>
            <span style="font-size:11px; color:#4ade80;">${lang === 'vi' ? 'Làm mới hằng ngày' : 'Daily Renewals'}</span>
          </div>

          <div class="bounty-contracts-list">
            ${player.hunterBounties.map(b => {
              const prog = player.bountyProgress[b.id] || 0;
              const isCompleted = prog >= b.requiredCount;
              const isClaimed = player.bountyProgress[`${b.id}_claimed`];

              return `
                <div class="bounty-card ${isCompleted ? 'completed' : ''} ${isClaimed ? 'claimed' : ''}">
                  <div class="bounty-card-header">
                    <span class="bounty-name">${lang === 'vi' ? b.nameVi : b.name}</span>
                    <span class="bounty-status">${isClaimed ? '✓ CLAIMED' : (isCompleted ? '✨ READY TO CLAIM' : `${prog}/${b.requiredCount}`)}</span>
                  </div>
                  <div class="bounty-desc">${b.desc}</div>
                  <div class="bounty-reward-row">
                    <span>💰 +${b.goldReward.toLocaleString()} Gold</span>
                    <span>🌟 +${b.expReward} EXP</span>
                    ${b.itemReward ? `<span style="color:#ffd700;">${b.itemReward.icon} ${b.itemReward.name} x${b.itemReward.count}</span>` : ''}
                    
                    ${(!isClaimed && isCompleted) ? `
                      <button class="btn-claim-bounty" data-bounty-id="${b.id}">🎁 ${lang === 'vi' ? 'Nhận Thưởng' : 'Claim'}</button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right: Monster Trophies Quick Exchange & Scrap Market -->
        <div class="hunter-exchange-panel">
          <div class="panel-header-title">
            <h3>📦 ${lang === 'vi' ? 'Thu Mua Chiến Tích Săn Bắt' : 'Trophy & Scrap Market'}</h3>
          </div>

          <div class="trophy-market-box">
            <p style="font-size:12px; color:#cbd5e1; margin-bottom:12px; line-height:1.5;">
              ${lang === 'vi' ? 'Quái vật dã ngoại rơi da lông thú, nanh vuốt, xương tủy và tro linh hồn. Hãy nộp toàn bộ chiến tích để quy đổi thành Tiền Vàng và tăng Uy Danh Thợ Săn!' : 'Wild monsters drop pelts, fangs, bones and essences. Exchange them here for Gold and Bounty Reputation!'}
            </p>

            <div class="trophy-summary-card">
              <div>📦 ${lang === 'vi' ? 'Chiến tích trong túi:' : 'Trophies in Backpack:'} <b style="color:#ffd700;">${trophyStats.totalItems} món</b></div>
              <div style="margin-top:6px;">💰 ${lang === 'vi' ? 'Giá trị quy đổi (đã cộng Rank bonus +' + currentRank.bonusGold + '%):' : 'Estimated Value:'} <b style="color:#00e676; font-size:16px;">+${trophyStats.totalGold.toLocaleString()} Gold</b></div>
              <div style="margin-top:4px;">🌟 ${lang === 'vi' ? 'Uy danh nhận được:' : 'Reputation Yield:'} <b style="color:#00f2fe;">+${trophyStats.totalExp} EXP</b></div>
            </div>

            <div style="margin-top:18px;">
              <button id="btnQuickSellTrophies" class="btn-sell-trophies-glow" ${trophyStats.totalItems === 0 ? 'disabled' : ''}>
                💰 ${lang === 'vi' ? 'BÁN NHANH TOÀN BỘ CHIẾN TÍCH' : 'QUICK SELL ALL TROPHIES'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  AudioEngine.playTone?.(520, 'triangle', 0.1, 0.08);

  setupHunterGuildEvents(modal);
}

function scanTrophiesInBag() {
  let count = 0;
  let rawGold = 0;

  const currentRank = getPlayerHunterRank();
  const rankBonusMult = 1.0 + (currentRank.bonusGold / 100);

  // Scan player bag for monster scraps & trophies
  player.bag.forEach(item => {
    if (!item) return;
    const isTrophy = item.category === 'trophy' || item.slot === 'Trophy' || item.isTrophy || (item.name && (item.name.includes('Pelt') || item.name.includes('Fang') || item.name.includes('Claw') || item.name.includes('Bone') || item.name.includes('Essence') || item.name.includes('Scrap')));
    if (isTrophy) {
      count++;
      rawGold += item.value || (item.rarity === 'Rare' ? 350 : (item.rarity === 'Magic' ? 140 : 45));
    }
  });

  // Also calculate from materials vault scraps if any
  if (player.materials) {
    const trophyMatKeys = ['mat_beast_pelt', 'mat_wolf_fang', 'mat_undead_bone', 'mat_demon_horn', 'mat_scrap_metal', 'mat_golem_shard'];
    trophyMatKeys.forEach(k => {
      if (player.materials[k] && player.materials[k] > 0) {
        count += player.materials[k];
        rawGold += player.materials[k] * 35;
      }
    });
  }

  const finalGold = Math.round(rawGold * rankBonusMult);
  const totalExp = Math.round(finalGold * 0.45);

  return { totalItems: count, totalGold: finalGold, totalExp: totalExp };
}

function setupHunterGuildEvents(modal) {
  document.getElementById('closeHunterGuildBtn').onclick = () => {
    modal.style.display = 'none';
    AudioEngine.playTone?.(330, 'triangle', 0.1, 0.08);
  };

  // Rank Ascension Promotion
  const btnAscend = document.getElementById('btnAscendHunterRank');
  if (btnAscend) {
    btnAscend.onclick = () => {
      const cur = getPlayerHunterRank();
      const nxt = getNextHunterRank(cur.rank);
      if (nxt && player.hunterExp >= nxt.expReq) {
        player.hunterRank = nxt.rank;
        AudioEngine.playLevelUp?.();
        spawnDamageNumber(player.x, player.y - 75, `👑 HUNTER RANK PROMOTION: [${nxt.rank}]!`, true, '#ffd700');
        saveToDatabase(true);
        renderHunterGuildModal();
      }
    };
  }

  // Quick Sell Trophies
  const btnSell = document.getElementById('btnQuickSellTrophies');
  if (btnSell) {
    btnSell.onclick = () => {
      const stats = scanTrophiesInBag();
      if (stats.totalItems === 0) return alert('No monster trophies found in backpack.');

      // Remove trophies from bag
      for (let i = player.bag.length - 1; i >= 0; i--) {
        const item = player.bag[i];
        if (item && (item.category === 'trophy' || item.slot === 'Trophy' || item.isTrophy || (item.name && (item.name.includes('Pelt') || item.name.includes('Fang') || item.name.includes('Claw') || item.name.includes('Bone') || item.name.includes('Essence') || item.name.includes('Scrap'))))) {
          player.bag.splice(i, 1);
        }
      }

      // Remove trophy materials
      if (player.materials) {
        const trophyMatKeys = ['mat_beast_pelt', 'mat_wolf_fang', 'mat_undead_bone', 'mat_demon_horn', 'mat_scrap_metal', 'mat_golem_shard'];
        trophyMatKeys.forEach(k => {
          if (player.materials[k]) player.materials[k] = 0;
        });
      }

      player.gold = (player.gold || 0) + stats.totalGold;
      player.hunterExp = (player.hunterExp || 0) + stats.totalExp;

      AudioEngine.playPickup?.();
      spawnDamageNumber(player.x, player.y - 50, `💰 +${stats.totalGold.toLocaleString()} GOLD (+${stats.totalExp} EXP)!`, true, '#ffd700');

      updateBackpackUI();
      saveToDatabase(true);
      renderHunterGuildModal();
    };
  }

  // Claim Bounties
  modal.querySelectorAll('.btn-claim-bounty').forEach(btn => {
    btn.onclick = () => {
      const bountyId = btn.getAttribute('data-bounty-id');
      const bounty = player.hunterBounties.find(b => b.id === bountyId);
      if (!bounty) return;

      player.bountyProgress[`${bountyId}_claimed`] = true;
      player.gold = (player.gold || 0) + bounty.goldReward;
      player.hunterExp = (player.hunterExp || 0) + bounty.expReward;

      if (bounty.itemReward) {
        player.bag.push({
          name: bounty.itemReward.name,
          slot: 'Currency',
          rarity: 'Rare',
          color: '#ffd700',
          icon: bounty.itemReward.icon,
          count: bounty.itemReward.count
        });
      }

      AudioEngine.playLevelUp?.();
      spawnDamageNumber(player.x, player.y - 65, `🎁 BOUNTY CLAIMED: +${bounty.goldReward.toLocaleString()} GOLD!`, true, '#00e676');

      updateBackpackUI();
      saveToDatabase(true);
      renderHunterGuildModal();
    };
  });
}
