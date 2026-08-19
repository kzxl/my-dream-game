/**
 * Server-Authoritative API Client Adapter
 * Delegates core game logic calculations (Loot, Forge, Stats, Skills, Resurrections) to C# WebAPI.
 */

export const ApiClient = {
  /**
   * Request server-authoritative loot generation for a slain monster
   */
  async generateMonsterLoot(monsterType, monsterRarity, isBoss, monsterLevel, zoneId, playerIir = 0, playerIiq = 0) {
    try {
      const res = await fetch('/api/v1/loot/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monsterType: monsterType || 'monster',
          monsterRarity: monsterRarity || 'normal',
          isBoss: !!isBoss,
          monsterLevel: monsterLevel || 1,
          zoneId: zoneId || 'SanctuaryHaven',
          playerIir: playerIir,
          playerIiq: playerIiq
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[ApiClient] Loot generation fallback to local:', err);
    }
    return null;
  },

  /**
   * Request server-authoritative currency forging (Transmute, Alchemy, Chaos, Exalted, Sockets, Links, etc.)
   */
  async applyForgeCurrency(currencyType, item) {
    try {
      const res = await fetch('/api/v1/forge/apply-currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currencyType: currencyType,
          item: item
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[ApiClient] Forge currency crafting fallback to local:', err);
    }
    return null;
  },

  /**
   * Request server-authoritative character stat calculation (Armor mitigation, resist penalties, HP/Mana/ES pools)
   */
  async calculateCharacterStats(level, classSpec, strength, dexterity, intelligence, currentAct, equippedItems, allocatedNodes) {
    try {
      const res = await fetch('/api/v1/character/calculate-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: level || 1,
          classSpec: classSpec || 'Novice',
          strength: strength || 10,
          dexterity: dexterity || 10,
          intelligence: intelligence || 10,
          currentAct: currentAct || 1,
          equippedItems: equippedItems || [],
          allocatedNodes: allocatedNodes || []
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[ApiClient] Character stat calculation fallback to local:', err);
    }
    return null;
  },

  /**
   * Request server-authoritative skill tree and mastery validation
   */
  async validateSkillTree(playerLevel, classSpec, allocatedNodeIds, selectedMasteries) {
    try {
      const res = await fetch('/api/v1/skills/validate-tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerLevel: playerLevel || 1,
          classSpec: classSpec || 'Novice',
          allocatedNodeIds: allocatedNodeIds || [],
          selectedMasteries: selectedMasteries || {}
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[ApiClient] Skill tree validation fallback:', err);
    }
    return null;
  },

  /**
   * Character Roster APIs
   */
  async fetchCharacters(accountId = 'guest') {
    try {
      const res = await fetch(`/api/v1/characters?accountId=${encodeURIComponent(accountId)}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[ApiClient] fetchCharacters fallback:', err);
    }
    return [];
  },

  async createCharacter(name, classSpec, gender, accountId = 'guest') {
    try {
      const res = await fetch('/api/v1/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'char_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
          name: name || 'Aria',
          classSpec: classSpec || 'Novice',
          gender: gender || 'Male',
          accountId: accountId
        })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[ApiClient] createCharacter fallback:', err);
    }
    return null;
  },

  async deleteCharacter(characterId) {
    try {
      const res = await fetch(`/api/v1/characters/${encodeURIComponent(characterId)}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[ApiClient] deleteCharacter fallback:', err);
    }
    return null;
  },

  async loadSavegame(characterId = 'hero_default') {
    try {
      const res = await fetch(`/api/v1/savegame?characterId=${encodeURIComponent(characterId)}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[ApiClient] loadSavegame fallback:', err);
    }
    return null;
  },

  async saveGame(savePayload) {
    try {
      const res = await fetch('/api/v1/savegame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savePayload)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[ApiClient] saveGame fallback:', err);
    }
    return null;
  }
};
