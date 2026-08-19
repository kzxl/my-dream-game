using System;
using System.Collections.Generic;
using Mdg.Core.Features.Combat;

namespace Mdg.Core.Features.Items
{
    public sealed class LootTable
    {
        private static readonly Random _rng = new();

        // Master Dictionary of Signature Monster Artifacts on Server
        public static readonly Dictionary<string, (string Name, string Slot, string Icon, string Desc, Action<ItemEntity> ModBuilder)> SignatureUniqueTemplates = new()
        {
            ["goblin_scout"] = (
                "Scout's Poisoned Pouch",
                "Amulet",
                "🎒",
                "+25% Movement Speed after Dash & Attacks inflict +40 Poison Damage over 3s",
                item => {
                    item.AddMod("+25% Movement Speed after Dash", "MoveSpeed", 25);
                    item.AddMod("+40 Poison Damage over 3s", "PoisonDmg", 40);
                }
            ),
            ["direwolf"] = (
                "Fang of the Alpha Wolf",
                "MainHand",
                "🐺",
                "+35% Critical Strike Multiplier & Bleed damage dealt to enemies is tripled",
                item => {
                    item.AddMod("+35% Critical Strike Multiplier", "CritMulti", 35);
                    item.AddMod("Bleed damage dealt to enemies is tripled", "BleedTripled", 1);
                }
            ),
            ["skeleton_warrior"] = (
                "Aegis of the Forgotten Crypt",
                "OffHand",
                "🛡️",
                "+25% Block Chance (Cap 75%) & Blocking grants +120 Temporary Energy Shield",
                item => {
                    item.AddMod("+25% Block Chance (Cap 75%)", "BlockChance", 25);
                    item.AddMod("+120 Energy Shield on Block", "EsOnBlock", 120);
                }
            ),
            ["malakor"] = (
                "Malakor’s Dreadfire Cleaver",
                "MainHand",
                "🗡️",
                "Converts 50% Physical Damage to Chaos & Calls down a blazing Hellfire Pillar on Critical Hit",
                item => {
                    item.AddMod("50% Physical Converted to Chaos", "PhysToChaos", 50);
                    item.AddMod("+65 to Chaos Damage", "FlatChaos", 65);
                    item.AddMod("Spawns Hellfire Pillar on Critical Hit", "HellfirePillar", 1);
                }
            ),
            ["frost_elemental"] = (
                "Core of Absolute Zero",
                "Amulet",
                "💎",
                "+40% Cold Damage & Shatters frozen enemies into explosive ice shrapnel",
                item => {
                    item.AddMod("+40% to Cold Damage", "ColdDmg", 40);
                    item.AddMod("Shatters frozen enemies into explosive ice shrapnel", "IceShatterAoE", 1);
                }
            ),
            ["yeti"] = (
                "Yeti Warmaster Hide",
                "BodyArmor",
                "🥋",
                "+350 Armor & Grants complete immunity to Stun and Freeze effects",
                item => {
                    item.AddMod("+350 to Armor", "Armor", 350);
                    item.AddMod("100% Immunity to Stun and Freeze", "ImmuneFreezeStun", 1);
                }
            ),
            ["vael_frost"] = (
                "Vael’s Glacial Spire Staff",
                "MainHand",
                "🪄",
                "+3 to All Cold Skill Gems & Frost Nova releases a second expanding vortex ring",
                item => {
                    item.AddMod("+3 to All Cold Skill Gems", "ColdGemLevel", 3);
                    item.AddMod("+55% to Cold Damage", "ColdDmg", 55);
                    item.AddMod("Frost Nova releases a second expanding vortex ring", "DoubleFrostNova", 1);
                }
            ),
            ["magma_golem"] = (
                "Heart of the Molten Colossus",
                "Ring",
                "❤️‍🔥",
                "+20% Maximum Life & Taking Fire damage grants 40% Increased Attack & Cast Speed",
                item => {
                    item.AddMod("+20% Maximum Life", "MaxLifePercent", 20);
                    item.AddMod("+40% Attack & Cast Speed on Fire hit", "FireSpeedBuff", 40);
                }
            ),
            ["ignis_dragon"] = (
                "Crown of the Scourge Wyrm",
                "Helm",
                "👑",
                "Fireball transforms into Draconic Flame (Fires 3 piercing fire dragons with 100% Ignite chance)",
                item => {
                    item.AddMod("+150 to Maximum Life", "MaxLife", 150);
                    item.AddMod("+50% to Fire Damage", "FireDmg", 50);
                    item.AddMod("Fireball fires 3 piercing Draconic Dragons", "DraconicFireball", 1);
                }
            ),
            ["abyssal_stalker"] = (
                "Eye of the Deep Trench",
                "Ring",
                "👁️",
                "+30% Chaos Damage & Crits inflict Void Siphon, restoring 10% Energy Shield",
                item => {
                    item.AddMod("+30% to Chaos Damage", "ChaosDmg", 30);
                    item.AddMod("Crits restore 10% Energy Shield", "VoidSiphonEs", 10);
                }
            ),
            ["leviathan"] = (
                "Tenebris Abyssal Trident",
                "MainHand",
                "🔱",
                "All attacks discharge expanding tidal waves that pull enemies inward and deal 250 Chaos Damage",
                item => {
                    item.AddMod("+80 to Physical Damage", "FlatPhys", 80);
                    item.AddMod("+60 to Chaos Damage", "FlatChaos", 60);
                    item.AddMod("Attacks discharge pulling Tidal Vortex", "TidalVortexProc", 1);
                }
            )
        };

