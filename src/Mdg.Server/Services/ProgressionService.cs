using System;
using System.Collections.Generic;
using Mdg.Core.Features.Progression;

namespace Mdg.Server.Services
{
    public sealed class ProgressionService
    {
        public AscendanceSelectResultDto SelectAscendance(AscendanceSelectRequestDto req)
        {
            var manager = new AscendanceManager();
            manager.SetLevel(req.CharacterLevel);

            if (req.IsTrialCompleted)
            {
                manager.CompleteTrialOfGenesis();
            }

            if (!Enum.TryParse<AscendanceArchetype>(req.Archetype, true, out var archetype))
            {
                return new AscendanceSelectResultDto(false, $"Invalid archetype '{req.Archetype}'.", "", "", new());
            }

            if (!manager.SelectArchetype(archetype, out var message))
            {
                return new AscendanceSelectResultDto(false, message, "", "", new());
            }

            var keystones = new List<string>();
            foreach (var k in manager.ActiveKeystones)
            {
                keystones.Add(k.ToString());
            }

            return new AscendanceSelectResultDto(
                true,
                message,
                archetype.ToString(),
                manager.Tier.ToString(),
                keystones);
        }

        public MonsterLoreBonusDto GetMonsterLoreBonus(int killCount, bool isBoss)
        {
            var bonus = MonsterLoreMastery.GetBonus(killCount, isBoss);
            return new MonsterLoreBonusDto
            {
                Tier = (int)bonus.Tier,
                TierTitle = bonus.TierTitle,
                BonusDamagePercent = bonus.BonusDamagePercent,
                BonusCritChance = bonus.BonusCritChance,
                BonusCritMulti = bonus.BonusCritMulti,
                DamageReductionPercent = bonus.DamageReductionPercent,
                BonusIir = bonus.BonusIir,
                BonusIiq = bonus.BonusIiq
            };
        }
    }

    public record AscendanceSelectRequestDto(
        int CharacterLevel,
        string? Archetype,
        bool IsTrialCompleted,
        string? CharacterId);

    public record AscendanceSelectResultDto(
        bool Success,
        string Message,
        string Archetype,
        string Tier,
        List<string> ActiveKeystones);

    public class MonsterLoreBonusDto
    {
        public int Tier { get; set; }
        public string TierTitle { get; set; } = string.Empty;
        public float BonusDamagePercent { get; set; }
        public float BonusCritChance { get; set; }
        public float BonusCritMulti { get; set; }
        public float DamageReductionPercent { get; set; }
        public float BonusIir { get; set; }
        public float BonusIiq { get; set; }
    }
}
