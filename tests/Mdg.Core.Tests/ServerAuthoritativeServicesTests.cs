using System;
using System.Collections.Generic;
using Mdg.Server.Services;
using Xunit;

namespace Mdg.Core.Tests
{
    public class ServerAuthoritativeServicesTests
    {
        [Fact]
        public void LootService_Generates_Valid_Monster_Drops()
        {
            var service = new LootService();

            // Normal Monster
            var normalResult = service.GenerateDrops(new LootDropRequestDto("goblin", "normal", false, 5, "SanctuaryHaven", 0, 0));
            Assert.NotNull(normalResult);
            Assert.True(normalResult.TotalCount >= 0);

            // Pinnacle Boss
            var bossResult = service.GenerateDrops(new LootDropRequestDto("malakor", "boss", true, 25, "ForgottenCrypt", 50, 20));
            Assert.NotNull(bossResult);
            Assert.True(bossResult.TotalCount >= 4, "Boss should drop at least 4 items");
            Assert.Contains(bossResult.Items, i => !string.IsNullOrEmpty(i.Name));
        }

        [Fact]
        public void ForgeService_Applies_Transmutation_Alchemy_Chaos_Crafting()
        {
            var service = new ForgeService();

            var normalItem = new LootItemDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Iron Broadsword",
                BaseType = "Broadsword",
                Rarity = "Normal",
                Slot = "mainhand",
                ItemLevel = 20,
                StatBonuses = new Dictionary<string, float> { { "damage", 25 } }
            };

            // 1. Apply Transmute (Normal -> Magic)
            var transmuteRes = service.ApplyCurrency(new ForgeRequestDto("Currency_Transmute", normalItem));
            Assert.True(transmuteRes.Success);
            Assert.NotNull(transmuteRes.Item);
            Assert.Equal("Magic", transmuteRes.Item.Rarity);
            Assert.NotEmpty(transmuteRes.Item.ExplicitMods);

            // 2. Apply Scour (Magic -> Normal)
            var scourRes = service.ApplyCurrency(new ForgeRequestDto("Currency_Scouring", transmuteRes.Item));
            Assert.True(scourRes.Success);
            Assert.Equal("Normal", scourRes.Item.Rarity);
            Assert.Empty(scourRes.Item.ExplicitMods);

            // 3. Apply Alchemy (Normal -> Rare)
            var alchRes = service.ApplyCurrency(new ForgeRequestDto("Currency_Alchemy", scourRes.Item));
            Assert.True(alchRes.Success);
            Assert.Equal("Rare", alchRes.Item.Rarity);
            Assert.True(alchRes.Item.ExplicitMods.Count >= 4);

            // 4. Apply Chaos (Reroll Rare)
            var chaosRes = service.ApplyCurrency(new ForgeRequestDto("Currency_Chaos", alchRes.Item));
            Assert.True(chaosRes.Success);
            Assert.Equal("Rare", chaosRes.Item.Rarity);
            Assert.NotEmpty(chaosRes.Item.ExplicitMods);
        }

        [Fact]
        public void CharacterStatService_Calculates_Stats_And_Act_Penalties()
        {
            var service = new CharacterStatService();

            var equippedHelmet = new LootItemDto
            {
                Name = "Crown of Flame",
                Slot = "helm",
                StatBonuses = new Dictionary<string, float>
                {
                    { "life", 80 },
                    { "armor", 120 },
                    { "fireRes", 45 }
                }
            };

            // Act 1 (0% penalty)
            var act1Stats = service.CalculateStats(new CharacterStatsRequestDto(
                Level: 10,
                ClassSpec: "Vanguard",
                Strength: 30,
                Dexterity: 15,
                Intelligence: 10,
                CurrentAct: 1,
                EquippedItems: new List<LootItemDto> { equippedHelmet },
                AllocatedNodes: new List<string>()));

            Assert.Equal(390, act1Stats.MaxLife); // 100 + 150 + 60 + 80 = 390
            Assert.Equal(45, act1Stats.FireResistance); // 45 - 0 = 45

            // Act 4 (-45% penalty)
            var act4Stats = service.CalculateStats(new CharacterStatsRequestDto(
                Level: 10,
                ClassSpec: "Vanguard",
                Strength: 30,
                Dexterity: 15,
                Intelligence: 10,
                CurrentAct: 4,
                EquippedItems: new List<LootItemDto> { equippedHelmet },
                AllocatedNodes: new List<string>()));

            Assert.Equal(0, act4Stats.FireResistance); // 45 - 45 = 0
            Assert.Equal(45, act4Stats.ResistancePenalty);
        }

