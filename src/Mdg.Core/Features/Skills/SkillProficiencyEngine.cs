using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Skills;

public enum SkillProficiencyRank
{
    RankF = 0,
    RankE = 1,
    RankD = 2,
    RankC = 3,
    RankB = 4,
    RankA = 5,
    RankS = 6,
    RankSSS = 7,
    Mythic = 8
}

public sealed class SkillAwakeningDef
{
    public string SkillId { get; set; } = string.Empty;
    public string BaseSkillName { get; set; } = string.Empty;
    public string AwakenedName { get; set; } = string.Empty;
    public string RequiredEssenceId { get; set; } = string.Empty;
    public string RequiredEssenceName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = "✨";
    public string Color { get; set; } = "#ffd700";
    public double DamageMultiplier { get; set; } = 2.0;
}

public sealed class SkillProficiencyState
{
    public string SkillId { get; set; } = string.Empty;
    public string SkillName { get; set; } = string.Empty;
    public SkillProficiencyRank CurrentRank { get; set; } = SkillProficiencyRank.RankF;
    public long CurrentExp { get; set; }
    public long ExpToNextRank { get; set; } = 500;
    public double DamageBonusPercent { get; set; }
    public double AreaBonusPercent { get; set; }
    public double CritBonusPercent { get; set; }
    public string RankTitle { get; set; } = "Novice Practitioner (F)";
    public string VisualAuraColor { get; set; } = "#ffffff";
    public bool IsAwakened { get; set; }
    public SkillAwakeningDef? AwakeningDef { get; set; }
}

public static class SkillProficiencyEngine
{
    // Hardcore Non-Linear EXP Curve to ensure high accomplishment & grind
    private static readonly long[] RankExpRequirements =
    [
        0,          // Rank F (Default)
        500,        // Rank E (Early practice)
        2000,       // Rank D (Hardened combatant)
        8000,       // Rank C (Skilled specialist)
        25000,      // Rank B (Master virtuoso)
        75000,      // Rank A (Awakening Eligibility Threshold)
        200000,     // Rank S (Apex Hunter)
        600000,     // Rank SSS (Monarch)
        1800000     // Mythic (Primordial Awakening)
    ];

    public static readonly Dictionary<string, SkillAwakeningDef> AwakeningDefinitions = new(StringComparer.OrdinalIgnoreCase)
    {
        ["slash"] = new()
        {
            SkillId = "slash",
            BaseSkillName = "Heavy Slash",
            AwakenedName = "Void Dimension Cleave",
            RequiredEssenceId = "essence_blade",
            RequiredEssenceName = "Essence of the Blade Sovereign",
            Description = "Rips open a dimensional vacuum rift on slash, pulling in enemies and dealing catastrophic chaos impact.",
            Icon = "🌌",
            Color = "#9b59b6",
            DamageMultiplier = 2.2
        },
        ["fireball"] = new()
        {
            SkillId = "fireball",
            BaseSkillName = "Pyro Fireball",
            AwakenedName = "Supernova Celestial Orb",
            RequiredEssenceId = "essence_pyro",
            RequiredEssenceName = "Essence of the Solar Archon",
            Description = "Hurls a celestial supernova that continuously radiates lethal plasma bolts before exploding in a 360° solar blast.",
            Icon = "☀️",
            Color = "#ff7675",
            DamageMultiplier = 2.5
        },
        ["frost"] = new()
        {
            SkillId = "frost",
            BaseSkillName = "Frost Nova",
            AwakenedName = "Glacial Domain of Oblivion",
            RequiredEssenceId = "essence_frost",
            RequiredEssenceName = "Essence of Absolute Zero",
            Description = "Expands a permafrost singularity freezing all monsters for 2.5s and granting +500 Energy Shield ward.",
            Icon = "❄️",
            Color = "#00f2fe",
            DamageMultiplier = 2.0
        },
        ["meteor"] = new()
        {
            SkillId = "meteor",
            BaseSkillName = "Cataclysm Meteor",
            AwakenedName = "Starfall Cataclysm",
            RequiredEssenceId = "essence_meteor",
            RequiredEssenceName = "Essence of the Cosmic Void",
            Description = "Summons 5 consecutive cosmic meteors raining down across the entire battlefield with apocalyptic area coverage.",
            Icon = "☄️",
            Color = "#e17055",
            DamageMultiplier = 2.8
        },
        ["dash"] = new()
        {
            SkillId = "dash",
            BaseSkillName = "Shadow Dash",
            AwakenedName = "Flash Phantasm Mirage",
            RequiredEssenceId = "essence_dash",
            RequiredEssenceName = "Essence of the Phantom Mirage",
            Description = "Phases forward leaving behind dual phantasm clones that execute instant critical slashes upon nearby foes.",
            Icon = "⚡",
            Color = "#ffd700",
            DamageMultiplier = 1.8
        }
    };

