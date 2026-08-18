using System;

namespace Mdg.Core.Features.Combat
{
    /// <summary>
    /// Represents the authoritative defeat and resurrection tracking state for a player character.
    /// </summary>
    public class PlayerDefeatState
    {
        public const int MaxZoneResurrections = 5;
        public const float SpotInvulnerableDurationSeconds = 3.5f;
        public const float TownInvulnerableDurationSeconds = 3.0f;

        public string CharacterId { get; set; } = "hero_default";
        public string CurrentZoneId { get; set; } = "SanctuaryHaven";
        public bool IsDead { get; set; } = false;
        public int ZoneResurrectionsUsed { get; set; } = 0;
        public float InvulnerableTimer { get; set; } = 0f;

        public int RemainingZoneResurrections => Math.Max(0, MaxZoneResurrections - ZoneResurrectionsUsed);
        public bool HasZoneResurrectionsRemaining => RemainingZoneResurrections > 0;

        public PlayerDefeatState() { }

        public PlayerDefeatState(string characterId, string zoneId = "SanctuaryHaven")
        {
            CharacterId = characterId;
            CurrentZoneId = zoneId;
        }

        public void ResetZoneSession(string newZoneId)
        {
            CurrentZoneId = newZoneId;
            ZoneResurrectionsUsed = 0;
        }
    }
}
