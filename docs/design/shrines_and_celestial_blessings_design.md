# MDG: Aethelis - Shrines & Celestial Blessings System Design

## 1. Overview & Core Philosophy
The **Celestial Shrines & Divine Blessings System** (*Hệ Thống Đền Thần & Chúc Phúc Thần Khí*) is an environmental encounter mechanism that enriches combat depth and exploration reward in non-peace zones across Aethelis.

* **Non-Town Spawning Rule:** Shrines **never** spawn in peaceful sanctuaries (`SanctuaryHaven`). They exclusively spawn procedurally in wild zones, crypts, dungeons, and Rift Maps.
* **Map Density Limits:** Each combat map dynamically generates between **$1$ and $2$ shrines** (or **$2$ to $3$ shrines** on massive maps / Endgame Rifts).
* **Channeling Interaction:** Players hold the interaction key (`F`) within $80\text{px}$ radius of an unactivated shrine to channel the celestial leyline for **$2.5\text{s}$**, displaying a gold/themed progress bar. Moving beyond $140\text{px}$ interrupts channeling.

---

## 2. 7 Distinct High-Fantasy Shrine Archetypes

| Shrine Archetype | Color & Icon | Duration | Mechanical Stat Buffs & Combat Procs | Lore & Flavor |
| :--- | :---: | :---: | :--- | :--- |
| **⚡ Shrine of Divine Swiftness** | `#00e676`<br>`⚡` | $90\text{s}$ | • $+50\%$ Movement Speed<br>• $+40\%$ Attack & Cast Speed<br>• Full Immunity to Slow & Chill | *Channels the storm winds of the Astral Gale to quicken step and blade.* |
| **⚔️ Shrine of Cataclysmic Might** | `#ff3d00`<br>`⚔️` | $90\text{s}$ | • $+60\%$ All Damage Dealt (Phys/Fire/Cold/Light/Chaos)<br>• $+35\%$ Critical Strike Chance<br>• $+75\%$ Critical Strike Multiplier | *Awakens primordial titanic wrath, turning every strike into a catastrophic blow.* |
| **🛡️ Shrine of Aegis Sanctuary** | `#ffd700`<br>`🛡️` | $90\text{s}$ | • $+80\%$ Armor<br>• $+35\%$ All Elemental Resistances<br>• Regenerates $6\%$ Max Life per second | *Weaves a dome of radiant warding that turns enemy blades to dust and knits wounds.* |
| **👑 Shrine of Celestial Fortune** | `#f1c40f`<br>`👑` | $90\text{s}$ | • $+150\%$ Item Rarity (IIR)<br>• $+100\%$ Item Quantity (IIQ)<br>• Double ($2.0\times$) Gold & EXP drops from slain monsters | *Aligns the celestial constellations to manifest rare relics, essence, and wealth.* |
| **🔮 Shrine of Infinite Aether** | `#00f2fe`<br>`🔮` | $90\text{s}$ | • $-50\%$ Cooldown on All Skills<br>• $0$ Mana Cost on All Skills<br>• Regenerates $15\%$ Max Mana & Energy Shield per sec | *Unlocks the boundless reservoir of Genesis magic for relentless spellcraft.* |
| **❄️ Shrine of Absolute Frost** | `#80deea`<br>`❄️` | $90\text{s}$ | • $180\text{px}$ Blizzard Aura: $-50\%$ Enemy Movement Speed<br>• Every attack discharges Glacial Freeze ($1.5\text{s}$ stun) | *Envelops the wielder in a freezing vortex that permafrosts all who approach.* |
| **🔥 Shrine of Solar Inferno** | `#ff7849`<br>`🔥` | $90\text{s}$ | • $180\text{px}$ Solar Burn Aura: $160\text{ Fire DPS}$<br>• Fiery Corpse Explosions on monster death ($140\text{px}$ radius) | *Ignites the solar core of the sun dragon, incinerating foes and detonating their corpses.* |

---

## 3. Procedural Map Spawning Algorithm
1. **Validation Checks:**
   - Zone check: `currentZoneId !== 'SanctuaryHaven'`.
   - Grid check: Candidate coordinate `(x, y)` satisfies `canWalk(x, y) === true`.
2. **Safe Clearance Constraints:**
   - Player Spawn Distance: $\Delta \ge 200\text{px}$.
   - Inter-Shrine Distance: $\Delta \ge 260\text{px}$ (prevents shrine clustering).
   - Portal Clearance: $\Delta \ge 120\text{px}$.
3. **Diversity Rule:**
   - Available keys are shuffled using the Fisher-Yates algorithm. Each generated shrine in a zone is guaranteed to have a unique archetype.

---

## 4. UI/UX & Visual Feedback
* **Canvas Minimap Radar:** Displays shrines as bright glowing diamond/star markers (`#f1c40f` / `#00e676` / `#ff3d00` / `#00f2fe`).
* **In-World Visuals:** Shrines display custom high-fantasy sprite artwork with floating glowing celestial orbs on top pulsing to sinusoidal time.
* **Character Blessing Aura:** Active blessing creates a rotating runic ring with floating particles beneath the player's feet matching the active shrine's color.
* **HUD Buff Tray:** Top status tray dynamically displays active shrine pills with icon, name, and remaining seconds countdown timer.
