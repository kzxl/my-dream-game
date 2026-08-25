using System;
using System.Collections.Generic;
using System.Linq;
using Mdg.Core.Features.Combat;

namespace Mdg.Server.Services
{
    public sealed class ShadowService
    {
        public ExtractShadowResultDto ExtractShadow(ExtractShadowRequestDto req)
        {
            var armyEntities = req.CurrentArmy?.Select(dto => new ShadowSoldierEntity
            {
                Id = dto.Id ?? Guid.NewGuid().ToString("N"),
                Name = dto.Name ?? "Shadow Soldier",
                MonsterType = dto.MonsterType ?? "monster",
                Rarity = dto.Rarity ?? "Normal",
                MaxLife = dto.MaxLife,
                CurrentLife = dto.CurrentLife,
                Damage = dto.Damage,
                Duration = dto.Duration,
                Icon = dto.Icon ?? "👤"
            }).ToList() ?? new List<ShadowSoldierEntity>();

            int maxCap = req.MaxCapacity > 0 ? req.MaxCapacity : ShadowExtractionEngine.DEFAULT_MAX_SHADOW_ARMY;

            bool success = ShadowExtractionEngine.TryExtractShadow(
                req.MonsterName ?? "Fiend",
                req.MonsterType ?? "beast",
                req.Rarity ?? "Normal",
                req.BaseLife > 0 ? req.BaseLife : 500,
                req.BaseDamage > 0 ? req.BaseDamage : 50,
                armyEntities,
                maxCap,
                out var soldier,
                out var message);

            var updatedArmyDtos = armyEntities.Select(s => new ShadowSoldierDto
            {
                Id = s.Id,
                Name = s.Name,
                MonsterType = s.MonsterType,
                Rarity = s.Rarity,
                MaxLife = s.MaxLife,
                CurrentLife = s.CurrentLife,
                Damage = s.Damage,
                Duration = s.Duration,
                Icon = s.Icon
            }).ToList();

            ShadowSoldierDto? newSoldierDto = soldier != null ? new ShadowSoldierDto
            {
                Id = soldier.Id,
                Name = soldier.Name,
                MonsterType = soldier.MonsterType,
                Rarity = soldier.Rarity,
                MaxLife = soldier.MaxLife,
                CurrentLife = soldier.CurrentLife,
                Damage = soldier.Damage,
                Duration = soldier.Duration,
                Icon = soldier.Icon
            } : null;

            return new ExtractShadowResultDto(success, message, newSoldierDto, updatedArmyDtos);
        }
    }

    public record ShadowSoldierDto
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? MonsterType { get; set; }
        public string? Rarity { get; set; }
        public int MaxLife { get; set; }
        public int CurrentLife { get; set; }
        public int Damage { get; set; }
        public float Duration { get; set; }
        public string? Icon { get; set; }
    }

    public record ExtractShadowRequestDto(
        string? MonsterName,
        string? MonsterType,
        string? Rarity,
        int BaseLife,
        int BaseDamage,
        List<ShadowSoldierDto>? CurrentArmy,
        int MaxCapacity);

    public record ExtractShadowResultDto(
        bool Success,
        string Message,
        ShadowSoldierDto? ExtractedSoldier,
        List<ShadowSoldierDto> Army);
}
