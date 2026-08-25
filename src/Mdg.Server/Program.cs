using Mdg.Core.Features.Companion;
using Mdg.Core.Features.Items;
using Mdg.Core.Features.Items.Crafting;
using Mdg.Core.Features.Items.Market;
using Mdg.Core.Features.Maps;
using Mdg.Core.Features.Progression;
using Mdg.Server.Database;
using Mdg.Server.Hubs;
using Mdg.Server.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Ensure Database file path
var dataDir = builder.Environment.ContentRootPath;
var dbPath = Path.Combine(dataDir, "mdg_world.db");

// Direct SQLite schema migration before EF Core initialization
try
{
    using var conn = new Microsoft.Data.Sqlite.SqliteConnection($"Data Source={dbPath}");
    conn.Open();
    using var cmd = conn.CreateCommand();
    cmd.CommandText = @"
        PRAGMA foreign_keys = OFF;
        CREATE TABLE IF NOT EXISTS ""Characters"" (
            ""Id"" TEXT PRIMARY KEY,
            ""AccountId"" TEXT DEFAULT 'guest',
            ""Name"" TEXT DEFAULT 'Novice Adventurer',
            ""Gender"" TEXT DEFAULT 'Male',
            ""ClassSpec"" TEXT DEFAULT 'Novice',
            ""Ascendance"" TEXT DEFAULT '',
            ""Level"" INTEGER DEFAULT 1,
            ""CurrentExp"" INTEGER DEFAULT 0,
            ""ExpToNext"" INTEGER DEFAULT 100,
            ""SkillPoints"" INTEGER DEFAULT 3,
            ""DevotionPoints"" INTEGER DEFAULT 8,
            ""Life"" REAL DEFAULT 250,
            ""MaxLife"" REAL DEFAULT 250,
            ""Mana"" REAL DEFAULT 120,
            ""MaxMana"" REAL DEFAULT 120,
            ""Es"" REAL DEFAULT 100,
            ""MaxEs"" REAL DEFAULT 100,
            ""ZoneId"" TEXT DEFAULT 'SanctuaryHaven',
            ""PositionX"" REAL DEFAULT 2000,
            ""PositionY"" REAL DEFAULT 2000,
            ""SkillsJson"" TEXT DEFAULT '{}',
            ""EquippedJson"" TEXT DEFAULT '{}',
            ""BackpackJson"" TEXT DEFAULT '[]',
            ""MonsterKillsJson"" TEXT DEFAULT '{}',
            ""FamilyTalentsJson"" TEXT DEFAULT '{}',
            ""FamilyPointsJson"" TEXT DEFAULT '{}',
            ""DevotionNodesJson"" TEXT DEFAULT '[]',
            ""CompletedQuestsJson"" TEXT DEFAULT '[]',
            ""ActiveQuestsJson"" TEXT DEFAULT '{}',
            ""WaypointsJson"" TEXT DEFAULT '[]',
            ""CurrenciesJson"" TEXT DEFAULT '{}',
            ""CreatedAt"" TEXT,
            ""UpdatedAt"" TEXT
        );

        CREATE TABLE IF NOT EXISTS ""MarketListings"" (
            ""Id"" TEXT PRIMARY KEY,
            ""SellerAccountId"" TEXT DEFAULT 'guest',
            ""SellerCharacterName"" TEXT DEFAULT 'Unknown',
            ""ItemJson"" TEXT DEFAULT '{}',
            ""ItemName"" TEXT DEFAULT 'Item',
            ""ItemRarity"" TEXT DEFAULT 'Normal',
            ""ItemCategory"" TEXT DEFAULT 'General',
            ""ItemLevel"" INTEGER DEFAULT 1,
            ""PriceAmount"" INTEGER DEFAULT 1,
            ""PriceCurrency"" TEXT DEFAULT 'fracture_core',
            ""TaxGold"" INTEGER DEFAULT 0,
            ""Status"" INTEGER DEFAULT 1,
            ""BuyerAccountId"" TEXT,
            ""BuyerCharacterName"" TEXT,
            ""CreatedAt"" TEXT,
            ""ExpireAt"" TEXT,
            ""SoldAt"" TEXT
        );
    ";
    cmd.ExecuteNonQuery();

    var cols = new[]
    {
        ("AccountId", "TEXT DEFAULT 'guest'"),
        ("MonsterKillsJson", "TEXT DEFAULT '{}'"),
        ("FamilyTalentsJson", "TEXT DEFAULT '{}'"),
        ("FamilyPointsJson", "TEXT DEFAULT '{}'"),
        ("DevotionNodesJson", "TEXT DEFAULT '[]'"),
        ("CompletedQuestsJson", "TEXT DEFAULT '[]'"),
        ("ActiveQuestsJson", "TEXT DEFAULT '{}'"),
        ("WaypointsJson", "TEXT DEFAULT '[]'"),
        ("CurrenciesJson", "TEXT DEFAULT '{}'"),
        ("DevotionPoints", "INTEGER DEFAULT 8"),
        ("Ascendance", "TEXT DEFAULT ''")
    };
    foreach (var (colName, colDef) in cols)
    {
        try
        {
            cmd.CommandText = $"ALTER TABLE \"Characters\" ADD COLUMN \"{colName}\" {colDef};";
            cmd.ExecuteNonQuery();
        }
        catch { }
    }

    cmd.CommandText = @"
        UPDATE ""Characters"" SET ""ActiveQuestsJson"" = '{}' WHERE ""ActiveQuestsJson"" IS NULL;
        UPDATE ""Characters"" SET ""DevotionNodesJson"" = '[]' WHERE ""DevotionNodesJson"" IS NULL;
        UPDATE ""Characters"" SET ""CompletedQuestsJson"" = '[]' WHERE ""CompletedQuestsJson"" IS NULL;
        UPDATE ""Characters"" SET ""CurrenciesJson"" = '{}' WHERE ""CurrenciesJson"" IS NULL;
        UPDATE ""Characters"" SET ""FamilyPointsJson"" = '{}' WHERE ""FamilyPointsJson"" IS NULL;
        UPDATE ""Characters"" SET ""FamilyTalentsJson"" = '{}' WHERE ""FamilyTalentsJson"" IS NULL;
        UPDATE ""Characters"" SET ""MonsterKillsJson"" = '{}' WHERE ""MonsterKillsJson"" IS NULL;
        UPDATE ""Characters"" SET ""WaypointsJson"" = '[]' WHERE ""WaypointsJson"" IS NULL;
        UPDATE ""Characters"" SET ""SkillsJson"" = '{}' WHERE ""SkillsJson"" IS NULL;
        UPDATE ""Characters"" SET ""EquippedJson"" = '{}' WHERE ""EquippedJson"" IS NULL;
        UPDATE ""Characters"" SET ""BackpackJson"" = '[]' WHERE ""BackpackJson"" IS NULL;
        UPDATE ""Characters"" SET ""Ascendance"" = '' WHERE ""Ascendance"" IS NULL;
        UPDATE ""Characters"" SET ""DevotionPoints"" = 8 WHERE ""DevotionPoints"" IS NULL;
        UPDATE ""Characters"" SET ""AccountId"" = 'guest' WHERE ""AccountId"" IS NULL;
    ";
    cmd.ExecuteNonQuery();
}
catch { }

