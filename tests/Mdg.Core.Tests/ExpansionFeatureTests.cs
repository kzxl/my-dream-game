using System.Collections.Generic;
using System.Linq;
using Mdg.Core.Features.Items;
using Mdg.Core.Features.Items.Crafting;
using Mdg.Core.Features.Maps;
using Mdg.Core.Features.Skills;
using Xunit;

namespace Mdg.Core.Tests;

public sealed class ExpansionFeatureTests
{
    [Fact]
    public void MapExpansion_WhisperingPlains_Is96x96AndHasPois()
    {
        var map = ZoneMapGenerator.GenerateZone("WhisperingPlains");

        Assert.NotNull(map);
        Assert.Equal(96, map.WidthInTiles);
        Assert.Equal(96, map.HeightInTiles);
        Assert.Equal(96 * 48, map.WorldWidth);
        Assert.Equal(96 * 48, map.WorldHeight);

        Assert.NotNull(map.Pois);
        Assert.True(map.Pois.Count >= 3, "Expected at least 3 POIs in Whispering Plains.");

        var shrine = map.Pois.FirstOrDefault(p => p.Type == "shrine");
        Assert.NotNull(shrine);
        Assert.Equal("TempestAura", shrine.BuffType);

        var monolith = map.Pois.FirstOrDefault(p => p.Type == "monolith");
        Assert.NotNull(monolith);
        Assert.Equal(3, monolith.WaveCount);

        var subCave = map.Pois.FirstOrDefault(p => p.Type == "sub_cave");
        Assert.NotNull(subCave);
    }

    [Theory]
    [InlineData(1, false, 10)]
    [InlineData(10, true, 19)]
    [InlineData(50, true, 55)]
    [InlineData(100, true, 100)]
    public void EndlessSpire_GeneratesFloorsAndBossMilestones(int floorNumber, bool expectedIsBoss, int expectedMinMonsterLevel)
    {
        var floorInfo = EndlessSpireManager.GetFloorInfo(floorNumber, highestClearedFloor: 5);
        Assert.NotNull(floorInfo);
        Assert.Equal(floorNumber, floorInfo.FloorNumber);
        Assert.Equal(expectedIsBoss, floorInfo.IsBossFloor);
        Assert.True(floorInfo.MonsterLevel >= expectedMinMonsterLevel);
        Assert.False(string.IsNullOrEmpty(floorInfo.FirstClearReward));

        var mapDto = EndlessSpireManager.GenerateSpireFloor(floorNumber);
        Assert.NotNull(mapDto);
        Assert.StartsWith($"EndlessSpire_F{floorNumber}", mapDto.Id);
        Assert.True(mapDto.WidthInTiles >= 50);
        Assert.True(mapDto.HeightInTiles >= 50);
    }

    [Theory]
    [InlineData(0, SkillProficiencyRank.RankF, 0.0)]
    [InlineData(150, SkillProficiencyRank.RankE, 5.0)]
    [InlineData(400, SkillProficiencyRank.RankD, 10.0)]
    [InlineData(1000, SkillProficiencyRank.RankC, 18.0)]
    [InlineData(2500, SkillProficiencyRank.RankB, 28.0)]
    [InlineData(6000, SkillProficiencyRank.RankA, 40.0)]
    [InlineData(15000, SkillProficiencyRank.RankS, 60.0)]
    [InlineData(35000, SkillProficiencyRank.RankSSS, 85.0)]
    [InlineData(100000, SkillProficiencyRank.Mythic, 120.0)]
    public void SkillProficiency_CalculatesRankEvolutionAndBonuses(long exp, SkillProficiencyRank expectedRank, double expectedDmgBonus)
    {
        var state = SkillProficiencyEngine.CalculateState("fireball", "Pyro Fireball", exp);

        Assert.NotNull(state);
        Assert.Equal("fireball", state.SkillId);
        Assert.Equal(expectedRank, state.CurrentRank);
        Assert.Equal(expectedDmgBonus, state.DamageBonusPercent);
        Assert.False(string.IsNullOrEmpty(state.RankTitle));
        Assert.False(string.IsNullOrEmpty(state.VisualAuraColor));
    }

    [Fact]
    public void RunewordEngine_EvaluatesRecipesCorrectly()
    {
        var normalItem = new ItemEntity("Iron Greatsword", "Greatsword", ItemRarity.Normal, ItemSlot.MainHand, 10, "🗡️", 2, 2);

        // 1. Valid Steel Runeword (TIR + EL)
        var steelResult = RunewordEngine.Evaluate(normalItem, new List<string> { "TIR", "EL" });
        Assert.True(steelResult.IsSuccess);
        Assert.Equal("STEEL", steelResult.RunewordName);
        Assert.Equal("Steel of the Vanguard", steelResult.RunewordTitle);
        Assert.Contains(steelResult.ExtraModifiers, m => m.Contains("Attack Speed"));

        // 2. Valid Ancient Oath (RAL + ORT + TAL)
        var oathResult = RunewordEngine.Evaluate(normalItem, new List<string> { "RAL", "ORT", "TAL" });
        Assert.True(oathResult.IsSuccess);
        Assert.Equal("ANCIENT_OATH", oathResult.RunewordName);

        // 3. Valid Calamity (VEX + OHM + JAH)
        var calamityResult = RunewordEngine.Evaluate(normalItem, new List<string> { "VEX", "OHM", "JAH" });
        Assert.True(calamityResult.IsSuccess);
        Assert.Equal("CALAMITY", calamityResult.RunewordName);
        Assert.Contains(calamityResult.ExtraModifiers, m => m.Contains("Global Damage"));

        // 4. Invalid Sequence
        var invalidResult = RunewordEngine.Evaluate(normalItem, new List<string> { "EL", "TIR" });
        Assert.False(invalidResult.IsSuccess);

        // 5. Invalid Non-White Base
        var rareItem = new ItemEntity("Golden Greatsword", "Greatsword", ItemRarity.Rare, ItemSlot.MainHand, 10, "🗡️", 2, 2);
        var rareEvaluation = RunewordEngine.Evaluate(rareItem, new List<string> { "TIR", "EL" });
        Assert.False(rareEvaluation.IsSuccess);
    }
}
