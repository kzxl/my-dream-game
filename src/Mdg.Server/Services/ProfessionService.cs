using System;
using System.Collections.Generic;
using Mdg.Core.Features.Professions;

namespace Mdg.Server.Services
{
    public sealed class ProfessionService
    {
        private static readonly Dictionary<string, ResourceNodeDefinition> NodeCatalog = new()
        {
            // Mining
            ["node_silica_sand"] = new("node_silica_sand", "mining", 1, "mat_silica_sand", 3, 6, 20),
            ["node_iron_ore"] = new("node_iron_ore", "mining", 1, "mat_iron_ore", 2, 4, 25),
            ["node_mithril"] = new("node_mithril", "mining", 10, "mat_mithril_chunk", 2, 3, 50),
            ["node_aether_crystal"] = new("node_aether_crystal", "mining", 25, "mat_aether_crystal", 2, 3, 80),
            ["node_adamantite"] = new("node_adamantite", "mining", 40, "mat_adamantite_ingot", 1, 2, 120),

            // Herbalism
            ["node_blood_herb"] = new("node_blood_herb", "herbalism", 1, "mat_blood_herb", 3, 5, 20),
            ["node_mana_bloom"] = new("node_mana_bloom", "herbalism", 1, "mat_mana_bloom", 3, 5, 20),
            ["node_wind_leaf"] = new("node_wind_leaf", "herbalism", 10, "mat_wind_leaf", 2, 4, 45),
            ["node_frost_core"] = new("node_frost_core", "herbalism", 25, "mat_frost_core", 1, 3, 75),
            ["node_genesis_lotus"] = new("node_genesis_lotus", "herbalism", 40, "mat_shard_genesis", 1, 2, 130),

            // Skinning / Hunting
            ["node_beast_carcass"] = new("node_beast_carcass", "skinning", 1, "mat_beast_leather", 2, 4, 25),
            ["node_wyrm_scales"] = new("node_wyrm_scales", "skinning", 25, "mat_aether_crystal", 2, 4, 85)
        };

        public GatherResourceResultDto GatherResource(GatherResourceRequestDto req)
        {
            var nodeKey = req.NodeId ?? "";
            if (!NodeCatalog.TryGetValue(nodeKey, out var nodeDef))
            {
                // Fallback default node
                nodeDef = new ResourceNodeDefinition(nodeKey, req.ProfessionType ?? "mining", 1, "mat_iron_ore", 2, 4, 20);
            }

            int profLevel = Math.Max(1, req.ProfessionLevel);
            int currentExp = Math.Max(0, req.CurrentExp);

            if (!GatheringProfessionEngine.CanGatherNode(profLevel, nodeDef.RequiredLevel, out var errorMessage))
            {
                return new GatherResourceResultDto(false, errorMessage, "", 0, 0, profLevel, currentExp, false);
            }

            int yield = GatheringProfessionEngine.CalculateYield(profLevel, nodeDef.MinYield, nodeDef.MaxYield);
            int expGain = nodeDef.ExpGain;

            var profData = new ProfessionData(nodeDef.ProfType, nodeDef.ProfType, "⛏️", profLevel)
            {
                CurrentExp = currentExp
            };

            bool leveledUp = false;
            profData.AddExp(expGain, out leveledUp);

            string msg = leveledUp
                ? $"🎉 Profession Level Up! {nodeDef.ProfType.ToUpper()} reached Lv.{profData.Level}! Harvested {yield}x {nodeDef.YieldMatId}."
                : $"Harvested {yield}x {nodeDef.YieldMatId} (+{expGain} Exp).";

            return new GatherResourceResultDto(
                true,
                msg,
                nodeDef.YieldMatId,
                yield,
                expGain,
                profData.Level,
                profData.CurrentExp,
                leveledUp);
        }

        private sealed record ResourceNodeDefinition(
            string Id,
            string ProfType,
            int RequiredLevel,
            string YieldMatId,
            int MinYield,
            int MaxYield,
            int ExpGain);
    }

    public record GatherResourceRequestDto(
        string? NodeId,
        string? ProfessionType,
        int ProfessionLevel,
        int CurrentExp);

    public record GatherResourceResultDto(
        bool Success,
        string Message,
        string YieldMatId,
        int YieldQuantity,
        int ExpGained,
        int NewProfessionLevel,
        int NewExp,
        bool LeveledUp);
}