// Configure LAN & Multi-Machine network binding on all interfaces (0.0.0.0:5013)
if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ASPNETCORE_URLS")))
{
    builder.WebHost.UseUrls("http://0.0.0.0:5013");
}

// Enable permissive CORS for cross-device LAN multiplayer and API access
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Register EF Core DbContextFactory & Services
builder.Services.AddDbContextFactory<MdgDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddSignalR();
builder.Services.AddSingleton<GameDatabaseService>();
builder.Services.AddSingleton<GameSessionService>();
builder.Services.AddSingleton<CompanionManager>();
builder.Services.AddSingleton<GenesisForgeBench>();
builder.Services.AddSingleton<GenesisCraftingEngine>();
builder.Services.AddSingleton<MapDeviceManager>();
builder.Services.AddSingleton<DevotionTree>();
builder.Services.AddSingleton<ResurrectionSessionManager>();
builder.Services.AddSingleton<LootService>();
builder.Services.AddSingleton<ForgeService>();
builder.Services.AddSingleton<ProfessionService>();
builder.Services.AddSingleton<ShadowService>();
builder.Services.AddSingleton<SpireService>();
builder.Services.AddSingleton<ProgressionService>();
builder.Services.AddSingleton<CharacterStatService>();
builder.Services.AddSingleton<SkillProgressionService>();
builder.Services.AddSingleton<EconomyService>();
builder.Services.AddSingleton<QuestService>();
builder.Services.AddSingleton<DevotionService>();
builder.Services.AddSingleton<MarketService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<GameSessionService>());

