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

public sealed class SkillProficiencyState
{
    public string SkillId { get; set; } = string.Empty;
    public string SkillName { get; set; } = string.Empty;
    public SkillProficiencyRank CurrentRank { get; set; } = SkillProficiencyRank.RankF;
    public long CurrentExp { get; set; }
    public long ExpToNextRank { get; set; } = 100;
    public double DamageBonusPercent { get; set; }
    public double AreaBonusPercent { get; set; }
    public double CritBonusPercent { get; set; }
    public string RankTitle { get; set; } = "Novice Practitioner (F)";
    public string VisualAuraColor { get; set; } = "#ffffff";
}

public static class SkillProficiencyEngine
{
    private static readonly long[] RankExpRequirements =
    [
        0,       // Rank F
        100,     // Rank E
        350,     // Rank D
        900,     // Rank C
        2200,    // Rank B
        5000,    // Rank A
        12000,   // Rank S
        30000,   // Rank SSS
        80000    // Mythic
    ];

    public static SkillProficiencyState CalculateState(string skillId, string skillName, long totalExp)
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
            SkillProficiencyRank.RankE => 5.0,
            SkillProficiencyRank.RankD => 10.0,
            SkillProficiencyRank.RankC => 18.0,
            SkillProficiencyRank.RankB => 28.0,
            SkillProficiencyRank.RankA => 40.0,
            SkillProficiencyRank.RankS => 60.0,
            SkillProficiencyRank.RankSSS => 85.0,
            SkillProficiencyRank.Mythic => 120.0,
            _ => 0.0
        };

        double aoeBonus = rank switch
        {
            SkillProficiencyRank.RankB => 10.0,
            SkillProficiencyRank.RankA => 15.0,
            SkillProficiencyRank.RankS => 25.0,
            SkillProficiencyRank.RankSSS => 35.0,
            SkillProficiencyRank.Mythic => 50.0,
            _ => 0.0
        };

        double critBonus = rank switch
        {
            SkillProficiencyRank.RankS => 5.0,
            SkillProficiencyRank.RankSSS => 10.0,
            SkillProficiencyRank.Mythic => 20.0,
            _ => 0.0
        };

        string title = rank switch
        {
            SkillProficiencyRank.RankF => "Novice Practitioner (Rank F)",
            SkillProficiencyRank.RankE => "Adept Adept (Rank E)",
            SkillProficiencyRank.RankD => "Hardened Combatant (Rank D)",
            SkillProficiencyRank.RankC => "Skilled Specialist (Rank C)",
            SkillProficiencyRank.RankB => "Master Virtuoso (Rank B)",
            SkillProficiencyRank.RankA => "Grandmaster Ascendant (Rank A)",
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
            VisualAuraColor = auraColor
        };
    }
}
