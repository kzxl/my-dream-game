using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
        try
        {
            using var db = _contextFactory.CreateDbContext();
            db.Database.EnsureCreated();
            try { db.Database.ExecuteSqlRaw("CREATE TABLE IF NOT EXISTS UserAccounts (Id TEXT PRIMARY KEY, Email TEXT, Name TEXT, PictureUrl TEXT, CreatedAt TEXT, LastLoginAt TEXT);"); } catch { }
            try { db.Database.ExecuteSqlRaw("ALTER TABLE Characters ADD COLUMN AccountId TEXT DEFAULT 'guest';"); } catch { }
            try { db.Database.ExecuteSqlRaw("ALTER TABLE SharedStash ADD COLUMN AccountId TEXT DEFAULT 'guest';"); } catch { }
        }
        catch { }
    }

    public async Task<(UserAccountEntity User, List<CharacterSummaryDto> Characters)> ProcessGoogleAuthAsync(GoogleAuthRequestDto req)
    {
        string userId = "guest";
        string email = "guest@aethelis.realm";
        string name = "Aethelis Adventurer";
        string picture = "";

        // 1. If dev user provided
        if (req.DevUser != null && !string.IsNullOrWhiteSpace(req.DevUser.Id))
        {
            userId = req.DevUser.Id;
            email = req.DevUser.Email ?? $"{userId}@gmail.com";
            name = req.DevUser.Name ?? "Google Hero";
            picture = req.DevUser.Picture ?? "";
        }
        // 2. Decode Google JWT Credential Token Payload if provided
        else if (!string.IsNullOrWhiteSpace(req.Credential))
        {
            try
            {
                var parts = req.Credential.Split('.');
                if (parts.Length >= 2)
                {
                    string payloadBase64 = parts[1].Replace('-', '+').Replace('_', '/');
                    switch (payloadBase64.Length % 4)
                    {
                        case 2: payloadBase64 += "=="; break;
                        case 3: payloadBase64 += "="; break;
                    }
                    var jsonBytes = Convert.FromBase64String(payloadBase64);
                    using var doc = JsonDocument.Parse(jsonBytes);
                    var root = doc.RootElement;

                    if (root.TryGetProperty("sub", out var subProp)) userId = "gg_" + subProp.GetString();
                    if (root.TryGetProperty("email", out var emailProp)) email = emailProp.GetString() ?? email;
                    if (root.TryGetProperty("name", out var nameProp)) name = nameProp.GetString() ?? name;
                    if (root.TryGetProperty("picture", out var picProp)) picture = picProp.GetString() ?? picture;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GoogleAuth] JWT Decode error: {ex.Message}");
                userId = "gg_user_" + Guid.NewGuid().ToString("N")[..8];
            }
        }
        else
        {
            userId = "gg_guest_" + Guid.NewGuid().ToString("N")[..8];
        }

        await using var db = await _contextFactory.CreateDbContextAsync();
        var account = await db.UserAccounts.FindAsync(userId);
        if (account == null)
        {
            account = new UserAccountEntity
            {
                Id = userId,
                Email = email,
                Name = name,
                PictureUrl = picture,
                CreatedAt = DateTime.UtcNow.ToString("o"),
                LastLoginAt = DateTime.UtcNow.ToString("o")
            };
            db.UserAccounts.Add(account);
            await db.SaveChangesAsync();

            // Create initial default character for new Google user
            var initialHero = new CharacterEntity
            {
                Id = "hero_" + Guid.NewGuid().ToString("N")[..8],
                AccountId = userId,
                Name = name.Split(' ')[0],
                Gender = "Male",
                ClassSpec = "Novice",
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
                CreatedAt = DateTime.UtcNow.ToString("o"),
                UpdatedAt = DateTime.UtcNow.ToString("o")
            };
            db.Characters.Add(initialHero);
            await db.SaveChangesAsync();
        }
        else
        {
            account.LastLoginAt = DateTime.UtcNow.ToString("o");
            if (!string.IsNullOrEmpty(picture)) account.PictureUrl = picture;
            if (!string.IsNullOrEmpty(name)) account.Name = name;
            await db.SaveChangesAsync();
        }

        var characters = await GetAllCharactersAsync(userId);
        return (account, characters);
    }

    public async Task<(UserAccountEntity User, List<CharacterSummaryDto> Characters)> ProcessCustomLoginAsync(string username, string? password, string? email = null)
    {
        var cleanName = (username ?? "Adventurer").Trim();
        if (string.IsNullOrWhiteSpace(cleanName)) cleanName = "Adventurer";
        var safeKey = cleanName.ToLowerInvariant().Replace(" ", "_").Replace("@", "_").Replace(".", "_");
        var userId = "acc_" + safeKey;
        var userEmail = string.IsNullOrWhiteSpace(email) ? $"{safeKey}@aethelis.realm" : email;
        var avatarUrl = $"https://api.dicebear.com/7.x/bottts/svg?seed={Uri.EscapeDataString(cleanName)}";

        await using var db = await _contextFactory.CreateDbContextAsync();
        var account = await db.UserAccounts.FindAsync(userId);
        if (account == null)
        {
            account = new UserAccountEntity
            {
                Id = userId,
                Email = userEmail,
                Name = cleanName,
                PictureUrl = avatarUrl,
                CreatedAt = DateTime.UtcNow.ToString("o"),
                LastLoginAt = DateTime.UtcNow.ToString("o")
            };
            db.UserAccounts.Add(account);
            await db.SaveChangesAsync();

            // Create initial default character for new custom user
            var initialHero = new CharacterEntity
            {
                Id = "hero_" + Guid.NewGuid().ToString("N")[..8],
                AccountId = userId,
                Name = cleanName,
                Gender = "Male",
                ClassSpec = "Vanguard",
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
                CreatedAt = DateTime.UtcNow.ToString("o"),
                UpdatedAt = DateTime.UtcNow.ToString("o")
            };
            db.Characters.Add(initialHero);
            await db.SaveChangesAsync();
        }
        else
        {
            account.LastLoginAt = DateTime.UtcNow.ToString("o");
            account.Name = cleanName;
            await db.SaveChangesAsync();
        }

        var characters = await GetAllCharactersAsync(userId);
        return (account, characters);
    }

    public async Task<List<CharacterSummaryDto>> GetAllCharactersAsync(string? accountId = null)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var query = db.Characters.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(accountId))
        {
            query = query.Where(c => c.AccountId == accountId || (accountId == "guest" && (c.AccountId == "guest" || string.IsNullOrEmpty(c.AccountId))));
        }

        return await query
            .OrderByDescending(c => c.UpdatedAt)
            .Select(c => new CharacterSummaryDto
            {
                Id = c.Id,
                AccountId = c.AccountId,
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
            Id = dto.Id ?? ("hero_" + Guid.NewGuid().ToString("N")[..8]),
            AccountId = string.IsNullOrWhiteSpace(dto.AccountId) ? "guest" : dto.AccountId,
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
                AccountId = data.AccountId ?? "guest",
                CreatedAt = DateTime.UtcNow.ToString("o")
            };
            db.Characters.Add(entity);
        }

        if (!string.IsNullOrWhiteSpace(data.AccountId))
        {
            entity.AccountId = data.AccountId;
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
            AccountId = c.AccountId,
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

    public async Task<object?> GetSharedStashAsync(string accountId = "guest")
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var entry = await db.SharedStash.AsNoTracking().FirstOrDefaultAsync(s => s.AccountId == accountId && s.SlotIndex == 0);
        if (entry != null)
        {
            try
            {
                return JsonSerializer.Deserialize<object>(entry.ItemJson);
            }
            catch { }
        }
        return null;
    }

    public async Task<bool> SaveSharedStashAsync(object stashPayload, string accountId = "guest")
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var existing = await db.SharedStash.Where(s => s.AccountId == accountId).ToListAsync();
        if (existing.Any())
        {
            db.SharedStash.RemoveRange(existing);
        }

        db.SharedStash.Add(new SharedStashItemEntity
        {
            Id = $"{accountId}_0",
            AccountId = accountId,
            SlotIndex = 0,
            ItemJson = JsonSerializer.Serialize(stashPayload),
            UpdatedAt = DateTime.UtcNow.ToString("o")
        });

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

    public async Task<List<ItemTemplateEntity>> GetItemTemplatesAsync()
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.ItemTemplates.AsNoTracking().ToListAsync();
    }

    public async Task<List<SkillTemplateEntity>> GetSkillTemplatesAsync()
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.SkillTemplates.AsNoTracking().ToListAsync();
    }

    public async Task<List<ZoneTemplateEntity>> GetZoneTemplatesAsync()
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.ZoneTemplates.AsNoTracking().ToListAsync();
    }

    public async Task<List<CampaignActEntity>> GetCampaignActsAsync()
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.CampaignActs.AsNoTracking().OrderBy(a => a.ActNumber).ToListAsync();
    }

    public async Task<List<MonsterTemplateEntity>> GetMonsterTemplatesAsync()
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.MonsterTemplates.AsNoTracking().OrderBy(m => m.Act).ThenBy(m => m.BaseHp).ToListAsync();
    }

    public async Task<List<UnifiedModifierTemplateEntity>> GetUnifiedModifiersAsync(string? targetCategory = null)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var q = db.UnifiedModifiers.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(targetCategory))
        {
            q = q.Where(m => m.TargetCategory == targetCategory);
        }
        return await q.OrderBy(m => m.Tier).ThenBy(m => m.Weight).ToListAsync();
    }

    public async Task<List<DropTableEntryEntity>> GetDropTablesAsync(string? sourceKey = null)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var q = db.DropTables.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(sourceKey))
        {
            q = q.Where(d => d.SourceKey == sourceKey || d.SourceType == "Global");
        }
        return await q.OrderByDescending(d => d.DropChancePercent).ToListAsync();
    }

    public async Task<object> GetFamilyMasterySystemAsync()
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var families = await db.FamilyMasteries.AsNoTracking().ToListAsync();
        var nodes = await db.FamilyTalentNodes.AsNoTracking().ToListAsync();

        var result = new Dictionary<string, object>();
        foreach (var fam in families)
        {
            var famNodes = nodes.Where(n => n.FamilyId == fam.Id).ToList();
            var rootNode = famNodes.FirstOrDefault(n => n.Branch == "root") ?? famNodes.FirstOrDefault();

            var branches = new List<object>
            {
                new
                {
                    id = "harvest",
                    title = "🌿 Harvest & Spoils",
                    nodes = famNodes.Where(n => n.Branch == "harvest").OrderBy(n => n.Tier).Select(n => new
                    {
                        id = n.Id,
                        name = n.Name,
                        desc = n.Description,
                        icon = n.Icon,
                        parentId = n.ParentNodeId,
                        isKeystone = n.IsKeystone
                    })
                },
                new
                {
                    id = "combat",
                    title = "⚔️ Combat & Lethality",
                    nodes = famNodes.Where(n => n.Branch == "combat").OrderBy(n => n.Tier).Select(n => new
                    {
                        id = n.Id,
                        name = n.Name,
                        desc = n.Description,
                        icon = n.Icon,
                        parentId = n.ParentNodeId,
                        isKeystone = n.IsKeystone
                    })
                },
                new
                {
                    id = "survival",
                    title = "🛡️ Survival & Wards",
                    nodes = famNodes.Where(n => n.Branch == "survival").OrderBy(n => n.Tier).Select(n => new
                    {
                        id = n.Id,
                        name = n.Name,
                        desc = n.Description,
                        icon = n.Icon,
                        parentId = n.ParentNodeId,
                        isKeystone = n.IsKeystone
                    })
                }
            };

            result[fam.Id] = new
            {
                id = fam.Id,
                name = fam.Name,
                icon = fam.Icon,
                color = fam.Color,
                desc = fam.Description,
                root = rootNode == null ? null : new
                {
                    id = rootNode.Id,
                    name = rootNode.Name,
                    desc = rootNode.Description,
                    icon = rootNode.Icon
                },
                branches
            };
        }

        return result;
    }
}

public sealed class GoogleAuthRequestDto
{
    public string? Credential { get; set; }
    public string? ClientId { get; set; }
    public GoogleUserDto? DevUser { get; set; }
}

public sealed class GoogleUserDto
{
    public string Id { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? Picture { get; set; }
}

public sealed class CharacterSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public string AccountId { get; set; } = "guest";
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
    public string? AccountId { get; set; } = "guest";
    public string Name { get; set; } = "New Hero";
    public string? Gender { get; set; } = "Male";
    public string? ClassSpec { get; set; } = "Novice";
}

public sealed class SaveGameDto
{
    public string? CharacterId { get; set; } = "hero_default";
    public string? AccountId { get; set; } = "guest";
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

public sealed class CustomLoginRequestDto
{
    public string Username { get; set; } = string.Empty;
    public string? Password { get; set; }
    public string? Email { get; set; }
}