var app = builder.Build();

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Cache-Control", "no-cache, no-store, must-revalidate");
        ctx.Context.Response.Headers.Append("Pragma", "no-cache");
        ctx.Context.Response.Headers.Append("Expires", "0");
    }
});

// Map SignalR GameHub
app.MapHub<GameHub>("/gamehub");

// Health Check API
app.MapGet("/api/v1/health", () => Results.Ok(new
{
    status = "Online",
    game = "My Dream Game (MDG) Server (EF Core)",
    tickRate = 30,
    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
}));

// ZONE MAP GENERATION APIS
app.MapGet("/api/v1/zones/{zoneId}", (string zoneId) =>
{
    var map = ZoneMapGenerator.GenerateZone(zoneId);
    return Results.Ok(map);
});

// AUTHENTICATION APIS (Google & Custom Account Login)
app.MapPost("/api/v1/auth/google", async (GameDatabaseService db, GoogleAuthRequestDto req) =>
{
    var (user, characters) = await db.ProcessGoogleAuthAsync(req);
    return Results.Ok(new
    {
        success = true,
        user = new
        {
            id = user.Id,
            email = user.Email,
            name = user.Name,
            picture = user.PictureUrl
        },
        characters
    });
});

app.MapPost("/api/v1/auth/login", async (GameDatabaseService db, CustomLoginRequestDto req) =>
{
    var (user, characters) = await db.ProcessCustomLoginAsync(req.Username, req.Password, req.Email);
    return Results.Ok(new
    {
        success = true,
        user = new
        {
            id = user.Id,
            email = user.Email,
            name = user.Name,
            picture = user.PictureUrl
        },
        characters
    });
});

// MULTI-CHARACTER ROSTER APIS
app.MapGet("/api/v1/characters", async (GameDatabaseService db, string? accountId) =>
{
    var list = await db.GetAllCharactersAsync(accountId);
    return Results.Ok(list);
});

app.MapPost("/api/v1/characters", async (GameDatabaseService db, CharacterCreateDto req) =>
{
    var success = await db.CreateCharacterAsync(req);
    return success ? Results.Ok(new { success = true, id = req.Id }) : Results.BadRequest();
});

app.MapDelete("/api/v1/characters/{id}", async (GameDatabaseService db, string id) =>
{
    var success = await db.DeleteCharacterAsync(id);
    return success ? Results.Ok(new { success = true, id }) : Results.NotFound();
});

// SHARED STASH APIS
app.MapGet("/api/v1/stash", async (GameDatabaseService db, string? accountId) =>
{
    var acc = string.IsNullOrWhiteSpace(accountId) ? "guest" : accountId;
    var data = await db.GetSharedStashAsync(acc);
    return Results.Ok(data ?? new { gear = new List<object>(), currency = new Dictionary<string, int>(), gems = new List<object>() });
});

app.MapPost("/api/v1/stash", async (GameDatabaseService db, JsonElement payload, string? accountId) =>
{
    var acc = string.IsNullOrWhiteSpace(accountId) ? "guest" : accountId;
    var success = await db.SaveSharedStashAsync(payload, acc);
    return Results.Ok(new { success });
});

// SAVEGAME APIS
app.MapGet("/api/v1/savegame", async (GameDatabaseService db, string? characterId) =>
{
    var charId = string.IsNullOrWhiteSpace(characterId) ? "hero_default" : characterId;
    var savegame = await db.GetCharacterAsync(charId);
    return savegame is not null ? Results.Ok(savegame) : Results.NotFound(new { message = "No savegame found" });
});

app.MapPost("/api/v1/savegame", async (GameDatabaseService db, SaveGameDto payload) =>
{
    var success = await db.SaveCharacterAsync(payload);
    return Results.Ok(new { success, timestamp = DateTime.UtcNow.ToString("o") });
});

app.MapPost("/api/v1/savegame/reset", async (GameDatabaseService db, string? characterId) =>
{
    var charId = string.IsNullOrWhiteSpace(characterId) ? "hero_default" : characterId;
    await db.ResetSavegameAsync(charId);
    return Results.Ok(new { success = true, message = "Savegame reset successfully" });
});

// GENESIS FORGE BENCH & CRAFTING APIS
app.MapGet("/api/v1/craft/affixes", () =>
{
    return Results.Ok(new
    {
        prefixes = AffixPool.GetAvailablePrefixes(Array.Empty<string>()),
        suffixes = AffixPool.GetAvailableSuffixes(Array.Empty<string>())
    });
});

