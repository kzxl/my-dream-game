using System;
using System.Collections.Generic;
using Mdg.Core.Features.Combat;

namespace Mdg.Core.Features.Items
{
    public sealed class LootTable
    {
        private static readonly Random _rng = new();

        public static List<ItemEntity> GenerateMonsterDrops(
            string monsterType,
            MonsterRarity rarity = MonsterRarity.Normal,
            int zoneLevel = 1,
            float quantityBonus = 1.0f,
            float rarityBonus = 1.0f)
        {
            var drops = new List<ItemEntity>();

            int iLvl = zoneLevel + rarity switch
            {
                MonsterRarity.Champion => 1,
                MonsterRarity.Rare => 1,
                MonsterRarity.PinnacleBoss => 2,
                _ => 0
            };

            int baseDropCount = rarity switch
            {
                MonsterRarity.PinnacleBoss => _rng.Next(6, 12),
                MonsterRarity.Rare => _rng.Next(2, 5),
                MonsterRarity.Champion => _rng.Next(1, 3),
                _ => (_rng.NextDouble() < 0.35f * quantityBonus) ? 1 : 0
            };

            int dropCount = (int)Math.Round(baseDropCount * Math.Max(1.0f, quantityBonus));

            for (int i = 0; i < dropCount; i++)
            {
                drops.Add(RollRandomItem(rarity == MonsterRarity.PinnacleBoss, iLvl, rarityBonus));
            }

            return drops;
        }

        public static List<ItemEntity> GenerateMonsterDrops(string monsterType, bool isBoss, float quantityBonus = 1.0f, float rarityBonus = 1.0f)
        {
            return GenerateMonsterDrops(
                monsterType,
                isBoss ? MonsterRarity.PinnacleBoss : MonsterRarity.Normal,
                1,
                quantityBonus,
                rarityBonus);
        }

        public static ItemEntity RollRandomItem(bool isBoss, int itemLevel = 1, float rarityBonus = 1.0f)
        {
            double roll = _rng.NextDouble() * 100f / Math.Max(1.0f, rarityBonus);

            int maxSockets = itemLevel switch
            {
                >= 50 => 4,
                >= 25 => 3,
                _ => 2
            };

            int sockets = _rng.Next(1, maxSockets + 1);
            int links = _rng.Next(1, sockets + 1);

            if (isBoss && roll < 15)
            {
                // Unique
                var unique = new ItemEntity("Crown of the Void", "Hubris Circlet", ItemRarity.Unique, ItemSlot.Helm, itemLevel, "👑", sockets, links);
                unique.AddMod("+120 to Maximum Energy Shield", "MaxEs", 120);
                unique.AddMod("+30% to Chaos Resistance", "ChaosRes", 30);
                unique.AddMod("Chaos Damage cannot bypass Energy Shield");
                return unique;
            }

            if (roll < 35 || isBoss)
            {
                // Rare
                var rare = new ItemEntity("Dragonbone Greataxe", "Battle Axe", ItemRarity.Rare, ItemSlot.MainHand, itemLevel, "🪓", sockets, links);
                rare.AddMod("+45 to Physical Damage", "FlatPhys", 45);
                rare.AddMod("+35% Increased Attack Speed", "AttackSpeed", 35);
                rare.AddMod("+25% to Global Critical Multiplier", "CritMulti", 25);
                return rare;
            }

            if (roll < 60)
            {
                // Genesis Catalysts Currency
                int currRoll = _rng.Next(5);
                return currRoll switch
                {
                    0 => new ItemEntity("Fracture Core", "Currency", ItemRarity.Currency, ItemSlot.None, itemLevel, "🔮")
                        .AddMod("Reforges a rare item with new random modifiers"),
                    1 => new ItemEntity("Genesis Prism", "Currency", ItemRarity.Currency, ItemSlot.None, itemLevel, "💎")
                        .AddMod("Upgrades a normal item to a rare item"),
                    2 => new ItemEntity("Ascendant Catalyst", "Currency", ItemRarity.Currency, ItemSlot.None, itemLevel, "🌟")
                        .AddMod("Augments a rare item with a new random modifier"),
                    3 => new ItemEntity("Aether Spark", "Currency", ItemRarity.Currency, ItemSlot.None, itemLevel, "✨")
                        .AddMod("Upgrades a normal item to a magic item"),
                    _ => new ItemEntity("Harmonic Tether", "Currency", ItemRarity.Currency, ItemSlot.None, itemLevel, "🔗")
                        .AddMod("Reforges the links between sockets on an item")
                };
            }

            // Magic Item
            var magic = new ItemEntity("Reinforced Kite Shield", "Shield", ItemRarity.Magic, ItemSlot.OffHand, itemLevel, "🛡️", sockets, links);
            magic.AddMod("+150 to Armor", "Armor", 150);
            magic.AddMod("+25% to Fire Resistance", "FireRes", 25);
            return magic;
        }
    }
}
