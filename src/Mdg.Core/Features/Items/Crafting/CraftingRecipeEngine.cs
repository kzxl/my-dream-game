using System;
using System.Collections.Generic;
using System.Linq;

namespace Mdg.Core.Features.Items.Crafting;

public sealed record RecipeDropSource(
    string MonsterId,
    string MonsterName,
    string Biome,
    double DropChancePct,
    bool IsGuaranteedOnBoss
);

public sealed record ForgingRecipeDefinition(
    string Id,
    string Name,
    string BaseType,
    string Slot,
    int RequiredLevel,
    string BaseStats,
    Dictionary<string, int> MaterialCosts,
    bool IsDefaultUnlocked,
    RecipeDropSource? DropSource
);

public sealed class CraftingRecipeEngine
{
    private readonly Dictionary<string, ForgingRecipeDefinition> _recipes = new();

    public CraftingRecipeEngine()
    {
        RegisterDefaultRecipes();
    }

    private void RegisterDefaultRecipes()
    {
        // Act 1: Starter default unlocked
        RegisterRecipe(new ForgingRecipeDefinition(
            Id: "forge_iron_sword",
            Name: "Iron Longsword",
            BaseType: "sword_1h",
            Slot: "MainHand",
            RequiredLevel: 1,
            BaseStats: "+18 Physical Damage, 1.25 Atk Spd",
            MaterialCosts: new() { ["mat_iron_ore"] = 5, ["mat_beast_leather"] = 2 },
            IsDefaultUnlocked: true,
            DropSource: null
        ));

        RegisterRecipe(new ForgingRecipeDefinition(
            Id: "forge_iron_armor",
            Name: "Reinforced Iron Cuirass",
            BaseType: "body_armor",
            Slot: "BodyArmor",
            RequiredLevel: 1,
            BaseStats: "+65 Armor, +40 Max Life",
            MaterialCosts: new() { ["mat_iron_ore"] = 6, ["mat_beast_leather"] = 4 },
            IsDefaultUnlocked: true,
            DropSource: null
        ));

        // Act 1: Malakor Boss Drop
        RegisterRecipe(new ForgingRecipeDefinition(
            Id: "forge_aether_ring",
            Name: "Aetherium Band of Resilience",
            BaseType: "ring",
            Slot: "Ring",
            RequiredLevel: 20,
            BaseStats: "+35 Max Mana, +18% Elemental Res",
            MaterialCosts: new() { ["mat_mithril_chunk"] = 4, ["mat_aether_crystal"] = 4 },
            IsDefaultUnlocked: false,
            DropSource: new RecipeDropSource(
                MonsterId: "malakor",
                MonsterName: "Malakor the Shadow Fiend",
                Biome: "Dungeon",
                DropChancePct: 75.0,
                IsGuaranteedOnBoss: true
            )
        ));

        // Act 2: Vael the Frost Sovereign & Frost Elemental
        RegisterRecipe(new ForgingRecipeDefinition(
            Id: "forge_mithril_blade",
            Name: "Mithril Arcane Blade",
            BaseType: "sword_1h",
            Slot: "MainHand",
            RequiredLevel: 25,
            BaseStats: "+42 Physical Damage, +20 Elemental Dmg",
            MaterialCosts: new() { ["mat_mithril_chunk"] = 8, ["mat_aether_crystal"] = 3 },
            IsDefaultUnlocked: false,
            DropSource: new RecipeDropSource(
                MonsterId: "vael_frost",
                MonsterName: "Cryomancer Vael the Frost Sovereign",
                Biome: "Tundra",
                DropChancePct: 100.0,
                IsGuaranteedOnBoss: true
            )
        ));

        RegisterRecipe(new ForgingRecipeDefinition(
            Id: "forge_mithril_hauberk",
            Name: "Mithril Ward Hauberk",
            BaseType: "body_armor",
            Slot: "BodyArmor",
            RequiredLevel: 25,
            BaseStats: "+140 Armor, +60 Energy Shield",
            MaterialCosts: new() { ["mat_mithril_chunk"] = 10, ["mat_beast_leather"] = 6 },
            IsDefaultUnlocked: false,
            DropSource: new RecipeDropSource(
                MonsterId: "yeti",
                MonsterName: "Yeti Frost Goliath",
                Biome: "Tundra",
                DropChancePct: 25.0,
                IsGuaranteedOnBoss: false
            )
        ));

        // Act 3: Magma Golem & Ignis the Scourge Wyrm
        RegisterRecipe(new ForgingRecipeDefinition(
            Id: "forge_prismatic_amulet",
            Name: "Prismatic Star Amulet",
            BaseType: "amulet",
            Slot: "Amulet",
            RequiredLevel: 40,
            BaseStats: "+24 All Attributes, +15% Global Damage",
            MaterialCosts: new() { ["mat_adamantite_ingot"] = 6, ["mat_aether_crystal"] = 8, ["mat_shard_genesis"] = 2 },
            IsDefaultUnlocked: false,
            DropSource: new RecipeDropSource(
                MonsterId: "ignis_dragon",
                MonsterName: "Ignis the Scourge Wyrm",
                Biome: "Volcano",
                DropChancePct: 85.0,
                IsGuaranteedOnBoss: true
            )
        ));

        RegisterRecipe(new ForgingRecipeDefinition(
            Id: "forge_adamantite_greatsword",
            Name: "Adamantite Colossus Greatsword",
            BaseType: "sword_2h",
            Slot: "MainHand",
            RequiredLevel: 50,
            BaseStats: "+115 Physical Damage, +25% Crit Multi",
            MaterialCosts: new() { ["mat_adamantite_ingot"] = 12, ["mat_aether_crystal"] = 4 },
            IsDefaultUnlocked: false,
            DropSource: new RecipeDropSource(
                MonsterId: "ignis_dragon",
                MonsterName: "Ignis the Scourge Wyrm",
                Biome: "Volcano",
                DropChancePct: 100.0,
                IsGuaranteedOnBoss: true
            )
        ));

        RegisterRecipe(new ForgingRecipeDefinition(
            Id: "forge_adamantite_plate",
            Name: "Adamantite Titan Warplate",
            BaseType: "body_armor",
            Slot: "BodyArmor",
            RequiredLevel: 50,
            BaseStats: "+320 Armor, +120 Max Life, +15% All Res",
            MaterialCosts: new() { ["mat_adamantite_ingot"] = 15, ["mat_aether_crystal"] = 6 },
            IsDefaultUnlocked: false,
            DropSource: new RecipeDropSource(
                MonsterId: "ignis_dragon",
                MonsterName: "Ignis the Scourge Wyrm",
                Biome: "Volcano",
                DropChancePct: 100.0,
                IsGuaranteedOnBoss: true
            )
        ));
    }

