using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Mdg.Server.Database;
using Microsoft.EntityFrameworkCore;

namespace Mdg.Server.Services;

public interface IMasterDataCacheService
{
    Task WarmupAsync();
    ItemTemplateEntity? GetItemTemplate(string id);
    List<ItemTemplateEntity> GetAllItemTemplates();
    List<ClassStarterKitEntity> GetStarterKits();
    List<ClassStarterKitEntity> GetStarterKitForClass(string classSpec);
    Dictionary<string, object> BuildStarterGearForClass(string classSpec);
    List<UnifiedModifierTemplateEntity> GetModifiers(string? targetCategory = null, string? modType = null);
    List<UnifiedModifierTemplateEntity> GetEligibleItemAffixes(int ilvl, string modType, string? slot = null);
    List<UnifiedModifierTemplateEntity> GetMonsterAffixes();
    MonsterTemplateEntity? GetMonsterTemplate(string id);
    List<MonsterTemplateEntity> GetAllMonsterTemplates();
}

public class MasterDataCacheService : IMasterDataCacheService
{
    private readonly IDbContextFactory<MdgDbContext> _dbFactory;

    private readonly ConcurrentDictionary<string, ItemTemplateEntity> _items = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<string, List<ClassStarterKitEntity>> _starterKits = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<string, UnifiedModifierTemplateEntity> _modifiers = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<string, MonsterTemplateEntity> _monsters = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<string, ZoneTemplateEntity> _zones = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<string, QuestTemplateEntity> _quests = new(StringComparer.OrdinalIgnoreCase);

