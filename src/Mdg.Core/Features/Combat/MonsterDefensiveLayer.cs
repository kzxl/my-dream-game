using System;

namespace Mdg.Core.Features.Combat
{
    public sealed class MonsterDamageResult
    {
        public bool IsDodged { get; set; }
        public bool IsBlocked { get; set; }
        public bool IsCritical { get; set; }
        public float FinalDamage { get; set; }
        public float RawTotalDamage { get; set; }
        public string CombatMessage { get; set; } = string.Empty;
    }

    public static class MonsterDefensiveLayer
    {
        private static readonly Random _rng = new();

        public static MonsterDamageResult ProcessIncomingHit(
            MonsterEntity monster,
            float rawPhys,
            float rawFire,
            float rawCold,
            float rawLight,
            float rawChaos,
            float critChance = 0f,
            float critMulti = 150f)
        {
            var result = new MonsterDamageResult
            {
                RawTotalDamage = rawPhys + rawFire + rawCold + rawLight + rawChaos
            };

            if (!monster.IsAlive) return result;

            // 1. Evasion / Dodge Check
            if (monster.EvasionChance > 0f)
            {
                double roll = _rng.NextDouble() * 100.0;
                if (roll < monster.EvasionChance)
                {
                    result.IsDodged = true;
                    result.FinalDamage = 0f;
                    result.CombatMessage = "DODGED!";
                    return result;
                }
            }

            // Crit Calculation
            bool isCrit = false;
            float critMultiplier = 1.0f;
            if (critChance > 0f)
            {
                double roll = _rng.NextDouble() * 100.0;
                if (roll < critChance)
                {
                    isCrit = true;
                    critMultiplier = Math.Max(1.0f, critMulti / 100f);
                }
            }
            result.IsCritical = isCrit;

            // 2. Block Check
            float blockMitigationMultiplier = 1.0f;
            if (monster.BlockChance > 0f)
            {
                double roll = _rng.NextDouble() * 100.0;
                if (roll < monster.BlockChance)
                {
                    blockMitigationMultiplier = 1.0f - (monster.BlockMitigation / 100f); // Default: 1 - 0.75 = 0.25 (75% reduced)
                    result.IsBlocked = true;
                    result.CombatMessage = "BLOCKED!";
                }
            }

            // 3. Resistance & Armor Mitigation
            float physDmg = rawPhys * critMultiplier * blockMitigationMultiplier;
            float physMitigation = 0f;
            if (monster.Armor > 0f && physDmg > 0f)
            {
                physMitigation = Math.Min(0.85f, monster.Armor / (monster.Armor + 5f * physDmg));
            }
            float finalPhys = physDmg * (1f - physMitigation);

            float fireMult = Math.Clamp(1f - monster.FireResistance / 100f, 0f, 2f);
            float coldMult = Math.Clamp(1f - monster.ColdResistance / 100f, 0f, 2f);
            float lightMult = Math.Clamp(1f - monster.LightningResistance / 100f, 0f, 2f);
            float chaosMult = Math.Clamp(1f - monster.ChaosResistance / 100f, 0f, 2f);

            float finalFire = rawFire * critMultiplier * blockMitigationMultiplier * fireMult;
            float finalCold = rawCold * critMultiplier * blockMitigationMultiplier * coldMult;
            float finalLight = rawLight * critMultiplier * blockMitigationMultiplier * lightMult;
            float finalChaos = rawChaos * critMultiplier * blockMitigationMultiplier * chaosMult;

            float totalDmg = Math.Max(1f, (float)Math.Round(finalPhys + finalFire + finalCold + finalLight + finalChaos));

            float taken = monster.TakeDamage(totalDmg);
            result.FinalDamage = taken;

            return result;
        }
    }
}
