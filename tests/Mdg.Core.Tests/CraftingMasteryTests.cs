using System;
using Mdg.Core.Features.Items.Crafting;
using Xunit;

namespace Mdg.Core.Tests
{
    public class CraftingMasteryTests
    {
        [Fact]
        public void InitialState_IsLevel1_Apprentice()
        {
            var state = CraftingMasteryEngine.CalculateState(1, 0);
            Assert.Equal(1, state.Level);
            Assert.Equal(CraftingMasteryRank.Apprentice, state.Rank);
            Assert.Equal(5.0, state.ResourceSaveChancePercent);
            Assert.Equal(5.0, state.MasterworkCritChancePercent);
        }

        [Fact]
        public void GainingExp_LevelsUpMastery_AndScalesPerks()
        {
            int level = 1;
            long exp = 0;

            // Add 1,000 EXP
            bool success = CraftingMasteryEngine.AddExp(ref level, ref exp, 1000, out bool leveledUp);
            Assert.True(success);
            Assert.True(leveledUp);
            Assert.True(level > 1);

            var midState = CraftingMasteryEngine.CalculateState(25, 0);
            Assert.Equal(CraftingMasteryRank.Artisan, midState.Rank);
            Assert.True(midState.ResourceSaveChancePercent > 15.0);
            Assert.True(midState.MasterworkCritChancePercent > 12.0);
        }

        [Fact]
        public void MaxLevel_PrimordialGodSmith_CapBonuses()
        {
            var maxState = CraftingMasteryEngine.CalculateState(50, 0);
            Assert.Equal(50, maxState.Level);
            Assert.Equal(CraftingMasteryRank.PrimordialGodSmith, maxState.Rank);
            Assert.Equal(30.0, maxState.ResourceSaveChancePercent);
            Assert.Equal(25.0, maxState.MasterworkCritChancePercent);
            Assert.Equal(35.0, maxState.ExtraSocketChancePercent);
            Assert.Equal(25.0, maxState.QualityBonusPercent);
        }
    }
}
