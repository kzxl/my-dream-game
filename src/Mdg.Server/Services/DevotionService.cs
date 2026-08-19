using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Mdg.Server.Database;
using Microsoft.EntityFrameworkCore;

namespace Mdg.Server.Services
{
    public sealed class DevotionService
    {
        private readonly IDbContextFactory<MdgDbContext> _dbFactory;

        public DevotionService(IDbContextFactory<MdgDbContext> dbFactory)
        {
            _dbFactory = dbFactory;
        }

        public async Task<DevotionValidationResultDto> ValidateDevotionAllocationsAsync(DevotionValidationRequestDto req)
        {
            await using var db = await _dbFactory.CreateDbContextAsync();
            var allNodes = await db.DevotionNodes.AsNoTracking().ToDictionaryAsync(n => n.Id);

            var requestedNodeIds = req.AllocatedNodeIds ?? new List<string>();
            var validAllocations = new List<string>();
            var accumulatedStats = new Dictionary<string, float>();
            var activeProcs = new List<string>();

            int maxPoints = req.TotalDevotionPoints > 0 ? req.TotalDevotionPoints : 8;

            foreach (var nodeId in requestedNodeIds)
            {
                if (!allNodes.TryGetValue(nodeId, out var node)) continue;

                // Check parent prerequisite
                if (!node.IsRoot && !string.IsNullOrWhiteSpace(node.ParentNodeId))
                {
                    if (!validAllocations.Contains(node.ParentNodeId) && node.ParentNodeId != "nexus_root")
                    {
                        continue;
                    }
                }

                if (validAllocations.Count >= maxPoints && !node.IsRoot)
                {
                    break;
                }

                validAllocations.Add(node.Id);

                // Accumulate stat bonuses
                if (!string.IsNullOrWhiteSpace(node.StatKey))
                {
                    if (accumulatedStats.ContainsKey(node.StatKey))
                        accumulatedStats[node.StatKey] += node.StatValue;
                    else
                        accumulatedStats[node.StatKey] = node.StatValue;
                }

                if (node.IsProc && !string.IsNullOrWhiteSpace(node.StringValue))
                {
                    activeProcs.Add(node.StringValue);
                }
            }

            int spentPoints = validAllocations.Count(id => allNodes.TryGetValue(id, out var n) && !n.IsRoot);
            int remainingPoints = Math.Max(0, maxPoints - spentPoints);

            return new DevotionValidationResultDto(
                true,
                validAllocations,
                spentPoints,
                remainingPoints,
                accumulatedStats,
                activeProcs);
        }
    }

    public record DevotionValidationRequestDto(
        string? CharacterId,
        int TotalDevotionPoints,
        List<string>? AllocatedNodeIds);

    public record DevotionValidationResultDto(
        [property: JsonPropertyName("success")] bool Success,
        [property: JsonPropertyName("allocatedNodeIds")] List<string> AllocatedNodeIds,
        [property: JsonPropertyName("spentPoints")] int SpentPoints,
        [property: JsonPropertyName("remainingPoints")] int RemainingPoints,
        [property: JsonPropertyName("accumulatedStats")] Dictionary<string, float> AccumulatedStats,
        [property: JsonPropertyName("activeProcs")] List<string> ActiveProcs);
}
