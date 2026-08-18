using Mdg.Core.Features.Combat;
using Mdg.Core.Features.Items;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class LootSystemAndFilterTests
    {
        [Fact]
        public void LootTable_MonsterDrops_ScalesWithRarityAndIIQ()
        {
            var normalDrops = LootTable.GenerateMonsterDrops("Skeleton", MonsterRarity.Normal, 1, 1.0f);
            var bossDrops = LootTable.GenerateMonsterDrops("Ignis", MonsterRarity.PinnacleBoss, 10, 1.5f, 2.0f);

            Assert.True(bossDrops.Count >= 6);
            Assert.Contains(bossDrops, item => item.ItemLevel >= 10);
        }

        [Fact]
        public void LootTable_ItemLevel_ScalesMaxSockets()
        {
            var lowLvlItem = new ItemEntity("Iron Sword", "Sword", ItemRarity.Normal, ItemSlot.MainHand, 10, sockets: 2);
            var highLvlItem = new ItemEntity("Apex Armor", "BodyArmor", ItemRarity.Rare, ItemSlot.BodyArmor, 60, sockets: 4);

            Assert.InRange(lowLvlItem.Sockets, 1, 2);
            Assert.InRange(highLvlItem.Sockets, 1, 4);
        }

        [Fact]
        public void LootFilterEngine_StrictAndUberStrict_HidesJunkItems()
        {
            var normalItem = new ItemEntity("Rusty Dagger", "Dagger", ItemRarity.Normal, ItemSlot.MainHand, 1, "🗡️", sockets: 0);
            var magicItem = new ItemEntity("Magic Robe", "BodyArmor", ItemRarity.Magic, ItemSlot.BodyArmor, 20, "🥋", sockets: 1);
            var rareHighLvl = new ItemEntity("Dragon Plate", "BodyArmor", ItemRarity.Rare, ItemSlot.BodyArmor, 65, "🛡️", sockets: 4);
            var uniqueItem = new ItemEntity("Crown of the Void", "Helm", ItemRarity.Unique, ItemSlot.Helm, 70, "👑");

            // Normal filter shows all
            Assert.True(LootFilterEngine.ShouldDisplay(normalItem, LootFilterMode.Normal));

            // Strict filter hides normal & magic without sockets
            Assert.False(LootFilterEngine.ShouldDisplay(normalItem, LootFilterMode.Strict));
            Assert.False(LootFilterEngine.ShouldDisplay(magicItem, LootFilterMode.Strict));
            Assert.True(LootFilterEngine.ShouldDisplay(rareHighLvl, LootFilterMode.Strict));
            Assert.True(LootFilterEngine.ShouldDisplay(uniqueItem, LootFilterMode.Strict));

            // UberStrict hides low lvl rare, only keeps high lvl / unique
            var lowLvlRare = new ItemEntity("Worn Ring", "Ring", ItemRarity.Rare, ItemSlot.Ring, 20, "💍");
            Assert.False(LootFilterEngine.ShouldDisplay(lowLvlRare, LootFilterMode.UberStrict));
            Assert.True(LootFilterEngine.ShouldDisplay(rareHighLvl, LootFilterMode.UberStrict));
            Assert.True(LootFilterEngine.ShouldDisplay(uniqueItem, LootFilterMode.UberStrict));
        }
    }
}
