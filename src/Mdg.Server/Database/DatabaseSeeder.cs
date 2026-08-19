using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Mdg.Server.Database;

public static class DatabaseSeeder
{
    public static async Task SeedAllAsync(IDbContextFactory<MdgDbContext> dbFactory)
    {
        await using var db = await dbFactory.CreateDbContextAsync();

        // 1. Ensure SQLite Tables Created (handles existing db file)
        await db.Database.EnsureCreatedAsync();

        try
        {
            await db.Database.ExecuteSqlRawAsync(@"
CREATE TABLE IF NOT EXISTS ""ItemTemplates"" (
    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_ItemTemplates"" PRIMARY KEY,
    ""Name"" TEXT NOT NULL,
    ""BaseType"" TEXT NOT NULL,
    ""Category"" TEXT NOT NULL,
    ""Rarity"" TEXT NOT NULL,
    ""Slot"" TEXT NOT NULL,
    ""RequiredLevel"" INTEGER NOT NULL,
    ""MinIlvl"" INTEGER NOT NULL,
    ""Icon"" TEXT NOT NULL,
    ""Color"" TEXT NOT NULL,
    ""Description"" TEXT NOT NULL,
    ""Lore"" TEXT NOT NULL,
    ""StatsJson"" TEXT NOT NULL,
    ""ModsJson"" TEXT NOT NULL,
    ""SetBonusJson"" TEXT NOT NULL,
    ""TagsJson"" TEXT NOT NULL,
    ""CreatedAt"" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ""IX_ItemTemplates_Category"" ON ""ItemTemplates"" (""Category"");
CREATE INDEX IF NOT EXISTS ""IX_ItemTemplates_Rarity"" ON ""ItemTemplates"" (""Rarity"");

CREATE TABLE IF NOT EXISTS ""SkillTemplates"" (
    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_SkillTemplates"" PRIMARY KEY,
    ""Name"" TEXT NOT NULL,
    ""SkillKey"" TEXT NOT NULL,
    ""BaseType"" TEXT NOT NULL,
    ""MaxLevel"" INTEGER NOT NULL,
    ""BaseDamage"" INTEGER NOT NULL,
    ""BaseCooldown"" REAL NOT NULL,
    ""ManaCost"" INTEGER NOT NULL,
    ""Icon"" TEXT NOT NULL,
    ""Description"" TEXT NOT NULL,
    ""MasteryTreeJson"" TEXT NOT NULL,
    ""CreatedAt"" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ""ZoneTemplates"" (
    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_ZoneTemplates"" PRIMARY KEY,
    ""Name"" TEXT NOT NULL,
    ""Subtitle"" TEXT NOT NULL,
    ""BiomeType"" TEXT NOT NULL,
    ""RecommendedLevel"" INTEGER NOT NULL,
    ""ActNumber"" INTEGER NOT NULL,
    ""BossName"" TEXT NOT NULL,
    ""AmbientColor"" TEXT NOT NULL,
    ""MonsterTypesJson"" TEXT NOT NULL,
    ""HazardsJson"" TEXT NOT NULL,
    ""CreatedAt"" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ""IX_ZoneTemplates_ActNumber"" ON ""ZoneTemplates"" (""ActNumber"");

CREATE TABLE IF NOT EXISTS ""CampaignActs"" (
    ""ActNumber"" INTEGER NOT NULL CONSTRAINT ""PK_CampaignActs"" PRIMARY KEY,
    ""Name"" TEXT NOT NULL,
    ""Subtitle"" TEXT NOT NULL,
    ""LevelRange"" TEXT NOT NULL,
    ""Boss"" TEXT NOT NULL,
    ""CoverArt"" TEXT NOT NULL,
    ""ZonesJson"" TEXT NOT NULL,
    ""CreatedAt"" TEXT NOT NULL
);
");
        }
        catch { }

        // 2. Seed Item Templates
        if (!await db.ItemTemplates.AnyAsync())
        {
            var items = BuildDefaultItemTemplates();
            await db.ItemTemplates.AddRangeAsync(items);
            await db.SaveChangesAsync();
        }

        // 3. Seed Skill Templates & Mastery Trees
        if (!await db.SkillTemplates.AnyAsync())
        {
            var skills = BuildDefaultSkillTemplates();
            await db.SkillTemplates.AddRangeAsync(skills);
            await db.SaveChangesAsync();
        }

        // 4. Seed Zone Templates
        if (!await db.ZoneTemplates.AnyAsync())
        {
            var zones = BuildDefaultZoneTemplates();
            await db.ZoneTemplates.AddRangeAsync(zones);
            await db.SaveChangesAsync();
        }

        // 5. Seed Campaign Acts
        if (!await db.CampaignActs.AnyAsync())
        {
            var acts = BuildDefaultCampaignActs();
            await db.CampaignActs.AddRangeAsync(acts);
            await db.SaveChangesAsync();
        }
    }

    public static List<ItemTemplateEntity> BuildDefaultItemTemplates()
    {
        return new List<ItemTemplateEntity>
        {
            // --- CONSUMABLES ---
            new()
            {
                Id = "scroll_resurrection",
                Name = "Scroll of Resurrection",
                BaseType = "Consumable",
                Category = "consumable",
                Rarity = "Magic",
                Slot = "Consumable",
                RequiredLevel = 1,
                MinIlvl = 1,
                Icon = "📜",
                Color = "#ffd700",
                Description = "Instantly revives character upon defeat with 100% Life, Mana and 3.5s Divine Shield.",
                Lore = "A blessed parchment infused with celestial vitality.",
                StatsJson = "{}",
                TagsJson = JsonSerializer.Serialize(new[] { "consumable", "resurrection" })
            },

            // --- CURRENCIES ---
            new()
            {
                Id = "curr_spark",
                Name = "Aether Spark",
                BaseType = "Genesis Catalyst",
                Category = "currency",
                Rarity = "Currency",
                Slot = "Currency",
                Icon = "🔵",
                Color = "#8888ff",
                Description = "Upgrades a normal item to a magic item with 1-2 random modifiers.",
                TagsJson = JsonSerializer.Serialize(new[] { "currency", "transmute" })
            },
            new()
            {
                Id = "curr_prism",
                Name = "Genesis Prism",
                BaseType = "Genesis Catalyst",
                Category = "currency",
                Rarity = "Currency",
                Slot = "Currency",
                Icon = "💎",
                Color = "#ffd700",
                Description = "Upgrades a normal item to a rare item with 4-6 powerful modifiers.",
                TagsJson = JsonSerializer.Serialize(new[] { "currency", "alchemy" })
            },
            new()
            {
                Id = "curr_fracture",
                Name = "Fracture Core",
                BaseType = "Genesis Catalyst",
                Category = "currency",
                Rarity = "Currency",
                Slot = "Currency",
                Icon = "🔮",
                Color = "#ff7700",
                Description = "Reforges a rare item with completely new random modifiers.",
                TagsJson = JsonSerializer.Serialize(new[] { "currency", "chaos" })
            },
            new()
            {
                Id = "curr_ascendant",
                Name = "Ascendant Catalyst",
                BaseType = "Genesis Catalyst",
                Category = "currency",
                Rarity = "Currency",
                Slot = "Currency",
                Icon = "✨",
                Color = "#ffd700",
                Description = "Augments a rare item with a new random modifier (Exalt Slam).",
                TagsJson = JsonSerializer.Serialize(new[] { "currency", "exalt" })
            },
            new()
            {
                Id = "curr_matrix",
                Name = "Origin Matrix",
                BaseType = "Genesis Catalyst",
                Category = "currency",
                Rarity = "Currency",
                Slot = "Currency",
                Icon = "👑",
                Color = "#e5c07b",
                Description = "Rerolls values of all explicit modifiers on an item to their maximum range.",
                TagsJson = JsonSerializer.Serialize(new[] { "currency", "divine" })
            },

            // --- SET ITEMS ---
            new()
            {
                Id = "set_vanguard_cuirass",
                Name = "Vanguard Bastion Cuirass",
                BaseType = "Set Body Armor",
                Category = "set",
                Rarity = "Set",
                Slot = "BodyArmor",
                RequiredLevel = 25,
                MinIlvl = 20,
                Icon = "🛡️",
                Color = "#00e676",
                Description = "Heavy armor forged with impenetrable bastion plates.",
                StatsJson = JsonSerializer.Serialize(new Dictionary<string, object> { ["life"] = 220, ["armor"] = 350 }),
                ModsJson = JsonSerializer.Serialize(new[] { "+220 to Maximum Life", "+350 to Armor", "+20% to Physical Damage" }),
                SetBonusJson = JsonSerializer.Serialize(new Dictionary<string, string>
                {
                    ["setName"] = "Vanguard of the Silver Bastion",
                    ["set2pc"] = "+400 Armor & 15% Block Chance",
                    ["set3pc"] = "Heavy Slash unleashes Triple Holy Blade Waves!"
                })
            },
            new()
            {
                Id = "set_ignis_robe",
                Name = "Ignis Pyre Robe",
                BaseType = "Set Body Armor",
                Category = "set",
                Rarity = "Set",
                Slot = "BodyArmor",
                RequiredLevel = 28,
                MinIlvl = 24,
                Icon = "🔥",
                Color = "#00e676",
                Description = "Woven from molten cinder fibers of Mount Caelum.",
                StatsJson = JsonSerializer.Serialize(new Dictionary<string, object> { ["mana"] = 180, ["fireRes"] = 45 }),
                ModsJson = JsonSerializer.Serialize(new[] { "+180 to Maximum Mana", "+45% to Fire Resistance", "+35% Increased Fire Damage" }),
                SetBonusJson = JsonSerializer.Serialize(new Dictionary<string, string>
                {
                    ["setName"] = "Ignis, The Cinderborn Avatar",
                    ["set2pc"] = "+50% Ignite Duration & +30% Burn Damage",
                    ["set3pc"] = "Direct hits rain down fiery mini-meteors upon targets!"
                })
            },
            new()
            {
                Id = "set_vael_crown",
                Name = "Vael Frost Sovereign Crown",
                BaseType = "Set Helm",
                Category = "set",
                Rarity = "Set",
                Slot = "Helm",
                RequiredLevel = 32,
                MinIlvl = 28,
                Icon = "❄️",
                Color = "#00e676",
                Description = "Crown of eternal permafrost from the Frostpeak Citadel.",
                StatsJson = JsonSerializer.Serialize(new Dictionary<string, object> { ["es"] = 140, ["coldRes"] = 35 }),
                ModsJson = JsonSerializer.Serialize(new[] { "+140 to Energy Shield", "+35% to Cold Resistance", "+25% Freeze Duration" }),
                SetBonusJson = JsonSerializer.Serialize(new Dictionary<string, string>
                {
                    ["setName"] = "Vael, Sovereign of Glacial Ruin",
                    ["set2pc"] = "+50% Freeze Duration & Frost Nova generates +50 ES",
                    ["set3pc"] = "Frozen enemies explode into 8 deadly permafrost ice shards upon defeat!"
                })
            },

            // --- UNIQUES ---
            new()
            {
                Id = "unq_crown_void",
                Name = "Crown of the Void",
                BaseType = "Hubris Circlet",
                Category = "unique",
                Rarity = "Unique",
                Slot = "Helm",
                RequiredLevel = 60,
                MinIlvl = 55,
                Icon = "👑",
                Color = "#e67e22",
                Description = "A celestial artifact forged from the heart of a dead star.",
                StatsJson = JsonSerializer.Serialize(new Dictionary<string, object> { ["es"] = 180, ["chaosRes"] = 35 }),
                ModsJson = JsonSerializer.Serialize(new[] { "+180 to Maximum Energy Shield", "+35% to Chaos Resistance", "Chaos Damage cannot bypass Energy Shield", "+25% All Elemental Damage" })
            },
            new()
            {
                Id = "unq_flame_scepter",
                Name = "Scepter of the Scorched Star",
                BaseType = "Opal Scepter",
                Category = "unique",
                Rarity = "Unique",
                Slot = "MainHand",
                RequiredLevel = 45,
                MinIlvl = 40,
                Icon = "🪄",
                Color = "#e67e22",
                Description = "Channels pure solar plasma into blazing firestorms.",
                StatsJson = JsonSerializer.Serialize(new Dictionary<string, object> { ["damage"] = 75, ["fireRes"] = 30 }),
                ModsJson = JsonSerializer.Serialize(new[] { "+75 Fire Spell Damage", "+50% Fireball Projectile Speed", "+30% Fire Penetration" })
            },

            // --- BASE EQUIPMENT ---
            new()
            {
                Id = "base_iron_sword",
                Name = "Iron Broadsword",
                BaseType = "Broadsword",
                Category = "equipment",
                Rarity = "Normal",
                Slot = "MainHand",
                RequiredLevel = 1,
                MinIlvl = 1,
                Icon = "⚔️",
                StatsJson = JsonSerializer.Serialize(new Dictionary<string, object> { ["damage"] = 25 })
            },
            new()
            {
                Id = "base_kite_shield",
                Name = "Reinforced Kite Shield",
                BaseType = "Kite Shield",
                Category = "equipment",
                Rarity = "Normal",
                Slot = "OffHand",
                RequiredLevel = 5,
                MinIlvl = 3,
                Icon = "🛡️",
                StatsJson = JsonSerializer.Serialize(new Dictionary<string, object> { ["armor"] = 120, ["blockChance"] = 20 })
            },
            new()
            {
                Id = "base_leather_armor",
                Name = "Padded Leather Vest",
                BaseType = "Leather Armor",
                Category = "equipment",
                Rarity = "Normal",
                Slot = "BodyArmor",
                RequiredLevel = 1,
                MinIlvl = 1,
                Icon = "🥋",
                StatsJson = JsonSerializer.Serialize(new Dictionary<string, object> { ["life"] = 50, ["evasion"] = 80 })
            },
            new()
            {
                Id = "base_iron_helm",
                Name = "Iron Visor Helm",
                BaseType = "Visor Helm",
                Category = "equipment",
                Rarity = "Normal",
                Slot = "Helm",
                RequiredLevel = 3,
                MinIlvl = 2,
                Icon = "🪖",
                StatsJson = JsonSerializer.Serialize(new Dictionary<string, object> { ["armor"] = 65, ["life"] = 30 })
            }
        };
    }

    public static List<SkillTemplateEntity> BuildDefaultSkillTemplates()
    {
        return new List<SkillTemplateEntity>
        {
            new()
            {
                Id = "slash",
                SkillKey = "slash",
                Name = "Heavy Cleave & Slash",
                BaseType = "Melee Attack",
                MaxLevel = 20,
                BaseDamage = 35,
                BaseCooldown = 0.35f,
                ManaCost = 0,
                Icon = "⚔️",
                Description = "A wide cleaving strike that slashes enemies in an arc, with morphs into Wind Blade Wave and Titan Stun Cleave.",
                MasteryTreeJson = JsonSerializer.Serialize(new
                {
                    skillKey = "slash",
                    title = "HEAVY SLASH MASTERY TREE",
                    nodes = new object[]
                    {
                        new { id = "sl_reach", name = "Extended Edge", type = "minor", desc = "+25px Cleave Range" },
                        new { id = "sl_bleed", name = "Rend & Bleed", type = "minor", desc = "+40% Chance to Bleed" },
                        new { id = "sl_crit", name = "Deadly Precision", type = "major", desc = "+15% Critical Chance" },
                        new { id = "sl_leech", name = "Blood Feast", type = "major", desc = "Leech 5% Damage as Life" },
                        new { id = "sl_morph_wave", name = "★ WIND BLADE WAVE", type = "keystone", desc = "Slash unleashes a crescent wind projectile (350px)!" },
                        new { id = "sl_morph_crush", name = "★ TITAN CLEAVE", type = "keystone", desc = "Deals 2.5x damage & Stuns all enemies for 1.0s!" }
                    }
                })
            },
            new()
            {
                Id = "fireball",
                SkillKey = "fireball",
                Name = "Pyro Fireball",
                BaseType = "Ranged Spell",
                MaxLevel = 20,
                BaseDamage = 85,
                BaseCooldown = 0.5f,
                ManaCost = 15,
                Icon = "🔥",
                Description = "Launches an explosive ball of flame dealing heavy fire damage and igniting enemies.",
                MasteryTreeJson = JsonSerializer.Serialize(new
                {
                    skillKey = "fireball",
                    title = "PYRO FIREBALL MASTERY TREE",
                    nodes = new object[]
                    {
                        new { id = "fb_dmg_1", name = "Pyromancy", type = "minor", desc = "+20% Fire Damage" },
                        new { id = "fb_spd_1", name = "Velocity", type = "minor", desc = "+30% Projectile Speed" },
                        new { id = "fb_aoe_1", name = "Blazing Radius", type = "major", desc = "+35% Explosion AoE" },
                        new { id = "fb_ignite", name = "Ignition Pulse", type = "major", desc = "100% Chance to Ignite target" },
                        new { id = "fb_morph_nova", name = "★ NOVA CATACLYSM", type = "keystone", desc = "Fires 8 Fireballs in a 360° Nova ring!" },
                        new { id = "fb_morph_chaos", name = "★ HELLFIRE CHAOS", type = "keystone", desc = "Converts 50% Fire to Chaos & leaves Magma Pool" }
                    }
                })
            },
            new()
            {
                Id = "frost",
                SkillKey = "frost",
                Name = "Frost Nova",
                BaseType = "AoE Spell",
                MaxLevel = 20,
                BaseDamage = 60,
                BaseCooldown = 2.0f,
                ManaCost = 25,
                Icon = "❄️",
                Description = "Unleashes an expanding ring of frost that chills and freezes surrounding enemies.",
                MasteryTreeJson = JsonSerializer.Serialize(new
                {
                    skillKey = "frost",
                    title = "FROST NOVA MASTERY TREE",
                    nodes = new object[]
                    {
                        new { id = "fr_aoe", name = "Expansive Chill", type = "minor", desc = "+30% Radial Area" },
                        new { id = "fr_freeze", name = "Glacial Stun", type = "minor", desc = "+25% Freeze Duration" },
                        new { id = "fr_shield", name = "Frost Barrier", type = "major", desc = "Restores +35 Energy Shield per enemy hit" },
                        new { id = "fr_shatter", name = "Ice Shatter", type = "major", desc = "Frozen enemies explode on defeat for 120 cold dmg" },
                        new { id = "fr_morph_vortex", name = "★ GLACIAL VORTEX", type = "keystone", desc = "Creates a magnetic vortex pulling all enemies to center!" }
                    }
                })
            },
            new()
            {
                Id = "meteor",
                SkillKey = "meteor",
                Name = "Cataclysmic Meteor",
                BaseType = "Heavy AoE Spell",
                MaxLevel = 20,
                BaseDamage = 220,
                BaseCooldown = 4.5f,
                ManaCost = 50,
                Icon = "☄️",
                Description = "Calls down a colossal meteor from the heavens that impacts with cataclysmic force.",
                MasteryTreeJson = JsonSerializer.Serialize(new
                {
                    skillKey = "meteor",
                    title = "CATACLYSMIC METEOR MASTERY TREE",
                    nodes = new object[]
                    {
                        new { id = "mt_impact", name = "Impact Crater", type = "minor", desc = "+40% Impact Physical Damage" },
                        new { id = "mt_cd", name = "Rapid Descent", type = "minor", desc = "-20% Meteor Cooldown" },
                        new { id = "mt_magma", name = "Magma Fissures", type = "major", desc = "Leaves scorched ground dealing 60 fire dmg/sec" },
                        new { id = "mt_morph_star", name = "★ APOCALYPSE SHOWER", type = "keystone", desc = "Calls down 5 smaller meteors in rapid succession!" }
                    }
                })
            },
            new()
            {
                Id = "dash",
                SkillKey = "dash",
                Name = "Shadow Dash",
                BaseType = "Mobility Skill",
                MaxLevel = 20,
                BaseDamage = 0,
                BaseCooldown = 1.2f,
                ManaCost = 0,
                Icon = "💨",
                Description = "Dashes swiftly across terrain with temporary invulnerability frames.",
                MasteryTreeJson = JsonSerializer.Serialize(new
                {
                    skillKey = "dash",
                    title = "SHADOW DASH MASTERY TREE",
                    nodes = new object[]
                    {
                        new { id = "d_distance", name = "Extended Leap", type = "minor", desc = "+35% Dash Distance" },
                        new { id = "d_charges", name = "Twin Blink", type = "major", desc = "Grants +1 Maximum Dash Charge" }
                    }
                })
            }
        };
    }

    public static List<ZoneTemplateEntity> BuildDefaultZoneTemplates()
    {
        return new List<ZoneTemplateEntity>
        {
            // === ACT 1: SYLVAN FRONTIER ===
            new()
            {
                Id = "SanctuaryHaven",
                Name = "Sanctuary Haven",
                Subtitle = "Bastion of the Survivors (Safe Haven)",
                BiomeType = "Town",
                RecommendedLevel = 1,
                ActNumber = 1,
                AmbientColor = "#141821"
            },
            new()
            {
                Id = "WhisperingPlains",
                Name = "Whispering Plains",
                Subtitle = "Haunted Grasslands & Hunting Grounds",
                BiomeType = "Plains",
                RecommendedLevel = 5,
                ActNumber = 1,
                BossName = "Direwolf Matriarch",
                MonsterTypesJson = JsonSerializer.Serialize(new[] { "direwolf", "goblin_scout", "forest_spider" })
            },
            new()
            {
                Id = "VerdantCanopy",
                Name = "Verdant Canopy",
                Subtitle = "Ancient Bioluminescent Forest & Spider Brood",
                BiomeType = "Plains",
                RecommendedLevel = 10,
                ActNumber = 1,
                BossName = "Broodmother Sylva",
                MonsterTypesJson = JsonSerializer.Serialize(new[] { "spider", "direwolf", "slime" }),
                HazardsJson = JsonSerializer.Serialize(new[] { "poison_spores", "web_traps" })
            },
            new()
            {
                Id = "ForgottenCrypt",
                Name = "Forgotten Crypt",
                Subtitle = "Ancient Catacombs of Malakor",
                BiomeType = "Dungeon",
                RecommendedLevel = 15,
                ActNumber = 1,
                BossName = "Malakor the Shadow Fiend",
                MonsterTypesJson = JsonSerializer.Serialize(new[] { "skeleton_warrior", "crypt_bat", "ghoul" }),
                HazardsJson = JsonSerializer.Serialize(new[] { "dark_miasma", "spike_traps" })
            },

            // === ACT 2: FROZEN SPIRES ===
            new()
            {
                Id = "GlacialOutpost",
                Name = "Glacial Outpost",
                Subtitle = "Permafrost Frontier Garrison (Safe Haven)",
                BiomeType = "Town",
                RecommendedLevel = 15,
                ActNumber = 2,
                AmbientColor = "#0f172a"
            },
            new()
            {
                Id = "FrostpeakTundra",
                Name = "Frostpeak Tundra",
                Subtitle = "Frozen Glaciers & Howling Blizzards",
                BiomeType = "Tundra",
                RecommendedLevel = 20,
                ActNumber = 2,
                BossName = "Yeti Frost Goliath",
                MonsterTypesJson = JsonSerializer.Serialize(new[] { "frost_elemental", "ice_golem", "yeti" }),
                HazardsJson = JsonSerializer.Serialize(new[] { "blizzard_zone", "slippery_ice" })
            },
            new()
            {
                Id = "HowlingIceCaverns",
                Name = "Howling Ice Caverns",
                Subtitle = "Subterranean Ice Grotto & Crystal Guardians",
                BiomeType = "Tundra",
                RecommendedLevel = 25,
                ActNumber = 2,
                BossName = "Glacial Behemoth Frosthorn",
                MonsterTypesJson = JsonSerializer.Serialize(new[] { "ice_wraith", "frost_golem", "blizzard_beast" }),
                HazardsJson = JsonSerializer.Serialize(new[] { "falling_stalactites", "deep_frost" })
            },
            new()
            {
                Id = "StormpeakRidge",
                Name = "Stormpeak Ridge",
                Subtitle = "Glacial Spire of Sovereign Vael",
                BiomeType = "Tundra",
                RecommendedLevel = 30,
                ActNumber = 2,
                BossName = "Cryomancer Vael the Frost Sovereign",
                MonsterTypesJson = JsonSerializer.Serialize(new[] { "frost_archon", "ice_wraith", "blizzard_beast" }),
                HazardsJson = JsonSerializer.Serialize(new[] { "cryo_vortex", "glacial_shatter" })
            },

            // === ACT 3: INFERNAL CALDERA ===
            new()
            {
                Id = "AshenRedoubt",
                Name = "Ashen Redoubt",
                Subtitle = "Subterranean Obsidian Bastion (Safe Haven)",
                BiomeType = "Town",
                RecommendedLevel = 30,
                ActNumber = 3,
                AmbientColor = "#1a0f0a"
            },
            new()
            {
                Id = "ObsidianWastes",
                Name = "Obsidian Wastes",
                Subtitle = "Basalt Wilderness & Ash Storms",
                BiomeType = "Volcanic",
                RecommendedLevel = 35,
                ActNumber = 3,
                BossName = "Cinder Drake Pyroth",
                MonsterTypesJson = JsonSerializer.Serialize(new[] { "fire_imp", "magma_hound", "lava_golem" }),
                HazardsJson = JsonSerializer.Serialize(new[] { "ash_storm", "basalt_fissure" })
            },
            new()
            {
                Id = "MoltenCaldera",
                Name = "Molten Caldera",
                Subtitle = "Infernal Core of Mount Caelum",
                BiomeType = "Volcanic",
                RecommendedLevel = 40,
                ActNumber = 3,
                BossName = "Magma Hound Alpha",
                MonsterTypesJson = JsonSerializer.Serialize(new[] { "fire_imp", "lava_golem", "magma_hound" }),
                HazardsJson = JsonSerializer.Serialize(new[] { "lava_pool", "fire_spout" })
            },
            new()
            {
                Id = "InfernalHeart",
                Name = "Infernal Heart",
                Subtitle = "Throne of the Molten Archon",
                BiomeType = "Volcanic",
                RecommendedLevel = 45,
                ActNumber = 3,
                BossName = "Ignis the Undying Archon",
                MonsterTypesJson = JsonSerializer.Serialize(new[] { "infernal_colossus", "magma_serpent", "fire_drake" }),
                HazardsJson = JsonSerializer.Serialize(new[] { "superheated_magma", "cataclysmic_eruption" })
            },

            // === ACT 4: SUNKEN NECROPOLIS ===
            new()
            {
                Id = "OasisSanctum",
                Name = "Oasis Sanctum",
                Subtitle = "Twilight Oasis Sanctuary (Safe Haven)",
                BiomeType = "Town",
                RecommendedLevel = 45,
                ActNumber = 4,
                AmbientColor = "#131b24"
            },
            new()
            {
                Id = "ShiftingDunes",
                Name = "Shifting Dunes",
                Subtitle = "Endless Desert Canyon & Sand Wyrms",
                BiomeType = "Dungeon",
                RecommendedLevel = 50,
                ActNumber = 4,
                BossName = "Great Sand Wyrm Ouroboros",
                MonsterTypesJson = JsonSerializer.Serialize(new[] { "sand_wyrm", "tomb_scarab", "desert_bandit" }),
                HazardsJson = JsonSerializer.Serialize(new[] { "sandstorm_vortex", "quicksand_pit" })
            },
            new()
            {
                Id = "DreadTombs",
                Name = "Dread Tombs of the Ancients",
                Subtitle = "Sunken Catacombs of Forgotten Kings",
                BiomeType = "Dungeon",
                RecommendedLevel = 55,
                ActNumber = 4,
                BossName = "Anubis Shade Guardian",
                MonsterTypesJson = JsonSerializer.Serialize(new[] { "mummy_warrior", "tomb_scorpion", "plague_spectre" }),
                HazardsJson = JsonSerializer.Serialize(new[] { "decay_miasma", "soul_drain_totem" })
            },
            new()
            {
                Id = "NecropolisOfSouls",
                Name = "Necropolis of Souls",
                Subtitle = "Cathedral of the Undying Lich",
                BiomeType = "Dungeon",
                RecommendedLevel = 60,
                ActNumber = 4,
                BossName = "High Inquisitor Morvath",
                MonsterTypesJson = JsonSerializer.Serialize(new[] { "death_knight", "lich_priest", "void_stalker" }),
                HazardsJson = JsonSerializer.Serialize(new[] { "soul_harvest_circle", "shadow_collapse" })
            },

            // === ACT 5: CELESTIAL VOID & PINNACLE ===
            new()
            {
                Id = "AethelisCitadel",
                Name = "Aethelis Citadel",
                Subtitle = "Celestial Floating Sky Enclave (Safe Haven)",
                BiomeType = "Town",
                RecommendedLevel = 60,
                ActNumber = 5,
                AmbientColor = "#1e1b2e"
            },
            new()
            {
                Id = "VoidAbyss",
                Name = "Void Abyss",
                Subtitle = "Citadel of Primordial Chaos",
                BiomeType = "Void",
                RecommendedLevel = 70,
                ActNumber = 5,
                BossName = "Void Fiend Behemoth",
                MonsterTypesJson = JsonSerializer.Serialize(new[] { "void_walker", "chaos_tentacle", "abyssal_eye" }),
                HazardsJson = JsonSerializer.Serialize(new[] { "chaos_decay", "event_horizon" })
            },
            new()
            {
                Id = "CitadelOfTheVoid",
                Name = "Citadel of the Void",
                Subtitle = "Throne of Primordial Eternity",
                BiomeType = "Void",
                RecommendedLevel = 75,
                ActNumber = 5,
                BossName = "The Void Sovereign Prime",
                MonsterTypesJson = JsonSerializer.Serialize(new[] { "void_herald", "celestial_destroyer" }),
                HazardsJson = JsonSerializer.Serialize(new[] { "reality_tear", "oblivion_beam" })
            },
            new()
            {
                Id = "ArenaCaldera",
                Name = "Pinnacle Arena: Caldera",
                Subtitle = "Tier 10 Volcanic Endgame Arena",
                BiomeType = "Volcanic",
                RecommendedLevel = 78,
                ActNumber = 5,
                BossName = "Ignis Prime"
            },
            new()
            {
                Id = "ArenaGlacial",
                Name = "Pinnacle Arena: Glacial",
                Subtitle = "Tier 12 Glacial Endgame Arena",
                BiomeType = "Tundra",
                RecommendedLevel = 80,
                ActNumber = 5,
                BossName = "Vael Archon"
            },
            new()
            {
                Id = "ArenaVoid",
                Name = "Pinnacle Arena: Void Rift",
                Subtitle = "Tier 16 Ultimate Void Arena",
                BiomeType = "Void",
                RecommendedLevel = 84,
                ActNumber = 5,
                BossName = "Ultimate Void Sovereign"
            }
        };
    }

    public static List<CampaignActEntity> BuildDefaultCampaignActs()
    {
        return new List<CampaignActEntity>
        {
            new()
            {
                ActNumber = 1,
                Name = "Act I: Sylvan Frontier",
                Subtitle = "Awaken in Haven and cleanse the ancient crypt of Malakor.",
                LevelRange = "Lv. 1 - 15",
                Boss = "Malakor the Shadow Fiend",
                CoverArt = "assets/acts/act1_sylvan.jpg",
                ZonesJson = JsonSerializer.Serialize(new[] { "SanctuaryHaven", "WhisperingPlains", "VerdantCanopy", "ForgottenCrypt" })
            },
            new()
            {
                ActNumber = 2,
                Name = "Act II: Frozen Spires",
                Subtitle = "Establish Glacial Outpost and conquer Sovereign Vael atop the summit.",
                LevelRange = "Lv. 15 - 30",
                Boss = "Cryomancer Vael the Frost Sovereign",
                CoverArt = "assets/acts/act2_frozen.jpg",
                ZonesJson = JsonSerializer.Serialize(new[] { "GlacialOutpost", "FrostpeakTundra", "HowlingIceCaverns", "StormpeakRidge" })
            },
            new()
            {
                ActNumber = 3,
                Name = "Act III: Infernal Caldera",
                Subtitle = "Enter Ashen Redoubt and pierce into Mount Caelum to defeat Ignis.",
                LevelRange = "Lv. 30 - 45",
                Boss = "Ignis the Undying Archon",
                CoverArt = "assets/acts/act3_infernal.jpg",
                ZonesJson = JsonSerializer.Serialize(new[] { "AshenRedoubt", "ObsidianWastes", "MoltenCaldera", "InfernalHeart" })
            },
            new()
            {
                ActNumber = 4,
                Name = "Act IV: Sunken Necropolis",
                Subtitle = "Discover Oasis Sanctum and purge the undead lords within the Necropolis.",
                LevelRange = "Lv. 45 - 60",
                Boss = "High Inquisitor Morvath",
                CoverArt = "assets/acts/act4_necropolis.jpg",
                ZonesJson = JsonSerializer.Serialize(new[] { "OasisSanctum", "ShiftingDunes", "DreadTombs", "NecropolisOfSouls" })
            },
            new()
            {
                ActNumber = 5,
                Name = "Act V: Celestial Void & Pinnacle",
                Subtitle = "Ascend to Aethelis Citadel, slay the Void Sovereign, and master the Map Device.",
                LevelRange = "Lv. 60 - 85+",
                Boss = "The Void Sovereign Prime",
                CoverArt = "assets/acts/act5_celestial.jpg",
                ZonesJson = JsonSerializer.Serialize(new[] { "AethelisCitadel", "VoidAbyss", "CitadelOfTheVoid", "ArenaCaldera", "ArenaGlacial", "ArenaVoid" })
            }
        };
    }
}
