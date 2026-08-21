using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Spire
{
    public sealed class SpireFloorDefinition
    {
        public int FloorNumber { get; set; }
        public string FloorName { get; set; } = string.Empty;
        public bool IsBossFloor { get; set; }
        public string BossType { get; set; } = string.Empty;
        public float HealthMultiplier { get; set; } = 1.0f;
        public float DamageMultiplier { get; set; } = 1.0f;
        public int ResistancePenalty { get; set; } = 0;
        public List<string> Modifiers { get; set; } = new();
    }

    public sealed class EndlessSpireEngine
    {
        public const int MAX_SPIRE_FLOOR = 100;

        public static SpireFloorDefinition GetFloorDefinition(int floor)
        {
            floor = Math.Clamp(floor, 1, MAX_SPIRE_FLOOR);
            bool isBoss = (floor % 10 == 0);
            string bossType = isBoss ? (floor == 100 ? "GenesisSovereign" : (floor >= 70 ? "ArchonOfTheVoid" : (floor >= 40 ? "LordIgnis" : "MalakorTheShadowFiend"))) : string.Empty;

            var mods = new List<string>();
            if (floor >= 15) mods.Add("Turbo Monsters (+25% Move & Attack Speed)");
            if (floor >= 30) mods.Add("Elemental Exposure (-15% Player Resistances)");
            if (floor >= 50) mods.Add("Volatile Explosions on Monster Death");
            if (floor >= 75) mods.Add("Apex Void Empowered (Quái tăng +60% Sát thương)");

            return new SpireFloorDefinition
            {
                FloorNumber = floor,
                FloorName = isBoss ? $"Floor {floor}: Guardian Sovereign Chamber" : $"Floor {floor}: Ascendant Spire Trial",
                IsBossFloor = isBoss,
                BossType = bossType,
                HealthMultiplier = 1.0f + (floor * 0.08f),
                DamageMultiplier = 1.0f + (floor * 0.05f),
                ResistancePenalty = (floor / 5) * 2, // -2% per 5 floors
                Modifiers = mods
            };
        }

        public static bool CanAccessFloor(int targetFloor, int highestClearedFloor)
        {
            if (targetFloor <= 1) return true;
            // Allow accessing up to (highestClearedFloor + 1)
            return targetFloor <= (highestClearedFloor + 1) && targetFloor <= MAX_SPIRE_FLOOR;
        }
    }
}
