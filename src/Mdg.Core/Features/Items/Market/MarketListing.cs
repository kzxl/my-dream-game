using System;

namespace Mdg.Core.Features.Items.Market
{
    public enum MarketListingStatus
    {
        Active = 1,
        Sold = 2,
        Cancelled = 3,
        Expired = 4
    }

    public sealed class MarketListing
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        public string SellerAccountId { get; set; } = "guest";
        public string SellerCharacterName { get; set; } = "Unknown";
        public string ItemJson { get; set; } = "{}";
        public string ItemName { get; set; } = "Unknown Item";
        public string ItemRarity { get; set; } = "Normal";
        public string ItemCategory { get; set; } = "General";
        public int ItemLevel { get; set; } = 1;
        public int PriceAmount { get; set; } = 1;
        public string PriceCurrency { get; set; } = "fracture_core"; // fracture_core, genesis_prism, aether_spark, gold
        public int TaxGold { get; set; } = 0;
        public MarketListingStatus Status { get; set; } = MarketListingStatus.Active;
        public string? BuyerAccountId { get; set; }
        public string? BuyerCharacterName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime ExpireAt { get; set; } = DateTime.UtcNow.AddDays(7);
        public DateTime? SoldAt { get; set; }
    }
}
