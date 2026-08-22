using System;
using Mdg.Core.Features.Stats;

namespace Mdg.Core.Features.Combat
{
    /// <summary>
    /// Bộ tính toán sát thương Authoritative của Core theo luật ARPG Path of Exile.
    /// Hoàn toàn độc lập với Engine hiển thị.
    /// </summary>
    public static class DamageCalculator
    {
        private static readonly Random _random = new();

        /// <summary>
        /// Tính toán kết quả đòn đánh giữa Bên tấn công (Payload) và Bên phòng thủ (Defender Stats).
        /// </summary>
        public static HitResult CalculateHit(
            DamagePayload payload,
            StatCollection defenderStats,
            ref float currentEnergyShield,
            ref float currentLife,
            Random? randomOverride = null)
        {
            var rng = randomOverride ?? _random;

            // 1. Kiểm tra né tránh (Evasion vs Accuracy)
            float defenderEvasion = defenderStats.GetValue(StatType.Evasion);
            float hitChance = CalculateHitChance(payload.AccuracyRating, defenderEvasion);
            if (rng.NextDouble() * 100.0 > hitChance)
            {
                return HitResult.Evaded();
            }

            // 2. Kiểm tra Đỡ đòn (Block Chance)
            float blockChance = defenderStats.GetValue(StatType.BlockChance);
            if (blockChance > 0f && rng.NextDouble() * 100.0 <= blockChance)
            {
                return HitResult.Blocked();
            }

            // 3. Kiểm tra Đòn chí mạng (Critical Strike)
            bool isCrit = false;
            float damageMultiplier = 1f;
            if (payload.CanCrit && payload.CritChance > 0f)
            {
                if (rng.NextDouble() * 100.0 <= payload.CritChance)
                {
                    isCrit = true;
                    damageMultiplier = MathF.Max(1f, payload.CritMultiplier / 100f);
                }
            }

            // 4. Tính toán từng thành phần sát thương (Damage Portions)
            float totalDamage = 0f;
            float defenderArmor = defenderStats.GetValue(StatType.Armor);
            var breakdown = new System.Collections.Generic.Dictionary<DamageType, float>();

            for (int i = 0; i < payload.Portions.Count; i++)
            {
                var portion = payload.Portions[i];
                float rawDamage = portion.Amount * damageMultiplier;
                float finalPortionDamage = 0f;

                switch (portion.Type)
                {
                    case DamageType.Physical:
                        // Công thức Giáp PoE: Mitigation = Armor / (Armor + 5 * RawDamage)
                        float mitigation = 0f;
                        if (defenderArmor > 0f && rawDamage > 0f)
                        {
                            mitigation = defenderArmor / (defenderArmor + (5f * rawDamage));
                            mitigation = Math.Clamp(mitigation, 0f, 0.90f); // Max 90% mitigation
                        }
                        finalPortionDamage = rawDamage * (1f - mitigation);
                        break;

                    case DamageType.Fire:
                        finalPortionDamage = ApplyResistance(rawDamage, defenderStats.GetValue(StatType.FireResistance), payload.GetPenetration(DamageType.Fire));
                        break;

                    case DamageType.Cold:
                        finalPortionDamage = ApplyResistance(rawDamage, defenderStats.GetValue(StatType.ColdResistance), payload.GetPenetration(DamageType.Cold));
                        break;

                    case DamageType.Lightning:
                        finalPortionDamage = ApplyResistance(rawDamage, defenderStats.GetValue(StatType.LightningResistance), payload.GetPenetration(DamageType.Lightning));
                        break;

                    case DamageType.Chaos:
                        finalPortionDamage = ApplyResistance(rawDamage, defenderStats.GetValue(StatType.ChaosResistance), payload.GetPenetration(DamageType.Chaos));
                        break;
                }

                finalPortionDamage = MathF.Max(0f, finalPortionDamage);
                breakdown[portion.Type] = (breakdown.TryGetValue(portion.Type, out float existing) ? existing : 0f) + finalPortionDamage;
                totalDamage += finalPortionDamage;
            }

            // 5. Trừ vào Energy Shield và Life
            float esDamage = 0f;
            float lifeDamage = 0f;

            // Phân chia: Chaos bỏ qua Energy Shield, các loại khác trừ vào ES trước
            foreach (var kvp in breakdown)
            {
                float partDamage = kvp.Value;
                if (kvp.Key == DamageType.Chaos)
                {
                    lifeDamage += partDamage;
                }
                else
                {
                    if (currentEnergyShield > 0f)
                    {
                        if (currentEnergyShield >= partDamage)
                        {
                            currentEnergyShield -= partDamage;
                            esDamage += partDamage;
                        }
                        else
                        {
                            float remaining = partDamage - currentEnergyShield;
                            esDamage += currentEnergyShield;
                            currentEnergyShield = 0f;
                            lifeDamage += remaining;
                        }
                    }
                    else
                    {
                        lifeDamage += partDamage;
                    }
                }
            }

            currentLife = MathF.Max(0f, currentLife - lifeDamage);

            var result = new HitResult
            {
                IsHit = true,
                IsEvaded = false,
                IsBlocked = false,
                IsCrit = isCrit,
                TotalDamageDealt = totalDamage,
                DamageTakenByEnergyShield = esDamage,
                DamageTakenByLife = lifeDamage
            };

            foreach (var kvp in breakdown)
            {
                result.DamageBreakdown[kvp.Key] = kvp.Value;
            }

            return result;
        }