// MAP DEVICE & PINNACLE RIFT APIS
app.MapPost("/api/v1/rifts/open", (MapDeviceManager mapDevice, RiftOpenRequest req) =>
{
    mapDevice.ClearSlots();
    var map = new RiftMapEntity(req.ZoneName ?? "ForgottenCrypt", req.Tier, (ItemRarity)req.Rarity);
    if (req.Affixes != null)
    {
        foreach (var aff in req.Affixes)
        {
            map.AddAffix(new RiftMapAffix(aff.Key, aff.Description, aff.QuantityBonus, aff.RarityBonus, aff.PackSizeBonus));
        }
    }

    mapDevice.InsertPrimaryMap(map, out _);
    if (req.Fragments != null)
    {
        foreach (var frag in req.Fragments)
        {
            mapDevice.InsertFragment(frag, out _);
        }
    }

    var result = mapDevice.ActivateDevice();
    return Results.Ok(result);
});

// CELESTIAL DEVOTION APIS
app.MapGet("/api/v1/devotion/constellations", () =>
{
    return Results.Ok(DevotionTree.Constellations);
});

// AUTHORITATIVE PLAYER RESURRECTION APIS
app.MapPost("/api/v1/player/resurrect/town", (ResurrectionSessionManager resurrectionManager, TownResurrectRequest req) =>
{
    var result = resurrectionManager.ProcessTownResurrection(
        req.CharacterId ?? "hero_default",
        req.MaxLife > 0 ? req.MaxLife : 250f,
        req.MaxMana > 0 ? req.MaxMana : 120f,
        req.MaxEs > 0 ? req.MaxEs : 100f);
    return Results.Ok(result);
});

app.MapPost("/api/v1/player/resurrect/spot", (ResurrectionSessionManager resurrectionManager, SpotResurrectRequest req) =>
{
    int scrolls = req.ScrollCount;
    var result = resurrectionManager.ProcessSpotResurrection(
        req.CharacterId ?? "hero_default",
        req.ZoneId ?? "SanctuaryHaven",
        ref scrolls,
        req.MaxLife > 0 ? req.MaxLife : 250f,
        req.MaxMana > 0 ? req.MaxMana : 120f,
        req.MaxEs > 0 ? req.MaxEs : 100f);
    return Results.Ok(result);
});

app.MapGet("/api/v1/player/resurrect/status", (ResurrectionSessionManager resurrectionManager, string? characterId, string? zoneId) =>
{
    var charId = characterId ?? "hero_default";
    var zId = zoneId ?? "SanctuaryHaven";
    var remaining = resurrectionManager.GetRemainingZoneResurrections(charId, zId);
    return Results.Ok(new
    {
        characterId = charId,
        zoneId = zId,
        maxZoneResurrections = Mdg.Core.Features.Combat.PlayerDefeatState.MaxZoneResurrections,
        remainingZoneResurrections = remaining
    });
});

// MASTER DATA APIS (SERVER-AUTHORITATIVE & DB-BACKED)
app.MapGet("/api/v1/data/items", async (GameDatabaseService db) =>
{
    var items = await db.GetItemTemplatesAsync();
    return Results.Ok(items);
});

app.MapGet("/api/v1/data/skills", async (GameDatabaseService db) =>
{
    var skills = await db.GetSkillTemplatesAsync();
    return Results.Ok(skills);
});

app.MapGet("/api/v1/data/zones", async (GameDatabaseService db) =>
{
    var zones = await db.GetZoneTemplatesAsync();
    return Results.Ok(zones);
});

app.MapGet("/api/v1/data/campaign", async (GameDatabaseService db) =>
{
    var acts = await db.GetCampaignActsAsync();
    return Results.Ok(acts);
});

app.MapGet("/api/v1/data/monsters", async (GameDatabaseService db) =>
{
    var monsters = await db.GetMonsterTemplatesAsync();
    return Results.Ok(monsters);
});

app.MapGet("/api/v1/data/modifiers", async (GameDatabaseService db, string? category) =>
{
    var modifiers = await db.GetUnifiedModifiersAsync(category);
    return Results.Ok(modifiers);
});

app.MapGet("/api/v1/data/droptables", async (GameDatabaseService db, string? sourceKey) =>
{
    var dropTables = await db.GetDropTablesAsync(sourceKey);
    return Results.Ok(dropTables);
});

