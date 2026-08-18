using System;

namespace Mdg.Core.Features.Combat
{
    public record ResurrectionResult
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
        public float NewLife { get; init; }
        public float NewMana { get; init; }
        public float NewEs { get; init; }
        public float InvulnerableDuration { get; init; }
        public int RemainingZoneResurrections { get; init; }
        public int RemainingScrolls { get; init; }
        public string TargetZone { get; init; } = "SanctuaryHaven";
        public float SpawnX { get; init; } = 672f;
        public float SpawnY { get; init; } = 672f;
        public bool IsTownResurrection { get; init; }
    }

    /// <summary>
    /// Pure C# domain engine for player defeat and resurrection rules and validations.
    /// </summary>
    public static class ResurrectionEngine
    {
        /// <summary>
        /// Validates whether the player is eligible for on-the-spot resurrection in the current zone session.
        /// </summary>
        public static bool CanResurrectOnSpot(PlayerDefeatState state, int scrollCount, out string? errorMessage)
        {
            if (state == null)
            {
                errorMessage = "Invalid player state.";
                return false;
            }

            if (!state.HasZoneResurrectionsRemaining)
            {
                errorMessage = $"Zone resurrection limit reached (0/{PlayerDefeatState.MaxZoneResurrections})! You must return to town to recover.";
                return false;
            }

            if (scrollCount <= 0)
            {
                errorMessage = "No Scroll of Resurrection in your backpack!";
                return false;
            }

            errorMessage = null;
            return true;
        }

        /// <summary>
        /// Authoritatively executes on-the-spot resurrection using a consumable scroll.
        /// </summary>
        public static ResurrectionResult ExecuteSpotResurrection(
            PlayerDefeatState state,
            ref int scrollCount,
            float maxLife,
            float maxMana,
            float maxEs)
        {
            if (!CanResurrectOnSpot(state, scrollCount, out var error))
            {
                return new ResurrectionResult
                {
                    Success = false,
                    Message = error ?? "Cannot resurrect on spot.",
                    RemainingZoneResurrections = state.RemainingZoneResurrections,
                    RemainingScrolls = scrollCount
                };
            }

            // Deduct 1 scroll
            scrollCount -= 1;

            // Increment zone resurrection usage
            state.ZoneResurrectionsUsed++;
            state.IsDead = false;
            state.InvulnerableTimer = PlayerDefeatState.SpotInvulnerableDurationSeconds;

            return new ResurrectionResult
            {
                Success = true,
                Message = $"Resurrected on the spot! ({state.RemainingZoneResurrections}/{PlayerDefeatState.MaxZoneResurrections} attempts remaining in this zone)",
                NewLife = Math.Max(1f, maxLife),
                NewMana = Math.Max(0f, maxMana),
                NewEs = Math.Max(0f, maxEs),
                InvulnerableDuration = PlayerDefeatState.SpotInvulnerableDurationSeconds,
                RemainingZoneResurrections = state.RemainingZoneResurrections,
                RemainingScrolls = scrollCount,
                TargetZone = state.CurrentZoneId,
                IsTownResurrection = false
            };
        }

        /// <summary>
        /// Authoritatively executes town resurrection at Sanctuary Haven.
        /// </summary>
        public static ResurrectionResult ExecuteTownResurrection(
            PlayerDefeatState state,
            float maxLife,
            float maxMana,
            float maxEs,
            string townZone = "SanctuaryHaven",
            float spawnX = 672f,
            float spawnY = 672f)
        {
            if (state == null) throw new ArgumentNullException(nameof(state));

            state.IsDead = false;
            state.CurrentZoneId = townZone;
            state.InvulnerableTimer = PlayerDefeatState.TownInvulnerableDurationSeconds;

            return new ResurrectionResult
            {
                Success = true,
                Message = "Returned safely to Sanctuary Haven for full recovery!",
                NewLife = Math.Max(1f, maxLife),
                NewMana = Math.Max(0f, maxMana),
                NewEs = Math.Max(0f, maxEs),
                InvulnerableDuration = PlayerDefeatState.TownInvulnerableDurationSeconds,
                RemainingZoneResurrections = PlayerDefeatState.MaxZoneResurrections,
                TargetZone = townZone,
                SpawnX = spawnX,
                SpawnY = spawnY,
                IsTownResurrection = true
            };
        }
    }
}
