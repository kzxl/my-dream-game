/**
 * MDG: Aethelis - 2D Top-Down Pixel Art ARPG Engine
 * Skill Attribute Tags & Dynamic EXP Multipliers (PoE / Grim Dawn Tag System)
 */

(function () {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const minimapCanvas = document.getElementById('minimapCanvas');
  const mmCtx = minimapCanvas.getContext('2d');

  ctx.imageSmoothingEnabled = false;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
  }
  window.addEventListener('resize', resize);
  resize();

  const WORLD_SIZE = 4000;
  const TILE_SIZE = 64;

  const camera = {
    x: 2000,
    y: 2000,
    zoom: 1.0,
    targetZoom: 1.0,
    minZoom: 0.45,
    maxZoom: 2.0
  };

  // ==========================================
  // 1. WEB AUDIO API SYNTHESIZER (SFX)
  // ==========================================
  const AudioEngine = {
    ctx: null,
    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
    },
    playTone(freq, type, duration, gain = 0.1) {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gNode = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gNode.gain.setValueAtTime(gain, this.ctx.currentTime);
        gNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gNode);
        gNode.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    },
    playLootDrop(rarity) {
      this.init();
      if (rarity === 'Unique') {
        this.playTone(880, 'sine', 0.4, 0.18);
        setTimeout(() => this.playTone(1320, 'sine', 0.6, 0.2), 80);
      } else if (rarity === 'Rare' || rarity === 'Currency') {
        this.playTone(720, 'triangle', 0.3, 0.15);
        setTimeout(() => this.playTone(1080, 'sine', 0.4, 0.15), 60);
      } else {
        this.playTone(440, 'triangle', 0.2, 0.08);
      }
    },
    playPickup() {
      this.init();
      this.playTone(580, 'sine', 0.15, 0.12);
      setTimeout(() => this.playTone(880, 'sine', 0.25, 0.15), 50);
    },
    playHit(isCrit) {
      this.init();
      if (isCrit) {
        this.playTone(180, 'sawtooth', 0.25, 0.2);
        setTimeout(() => this.playTone(360, 'sine', 0.3, 0.15), 30);
      } else {
        this.playTone(120, 'square', 0.12, 0.08);
      }
    },
    playLevelUp() {
      this.init();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((note, idx) => {
        setTimeout(() => this.playTone(note, 'triangle', 0.35, 0.15), idx * 100);
      });
    },
    playSkillLevelUp() {
      this.init();
      this.playTone(659.25, 'sine', 0.2, 0.15);
      setTimeout(() => this.playTone(987.77, 'sine', 0.3, 0.18), 70);
    }
  };

  // ==========================================
  // 2. ASSET LOADER
  // ==========================================
  const assets = {
    maleHero: new Image(),
    femaleHero: new Image(),
    equipment: new Image(),
    monsters: new Image(),
    props: new Image(),
    loaded: 0
  };

  function onAssetLoad() {
    assets.loaded++;
  }

  const cacheBust = '?v=' + Date.now();
  assets.maleHero.onload = onAssetLoad;
  assets.maleHero.src = '/assets/character_spritesheet.png' + cacheBust;

  assets.femaleHero.onload = onAssetLoad;
  assets.femaleHero.src = '/assets/female_character_spritesheet.png' + cacheBust;

  assets.equipment.onload = onAssetLoad;
  assets.equipment.src = '/assets/equipment_pack.png' + cacheBust;

  assets.monsters.onload = onAssetLoad;
  assets.monsters.src = '/assets/monsters_pack.png' + cacheBust;

  assets.props.onload = onAssetLoad;
  assets.props.src = '/assets/props_pack.png' + cacheBust;

  // ==========================================
  // 3. EQUIPMENT & ITEM DATABASE
  // ==========================================
  const RARITY_COLORS = {
    Normal: '#c8c8c8',
    Magic: '#8888ff',
    Rare: '#ffff77',
    Unique: '#af6025',
    Currency: '#aa9e82'
  };

  const ITEM_SPRITES = {
    sword_fire: { sx: 820, sy: 5, sw: 95, sh: 95 },
    sword_crystal: { sx: 715, sy: 5, sw: 95, sh: 95 },
    axe_dragon: { sx: 310, sy: 120, sw: 95, sh: 95 },
    dagger_kris: { sx: 410, sy: 270, sw: 95, sh: 95 },
    staff_arcane: { sx: 920, sy: 270, sw: 95, sh: 95 },
    helm_crown: { sx: 515, sy: 400, sw: 95, sh: 95 },
    helm_knight: { sx: 215, sy: 400, sw: 95, sh: 95 },
    shield_dragon: { sx: 925, sy: 515, sw: 95, sh: 95 },
    shield_lion: { sx: 620, sy: 515, sw: 95, sh: 95 },
    armor_plate: { sx: 205, sy: 655, sw: 95, sh: 95 },
    armor_robe: { sx: 820, sy: 655, sw: 95, sh: 95 },
    boots_plate: { sx: 110, sy: 800, sw: 95, sh: 95 },
    ring_sapphire: { sx: 720, sy: 800, sw: 95, sh: 95 },
    ring_ruby: { sx: 925, sy: 800, sw: 95, sh: 95 },
    amulet_heart: { sx: 415, sy: 915, sw: 95, sh: 95 },
    amulet_diamond: { sx: 515, sy: 915, sw: 95, sh: 95 }
  };

  const POSSIBLE_LOOT = [
    {
      id: 'bloodseeker_blade',
      name: 'Bloodseeker Hellblade',
      baseType: 'Exquisite Hellblade',
      category: 'weapon',
      slot: 'MainHand',
      rarity: 'Unique',
      icon: '🗡️',
      sprite: ITEM_SPRITES.sword_fire,
      primaryStats: { 'Physical Damage': '82 - 145', 'Attack Speed': '1.45/s', 'Critical Chance': '8.5%' },
      mods: ['+50 Fire Damage to Attacks', 'Instant 4% Life Leech on Critical Hit', 'Hits have 100% Chance to Ignite'],
      lore: 'Forged in the underworld pyres, it thirsts for demonic essence.'
    },
    {
      id: 'crown_of_void',
      name: 'Crown of the Void',
      baseType: 'Hubris Circlet',
      category: 'armor',
      slot: 'Helm',
      rarity: 'Unique',
      icon: '👑',
      sprite: ITEM_SPRITES.helm_crown,
      primaryStats: { 'Energy Shield': '+120', 'Armor': '+45' },
      mods: ['+30% to Chaos Resistance', 'Chaos Damage cannot bypass Energy Shield', '+25 to Maximum Mana'],
      lore: 'The gaze of the void shields the worthy and devours the weak.'
    },
    {
      id: 'dragonbone_axe',
      name: 'Dragonbone Greataxe',
      baseType: 'Two Hand War Axe',
      category: 'weapon',
      slot: 'MainHand',
      rarity: 'Rare',
      icon: '🪓',
      sprite: ITEM_SPRITES.axe_dragon,
      primaryStats: { 'Physical Damage': '95 - 180', 'Critical Chance': '7.0%' },
      mods: ['+45 Physical Damage', '+35% Increased Attack Speed', '+25% Critical Strike Multiplier'],
      lore: 'Carved from the spine of an ancient wyrm.'
    },
    {
      id: 'aegis_lion',
      name: 'Lionheart Crest Shield',
      baseType: 'Imperial Kite Shield',
      category: 'armor',
      slot: 'OffHand',
      rarity: 'Rare',
      icon: '🛡️',
      sprite: ITEM_SPRITES.shield_lion,
      primaryStats: { 'Armor': '+320', 'Block Chance': '28%' },
      mods: ['+25% to Fire Resistance', '+25% to Cold Resistance', '+80 Maximum Life'],
      lore: 'Emblazoned with the proud sigil of Sanctuary.'
    },
    {
      id: 'juggernaut_plate',
      name: 'Refined Juggernaut Plate',
      baseType: 'Full Plate Mail',
      category: 'armor',
      slot: 'BodyArmor',
      rarity: 'Rare',
      icon: '🛡️',
      sprite: ITEM_SPRITES.armor_plate,
      primaryStats: { 'Armor': '+450', 'Movement Penalty': '-3%' },
      mods: ['+120 Maximum Life', '+15% to All Elemental Resistances', '5% Additional Physical Damage Reduction'],
      lore: 'Heavy steel tempered in dragon flame.'
    },
    {
      id: 'voidwalker_sabatons',
      name: 'Voidwalker Sabatons',
      baseType: 'Armored Greaves',
      category: 'armor',
      slot: 'Boots',
      rarity: 'Rare',
      icon: '👢',
      sprite: ITEM_SPRITES.boots_plate,
      primaryStats: { 'Armor': '+120', 'Evasion': '+85' },
      mods: ['+30% Increased Movement Speed', '+65 Maximum Life', '+35% to Fire Resistance'],
      lore: 'Steps as light as shadow, as steadfast as iron.'
    },
    {
      id: 'solar_amulet',
      name: 'Solar Medallion',
      baseType: 'Gold Amulet',
      category: 'armor',
      slot: 'Amulet',
      rarity: 'Rare',
      icon: '📿',
      sprite: ITEM_SPRITES.amulet_diamond,
      primaryStats: { 'All Attributes': '+15' },
      mods: ['+22% Global Critical Strike Multiplier', '+30 Maximum Mana', '+20% Fire Damage'],
      lore: 'Radiates a gentle, soothing warmth.'
    },
    {
      id: 'sapphire_ring',
      name: 'Glacial Signet Ring',
      baseType: 'Sapphire Ring',
      category: 'armor',
      slot: 'Ring',
      rarity: 'Magic',
      icon: '💍',
      sprite: ITEM_SPRITES.ring_sapphire,
      primaryStats: { 'Cold Resistance': '+30%' },
      mods: ['+45 Maximum Energy Shield', '+15% Cast Speed'],
      lore: 'Cold to the touch.'
    },
    {
      id: 'fracture_core',
      name: 'Fracture Core',
      baseType: 'Currency',
      category: 'currency',
      rarity: 'Currency',
      icon: '🔮',
      primaryStats: { 'Stack Size': '1 / 20' },
      mods: ['Reforges a rare item with new random modifiers'],
      lore: 'The fundamental currency of the fractured realms of Aethelis.'
    },
    {
      id: 'ascendant_catalyst',
      name: 'Ascendant Catalyst',
      baseType: 'Currency',
      category: 'currency',
      rarity: 'Currency',
      icon: '🌟',
      primaryStats: { 'Stack Size': '1 / 10' },
      mods: ['Augments a rare item with a new high-tier modifier'],
      lore: 'Condensed primal energy capable of elevating mortal relics.'
    },
    {
      id: 'genesis_prism',
      name: 'Genesis Prism',
      baseType: 'Currency',
      category: 'currency',
      rarity: 'Currency',
      icon: '💎',
      primaryStats: { 'Stack Size': '1 / 20' },
      mods: ['Upgrades a normal item to a rare item with 4-6 modifiers'],
      lore: 'Prismatic light refracted from the Genesis Core.'
    },
    {
      id: 'aether_spark',
      name: 'Aether Spark',
      baseType: 'Currency',
      category: 'currency',
      rarity: 'Currency',
      icon: '✨',
      primaryStats: { 'Stack Size': '1 / 40' },
      mods: ['Upgrades a normal item to a magic item'],
      lore: 'A subtle spark of ancient cosmic ether.'
    },
    {
      id: 'harmonic_tether',
      name: 'Harmonic Tether',
      baseType: 'Currency',
      category: 'currency',
      rarity: 'Currency',
      icon: '🔗',
      primaryStats: { 'Stack Size': '1 / 20' },
      mods: ['Reforges the links between sockets on an item'],
      lore: 'Resonates with celestial frequency to harmonize socket links.'
    }
  ];

  function drawItemSpriteToCanvas(targetCanvas, spriteInfo) {
    if (!targetCanvas) return;
    const tCtx = targetCanvas.getContext('2d');
    tCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    tCtx.imageSmoothingEnabled = false;

    if (assets.equipment.complete && assets.equipment.naturalWidth > 0 && spriteInfo) {
      tCtx.drawImage(
        assets.equipment,
        spriteInfo.sx, spriteInfo.sy, spriteInfo.sw, spriteInfo.sh,
        0, 0, targetCanvas.width, targetCanvas.height
      );
    }
  }

  // ==========================================
  // 4. SKILL DATABASE WITH ATTRIBUTE TAGS
  // ==========================================
  const SKILLS = {
    slash: {
      id: 'slash',
      name: 'Heavy Slash',
      icon: '⚔️',
      key: 'LMB',
      tags: ['physical', 'melee', 'attack'],
      level: 1,
      maxLevel: 20,
      exp: 0,
      expToNext: 120,
      baseDmg: 50,
      dmgPerLvl: 10,
      baseCooldown: 0.35,
      cdReductionPerLvl: 0.008,
      baseReach: 75,
      reachPerLvl: 3,
      desc: 'Cleaves enemies in front with physical force.'
    },
    fireball: {
      id: 'fireball',
      name: 'Pyro Fireball',
      icon: '🔥',
      key: 'Q',
      tags: ['fire', 'spell', 'aoe'],
      level: 1,
      maxLevel: 20,
      exp: 0,
      expToNext: 150,
      baseDmg: 85,
      dmgPerLvl: 15,
      baseCooldown: 1.0,
      cdReductionPerLvl: 0.02,
      baseRadius: 12,
      radiusPerLvl: 0.6,
      manaCost: 10,
      desc: 'Hurls an explosive projectile of concentrated fire.'
    },
    frost: {
      id: 'frost',
      name: 'Frost Nova',
      icon: '❄️',
      key: 'W',
      tags: ['cold', 'spell', 'aoe'],
      level: 1,
      maxLevel: 20,
      exp: 0,
      expToNext: 180,
      baseDmg: 90,
      dmgPerLvl: 16,
      baseCooldown: 2.5,
      cdReductionPerLvl: 0.05,
      baseRadius: 150,
      radiusPerLvl: 6,
      manaCost: 15,
      desc: 'Blasts freezing frost in a 360-degree ring.'
    },
    meteor: {
      id: 'meteor',
      name: 'Cataclysm Meteor',
      icon: '☄️',
      key: 'E',
      tags: ['fire', 'chaos', 'spell', 'aoe'],
      level: 1,
      maxLevel: 20,
      exp: 0,
      expToNext: 250,
      baseDmg: 180,
      dmgPerLvl: 30,
      baseCooldown: 4.5,
      cdReductionPerLvl: 0.08,
      baseRadius: 135,
      radiusPerLvl: 6,
      manaCost: 30,
      desc: 'Calls down a devastating celestial meteor.'
    },
    dash: {
      id: 'dash',
      name: 'Shadow Dash',
      icon: '💨',
      key: 'Space',
      tags: ['movement', 'chaos'],
      level: 1,
      maxLevel: 20,
      exp: 0,
      expToNext: 100,
      baseDistance: 190,
      distancePerLvl: 7,
      baseCooldown: 1.2,
      cdReductionPerLvl: 0.035,
      desc: 'Dashes with temporary invulnerability.'
    }
  };

  // Calculate dynamic skill EXP multiplier based on Tags + Class Affinity + Equipped Gear
  function getSkillExpMultiplier(skillKey) {
    const s = SKILLS[skillKey];
    if (!s) return 1.0;

    let multiplier = 1.0;
    const tags = s.tags || [];

    // Class Affinity Bonuses
    if (player.classSpec === 'Vanguard') {
      if (tags.includes('physical') || tags.includes('melee') || tags.includes('attack')) multiplier += 0.5;
    } else if (player.classSpec === 'Arcanist') {
      if (tags.includes('fire') || tags.includes('cold') || tags.includes('spell') || tags.includes('aoe')) multiplier += 0.6;
    } else if (player.classSpec === 'ShadowRogue') {
      if (tags.includes('chaos') || tags.includes('movement') || tags.includes('attack')) multiplier += 0.5;
    }

    // Gear Affinity Bonuses
    for (let slotKey in player.equipped) {
      const gear = player.equipped[slotKey];
      if (gear && gear.mods) {
        if (tags.includes('fire') && gear.mods.some(m => m.includes('Fire Damage'))) multiplier += 0.25;
        if (tags.includes('chaos') && gear.mods.some(m => m.includes('Chaos'))) multiplier += 0.25;
        if (tags.includes('cold') && gear.mods.some(m => m.includes('Cold'))) multiplier += 0.2;
      }
    }

    return Math.max(0.5, multiplier);
  }

  function addSkillExp(skillKey, amount) {
    const s = SKILLS[skillKey];
    if (!s || s.level >= s.maxLevel) return;

    const rate = getSkillExpMultiplier(skillKey);
    const gained = Math.round(amount * rate);

    s.exp += gained;
    while (s.exp >= s.expToNext && s.level < s.maxLevel) {
      s.exp -= s.expToNext;
      s.level++;
      s.expToNext = Math.round(s.expToNext * 1.35);
      AudioEngine.playSkillLevelUp();
      spawnDamageNumber(player.x, player.y - 50, `${s.name} Lv.${s.level}!`, true, '#61afef');
      updateSkillBadges();
      renderSkillUpgradeModal();
    }
  }

  function levelUpSkillWithPoint(skillKey) {
    if (player.skillPoints <= 0) return;
    const s = SKILLS[skillKey];
    if (!s || s.level >= s.maxLevel) return;
    player.skillPoints--;
    s.level++;
    s.exp = 0;
    s.expToNext = Math.round(s.expToNext * 1.35);
    AudioEngine.playSkillLevelUp();
    spawnDamageNumber(player.x, player.y - 50, `${s.name} Lv.${s.level}!`, true, '#ffd700');
    updateSkillBadges();
    renderSkillUpgradeModal();
  }

  function updateSkillBadges() {
    for (let k in SKILLS) {
      const badge = document.getElementById(`lvl-badge-${k}`);
      if (badge) badge.innerText = `Lv.${SKILLS[k].level}`;
    }
    const spEl = document.getElementById('sp-points-text');
    if (spEl) spEl.innerText = `${player.skillPoints} SP`;
  }

  function renderSkillUpgradeModal() {
    const container = document.getElementById('skills-upgrade-container');
    if (!container) return;
    container.innerHTML = '';

    for (let k in SKILLS) {
      const s = SKILLS[k];
      const card = document.createElement('div');
      card.className = 'skill-upgrade-card';

      const curDmg = s.baseDmg ? Math.round(s.baseDmg + (s.level - 1) * s.dmgPerLvl) : 0;
      const nextDmg = s.baseDmg ? Math.round(s.baseDmg + s.level * s.dmgPerLvl) : 0;
      const curCd = Math.max(0.2, (s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl)).toFixed(2);
      const expPct = Math.min(100, (s.exp / s.expToNext) * 100);
      const expRate = getSkillExpMultiplier(k);

      let statLine = k === 'dash'
        ? `Distance: <b>${Math.round(s.baseDistance + (s.level - 1) * s.distancePerLvl)}px</b> | CD: <b>${curCd}s</b>`
        : `Damage: <b>${curDmg}</b> (Next: <b style="color:#ffd700;">${nextDmg}</b>) | CD: <b>${curCd}s</b>`;

      const tagsHtml = (s.tags || []).map(t => `<span class="tag-badge tag-${t}">${t}</span>`).join('');

      card.innerHTML = `
        <div class="suc-icon">${s.icon}</div>
        <div class="suc-info">
          <div class="suc-name-row">
            <span class="suc-name">${s.name} [${s.key}]</span>
            <span class="suc-level">Level ${s.level} / ${s.maxLevel}</span>
          </div>
          <div class="skill-tags-row">
            ${tagsHtml}
            <span class="exp-rate-tag" title="EXP Rate calculated from Class Affinity and Gear">⚡ ${expRate.toFixed(1)}x EXP Speed</span>
          </div>
          <div class="suc-desc">${s.desc}</div>
          <div class="suc-exp-bar-wrap" title="Skill EXP: ${s.exp} / ${s.expToNext}">
            <div class="suc-exp-fill" style="width: ${expPct}%;"></div>
          </div>
          <div class="suc-stats">${statLine}</div>
        </div>
        <button class="suc-btn" ${player.skillPoints <= 0 || s.level >= s.maxLevel ? 'disabled' : ''} data-skill="${k}">
          ${s.level >= s.maxLevel ? 'MAX' : '➕ Upgrade (+1 SP)'}
        </button>
      `;

      card.querySelector('.suc-btn').addEventListener('click', () => levelUpSkillWithPoint(k));
      container.appendChild(card);
    }
  }

  // ==========================================
  // 5. ZONE DEFINITIONS
  // ==========================================
  const ZONES = {
    SanctuaryHaven: {
      id: 'SanctuaryHaven',
      name: 'Sanctuary Haven',
      subtitle: '🌿 Starting Town - Safe Haven (4000x4000)',
      levelRange: 'Lv. 1-5',
      portals: [{ x: 3200, y: 2000, targetZone: 'WhisperingPlains', targetX: 600, targetY: 2000, name: '🌀 To Whispering Plains' }],
      npcs: [
        { x: 1900, y: 1900, name: 'Doran (Blacksmith)', title: 'Blacksmith', color: '#e5c07b' },
        { x: 2100, y: 1900, name: 'Elder Aethel (Sage)', title: 'Quest Master', color: '#61afef' }
      ],
      props: [
        { x: 2000, y: 2000, type: 'campfire' },
        { x: 1850, y: 1880, type: 'chest' },
        { x: 1880, y: 1940, type: 'barrel' },
        { x: 2120, y: 1940, type: 'barrel' }
      ],
      dummies: [
        { x: 1900, y: 2150, name: 'Training Dummy (Alpha)' },
        { x: 2100, y: 2150, name: 'Training Dummy (Beta)' }
      ]
    },
    WhisperingPlains: {
      id: 'WhisperingPlains',
      name: 'Whispering Plains',
      subtitle: '🌾 Whispering Plains - Wild Hunting Grounds (4000x4000)',
      levelRange: 'Lv. 5-15',
      portals: [
        { x: 500, y: 2000, targetZone: 'SanctuaryHaven', targetX: 3000, targetY: 2000, name: '🌀 Return to Haven' },
        { x: 3500, y: 2000, targetZone: 'ForgottenCrypt', targetX: 600, targetY: 2000, name: '🌀 Enter Forgotten Crypt' }
      ],
      props: [],
      dummies: []
    },
    ForgottenCrypt: {
      id: 'ForgottenCrypt',
      name: 'Forgotten Crypt',
      subtitle: '🏰 Forgotten Crypt - Shadow Fiend Lair (4000x4000)',
      levelRange: 'Lv. 15-25',
      portals: [{ x: 500, y: 2000, targetZone: 'WhisperingPlains', targetX: 3300, targetY: 2000, name: '🌀 Escape Dungeon' }],
      props: [],
      dummies: []
    }
  };

  let currentZoneId = 'SanctuaryHaven';
  let currentZone = ZONES[currentZoneId];

  // ==========================================
  // 6. PLAYER STATE
  // ==========================================
  const player = {
    x: 2000,
    y: 2000,
    vx: 0,
    vy: 0,
    speed: 280,
    facing: 'down',
    isMoving: false,
    animFrame: 0,
    animTimer: 0,

    gender: 'Male',
    classSpec: 'Novice',
    level: 1,
    currentExp: 0,
    expToNext: 100,
    skillPoints: 3,

    life: 250,
    maxLife: 250,
    mana: 120,
    maxMana: 120,
    es: 100,
    maxEs: 100,

    armor: 250,
    evasion: 250,
    fireRes: 75,
    coldRes: 75,
    lightRes: 75,
    chaosRes: 40,
    critChance: 25,
    critMulti: 200,

    cooldowns: { slash: 0, fireball: 0, frost: 0, meteor: 0, dash: 0 },

    equipped: {
      Helm: POSSIBLE_LOOT[1],
      Amulet: POSSIBLE_LOOT[6],
      MainHand: POSSIBLE_LOOT[0],
      BodyArmor: POSSIBLE_LOOT[4],
      OffHand: POSSIBLE_LOOT[3],
      Ring: POSSIBLE_LOOT[7],
      Boots: POSSIBLE_LOOT[5]
    },
    bag: [
      POSSIBLE_LOOT[2],
      POSSIBLE_LOOT[8],
      POSSIBLE_LOOT[9],
      POSSIBLE_LOOT[8]
    ],
    bagFilter: 'all'
  };

  const monsters = [];
  const trainingDummies = [];
  const npcs = [];
  const portals = [];
  const props = [];
  const projectiles = [];
  const particles = [];
  const floatingTexts = [];
  const groundLoot = [];

  const keys = {};
  const mouse = { x: 0, y: 0, worldX: 2000, worldY: 2000, isDown: false };

  // ==========================================
  // 7. INVENTORY & PAPERDOLL CONTROLLER
  // ==========================================
  function updateBackpackUI() {
    const grid = document.getElementById('backpack-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filteredItems = player.bag.filter(item => {
      if (player.bagFilter === 'all') return true;
      if (player.bagFilter === 'weapon') return item.category === 'weapon';
      if (player.bagFilter === 'armor') return item.category === 'armor';
      if (player.bagFilter === 'currency') return item.category === 'currency';
      return true;
    });

    for (let i = 0; i < 16; i++) {
      const slot = document.createElement('div');
      const item = filteredItems[i];

      if (item) {
        slot.className = `bag-slot-card rarity-${item.rarity}`;

        if (item.sprite && assets.equipment.complete) {
          const cvs = document.createElement('canvas');
          cvs.width = 44;
          cvs.height = 44;
          cvs.className = 'bag-slot-canvas';
          drawItemSpriteToCanvas(cvs, item.sprite);
          slot.appendChild(cvs);
        } else {
          const span = document.createElement('span');
          span.className = 'bag-slot-emoji';
          span.innerText = item.icon || '📦';
          slot.appendChild(span);
        }

        slot.addEventListener('mouseenter', e => showItemTooltip(e, item));
        slot.addEventListener('mouseleave', hideItemTooltip);

        slot.addEventListener('click', () => {
          if (item.slot) {
            const prev = player.equipped[item.slot];
            const realIndex = player.bag.indexOf(item);
            if (realIndex !== -1) {
              if (prev) player.bag[realIndex] = prev;
              else player.bag.splice(realIndex, 1);
              player.equipped[item.slot] = item;
              AudioEngine.playPickup();
              updateBackpackUI();
              updatePaperdollUI();
              renderSkillUpgradeModal();
              hideItemTooltip();
            }
          } else if (item.rarity === 'Currency') {
            spawnDamageNumber(player.x, player.y - 40, `Used ${item.name}!`, true, '#e5c07b');
            const realIndex = player.bag.indexOf(item);
            if (realIndex !== -1) player.bag.splice(realIndex, 1);
            AudioEngine.playPickup();
            updateBackpackUI();
            hideItemTooltip();
          }
        });
      } else {
        slot.className = 'bag-slot-card empty-slot';
      }

      grid.appendChild(slot);
    }

    document.getElementById('bag-count-tag').innerText = `${player.bag.length} / 16`;
  }

  function updatePaperdollUI() {
    const slots = ['Helm', 'Amulet', 'MainHand', 'BodyArmor', 'OffHand', 'Ring', 'Boots'];
    let totalAddedArmor = 0;
    let totalAddedES = 0;

    slots.forEach(slotKey => {
      const item = player.equipped[slotKey];
      const slotEl = document.querySelector(`.doll-slot-frame[data-slot="${slotKey}"]`);
      if (!slotEl) return;

      slotEl.className = `doll-slot-frame slot-${slotKey.toLowerCase()} ${item ? 'rarity-' + item.rarity : ''}`;
      const iconEl = slotEl.querySelector('.doll-slot-icon');

      if (item) {
        if (item.sprite && assets.equipment.complete) {
          iconEl.innerHTML = '';
          const cvs = document.createElement('canvas');
          cvs.width = 38;
          cvs.height = 38;
          cvs.className = 'doll-slot-canvas';
          drawItemSpriteToCanvas(cvs, item.sprite);
          iconEl.appendChild(cvs);
        } else {
          iconEl.innerText = item.icon || '🛡️';
        }

        slotEl.onmouseenter = e => showItemTooltip(e, item);
        slotEl.onmouseleave = hideItemTooltip;
        slotEl.onclick = () => {
          if (player.bag.length < 16) {
            player.bag.push(item);
            delete player.equipped[slotKey];
            AudioEngine.playPickup();
            updatePaperdollUI();
            updateBackpackUI();
            renderSkillUpgradeModal();
            hideItemTooltip();
          } else {
            spawnDamageNumber(player.x, player.y - 40, 'BACKPACK FULL!', true, '#e06c75');
          }
        };

        if (item.primaryStats) {
          if (item.primaryStats['Armor']) totalAddedArmor += parseInt(item.primaryStats['Armor']) || 0;
          if (item.primaryStats['Energy Shield']) totalAddedES += parseInt(item.primaryStats['Energy Shield']) || 0;
        }
      } else {
        iconEl.innerHTML = '';
        iconEl.innerText = getSlotDefaultIcon(slotKey);
        slotEl.onmouseenter = null;
        slotEl.onmouseleave = null;
        slotEl.onclick = null;
      }
    });

    document.getElementById('gss-armor').innerText = `+${totalAddedArmor || 770}`;
    document.getElementById('gss-es').innerText = `+${totalAddedES || 120}`;
  }

  function getSlotDefaultIcon(slotKey) {
    switch (slotKey) {
      case 'Helm': return '👑';
      case 'Amulet': return '📿';
      case 'MainHand': return '⚔️';
      case 'BodyArmor': return '🛡️';
      case 'OffHand': return '🛡️';
      case 'Ring': return '💍';
      case 'Boots': return '👢';
      default: return '📦';
    }
  }

  const tooltipEl = document.getElementById('item-tooltip');
  function showItemTooltip(e, item) {
    if (!tooltipEl || !item) return;

    document.getElementById('tt-name').innerText = item.name;
    document.getElementById('tt-name').style.color = RARITY_COLORS[item.rarity] || '#ffffff';
    document.getElementById('tt-type').innerText = `${item.rarity} ${item.baseType || ''}`;
    document.getElementById('tt-type').style.color = RARITY_COLORS[item.rarity] || '#abb2bf';

    const iconWrap = document.getElementById('tt-icon-wrap');
    iconWrap.innerHTML = '';
    if (item.sprite && assets.equipment.complete) {
      const cvs = document.createElement('canvas');
      cvs.width = 34;
      cvs.height = 34;
      cvs.className = 'poe-tt-icon-canvas';
      drawItemSpriteToCanvas(cvs, item.sprite);
      iconWrap.appendChild(cvs);
    } else {
      iconWrap.innerHTML = `<span>${item.icon || '📦'}</span>`;
    }

    const statsEl = document.getElementById('tt-stats');
    statsEl.innerHTML = '';
    if (item.primaryStats) {
      for (let k in item.primaryStats) {
        statsEl.innerHTML += `<div>${k}: <b>${item.primaryStats[k]}</b></div>`;
      }
    }

    const modsEl = document.getElementById('tt-mods');
    modsEl.innerHTML = (item.mods || []).map(m => `<div>✦ ${m}</div>`).join('');

    const loreEl = document.getElementById('tt-lore');
    loreEl.innerText = item.lore ? `"${item.lore}"` : '';

    tooltipEl.classList.remove('hidden');
    tooltipEl.style.left = `${Math.min(window.innerWidth - 320, e.clientX + 16)}px`;
    tooltipEl.style.top = `${Math.min(window.innerHeight - 240, e.clientY - 40)}px`;
  }

  function hideItemTooltip() {
    if (tooltipEl) tooltipEl.classList.add('hidden');
  }

  // ==========================================
  // 8. LOOT DROP & PICKUP
  // ==========================================
  function dropMonsterLoot(x, y, isBoss) {
    const dropCount = isBoss ? Math.floor(Math.random() * 3) + 4 : (Math.random() < 0.65 ? 1 : 0);

    for (let i = 0; i < dropCount; i++) {
      let itemTemplate;
      if (isBoss && i === 0) {
        itemTemplate = POSSIBLE_LOOT.find(it => it.rarity === 'Unique') || POSSIBLE_LOOT[0];
      } else {
        itemTemplate = POSSIBLE_LOOT[Math.floor(Math.random() * POSSIBLE_LOOT.length)];
      }

      const dropAngle = Math.random() * Math.PI * 2;
      const dropDistance = 40 + Math.random() * 80;

      groundLoot.push({
        id: Math.random().toString(36).substring(2, 9),
        x: x,
        y: y,
        targetX: x + Math.cos(dropAngle) * dropDistance,
        targetY: y + Math.sin(dropAngle) * dropDistance,
        item: { ...itemTemplate },
        bounceTimer: 0.5,
        beamHeight: itemTemplate.rarity === 'Unique' ? 350 : (itemTemplate.rarity === 'Rare' || itemTemplate.rarity === 'Currency' ? 240 : 0)
      });

      AudioEngine.playLootDrop(itemTemplate.rarity);
    }
  }

  function pickUpLoot(lootIndex) {
    if (lootIndex < 0 || lootIndex >= groundLoot.length) return;
    const loot = groundLoot[lootIndex];

    if (player.bag.length >= 16) {
      spawnDamageNumber(player.x, player.y - 40, 'BACKPACK FULL!', true, '#e06c75');
      return;
    }

    player.bag.push(loot.item);
    groundLoot.splice(lootIndex, 1);

    AudioEngine.playPickup();
    spawnDamageNumber(player.x, player.y - 45, `+ ${loot.item.name}`, false, RARITY_COLORS[loot.item.rarity]);

    updateBackpackUI();
  }

  // ==========================================
  // 9. PROGRESSION & ASCENSION
  // ==========================================
  function gainExp(amount) {
    player.currentExp += amount;
    for (let k in SKILLS) addSkillExp(k, Math.round(amount * 0.8));

    while (player.currentExp >= player.expToNext) {
      player.currentExp -= player.expToNext;
      player.level++;
      player.skillPoints++;
      player.expToNext = Math.round(player.expToNext * 1.4);

      player.maxLife += 20;
      player.life = player.maxLife;
      player.maxMana += 10;
      player.mana = player.maxMana;

      AudioEngine.playLevelUp();
      spawnDamageNumber(player.x, player.y - 60, `LEVEL UP (Lv.${player.level})! +1 SP`, true, '#ffd700');

      document.getElementById('hud-level').innerText = `Lv.${player.level}`;
      updateSkillBadges();
      renderSkillUpgradeModal();

      if (player.level >= 10 && player.classSpec === 'Novice') {
        document.getElementById('btn-ascend-trigger').classList.remove('hidden');
      }
    }
  }

  function setGender(newGender) {
    player.gender = newGender;
    const avatar = document.getElementById('hud-avatar');
    const tag = document.getElementById('hud-gender-tag');

    if (newGender === 'Female') {
      avatar.classList.add('avatar-female');
      tag.innerText = '♀ Female';
      tag.style.color = '#ff79c6';
    } else {
      avatar.classList.remove('avatar-female');
      tag.innerText = '♂ Male';
      tag.style.color = '#61afef';
    }
    spawnDamageNumber(player.x, player.y - 40, `Hero: ${newGender}`, false, '#98c379');
  }

  function selectClassSpecialization(spec) {
    player.classSpec = spec;
    document.getElementById('ascension-modal').classList.add('hidden');
    document.getElementById('btn-ascend-trigger').classList.add('hidden');

    if (spec === 'Vanguard') {
      player.armor += 300;
      player.maxLife += 150;
      player.life = player.maxLife;
      document.getElementById('hud-name').innerText = `${player.gender === 'Male' ? 'Vanguard Knight' : 'Vanguard Valkyrie'}`;
      document.getElementById('icon-slot-1').innerText = '🪓';
      document.getElementById('icon-slot-4').innerText = '🛡️';
    } else if (spec === 'Arcanist') {
      player.maxEs += 200;
      player.es = player.maxEs;
      document.getElementById('hud-name').innerText = `${player.gender === 'Male' ? 'Grand Arcanist' : 'High Sorceress'}`;
      document.getElementById('icon-slot-1').innerText = '✨';
      document.getElementById('icon-slot-4').innerText = '☄️';
    } else if (spec === 'ShadowRogue') {
      player.evasion += 350;
      player.critChance += 25;
      document.getElementById('hud-name').innerText = `${player.gender === 'Male' ? 'Shadow Assassin' : 'Nightshade Rogue'}`;
      document.getElementById('icon-slot-1').innerText = '🗡️';
      document.getElementById('icon-slot-4').innerText = '💨';
    }

    AudioEngine.playLevelUp();
    spawnDamageNumber(player.x, player.y - 60, `ASCENDED: ${spec.toUpperCase()}!`, true, '#ffd700');
    renderSkillUpgradeModal();
  }

  // ==========================================
  // 10. ZONE LOADING
  // ==========================================
  function loadZone(zoneId, spawnX, spawnY) {
    if (!ZONES[zoneId]) return;
    currentZoneId = zoneId;
    currentZone = ZONES[zoneId];

    monsters.length = 0;
    trainingDummies.length = 0;
    npcs.length = 0;
    portals.length = 0;
    props.length = 0;
    projectiles.length = 0;
    particles.length = 0;
    floatingTexts.length = 0;
    groundLoot.length = 0;

    player.x = spawnX !== undefined ? spawnX : 2000;
    player.y = spawnY !== undefined ? spawnY : 2000;

    currentZone.portals.forEach(p => portals.push({ ...p }));
    if (currentZone.npcs) currentZone.npcs.forEach(n => npcs.push({ ...n }));
    if (currentZone.dummies) {
      currentZone.dummies.forEach(d => {
        trainingDummies.push({ x: d.x, y: d.y, name: d.name, life: 99999, maxLife: 99999, armor: 200, isAlive: true, hurtTimer: 0 });
      });
    }

    if (currentZone.props && currentZone.props.length > 0) {
      currentZone.props.forEach(pr => props.push({ ...pr }));
    }

    const propCount = currentZone.id === 'ForgottenCrypt' ? 60 : 120;
    for (let i = 0; i < propCount; i++) {
      let type = currentZone.id === 'ForgottenCrypt' ? (Math.random() < 0.7 ? 'rock' : 'chest') : (Math.random() < 0.65 ? 'tree' : (Math.random() < 0.85 ? 'rock' : 'barrel'));
      const px = Math.random() * (WORLD_SIZE - 400) + 200;
      const py = Math.random() * (WORLD_SIZE - 400) + 200;
      if (Math.hypot(px - 2000, py - 2000) > 200) props.push({ x: px, y: py, type: type });
    }

    if (currentZone.id === 'WhisperingPlains') {
      spawnMonsterCluster(1200, 1200, 6);
      spawnMonsterCluster(2800, 1400, 7);
      spawnMonsterCluster(1800, 2800, 8);
    } else if (currentZone.id === 'ForgottenCrypt') {
      spawnMonsterCluster(1200, 1500, 8);
      spawnMonsterCluster(2600, 2800, 10);
      spawnMonster(3200, 2000, 'boss');
    }

    showZoneBanner(currentZone.name, currentZone.subtitle);
    document.getElementById('hud-zone-tag').innerText = `📍 ${currentZone.name}`;
    document.getElementById('minimap-zone-title').innerText = currentZone.name.toUpperCase();

    document.querySelectorAll('.zone-node').forEach(node => {
      node.classList.toggle('active-node', node.getAttribute('data-zone') === currentZoneId);
    });

    updateBackpackUI();
    updatePaperdollUI();
    updateSkillBadges();
    renderSkillUpgradeModal();
  }

  function showZoneBanner(title, sub) {
    const banner = document.getElementById('zone-banner');
    document.getElementById('zone-banner-title').innerText = title.toUpperCase();
    document.getElementById('zone-banner-sub').innerText = sub;
    banner.classList.remove('zone-banner-hide');
    clearTimeout(banner._timeout);
    banner._timeout = setTimeout(() => banner.classList.add('zone-banner-hide'), 3500);
  }

  function spawnMonster(x, y, type = 'slime') {
    const isBoss = type === 'boss';
    monsters.push({
      id: Math.random().toString(36).substring(2, 9),
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      type: type,
      name: isBoss ? '🔥 Dark Shadow Fiend (Lord of Crypt)' : (type === 'slime' ? 'Toxic Slime' : (type === 'skeleton' ? 'Skeleton Warrior' : 'Goblin Scout')),
      maxLife: isBoss ? 2400 : (type === 'slime' ? 90 : (type === 'skeleton' ? 180 : 130)),
      life: isBoss ? 2400 : (type === 'slime' ? 90 : (type === 'skeleton' ? 180 : 130)),
      armor: isBoss ? 600 : (type === 'skeleton' ? 350 : 100),
      fireRes: type === 'slime' ? 0 : (isBoss ? 50 : 30),
      coldRes: type === 'slime' ? 70 : (isBoss ? 40 : 10),
      speed: isBoss ? 140 : (100 + Math.random() * 40),
      expValue: isBoss ? 500 : (type === 'slime' ? 30 : 45),
      state: 'idle',
      animTimer: Math.random() * 10,
      isAlive: true,
      hurtTimer: 0,
      scale: isBoss ? 1.8 : 1.2
    });
  }

  function spawnMonsterCluster(cx, cy, count) {
    const types = currentZone.id === 'ForgottenCrypt' ? ['skeleton', 'goblin'] : ['slime', 'goblin'];
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      spawnMonster(cx + (Math.random() - 0.5) * 320, cy + (Math.random() - 0.5) * 320, type);
    }
  }

  // ==========================================
  // 11. COMBAT & SKILLS
  // ==========================================
  function dealDamage(target, rawPhysical, rawFire, rawCold, rawLightning, rawChaos, canCrit = true) {
    if (!target.isAlive) return;

    let isCrit = false;
    let multiplier = 1.0;
    if (canCrit && Math.random() * 100 <= player.critChance) {
      isCrit = true;
      multiplier = player.critMulti / 100;
    }

    const physDmg = rawPhysical * multiplier;
    let physMitigation = 0;
    if (target.armor > 0 && physDmg > 0) {
      physMitigation = Math.min(0.9, target.armor / (target.armor + 5 * physDmg));
    }
    const finalPhys = physDmg * (1 - physMitigation);
    const finalFire = (rawFire * multiplier) * (1 - (target.fireRes || 0) / 100);
    const finalCold = (rawCold * multiplier) * (1 - (target.coldRes || 0) / 100);
    const totalDamage = Math.max(1, Math.round(finalPhys + finalFire + finalCold));

    if (target.life < 90000) target.life -= totalDamage;
    target.hurtTimer = 0.25;

    AudioEngine.playHit(isCrit);
    const color = isCrit ? '#ffd700' : (rawFire > 0 ? '#ff7849' : (rawCold > 0 ? '#4facfe' : '#ffffff'));
    spawnDamageNumber(target.x, target.y - 30 * (target.scale || 1), totalDamage, isCrit, color);

    for (let i = 0; i < (isCrit ? 12 : 6); i++) {
      particles.push({
        x: target.x,
        y: target.y - 10,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        color: rawFire > 0 ? '#ff5722' : '#00f2fe',
        life: 0.35,
        maxLife: 0.35,
        size: 3 + Math.random() * 4
      });
    }

    if (target.life <= 0 && target.life < 90000) {
      target.isAlive = false;
      target.life = 0;
      spawnDamageNumber(target.x, target.y - 50, 'DEFEATED!', true, '#e5c07b');
      gainExp(target.expValue || 35);
      dropMonsterLoot(target.x, target.y, target.type === 'boss');

      if (target.type === 'boss' && player.classSpec === 'Novice') {
        document.getElementById('btn-ascend-trigger').classList.remove('hidden');
      }
    }
  }

  function spawnDamageNumber(x, y, text, isCrit, color) {
    floatingTexts.push({
      x: x + (Math.random() - 0.5) * 24,
      y: y,
      text: text.toString(),
      isCrit: isCrit,
      color: color || '#ffffff',
      life: 0.85,
      maxLife: 0.85,
      vy: isCrit ? -80 : -55
    });
  }

  function castSlash() {
    const s = SKILLS.slash;
    if (player.cooldowns.slash > 0) return;
    player.cooldowns.slash = Math.max(0.18, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

    const angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
    const reach = s.baseReach + (s.level - 1) * s.reachPerLvl + (player.classSpec === 'Vanguard' ? 20 : 0);
    const slashX = player.x + Math.cos(angle) * 40;
    const slashY = player.y + Math.sin(angle) * 40;
    const dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl + (player.classSpec === 'Vanguard' ? 35 : 0);

    monsters.forEach(m => {
      if (m.isAlive && Math.hypot(m.x - slashX, m.y - slashY) < reach) dealDamage(m, dmg, 20, 0, 0, 0);
    });

    trainingDummies.forEach(d => {
      if (Math.hypot(d.x - slashX, d.y - slashY) < reach) dealDamage(d, dmg, 20, 0, 0, 0);
    });

    for (let i = 0; i < 12; i++) {
      const spread = angle + (Math.random() - 0.5) * 1.4;
      particles.push({
        x: player.x + Math.cos(spread) * 30,
        y: player.y + Math.sin(spread) * 30,
        vx: Math.cos(spread) * 160,
        vy: Math.sin(spread) * 160,
        color: player.classSpec === 'ShadowRogue' ? '#c678dd' : '#e5c07b',
        life: 0.22,
        maxLife: 0.22,
        size: 4
      });
    }
  }

  function castFireball() {
    const s = SKILLS.fireball;
    if (player.cooldowns.fireball > 0 || player.mana < s.manaCost) return;
    player.mana -= s.manaCost;
    player.cooldowns.fireball = Math.max(0.4, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

    const angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
    projectiles.push({
      x: player.x,
      y: player.y - 10,
      vx: Math.cos(angle) * 480,
      vy: Math.sin(angle) * 480,
      type: 'fireball',
      damage: s.baseDmg + (s.level - 1) * s.dmgPerLvl + (player.classSpec === 'Arcanist' ? 40 : 0),
      radius: s.baseRadius + (s.level - 1) * s.radiusPerLvl,
      life: 1.6
    });
  }

  function castFrostNova() {
    const s = SKILLS.frost;
    if (player.cooldowns.frost > 0 || player.mana < s.manaCost) return;
    player.mana -= s.manaCost;
    player.cooldowns.frost = Math.max(1.0, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

    const novaRadius = s.baseRadius + (s.level - 1) * s.radiusPerLvl + (player.classSpec === 'Arcanist' ? 40 : 0);
    const dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl;

    monsters.forEach(m => {
      if (m.isAlive && Math.hypot(m.x - player.x, m.y - player.y) <= novaRadius) dealDamage(m, 15, 0, dmg, 0, 0);
    });

    trainingDummies.forEach(d => {
      if (Math.hypot(d.x - player.x, d.y - player.y) <= novaRadius) dealDamage(d, 15, 0, dmg, 0, 0);
    });

    for (let a = 0; a < Math.PI * 2; a += 0.25) {
      particles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(a) * 260,
        vy: Math.sin(a) * 260,
        color: '#00f2fe',
        life: 0.45,
        maxLife: 0.45,
        size: 6
      });
    }
  }

  function castMeteor() {
    const s = SKILLS.meteor;
    if (player.cooldowns.meteor > 0 || player.mana < s.manaCost) return;
    player.mana -= s.manaCost;
    player.cooldowns.meteor = Math.max(2.0, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

    const targetX = mouse.worldX;
    const targetY = mouse.worldY;

    particles.push({
      x: targetX,
      y: targetY,
      vx: 0,
      vy: 0,
      color: 'rgba(255, 65, 108, 0.45)',
      life: 0.45,
      maxLife: 0.45,
      size: 50,
      isRing: true
    });

    setTimeout(() => {
      const radius = s.baseRadius + (s.level - 1) * s.radiusPerLvl + (player.classSpec === 'Arcanist' ? 40 : 0);
      const dmg = s.baseDmg + (s.level - 1) * s.dmgPerLvl;

      monsters.forEach(m => {
        if (m.isAlive && Math.hypot(m.x - targetX, m.y - targetY) <= radius) dealDamage(m, 50, dmg, 0, 0, 30);
      });

      trainingDummies.forEach(d => {
        if (Math.hypot(d.x - targetX, d.y - targetY) <= radius) dealDamage(d, 50, dmg, 0, 0, 30);
      });

      for (let i = 0; i < 45; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * 260;
        particles.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          color: Math.random() > 0.3 ? '#ff3b00' : '#ffd700',
          life: 0.65,
          maxLife: 0.65,
          size: 6 + Math.random() * 6
        });
      }
    }, 420);
  }

  function castDash() {
    const s = SKILLS.dash;
    if (player.cooldowns.dash > 0) return;
    player.cooldowns.dash = Math.max(0.4, s.baseCooldown - (s.level - 1) * s.cdReductionPerLvl);

    let dx = 0, dy = 0;
    if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

    if (dx === 0 && dy === 0) {
      const angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
      dx = Math.cos(angle);
      dy = Math.sin(angle);
    } else {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
    }

    const dist = s.baseDistance + (s.level - 1) * s.distancePerLvl;
    player.x += dx * dist;
    player.y += dy * dist;

    for (let i = 0; i < 8; i++) {
      particles.push({
        x: player.x - dx * (i * 20),
        y: player.y - dy * (i * 20),
        vx: 0,
        vy: 0,
        color: 'rgba(255, 255, 255, 0.4)',
        life: 0.25,
        maxLife: 0.25,
        size: 16
      });
    }
  }

  // ==========================================
  // 12. UPDATE LOOP
  // ==========================================
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTimer = 0;

  function update(dt) {
    camera.zoom += (camera.targetZoom - camera.zoom) * 0.12;

    let mx = 0, my = 0;
    if (keys['KeyW'] || keys['ArrowUp']) my -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) my += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) mx += 1;

    player.isMoving = mx !== 0 || my !== 0;
    if (player.isMoving) {
      const len = Math.hypot(mx, my);
      player.vx = (mx / len) * player.speed;
      player.vy = (my / len) * player.speed;

      if (Math.abs(mx) > Math.abs(my)) {
        player.facing = mx > 0 ? 'right' : 'left';
      } else {
        player.facing = my > 0 ? 'down' : 'up';
      }

      player.x = Math.max(80, Math.min(WORLD_SIZE - 80, player.x + player.vx * dt));
      player.y = Math.max(80, Math.min(WORLD_SIZE - 80, player.y + player.vy * dt));

      player.animTimer += dt * 8;
      player.animFrame = Math.floor(player.animTimer) % 4;
    } else {
      player.vx = 0;
      player.vy = 0;
      player.animTimer += dt * 2;
      player.animFrame = 0;
    }

    portals.forEach(p => {
      if (Math.hypot(player.x - p.x, player.y - p.y) < 55) {
        loadZone(p.targetZone, p.targetX, p.targetY);
      }
    });

    groundLoot.forEach(loot => {
      if (loot.bounceTimer > 0) {
        loot.bounceTimer -= dt;
        loot.x += (loot.targetX - loot.x) * 0.15;
        loot.y += (loot.targetY - loot.y) * 0.15;
      }
    });

    for (let k in player.cooldowns) {
      if (player.cooldowns[k] > 0) player.cooldowns[k] = Math.max(0, player.cooldowns[k] - dt);
    }
    player.mana = Math.min(player.maxMana, player.mana + 10 * dt);
    player.life = Math.min(player.maxLife, player.life + 4 * dt);

    if (mouse.isDown && player.cooldowns.slash <= 0) {
      castSlash();
    }

    camera.x = player.x;
    camera.y = player.y;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    mouse.worldX = player.x + (mouse.x - centerX) / camera.zoom;
    mouse.worldY = player.y + (mouse.y - centerY) / camera.zoom;

    // Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      let hit = false;
      monsters.forEach(m => {
        if (m.isAlive && !hit && Math.hypot(m.x - p.x, m.y - p.y) < 28 * (m.scale || 1)) {
          dealDamage(m, 10, p.damage || 85, 0, 0, 0);
          hit = true;
        }
      });

      trainingDummies.forEach(d => {
        if (!hit && Math.hypot(d.x - p.x, d.y - p.y) < 28) {
          dealDamage(d, 10, p.damage || 85, 0, 0, 0);
          hit = true;
        }
      });

      if (hit || p.life <= 0) {
        for (let k = 0; k < 12; k++) {
          particles.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 180,
            vy: (Math.random() - 0.5) * 180,
            color: '#ff5722',
            life: 0.3,
            maxLife: 0.3,
            size: 5
          });
        }
        projectiles.splice(i, 1);
      }
    }

    // Boss Bar
    let activeBoss = null;
    monsters.forEach(m => {
      if (!m.isAlive) return;
      if (m.type === 'boss') activeBoss = m;

      if (m.hurtTimer > 0) m.hurtTimer -= dt;
      m.animTimer += dt * 5;

      const dist = Math.hypot(player.x - m.x, player.y - m.y);
      if (dist < 450 && dist > 35) {
        const angle = Math.atan2(player.y - m.y, player.x - m.x);
        m.x += Math.cos(angle) * m.speed * dt;
        m.y += Math.sin(angle) * m.speed * dt;
      }
    });

    const bossHud = document.getElementById('boss-hud-bar');
    if (activeBoss && activeBoss.isAlive && Math.hypot(player.x - activeBoss.x, player.y - activeBoss.y) < 950) {
      bossHud.classList.remove('boss-hud-hide');
      const hpPct = Math.max(0, (activeBoss.life / activeBoss.maxLife) * 100);
      document.getElementById('boss-hp-fill').style.width = `${hpPct}%`;
      document.getElementById('boss-hp-text').innerText = `${Math.round(activeBoss.life)} / ${activeBoss.maxLife} (${Math.round(hpPct)}%)`;
    } else {
      bossHud.classList.add('boss-hud-hide');
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }

    updateUI();
  }

  function updateUI() {
    document.getElementById('bar-es').style.width = `${(player.es / player.maxEs) * 100}%`;
    document.getElementById('text-es').innerText = `ES: ${Math.round(player.es)} / ${player.maxEs}`;

    document.getElementById('bar-life').style.width = `${(player.life / player.maxLife) * 100}%`;
    document.getElementById('text-life').innerText = `HP: ${Math.round(player.life)} / ${player.maxLife}`;

    document.getElementById('bar-mana').style.width = `${(player.mana / player.maxMana) * 100}%`;
    document.getElementById('text-mana').innerText = `MP: ${Math.round(player.mana)} / ${player.maxMana}`;

    document.getElementById('zoom-level-text').innerText = `${Math.round(camera.zoom * 100)}%`;

    for (let k in player.cooldowns) {
      const el = document.getElementById(`cd-${k}`);
      if (el) {
        const maxCd = SKILLS[k] ? SKILLS[k].baseCooldown : 1.0;
        const pct = (player.cooldowns[k] / maxCd) * 100;
        el.style.height = `${pct}%`;
      }
    }
  }

  // ==========================================
  // 13. RENDERING
  // ==========================================
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-player.x, -player.y);

    drawSeamlessTerrain();

    const renderList = [];

    portals.forEach(p => renderList.push({ y: p.y, render: () => drawPortal(p) }));
    props.forEach(p => renderList.push({ y: p.y, render: () => drawPropClean(p) }));
    npcs.forEach(n => renderList.push({ y: n.y, render: () => drawNpc(n) }));
    trainingDummies.forEach(d => renderList.push({ y: d.y, render: () => drawDummy(d) }));
    groundLoot.forEach((loot, idx) => renderList.push({ y: loot.y, render: () => drawGroundLoot(loot, idx) }));

    monsters.forEach(m => {
      if (m.isAlive) renderList.push({ y: m.y, render: () => drawMonsterClean(m) });
    });

    renderList.push({ y: player.y, render: () => drawPlayerClean() });

    renderList.sort((a, b) => a.y - b.y);
    renderList.forEach(item => item.render());

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

    floatingTexts.forEach(ft => {
      ctx.font = ft.isCrit ? 'bold 16px "Press Start 2P", monospace' : 'bold 12px "Press Start 2P", monospace';
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
    });

    ctx.restore();

    renderMinimap();
  }

  function drawGroundLoot(loot, idx) {
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

  function drawSeamlessTerrain() {
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

  function drawPlayerClean() {
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

    const titleColor = player.classSpec === 'Vanguard' ? '#e5c07b' : (player.classSpec === 'Arcanist' ? '#61afef' : (player.classSpec === 'ShadowRogue' ? '#c678dd' : '#ffffff'));
    ctx.font = 'bold 10px "Outfit", sans-serif';
    ctx.fillStyle = titleColor;
    ctx.textAlign = 'center';
    ctx.fillText(`${player.gender === 'Male' ? '♂' : '♀'} ${player.classSpec} [Lv.${player.level}]`, 0, -42);

    ctx.restore();
  }

  function drawMonsterClean(m) {
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

  function drawPropClean(p) {
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

  function drawPortal(p) {
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

  function drawNpc(n) {
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

  function drawDummy(d) {
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

  function renderMinimap() {
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

  function gameLoop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    frameCount++;
    fpsTimer += dt;
    if (fpsTimer >= 1.0) {
      document.getElementById('fps-counter').innerText = `${frameCount} FPS`;
      frameCount = 0;
      fpsTimer = 0;
    }

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
  }

  // ==========================================
  // 14. INPUT LISTENERS
  // ==========================================
  window.addEventListener('wheel', e => {
    if (document.querySelector('.worldmap-modal-wrap:not(.hidden)')) return;
    e.preventDefault();
    const zoomFactor = -Math.sign(e.deltaY) * 0.15;
    camera.targetZoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.targetZoom + zoomFactor));
  }, { passive: false });

  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    camera.targetZoom = Math.min(camera.maxZoom, camera.targetZoom + 0.25);
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    camera.targetZoom = Math.max(camera.minZoom, camera.targetZoom - 0.25);
  });
  document.getElementById('btn-zoom-reset').addEventListener('click', () => {
    camera.targetZoom = 1.0;
  });

  document.getElementById('btn-toggle-gender').addEventListener('click', () => {
    setGender(player.gender === 'Male' ? 'Female' : 'Male');
  });

  document.getElementById('btn-ascend-trigger').addEventListener('click', () => {
    document.getElementById('ascension-modal').classList.remove('hidden');
  });

  document.querySelectorAll('.class-choice-card').forEach(card => {
    card.addEventListener('click', () => {
      const spec = card.getAttribute('data-class');
      selectClassSpecialization(spec);
    });
  });

  document.querySelectorAll('.bag-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.bag-tab').forEach(t => t.classList.remove('active-tab'));
      tab.classList.add('active-tab');
      player.bagFilter = tab.getAttribute('data-filter');
      updateBackpackUI();
    });
  });

  document.getElementById('btn-sort-bag').addEventListener('click', () => {
    const rarityPriority = { Unique: 1, Rare: 2, Magic: 3, Currency: 4, Normal: 5 };
    player.bag.sort((a, b) => (rarityPriority[a.rarity] || 9) - (rarityPriority[b.rarity] || 9));
    AudioEngine.playPickup();
    updateBackpackUI();
  });

  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyQ') castFireball();
    if (e.code === 'KeyW') castFrostNova();
    if (e.code === 'KeyE') castMeteor();
    if (e.code === 'Space') castDash();
    if (e.code === 'KeyK') toggleModal('skills-modal');
    if (e.code === 'KeyM') toggleModal('worldmap-modal');
    if (e.code === 'KeyC') toggleModal('stats-modal');
    if (e.code === 'KeyI') toggleModal('inventory-modal');

    if (e.code === 'KeyF') {
      let closestIdx = -1;
      let minDistance = 120;
      groundLoot.forEach((loot, idx) => {
        const dist = Math.hypot(player.x - loot.x, player.y - loot.y);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });
      if (closestIdx !== -1) pickUpLoot(closestIdx);
    }
  });

  window.addEventListener('keyup', e => {
    keys[e.code] = false;
  });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mousedown', e => {
    if (e.button === 0 && e.target === canvas) {
      AudioEngine.init();

      let clickedLootIdx = -1;
      groundLoot.forEach((loot, idx) => {
        if (Math.hypot(mouse.worldX - loot.x, mouse.worldY - loot.y) < 40) clickedLootIdx = idx;
      });

      if (clickedLootIdx !== -1) {
        const loot = groundLoot[clickedLootIdx];
        if (Math.hypot(player.x - loot.x, player.y - loot.y) < 140) {
          pickUpLoot(clickedLootIdx);
          return;
        }
      }

      mouse.isDown = true;
      castSlash();
    }
  });

  window.addEventListener('mouseup', e => {
    if (e.button === 0) mouse.isDown = false;
  });

  function toggleModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.toggle('hidden');
      if (id === 'skills-modal' && !el.classList.contains('hidden')) renderSkillUpgradeModal();
      if (id === 'inventory-modal' && !el.classList.contains('hidden')) {
        updateBackpackUI();
        updatePaperdollUI();
      }
    }
  }

  document.getElementById('btn-toggle-skills').addEventListener('click', () => toggleModal('skills-modal'));
  document.getElementById('btn-close-skills').addEventListener('click', () => toggleModal('skills-modal'));
  document.getElementById('btn-toggle-worldmap').addEventListener('click', () => toggleModal('worldmap-modal'));
  document.getElementById('btn-close-worldmap').addEventListener('click', () => toggleModal('worldmap-modal'));
  document.getElementById('btn-toggle-stats').addEventListener('click', () => toggleModal('stats-modal'));
  document.getElementById('btn-close-stats').addEventListener('click', () => toggleModal('stats-modal'));
  document.getElementById('btn-toggle-inventory').addEventListener('click', () => toggleModal('inventory-modal'));
  document.getElementById('btn-close-inventory').addEventListener('click', () => toggleModal('inventory-modal'));

  document.querySelectorAll('.zone-node').forEach(node => {
    node.addEventListener('click', () => {
      const zone = node.getAttribute('data-zone');
      if (zone === 'MoltenCaldera') {
        alert('The Molten Caldera (Lv. 35+) is currently sealed by ancient magic!');
        return;
      }
      toggleModal('worldmap-modal');
      loadZone(zone);
    });
  });

  document.getElementById('slot-slash').addEventListener('click', castSlash);
  document.getElementById('slot-fireball').addEventListener('click', castFireball);
  document.getElementById('slot-frost').addEventListener('click', castFrostNova);
  document.getElementById('slot-meteor').addEventListener('click', castMeteor);
  document.getElementById('slot-dash').addEventListener('click', castDash);

  loadZone('SanctuaryHaven', 2000, 2000);
  requestAnimationFrame(gameLoop);
})();
