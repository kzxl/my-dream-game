using Mdg.Core.Features.Professions;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class GatheringProfessionsTests
    {
        [Fact]
        public void ProfessionData_AddExp_LevelsUpCorrectly()
        {
            var mining = new ProfessionData("mining", "Mining", "⛏️", 1);
            Assert.Equal(1, mining.Level);
            Assert.Equal(100, mining.MaxExp);

            mining.AddExp(60, out var leveled1);
            Assert.False(leveled1);
            Assert.Equal(60, mining.CurrentExp);

            mining.AddExp(50, out var leveled2); // 60 + 50 = 110 >= 100
            Assert.True(leveled2);
            Assert.Equal(2, mining.Level);
            Assert.Equal(10, mining.CurrentExp);
            Assert.Equal(200, mining.MaxExp);
        }

        [Fact]
        public void GatheringProfessionEngine_CanGatherNode_ValidatesRequirements()
        {
            bool canGatherT1 = GatheringProfessionEngine.CanGatherNode(1, 1, out var error1);
            Assert.True(canGatherT1);
            Assert.Empty(error1);

            bool canGatherT2 = GatheringProfessionEngine.CanGatherNode(5, 10, out var error2);
            Assert.False(canGatherT2);
            Assert.Contains("Requires Profession Level 10", error2);
        }
    }
}
