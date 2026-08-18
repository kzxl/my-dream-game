using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Mdg.Server.Services
{
    public sealed class SkillProgressionService
    {
        public SkillValidationResultDto ValidateSkillAllocations(SkillValidationRequestDto req)
        {
            int playerLevel = Math.Max(1, req.PlayerLevel);
            int maxAllowedSkillPoints = playerLevel; // 1 point per level

            var allocated = req.AllocatedNodeIds ?? new List<string>();
            int usedPoints = allocated.Count;
            bool valid = usedPoints <= maxAllowedSkillPoints;

            string message = valid
                ? $"Skill board valid: {usedPoints}/{maxAllowedSkillPoints} points allocated."
                : $"Invalid allocation: used {usedPoints} points but player level {playerLevel} only allows {maxAllowedSkillPoints}.";

            return new SkillValidationResultDto(
                valid,
                message,
                usedPoints,
                maxAllowedSkillPoints,
                Math.Max(0, maxAllowedSkillPoints - usedPoints));
        }
    }

    public record SkillValidationRequestDto(
        int PlayerLevel,
        string? ClassSpec,
        List<string>? AllocatedNodeIds,
        Dictionary<string, string>? SelectedMasteries);

    public record SkillValidationResultDto(
        bool Valid,
        string Message,
        int AllocatedPoints,
        int MaxPoints,
        int RemainingPoints);
}
