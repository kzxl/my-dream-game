using System;
using Mdg.Core.Features.Items;
using Mdg.Core.Features.Items.Crafting;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class GenesisCraftingEngineTests
    {
        private readonly GenesisCraftingEngine _engine = new(new Random(42));
        private readonly GenesisForgeBench _bench = new();

        [Fact]
        public void ApplyAetherSpark_NormalItem_BecomesMagicWith1Or2Mods()
        {
            var item = new ItemEntity("Iron Greaves", "Boots", ItemRarity.Normal, ItemSlot.OffHand);
            bool ok = _engine.ApplyAetherSpark(item, out string msg);

            Assert.True(ok);
            Assert.Equal(ItemRarity.Magic, item.Rarity);
            Assert.InRange(item.ExplicitMods.Count, 1, 2);
        }

        [Fact]
        public void ApplyGenesisPrism_NormalItem_BecomesRareWith4To6Mods()
        {
            var item = new ItemEntity("Titan Plate", "BodyArmor", ItemRarity.Normal, ItemSlot.BodyArmor);
            bool ok = _engine.ApplyGenesisPrism(item, out string msg);

            Assert.True(ok);
            Assert.Equal(ItemRarity.Rare, item.Rarity);
            Assert.InRange(item.ExplicitMods.Count, 4, 6);
        }

        [Fact]
        public void ApplyFractureCore_RareItem_RerollsModifiers()
        {
            var item = new ItemEntity("War Cleaver", "Axe", ItemRarity.Normal, ItemSlot.MainHand);
            _engine.ApplyGenesisPrism(item, out _);

            int initialModCount = item.ExplicitMods.Count;
            bool ok = _engine.ApplyFractureCore(item, out string msg);

            Assert.True(ok);
            Assert.Equal(ItemRarity.Rare, item.Rarity);
            Assert.InRange(item.ExplicitMods.Count, 4, 6);
        }

        [Fact]
        public void ApplyAscendantCatalyst_RareItemWithSpace_AddsOneMod()
        {
            var item = new ItemEntity("Leather Hood", "Helm", ItemRarity.Rare, ItemSlot.Helm);
            item.AddMod("+20 to Life", "FlatLife", 20);

            bool ok = _engine.ApplyAscendantCatalyst(item, out string msg);

            Assert.True(ok);
            Assert.Equal(2, item.ExplicitMods.Count);
        }

        [Fact]
        public void ApplySocketingCoreAndHarmonicTether_ModifiesSocketsAndLinks()
        {
            var item = new ItemEntity("Gladiator Mail", "BodyArmor", ItemRarity.Normal, ItemSlot.BodyArmor);
            
            bool socketOk = _engine.ApplySocketingCore(item, out _);
            Assert.True(socketOk);
            Assert.InRange(item.Sockets, 1, 4);

            if (item.Sockets >= 2)
            {
                bool linkOk = _engine.ApplyHarmonicTether(item, out _);
                Assert.True(linkOk);
                Assert.InRange(item.SocketLinks, 2, item.Sockets);
            }
        }

        [Fact]
        public void GenesisForgeBench_LockPrefixes_RequiresCostAndSetsLock()
        {
            var item = new ItemEntity("Sacred Relic", "Amulet", ItemRarity.Rare, ItemSlot.Amulet);
            
            bool fail = _bench.TryLockPrefixes(item, 1, out _);
            Assert.False(fail);

            bool success = _bench.TryLockPrefixes(item, 3, out _);
            Assert.True(success);
            Assert.True(item.PrefixesLocked);
        }
    }
}
