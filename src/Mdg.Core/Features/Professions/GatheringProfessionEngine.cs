using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Professions
{
    public sealed class ProfessionData
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = "⛏️";
        public int Level { get; set; } = 1;
        public int CurrentExp { get; set; } = 0;
        public int MaxExp => Level * 100;

        public ProfessionData(string id, string name, string icon, int initialLevel = 1)
        {
            Id = id;
            Name = name;
            Icon = icon;
            Level = Math.Max(1, initialLevel);
            CurrentExp = 0;
        }

        public bool AddExp(int exp, out bool leveledUp)
        {
            leveledUp = false;
            if (exp <= 0 || Level >= 50) return false;

            CurrentExp += exp;
            while (CurrentExp >= MaxExp && Level < 50)
            {
                CurrentExp -= MaxExp;
                Level++;
                leveledUp = true;
            }

            return true;
        }
    }

    public sealed class GatheringProfessionEngine
    {
        public static bool CanGatherNode(int playerProfessionLevel, int requiredNodeLevel, out string errorMessage)
        {
            if (playerProfessionLevel >= requiredNodeLevel)
            {
                errorMessage = string.Empty;
                return true;
            }

            errorMessage = $"Requires Profession Level {requiredNodeLevel} (Current: Lv.{playerProfessionLevel}).";
            return false;
        }

        public static int CalculateYield(int professionLevel, int baseMin = 2, int baseMax = 4)
        {
            var random = new Random();
            int bonus = professionLevel / 15; // +1 extra yield every 15 profession levels
            return random.Next(baseMin, baseMax + 1) + bonus;
        }
    }
}
