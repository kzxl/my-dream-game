using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Items.Market
{
    public sealed class MarketService
    {
        public const float TaxRate = 0.05f; // 5% Gold sink tax
        public const int MinimumListingFeeGold = 25;

        public static readonly HashSet<string> AllowedCurrencies = new(StringComparer.OrdinalIgnoreCase)
        {
            "fracture_core",
            "genesis_prism",
            "aether_spark",
            "gold"
        };

        /// <summary>
        /// Tính toán phí niêm yết (Listing Fee) trừ vào Vàng của người bán nhằm điều tiết nền kinh tế (Gold Sink).
        /// </summary>
        public int CalculateListingTax(int priceAmount, string currency)
        {
            if (string.Equals(currency, "gold", StringComparison.OrdinalIgnoreCase))
            {
                return Math.Max(MinimumListingFeeGold, (int)Math.Ceiling(priceAmount * TaxRate));
            }

            // Với Tinh Thể Khởi Nguyên (Catalysts), tính phí Vàng cố định dựa theo bậc tiền tệ
            int baseValueInGold = currency.ToLower() switch
            {
                "fracture_core" => 2500,
                "genesis_prism" => 500,
                "aether_spark"  => 100,
                _               => 100
            };

            int totalGoldEquivalent = priceAmount * baseValueInGold;
            return Math.Max(MinimumListingFeeGold, (int)Math.Ceiling(totalGoldEquivalent * TaxRate));
        }

        public bool ValidateListing(string itemJson, int priceAmount, string priceCurrency, out string errorMessage)
        {
            if (string.IsNullOrWhiteSpace(itemJson) || itemJson.Trim() == "{}")
            {
                errorMessage = "Cannot list empty item.";
                return false;
            }

            if (priceAmount <= 0)
            {
                errorMessage = "Price amount must be greater than 0.";
                return false;
            }

            if (!AllowedCurrencies.Contains(priceCurrency))
            {
                errorMessage = $"Currency '{priceCurrency}' is not supported for trade listing.";
                return false;
            }

            errorMessage = string.Empty;
            return true;
        }
    }
}
