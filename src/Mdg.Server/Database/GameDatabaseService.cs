using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Mdg.Server.Database;

public sealed class GameDatabaseService
{
    private readonly IDbContextFactory<MdgDbContext> _contextFactory;

    public GameDatabaseService(IDbContextFactory<MdgDbContext> contextFactory)
    {
        _contextFactory = contextFactory;
        using var db = _contextFactory.CreateDbContext();
        db.Database.EnsureCreated();
    }

    public async Task<List<CharacterSummaryDto>> GetAllCharactersAsync()
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.Characters
            .AsNoTracking()
            .OrderByDescending(c => c.UpdatedAt)
            .Select(c => new CharacterSummaryDto
            {
                Id = c.Id,
                Name = c.Name,
                Gender = c.Gender,
                ClassSpec = c.ClassSpec,
                Level = c.Level,
                ZoneId = c.ZoneId,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<bool> CreateCharacterAsync(CharacterCreateDto dto)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var entity = new CharacterEntity
        {
            Id = dto.Id ?? Guid.NewGuid().ToString("N"),
            Name = dto.Name,
            Gender = dto.Gender ?? "Male",
            ClassSpec = dto.ClassSpec ?? "Novice",
            Level = 1,
            CurrentExp = 0,
            ExpToNext = 100,
            SkillPoints = 3,
            Life = 250,
            MaxLife = 250,
            Mana = 120,
            MaxMana = 120,
            Es = 100,
            MaxEs = 100,
            ZoneId = "SanctuaryHaven",
            PositionX = 2000,
            PositionY = 2000,
            Skills = new(),
            EquippedGear = new(),
            BackpackItems = new(),
            CreatedAt = DateTime.UtcNow.ToString("o"),
            UpdatedAt = DateTime.UtcNow.ToString("o")
        };

        db.Characters.Add(entity);
        var rows = await db.SaveChangesAsync();
        return rows > 0;
    }

    public async Task<bool> DeleteCharacterAsync(string characterId)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var entity = await db.Characters.FindAsync(characterId);
        if (entity is null) return false;

        db.Characters.Remove(entity);
        var rows = await db.SaveChangesAsync();
        return rows > 0;
    }

    public async Task<bool> SaveCharacterAsync(SaveGameDto data)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var charId = data.CharacterId ?? "hero_default";
        var entity = await db.Characters.FindAsync(charId);

        if (entity is null)
        {
            entity = new CharacterEntity
            {
                Id = charId,
                CreatedAt = DateTime.UtcNow.ToString("o")
            };
            db.Characters.Add(entity);
        }

        entity.Name = data.Name ?? "Novice Adventurer";
        entity.Gender = data.Gender ?? "Male";
        entity.ClassSpec = data.ClassSpec ?? "Novice";
        entity.Level = data.Level;
        entity.CurrentExp = data.CurrentExp;
        entity.ExpToNext = data.ExpToNext;
        entity.SkillPoints = data.SkillPoints;
        entity.Life = data.Life;
        entity.MaxLife = data.MaxLife;
        entity.Mana = data.Mana;
        entity.MaxMana = data.MaxMana;
        entity.Es = data.Es;
        entity.MaxEs = data.MaxEs;
        entity.ZoneId = data.ZoneId ?? "SanctuaryHaven";
        entity.PositionX = data.PositionX;
        entity.PositionY = data.PositionY;
        entity.Skills = data.Skills ?? new();
        entity.EquippedGear = data.EquippedGear ?? new();
        entity.BackpackItems = data.BackpackItems ?? new();
        entity.UpdatedAt = DateTime.UtcNow.ToString("o");

        var rows = await db.SaveChangesAsync();
        return rows > 0;
    }

    public async Task<SaveGameDto?> GetCharacterAsync(string characterId)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var c = await db.Characters.AsNoTracking().FirstOrDefaultAsync(x => x.Id == characterId);
        if (c is null) return null;

        return new SaveGameDto
        {
            CharacterId = c.Id,
            Name = c.Name,
            Gender = c.Gender,
            ClassSpec = c.ClassSpec,
            Level = c.Level,
            CurrentExp = c.CurrentExp,
            ExpToNext = c.ExpToNext,
            SkillPoints = c.SkillPoints,
            Life = c.Life,
            MaxLife = c.MaxLife,
            Mana = c.Mana,
            MaxMana = c.MaxMana,
            Es = c.Es,
            MaxEs = c.MaxEs,
            ZoneId = c.ZoneId,
            PositionX = c.PositionX,
            PositionY = c.PositionY,
            Skills = c.Skills,
            EquippedGear = c.EquippedGear,
            BackpackItems = c.BackpackItems
        };
    }

    public async Task<List<object>> GetSharedStashAsync()
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var list = await db.SharedStash.AsNoTracking().OrderBy(s => s.SlotIndex).ToListAsync();
        var items = new List<object>();
        foreach (var entry in list)
        {
            try
            {
                var parsed = JsonSerializer.Deserialize<object>(entry.ItemJson);
                if (parsed != null) items.Add(parsed);
            }
            catch { }
        }
        return items;
    }

    public async Task<bool> SaveSharedStashAsync(List<object> items)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        db.SharedStash.RemoveRange(db.SharedStash);

        for (int i = 0; i < items.Count; i++)
        {
            db.SharedStash.Add(new SharedStashItemEntity
            {
                SlotIndex = i,
                ItemJson = JsonSerializer.Serialize(items[i]),
                UpdatedAt = DateTime.UtcNow.ToString("o")
            });
        }

        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResetSavegameAsync(string characterId = "hero_default")
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var entity = await db.Characters.FindAsync(characterId);
        if (entity is not null)
        {
            db.Characters.Remove(entity);
            await db.SaveChangesAsync();
        }
        return true;
    }
}

public sealed class CharacterSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Gender { get; set; } = "Male";
    public string ClassSpec { get; set; } = "Novice";
    public int Level { get; set; } = 1;
    public string ZoneId { get; set; } = "SanctuaryHaven";
    public string UpdatedAt { get; set; } = string.Empty;
}

public sealed class CharacterCreateDto
{
    public string? Id { get; set; }
    public string Name { get; set; } = "New Hero";
    public string? Gender { get; set; } = "Male";
    public string? ClassSpec { get; set; } = "Novice";
}

public sealed class SaveGameDto
{
    public string? CharacterId { get; set; } = "hero_default";
    public string? Name { get; set; } = "Novice Adventurer";
    public string? Gender { get; set; } = "Male";
    public string? ClassSpec { get; set; } = "Novice";
    public int Level { get; set; } = 1;
    public int CurrentExp { get; set; } = 0;
    public int ExpToNext { get; set; } = 100;
    public int SkillPoints { get; set; } = 3;
    public double Life { get; set; } = 250;
    public double MaxLife { get; set; } = 250;
    public double Mana { get; set; } = 120;
    public double MaxMana { get; set; } = 120;
    public double Es { get; set; } = 100;
    public double MaxEs { get; set; } = 100;
    public string? ZoneId { get; set; } = "SanctuaryHaven";
    public double PositionX { get; set; } = 2000;
    public double PositionY { get; set; } = 2000;
    public Dictionary<string, object>? Skills { get; set; }
    public Dictionary<string, object>? EquippedGear { get; set; }
    public List<object>? BackpackItems { get; set; }
}
