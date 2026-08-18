using System;
using Mdg.Core.Features.Items;
using Mdg.Core.Features.Maps;
using Mdg.Core.Features.Seasons;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class RiftAtlasAndSeasonTests
    {
        [Fact]
        public void RiftMapGenerator_UpgradeWithGenesisPrism_MakesRareWithMultipliers()
        {
            var gen = new RiftMapGenerator(new Random(42));
            var map = new RiftMapEntity("Molten Caldera", 10, ItemRarity.Normal);

            Assert.Equal(20f, map.TotalQuantityBonus); // Tier 10 * 2.0
            Assert.Equal(35f, map.TotalRarityBonus);   // Tier 10 * 3.5

            bool ok = gen.UpgradeWithGenesisPrism(map, out string msg);
            Assert.True(ok);
            Assert.Equal(ItemRarity.Rare, map.Rarity);
            Assert.InRange(map.Affixes.Count, 4, 6);

            // Multipliers should scale up significantly
            Assert.True(map.TotalQuantityBonus > 50f);
            Assert.True(map.TotalRarityBonus > 80f);
        }

        [Fact]
        public void RiftMapGenerator_RerollWithFractureCore_UpdatesAffixes()
        {
            var gen = new RiftMapGenerator(new Random(42));
            var map = new RiftMapEntity("Frostpeak Tundra", 15, ItemRarity.Rare);

            bool ok = gen.RerollWithFractureCore(map, out _);
            Assert.True(ok);
            Assert.InRange(map.Affixes.Count, 4, 6);
        }

        [Fact]
        public void SeasonLeagueEngine_TemporalObelisk_StartsAndTicksDown()
        {
            var season = new SeasonLeagueEngine();
            Assert.False(season.IsEventActive);

            bool started = season.TriggerTemporalObelisk(out _);
            Assert.True(started);
            Assert.True(season.IsEventActive);
            Assert.Equal(45, season.RemainingEventSeconds);

            season.TickEvent(30);
            Assert.Equal(15, season.RemainingEventSeconds);

            season.TickEvent(20);
            Assert.False(season.IsEventActive);
            Assert.Equal(0, season.RemainingEventSeconds);
        }

        [Fact]
        public void SeasonLeagueEngine_CorruptItem_AddsCorruptedModifier()
        {
            var season = new SeasonLeagueEngine(new Random(42));
            var weapon = new ItemEntity("Apex Dagger", "Dagger", ItemRarity.Rare, ItemSlot.MainHand);

            bool ok = season.TryCorruptItem(weapon, out string msg);
            Assert.True(ok);
            Assert.Contains(weapon.ExplicitMods, m => m.Contains("[Corrupted"));
        }
    }
}
