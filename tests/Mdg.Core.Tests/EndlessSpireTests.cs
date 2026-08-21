using Mdg.Core.Features.Spire;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class EndlessSpireTests
    {
        [Fact]
        public void SpireFloor_Floor10_IsBossFloor()
        {
            var def = EndlessSpireEngine.GetFloorDefinition(10);

            Assert.Equal(10, def.FloorNumber);
            Assert.True(def.IsBossFloor);
            Assert.False(string.IsNullOrEmpty(def.BossType));
            Assert.True(def.HealthMultiplier > 1.0f);
        }

        [Fact]
        public void SpireFloor_Floor100_IsGenesisSovereign()
        {
            var def = EndlessSpireEngine.GetFloorDefinition(100);

            Assert.Equal(100, def.FloorNumber);
            Assert.True(def.IsBossFloor);
            Assert.Equal("GenesisSovereign", def.BossType);
            Assert.Equal(9.0f, def.HealthMultiplier); // 1 + 100 * 0.08 = 9.0
        }

        [Fact]
        public void SpireFloor_AccessControl_AllowsNextFloorOnly()
        {
            Assert.True(EndlessSpireEngine.CanAccessFloor(1, 0));
            Assert.True(EndlessSpireEngine.CanAccessFloor(15, 14)); // Cleared 14 -> Can enter 15
            Assert.False(EndlessSpireEngine.CanAccessFloor(20, 14)); // Cleared 14 -> Cannot jump to 20
        }
    }
}
