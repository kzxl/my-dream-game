using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using Mdg.Core.Common.Math;
using Mdg.Core.Entities;
using Mdg.Core.Engine;
using Mdg.Core.Features.Skills;
using Mdg.Core.Features.Combat;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Mdg.Server.Services
{
    public interface IGameSessionService
    {
        GameWorld World { get; }
        Character CreateCharacter(string name);
        Character? GetCharacter(Guid id);
    }

    /// <summary>
    /// Background Service chạy Authoritative Game Loop (30 Ticks/s) trên Server.
    /// </summary>
    public sealed class GameSessionService : BackgroundService, IGameSessionService
    {
        private readonly ILogger<GameSessionService> _logger;
        private readonly ConcurrentDictionary<Guid, Character> _characters = new();

        public GameWorld World { get; }

        public GameSessionService(ILogger<GameSessionService> logger)
        {
            _logger = logger;
            World = new GameWorld();
            World.Initialize();
        }

        public Character CreateCharacter(string name)
        {
            var character = new Character(name);

            // Gán 1 skill cơ bản ví dụ: Fireball
            var fireball = new SkillDefinition(
                id: "fireball",
                name: "Fireball",
                targetType: SkillTargetType.Direction,
                baseCooldown: 1.5f,
                manaCost: 10f,
                range: 15f,
                radius: 3f
            ).AddDamage(DamageType.Fire, 45f);

            character.Skills.AddSkill(fireball);
            _characters[character.Id] = character;
            return character;
        }

        public Character? GetCharacter(Guid id)
        {
            _characters.TryGetValue(id, out var character);
            return character;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("GameSessionService Authoritative Tick Loop started at 30 Ticks/s.");
            const float tickIntervalSeconds = 1f / 30f;
            var interval = TimeSpan.FromSeconds(tickIntervalSeconds);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    World.Step(tickIntervalSeconds);

                    // Cập nhật tất cả entities
                    foreach (var character in _characters.Values)
                    {
                        character.Update(tickIntervalSeconds, World.EventBus, World.CurrentTick);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during authoritative game tick.");
                }

                await Task.Delay(interval, stoppingToken);
            }

            World.Shutdown();
            _logger.LogInformation("GameSessionService stopped.");
        }
    }
}
