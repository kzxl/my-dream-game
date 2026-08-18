using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Items
{
    public sealed class LootTable
    {
        private static readonly Random _rng = new();

        public static List<ItemEntity> GenerateMonsterDrops(string monsterType, bool isBoss, float quantityBonus = 1.0f, float rarityBonus = 1.0f)
        {
            var drops = new List<ItemEntity>();
            int dropCount = isBoss ? _rng.Next(3, 6) : (_rng.NextDouble() < 0.45f * quantityBonus ? 1 : 0);

            for (int i = 0; i < dropCount; i++)
            {
                drops.Add(RollRandomItem(isBoss, rarityBonus));
            }

            return drops;
        }

        private static ItemEntity RollRandomItem(bool isBoss, float rarityBonus)
        {
            double roll = _rng.NextDouble() * 100f / Math.Max(1.0f, rarityBonus);

            if (isBoss && roll < 15)
            {
                // Unique
                var unique = new ItemEntity("Crown of the Void", "Hubris Circlet", ItemRarity.Unique, ItemSlot.Helm, 25, "👑");
                unique.AddMod("+120 to Maximum Energy Shield", "MaxEs", 120);
                unique.AddMod("+30% to Chaos Resistance", "ChaosRes", 30);
                unique.AddMod("Chaos Damage cannot bypass Energy Shield");
                return unique;
            }

            if (roll < 35 || isBoss)
            {
                // Rare
                var rare = new ItemEntity("Dragonbone Greataxe", "Battle Axe", ItemRarity.Rare, ItemSlot.MainHand, 20, "🪓");
                rare.AddMod("+45 to Physical Damage", "FlatPhys", 45);
                rare.AddMod("+35% Increased Attack Speed", "AttackSpeed", 35);
                rare.AddMod("+25% to Global Critical Multiplier", "CritMulti", 25);
                return rare;
            }

            if (roll < 60)
            {
                // Currency
                int currRoll = _rng.Next(4);
                return currRoll switch
                {
                    0 => new ItemEntity("Chaos Orb", "Currency", ItemRarity.Currency, ItemSlot.None, 1, "🔮")
                        .AddMod("Reforges a rare item with new random modifiers"),
                    1 => new ItemEntity("Orb of Alchemy", "Currency", ItemRarity.Currency, ItemSlot.None, 1, "🧪")
                        .AddMod("Upgrades a normal item to a rare item"),
                    2 => new ItemEntity("Exalted Orb", "Currency", ItemRarity.Currency, ItemSlot.None, 1, "🌟")
                        .AddMod("Augments a rare item with a new random modifier"),
                    _ => new ItemEntity("Orb of Fusing", "Currency", ItemRarity.Currency, ItemSlot.None, 1, "🔗")
                        .AddMod("Reforges the links between sockets on an item")
                };
            }

            // Magic Item
            var magic = new ItemEntity("Reinforced Kite Shield", "Shield", ItemRarity.Magic, ItemSlot.OffHand, 10, "🛡️");
            magic.AddMod("+150 to Armor", "Armor", 150);
            magic.AddMod("+25% to Fire Resistance", "FireRes", 25);
            return magic;
        }
    }
}
