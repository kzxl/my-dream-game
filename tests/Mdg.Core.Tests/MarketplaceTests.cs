using System;
using Mdg.Core.Features.Items.Market;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class MarketplaceTests
    {
        private readonly MarketService _marketService = new();

        [Fact]
        public void CalculateListingTax_GoldPrice_Applies5PercentSink()
        {
            int goldPrice = 1000;
            int tax = _marketService.CalculateListingTax(goldPrice, "gold");
            // 5% of 1000 = 50 gold
            Assert.Equal(50, tax);
        }

        [Fact]
        public void CalculateListingTax_CurrencyPrice_AppliesCatalystConversionTax()
        {
            int fractureCores = 2; // 2 * 2500 = 5000 gold equiv -> 5% = 250 gold
            int tax = _marketService.CalculateListingTax(fractureCores, "fracture_core");
            Assert.Equal(250, tax);
        }

        [Fact]
        public void ValidateListing_InvalidInputs_ReturnsFalse()
        {
            bool emptyItem = _marketService.ValidateListing("{}", 10, "gold", out var err1);
            Assert.False(emptyItem);
            Assert.NotEmpty(err1);

            bool zeroPrice = _marketService.ValidateListing("{\"id\":\"item1\"}", 0, "gold", out var err2);
            Assert.False(zeroPrice);
            Assert.NotEmpty(err2);

            bool invalidCurrency = _marketService.ValidateListing("{\"id\":\"item1\"}", 10, "bitcoin", out var err3);
            Assert.False(invalidCurrency);
            Assert.NotEmpty(err3);
        }

        [Fact]
        public void ValidateListing_ValidInputs_ReturnsTrue()
        {
            bool valid = _marketService.ValidateListing("{\"id\":\"weapon_mythic\",\"name\":\"Dragon Greataxe\"}", 5, "fracture_core", out var err);
            Assert.True(valid);
            Assert.Empty(err);
        }
    }
}
