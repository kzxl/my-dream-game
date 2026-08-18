using Mdg.Client.Adapter.ViewModels;
using Mdg.Core.Common.Math;
using Mdg.Core.Features.Combat;
using Mdg.Server.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<GameSessionService>();
builder.Services.AddSingleton<IGameSessionService>(sp => sp.GetRequiredService<GameSessionService>());
builder.Services.AddHostedService(sp => sp.GetRequiredService<GameSessionService>());

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// Health Check
app.MapGet("/", () => new { status = "Online", game = "My Dream Game (MDG) Server", tickRate = 30 });

// 1. Tạo Character
app.MapPost("/api/v1/characters", (CreateCharacterRequest req, IGameSessionService gameService) =>
{
    var character = gameService.CreateCharacter(req.Name);
    var vm = new CharacterViewModel(character);
    return Results.Ok(new
    {
        characterId = vm.Id,
        name = vm.Name,
        life = vm.CurrentLife,
        maxLife = vm.MaxLife,
        mana = vm.CurrentMana,
        maxMana = vm.MaxMana,
        skills = vm.GetSkillStatuses()
    });
});

// 2. Lấy trạng thái Character (ViewModel)
app.MapGet("/api/v1/characters/{id:guid}", (Guid id, IGameSessionService gameService) =>
{
    var character = gameService.GetCharacter(id);
    if (character == null) return Results.NotFound(new { error = "Character not found" });

    var vm = new CharacterViewModel(character);
    return Results.Ok(new
    {
        id = vm.Id,
        name = vm.Name,
        isAlive = vm.IsAlive,
        life = vm.CurrentLife,
        maxLife = vm.MaxLife,
        mana = vm.CurrentMana,
        maxMana = vm.MaxMana,
        energyShield = vm.CurrentEnergyShield,
        maxEnergyShield = vm.MaxEnergyShield,
        resists = new
        {
            fire = vm.FireResistance,
            cold = vm.ColdResistance,
            lightning = vm.LightningResistance,
            chaos = vm.ChaosResistance
        },
        skills = vm.GetSkillStatuses()
    });
});

// 3. Thi triển Skill
app.MapPost("/api/v1/characters/{id:guid}/cast-skill", (Guid id, CastSkillRequest req, IGameSessionService gameService) =>
{
    var character = gameService.GetCharacter(id);
    if (character == null) return Results.NotFound(new { error = "Character not found" });

    var targetPos = new FixVector2(req.TargetX, req.TargetY);
    bool success = character.CastSkill(req.SkillId, targetPos, gameService.World.EventBus, gameService.World.CurrentTick);

    return Results.Ok(new
    {
        success,
        remainingMana = character.CurrentMana,
        targetPos = targetPos.ToString()
    });
});

app.Run();

public record CreateCharacterRequest(string Name);
public record CastSkillRequest(string SkillId, float TargetX, float TargetY);