        [Fact]
        public void SkillProgressionService_Validates_Skill_Points()
        {
            var service = new SkillProgressionService();

            var validReq = new SkillValidationRequestDto(
                PlayerLevel: 10,
                ClassSpec: "Novice",
                AllocatedNodeIds: new List<string> { "node_1", "node_2", "node_3" },
                SelectedMasteries: null);

            var validRes = service.ValidateSkillAllocations(validReq);
            Assert.True(validRes.Valid);
            Assert.Equal(3, validRes.AllocatedPoints);
            Assert.Equal(7, validRes.RemainingPoints);

            var invalidReq = new SkillValidationRequestDto(
                PlayerLevel: 2,
                ClassSpec: "Novice",
                AllocatedNodeIds: new List<string> { "node_1", "node_2", "node_3", "node_4" },
                SelectedMasteries: null);

            var invalidRes = service.ValidateSkillAllocations(invalidReq);
            Assert.False(invalidRes.Valid);
        }

        [Fact]
        public void ProgressionService_Calculates_Exp_Gain_And_Level_Up()
        {
            var service = new ProgressionService();

            var req = new ExpGainRequestDto
            {
                CurrentLevel = 1,
                CurrentExp = 50,
                ExpGained = 300,
                ClassSpec = "Novice"
            };

            var res = service.CalculateExpGain(req);
            Assert.True(res.LeveledUp);
            Assert.True(res.NewLevel > 1);
            Assert.True(res.SkillPointsGained >= 1);
            Assert.True(res.MaxLifeGain > 0);
            Assert.True(res.MaxManaGain > 0);
            Assert.True(res.ExpToNext > 0);
        }

        [Fact]
        public void EconomyService_Calculates_Pet_Selling_Currencies_And_Gold()
        {
            var service = new EconomyService();

            var itemsToSell = new List<LootItemDto>
            {
                new() { Name = "Rusty Sword", Rarity = "Normal", ItemLevel = 10, Slot = "mainhand" },
                new() { Name = "Glinting Dagger", Rarity = "Magic", ItemLevel = 25, Slot = "mainhand", ExplicitMods = new List<string> { "+10 Damage" } },
                new() { Name = "Dragon Helm", Rarity = "Rare", ItemLevel = 55, Slot = "helm", ExplicitMods = new List<string> { "+50 Life", "+20 Fire Res" } }
            };

            var req = new PetSellRequestDto("hero_test", itemsToSell);
            var res = service.ProcessPetDelivery(req);

            Assert.True(res.Success);
            Assert.True(res.GoldEarned > 0);
            Assert.True(res.CurrenciesEarned.Count > 0);
            Assert.Contains(res.CurrenciesEarned.Keys, k => k == "Genesis Prism" || k == "Aether Spark" || k == "Fracture Core");
            Assert.NotEmpty(res.Items);
        }

        [Fact]
        public void ForgeService_Salvages_Items_Correctly()
        {
            var service = new ForgeService();

            var normalItem = new LootItemDto { Name = "Iron Sword", Rarity = "Normal", Slot = "mainhand" };
            var normalSalvage = service.Salvage(new SalvageRequestDto(normalItem));
            Assert.True(normalSalvage.Success);
            Assert.True(normalSalvage.ProducedMaterials.ContainsKey("mat_iron_ore"));

            var uniqueItem = new LootItemDto { Name = "Genesis Blade", Rarity = "Unique", Slot = "mainhand" };
            var uniqueSalvage = service.Salvage(new SalvageRequestDto(uniqueItem));
            Assert.True(uniqueSalvage.Success);
            Assert.True(uniqueSalvage.ProducedMaterials.ContainsKey("fracture_core"));
        }

        [Fact]
        public void ForgeService_Crafts_Base_Equipment_Correctly()
        {
            var service = new ForgeService();
            var mats = new Dictionary<string, int>
            {
                ["mat_iron_ingot"] = 10,
                ["mat_tanned_leather"] = 10,
                ["mat_heartwood"] = 5
            };

            var req = new CraftBaseRequestDto(
                RecipeId: "forge_iron_sword",
                CharacterLevel: 5,
                CraftingMasteryLevel: 10,
                CraftingMasteryExp: 50,
                UnlockedRecipes: new List<string> { "forge_iron_sword" },
                Materials: mats);

            var res = service.CraftBaseEquipment(req);
            Assert.True(res.Success);
            Assert.NotNull(res.Item);
            Assert.Equal("mainhand", res.Item.Slot);
            Assert.True(res.Item.Sockets >= 1);
            Assert.True(res.ExpGain > 0);
        }

