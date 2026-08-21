using System;

namespace Mdg.Core.Features.Combat
{
    public sealed class StaggerState
    {
        public float CurrentStagger { get; set; } = 0.0f;
        public float MaxStagger { get; set; } = 100.0f;
        public bool IsStaggered { get; set; } = false;
        public float StaggerTimer { get; set; } = 0.0f;
        public const float STAGGER_DURATION = 6.0f; // 6s vulnerability groggy state
        public const float STAGGER_DECAY_RATE = 5.0f; // 5 points/s when not taking hits

        public StaggerState(float maxStagger = 100.0f)
        {
            MaxStagger = Math.Max(20.0f, maxStagger);
            CurrentStagger = 0.0f;
        }

        public bool AddStagger(float amount, out bool justTriggered)
        {
            justTriggered = false;
            if (IsStaggered) return false;

            CurrentStagger = Math.Min(MaxStagger, CurrentStagger + amount);
            if (CurrentStagger >= MaxStagger)
            {
                IsStaggered = true;
                StaggerTimer = STAGGER_DURATION;
                CurrentStagger = 0.0f;
                justTriggered = true;
                return true;
            }

            return false;
        }

        public void Update(float dt)
        {
            if (IsStaggered)
            {
                StaggerTimer -= dt;
                if (StaggerTimer <= 0)
                {
                    IsStaggered = false;
                    StaggerTimer = 0;
                    CurrentStagger = 0;
                }
            }
            else if (CurrentStagger > 0)
            {
                CurrentStagger = Math.Max(0, CurrentStagger - (STAGGER_DECAY_RATE * dt));
            }
        }
    }
}
