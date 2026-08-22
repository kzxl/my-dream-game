using System.Collections.Generic;
using System.Linq;
using Mdg.Core.Features.Items.Crafting;
using Xunit;

namespace Mdg.Core.Tests;

public sealed class SmeltingAndAlchemyTests
{
    [Fact]
    public void SmeltingEngine_Registers_All_Default_Smelting_Recipes()
    {
        var engine = new CraftingRecipeEngine();
        var smeltingRecipes = engine.GetAllSmeltingRecipes();

        Assert.NotNull(smeltingRecipes);
        Assert.True(smeltingRecipes.Count >= 5);

        var glassVial = engine.GetSmeltingRecipe("smelt_glass_vial");
        Assert.NotNull(glassVial);
        Assert.Equal("item_empty_vial", glassVial.OutputItemId);
        Assert.Equal(3, glassVial.InputCosts["mat_silica_sand"]);

        var ironIngot = engine.GetSmeltingRecipe("smelt_iron_ingot");
        Assert.NotNull(ironIngot);
        Assert.Equal("mat_iron_ingot", ironIngot.OutputItemId);
        Assert.Equal(2, ironIngot.InputCosts["mat_iron_ore"]);
    }

    [Fact]
    public void SmeltingEngine_CanSmelt_Validates_Material_Requirements()
    {
        var engine = new CraftingRecipeEngine();
        var materials = new Dictionary<string, int>
        {
            ["mat_silica_sand"] = 2 // Needs 3
        };

        bool canSmelt = engine.CanSmelt("smelt_glass_vial", heroLevel: 1, materials, out var failureReason);
        Assert.False(canSmelt);
        Assert.Contains("mat_silica_sand", failureReason);

        materials["mat_silica_sand"] = 6;
        canSmelt = engine.CanSmelt("smelt_glass_vial", heroLevel: 1, materials, out failureReason);
        Assert.True(canSmelt);
        Assert.Empty(failureReason);
    }

    [Fact]
    public void AlchemyEngine_Requires_Glass_Vial_And_Water_To_Brew_Flasks()
    {
        var engine = new CraftingRecipeEngine();

        // Scenario 1: Player has herbs but NO glass vial
        var materialsWithoutVial = new Dictionary<string, int>
        {
            ["mat_blood_herb"] = 10,
            ["mat_aether_water"] = 5
            // missing item_empty_vial
        };

        bool canBrew = engine.CanBrew("alch_life_lesser", heroLevel: 1, materialsWithoutVial, out var failureReason);
        Assert.False(canBrew);
        Assert.Contains("Vỏ Bình Thủy Tinh", failureReason);

        // Scenario 2: Player has herbs & vial but NO water
        var materialsWithoutWater = new Dictionary<string, int>
        {
            ["item_empty_vial"] = 2,
            ["mat_blood_herb"] = 10
            // missing mat_aether_water
        };

        canBrew = engine.CanBrew("alch_life_lesser", heroLevel: 1, materialsWithoutWater, out failureReason);
        Assert.False(canBrew);
        Assert.Contains("Nước Suối", failureReason);

        // Scenario 3: Player has all ingredients (Vial + Water + Herbs)
        var completeMaterials = new Dictionary<string, int>
        {
            ["item_empty_vial"] = 2,
            ["mat_aether_water"] = 2,
            ["mat_blood_herb"] = 5
        };

        canBrew = engine.CanBrew("alch_life_lesser", heroLevel: 1, completeMaterials, out failureReason);
        Assert.True(canBrew);
        Assert.Empty(failureReason);
    }

    [Fact]
    public void ForgingEngine_Uses_Refined_Ingots_And_Tanned_Leather()
    {
        var engine = new CraftingRecipeEngine();
        var swordRecipe = engine.GetRecipe("forge_iron_sword");

        Assert.NotNull(swordRecipe);
        Assert.True(swordRecipe.MaterialCosts.ContainsKey("mat_iron_ingot"));
        Assert.True(swordRecipe.MaterialCosts.ContainsKey("mat_tanned_leather"));
        Assert.True(swordRecipe.MaterialCosts.ContainsKey("mat_heartwood"));

        var materials = new Dictionary<string, int>
        {
            ["mat_iron_ingot"] = 4,
            ["mat_tanned_leather"] = 2,
            ["mat_heartwood"] = 1
        };

        var unlocked = engine.GetDefaultUnlockedRecipeIds();
        bool canCraft = engine.CanCraft("forge_iron_sword", heroLevel: 1, unlocked, materials, out var failureReason);
        Assert.True(canCraft);
        Assert.Empty(failureReason);
    }
}