        [Fact]
        public void ForgeService_Smelts_And_Brews_Correctly()
        {
            var service = new ForgeService();

            // Smelt Glass Vial
            var smeltMats = new Dictionary<string, int> { ["mat_silica_sand"] = 6 };
            var smeltRes = service.Smelt(new SmeltRequestDto("smelt_glass_vial", 1, smeltMats));
            Assert.True(smeltRes.Success);
            Assert.Equal("item_empty_vial", smeltRes.OutputItemId);
            Assert.Equal(1, smeltRes.OutputQuantity);
            Assert.Equal(3, smeltRes.RemainingMaterials["mat_silica_sand"]);

            // Brew Lesser Life Flask
            var brewMats = new Dictionary<string, int>
            {
                ["item_empty_vial"] = 1,
                ["mat_aether_water"] = 1,
                ["mat_blood_herb"] = 3
            };
            var brewRes = service.BrewFlask(new BrewFlaskRequestDto("alch_life_lesser", 1, brewMats));
            Assert.True(brewRes.Success);
            Assert.NotNull(brewRes.FlaskItem);
            Assert.Equal("flask", brewRes.FlaskItem.Slot);
        }

        [Fact]
        public void ProfessionService_Gathers_Resource_And_Levels_Up()
        {
            var service = new ProfessionService();

            // Level requirement check
            var failReq = new GatherResourceRequestDto("node_adamantite", "mining", 1, 0);
            var failRes = service.GatherResource(failReq);
            Assert.False(failRes.Success);

            // Valid gathering with Exp
            var validReq = new GatherResourceRequestDto("node_iron_ore", "mining", 1, 90);
            var validRes = service.GatherResource(validReq);
            Assert.True(validRes.Success);
            Assert.True(validRes.YieldQuantity >= 2);
            Assert.Equal("mat_iron_ore", validRes.YieldMatId);
            Assert.True(validRes.LeveledUp);
            Assert.Equal(2, validRes.NewProfessionLevel);
        }

        [Fact]
        public void ShadowService_Extracts_Soldier_And_Maintains_Capacity()
        {
            var service = new ShadowService();

            var currentArmy = new List<ShadowSoldierDto>
            {
                new() { Name = "Soldier 1", CurrentLife = 100, MaxLife = 100 },
                new() { Name = "Soldier 2", CurrentLife = 100, MaxLife = 100 },
                new() { Name = "Soldier 3", CurrentLife = 100, MaxLife = 100 }
            };

            var req = new ExtractShadowRequestDto(
                MonsterName: "Malakor Guardian",
                MonsterType: "demon",
                Rarity: "Rare",
                BaseLife: 1000,
                BaseDamage: 100,
                CurrentArmy: currentArmy,
                MaxCapacity: 3);

            var res = service.ExtractShadow(req);
            Assert.True(res.Success);
            Assert.NotNull(res.ExtractedSoldier);
            Assert.Equal("Shadow Malakor Guardian", res.ExtractedSoldier.Name);
            Assert.Equal(600, res.ExtractedSoldier.MaxLife); // 60% of 1000
            Assert.Equal(3, res.Army.Count); // Enforced max capacity 3
        }

        [Fact]
        public void SpireService_Calculates_Floors_And_Rewards()
        {
            var service = new SpireService();

            // Floor 10 Boss definition
            var floor10 = service.GetFloor(10);
            Assert.True(floor10.IsBossFloor);
            Assert.NotEmpty(floor10.BossType);
            Assert.True(floor10.HealthMultiplier > 1.0f);

            // Claim floor 10
            var claimReq = new ClaimSpireFloorRequestDto(10, 9, "hero_1");
            var claimRes = service.ClaimFloor(claimReq);
            Assert.True(claimRes.Success);
            Assert.Equal(10, claimRes.HighestClearedFloor);
            Assert.True(claimRes.ExpAwarded > 0);
            Assert.True(claimRes.RewardCurrencies.ContainsKey("fracture_core"));
        }

        [Fact]
        public void ProgressionService_Handles_Ascendance_And_MonsterLore()
        {
            var service = new ProgressionService();

            // Ascendance Selection (Requires Lv.60 + Trial)
            var failAscReq = new AscendanceSelectRequestDto(40, "IronVanguard", false, "hero_1");
            var failAscRes = service.SelectAscendance(failAscReq);
            Assert.False(failAscRes.Success);

            var validAscReq = new AscendanceSelectRequestDto(65, "IronVanguard", true, "hero_1");
            var validAscRes = service.SelectAscendance(validAscReq);
            Assert.True(validAscRes.Success);
            Assert.Equal("IronVanguard", validAscRes.Archetype);
            Assert.Contains("IronFortress", validAscRes.ActiveKeystones);

            // Monster Lore Mastery
            var loreBonus = service.GetMonsterLoreBonus(3500, false);
            Assert.Equal("Apex Nemesis", loreBonus.TierTitle);
            Assert.Equal(25f, loreBonus.BonusDamagePercent);
            Assert.Equal(35f, loreBonus.BonusIir);
        }
    }
}


