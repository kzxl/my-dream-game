using System.Collections.Generic;
using Mdg.Core.Features.Combat;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class ShadowExtractionTests
    {
        [Fact]
        public void ShadowExtraction_ScalesStatsTo60Percent()
        {
            var army = new List<ShadowSoldierEntity>();

            var success = ShadowExtractionEngine.TryExtractShadow(
                "Undead Knight",
                "undead_knight",
                "Rare",
                1000,
                200,
                army,
                3,
                out var soldier,
                out var msg);

            Assert.True(success);
            Assert.NotNull(soldier);
            Assert.Equal("Shadow Undead Knight", soldier.Name);
            Assert.Equal(600, soldier.MaxLife); // 1000 * 0.6 = 600
            Assert.Equal(120, soldier.Damage);  // 200 * 0.6 = 120
            Assert.Single(army);
            Assert.Contains("ARISE!", msg);
        }

        [Fact]
        public void ShadowExtraction_RespectsMaxArmyCapacity()
        {
            var army = new List<ShadowSoldierEntity>();

            // Add 3 soldiers
            ShadowExtractionEngine.TryExtractShadow("Wolf 1", "wolf", "Normal", 300, 50, army, 3, out _, out _);
            ShadowExtractionEngine.TryExtractShadow("Wolf 2", "wolf", "Normal", 300, 50, army, 3, out _, out _);
            ShadowExtractionEngine.TryExtractShadow("Wolf 3", "wolf", "Normal", 300, 50, army, 3, out _, out _);
            Assert.Equal(3, army.Count);

            // Add 4th soldier -> capacity capped at 3, removes oldest
            ShadowExtractionEngine.TryExtractShadow("Boss Sovereign", "boss", "Boss", 5000, 800, army, 3, out var bossSoldier, out _);

            Assert.Equal(3, army.Count);
            Assert.Equal("Shadow Boss Sovereign", army[2].Name);
            Assert.Equal("Shadow Wolf 2", army[0].Name); // Wolf 1 was removed
        }
    }
}