    public MasterDataCacheService(IDbContextFactory<MdgDbContext> dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public async Task WarmupAsync()
    {
        await using var db = await _dbFactory.CreateDbContextAsync();

        // 1. Cache Item Templates
        var items = await db.ItemTemplates.AsNoTracking().ToListAsync();
        _items.Clear();
        foreach (var item in items)
        {
            _items[item.Id] = item;
        }

        // 2. Cache Class Starter Kits
        var kits = await db.ClassStarterKits.AsNoTracking().ToListAsync();
        _starterKits.Clear();
        foreach (var group in kits.GroupBy(k => k.ClassSpec, StringComparer.OrdinalIgnoreCase))
        {
            _starterKits[group.Key] = group.ToList();
        }

        // 3. Cache Unified Modifiers
        var mods = await db.UnifiedModifiers.AsNoTracking().ToListAsync();
        _modifiers.Clear();
        foreach (var m in mods)
        {
            _modifiers[m.Id] = m;
        }

        // 4. Cache Monsters
        var monsters = await db.MonsterTemplates.AsNoTracking().ToListAsync();
        _monsters.Clear();
        foreach (var mon in monsters)
        {
            _monsters[mon.Id] = mon;
        }

        // 5. Cache Zones
        var zones = await db.ZoneTemplates.AsNoTracking().ToListAsync();
        _zones.Clear();
        foreach (var z in zones)
        {
            _zones[z.Id] = z;
        }

        // 6. Cache Quests
        var quests = await db.QuestTemplates.AsNoTracking().ToListAsync();
        _quests.Clear();
        foreach (var q in quests)
        {
            _quests[q.Id] = q;
        }
    }

    public ItemTemplateEntity? GetItemTemplate(string id)
    {
        if (string.IsNullOrWhiteSpace(id)) return null;
        _items.TryGetValue(id, out var item);
        return item;
    }

    public List<ItemTemplateEntity> GetAllItemTemplates()
    {
        return _items.Values.ToList();
    }

    public List<ClassStarterKitEntity> GetStarterKits()
    {
        return _starterKits.Values.SelectMany(x => x).ToList();
    }

    public List<ClassStarterKitEntity> GetStarterKitForClass(string classSpec)
    {
        if (string.IsNullOrWhiteSpace(classSpec)) classSpec = "Novice";

        if (_starterKits.TryGetValue(classSpec, out var list) && list.Count > 0)
        {
            return list;
        }

        if (_starterKits.TryGetValue("Novice", out var fallbackList))
        {
            return fallbackList;
        }

        // Default hard fallback kit
        return new List<ClassStarterKitEntity>
        {
            new() { Id = "kit_default", ClassSpec = classSpec, Slot = "MainHand", ItemTemplateId = "starter_blade_1", Quantity = 1 }
        };
    }

    public Dictionary<string, object> BuildStarterGearForClass(string classSpec)
    {
        var kitEntries = GetStarterKitForClass(classSpec);
        var result = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

        foreach (var entry in kitEntries)
        {
            var template = GetItemTemplate(entry.ItemTemplateId);
            if (template != null)
            {
                var stats = new Dictionary<string, object>();
                try
                {
                    if (!string.IsNullOrWhiteSpace(template.StatsJson))
                    {
                        var parsed = JsonSerializer.Deserialize<Dictionary<string, object>>(template.StatsJson);
                        if (parsed != null) stats = parsed;
                    }
                }
                catch { }

                var gearInstance = new Dictionary<string, object>
                {
                    ["id"] = template.Id,
                    ["name"] = template.Name,
                    ["baseType"] = template.BaseType,
                    ["category"] = template.Category,
                    ["slot"] = entry.Slot ?? template.Slot,
                    ["rarity"] = template.Rarity,
                    ["tier"] = 1,
                    ["requiredLevel"] = template.RequiredLevel,
                    ["itemLevel"] = 1,
                    ["icon"] = template.Icon,
                    ["color"] = template.Color,
                    ["description"] = template.Description,
                    ["stats"] = stats
                };

                // Merge flat damage or armor into root fields for client compatibility
                if (stats.TryGetValue("damage", out var dmg)) gearInstance["damage"] = dmg;
                if (stats.TryGetValue("attackSpeed", out var aspd)) gearInstance["attackSpeed"] = aspd;
                if (stats.TryGetValue("critChance", out var crit)) gearInstance["critChance"] = crit;
                var slotKey = !string.IsNullOrWhiteSpace(entry.Slot) ? entry.Slot : (!string.IsNullOrWhiteSpace(template.Slot) ? template.Slot : "MainHand");
                result[slotKey] = gearInstance;
            }
        }

        // If no kit matches, fallback to standard blade
        if (result.Count == 0)
        {
            result["MainHand"] = new Dictionary<string, object>
            {
                ["id"] = "starter_blade_1",
                ["name"] = "Rusty Iron Blade",
                ["category"] = "weapon",
                ["slot"] = "MainHand",
                ["rarity"] = "Normal",
                ["tier"] = 1,
                ["requiredLevel"] = 1,
                ["itemLevel"] = 1,
                ["damage"] = 15,
                ["attackSpeed"] = 1.20,
                ["critChance"] = 5.0,
                ["icon"] = "🗡️",
                ["color"] = "#c8c8c8",
                ["description"] = "A weathered blade carried by novice warriors."
            };
        }

        return result;
    }

    public List<UnifiedModifierTemplateEntity> GetModifiers(string? targetCategory = null, string? modType = null)
    {
        var query = _modifiers.Values.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(targetCategory))
        {
            query = query.Where(m => string.Equals(m.TargetCategory, targetCategory, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(modType))
        {
            query = query.Where(m => string.Equals(m.ModType, modType, StringComparison.OrdinalIgnoreCase));
        }

        return query.ToList();
    }

    public List<UnifiedModifierTemplateEntity> GetEligibleItemAffixes(int ilvl, string modType, string? slot = null)
    {
        var query = _modifiers.Values.Where(m => 
            string.Equals(m.TargetCategory, "Equipment", StringComparison.OrdinalIgnoreCase) &&
            string.Equals(m.ModType, modType, StringComparison.OrdinalIgnoreCase));

        return query.ToList();
    }

    public List<UnifiedModifierTemplateEntity> GetMonsterAffixes()
    {
        return _modifiers.Values
            .Where(m => string.Equals(m.TargetCategory, "Monster", StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    public MonsterTemplateEntity? GetMonsterTemplate(string id)
    {
        if (string.IsNullOrWhiteSpace(id)) return null;
        _monsters.TryGetValue(id, out var mon);
        return mon;
    }

    public List<MonsterTemplateEntity> GetAllMonsterTemplates()
    {
        return _monsters.Values.ToList();
    }
}
