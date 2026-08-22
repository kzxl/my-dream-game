using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Combat
{
    public enum DamageType
    {
        Physical = 1,
        Fire,
        Cold,
        Lightning,
        Chaos
    }

    public readonly struct DamagePortion
    {
        public DamageType Type { get; }
        public float Amount { get; }

        public DamagePortion(DamageType type, float amount)
        {
            Type = type;
            Amount = MathF.Max(0f, amount);
        }
    }

    public sealed class DamagePayload
    {
        public Guid AttackerId { get; set; }
        public List<DamagePortion> Portions { get; } = new();
        public bool CanCrit { get; set; } = true;
        public float CritChance { get; set; }
        public float CritMultiplier { get; set; } = 150f; // Mặc định 150% = 1.5x
        public float AccuracyRating { get; set; } = 1000f;
        public Dictionary<DamageType, float> Penetrations { get; } = new();
        public Dictionary<DamageType, float> Exposures { get; } = new();
        public Dictionary<DamageType, float> CurseReductions { get; } = new();

        public void AddPortion(DamageType type, float amount)
        {
            if (amount > 0f)
            {
                Portions.Add(new DamagePortion(type, amount));
            }
        }

        public void SetPenetration(DamageType type, float percentage)
        {
            Penetrations[type] = percentage;
        }

        public float GetPenetration(DamageType type)
        {
            return Penetrations.TryGetValue(type, out float val) ? val : 0f;
        }

        public void SetExposure(DamageType type, float percentage)
        {
            Exposures[type] = percentage;
        }

        public float GetExposure(DamageType type)
        {
            return Exposures.TryGetValue(type, out float val) ? val : 0f;
        }

        public void SetCurseReduction(DamageType type, float percentage)
        {
            CurseReductions[type] = percentage;
        }

        public float GetCurseReduction(DamageType type)
        {
            return CurseReductions.TryGetValue(type, out float val) ? val : 0f;
        }
    }

    public sealed class HitResult
    {
        public bool IsHit { get; init; }
        public bool IsEvaded { get; init; }
        public bool IsBlocked { get; init; }
        public bool IsCrit { get; init; }
        public float TotalDamageDealt { get; init; }
        public float DamageTakenByEnergyShield { get; init; }
        public float DamageTakenByLife { get; init; }
        public Dictionary<DamageType, float> DamageBreakdown { get; } = new();

        public static HitResult Evaded() => new HitResult { IsHit = false, IsEvaded = true };
        public static HitResult Blocked() => new HitResult { IsHit = true, IsBlocked = true };
    }
}
