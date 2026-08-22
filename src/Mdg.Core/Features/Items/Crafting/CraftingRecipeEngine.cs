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

public sealed record SmeltingRecipeDefinition(
    string Id,
    string Name,
    string OutputItemId,
    int OutputQuantity,
    Dictionary<string, int> InputCosts,
    int RequiredLevel = 1,
    string Description = ""
);

public sealed record AlchemyRecipeDefinition(
    string Id,
    string Name,
    string OutputFlaskId,
    int RequiredLevel,
    Dictionary<string, int> MaterialCosts,
    string Description = ""
);

public sealed class CraftingRecipeEngine
{
    private readonly Dictionary<string, ForgingRecipeDefinition> _forgingRecipes = new();
    private readonly Dictionary<string, SmeltingRecipeDefinition> _smeltingRecipes = new();
    private readonly Dictionary<string, AlchemyRecipeDefinition> _alchemyRecipes = new();

    public CraftingRecipeEngine()
    {
        RegisterDefaultSmeltingRecipes();
        RegisterDefaultAlchemyRecipes();
        RegisterDefaultForgingRecipes();
    }

    private void RegisterDefaultSmeltingRecipes()
    {
        // 1. Sand -> Empty Glass Vial
        RegisterSmeltingRecipe(new SmeltingRecipeDefinition(
            Id: "smelt_glass_vial",
            Name: "Bình Thủy Tinh Rỗng (Empty Glass Vial)",
            OutputItemId: "item_empty_vial",
            OutputQuantity: 1,
            InputCosts: new() { ["mat_silica_sand"] = 3 },
            RequiredLevel: 1,
            Description: "Nung cát thạch anh ở nhiệt độ cao để đúc thành vỏ bình thủy tinh chứa dược phẩm."
        ));

        // 2. Glass Vial + Aether Crystal -> Reinforced Crystal Flask
        RegisterSmeltingRecipe(new SmeltingRecipeDefinition(
            Id: "smelt_crystal_flask",
            Name: "Bình Thạch Anh Cường Hóa (Crystal Flask)",
            OutputItemId: "item_crystal_flask",
            OutputQuantity: 1,
            InputCosts: new() { ["item_empty_vial"] = 1, ["mat_aether_crystal"] = 2 },
            RequiredLevel: 25,
            Description: "Gia cố vỏ bình bằng tinh thể ma thuật Aether để chịu áp suất của thần dược cấp cao."
        ));

        // 3. Raw Ore -> Iron Ingot
        RegisterSmeltingRecipe(new SmeltingRecipeDefinition(
            Id: "smelt_iron_ingot",
            Name: "Thỏi Sắt Tinh Luyện (Iron Ingot)",
            OutputItemId: "mat_iron_ingot",
            OutputQuantity: 1,
            InputCosts: new() { ["mat_iron_ore"] = 2 },
            RequiredLevel: 1,
            Description: "Luyện quặng sắt thô qua lò nung để loại bỏ tạp chất thành thỏi sắt rèn."
        ));

        // 4. Raw Mithril -> Mithril Ingot
        RegisterSmeltingRecipe(new SmeltingRecipeDefinition(
            Id: "smelt_mithril_ingot",
            Name: "Thỏi Mithril Băng Ngân (Mithril Ingot)",
            OutputItemId: "mat_mithril_ingot",
            OutputQuantity: 1,
            InputCosts: new() { ["mat_mithril_chunk"] = 2 },
            RequiredLevel: 15,
            Description: "Nung chảy quặng mithril thành thỏi kim loại ma pháp nhẹ và bền bỉ."
        ));

        // 5. Beast Leather -> Tanned Leather
        RegisterSmeltingRecipe(new SmeltingRecipeDefinition(
            Id: "smelt_tanned_leather",
            Name: "Da Thuộc Bền Bỉ (Tanned Leather)",
            OutputItemId: "mat_tanned_leather",
            OutputQuantity: 1,
            InputCosts: new() { ["mat_beast_leather"] = 2 },
            RequiredLevel: 1,
            Description: "Xử lý da thú tươi qua giá thuộc da để tăng độ dẻo dai và chống mục nát."
        ));
    }

