using System;

namespace Mdg.Core.Features.Combat
{
    public enum BossPhase
    {
        Phase1 = 1, // Standard Combat (100% -> 65%)
        Phase2 = 2, // Arena Hazard & Add Waves (65% -> 25%)
        Phase3 = 3  // Enrage & Cataclysm (25% -> 0%)
    }

    public sealed class BossStateMachine
    {
        public MonsterEntity Boss { get; }
        public BossPhase CurrentPhase { get; private set; } = BossPhase.Phase1;
        public bool IsInvulnerable { get; private set; } = false;
        public bool IsEnraged { get; private set; } = false;
        public float AttackSpeedMultiplier { get; private set; } = 1.0f;

        public event Action<BossPhase>? OnPhaseChanged;
        public event Action? OnAddsSpawnTriggered;
        public event Action? OnEnrageActivated;

        public BossStateMachine(MonsterEntity boss)
        {
            if (boss.Rarity != MonsterRarity.PinnacleBoss)
                throw new ArgumentException("BossStateMachine requires a PinnacleBoss monster entity.", nameof(boss));

            Boss = boss;
        }

        public void UpdateHealth(float previousHp, float currentHp)
        {
            float hpPercent = Boss.HealthPercentage;

            if (CurrentPhase == BossPhase.Phase1 && hpPercent <= 65f)
            {
                TransitionToPhase(BossPhase.Phase2);
            }
            else if (CurrentPhase == BossPhase.Phase2 && hpPercent <= 25f)
            {
                TransitionToPhase(BossPhase.Phase3);
            }
        }

        public void TransitionToPhase(BossPhase newPhase)
        {
            CurrentPhase = newPhase;

            switch (newPhase)
            {
                case BossPhase.Phase2:
                    IsInvulnerable = true;
                    OnAddsSpawnTriggered?.Invoke();
                    break;

                case BossPhase.Phase3:
                    IsInvulnerable = false;
                    IsEnraged = true;
                    AttackSpeedMultiplier = 1.4f; // +40% Speed
                    OnEnrageActivated?.Invoke();
                    break;
            }

            OnPhaseChanged?.Invoke(newPhase);
        }

        public void BreakPhase2Shield()
        {
            if (CurrentPhase == BossPhase.Phase2)
            {
                IsInvulnerable = false;
            }
        }

        public float ProcessIncomingDamage(float damage)
        {
            if (IsInvulnerable) return 0f;

            float prevHp = Boss.CurrentHealth;
            float dealt = Boss.TakeDamage(damage);
            UpdateHealth(prevHp, Boss.CurrentHealth);
            return dealt;
        }
    }
}
