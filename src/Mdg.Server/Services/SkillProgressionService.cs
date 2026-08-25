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
        public SkillNodeActionResultDto AllocateNode(SkillNodeActionRequestDto req)
        {
            var allocated = req.AllocatedNodeIds != null ? new List<string>(req.AllocatedNodeIds) : new List<string>();
            int skillLevel = Math.Clamp(req.SkillLevel, 1, 30);
            int nodeCost = Math.Max(1, req.NodeCost);

            if (allocated.Contains(req.NodeId ?? ""))
            {
                return new SkillNodeActionResultDto(false, "Node already allocated", allocated, skillLevel - allocated.Count);
            }

            int currentSpent = allocated.Count; // Assuming 1 SMP per node or accumulated costs
            if (currentSpent + nodeCost > skillLevel)
            {
                return new SkillNodeActionResultDto(false, "Not enough Skill Mastery Points (SMP)", allocated, skillLevel - currentSpent);
            }

            if (!string.IsNullOrWhiteSpace(req.NodeId))
            {
                allocated.Add(req.NodeId);
            }

            return new SkillNodeActionResultDto(true, "Node allocated successfully", allocated, skillLevel - allocated.Count);
        }

        public SkillNodeActionResultDto RespecTree(SkillTreeRespecRequestDto req)
        {
            int skillLevel = Math.Clamp(req.SkillLevel, 1, 30);
            return new SkillNodeActionResultDto(true, "Skill tree respec completed", new List<string>(), skillLevel);
        }

        public SkillLevelUpResultDto LevelUpSkill(SkillLevelUpRequestDto req)
        {
            int currentLevel = Math.Clamp(req.CurrentLevel, 1, 30);
            int playerSkillPoints = Math.Max(0, req.PlayerSkillPoints);

            if (playerSkillPoints <= 0)
            {
                return new SkillLevelUpResultDto(false, "No available Skill Points", currentLevel, playerSkillPoints, 0);
            }

            if (currentLevel >= 30)
            {
                return new SkillLevelUpResultDto(false, "Skill already at maximum level", currentLevel, playerSkillPoints, 0);
            }

            int newLevel = currentLevel + 1;
            long newExpToNext = (long)Math.Round(120.0 * Math.Pow(1.35, newLevel - 1));

            return new SkillLevelUpResultDto(
                true,
                "Skill leveled up",
                newLevel,
                playerSkillPoints - 1,
                newExpToNext);
        }
    }

    public record SkillNodeActionRequestDto(
        string? SkillKey,
        string? NodeId,
        int NodeCost,
        int SkillLevel,
        List<string>? AllocatedNodeIds);

    public record SkillNodeActionResultDto(
        [property: JsonPropertyName("success")] bool Success,
        [property: JsonPropertyName("message")] string Message,
        [property: JsonPropertyName("allocatedNodeIds")] List<string> AllocatedNodeIds,
        [property: JsonPropertyName("remainingSmp")] int RemainingSmp);

    public record SkillTreeRespecRequestDto(
        string? SkillKey,
        int SkillLevel);

    public record SkillLevelUpRequestDto(
        string? SkillKey,
        int CurrentLevel,
        int PlayerSkillPoints);

    public record SkillLevelUpResultDto(
        [property: JsonPropertyName("success")] bool Success,
        [property: JsonPropertyName("message")] string Message,
        [property: JsonPropertyName("newLevel")] int NewLevel,
        [property: JsonPropertyName("remainingPlayerSkillPoints")] int RemainingPlayerSkillPoints,
        [property: JsonPropertyName("newExpToNext")] long NewExpToNext);

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
