using System;

namespace Mdg.Core.Features.Items.Crafting
{
    public enum CraftingMasteryRank
    {
        Apprentice = 1,   // Lv. 1-9
        Journeyman = 2,   // Lv. 10-19
        Artisan = 3,      // Lv. 20-29
        MasterSmith = 4,  // Lv. 30-39
        Grandmaster = 5,  // Lv. 40-49
        PrimordialGodSmith = 6 // Lv. 50 (Max)
    }

    public sealed class CraftingOutcomeResult
    {
        public bool IsMasterworkCrit { get; set; }
        public bool IsResourceSaved { get; set; }
        public int BonusSocketsAwarded { get; set; }
        public double StatMultiplier { get; set; } = 1.0;
        public string OutcomeMessage { get; set; } = string.Empty;
    }

    public sealed class CraftingMasteryState
    {
        public int Level { get; set; } = 1;
        public long CurrentExp { get; set; } = 0;
        public long ExpToNext { get; set; } = 150;
        public CraftingMasteryRank Rank { get; set; } = CraftingMasteryRank.Apprentice;
        public string RankTitle { get; set; } = "Novice Apprentice";
        public double ResourceSaveChancePercent { get; set; } = 5.0; // 5% -> 30%
        public double MasterworkCritChancePercent { get; set; } = 5.0; // 5% -> 25%
        public double ExtraSocketChancePercent { get; set; } = 5.0; // 5% -> 35%
        public double QualityBonusPercent { get; set; } = 0.0; // 0% -> 25%
    }

    public static class CraftingMasteryEngine
    {
        public const int MAX_MASTERY_LEVEL = 50;

        public static CraftingMasteryState CalculateState(int level, long currentExp)
        {
            level = Math.Clamp(level, 1, MAX_MASTERY_LEVEL);
            long expToNext = level >= MAX_MASTERY_LEVEL ? 0 : (long)(150 * Math.Pow(1.12, level - 1));

            var rank = level switch
            {
                >= 50 => CraftingMasteryRank.PrimordialGodSmith,
                >= 40 => CraftingMasteryRank.Grandmaster,
                >= 30 => CraftingMasteryRank.MasterSmith,
                >= 20 => CraftingMasteryRank.Artisan,
                >= 10 => CraftingMasteryRank.Journeyman,
                _ => CraftingMasteryRank.Apprentice
            };

            string rankTitle = rank switch
            {
                CraftingMasteryRank.PrimordialGodSmith => "👑 Primordial God-Smith (Mythic)",
                CraftingMasteryRank.Grandmaster => "🌟 Grandmaster Artificer",
                CraftingMasteryRank.MasterSmith => "🔨 Master Forger",
                CraftingMasteryRank.Artisan => "💎 Skilled Artisan",
                CraftingMasteryRank.Journeyman => "⚒️ Adept Journeyman",
                _ => "🛠️ Novice Apprentice"
            };

            // Passive Perks scaling linearly with Mastery Level
            double saveChance = Math.Min(30.0, 5.0 + (level - 1) * 0.52); // 5% to 30.48%
            double critChance = Math.Min(25.0, 5.0 + (level - 1) * 0.41); // 5% to 25.09%
            double extraSocketChance = Math.Min(35.0, 5.0 + (level - 1) * 0.62); // 5% to 35.38%
            double qualityBonus = Math.Min(25.0, (level - 1) * 0.51); // 0% to 25.0%

            return new CraftingMasteryState
            {
                Level = level,
                CurrentExp = currentExp,
                ExpToNext = expToNext,
                Rank = rank,
                RankTitle = rankTitle,
                ResourceSaveChancePercent = Math.Round(saveChance, 1),
                MasterworkCritChancePercent = Math.Round(critChance, 1),
                ExtraSocketChancePercent = Math.Round(extraSocketChance, 1),
                QualityBonusPercent = Math.Round(qualityBonus, 1)
            };
        }

        public static bool AddExp(ref int level, ref long currentExp, long amount, out bool leveledUp)
        {
            leveledUp = false;
            if (amount <= 0 || level >= MAX_MASTERY_LEVEL) return false;

            currentExp += amount;
            while (level < MAX_MASTERY_LEVEL)
            {
                long req = (long)(150 * Math.Pow(1.12, level - 1));
                if (currentExp >= req)
                {
                    currentExp -= req;
                    level++;
                    leveledUp = true;
                }
                else
                {
                    break;
                }
            }

            if (level >= MAX_MASTERY_LEVEL)
            {
                currentExp = 0;
            }

            return true;
        }

        public static CraftingOutcomeResult EvaluateCrafting(CraftingMasteryState state, Random? rng = null)
        {
            var r = rng ?? new Random();
            var result = new CraftingOutcomeResult();

            // 1. Resource Save / Refund Check
            if (r.NextDouble() * 100.0 < state.ResourceSaveChancePercent)
            {
                result.IsResourceSaved = true;
            }

            // 2. Masterwork Critical Check (+25% bonus stats)
            if (r.NextDouble() * 100.0 < state.MasterworkCritChancePercent)
            {
                result.IsMasterworkCrit = true;
                result.StatMultiplier = 1.25; // +25% Superior Quality Stats
            }

            // 3. Extra Socket Blessing Check
            if (r.NextDouble() * 100.0 < state.ExtraSocketChancePercent)
            {
                result.BonusSocketsAwarded = 1;
            }

            return result;
        }
    }
}
