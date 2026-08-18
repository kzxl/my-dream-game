using Mdg.Core.Features.Companion;
using Mdg.Core.Features.Items;
using Mdg.Core.Features.Items.Crafting;
using Mdg.Core.Features.Maps;
using Mdg.Core.Features.Progression;
using Mdg.Server.Database;
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

// Register EF Core DbContextFactory & Services
builder.Services.AddDbContextFactory<MdgDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddSingleton<GameDatabaseService>();
builder.Services.AddSingleton<GameSessionService>();
builder.Services.AddSingleton<CompanionManager>();
builder.Services.AddSingleton<GenesisForgeBench>();
builder.Services.AddSingleton<GenesisCraftingEngine>();
builder.Services.AddSingleton<MapDeviceManager>();
builder.Services.AddSingleton<DevotionTree>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<GameSessionService>());

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Health Check API
app.MapGet("/api/v1/health", () => new
{
    status = "Online",
    game = "My Dream Game (MDG) Server (EF Core)",
    tickRate = 30
});

// ZONE MAP GENERATION APIS
app.MapGet("/api/v1/zones/{zoneId}", (string zoneId) =>
{
    var map = ZoneMapGenerator.GenerateZone(zoneId);
    return Results.Ok(map);
});

// MULTI-CHARACTER ROSTER APIS
app.MapGet("/api/v1/characters", async (GameDatabaseService db) =>
{
    var list = await db.GetAllCharactersAsync();
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
app.MapGet("/api/v1/stash", async (GameDatabaseService db) =>
{
    var data = await db.GetSharedStashAsync();
    return Results.Ok(data ?? new { gear = new List<object>(), currency = new Dictionary<string, int>(), gems = new List<object>() });
});

app.MapPost("/api/v1/stash", async (GameDatabaseService db, JsonElement payload) =>
{
    var success = await db.SaveSharedStashAsync(payload);
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

app.Run();

public record RiftAffixDto(string Key, string Description, float QuantityBonus, float RarityBonus, float PackSizeBonus);
public record RiftOpenRequest(string? ZoneName, int Tier, int Rarity, List<RiftAffixDto>? Affixes, List<string>? Fragments);
