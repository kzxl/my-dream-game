using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Mdg.Server.Services
{
    public sealed class CharacterStatService
    {
        public CharacterStatsResultDto CalculateStats(CharacterStatsRequestDto req)
        {
            int level = Math.Max(1, req.Level);
            int strength = Math.Max(10, req.Strength);
            int dexterity = Math.Max(10, req.Dexterity);
            int intelligence = Math.Max(10, req.Intelligence);

            // Accumulate Gear & Passive Bonuses
            float gearLife = 0;
            float gearMana = 0;
            float gearEs = 0;
            float gearArmor = 0;
            float gearEvasion = 0;
            float gearFireRes = 0;
            float gearColdRes = 0;
            float gearLightningRes = 0;
            float gearChaosRes = 0;
            float gearCritChance = 5.0f;
            float gearCritMulti = 150.0f;
            float gearAddedDmg = 0;

            if (req.EquippedItems != null)
            {
                foreach (var item in req.EquippedItems)
                {
                    if (item.StatBonuses == null) continue;
                    foreach (var (k, v) in item.StatBonuses)
                    {
                        var key = k.ToLowerInvariant();
                        if (key.Contains("fireres") || key.Contains("fire_res") || key == "fire") gearFireRes += v;
                        else if (key.Contains("coldres") || key.Contains("cold_res") || key == "cold") gearColdRes += v;
                        else if (key.Contains("lightningres") || key.Contains("lightning_res") || key == "lightning") gearLightningRes += v;
                        else if (key.Contains("chaosres") || key.Contains("chaos_res") || key == "chaos") gearChaosRes += v;
                        else if (key.Contains("allres") || key.Contains("all_res"))
                        {
                            gearFireRes += v;
                            gearColdRes += v;
                            gearLightningRes += v;
                        }
                        else if (key.Contains("life") || key.Contains("hp")) gearLife += v;
                        else if (key.Contains("mana")) gearMana += v;
                        else if (key.Contains("energyshield") || key.Contains("energy_shield") || key == "es") gearEs += v;
                        else if (key.Contains("armor")) gearArmor += v;
                        else if (key.Contains("evasion")) gearEvasion += v;
                        else if (key.Contains("critchance") || key.Contains("crit_chance")) gearCritChance += v;
                        else if (key.Contains("critmulti") || key.Contains("crit_multi")) gearCritMulti += v;
                        else if (key.Contains("damage") || key.Contains("dmg")) gearAddedDmg += v;
                    }
                }
            }

            // Act Resistance Penalty (Standard ARPG progressive penalty)
            int act = req.CurrentAct > 0 ? req.CurrentAct : 1;
            int resPenalty = act switch
            {
                >= 4 => 45,
                3 => 30,
                2 => 15,
                _ => 0
            };

            // Calculated Core Pools
            float maxLife = 100f + (level * 15f) + (strength * 2f) + gearLife;
            float maxMana = 50f + (level * 8f) + (intelligence * 2f) + gearMana;
            float maxEs = (intelligence * 0.5f) + gearEs;
            float armor = (strength * 0.5f) + (dexterity * 0.25f) + gearArmor;
            float evasion = (dexterity * 1.5f) + gearEvasion;

            // Resistance Caps (Max 75% / 90% hard cap)
            float fireRes = Math.Clamp(gearFireRes - resPenalty, -60f, 75f);
            float coldRes = Math.Clamp(gearColdRes - resPenalty, -60f, 75f);
            float lightningRes = Math.Clamp(gearLightningRes - resPenalty, -60f, 75f);
            float chaosRes = Math.Clamp(gearChaosRes - resPenalty, -60f, 75f);

            // Estimated Physical Damage Reduction % vs same level monster
            float physDmgReduction = (armor / (armor + (50f * level))) * 100f;
            physDmgReduction = Math.Clamp(physDmgReduction, 0f, 90f);

            // Estimated Base Attack Damage
            float baseDamage = 15f + (level * 3f) + (strength * 0.5f) + (dexterity * 0.3f) + gearAddedDmg;

            return new CharacterStatsResultDto
            {
                Level = level,
                ClassSpec = req.ClassSpec ?? "Novice",
                Strength = strength,
                Dexterity = dexterity,
                Intelligence = intelligence,
                MaxLife = (int)Math.Round(maxLife),
                MaxMana = (int)Math.Round(maxMana),
                MaxEnergyShield = (int)Math.Round(maxEs),
                Armor = (int)Math.Round(armor),
                Evasion = (int)Math.Round(evasion),
                PhysicalReductionPercent = MathF.Round(physDmgReduction, 1),
                FireResistance = (int)Math.Round(fireRes),
                ColdResistance = (int)Math.Round(coldRes),
                LightningResistance = (int)Math.Round(lightningRes),
                ChaosResistance = (int)Math.Round(chaosRes),
                ResistancePenalty = resPenalty,
                CritChancePercent = MathF.Round(gearCritChance, 1),
                CritMultiplierPercent = MathF.Round(gearCritMulti, 1),
                BaseDamage = MathF.Round(baseDamage, 1)
            };
        }
    }

    public record CharacterStatsRequestDto(
        int Level,
        string? ClassSpec,
        int Strength,
        int Dexterity,
        int Intelligence,
        int CurrentAct,
        List<LootItemDto>? EquippedItems,
        List<string>? AllocatedNodes);

    public class CharacterStatsResultDto
    {
        [JsonPropertyName("level")]
        public int Level { get; set; }

        [JsonPropertyName("classSpec")]
        public string ClassSpec { get; set; } = "Novice";

        [JsonPropertyName("strength")]
        public int Strength { get; set; }

        [JsonPropertyName("dexterity")]
        public int Dexterity { get; set; }

        [JsonPropertyName("intelligence")]
        public int Intelligence { get; set; }

        [JsonPropertyName("maxLife")]
        public int MaxLife { get; set; }

        [JsonPropertyName("maxMana")]
        public int MaxMana { get; set; }

        [JsonPropertyName("maxEnergyShield")]
        public int MaxEnergyShield { get; set; }

        [JsonPropertyName("armor")]
        public int Armor { get; set; }

        [JsonPropertyName("evasion")]
        public int Evasion { get; set; }

        [JsonPropertyName("physicalReductionPercent")]
        public float PhysicalReductionPercent { get; set; }

        [JsonPropertyName("fireResistance")]
        public int FireResistance { get; set; }

        [JsonPropertyName("coldResistance")]
        public int ColdResistance { get; set; }

        [JsonPropertyName("lightningResistance")]
        public int LightningResistance { get; set; }

        [JsonPropertyName("chaosResistance")]
        public int ChaosResistance { get; set; }

        [JsonPropertyName("resistancePenalty")]
        public int ResistancePenalty { get; set; }

        [JsonPropertyName("critChancePercent")]
        public float CritChancePercent { get; set; }

        [JsonPropertyName("critMultiplierPercent")]
        public float CritMultiplierPercent { get; set; }

        [JsonPropertyName("baseDamage")]
        public float BaseDamage { get; set; }
    }
}