    private void RegisterDefaultAlchemyRecipes()
    {
        // 1. Lesser Life Flask
        RegisterAlchemyRecipe(new AlchemyRecipeDefinition(
            Id: "alch_life_lesser",
            Name: "Lesser Life Flask",
            OutputFlaskId: "flask_life_lesser",
            RequiredLevel: 1,
            MaterialCosts: new() { ["item_empty_vial"] = 1, ["mat_aether_water"] = 1, ["mat_blood_herb"] = 3 },
            Description: "Bình hồi phục sinh lực cơ bản, chiết xuất từ rễ Huyết Thảo và nước suối Aether."
        ));

        // 2. Lesser Mana Flask
        RegisterAlchemyRecipe(new AlchemyRecipeDefinition(
            Id: "alch_mana_lesser",
            Name: "Lesser Mana Flask",
            OutputFlaskId: "flask_mana_lesser",
            RequiredLevel: 1,
            MaterialCosts: new() { ["item_empty_vial"] = 1, ["mat_aether_water"] = 1, ["mat_mana_bloom"] = 3 },
            Description: "Bình hồi phục năng lượng ma pháp, chưng cất từ cánh hoa Mana Bloom."
        ));

        // 3. Quicksilver Flask
        RegisterAlchemyRecipe(new AlchemyRecipeDefinition(
            Id: "alch_quicksilver",
            Name: "Quicksilver Speed Flask",
            OutputFlaskId: "flask_quicksilver",
            RequiredLevel: 15,
            MaterialCosts: new() { ["item_empty_vial"] = 1, ["mat_aether_water"] = 2, ["mat_wind_leaf"] = 5 },
            Description: "Thần dược phong lôi tăng 40% tốc độ di chuyển trong 5 giây."
        ));

        // 4. Granite Flask
        RegisterAlchemyRecipe(new AlchemyRecipeDefinition(
            Id: "alch_granite",
            Name: "Granite Fortitude Flask",
            OutputFlaskId: "flask_granite",
            RequiredLevel: 20,
            MaterialCosts: new() { ["item_empty_vial"] = 1, ["mat_iron_ingot"] = 2, ["mat_tanned_leather"] = 2 },
            Description: "Dược dịch hóa đá tăng 800 giáp và 15% giảm sát thương vật lý."
        ));

        // 5. Divine Life Flask
        RegisterAlchemyRecipe(new AlchemyRecipeDefinition(
            Id: "alch_life_divine",
            Name: "Divine Life Flask of Staunching",
            OutputFlaskId: "flask_life_divine",
            RequiredLevel: 40,
            MaterialCosts: new() { ["item_crystal_flask"] = 1, ["mat_aether_water"] = 3, ["mat_blood_herb"] = 8, ["mat_frost_core"] = 1 },
            Description: "Thần dược hồi 1200 sinh lực và miễn nhiễm chảy máu trong vỏ bình thạch anh."
        ));

        // 6. Arcane Mana Flask
        RegisterAlchemyRecipe(new AlchemyRecipeDefinition(
            Id: "alch_mana_arcane",
            Name: "Arcane Mana Flask of Warding",
            OutputFlaskId: "flask_mana_arcane",
            RequiredLevel: 40,
            MaterialCosts: new() { ["item_crystal_flask"] = 1, ["mat_aether_water"] = 3, ["mat_mana_bloom"] = 8, ["mat_aether_crystal"] = 1 },
            Description: "Thần dược hồi 800 Mana & 450 ES, miễn nhiễm nguyền rủa."
        ));
    }

