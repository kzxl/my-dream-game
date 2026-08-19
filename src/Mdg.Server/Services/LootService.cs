using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Mdg.Core.Features.Combat;
using Mdg.Core.Features.Items;

namespace Mdg.Server.Services
{
    public sealed class LootService
    {
        public LootDropResultDto GenerateDrops(LootDropRequestDto req)
        {
            var monsterTier = req.MonsterRarity?.ToLowerInvariant() switch
            {
                "champion" or "magic" => MonsterRarity.Champion,
                "rare" => MonsterRarity.Rare,
                "boss" or "pinnacleboss" => MonsterRarity.PinnacleBoss,
                _ => req.IsBoss ? MonsterRarity.PinnacleBoss : MonsterRarity.Normal
            };

            int monsterLevel = req.MonsterLevel > 0 ? req.MonsterLevel : 1;
            float quantityBonus = Math.Max(0.5f, req.PlayerIiq > 0 ? 1.0f + (req.PlayerIiq / 100f) : 1.0f);
            float rarityBonus = Math.Max(0.5f, req.PlayerIir > 0 ? 1.0f + (req.PlayerIir / 100f) : 1.0f);

            var items = LootTable.GenerateMonsterDrops(
                req.MonsterType ?? "monster",
                monsterTier,
                monsterLevel,
                quantityBonus,
                rarityBonus,
                req.MasteryRank,
                req.Kills);

            var itemDtos = new List<LootItemDto>();
            foreach (var item in items)
            {
                itemDtos.Add(MapToDto(item));
            }

            return new LootDropResultDto(
                itemDtos,
                itemDtos.Count,
                monsterTier.ToString(),
                monsterLevel);
        }

        public LootItemDto MapToDto(ItemEntity item)
        {
            int beamHeight = 0;
            if (item.Rarity == ItemRarity.Unique || item.Rarity == ItemRarity.Set || item.Rarity == ItemRarity.Gem)
            {
                beamHeight = 350;
            }
            else if (item.Rarity == ItemRarity.Rare || item.Rarity == ItemRarity.Currency || item.Rarity == ItemRarity.Consumable)
            {
                beamHeight = 240;
            }

            return new LootItemDto
            {
                Id = item.Id.ToString(),
                Name = item.Name,
                BaseType = item.BaseType,
                Rarity = item.Rarity.ToString(),
                Slot = item.Slot.ToString().ToLowerInvariant(),
                ItemLevel = item.ItemLevel,
                Icon = item.Icon,
                Sockets = item.Sockets,
                SocketLinks = item.SocketLinks,
                ExplicitMods = item.ExplicitMods,
                StatBonuses = item.StatBonuses,
                BeamHeight = beamHeight
            };
        }
    }

    public record LootDropRequestDto(
        string? MonsterType,
        string? MonsterRarity,
        bool IsBoss,
        int MonsterLevel,
        string? ZoneId,
        float PlayerIir,
        float PlayerIiq,
        int MasteryRank = 0,
        int Kills = 0);

    public record LootDropResultDto(
        List<LootItemDto> Items,
        int TotalCount,
        string MonsterTier,
        int MonsterLevel);

    public class LootItemDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = "";

        [JsonPropertyName("name")]
        public string Name { get; set; } = "";

        [JsonPropertyName("baseType")]
        public string BaseType { get; set; } = "";

        [JsonPropertyName("rarity")]
        public string Rarity { get; set; } = "";

        [JsonPropertyName("slot")]
        public string Slot { get; set; } = "";

        [JsonPropertyName("itemLevel")]
        public int ItemLevel { get; set; } = 1;

        [JsonPropertyName("icon")]
        public string Icon { get; set; } = "📦";

        [JsonPropertyName("sockets")]
        public int Sockets { get; set; }

        [JsonPropertyName("socketLinks")]
        public int SocketLinks { get; set; }

        [JsonPropertyName("beamHeight")]
        public int BeamHeight { get; set; }

        [JsonPropertyName("explicitMods")]
        public List<string> ExplicitMods { get; set; } = new();

        [JsonPropertyName("statBonuses")]
        public Dictionary<string, float> StatBonuses { get; set; } = new();
    }
}
