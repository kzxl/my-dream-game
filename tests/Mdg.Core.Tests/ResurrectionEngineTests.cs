using Mdg.Core.Features.Combat;
using Xunit;

namespace Mdg.Core.Tests
{
    public class ResurrectionEngineTests
    {
        [Fact]
        public void TownResurrection_RestoresFullLifeManaEs_AndClearsDeadState()
        {
            var state = new PlayerDefeatState("hero_test", "MoltenCaldera")
            {
                IsDead = true,
                ZoneResurrectionsUsed = 3
            };

            var result = ResurrectionEngine.ExecuteTownResurrection(state, 300f, 150f, 100f);

            Assert.True(result.Success);
            Assert.False(state.IsDead);
            Assert.Equal("SanctuaryHaven", state.CurrentZoneId);
            Assert.Equal(300f, result.NewLife);
            Assert.Equal(150f, result.NewMana);
            Assert.Equal(100f, result.NewEs);
            Assert.Equal(PlayerDefeatState.TownInvulnerableDurationSeconds, result.InvulnerableDuration);
            Assert.True(result.IsTownResurrection);
        }

        [Fact]
        public void SpotResurrection_ConsumesScroll_GrantsInvulnerability_IncrementsCounter()
        {
            var state = new PlayerDefeatState("hero_test", "FrostpeakTundra")
            {
                IsDead = true,
                ZoneResurrectionsUsed = 1
            };

            int scrolls = 3;
            var result = ResurrectionEngine.ExecuteSpotResurrection(state, ref scrolls, 250f, 100f, 80f);

            Assert.True(result.Success);
            Assert.False(state.IsDead);
            Assert.Equal(2, scrolls); // Consumed 1 scroll
            Assert.Equal(2, state.ZoneResurrectionsUsed);
            Assert.Equal(3, result.RemainingZoneResurrections); // 5 - 2 = 3
            Assert.Equal(PlayerDefeatState.SpotInvulnerableDurationSeconds, result.InvulnerableDuration);
            Assert.False(result.IsTownResurrection);
        }

        [Fact]
        public void SpotResurrection_Fails_WhenLimitOf5IsExceeded()
        {
            var state = new PlayerDefeatState("hero_test", "DreadTombs")
            {
                IsDead = true,
                ZoneResurrectionsUsed = 5 // Already used 5/5
            };

            int scrolls = 10;
            var result = ResurrectionEngine.ExecuteSpotResurrection(state, ref scrolls, 250f, 100f, 80f);

            Assert.False(result.Success);
            Assert.Contains("Zone resurrection limit reached", result.Message);
            Assert.Equal(10, scrolls); // Not consumed
            Assert.Equal(0, result.RemainingZoneResurrections);
        }

        [Fact]
        public void SpotResurrection_Fails_WhenZeroScrollsAvailable()
        {
            var state = new PlayerDefeatState("hero_test", "DreadTombs")
            {
                IsDead = true,
                ZoneResurrectionsUsed = 0
            };

            int scrolls = 0; // No scrolls
            var result = ResurrectionEngine.ExecuteSpotResurrection(state, ref scrolls, 250f, 100f, 80f);

            Assert.False(result.Success);
            Assert.Contains("No Scroll of Resurrection", result.Message);
            Assert.Equal(0, scrolls);
        }

        [Fact]
        public void ZoneTransition_ResetsResurrectionLimit()
        {
            var state = new PlayerDefeatState("hero_test", "MoltenCaldera")
            {
                ZoneResurrectionsUsed = 4
            };

            Assert.Equal(1, state.RemainingZoneResurrections);

            // Travel to new zone
            state.ResetZoneSession("ForgottenCrypt");

            Assert.Equal("ForgottenCrypt", state.CurrentZoneId);
            Assert.Equal(0, state.ZoneResurrectionsUsed);
            Assert.Equal(PlayerDefeatState.MaxZoneResurrections, state.RemainingZoneResurrections);
            Assert.True(state.HasZoneResurrectionsRemaining);
        }
    }
}
