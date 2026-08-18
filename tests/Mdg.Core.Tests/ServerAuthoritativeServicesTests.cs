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
    }
}
