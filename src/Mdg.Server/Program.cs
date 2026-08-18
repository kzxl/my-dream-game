using Mdg.Core.Features.Maps;
using Mdg.Server.Database;
using Mdg.Server.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Ensure Database file path
var dataDir = builder.Environment.ContentRootPath;
var dbPath = Path.Combine(dataDir, "mdg_world.db");

// Register EF Core DbContextFactory & Services
builder.Services.AddDbContextFactory<MdgDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddSingleton<GameDatabaseService>();
builder.Services.AddSingleton<GameSessionService>();
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
    var items = await db.GetSharedStashAsync();
    return Results.Ok(items);
});

app.MapPost("/api/v1/stash", async (GameDatabaseService db, List<object> items) =>
{
    var success = await db.SaveSharedStashAsync(items);
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

app.Run();
