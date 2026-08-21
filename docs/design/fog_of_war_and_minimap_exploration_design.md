# MDG: Aethelis - Fog of War & Minimap Exploration Design

## 1. Executive Summary & Design Goal
The **Dynamic Fog of War & Exploration Engine** (*Cơ Chế Sương Mù Chiến Tranh & Thám Hiểm Bản Đồ*) replaces static full-map visibility with progressive discovery. Players must explore uncharted wilderness, crypts, and Rifts to uncover terrain, landmarks, and monster encampments.

---

## 2. Core Mechanics & Rules

### A. Non-Reveal Initial State
* When entering a wilderness or dungeon zone (`currentZoneId !== 'SanctuaryHaven'`), the Minimap starts shrouded in **Pitch Black Obsidian Fog** (`#06080e`).
* **Town Exception:** Peaceful safe havens (`SanctuaryHaven`) have full pre-explored visibility.

### B. Dynamic Line-of-Sight & Exploration Grid
* **Per-Zone 2D Exploration Grid:** Each zone stores an `exploredGrid[y][x]` (Uint8Array) in `zoneExploration[zoneId]`.
* **Vision Radius:** The player projects a **$7\text{-tile}$ circular vision radius** ($\approx 336\text{px}$) around `(player.x, player.y)`.
* **Permanent Exploration:** All tiles falling within the circle $\Delta(x, y) \le R_{\text{vision}}$ are marked `1` (Explored) and remain permanently visible on the Minimap for that session.

### C. Monster Radar Fog Masking (Anti-Spoiler)
* **No Wallhack / Fog Reveal:** Slimes, fiends, constructs, elites, and bosses hidden within unexplored fog are **NEVER** drawn on the Minimap radar.
* **Perception Range ($320\text{px}$):** Slain or alive monsters only manifest as red dots (`#e06c75`) or gold boss skulls (`#ffd700`) on the Minimap when they enter the player's immediate perception proximity ($\le 320\text{px}$).

### D. Landmark & POI Preservation
* **Shrines, Portals & Ground Loot:** Displayed on the Minimap only after their corresponding coordinate tile has been revealed by the player's vision radius.

---

## 3. Minimap Visual Hierarchy

| Layer | State | Color Palette & Styling |
| :--- | :---: | :--- |
| **0. Unexplored Fog** | Shrouded | `#06080e` (Pitch Black Obsidian) |
| **1. Explored Walkable** | Explored | `#0f172a` (Deep Slate Navy) |
| **2. Explored Obstacles / Walls** | Explored | `#1e293b` (Dark Slate Wall) |
| **3. Explored Water / River** | Explored | `#172554` (Aquatic Indigo) |
| **4. Explored Lava Hazard** | Explored | `#450a0a` (Scorched Magma) |
| **5. Explored Landmarks (POIs)** | Explored | `#ffd700` (Shrine), `#c678dd` (Portal), `#f1c40f` (Monolith) |
| **6. Monsters within Vision** | In Sight ($\le 320\text{px}$) | `#e06c75` (Normal), `#ffd700` (Boss $5\times 5\text{px}$) |
| **7. Active Vision Perception Halo** | Active | `rgba(97, 175, 239, 0.18)` Radial Gradient |
| **8. Player Marker** | Active | `#61afef` Cyan Dot with White Outline |
