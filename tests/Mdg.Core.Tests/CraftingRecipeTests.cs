using System;
using System.Collections.Generic;
using Mdg.Core.Features.Items.Crafting;
using Xunit;

namespace Mdg.Core.Tests;

public class CraftingRecipeTests
{
    [Fact]
    public void StarterRecipes_AreUnlockedByDefault()
    {
        var engine = new CraftingRecipeEngine();
        var defaults = engine.GetDefaultUnlockedRecipeIds();

        Assert.Contains("forge_iron_sword", defaults);
        Assert.Contains("forge_iron_armor", defaults);
        Assert.DoesNotContain("forge_mithril_blade", defaults);
        Assert.DoesNotContain("forge_adamantite_greatsword", defaults);
    }

    [Fact]
    public void CanCraft_FailsWhenRecipeIsLocked()
    {
        var engine = new CraftingRecipeEngine();
        var unlocked = new HashSet<string> { "forge_iron_sword" };
        var mats = new Dictionary<string, int>
        {
            ["mat_mithril_chunk"] = 99,
            ["mat_aether_crystal"] = 99
        };

        var canCraft = engine.CanCraft("forge_mithril_blade", 30, unlocked, mats, out var reason);

        Assert.False(canCraft);
        Assert.Contains("Recipe locked", reason);
    }

    [Fact]
    public void CanCraft_SucceedsAfterLearningRecipe()
    {
        var engine = new CraftingRecipeEngine();
        var unlocked = new HashSet<string> { "forge_iron_sword" };

        var unlockedSuccess = engine.TryUnlockRecipe("forge_mithril_blade", unlocked, out var msg);
        Assert.True(unlockedSuccess);
        Assert.Contains("Successfully learned", msg);

        var mats = new Dictionary<string, int>
        {
            ["mat_mithril_chunk"] = 10,
            ["mat_aether_crystal"] = 5
        };

        var canCraft = engine.CanCraft("forge_mithril_blade", 25, unlocked, mats, out var reason);
        Assert.True(canCraft, reason);
    }

    [Fact]
    public void RollMonsterRecipeDrop_GuaranteedOnSpecificBoss()
    {
        var engine = new CraftingRecipeEngine();
        var rng = new Random(42);

        // Vael is guaranteed to drop Mithril Arcane Blade blueprint
        var drop = engine.RollMonsterRecipeDrop("vael_frost", isBoss: true, rng);

        Assert.NotNull(drop);
        Assert.Equal("forge_mithril_blade", drop!.Id);
    }
}