app.MapGet("/api/v1/data/family-mastery", async (GameDatabaseService db) =>
{
    var mastery = await db.GetFamilyMasterySystemAsync();
    return Results.Ok(mastery);
});

app.MapGet("/api/v1/data/quests", async (GameDatabaseService db, int? actNumber) =>
{
    var quests = await db.GetQuestTemplatesAsync(actNumber);
    return Results.Ok(quests);
});

app.MapGet("/api/v1/data/npcs", async (GameDatabaseService db, string? zoneId) =>
{
    var npcs = await db.GetNpcDialoguesAsync(zoneId);
    return Results.Ok(npcs);
});

app.MapGet("/api/v1/data/devotion", async (GameDatabaseService db) =>
{
    var devotion = await db.GetDevotionDataAsync();
    return Results.Ok(devotion);
});

// SERVER-AUTHORITATIVE GAMEPLAY LOGIC APIS
app.MapPost("/api/v1/loot/drop", (LootService lootService, LootDropRequestDto req) =>
{
    var result = lootService.GenerateDrops(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/forge/apply-currency", (ForgeService forgeService, ForgeRequestDto req) =>
{
    var result = forgeService.ApplyCurrency(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/forge/salvage", (ForgeService forgeService, SalvageRequestDto req) =>
{
    var result = forgeService.Salvage(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/forge/craft-base", (ForgeService forgeService, CraftBaseRequestDto req) =>
{
    var result = forgeService.CraftBaseEquipment(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/forge/smelt", (ForgeService forgeService, SmeltRequestDto req) =>
{
    var result = forgeService.Smelt(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/forge/brew-flask", (ForgeService forgeService, BrewFlaskRequestDto req) =>
{
    var result = forgeService.BrewFlask(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/professions/gather", (ProfessionService professionService, GatherResourceRequestDto req) =>
{
    var result = professionService.GatherResource(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/shadow/extract", (ShadowService shadowService, ExtractShadowRequestDto req) =>
{
    var result = shadowService.ExtractShadow(req);
    return Results.Ok(result);
});

app.MapGet("/api/v1/spire/floor/{floorNumber:int}", (SpireService spireService, int floorNumber) =>
{
    var result = spireService.GetFloor(floorNumber);
    return Results.Ok(result);
});

app.MapPost("/api/v1/spire/claim", (SpireService spireService, ClaimSpireFloorRequestDto req) =>
{
    var result = spireService.ClaimFloor(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/progression/gain-exp", (ProgressionService progressionService, ExpGainRequestDto req) =>
{
    var result = progressionService.CalculateExpGain(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/progression/ascendance/select", (ProgressionService progressionService, AscendanceSelectRequestDto req) =>
{
    var result = progressionService.SelectAscendance(req);
    return Results.Ok(result);
});

app.MapGet("/api/v1/mastery/monster-lore/bonus", (ProgressionService progressionService, int killCount, bool isBoss) =>
{
    var result = progressionService.GetMonsterLoreBonus(killCount, isBoss);
    return Results.Ok(result);
});

app.MapPost("/api/v1/character/calculate-stats", (CharacterStatService statService, CharacterStatsRequestDto req) =>
{
    var result = statService.CalculateStats(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/skills/validate-tree", (SkillProgressionService skillService, SkillValidationRequestDto req) =>
{
    var result = skillService.ValidateSkillAllocations(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/skills/node/allocate", (SkillProgressionService skillService, SkillNodeActionRequestDto req) =>
{
    var result = skillService.AllocateNode(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/skills/tree/respec", (SkillProgressionService skillService, SkillTreeRespecRequestDto req) =>
{
    var result = skillService.RespecTree(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/skills/level-up", (SkillProgressionService skillService, SkillLevelUpRequestDto req) =>
{
    var result = skillService.LevelUpSkill(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/craft/mastery/add-exp", (ForgeService forgeService, CraftingExpRequestDto req) =>
{
    var result = forgeService.AddCraftingExp(req);
    return Results.Ok(result);
});

app.MapGet("/api/v1/craft/mastery/perks", (ForgeService forgeService, int level, long exp) =>
{
    var result = forgeService.GetCraftingPerks(level, exp);
    return Results.Ok(result);
});

app.MapPost("/api/v1/economy/pet-sell", (EconomyService economyService, PetSellRequestDto req) =>
{
    var result = economyService.ProcessPetDelivery(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/quests/claim", async (QuestService questService, QuestClaimRequestDto req) =>
{
    var result = await questService.ClaimQuestRewardAsync(req);
    return Results.Ok(result);
});

app.MapPost("/api/v1/devotion/validate", async (DevotionService devotionService, DevotionValidationRequestDto req) =>
{
    var result = await devotionService.ValidateDevotionAllocationsAsync(req);
    return Results.Ok(result);
});

// ASYNCHRONOUS MARKETPLACE (HAVEN TRADE BOARD) APIS
app.MapGet("/api/v1/market/listings", async (GameDatabaseService db, string? category, string? search, string? rarity, int? page, int? pageSize) =>
{
    var listings = await db.GetMarketListingsAsync(category, search, rarity, page ?? 1, pageSize ?? 50);
    return Results.Ok(listings);
});

app.MapGet("/api/v1/market/my-listings", async (GameDatabaseService db, string? accountId) =>
{
    var acc = string.IsNullOrWhiteSpace(accountId) ? "guest" : accountId;
    var listings = await db.GetMyMarketListingsAsync(acc);
    return Results.Ok(listings);
});

app.MapPost("/api/v1/market/list", async (GameDatabaseService db, MarketService marketService, MarketCreateListingDto req) =>
{
    if (!marketService.ValidateListing(req.ItemJson ?? "{}", req.PriceAmount, req.PriceCurrency ?? "fracture_core", out var errMsg))
    {
        return Results.BadRequest(new { success = false, message = errMsg });
    }

    int taxGold = marketService.CalculateListingTax(req.PriceAmount, req.PriceCurrency ?? "fracture_core");
    var entity = new MarketListingEntity
    {
        Id = Guid.NewGuid().ToString("N"),
        SellerAccountId = req.AccountId ?? "guest",
        SellerCharacterName = req.CharacterName ?? "Adventurer",
        ItemJson = req.ItemJson ?? "{}",
        ItemName = req.ItemName ?? "Item",
        ItemRarity = req.ItemRarity ?? "Normal",
        ItemCategory = req.ItemCategory ?? "General",
        ItemLevel = req.ItemLevel > 0 ? req.ItemLevel : 1,
        PriceAmount = req.PriceAmount,
        PriceCurrency = (req.PriceCurrency ?? "fracture_core").ToLower(),
        TaxGold = taxGold,
        Status = 1,
        CreatedAt = DateTime.UtcNow.ToString("o"),
        ExpireAt = DateTime.UtcNow.AddDays(7).ToString("o")
    };

    var success = await db.CreateMarketListingAsync(entity);
    return Results.Ok(new { success, listing = entity, taxGold });
});

app.MapPost("/api/v1/market/buy", async (GameDatabaseService db, MarketBuyRequestDto req) =>
{
    var (success, message, listing) = await db.BuyMarketListingAsync(req.ListingId, req.BuyerAccountId ?? "guest", req.BuyerCharacterName ?? "Hero");
    return success ? Results.Ok(new { success, message, listing }) : Results.BadRequest(new { success, message });
});

app.MapPost("/api/v1/market/cancel", async (GameDatabaseService db, MarketCancelRequestDto req) =>
{
    var (success, message, listing) = await db.CancelMarketListingAsync(req.ListingId, req.SellerAccountId ?? "guest");
    return success ? Results.Ok(new { success, message, listing }) : Results.BadRequest(new { success, message });
});

// Seed Master Database on Startup if needed
var dbContextFactory = app.Services.GetRequiredService<IDbContextFactory<MdgDbContext>>();
await DatabaseSeeder.SeedAllAsync(dbContextFactory);

app.Run();

public record RiftAffixDto(string Key, string Description, float QuantityBonus, float RarityBonus, float PackSizeBonus);
public record RiftOpenRequest(string? ZoneName, int Tier, int Rarity, List<RiftAffixDto>? Affixes, List<string>? Fragments);
public record TownResurrectRequest(string? CharacterId, float MaxLife, float MaxMana, float MaxEs);
public record SpotResurrectRequest(string? CharacterId, string? ZoneId, int ScrollCount, float MaxLife, float MaxMana, float MaxEs);
public record MarketCreateListingDto(string? AccountId, string? CharacterName, string? ItemJson, string? ItemName, string? ItemRarity, string? ItemCategory, int ItemLevel, int PriceAmount, string? PriceCurrency);
public record MarketBuyRequestDto(string ListingId, string? BuyerAccountId, string? BuyerCharacterName);
public record MarketCancelRequestDto(string ListingId, string? SellerAccountId);

