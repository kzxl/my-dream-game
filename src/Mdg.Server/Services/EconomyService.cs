using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Mdg.Server.Services
{
    public sealed class EconomyService
    {
        public PetSellResultDto ProcessPetDelivery(PetSellRequestDto req)
        {
            if (req.Items == null || req.Items.Count == 0)
            {
                return new PetSellResultDto(true, 0, new Dictionary<string, int>(), new List<LootItemDto>(), "Pet returned with no cargo.");
            }

            int totalGold = 0;
            var currenciesEarned = new Dictionary<string, int>();
            var returnedItems = new List<LootItemDto>();

            foreach (var item in req.Items)
            {
                int itemGold = CalculateItemGoldValue(item);
                totalGold += itemGold;

                // Award Genesis Currencies based on rarity & item quality
                var rarity = item.Rarity?.ToLowerInvariant() ?? "normal";
                switch (rarity)
                {
                    case "magic":
                        AddCurrency(currenciesEarned, "Aether Spark", 1);
                        break;

                    case "rare":
                        AddCurrency(currenciesEarned, "Genesis Prism", 1);
                        if (item.ItemLevel >= 50) AddCurrency(currenciesEarned, "Fracture Core", 1);
                        break;

                    case "unique" or "set":
                        AddCurrency(currenciesEarned, "Ascendant Catalyst", 1);
                        AddCurrency(currenciesEarned, "Origin Matrix", 1);
                        break;

                    default:
                        // Normal items convert to Gold + chance of Aether Spark
                        if (Random.Shared.Next(100) < 30)
                        {
                            AddCurrency(currenciesEarned, "Aether Spark", 1);
                        }
                        break;
                }
            }

            // Generate returned currency items for player inventory
            foreach (var (currencyName, count) in currenciesEarned)
            {
                returnedItems.Add(new LootItemDto
                {
                    Id = "c_" + Guid.NewGuid().ToString("N")[..8],
                    Name = currencyName,
                    BaseType = "Currency",
                    Rarity = "Currency",
                    Slot = "currency",
                    ItemLevel = 1,
                    Icon = GetCurrencyIcon(currencyName),
                    BeamHeight = 240,
                    ExplicitMods = new List<string> { $"Stack: x{count}" },
                    StatBonuses = new Dictionary<string, float> { { "stack", count } }
                });
            }

            string msg = $"Pet safely returned from Town Market with {totalGold} Gold and {returnedItems.Count} Currency Bundles!";
            return new PetSellResultDto(true, totalGold, currenciesEarned, returnedItems, msg);
        }

        private static void AddCurrency(Dictionary<string, int> dict, string name, int amount)
        {
            if (dict.ContainsKey(name)) dict[name] += amount;
            else dict[name] = amount;
        }

        private static int CalculateItemGoldValue(LootItemDto item)
        {
            int baseValue = Math.Max(1, item.ItemLevel) * 15;
            var rarity = item.Rarity?.ToLowerInvariant() ?? "normal";
            float multiplier = rarity switch
            {
                "magic" => 2.5f,
                "rare" => 6.0f,
                "unique" => 20.0f,
                "set" => 25.0f,
                _ => 1.0f
            };

            int modBonus = (item.ExplicitMods?.Count ?? 0) * 20;
            return (int)Math.Round((baseValue * multiplier) + modBonus);
        }

        private static string GetCurrencyIcon(string name) => name switch
        {
            "Aether Spark" => "🔮",
            "Genesis Prism" => "💎",
            "Fracture Core" => "🌀",
            "Ascendant Catalyst" => "👑",
            "Origin Matrix" => "✨",
            "Flux Catalyst" => "🧪",
            "Socketing Core" => "⚪",
            "Harmonic Tether" => "🔗",
            _ => "💰"
        };
    }

    public record PetSellRequestDto(
        string? CharacterId,
        List<LootItemDto>? Items);

    public record PetSellResultDto(
        [property: JsonPropertyName("success")] bool Success,
        [property: JsonPropertyName("goldEarned")] int GoldEarned,
        [property: JsonPropertyName("currenciesEarned")] Dictionary<string, int> CurrenciesEarned,
        [property: JsonPropertyName("items")] List<LootItemDto> Items,
        [property: JsonPropertyName("message")] string Message);
}
