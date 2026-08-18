using System;
using System.IO;
using Mdg.Server.Database;
using Mdg.Server.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Ensure Database file path
var dataDir = builder.Environment.ContentRootPath;
var dbPath = Path.Combine(dataDir, "mdg_world.db");

// Register Services
builder.Services.AddSingleton(new GameDatabaseService(dbPath));
builder.Services.AddSingleton<GameSessionService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<GameSessionService>());

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Health Check API
app.MapGet("/api/v1/health", () => new
{
    status = "Online",
    game = "My Dream Game (MDG) Server",
    tickRate = 30
});

// MULTI-CHARACTER APIS
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