        public static List<ItemEntity> GenerateMonsterDrops(
            string monsterType,
            MonsterRarity rarity = MonsterRarity.Normal,
            int zoneLevel = 1,
            float quantityBonus = 1.0f,
            float rarityBonus = 1.0f,
            int masteryRank = 0,
            int kills = 0)
        {
            var drops = new List<ItemEntity>();

            int iLvl = zoneLevel + rarity switch
            {
                MonsterRarity.Champion => 1,
                MonsterRarity.Rare => 2,
                MonsterRarity.PinnacleBoss => 3,
                _ => 0
            };

            // Mastery Rank 4 provides authoritative +30% IIR and +15% IIQ
            if (masteryRank >= 4)
            {
                rarityBonus += 0.30f;
                quantityBonus += 0.15f;
            }
            else if (masteryRank >= 3)
            {
                rarityBonus += 0.20f;
                quantityBonus += 0.10f;
            }
            else if (masteryRank >= 2)
            {
                rarityBonus += 0.15f;
            }

            // Calibrated balanced drop count (not too easy)
            int baseDropCount = rarity switch
            {
                MonsterRarity.PinnacleBoss => _rng.Next(3, 7), // 3-6 items for Boss
                MonsterRarity.Rare => _rng.Next(1, 3),         // 1-2 items for Rare
                MonsterRarity.Champion => (_rng.NextDouble() < 0.65f) ? 1 : 0,
                _ => (_rng.NextDouble() < (0.18f * quantityBonus)) ? 1 : 0 // 18% base drop rate
            };

            int dropCount = Math.Max(0, (int)Math.Round(baseDropCount * Math.Max(1.0f, quantityBonus)));

            // 1. Signature Unique Artifact Drop Check (Requires Mastery Rank >= 3)
            if (masteryRank >= 3 && SignatureUniqueTemplates.TryGetValue(monsterType.ToLowerInvariant(), out var sigTpl))
            {
                double sigRoll = _rng.NextDouble() * 100f;
                double sigThreshold = rarity == MonsterRarity.PinnacleBoss ? 12.0f : 2.5f; // 12% Boss, 2.5% Elite/Monster

                if (sigRoll < sigThreshold * rarityBonus)
                {
                    var sigItem = new ItemEntity(
                        sigTpl.Name,
                        "Signature Artifact",
                        ItemRarity.Unique,
                        Enum.TryParse<ItemSlot>(sigTpl.Slot, true, out var parsedSlot) ? parsedSlot : ItemSlot.Amulet,
                        iLvl,
                        sigTpl.Icon,
                        sockets: 3,
                        links: 3
                    );
                    sigTpl.ModBuilder(sigItem);
                    drops.Add(sigItem);
                }
            }

            // 2. Generate standard equipment & currency drops
            for (int i = 0; i < dropCount; i++)
            {
                drops.Add(RollRandomItemByMonsterTier(rarity, iLvl, rarityBonus, masteryRank));
            }

            return drops;
        }

        public static ItemEntity RollRandomItemByMonsterTier(MonsterRarity monsterTier, int itemLevel = 1, float rarityBonus = 1.0f, int masteryRank = 0)
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
                MonsterRarity.PinnacleBoss => 32f,
                MonsterRarity.Rare => 20f,
                MonsterRarity.Champion => 14f,
                _ => 8f
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
            double uniqueThreshold = monsterTier switch
            {
                MonsterRarity.PinnacleBoss => 8.0f,
                MonsterRarity.Rare => 3.0f,
                MonsterRarity.Champion => 1.0f,
                _ => 0.3f
            };

            double setThreshold = uniqueThreshold + monsterTier switch
            {
                MonsterRarity.PinnacleBoss => 14.0f,
                MonsterRarity.Rare => 6.0f,
                MonsterRarity.Champion => 3.0f,
                _ => 1.0f
            };

            double rareThreshold = setThreshold + monsterTier switch
            {
                MonsterRarity.PinnacleBoss => 55.0f,
                MonsterRarity.Rare => 48.0f,
                MonsterRarity.Champion => 22.0f,
                _ => (masteryRank >= 2 ? 14.0f : 6.0f) // Rare items unlocked/boosted with Mastery
            };

            double magicThreshold = rareThreshold + monsterTier switch
            {
                MonsterRarity.PinnacleBoss => 15.0f,
                MonsterRarity.Rare => 32.0f,
                MonsterRarity.Champion => 48.0f,
                _ => 36.0f
            };

            if (roll < uniqueThreshold)
            {
                var unique = new ItemEntity("Crown of the Void", "Hubris Circlet", ItemRarity.Unique, ItemSlot.Helm, itemLevel, "👑", sockets, links);
                unique.AddMod("+120 to Maximum Energy Shield", "MaxEs", 120);
                unique.AddMod("+30% to Chaos Resistance", "ChaosRes", 30);
                unique.AddMod("Chaos Damage cannot bypass Energy Shield");
                return unique;
            }

            if (roll < setThreshold)
            {
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
                var magic = new ItemEntity("Reinforced Kite Shield", "Shield", ItemRarity.Magic, ItemSlot.OffHand, itemLevel, "🛡️", sockets, links);
                magic.AddMod("+150 to Armor", "Armor", 150);
                magic.AddMod("+25% to Fire Resistance", "FireRes", 25);
                return magic;
            }

            var normal = new ItemEntity("Iron Greaves", "Boots", ItemRarity.Normal, ItemSlot.None, itemLevel, "👢", sockets, links);
            return normal;
        }
    }
}