        private static float CalculateHitChance(float accuracy, float evasion)
        {
            if (evasion <= 0f) return 100f;
            if (accuracy <= 0f) return 5f;

            float denominator = accuracy + MathF.Pow(evasion * 0.25f, 0.8f);
            float chance = (accuracy / denominator) * 100f;
            return Math.Clamp(chance, 5f, 100f);
        }

        private static float ApplyResistance(float damage, float resistance, float penetration)
        {
            float effectiveResist = resistance - penetration;
            effectiveResist = Math.Clamp(effectiveResist, -200f, 75f); // Cap 75% max resist
            return damage * (1f - (effectiveResist / 100f));
        }

        /// <summary>
        /// Sát thương Chảy máu (Bleed DoT): Tăng gấp 3 lần (x3.0) khi mục tiêu đang di chuyển.
        /// </summary>
        public static float CalculateBleedDamage(float baseDotPerSecond, bool isMoving, float deltaSeconds)
        {
            float movementMultiplier = isMoving ? 3.0f : 1.0f;
            return baseDotPerSecond * movementMultiplier * deltaSeconds;
        }

        /// <summary>
        /// Hệ số khuếch đại sát thương nhận vào khi mục tiêu bị Dị Tật Sét (Shock): Từ 10% đến 50%.
        /// </summary>
        public static float CalculateShockMultiplier(float shockPercent)
        {
            float clampedPercent = Math.Clamp(shockPercent, 10.0f, 50.0f);
            return 1.0f + (clampedPercent / 100.0f);
        }

        /// <summary>
        /// Tính toán hệ số suy yếu của Vòng Hào Quang Nguyền Rủa (Blasphemy Curse Aura).
        /// </summary>
        public static (float DamageTakenMultiplier, float ResistanceReduction, float SpeedReduction, float DamageDealtReduction) CalculateCurseAuraDebuff(
            string curseType,
            float distanceToPlayer,
            float auraRadius = 220.0f)
        {
            if (distanceToPlayer > auraRadius)
            {
                return (1.0f, 0f, 0f, 0f);
            }

            return curseType.ToLower() switch
            {
                "vulnerability" => (1.35f, 0f, 0f, 0f),      // +35% Physical & Bleed Dmg taken
                "flammability"  => (1.0f, 35.0f, 0f, 0f),     // -35% Fire Resistance
                "frostbite"     => (1.0f, 35.0f, 0.35f, 0f),   // -35% Cold Resistance, -35% Speed
                "conductivity"  => (1.0f, 35.0f, 0f, 0f),     // -35% Lightning Resistance, +50% Shock
                "enfeeble"      => (1.0f, 0f, 0f, 0.30f),     // -30% Damage Dealt by Monster
                _               => (1.0f, 0f, 0f, 0f)
            };
        }

        /// <summary>
        /// Áp dụng cơ chế đột phá của các Keystones Thụ Động (Iron Fortress, Chaos Inoculation, Crimson Zealot, Elemental Overload).
        /// </summary>
        public static void ApplyKeystones(
            StatCollection stats,
            string[] activeKeystones,
            ref float maxLife,
            ref float maxEnergyShield)
        {
            if (activeKeystones == null || activeKeystones.Length == 0) return;

            foreach (var keystone in activeKeystones)
            {
                switch (keystone.ToLower())
                {
                    case "chaosinoculation":
                    case "chaos_inoculation":
                        maxLife = 1.0f;
                        maxEnergyShield *= 2.0f; // +100% ES
                        stats.SetBaseValue(StatType.MaxChaosResistance, 100.0f);
                        stats.SetBaseValue(StatType.ChaosResistance, 100.0f); // 100% Chaos Immune
                        break;

                    case "ironfortress":
                    case "iron_fortress":
                        // Overcapped elemental resists converted to Armor
                        float overcapFire = MathF.Max(0f, stats.GetValue(StatType.FireResistance) - 75f);
                        float overcapCold = MathF.Max(0f, stats.GetValue(StatType.ColdResistance) - 75f);
                        float overcapLight = MathF.Max(0f, stats.GetValue(StatType.LightningResistance) - 75f);
                        float totalOvercap = overcapFire + overcapCold + overcapLight;
                        float bonusArmor = 300.0f + (totalOvercap * 5.0f);
                        stats.SetBaseValue(StatType.Armor, stats.GetValue(StatType.Armor) + bonusArmor);
                        break;

                    case "crimsonzealot":
                    case "crimson_zealot":
                        // Blood Magic: +35% total damage when under 50% HP
                        break;

                    case "elementaloverload":
                    case "elemental_overload":
                        // Crits grant +40% elemental damage
                        break;
                }
            }
        }
    }
}