    public void RegisterRecipe(ForgingRecipeDefinition recipe)
    {
        _recipes[recipe.Id] = recipe;
    }

    public IReadOnlyCollection<ForgingRecipeDefinition> GetAllRecipes() => _recipes.Values;

    public ForgingRecipeDefinition? GetRecipe(string recipeId) =>
        _recipes.TryGetValue(recipeId, out var recipe) ? recipe : null;

    public HashSet<string> GetDefaultUnlockedRecipeIds() =>
        _recipes.Values.Where(r => r.IsDefaultUnlocked).Select(r => r.Id).ToHashSet();

    public bool CanCraft(string recipeId, int heroLevel, HashSet<string> unlockedRecipes, Dictionary<string, int> availableMaterials, out string failureReason)
    {
        failureReason = string.Empty;

        if (!_recipes.TryGetValue(recipeId, out var recipe))
        {
            failureReason = "Recipe does not exist.";
            return false;
        }

        if (!unlockedRecipes.Contains(recipeId))
        {
            failureReason = $"Recipe locked! Requires Blueprint Scroll dropped from {(recipe.DropSource != null ? recipe.DropSource.MonsterName : "specific monsters")}.";
            return false;
        }

        if (heroLevel < recipe.RequiredLevel)
        {
            failureReason = $"Hero level too low (Requires Level {recipe.RequiredLevel}, Current: {heroLevel}).";
            return false;
        }

        foreach (var (matId, requiredCount) in recipe.MaterialCosts)
        {
            availableMaterials.TryGetValue(matId, out var count);
            if (count < requiredCount)
            {
                failureReason = $"Insufficient material: {matId} ({count}/{requiredCount}).";
                return false;
            }
        }

        return true;
    }

    public bool TryUnlockRecipe(string recipeId, HashSet<string> unlockedRecipes, out string message)
    {
        if (!_recipes.TryGetValue(recipeId, out var recipe))
        {
            message = "Invalid recipe scroll.";
            return false;
        }

        if (unlockedRecipes.Contains(recipeId))
        {
            message = $"Recipe '{recipe.Name}' is already learned.";
            return false;
        }

        unlockedRecipes.Add(recipeId);
        message = $"Successfully learned recipe: {recipe.Name}!";
        return true;
    }

    public List<ForgingRecipeDefinition> GetDropCandidatesForMonster(string monsterId, bool isBoss)
    {
        return _recipes.Values
            .Where(r => r.DropSource != null && r.DropSource.MonsterId.Equals(monsterId, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    public ForgingRecipeDefinition? RollMonsterRecipeDrop(string monsterId, bool isBoss, Random rng)
    {
        var candidates = GetDropCandidatesForMonster(monsterId, isBoss);
        if (!candidates.Any()) return null;

        foreach (var candidate in candidates)
        {
            var source = candidate.DropSource!;
            var chance = (isBoss && source.IsGuaranteedOnBoss) ? 100.0 : source.DropChancePct;
            var roll = rng.NextDouble() * 100.0;
            if (roll < chance)
            {
                return candidate;
            }
        }

        return null;
    }
}
