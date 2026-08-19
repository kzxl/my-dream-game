using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Mdg.Server.Database;
using Microsoft.EntityFrameworkCore;

namespace Mdg.Server.Services
{
    public sealed class QuestService
    {
        private readonly IDbContextFactory<MdgDbContext> _dbFactory;

        public QuestService(IDbContextFactory<MdgDbContext> dbFactory)
        {
            _dbFactory = dbFactory;
        }

        public async Task<QuestClaimResultDto> ClaimQuestRewardAsync(QuestClaimRequestDto req)
        {
            if (string.IsNullOrWhiteSpace(req.QuestId))
            {
                return new QuestClaimResultDto(false, "Invalid quest ID.", 0, 0, 0, 0, false, null);
            }

            await using var db = await _dbFactory.CreateDbContextAsync();
            var quest = await db.QuestTemplates.AsNoTracking().FirstOrDefaultAsync(q => q.Id == req.QuestId);
            if (quest == null)
            {
                return new QuestClaimResultDto(false, $"Quest '{req.QuestId}' not found.", 0, 0, 0, 0, false, null);
            }

            int exp = 0;
            int gold = 0;
            int skillPoints = 0;
            int devotionPoints = 0;
            bool ascendance = false;
            string? rewardItemId = null;
            LootItemDto? rewardItem = null;

            try
            {
                using var doc = JsonDocument.Parse(quest.RewardsJson);
                var root = doc.RootElement;
                if (root.TryGetProperty("exp", out var expProp)) exp = expProp.GetInt32();
                if (root.TryGetProperty("gold", out var goldProp)) gold = goldProp.GetInt32();
                if (root.TryGetProperty("skillPoints", out var spProp)) skillPoints = spProp.GetInt32();
                if (root.TryGetProperty("devotionPoints", out var dpProp)) devotionPoints = dpProp.GetInt32();
                if (root.TryGetProperty("ascendanceUnlocked", out var ascProp)) ascendance = ascProp.GetBoolean();
                if (root.TryGetProperty("itemTemplateId", out var itemProp)) rewardItemId = itemProp.GetString();
            }
            catch { }

            if (!string.IsNullOrWhiteSpace(rewardItemId))
            {
                var template = await db.ItemTemplates.AsNoTracking().FirstOrDefaultAsync(i => i.Id == rewardItemId);
                if (template != null)
                {
                    rewardItem = new LootItemDto
                    {
                        Id = "reward_" + Guid.NewGuid().ToString("N")[..8],
                        Name = template.Name,
                        BaseType = template.BaseType,
                        Rarity = template.Rarity,
                        Slot = template.Slot.ToLowerInvariant(),
                        ItemLevel = Math.Max(1, template.MinIlvl),
                        Icon = template.Icon,
                        BeamHeight = 350
                    };
                }
            }

            return new QuestClaimResultDto(
                true,
                $"Completed quest '{quest.Title}'! Received {exp} EXP, {gold} Gold.",
                exp,
                gold,
                skillPoints,
                devotionPoints,
                ascendance,
                rewardItem);
        }
    }

    public record QuestClaimRequestDto(
        string? CharacterId,
        string? QuestId);

    public record QuestClaimResultDto(
        [property: JsonPropertyName("success")] bool Success,
        [property: JsonPropertyName("message")] string Message,
        [property: JsonPropertyName("exp")] int Exp,
        [property: JsonPropertyName("gold")] int Gold,
        [property: JsonPropertyName("skillPoints")] int SkillPoints,
        [property: JsonPropertyName("devotionPoints")] int DevotionPoints,
        [property: JsonPropertyName("ascendanceUnlocked")] bool AscendanceUnlocked,
        [property: JsonPropertyName("rewardItem")] LootItemDto? RewardItem);
}