    public static bool CanAwaken(string skillId, SkillProficiencyRank rank, bool hasEssence)
    {
        return rank >= SkillProficiencyRank.RankA && hasEssence && AwakeningDefinitions.ContainsKey(skillId);
    }

    public static SkillProficiencyState CalculateState(string skillId, string skillName, long totalExp, bool isAwakened = false)
    {
        var rank = SkillProficiencyRank.RankF;
        for (int i = RankExpRequirements.Length - 1; i >= 0; i--)
        {
            if (totalExp >= RankExpRequirements[i])
            {
                rank = (SkillProficiencyRank)i;
                break;
            }
        }

        int rankIndex = (int)rank;
        long nextReq = rankIndex < RankExpRequirements.Length - 1
            ? RankExpRequirements[rankIndex + 1]
            : RankExpRequirements[^1];

        double dmgBonus = rank switch
        {
            SkillProficiencyRank.RankF => 0.0,
            SkillProficiencyRank.RankE => 6.0,
            SkillProficiencyRank.RankD => 14.0,
            SkillProficiencyRank.RankC => 25.0,
            SkillProficiencyRank.RankB => 40.0,
            SkillProficiencyRank.RankA => 65.0,
            SkillProficiencyRank.RankS => 95.0,
            SkillProficiencyRank.RankSSS => 135.0,
            SkillProficiencyRank.Mythic => 180.0,
            _ => 0.0
        };

        if (isAwakened)
        {
            dmgBonus += 50.0; // Extra +50% baseline damage amplification for awakened forms
        }

        double aoeBonus = rank switch
        {
            SkillProficiencyRank.RankB => 10.0,
            SkillProficiencyRank.RankA => 20.0,
            SkillProficiencyRank.RankS => 35.0,
            SkillProficiencyRank.RankSSS => 50.0,
            SkillProficiencyRank.Mythic => 70.0,
            _ => 0.0
        };

        double critBonus = rank switch
        {
            SkillProficiencyRank.RankS => 8.0,
            SkillProficiencyRank.RankSSS => 15.0,
            SkillProficiencyRank.Mythic => 25.0,
            _ => 0.0
        };

        string title = rank switch
        {
            SkillProficiencyRank.RankF => "Novice Practitioner (Rank F)",
            SkillProficiencyRank.RankE => "Adept Adept (Rank E)",
            SkillProficiencyRank.RankD => "Hardened Combatant (Rank D)",
            SkillProficiencyRank.RankC => "Skilled Specialist (Rank C)",
            SkillProficiencyRank.RankB => "Master Virtuoso (Rank B)",
            SkillProficiencyRank.RankA => "Grandmaster Ascendant (Rank A - Awakened Eligible)",
            SkillProficiencyRank.RankS => "👑 S-Rank Calamity (Rank S)",
            SkillProficiencyRank.RankSSS => "🌟 SSS-Rank Monarch (Rank SSS)",
            SkillProficiencyRank.Mythic => "✨ Primordial Mythic Awakening",
            _ => "Novice"
        };

        string auraColor = rank switch
        {
            SkillProficiencyRank.RankF => "#b0bec5",
            SkillProficiencyRank.RankE => "#81c784",
            SkillProficiencyRank.RankD => "#4fc3f7",
            SkillProficiencyRank.RankC => "#ba68c8",
            SkillProficiencyRank.RankB => "#ffb74d",
            SkillProficiencyRank.RankA => "#ff7043",
            SkillProficiencyRank.RankS => "#e91e63",
            SkillProficiencyRank.RankSSS => "#9c27b0",
            SkillProficiencyRank.Mythic => "#ffd700",
            _ => "#ffffff"
        };

        AwakeningDefinitions.TryGetValue(skillId, out var awkDef);

        return new SkillProficiencyState
        {
            SkillId = skillId,
            SkillName = skillName,
            CurrentRank = rank,
            CurrentExp = totalExp,
            ExpToNextRank = nextReq,
            DamageBonusPercent = dmgBonus,
            AreaBonusPercent = aoeBonus,
            CritBonusPercent = critBonus,
            RankTitle = title,
            VisualAuraColor = auraColor,
            IsAwakened = isAwakened,
            AwakeningDef = awkDef
        };
    }
}
