using System;
using System.Collections.Generic;
using System.Linq;

namespace Mdg.Core.Features.Items.Crafting;

public sealed class RunewordRecipe
{
    public string Name { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string TargetItemType { get; set; } = "Any"; // "Weapon", "Armor", "Helm", "Shield", "Any"
    public List<string> RuneSequence { get; set; } = new();
    public List<string> GrantedModifiers { get; set; } = new();
    public string FlavorText { get; set; } = string.Empty;
}

public sealed class RunewordEvaluationResult
{
    public bool IsSuccess { get; set; }
    public string RunewordName { get; set; } = string.Empty;
    public string RunewordTitle { get; set; } = string.Empty;
    public List<string> ExtraModifiers { get; set; } = new();
    public string Message { get; set; } = string.Empty;
}

public static class RunewordEngine
{
    public static readonly List<RunewordRecipe> Recipes =
    [
        new()
        {
            Name = "STEEL",
            Title = "Steel of the Vanguard",
            TargetItemType = "Weapon",
            RuneSequence = ["TIR", "EL"],
            GrantedModifiers =
            [
                "+20% Attack Speed",
                "+25% Chance to cause Bleeding",
                "+35 to +50 Added Physical Damage",
                "+50 to Accuracy Rating"
            ],
            FlavorText = "Forged with primordial discipline and razor sharpness."
        },
        new()
        {
            Name = "STEALTH",
            Title = "Shroud of the Shadow Stalker",
            TargetItemType = "Armor",
            RuneSequence = ["TAL", "ETH"],
            GrantedModifiers =
            [
                "+25% Faster Movement Speed",
                "+25% Faster Cast & Attack Speed",
                "+6 Regenerate Mana per second",
                "+15% Poison & Chaos Resistance"
            ],
            FlavorText = "Steps muffled by the veil of twilight."
        },
        new()
        {
            Name = "ANCIENT_OATH",
            Title = "Oath of the Iron Bastion",
            TargetItemType = "Armor",
            RuneSequence = ["RAL", "ORT", "TAL"],
            GrantedModifiers =
            [
                "+35% Fire Resistance",
                "+35% Cold Resistance",
                "+35% Lightning Resistance",
                "+15% Reduced Damage taken from Environmental Hazards"
            ],
            FlavorText = "The ancient vows sworn by the first defenders of Sanctuary Haven."
        },
        new()
        {
            Name = "RADIANCE",
            Title = "Radiance of the Celestial Dawn",
            TargetItemType = "Any",
            RuneSequence = ["SOL", "LUM"],
            GrantedModifiers =
            [
                "+300 Maximum Energy Shield",
                "+20% All Elemental Resistances",
                "Emit Solar Aura dealing 80 Fire Damage per second to nearby enemies"
            ],
            FlavorText = "A fragment of the sun encased in runic metal."
        },
        new()
        {
            Name = "CALAMITY",
            Title = "Calamity of the Void Sovereign",
            TargetItemType = "Weapon",
            RuneSequence = ["VEX", "OHM", "JAH"],
            GrantedModifiers =
            [
                "+150% Increased Global Damage",
                "+35% Critical Strike Multiplier",
                "Ignore 50% of Monster Armor and Resistances",
                "Leech 5% of Damage as Life and Energy Shield"
            ],
            FlavorText = "The catastrophic decree that fractured Aethelis."
        }
    ];

    public static RunewordEvaluationResult Evaluate(ItemEntity item, List<string> socketedRunes)
    {
        if (item.Rarity != ItemRarity.Normal)
        {
            return new RunewordEvaluationResult
            {
                IsSuccess = false,
                Message = "Runewords can only be forged into Normal (White) base items!"
            };
        }

        if (socketedRunes == null || socketedRunes.Count == 0)
        {
            return new RunewordEvaluationResult
            {
                IsSuccess = false,
                Message = "No runes socketed into the item."
            };
        }

        var normalizedRunes = socketedRunes.Select(r => r.Trim().ToUpperInvariant()).ToList();

        foreach (var recipe in Recipes)
        {
            if (recipe.RuneSequence.Count == normalizedRunes.Count)
            {
                bool match = true;
                for (int i = 0; i < recipe.RuneSequence.Count; i++)
                {
                    if (recipe.RuneSequence[i] != normalizedRunes[i])
                    {
                        match = false;
                        break;
                    }
                }

                if (match)
                {
                    return new RunewordEvaluationResult
                    {
                        IsSuccess = true,
                        RunewordName = recipe.Name,
                        RunewordTitle = recipe.Title,
                        ExtraModifiers = new List<string>(recipe.GrantedModifiers),
                        Message = $"✨ RUNEWORD ACTIVATED: '{recipe.Title}'! {recipe.FlavorText}"
                    };
                }
            }
        }

        return new RunewordEvaluationResult
        {
            IsSuccess = false,
            Message = "The socketed rune combination did not form an active Runeword."
        };
    }
}