    private void RegisterDefaultForgingRecipes()
    {
        // Act 1: Starter default unlocked (Uses Iron Ingot + Tanned Leather + Heartwood)
        RegisterRecipe(new ForgingRecipeDefinition(
            Id: "forge_iron_sword",
            Name: "Iron Longsword",
            BaseType: "sword_1h",
            Slot: "MainHand",
            RequiredLevel: 1,
            BaseStats: "+18 Physical Damage, 1.25 Atk Spd",
            MaterialCosts: new() { ["mat_iron_ingot"] = 4, ["mat_tanned_leather"] = 2, ["mat_heartwood"] = 1 },
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
            MaterialCosts: new() { ["mat_iron_ingot"] = 6, ["mat_tanned_leather"] = 4 },
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
            MaterialCosts: new() { ["mat_mithril_ingot"] = 4, ["mat_aether_crystal"] = 4 },
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
            MaterialCosts: new() { ["mat_mithril_ingot"] = 6, ["mat_aether_crystal"] = 2, ["mat_heartwood"] = 1 },
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
            MaterialCosts: new() { ["mat_mithril_ingot"] = 8, ["mat_tanned_leather"] = 4 },
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
            MaterialCosts: new() { ["mat_adamantite_ingot"] = 10, ["mat_aether_crystal"] = 4, ["mat_heartwood"] = 2 },
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
            MaterialCosts: new() { ["mat_adamantite_ingot"] = 12, ["mat_aether_crystal"] = 4, ["mat_tanned_leather"] = 4 },
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
        _forgingRecipes[recipe.Id] = recipe;
    }

    public void RegisterSmeltingRecipe(SmeltingRecipeDefinition recipe)
    {
        _smeltingRecipes[recipe.Id] = recipe;
    }

    public void RegisterAlchemyRecipe(AlchemyRecipeDefinition recipe)
    {
        _alchemyRecipes[recipe.Id] = recipe;
    }

    public IReadOnlyCollection<ForgingRecipeDefinition> GetAllRecipes() => _forgingRecipes.Values;
    public IReadOnlyCollection<SmeltingRecipeDefinition> GetAllSmeltingRecipes() => _smeltingRecipes.Values;
    public IReadOnlyCollection<AlchemyRecipeDefinition> GetAllAlchemyRecipes() => _alchemyRecipes.Values;

    public ForgingRecipeDefinition? GetRecipe(string recipeId) =>
        _forgingRecipes.TryGetValue(recipeId, out var recipe) ? recipe : null;

    public SmeltingRecipeDefinition? GetSmeltingRecipe(string recipeId) =>
        _smeltingRecipes.TryGetValue(recipeId, out var recipe) ? recipe : null;

    public AlchemyRecipeDefinition? GetAlchemyRecipe(string recipeId) =>
        _alchemyRecipes.TryGetValue(recipeId, out var recipe) ? recipe : null;

    public HashSet<string> GetDefaultUnlockedRecipeIds() =>
        _forgingRecipes.Values.Where(r => r.IsDefaultUnlocked).Select(r => r.Id).ToHashSet();

    public bool CanCraft(string recipeId, int heroLevel, HashSet<string> unlockedRecipes, Dictionary<string, int> availableMaterials, out string failureReason)
    {
        failureReason = string.Empty;

        if (!_forgingRecipes.TryGetValue(recipeId, out var recipe))
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

    public bool CanSmelt(string recipeId, int heroLevel, Dictionary<string, int> availableMaterials, out string failureReason)
    {
        failureReason = string.Empty;

        if (!_smeltingRecipes.TryGetValue(recipeId, out var recipe))
        {
            failureReason = "Smelting recipe does not exist.";
            return false;
        }

        if (heroLevel < recipe.RequiredLevel)
        {
            failureReason = $"Requires Level {recipe.RequiredLevel} (Current: {heroLevel}).";
            return false;
        }

        foreach (var (matId, requiredCount) in recipe.InputCosts)
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

    public bool CanBrew(string recipeId, int heroLevel, Dictionary<string, int> availableMaterials, out string failureReason)
    {
        failureReason = string.Empty;

        if (!_alchemyRecipes.TryGetValue(recipeId, out var recipe))
        {
            failureReason = "Alchemy recipe does not exist.";
            return false;
        }

        if (heroLevel < recipe.RequiredLevel)
        {
            failureReason = $"Requires Level {recipe.RequiredLevel} (Current: {heroLevel}).";
            return false;
        }

        foreach (var (matId, requiredCount) in recipe.MaterialCosts)
        {
            availableMaterials.TryGetValue(matId, out var count);
            if (count < requiredCount)
            {
                if (matId == "item_empty_vial" || matId == "item_crystal_flask")
                {
                    failureReason = $"Thiếu Vỏ Bình Thủy Tinh ({matId})! Hãy nung Cát Thạch Anh tại Lò Nung trước.";
                }
                else if (matId == "mat_aether_water")
                {
                    failureReason = $"Thiếu Nước Suối Aether ({count}/{requiredCount}) làm dung môi hòa tan!";
                }
                else
                {
                    failureReason = $"Insufficient material: {matId} ({count}/{requiredCount}).";
                }
                return false;
            }
        }

        return true;
    }

    public bool TryUnlockRecipe(string recipeId, HashSet<string> unlockedRecipes, out string message)
    {
        if (!_forgingRecipes.TryGetValue(recipeId, out var recipe))
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
        return _forgingRecipes.Values
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
