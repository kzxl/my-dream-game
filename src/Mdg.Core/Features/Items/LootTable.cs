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
                MonsterRarity.Rare => 2,
                MonsterRarity.PinnacleBoss => 3,
                _ => 0
            };

            int baseDropCount = rarity switch
            {
                MonsterRarity.PinnacleBoss => _rng.Next(4, 9), // 4-8 items
                MonsterRarity.Rare => _rng.Next(2, 5),         // 2-4 items
                MonsterRarity.Champion => _rng.Next(1, 3),     // 1-2 items
                _ => (_rng.NextDouble() < 0.25f * quantityBonus) ? 1 : 0 // 25% drop rate
            };

            int dropCount = Math.Max(0, (int)Math.Round(baseDropCount * Math.Max(1.0f, quantityBonus)));

            for (int i = 0; i < dropCount; i++)
            {
                drops.Add(RollRandomItemByMonsterTier(rarity, iLvl, rarityBonus));
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
            return RollRandomItemByMonsterTier(isBoss ? MonsterRarity.PinnacleBoss : MonsterRarity.Normal, itemLevel, rarityBonus);
        }

        public static ItemEntity RollRandomItemByMonsterTier(MonsterRarity monsterTier, int itemLevel = 1, float rarityBonus = 1.0f)
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

            // 1. Currency & Consumable Roll (Scroll of Resurrection, Catalysts, Prisms)
            double currencyRoll = _rng.NextDouble() * 100f;
            double currencyThreshold = monsterTier switch
            {
                MonsterRarity.PinnacleBoss => 35f,
                MonsterRarity.Rare => 22f,
                MonsterRarity.Champion => 16f,
                _ => 10f
            };

            if (currencyRoll < currencyThreshold)
            {
                int currRoll = _rng.Next(7);
                return currRoll switch
                {
                    0 => new ItemEntity("Scroll of Resurrection", "Consumable", ItemRarity.Consumable, ItemSlot.None, itemLevel, "📜")
                        .AddMod("Instantly revives character upon defeat with full Life and 3.5s Divine Shield"),
                    1 => new ItemEntity("Fracture Core", "Currency", ItemRarity.Currency, ItemSlot.None, itemLevel, "🔮")
                        .AddMod("Reforges a rare item with new random modifiers"),
                    2 => new ItemEntity("Genesis Prism", "Currency", ItemRarity.Currency, ItemSlot.None, itemLevel, "💎")
                        .AddMod("Upgrades a normal item to a rare item with 4-6 modifiers"),
                    3 => new ItemEntity("Ascendant Catalyst", "Currency", ItemRarity.Currency, ItemSlot.None, itemLevel, "🌟")
                        .AddMod("Augments a rare item with a new random modifier"),
                    4 => new ItemEntity("Aether Spark", "Currency", ItemRarity.Currency, ItemSlot.None, itemLevel, "✨")
                        .AddMod("Upgrades a normal item to a magic item"),
                    5 => new ItemEntity("Flux Catalyst", "Currency", ItemRarity.Currency, ItemSlot.None, itemLevel, "🔷")
                        .AddMod("Rerolls modifiers on a magic item"),
                    _ => new ItemEntity("Harmonic Tether", "Currency", ItemRarity.Currency, ItemSlot.None, itemLevel, "🔗")
                        .AddMod("Reforges the links between sockets on an item")
                };
            }

            // 2. Equipment Rarity Thresholds by Monster Tier
            // Boss: Unique 12%, Set 18%, Rare 55%, Magic 15%, Normal 0%
            // Rare: Unique 5%, Set 8%, Rare 52%, Magic 30%, Normal 5%
            // Champion: Unique 2%, Set 4%, Rare 24%, Magic 45%, Normal 25%
            // Normal: Unique 1%, Set 2%, Rare 10%, Magic 32%, Normal 55%

            double uniqueThreshold = monsterTier switch
            {
                MonsterRarity.PinnacleBoss => 12f,
                MonsterRarity.Rare => 5f,
                MonsterRarity.Champion => 2f,
                _ => 1f
            };

            double setThreshold = uniqueThreshold + monsterTier switch
            {
                MonsterRarity.PinnacleBoss => 18f,
                MonsterRarity.Rare => 8f,
                MonsterRarity.Champion => 4f,
                _ => 2f
            };

            double rareThreshold = setThreshold + monsterTier switch
            {
                MonsterRarity.PinnacleBoss => 55f,
                MonsterRarity.Rare => 52f,
                MonsterRarity.Champion => 24f,
                _ => 10f
            };

            double magicThreshold = rareThreshold + monsterTier switch
            {
                MonsterRarity.PinnacleBoss => 15f,
                MonsterRarity.Rare => 30f,
                MonsterRarity.Champion => 45f,
                _ => 32f
            };

            if (roll < uniqueThreshold)
            {
                // Unique
                var unique = new ItemEntity("Crown of the Void", "Hubris Circlet", ItemRarity.Unique, ItemSlot.Helm, itemLevel, "👑", sockets, links);
                unique.AddMod("+120 to Maximum Energy Shield", "MaxEs", 120);
                unique.AddMod("+30% to Chaos Resistance", "ChaosRes", 30);
                unique.AddMod("Chaos Damage cannot bypass Energy Shield");
                return unique;
            }

            if (roll < setThreshold)
            {
                // Set Item
                int setRoll = _rng.Next(3);
                if (setRoll == 0)
                {
                    var setPiece = new ItemEntity("Vanguard Bastion Cuirass", "Set Body Armor", ItemRarity.Set, ItemSlot.BodyArmor, itemLevel, "🛡️", sockets, links);
                    setPiece.AddMod("+220 to Maximum Life", "MaxLife", 220);
                    setPiece.AddMod("+350 to Armor", "Armor", 350);
                    setPiece.AddMod("[Set 2pc]: +400 Armor & 15% Block Chance");
                    setPiece.AddMod("[Set 3pc]: Heavy Slash unleashes Triple Holy Blade Waves!");
                    return setPiece;
                }
                else if (setRoll == 1)
                {
                    var setPiece = new ItemEntity("Ignis Pyre Robe", "Set Body Armor", ItemRarity.Set, ItemSlot.BodyArmor, itemLevel, "🔥", sockets, links);
                    setPiece.AddMod("+180 to Maximum Mana", "MaxMana", 180);
                    setPiece.AddMod("+45% to Fire Damage", "FireDmg", 45);
                    setPiece.AddMod("[Set 2pc]: +50% Ignite Duration");
                    setPiece.AddMod("[Set 3pc]: Attacks rain down mini-meteors upon targets!");
                    return setPiece;
                }
                else
                {
                    var setPiece = new ItemEntity("Vael Frost Sovereign Crown", "Set Helm", ItemRarity.Set, ItemSlot.Helm, itemLevel, "❄️", sockets, links);
                    setPiece.AddMod("+140 to Energy Shield", "MaxEs", 140);
                    setPiece.AddMod("+35% to Cold Resistance", "ColdRes", 35);
                    setPiece.AddMod("[Set 2pc]: +50% Freeze Duration");
                    setPiece.AddMod("[Set 3pc]: Frozen enemies shatter into 8 ice shards!");
                    return setPiece;
                }
            }

            if (roll < rareThreshold)
            {
                // Rare Item
                var rare = new ItemEntity("Dragonbone Greataxe", "Battle Axe", ItemRarity.Rare, ItemSlot.MainHand, itemLevel, "🪓", sockets, links);
                rare.AddMod("+45 to Physical Damage", "FlatPhys", 45);
                rare.AddMod("+35% Increased Attack Speed", "AttackSpeed", 35);
                rare.AddMod("+25% to Global Critical Multiplier", "CritMulti", 25);
                if (itemLevel >= 50)
                {
                    rare.AddMod("+85 to Maximum Life", "MaxLife", 85);
                }
                return rare;
            }

            if (roll < magicThreshold)
            {
                // Magic Item
                var magic = new ItemEntity("Reinforced Kite Shield", "Shield", ItemRarity.Magic, ItemSlot.OffHand, itemLevel, "🛡️", sockets, links);
                magic.AddMod("+150 to Armor", "Armor", 150);
                magic.AddMod("+25% to Fire Resistance", "FireRes", 25);
                return magic;
            }

            // Normal Item
            var normal = new ItemEntity("Iron Greaves", "Boots", ItemRarity.Normal, ItemSlot.None, itemLevel, "👢", sockets, links);
            return normal;
        }
    }
}
