using System.Collections.Generic;
using Mdg.Core.Features.Items;
using Mdg.Core.Features.Items.Crafting;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class SalvageAndForgeTests
    {
        [Fact]
        public void SalvageAnvil_NormalItem_ProducesIronOreAndBeastLeather()
        {
            var anvil = new SalvageAnvil();
            var item = new ItemEntity("Worn Club", "club", ItemRarity.Normal, ItemSlot.MainHand, 1);

            var result = anvil.Salvage(item);

            Assert.True(result.Success);
            Assert.True(result.ProducedMaterials.ContainsKey("mat_iron_ore"));
            Assert.Equal(3, result.ProducedMaterials["mat_iron_ore"]);
            Assert.True(result.ProducedMaterials.ContainsKey("mat_beast_leather"));
            Assert.Equal(1, result.ProducedMaterials["mat_beast_leather"]);
        }

        [Fact]
        public void SalvageAnvil_RareItem_ProducesAdamantiteAndGenesisShards()
        {
            var anvil = new SalvageAnvil();
            var item = new ItemEntity("Dragonfang Greatsword", "sword_2h", ItemRarity.Rare, ItemSlot.MainHand, 45);

            var result = anvil.Salvage(item);

            Assert.True(result.Success);
            Assert.True(result.ProducedMaterials.ContainsKey("mat_adamantite_ingot"));
            Assert.Equal(6, result.ProducedMaterials["mat_adamantite_ingot"]);
            Assert.True(result.ProducedMaterials.ContainsKey("mat_shard_genesis"));
            Assert.Equal(1, result.ProducedMaterials["mat_shard_genesis"]);
        }

        [Fact]
        public void BaseEquipmentSynthesizer_ValidMaterials_ForgesItemAndDeductsMaterials()
        {
            var synthesizer = new BaseEquipmentSynthesizer();
            var materials = new Dictionary<string, int>
            {
                { "mat_iron_ore", 10 },
                { "mat_beast_leather", 5 }
            };

            var success = synthesizer.TryForgeBase("forge_iron_sword", materials, out var forgedItem, out var message);

            Assert.True(success);
            Assert.NotNull(forgedItem);
            Assert.Equal("Iron Longsword", forgedItem.Name);
            Assert.Equal(ItemRarity.Normal, forgedItem.Rarity);
            Assert.Equal(ItemSlot.MainHand, forgedItem.Slot);
            Assert.Equal(5, materials["mat_iron_ore"]); // 10 - 5 = 5
            Assert.Equal(3, materials["mat_beast_leather"]); // 5 - 2 = 3
        }

        [Fact]
        public void BaseEquipmentSynthesizer_InsufficientMaterials_FailsWithoutDeducting()
        {
            var synthesizer = new BaseEquipmentSynthesizer();
            var materials = new Dictionary<string, int>
            {
                { "mat_iron_ore", 2 },
                { "mat_beast_leather", 5 }
            };

            var success = synthesizer.TryForgeBase("forge_iron_sword", materials, out var forgedItem, out var message);

            Assert.False(success);
            Assert.Null(forgedItem);
            Assert.Contains("Insufficient material", message);
            Assert.Equal(2, materials["mat_iron_ore"]); // Unchanged
        }
    }
}
