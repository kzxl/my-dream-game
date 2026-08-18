using System;
using Mdg.Core.Features.Combat;
using Mdg.Core.Features.Stats;

namespace Mdg.Core.Features.Maps
{
    public sealed class HazardTileEffectResult
    {
        public bool IsHazardous { get; set; }
        public DamageType DamageType { get; set; }
        public float RawDamage { get; set; }
        public float MitigatedDamage { get; set; }
        public string StatusEffect { get; set; } = string.Empty;
        public float SlowPercentage { get; set; } = 0f;
    }

    public static class HazardTileProcessor
    {
        public const float LAVA_BASE_DPS = 40f;
        public const float TOXIC_BASE_DPS = 30f;
        public const float ICE_BASE_DPS = 20f;
        public const float STATIC_BASE_DPS = 25f;

        public static bool IsHazardTile(int tileCode)
        {
            return tileCode is 2 or 5 or 6 or 7 or 8;
        }

        public static HazardTileEffectResult ProcessTileHazard(int tileCode, StatCollection stats, float deltaSeconds = 1.0f)
        {
            var result = new HazardTileEffectResult();

            switch (tileCode)
            {
                case 2: // Water/Lava generic
                case 5: // TILE_LAVA
                    float maxFire = stats.GetValue(StatType.MaxFireResistance);
                    if (maxFire <= 0f) maxFire = 75f;
                    float fireRes = Math.Clamp(stats.GetValue(StatType.FireResistance), -100f, maxFire);
                    float rawFire = LAVA_BASE_DPS * deltaSeconds;
                    result.IsHazardous = true;
                    result.DamageType = DamageType.Fire;
                    result.RawDamage = rawFire;
                    result.MitigatedDamage = Math.Max(1f, rawFire * (1f - fireRes / 100f));
                    result.StatusEffect = "Ignite (Burning Ground)";
                    break;

                case 6: // TILE_TOXIC_MIASMA
                    float maxChaos = stats.GetValue(StatType.MaxChaosResistance);
                    if (maxChaos <= 0f) maxChaos = 75f;
                    float chaosRes = Math.Clamp(stats.GetValue(StatType.ChaosResistance), -100f, maxChaos);
                    float rawChaos = TOXIC_BASE_DPS * deltaSeconds;
                    result.IsHazardous = true;
                    result.DamageType = DamageType.Chaos;
                    result.RawDamage = rawChaos;
                    result.MitigatedDamage = Math.Max(1f, rawChaos * (1f - chaosRes / 100f));
                    result.StatusEffect = "Decay (-40% Flask Recovery)";
                    break;

                case 7: // TILE_GLACIAL_ICE
                    float maxCold = stats.GetValue(StatType.MaxColdResistance);
                    if (maxCold <= 0f) maxCold = 75f;
                    float coldRes = Math.Clamp(stats.GetValue(StatType.ColdResistance), -100f, maxCold);
                    float rawCold = ICE_BASE_DPS * deltaSeconds;
                    result.IsHazardous = true;
                    result.DamageType = DamageType.Cold;
                    result.RawDamage = rawCold;
                    result.MitigatedDamage = Math.Max(1f, rawCold * (1f - coldRes / 100f));
                    result.StatusEffect = "Chill (-50% Move Speed)";
                    result.SlowPercentage = 50f;
                    break;

                case 8: // TILE_ELECTRIC_GROUND
                    float maxLight = stats.GetValue(StatType.MaxLightningResistance);
                    if (maxLight <= 0f) maxLight = 75f;
                    float lightRes = Math.Clamp(stats.GetValue(StatType.LightningResistance), -100f, maxLight);
                    float rawLight = STATIC_BASE_DPS * deltaSeconds;
                    result.IsHazardous = true;
                    result.DamageType = DamageType.Lightning;
                    result.RawDamage = rawLight;
                    result.MitigatedDamage = Math.Max(1f, rawLight * (1f - lightRes / 100f));
                    result.StatusEffect = "Shock (+25% Damage Taken)";
                    break;

                default:
                    result.IsHazardous = false;
                    break;
            }

            return result;
        }
    }
}
