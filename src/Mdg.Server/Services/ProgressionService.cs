using System;
using System.Collections.Generic;
using Mdg.Core.Features.Progression;

namespace Mdg.Server.Services
{
    public sealed class ProgressionService
    {
        public ExpGainResultDto CalculateExpGain(ExpGainRequestDto req)
        {
            int level = Math.Clamp(req.CurrentLevel, 1, 100);
            long currentExp = Math.Max(0, req.CurrentExp);
            long expGained = Math.Max(0, req.ExpGained);

            currentExp += expGained;
            int levelsGained = 0;
            int spGained = 0;
            float lifeGain = 0;
            float manaGain = 0;

            long expToNext = GetExpRequiredForLevel(level);

            int safetyLoops = 0;
            while (currentExp >= expToNext && level < 100 && safetyLoops < 100)
            {
                safetyLoops++;
                currentExp -= expToNext;
                level++;
                levelsGained++;
                spGained++;
                lifeGain += 25;
                manaGain += 12;
                expToNext = GetExpRequiredForLevel(level);
            }

            if (level >= 100)
            {
                currentExp = 0;
                expToNext = 0;
            }

            return new ExpGainResultDto
            {
                NewLevel = level,
                NewExp = currentExp,
                ExpToNext = expToNext,
                LevelsGained = levelsGained,
                SkillPointsGained = spGained,
                MaxLifeGain = lifeGain,
                MaxManaGain = manaGain,
                LeveledUp = levelsGained > 0,
                EligibleForAscendance = level >= 10 && string.Equals(req.ClassSpec, "Novice", StringComparison.OrdinalIgnoreCase)
            };
        }

        public static long GetExpRequiredForLevel(int level)
        {
            if (level >= 100) return 0;
            return Math.Max(100, (long)Math.Round(100.0 * Math.Pow(1.36, level - 1)));
        }

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

    public sealed class ExpGainRequestDto
    {
        public int CurrentLevel { get; set; } = 1;
        public long CurrentExp { get; set; }
        public long ExpGained { get; set; }
        public string ClassSpec { get; set; } = "Novice";
    }

    public sealed class ExpGainResultDto
    {
        public int NewLevel { get; set; }
        public long NewExp { get; set; }
        public long ExpToNext { get; set; }
        public int LevelsGained { get; set; }
        public int SkillPointsGained { get; set; }
        public float MaxLifeGain { get; set; }
        public float MaxManaGain { get; set; }
        public bool LeveledUp { get; set; }
        public bool EligibleForAscendance { get; set; }
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
