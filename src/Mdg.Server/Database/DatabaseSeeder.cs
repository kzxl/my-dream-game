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

CREATE TABLE IF NOT EXISTS ""MonsterTemplates"" (
    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_MonsterTemplates"" PRIMARY KEY,
    ""Name"" TEXT NOT NULL,
    ""Icon"" TEXT NOT NULL,
    ""Family"" TEXT NOT NULL,
    ""Act"" INTEGER NOT NULL,
    ""Biome"" TEXT NOT NULL,
    ""IsBoss"" INTEGER NOT NULL,
    ""BaseHp"" INTEGER NOT NULL,
    ""BaseDmg"" INTEGER NOT NULL,
    ""Speed"" REAL NOT NULL,
    ""Element"" TEXT NOT NULL,
    ""PrimaryWeakness"" TEXT NOT NULL,
    ""Skills"" TEXT NOT NULL,
    ""Description"" TEXT NOT NULL,
    ""SignatureItemId"" TEXT NOT NULL,
    ""CreatedAt"" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ""IX_MonsterTemplates_Family"" ON ""MonsterTemplates"" (""Family"");
CREATE INDEX IF NOT EXISTS ""IX_MonsterTemplates_Act"" ON ""MonsterTemplates"" (""Act"");

CREATE TABLE IF NOT EXISTS ""UnifiedModifierTemplates"" (
    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_UnifiedModifierTemplates"" PRIMARY KEY,
    ""TargetCategory"" TEXT NOT NULL,
    ""ModType"" TEXT NOT NULL,
    ""StatKey"" TEXT NOT NULL,
    ""ValueMin"" REAL NOT NULL,
    ""ValueMax"" REAL NOT NULL,
    ""Tier"" INTEGER NOT NULL,
    ""Weight"" INTEGER NOT NULL,
    ""DescriptionTemplate"" TEXT NOT NULL,
    ""TagsJson"" TEXT NOT NULL,
    ""CreatedAt"" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ""IX_UnifiedModifierTemplates_TargetCategory"" ON ""UnifiedModifierTemplates"" (""TargetCategory"");
CREATE INDEX IF NOT EXISTS ""IX_UnifiedModifierTemplates_ModType"" ON ""UnifiedModifierTemplates"" (""ModType"");
CREATE INDEX IF NOT EXISTS ""IX_UnifiedModifierTemplates_StatKey"" ON ""UnifiedModifierTemplates"" (""StatKey"");

CREATE TABLE IF NOT EXISTS ""DropTableEntries"" (
    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_DropTableEntries"" PRIMARY KEY,
    ""SourceType"" TEXT NOT NULL,
    ""SourceKey"" TEXT NOT NULL,
    ""ItemTemplateId"" TEXT NOT NULL,
    ""ItemName"" TEXT NOT NULL,
    ""ItemRarity"" TEXT NOT NULL,
    ""ItemSlot"" TEXT NOT NULL,
    ""DropChancePercent"" REAL NOT NULL,
    ""MinQuantity"" INTEGER NOT NULL,
    ""MaxQuantity"" INTEGER NOT NULL,
    ""RequiredMasteryRank"" INTEGER NOT NULL,
    ""IsSignature"" INTEGER NOT NULL,
    ""MinIlvl"" INTEGER NOT NULL,
    ""CreatedAt"" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ""IX_DropTableEntries_SourceKey"" ON ""DropTableEntries"" (""SourceKey"");
CREATE INDEX IF NOT EXISTS ""IX_DropTableEntries_RequiredMasteryRank"" ON ""DropTableEntries"" (""RequiredMasteryRank"");

CREATE TABLE IF NOT EXISTS ""FamilyMasteryTemplates"" (
    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_FamilyMasteryTemplates"" PRIMARY KEY,
    ""Name"" TEXT NOT NULL,
    ""Icon"" TEXT NOT NULL,
    ""Color"" TEXT NOT NULL,
    ""Description"" TEXT NOT NULL,
    ""RootNodeId"" TEXT NOT NULL,
    ""CreatedAt"" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ""FamilyTalentNodes"" (
    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_FamilyTalentNodes"" PRIMARY KEY,
    ""FamilyId"" TEXT NOT NULL,
    ""Branch"" TEXT NOT NULL,
    ""Name"" TEXT NOT NULL,
    ""Icon"" TEXT NOT NULL,
    ""Description"" TEXT NOT NULL,
    ""ParentNodeId"" TEXT NOT NULL,
    ""IsKeystone"" INTEGER NOT NULL,
    ""StatKey"" TEXT NOT NULL,
    ""StatValue"" REAL NOT NULL,
    ""Tier"" INTEGER NOT NULL,
    ""CreatedAt"" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ""IX_FamilyTalentNodes_FamilyId"" ON ""FamilyTalentNodes"" (""FamilyId"");

CREATE TABLE IF NOT EXISTS ""QuestTemplates"" (
    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_QuestTemplates"" PRIMARY KEY,
    ""ActNumber"" INTEGER NOT NULL,
    ""Title"" TEXT NOT NULL,
    ""Description"" TEXT NOT NULL,
    ""RequiredLevel"" INTEGER NOT NULL,
    ""TargetZoneId"" TEXT NOT NULL,
    ""TargetNpcId"" TEXT NOT NULL,
    ""ObjectivesJson"" TEXT NOT NULL,
    ""RewardsJson"" TEXT NOT NULL,
    ""CreatedAt"" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ""IX_QuestTemplates_ActNumber"" ON ""QuestTemplates"" (""ActNumber"");

CREATE TABLE IF NOT EXISTS ""NpcDialogues"" (
    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_NpcDialogues"" PRIMARY KEY,
    ""NpcName"" TEXT NOT NULL,
    ""Title"" TEXT NOT NULL,
    ""ZoneId"" TEXT NOT NULL,
    ""AvatarIcon"" TEXT NOT NULL,
    ""Color"" TEXT NOT NULL,
    ""Greeting"" TEXT NOT NULL,
    ""OptionsJson"" TEXT NOT NULL,
    ""CreatedAt"" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ""IX_NpcDialogues_ZoneId"" ON ""NpcDialogues"" (""ZoneId"");

CREATE TABLE IF NOT EXISTS ""DevotionConstellations"" (
    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_DevotionConstellations"" PRIMARY KEY,
    ""Name"" TEXT NOT NULL,
    ""Affiliation"" TEXT NOT NULL,
    ""Tier"" TEXT NOT NULL,
    ""TotalStars"" INTEGER NOT NULL,
    ""AffinityGrantedJson"" TEXT NOT NULL,
    ""AffinityRequiredJson"" TEXT NOT NULL,
    ""Description"" TEXT NOT NULL,
    ""CreatedAt"" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ""DevotionNodes"" (
    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_DevotionNodes"" PRIMARY KEY,
    ""ConstellationId"" TEXT NOT NULL,
    ""Name"" TEXT NOT NULL,
    ""Description"" TEXT NOT NULL,
    ""Lore"" TEXT NOT NULL,
    ""StatKey"" TEXT NOT NULL,
    ""StatValue"" REAL NOT NULL,
    ""StringValue"" TEXT,
    ""X"" REAL NOT NULL,
    ""Y"" REAL NOT NULL,
    ""ParentNodeId"" TEXT,
    ""Color"" TEXT NOT NULL,
    ""Icon"" TEXT NOT NULL,
    ""IsRoot"" INTEGER NOT NULL,
    ""IsProc"" INTEGER NOT NULL,
    ""CreatedAt"" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ""IX_DevotionNodes_ConstellationId"" ON ""DevotionNodes"" (""ConstellationId"");
");
        }
        catch { }

        // Ensure Character table schema columns exist
        var characterColumns = new[]
        {
            "AccountId TEXT DEFAULT 'guest'",
            "MonsterKillsJson TEXT DEFAULT '{}'",
            "FamilyTalentsJson TEXT DEFAULT '{}'",
            "FamilyPointsJson TEXT DEFAULT '{}'",
            "DevotionNodesJson TEXT DEFAULT '[]'",
            "CompletedQuestsJson TEXT DEFAULT '[]'",
            "ActiveQuestsJson TEXT DEFAULT '{}'",
            "WaypointsJson TEXT DEFAULT '[]'",
            "CurrenciesJson TEXT DEFAULT '{}'",
            "DevotionPoints INTEGER DEFAULT 8",
            "Ascendance TEXT DEFAULT ''"
        };
        foreach (var col in characterColumns)
        {
            try { await db.Database.ExecuteSqlRawAsync("ALTER TABLE \"Characters\" ADD COLUMN " + col + ";"); } catch { }
        }

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

        // 6. Seed Monster Master Templates
        if (!await db.MonsterTemplates.AnyAsync())
        {
            var monsters = BuildDefaultMonsterTemplates();
            await db.MonsterTemplates.AddRangeAsync(monsters);
            await db.SaveChangesAsync();
        }

        // 7. Seed Unified Modifier Templates (Equipment + Monster + Map)
        if (!await db.UnifiedModifiers.AnyAsync())
        {
            var modifiers = BuildDefaultUnifiedModifiers();
            await db.UnifiedModifiers.AddRangeAsync(modifiers);
            await db.SaveChangesAsync();
        }

        // 8. Seed Drop Table Entries
        if (!await db.DropTables.AnyAsync())
        {
            var dropTables = BuildDefaultDropTableEntries();
            await db.DropTables.AddRangeAsync(dropTables);
            await db.SaveChangesAsync();
        }

        // 9. Seed Family Mastery Templates & Branching Talent Nodes
        if (!await db.FamilyMasteries.AnyAsync())
        {
            var (families, nodes) = BuildDefaultFamilyMasterySystem();
            await db.FamilyMasteries.AddRangeAsync(families);
            await db.FamilyTalentNodes.AddRangeAsync(nodes);
            await db.SaveChangesAsync();
        }

        // 10. Seed Quests
        if (!await db.QuestTemplates.AnyAsync())
        {
            var quests = BuildDefaultQuestTemplates();
            await db.QuestTemplates.AddRangeAsync(quests);
            await db.SaveChangesAsync();
        }

        // 11. Seed NPC Dialogues
        if (!await db.NpcDialogues.AnyAsync())
        {
            var npcs = BuildDefaultNpcDialogues();
            await db.NpcDialogues.AddRangeAsync(npcs);
            await db.SaveChangesAsync();
        }

        // 12. Seed Devotion Constellations & Nodes
        if (!await db.DevotionConstellations.AnyAsync())
        {
            var (constellations, devNodes) = BuildDefaultDevotionSystem();
            await db.DevotionConstellations.AddRangeAsync(constellations);
            await db.DevotionNodes.AddRangeAsync(devNodes);
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

    public static List<MonsterTemplateEntity> BuildDefaultMonsterTemplates()
    {
        return new List<MonsterTemplateEntity>
        {
            // Act 1
            new()
            {
                Id = "goblin_scout",
                Name = "Goblin Scout",
                Icon = "👺",
                Family = "Beast",
                Act = 1,
                Biome = "Plains",
                IsBoss = false,
                BaseHp = 180,
                BaseDmg = 28,
                Speed = 3.8f,
                Element = "Physical",
                PrimaryWeakness = "Fire",
                Skills = "Poison Dart (DoT), Rapid Ambush Dash",
                Description = "Nimble green raiders who ambush travelers in Whispering Plains using poisoned darts.",
                SignatureItemId = "sig_goblin_pouch"
            },
            new()
            {
                Id = "direwolf",
                Name = "Feral Direwolf",
                Icon = "🐺",
                Family = "Beast",
                Act = 1,
                Biome = "Plains",
                IsBoss = false,
                BaseHp = 320,
                BaseDmg = 45,
                Speed = 4.2f,
                Element = "Physical",
                PrimaryWeakness = "Cold",
                Skills = "Lacerating Bite, Pack Howl (+30% Speed)",
                Description = "Fierce apex predators hunting in packs. Their savage bites induce heavy bleeding and armor shred.",
                SignatureItemId = "sig_alpha_fang"
            },
            new()
            {
                Id = "skeleton_warrior",
                Name = "Skeleton Warrior",
                Icon = "💀",
                Family = "Undead",
                Act = 1,
                Biome = "Dungeon",
                IsBoss = false,
                BaseHp = 420,
                BaseDmg = 52,
                Speed = 3.4f,
                Element = "Chaos / Physical",
                PrimaryWeakness = "Holy / Lightning",
                Skills = "Shield Slam (Stun 1s), Bone Cleave",
                Description = "Ancient resurrected crypt sentinels clad in rusted iron armor and wielding razor bone greatswords.",
                SignatureItemId = "sig_crypt_shield"
            },
            new()
            {
                Id = "malakor",
                Name = "Malakor the Shadow Fiend",
                Icon = "🔥",
                Family = "Fiend",
                Act = 1,
                Biome = "Dungeon",
                IsBoss = true,
                BaseHp = 4800,
                BaseDmg = 120,
                Speed = 4.5f,
                Element = "Fire / Chaos",
                PrimaryWeakness = "Cold / Holy",
                Skills = "Hellfire Eruption, Shadow Shockwave, Void Teleport",
                Description = "The ancient dreadlord of the Forgotten Crypt. Commands soul flames, sweeping shadow pillars, and teleports behind heroes.",
                SignatureItemId = "sig_malakor_blade"
            },

            // Act 2
            new()
            {
                Id = "frost_elemental",
                Name = "Frost Elemental",
                Icon = "❄️",
                Family = "Elemental",
                Act = 2,
                Biome = "Tundra",
                IsBoss = false,
                BaseHp = 650,
                BaseDmg = 75,
                Speed = 3.6f,
                Element = "Cold",
                PrimaryWeakness = "Fire",
                Skills = "Glacial Cone (Freeze 2s), Frost Nova Discharge",
                Description = "Living crystal spirits of absolute zero who shatter upon death into piercing ice shards.",
                SignatureItemId = "sig_glacial_core"
            },
            new()
            {
                Id = "yeti",
                Name = "Yeti Frost Goliath",
                Icon = "🦣",
                Family = "Beast",
                Act = 2,
                Biome = "Tundra",
                IsBoss = false,
                BaseHp = 1250,
                BaseDmg = 110,
                Speed = 3.2f,
                Element = "Cold / Physical",
                PrimaryWeakness = "Fire",
                Skills = "Earthquake Slam (Stun), Ice Avalanche Roar",
                Description = "Colossal mountain beasts capable of ground-slam tremors that stun all nearby prey.",
                SignatureItemId = "sig_yeti_hide"
            },
            new()
            {
                Id = "vael_frost",
                Name = "Cryomancer Vael the Frost Sovereign",
                Icon = "👑",
                Family = "Elemental",
                Act = 2,
                Biome = "Tundra",
                IsBoss = true,
                BaseHp = 9500,
                BaseDmg = 180,
                Speed = 4.6f,
                Element = "Cold / Arcane",
                PrimaryWeakness = "Fire / Lightning",
                Skills = "Blizzard Vortex, Glacial Prison, Frost Storm Beam",
                Description = "Ruler of the Permafrost Peaks who casts blizzards, summons ice prisons, and discharges absolute zero beams.",
                SignatureItemId = "sig_vael_staff"
            },

            // Act 3
            new()
            {
                Id = "magma_golem",
                Name = "Magma Golem",
                Icon = "🗿",
                Family = "Construct",
                Act = 3,
                Biome = "Volcano",
                IsBoss = false,
                BaseHp = 1600,
                BaseDmg = 135,
                Speed = 3.0f,
                Element = "Fire / Physical",
                PrimaryWeakness = "Cold",
                Skills = "Molten Smash, Scorched Earth Aura",
                Description = "Forged within subterranean lava cauldrons. Leaves burning trails that incinerate boots.",
                SignatureItemId = "sig_magma_heart"
            },
            new()
            {
                Id = "ignis_dragon",
                Name = "Ignis the Scourge Wyrm",
                Icon = "🐉",
                Family = "Fiend",
                Act = 3,
                Biome = "Volcano",
                IsBoss = true,
                BaseHp = 16000,
                BaseDmg = 260,
                Speed = 5.0f,
                Element = "Fire",
                PrimaryWeakness = "Cold / Lightning",
                Skills = "Infernal Breath, Fireball Barrage, Cataclysm Flight",
                Description = "Ancient draconic calamity. Soars across the battlefield raining meteors and scorching the entire arena.",
                SignatureItemId = "sig_dragon_crown"
            },

            // Act 4
            new()
            {
                Id = "abyssal_stalker",
                Name = "Abyssal Void Stalker",
                Icon = "🐙",
                Family = "Fiend",
                Act = 4,
                Biome = "Abyss",
                IsBoss = false,
                BaseHp = 2200,
                BaseDmg = 170,
                Speed = 4.8f,
                Element = "Chaos",
                PrimaryWeakness = "Lightning / Fire",
                Skills = "Shadow Blink, Chaos Siphon, Miasma Cloud",
                Description = "Eldritch predators from beneath the oceanic depths. Siphons player energy shield on contact.",
                SignatureItemId = "sig_abyssal_eye"
            },
            new()
            {
                Id = "leviathan",
                Name = "Tenebris the Leviathan Sovereign",
                Icon = "🦑",
                Family = "Fiend",
                Act = 4,
                Biome = "Abyss",
                IsBoss = true,
                BaseHp = 28000,
                BaseDmg = 340,
                Speed = 4.5f,
                Element = "Chaos / Cold",
                PrimaryWeakness = "Lightning",
                Skills = "Abyssal Whirlpool, Tentacle Slam, Void Blackout",
                Description = "Titan of the sunless trenches. Commands crushing tidal whirlpools and dark miasma surges.",
                SignatureItemId = "sig_leviathan_trident"
            }
        };
    }

    public static List<UnifiedModifierTemplateEntity> BuildDefaultUnifiedModifiers()
    {
        return new List<UnifiedModifierTemplateEntity>
        {
            // === Equipment Prefixes ===
            new() { Id = "aff_flat_phys_t1", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "FlatPhys", ValueMin = 10, ValueMax = 20, Tier = 1, Weight = 1000, DescriptionTemplate = "+{0} to Physical Damage" },
            new() { Id = "aff_flat_phys_t2", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "FlatPhys", ValueMin = 25, ValueMax = 45, Tier = 2, Weight = 600, DescriptionTemplate = "+{0} to Physical Damage" },
            new() { Id = "aff_flat_phys_t3", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "FlatPhys", ValueMin = 50, ValueMax = 80, Tier = 3, Weight = 250, DescriptionTemplate = "+{0} to Physical Damage" },

            new() { Id = "aff_flat_fire_t1", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "FlatFire", ValueMin = 12, ValueMax = 24, Tier = 1, Weight = 1000, DescriptionTemplate = "+{0} to Fire Damage" },
            new() { Id = "aff_flat_fire_t2", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "FlatFire", ValueMin = 28, ValueMax = 50, Tier = 2, Weight = 600, DescriptionTemplate = "+{0} to Fire Damage" },
            new() { Id = "aff_flat_fire_t3", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "FlatFire", ValueMin = 55, ValueMax = 90, Tier = 3, Weight = 250, DescriptionTemplate = "+{0} to Fire Damage" },

            new() { Id = "aff_flat_cold_t1", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "FlatCold", ValueMin = 10, ValueMax = 22, Tier = 1, Weight = 1000, DescriptionTemplate = "+{0} to Cold Damage" },
            new() { Id = "aff_flat_cold_t2", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "FlatCold", ValueMin = 26, ValueMax = 48, Tier = 2, Weight = 600, DescriptionTemplate = "+{0} to Cold Damage" },
            new() { Id = "aff_flat_cold_t3", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "FlatCold", ValueMin = 50, ValueMax = 85, Tier = 3, Weight = 250, DescriptionTemplate = "+{0} to Cold Damage" },

            new() { Id = "aff_flat_chaos_t1", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "FlatChaos", ValueMin = 15, ValueMax = 30, Tier = 1, Weight = 800, DescriptionTemplate = "+{0} to Chaos Damage" },
            new() { Id = "aff_flat_chaos_t2", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "FlatChaos", ValueMin = 35, ValueMax = 65, Tier = 2, Weight = 450, DescriptionTemplate = "+{0} to Chaos Damage" },
            new() { Id = "aff_flat_chaos_t3", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "FlatChaos", ValueMin = 70, ValueMax = 110, Tier = 3, Weight = 150, DescriptionTemplate = "+{0} to Chaos Damage" },

            new() { Id = "aff_max_life_t1", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "MaxLife", ValueMin = 30, ValueMax = 60, Tier = 1, Weight = 1200, DescriptionTemplate = "+{0} to Maximum Life" },
            new() { Id = "aff_max_life_t2", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "MaxLife", ValueMin = 70, ValueMax = 120, Tier = 2, Weight = 700, DescriptionTemplate = "+{0} to Maximum Life" },
            new() { Id = "aff_max_life_t3", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "MaxLife", ValueMin = 130, ValueMax = 220, Tier = 3, Weight = 300, DescriptionTemplate = "+{0} to Maximum Life" },

            new() { Id = "aff_max_es_t1", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "MaxEs", ValueMin = 25, ValueMax = 50, Tier = 1, Weight = 1000, DescriptionTemplate = "+{0} to Maximum Energy Shield" },
            new() { Id = "aff_max_es_t2", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "MaxEs", ValueMin = 60, ValueMax = 110, Tier = 2, Weight = 600, DescriptionTemplate = "+{0} to Maximum Energy Shield" },
            new() { Id = "aff_max_es_t3", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "MaxEs", ValueMin = 120, ValueMax = 200, Tier = 3, Weight = 250, DescriptionTemplate = "+{0} to Maximum Energy Shield" },

            new() { Id = "aff_armor_t1", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "Armor", ValueMin = 50, ValueMax = 100, Tier = 1, Weight = 1200, DescriptionTemplate = "+{0} to Armor" },
            new() { Id = "aff_armor_t2", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "Armor", ValueMin = 120, ValueMax = 220, Tier = 2, Weight = 700, DescriptionTemplate = "+{0} to Armor" },
            new() { Id = "aff_armor_t3", TargetCategory = "Equipment", ModType = "Prefix", StatKey = "Armor", ValueMin = 250, ValueMax = 450, Tier = 3, Weight = 300, DescriptionTemplate = "+{0} to Armor" },

            // === Equipment Suffixes ===
            new() { Id = "aff_fire_res_t1", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "FireRes", ValueMin = 12, ValueMax = 20, Tier = 1, Weight = 1000, DescriptionTemplate = "+{0}% to Fire Resistance" },
            new() { Id = "aff_fire_res_t2", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "FireRes", ValueMin = 22, ValueMax = 32, Tier = 2, Weight = 600, DescriptionTemplate = "+{0}% to Fire Resistance" },
            new() { Id = "aff_fire_res_t3", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "FireRes", ValueMin = 35, ValueMax = 48, Tier = 3, Weight = 250, DescriptionTemplate = "+{0}% to Fire Resistance" },

            new() { Id = "aff_cold_res_t1", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "ColdRes", ValueMin = 12, ValueMax = 20, Tier = 1, Weight = 1000, DescriptionTemplate = "+{0}% to Cold Resistance" },
            new() { Id = "aff_cold_res_t2", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "ColdRes", ValueMin = 22, ValueMax = 32, Tier = 2, Weight = 600, DescriptionTemplate = "+{0}% to Cold Resistance" },
            new() { Id = "aff_cold_res_t3", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "ColdRes", ValueMin = 35, ValueMax = 48, Tier = 3, Weight = 250, DescriptionTemplate = "+{0}% to Cold Resistance" },

            new() { Id = "aff_light_res_t1", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "LightningRes", ValueMin = 12, ValueMax = 20, Tier = 1, Weight = 1000, DescriptionTemplate = "+{0}% to Lightning Resistance" },
            new() { Id = "aff_light_res_t2", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "LightningRes", ValueMin = 22, ValueMax = 32, Tier = 2, Weight = 600, DescriptionTemplate = "+{0}% to Lightning Resistance" },
            new() { Id = "aff_light_res_t3", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "LightningRes", ValueMin = 35, ValueMax = 48, Tier = 3, Weight = 250, DescriptionTemplate = "+{0}% to Lightning Resistance" },

            new() { Id = "aff_chaos_res_t1", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "ChaosRes", ValueMin = 8, ValueMax = 15, Tier = 1, Weight = 700, DescriptionTemplate = "+{0}% to Chaos Resistance" },
            new() { Id = "aff_chaos_res_t2", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "ChaosRes", ValueMin = 18, ValueMax = 26, Tier = 2, Weight = 400, DescriptionTemplate = "+{0}% to Chaos Resistance" },
            new() { Id = "aff_chaos_res_t3", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "ChaosRes", ValueMin = 28, ValueMax = 38, Tier = 3, Weight = 150, DescriptionTemplate = "+{0}% to Chaos Resistance" },

            new() { Id = "aff_attack_speed_t1", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "AttackSpeed", ValueMin = 8, ValueMax = 14, Tier = 1, Weight = 800, DescriptionTemplate = "+{0}% Increased Attack Speed" },
            new() { Id = "aff_attack_speed_t2", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "AttackSpeed", ValueMin = 16, ValueMax = 24, Tier = 2, Weight = 500, DescriptionTemplate = "+{0}% Increased Attack Speed" },
            new() { Id = "aff_attack_speed_t3", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "AttackSpeed", ValueMin = 26, ValueMax = 38, Tier = 3, Weight = 200, DescriptionTemplate = "+{0}% Increased Attack Speed" },

            new() { Id = "aff_crit_multi_t1", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "CritMulti", ValueMin = 15, ValueMax = 25, Tier = 1, Weight = 800, DescriptionTemplate = "+{0}% to Global Critical Multiplier" },
            new() { Id = "aff_crit_multi_t2", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "CritMulti", ValueMin = 28, ValueMax = 42, Tier = 2, Weight = 500, DescriptionTemplate = "+{0}% to Global Critical Multiplier" },
            new() { Id = "aff_crit_multi_t3", TargetCategory = "Equipment", ModType = "Suffix", StatKey = "CritMulti", ValueMin = 45, ValueMax = 65, Tier = 3, Weight = 200, DescriptionTemplate = "+{0}% to Global Critical Multiplier" },

            // === Monster Modifiers & Boss Auras ===
            new() { Id = "mon_hellfire_aura", TargetCategory = "Monster", ModType = "MonsterAura", StatKey = "HellfireAura", ValueMin = 25, ValueMax = 50, Tier = 1, Weight = 100, DescriptionTemplate = "Emits Hellfire aura dealing {0} fire damage/sec" },
            new() { Id = "mon_soul_chill", TargetCategory = "Monster", ModType = "MonsterAffix", StatKey = "SoulChill", ValueMin = 30, ValueMax = 60, Tier = 1, Weight = 100, DescriptionTemplate = "Attacks chill targets by {0}% movement speed" },
            new() { Id = "mon_primal_rage", TargetCategory = "Monster", ModType = "MonsterAffix", StatKey = "PrimalRage", ValueMin = 35, ValueMax = 50, Tier = 1, Weight = 100, DescriptionTemplate = "Gains +{0}% Attack & Move speed below 40% Life" },
            new() { Id = "mon_titan_armor", TargetCategory = "Monster", ModType = "MonsterAffix", StatKey = "TitanArmor", ValueMin = 50, ValueMax = 70, Tier = 1, Weight = 100, DescriptionTemplate = "Mitigates {0}% of physical damage" },

            // === Map Modifiers ===
            new() { Id = "map_extra_life", TargetCategory = "Map", ModType = "Prefix", StatKey = "MapMonsterLife", ValueMin = 30, ValueMax = 50, Tier = 1, Weight = 1000, DescriptionTemplate = "Monsters have +{0}% Maximum Life" },
            new() { Id = "map_ele_reflect", TargetCategory = "Map", ModType = "Suffix", StatKey = "MapEleReflect", ValueMin = 10, ValueMax = 20, Tier = 1, Weight = 500, DescriptionTemplate = "Monsters reflect {0}% of Elemental Damage" }
        };
    }

    public static List<DropTableEntryEntity> BuildDefaultDropTableEntries()
    {
        var list = new List<DropTableEntryEntity>
        {
            // Global Currency Drops
            new() { SourceType = "Global", SourceKey = "all", ItemTemplateId = "Currency_Transmute", ItemName = "Aether Spark", ItemRarity = "Currency", ItemSlot = "None", DropChancePercent = 14.0f, MinQuantity = 1, MaxQuantity = 2, RequiredMasteryRank = 0 },
            new() { SourceType = "Global", SourceKey = "all", ItemTemplateId = "Currency_Alteration", ItemName = "Flux Catalyst", ItemRarity = "Currency", ItemSlot = "None", DropChancePercent = 10.0f, MinQuantity = 1, MaxQuantity = 2, RequiredMasteryRank = 0 },
            new() { SourceType = "Global", SourceKey = "all", ItemTemplateId = "Currency_Chaos", ItemName = "Fracture Core", ItemRarity = "Currency", ItemSlot = "None", DropChancePercent = 3.5f, MinQuantity = 1, MaxQuantity = 1, RequiredMasteryRank = 1 },
            new() { SourceType = "Global", SourceKey = "all", ItemTemplateId = "Currency_Alchemy", ItemName = "Genesis Prism", ItemRarity = "Currency", ItemSlot = "None", DropChancePercent = 4.0f, MinQuantity = 1, MaxQuantity = 1, RequiredMasteryRank = 1 },
            new() { SourceType = "Global", SourceKey = "all", ItemTemplateId = "Currency_Exalted", ItemName = "Ascendant Catalyst", ItemRarity = "Currency", ItemSlot = "None", DropChancePercent = 0.8f, MinQuantity = 1, MaxQuantity = 1, RequiredMasteryRank = 2 },
            new() { SourceType = "Global", SourceKey = "all", ItemTemplateId = "Scroll_Resurrection", ItemName = "Scroll of Resurrection", ItemRarity = "Consumable", ItemSlot = "None", DropChancePercent = 2.5f, MinQuantity = 1, MaxQuantity = 1, RequiredMasteryRank = 0 },

            // 11 Signature Monster Artifacts (Authoritative Drop Configuration)
            new() { SourceType = "Monster", SourceKey = "goblin_scout", ItemTemplateId = "sig_goblin_pouch", ItemName = "Scout's Poisoned Pouch", ItemRarity = "Unique", ItemSlot = "Amulet", DropChancePercent = 2.5f, RequiredMasteryRank = 3, IsSignature = true },
            new() { SourceType = "Monster", SourceKey = "direwolf", ItemTemplateId = "sig_alpha_fang", ItemName = "Fang of the Alpha Wolf", ItemRarity = "Unique", ItemSlot = "MainHand", DropChancePercent = 2.5f, RequiredMasteryRank = 3, IsSignature = true },
            new() { SourceType = "Monster", SourceKey = "skeleton_warrior", ItemTemplateId = "sig_crypt_shield", ItemName = "Aegis of the Forgotten Crypt", ItemRarity = "Unique", ItemSlot = "OffHand", DropChancePercent = 2.5f, RequiredMasteryRank = 3, IsSignature = true },
            new() { SourceType = "Monster", SourceKey = "malakor", ItemTemplateId = "sig_malakor_blade", ItemName = "Malakor’s Dreadfire Cleaver", ItemRarity = "Unique", ItemSlot = "MainHand", DropChancePercent = 12.0f, RequiredMasteryRank = 3, IsSignature = true },
            new() { SourceType = "Monster", SourceKey = "frost_elemental", ItemTemplateId = "sig_glacial_core", ItemName = "Core of Absolute Zero", ItemRarity = "Unique", ItemSlot = "Amulet", DropChancePercent = 2.5f, RequiredMasteryRank = 3, IsSignature = true },
            new() { SourceType = "Monster", SourceKey = "yeti", ItemTemplateId = "sig_yeti_hide", ItemName = "Yeti Warmaster Hide", ItemRarity = "Unique", ItemSlot = "BodyArmor", DropChancePercent = 3.0f, RequiredMasteryRank = 3, IsSignature = true },
            new() { SourceType = "Monster", SourceKey = "vael_frost", ItemTemplateId = "sig_vael_staff", ItemName = "Vael’s Glacial Spire Staff", ItemRarity = "Unique", ItemSlot = "MainHand", DropChancePercent = 12.0f, RequiredMasteryRank = 3, IsSignature = true },
            new() { SourceType = "Monster", SourceKey = "magma_golem", ItemTemplateId = "sig_magma_heart", ItemName = "Heart of the Molten Colossus", ItemRarity = "Unique", ItemSlot = "Ring", DropChancePercent = 2.5f, RequiredMasteryRank = 3, IsSignature = true },
            new() { SourceType = "Monster", SourceKey = "ignis_dragon", ItemTemplateId = "sig_dragon_crown", ItemName = "Crown of the Scourge Wyrm", ItemRarity = "Unique", ItemSlot = "Helm", DropChancePercent = 12.0f, RequiredMasteryRank = 3, IsSignature = true },
            new() { SourceType = "Monster", SourceKey = "abyssal_stalker", ItemTemplateId = "sig_abyssal_eye", ItemName = "Eye of the Deep Trench", ItemRarity = "Unique", ItemSlot = "Ring", DropChancePercent = 3.0f, RequiredMasteryRank = 3, IsSignature = true },
            new() { SourceType = "Monster", SourceKey = "leviathan", ItemTemplateId = "sig_leviathan_trident", ItemName = "Tenebris Abyssal Trident", ItemRarity = "Unique", ItemSlot = "MainHand", DropChancePercent = 14.0f, RequiredMasteryRank = 3, IsSignature = true }
        };

        return list;
    }

    public static (List<FamilyMasteryTemplateEntity> Families, List<FamilyTalentNodeEntity> Nodes) BuildDefaultFamilyMasterySystem()
    {
        var families = new List<FamilyMasteryTemplateEntity>
        {
            new() { Id = "Beast", Name = "Ancient Beasts", Icon = "🐺", Color = "#ff9800", Description = "Savage mutated wildlife. Swift movers with deadly bleed lacerations.", RootNodeId = "beast_root" },
            new() { Id = "Undead", Name = "Crypt Undead", Icon = "💀", Color = "#00f2fe", Description = "Resurrected sentinels of forgotten dynasties clad in rusted iron.", RootNodeId = "undead_root" },
            new() { Id = "Fiend", Name = "Nether Fiends", Icon = "🔥", Color = "#e06c75", Description = "Demonic abyssal horrors commanding hellfire eruptions.", RootNodeId = "fiend_root" },
            new() { Id = "Elemental", Name = "Primal Elementals", Icon = "⚡", Color = "#ffd700", Description = "Living spirits of pure lightning, ice, and flame.", RootNodeId = "elem_root" },
            new() { Id = "Construct", Name = "Ancient Constructs", Icon = "🗿", Color = "#c678dd", Description = "Titan guardians forged from obsidian and enchanted bronze.", RootNodeId = "cons_root" }
        };

        var nodes = new List<FamilyTalentNodeEntity>
        {
            // === Beast Family ===
            new() { Id = "beast_root", FamilyId = "Beast", Branch = "root", Name = "Hunter Instincts", Icon = "🎯", Description = "+10% Physical Damage vs Beasts", StatKey = "BeastDmg", StatValue = 10 },
            new() { Id = "beast_a1", FamilyId = "Beast", Branch = "harvest", Name = "Trophy Skimmer", Icon = "🎒", Description = "+30% Raw Materials & Catalysts from Beasts", ParentNodeId = "beast_root", StatKey = "BeastHarvest", StatValue = 30 },
            new() { Id = "beast_a2", FamilyId = "Beast", Branch = "harvest", Name = "Alpha Relic Siphon", Icon = "💎", Description = "+40% Signature Fang Drop Rarity", ParentNodeId = "beast_a1", StatKey = "BeastSigRarity", StatValue = 40 },
            new() { Id = "beast_a_keystone", FamilyId = "Beast", Branch = "harvest", Name = "★ Primal Harvest", Icon = "👑", Description = "Beast Bosses drop double loot rolls on defeat", ParentNodeId = "beast_a2", IsKeystone = true, StatKey = "BeastDoubleBossLoot", StatValue = 1 },

            new() { Id = "beast_b1", FamilyId = "Beast", Branch = "combat", Name = "Flesh Piercer", Icon = "🗡️", Description = "+15% Crit Chance & +30% Crit Multi vs Beasts", ParentNodeId = "beast_root", StatKey = "BeastCrit", StatValue = 15 },
            new() { Id = "beast_b2", FamilyId = "Beast", Branch = "combat", Name = "Blood Frenzy", Icon = "⚡", Description = "Slaying Beasts grants +25% Attack & Move Speed for 5s", ParentNodeId = "beast_b1", StatKey = "BeastFrenzySpeed", StatValue = 25 },
            new() { Id = "beast_b_keystone", FamilyId = "Beast", Branch = "combat", Name = "★ Apex Predator", Icon = "🩸", Description = "Critical Strikes on Beasts execute targets below 20% Life", ParentNodeId = "beast_b2", IsKeystone = true, StatKey = "BeastExecute", StatValue = 20 },

            new() { Id = "beast_c1", FamilyId = "Beast", Branch = "survival", Name = "Thickened Hide", Icon = "🛡️", Description = "-20% Damage taken from all Beast attacks", ParentNodeId = "beast_root", StatKey = "BeastDmgReduction", StatValue = 20 },
            new() { Id = "beast_c2", FamilyId = "Beast", Branch = "survival", Name = "Coagulation Ward", Icon = "🧪", Description = "100% Immunity to Bleeding and Lacerations", ParentNodeId = "beast_c1", StatKey = "ImmuneBleed", StatValue = 1 },
            new() { Id = "beast_c_keystone", FamilyId = "Beast", Branch = "survival", Name = "★ Untamed Fortitude", Icon = "🏰", Description = "Taking a heavy hit from Beasts grants a 300 HP Barrier", ParentNodeId = "beast_c1", IsKeystone = true, StatKey = "BeastBarrier", StatValue = 300 },

            // === Undead Family ===
            new() { Id = "undead_root", FamilyId = "Undead", Branch = "root", Name = "Consecrated Striking", Icon = "✨", Description = "+10% Holy & Fire Damage vs Undead", StatKey = "UndeadDmg", StatValue = 10 },
            new() { Id = "undead_a1", FamilyId = "Undead", Branch = "harvest", Name = "Crypt Scavenger", Icon = "🔮", Description = "+35% Gem & Socketing Core Drops from Undead", ParentNodeId = "undead_root", StatKey = "UndeadGemDrop", StatValue = 35 },
            new() { Id = "undead_a2", FamilyId = "Undead", Branch = "harvest", Name = "Soul Gem Extractor", Icon = "💎", Description = "+40% Rare & Unique Gear Drop Rarity", ParentNodeId = "undead_a1", StatKey = "UndeadGearRarity", StatValue = 40 },
            new() { Id = "undead_a_keystone", FamilyId = "Undead", Branch = "harvest", Name = "★ Tomb Raider", Icon = "👑", Description = "Undead Elites have 50% chance for bonus Catalysts", ParentNodeId = "undead_a2", IsKeystone = true, StatKey = "UndeadBonusCatalysts", StatValue = 50 },

            new() { Id = "undead_b1", FamilyId = "Undead", Branch = "combat", Name = "Bone Breaker", Icon = "🔨", Description = "+20% Physical & Fire Penetration vs Undead", ParentNodeId = "undead_root", StatKey = "UndeadPenetration", StatValue = 20 },
            new() { Id = "undead_b2", FamilyId = "Undead", Branch = "combat", Name = "Soul Shatter", Icon = "💥", Description = "Slain Undead explode dealing 40% Max HP as Holy AoE", ParentNodeId = "undead_b1", StatKey = "UndeadExplosion", StatValue = 40 },
            new() { Id = "undead_b_keystone", FamilyId = "Undead", Branch = "combat", Name = "★ Inquisitor’s Wrath", Icon = "🔥", Description = "Gain +50% Crit Multiplier and +20% Attack Speed in crypts", ParentNodeId = "undead_b2", IsKeystone = true, StatKey = "UndeadInquisitorBuff", StatValue = 50 },

            new() { Id = "undead_c1", FamilyId = "Undead", Branch = "survival", Name = "Soulward Cloak", Icon = "🛡️", Description = "-20% Chaos & Physical Damage taken from Undead", ParentNodeId = "undead_root", StatKey = "UndeadMitigation", StatValue = 20 },
            new() { Id = "undead_c2", FamilyId = "Undead", Branch = "survival", Name = "Miasma Cleanser", Icon = "🧪", Description = "100% Immunity to Poison and Soul Chill ailments", ParentNodeId = "undead_c1", StatKey = "ImmunePoisonChill", StatValue = 1 },
            new() { Id = "undead_c_keystone", FamilyId = "Undead", Branch = "survival", Name = "★ Undying Aegis", Icon = "✨", Description = "Fatal blows from Undead grant 3s Divine Invulnerability", ParentNodeId = "undead_c1", IsKeystone = true, StatKey = "UndeadDeathImmunity", StatValue = 3 },

            // === Fiend Family ===
            new() { Id = "fiend_root", FamilyId = "Fiend", Branch = "root", Name = "Demonbane Knowledge", Icon = "📖", Description = "+10% Chaos & Elemental Damage vs Fiends", StatKey = "FiendDmg", StatValue = 10 },
            new() { Id = "fiend_a1", FamilyId = "Fiend", Branch = "harvest", Name = "Hellstone Harvester", Icon = "🔮", Description = "+40% Fracture Core & Catalyst Drops from Fiends", ParentNodeId = "fiend_root", StatKey = "FiendHarvest", StatValue = 40 },
            new() { Id = "fiend_a2", FamilyId = "Fiend", Branch = "harvest", Name = "Abyssal Siphon", Icon = "💎", Description = "+50% Signature Artifact Drop Chance from Fiends", ParentNodeId = "fiend_a1", StatKey = "FiendSigChance", StatValue = 50 },
            new() { Id = "fiend_a_keystone", FamilyId = "Fiend", Branch = "harvest", Name = "★ Infernal Wealth", Icon = "👑", Description = "Fiend Bosses drop guaranteed 2 Genesis Catalysts", ParentNodeId = "fiend_a2", IsKeystone = true, StatKey = "FiendGuaranteedCatalysts", StatValue = 2 },

            new() { Id = "fiend_b1", FamilyId = "Fiend", Branch = "combat", Name = "Hellbreaker Cleave", Icon = "🗡️", Description = "+25% Chaos Damage & +15% Crit Chance vs Fiends", ParentNodeId = "fiend_root", StatKey = "FiendChaosDmg", StatValue = 25 },
            new() { Id = "fiend_b2", FamilyId = "Fiend", Branch = "combat", Name = "Demon Purge", Icon = "🩸", Description = "Striking Fiends siphons 4% Mana & 5% Energy Shield per hit", ParentNodeId = "fiend_b1", StatKey = "FiendSiphon", StatValue = 5 },
            new() { Id = "fiend_b_keystone", FamilyId = "Fiend", Branch = "combat", Name = "★ Doom Slayer", Icon = "🔥", Description = "Inflict 50% More Damage against Fiend Bosses", ParentNodeId = "fiend_b2", IsKeystone = true, StatKey = "FiendBossMoreDmg", StatValue = 50 },

            new() { Id = "fiend_c1", FamilyId = "Fiend", Branch = "survival", Name = "Obsidian Shell", Icon = "🛡️", Description = "-20% Fire & Chaos Damage taken from Fiends", ParentNodeId = "fiend_root", StatKey = "FiendMitigation", StatValue = 20 },
            new() { Id = "fiend_c2", FamilyId = "Fiend", Branch = "survival", Name = "Flameproof Aegis", Icon = "🧊", Description = "100% Immunity to Ignite and Scorched Ground", ParentNodeId = "fiend_c1", StatKey = "ImmuneIgnite", StatValue = 1 },
            new() { Id = "fiend_c_keystone", FamilyId = "Fiend", Branch = "survival", Name = "★ Abyssal Resilience", Icon = "🏰", Description = "Gain +15% to Maximum Fire & Chaos Resistances (Cap 85%)", ParentNodeId = "fiend_c1", IsKeystone = true, StatKey = "FiendMaxResBonus", StatValue = 15 },

            // === Elemental Family ===
            new() { Id = "elem_root", FamilyId = "Elemental", Branch = "root", Name = "Arcane Attunement", Icon = "🔮", Description = "+10% Elemental Damage vs Elementals", StatKey = "ElemDmg", StatValue = 10 },
            new() { Id = "elem_a1", FamilyId = "Elemental", Branch = "harvest", Name = "Aether Condenser", Icon = "🔮", Description = "+40% Skill Gem & Resonance Drops from Elementals", ParentNodeId = "elem_root", StatKey = "ElemGemDrop", StatValue = 40 },
            new() { Id = "elem_a2", FamilyId = "Elemental", Branch = "harvest", Name = "Prismatic Harvest", Icon = "💎", Description = "+45% Rare Ring & Amulet Drop Rate", ParentNodeId = "elem_a1", StatKey = "ElemJewelryDrop", StatValue = 45 },
            new() { Id = "elem_a_keystone", FamilyId = "Elemental", Branch = "harvest", Name = "★ Elemental Surge", Icon = "👑", Description = "Elementals drop double Genesis Catalysts", ParentNodeId = "elem_a2", IsKeystone = true, StatKey = "ElemDoubleCatalysts", StatValue = 1 },

            new() { Id = "elem_b1", FamilyId = "Elemental", Branch = "combat", Name = "Overcharge Surge", Icon = "⚡", Description = "+20% Attack & Cast Speed in combat with Elementals", ParentNodeId = "elem_root", StatKey = "ElemCombatSpeed", StatValue = 20 },
            new() { Id = "elem_b2", FamilyId = "Elemental", Branch = "combat", Name = "Prismatic Disruption", Icon = "🌩️", Description = "Attacks strip 50% of Elemental Resistances from targets", ParentNodeId = "elem_b1", StatKey = "ElemResistStrip", StatValue = 50 },
            new() { Id = "elem_b_keystone", FamilyId = "Elemental", Branch = "combat", Name = "★ Arcane Cataclysm", Icon = "💥", Description = "Killing Elementals releases a Chain Lightning storm", ParentNodeId = "elem_b2", IsKeystone = true, StatKey = "ElemChainLightningOnKill", StatValue = 1 },

            new() { Id = "elem_c1", FamilyId = "Elemental", Branch = "survival", Name = "Prismatic Refraction", Icon = "🛡️", Description = "-20% Elemental Damage taken from Elementals", ParentNodeId = "elem_root", StatKey = "ElemMitigation", StatValue = 20 },
            new() { Id = "elem_c2", FamilyId = "Elemental", Branch = "survival", Name = "Tri-Element Ward", Icon = "🧪", Description = "100% Immunity to Freeze, Shock, and Ignite", ParentNodeId = "elem_c1", StatKey = "ImmuneTriElement", StatValue = 1 },
            new() { Id = "elem_c_keystone", FamilyId = "Elemental", Branch = "survival", Name = "★ Elemental Mirror", Icon = "🪞", Description = "Reflect 35% of all incoming Elemental Damage", ParentNodeId = "elem_c1", IsKeystone = true, StatKey = "ElemReflectDamage", StatValue = 35 },

            // === Construct Family ===
            new() { Id = "cons_root", FamilyId = "Construct", Branch = "root", Name = "Shatter Theory", Icon = "🔨", Description = "+10% Armor Penetration vs Constructs", StatKey = "ConsArmorPen", StatValue = 10 },
            new() { Id = "cons_a1", FamilyId = "Construct", Branch = "harvest", Name = "Ore Extractor", Icon = "⚒️", Description = "+50% Socketing Cores & Harmonic Tethers", ParentNodeId = "cons_root", StatKey = "ConsCoreDrops", StatValue = 50 },
            new() { Id = "cons_a2", FamilyId = "Construct", Branch = "harvest", Name = "Titan Core Siphon", Icon = "💎", Description = "+50% Crafting Base Item Drop Rarity", ParentNodeId = "cons_a1", StatKey = "ConsBaseItemRarity", StatValue = 50 },
            new() { Id = "cons_a_keystone", FamilyId = "Construct", Branch = "harvest", Name = "★ Foundry Master", Icon = "👑", Description = "Constructs drop guaranteed Tier 1 Crafting Bases", ParentNodeId = "cons_a2", IsKeystone = true, StatKey = "ConsGuaranteedBases", StatValue = 1 },

            new() { Id = "cons_b1", FamilyId = "Construct", Branch = "combat", Name = "Crushing Impact", Icon = "💥", Description = "Attacks ignore 70% of Construct Armor & Shield", ParentNodeId = "cons_root", StatKey = "ConsIgnoreArmor", StatValue = 70 },
            new() { Id = "cons_b2", FamilyId = "Construct", Branch = "combat", Name = "Titan Breaker", Icon = "⚡", Description = "Stun duration on Constructs is increased by +100%", ParentNodeId = "cons_b1", StatKey = "ConsStunDuration", StatValue = 100 },
            new() { Id = "cons_b_keystone", FamilyId = "Construct", Branch = "combat", Name = "★ Core Overload", Icon = "🌋", Description = "Crits on Constructs detonate power core for massive AoE", ParentNodeId = "cons_b2", IsKeystone = true, StatKey = "ConsCoreDetonate", StatValue = 1 },

            new() { Id = "cons_c1", FamilyId = "Construct", Branch = "survival", Name = "Reinforced Plating", Icon = "🛡️", Description = "-20% Physical Damage taken from Constructs", ParentNodeId = "cons_root", StatKey = "ConsMitigation", StatValue = 20 },
            new() { Id = "cons_c2", FamilyId = "Construct", Branch = "survival", Name = "Titan Bastion", Icon = "🏰", Description = "Gain +250 Flat Armor & 100% Knockback Immunity", ParentNodeId = "cons_c1", StatKey = "ConsFlatArmor", StatValue = 250 },
            new() { Id = "cons_c_keystone", FamilyId = "Construct", Branch = "survival", Name = "★ Iron Will", Icon = "🗿", Description = "Immune to Stun and Crushing Tremors from Golems", ParentNodeId = "cons_c1", IsKeystone = true, StatKey = "ImmuneStunTremor", StatValue = 1 }
        };

        return (families, nodes);
    }

    public static List<QuestTemplateEntity> BuildDefaultQuestTemplates()
    {
        return new List<QuestTemplateEntity>
        {
            // === ACT I: Sylvan Frontier ===
            new()
            {
                Id = "q1_1", ActNumber = 1, RequiredLevel = 1,
                Title = "Awakening in Haven",
                Description = "Consult High Elder Aethel and forge your first weapon with Doran the Blacksmith.",
                TargetZoneId = "SanctuaryHaven", TargetNpcId = "Elder Aethel",
                ObjectivesJson = JsonSerializer.Serialize(new[] { "Speak to Elder Aethel", "Inspect Doran's Genesis Forge" }),
                RewardsJson = JsonSerializer.Serialize(new { exp = 100, gold = 50, itemTemplateId = "ring_sapphire_t1", skillPoints = 1 })
            },
            new()
            {
                Id = "q1_2", ActNumber = 1, RequiredLevel = 5,
                Title = "Securing the Plains",
                Description = "Hunt down goblin scouts and alpha direwolves lurking in the Whispering Plains.",
                TargetZoneId = "WhisperingPlains", TargetNpcId = "Doran (Blacksmith)",
                ObjectivesJson = JsonSerializer.Serialize(new[] { "Slay 8 Goblin Scouts", "Slay 4 Direwolves" }),
                RewardsJson = JsonSerializer.Serialize(new { exp = 350, gold = 150, itemTemplateId = "boots_plate_t1", devotionPoints = 1 })
            },
            new()
            {
                Id = "q1_3", ActNumber = 1, RequiredLevel = 9,
                Title = "The Deep Forest",
                Description = "Cleanse the venom brood and ancient treants lurking within Verdant Canopy.",
                TargetZoneId = "VerdantCanopy", TargetNpcId = "Elder Aethel",
                ObjectivesJson = JsonSerializer.Serialize(new[] { "Cleanse Verdant Canopy Brood", "Retrieve Primal Resin" }),
                RewardsJson = JsonSerializer.Serialize(new { exp = 600, gold = 300, itemTemplateId = "gem_support_echo", skillPoints = 1 })
            },
            new()
            {
                Id = "q1_4", ActNumber = 1, RequiredLevel = 12,
                Title = "Malakor's Demise",
                Description = "Descend into the Forgotten Crypt ceremonial vault and vanquish Malakor the Shadow Fiend.",
                TargetZoneId = "ForgottenCrypt", TargetNpcId = "Elder Aethel",
                ObjectivesJson = JsonSerializer.Serialize(new[] { "Enter Forgotten Crypt", "Defeat Malakor the Shadow Fiend" }),
                RewardsJson = JsonSerializer.Serialize(new { exp = 1200, gold = 800, itemTemplateId = "sword_fire_t2", ascendanceUnlocked = true, devotionPoints = 2 })
            },

            // === ACT II: Frozen Spires ===
            new()
            {
                Id = "q2_1", ActNumber = 2, RequiredLevel = 15,
                Title = "Glacial Frontier",
                Description = "Establish contact with the Glacial Outpost garrison and reinforce thermal ward runes.",
                TargetZoneId = "GlacialOutpost", TargetNpcId = "Commander Keith",
                ObjectivesJson = JsonSerializer.Serialize(new[] { "Reach Glacial Outpost", "Activate Thermal Runes" }),
                RewardsJson = JsonSerializer.Serialize(new { exp = 1500, gold = 600, skillPoints = 1 })
            },
            new()
            {
                Id = "q2_2", ActNumber = 2, RequiredLevel = 18,
                Title = "Frostpeak Passage",
                Description = "Brave the biting blizzards of Frostpeak Tundra and exterminate frost wyrm hatchlings.",
                TargetZoneId = "FrostpeakTundra", TargetNpcId = "Commander Keith",
                ObjectivesJson = JsonSerializer.Serialize(new[] { "Clear Frostpeak Tundra beasts" }),
                RewardsJson = JsonSerializer.Serialize(new { exp = 2400, gold = 1000, itemTemplateId = "armor_plate_t2" })
            },
            new()
            {
                Id = "q2_3", ActNumber = 2, RequiredLevel = 22,
                Title = "Caverns of Echoing Ice",
                Description = "Venture deep into the Howling Ice Caverns and claim the Glacial Core fragment.",
                TargetZoneId = "HowlingIceCaverns", TargetNpcId = "Elder Aethel",
                ObjectivesJson = JsonSerializer.Serialize(new[] { "Retrieve Glacial Core" }),
                RewardsJson = JsonSerializer.Serialize(new { exp = 3800, gold = 1500, devotionPoints = 1 })
            },
            new()
            {
                Id = "q2_4", ActNumber = 2, RequiredLevel = 26,
                Title = "Sovereign of Winter",
                Description = "Ascend the Summit of the Frozen Sovereign and defeat Cryomancer Vael.",
                TargetZoneId = "GlacialSummit", TargetNpcId = "Elder Aethel",
                ObjectivesJson = JsonSerializer.Serialize(new[] { "Vanquish Cryomancer Vael" }),
                RewardsJson = JsonSerializer.Serialize(new { exp = 6500, gold = 3000, itemTemplateId = "sword_crystal_t3", skillPoints = 2, devotionPoints = 2 })
            },

            // === ACT III: Volcanic Caldera ===
            new()
            {
                Id = "q3_1", ActNumber = 3, RequiredLevel = 30,
                Title = "Ashen Bastion",
                Description = "Cross the Obsidian Caldera and establish a defensive perimeter at Emberforge Garrison.",
                TargetZoneId = "EmberforgeGarrison", TargetNpcId = "Doran (Blacksmith)",
                ObjectivesJson = JsonSerializer.Serialize(new[] { "Reach Emberforge Garrison" }),
                RewardsJson = JsonSerializer.Serialize(new { exp = 8000, gold = 2500, skillPoints = 1 })
            },
            new()
            {
                Id = "q3_2", ActNumber = 3, RequiredLevel = 35,
                Title = "Infernal Behemoth",
                Description = "Descend into the Core of Cinders and slay Ignis the Infernal Behemoth.",
                TargetZoneId = "CoreOfCinders", TargetNpcId = "Doran (Blacksmith)",
                ObjectivesJson = JsonSerializer.Serialize(new[] { "Defeat Ignis the Infernal Behemoth" }),
                RewardsJson = JsonSerializer.Serialize(new { exp = 15000, gold = 6000, itemTemplateId = "axe_dragon_t3", devotionPoints = 2 })
            },

            // === ACT IV: Sunken Citadel ===
            new()
            {
                Id = "q4_1", ActNumber = 4, RequiredLevel = 45,
                Title = "Abyssal Tide",
                Description = "Investigate the abyssal corruption spreading from the Sunken Citadel.",
                TargetZoneId = "TidecallerSanctum", TargetNpcId = "Lyra (Astromancer)",
                ObjectivesJson = JsonSerializer.Serialize(new[] { "Defeat Tidecaller Leviathan" }),
                RewardsJson = JsonSerializer.Serialize(new { exp = 28000, gold = 12000, devotionPoints = 2, skillPoints = 2 })
            },

            // === ACT V: Celestial Fracture ===
            new()
            {
                Id = "q5_1", ActNumber = 5, RequiredLevel = 60,
                Title = "The Void Sovereign",
                Description = "Step through the Gate of Eternity and purge the Celestial Void Sovereign to restore balance to Aethelis.",
                TargetZoneId = "CelestialPinnacle", TargetNpcId = "Elder Aethel",
                ObjectivesJson = JsonSerializer.Serialize(new[] { "Conquer Pinnacle Void Sovereign" }),
                RewardsJson = JsonSerializer.Serialize(new { exp = 60000, gold = 30000, devotionPoints = 3, skillPoints = 3 })
            }
        };
    }

    public static List<NpcDialogueTemplateEntity> BuildDefaultNpcDialogues()
    {
        return new List<NpcDialogueTemplateEntity>
        {
            new()
            {
                Id = "npc_elder_aethel",
                NpcName = "Elder Aethel",
                Title = "High Elder Sage",
                ZoneId = "SanctuaryHaven",
                AvatarIcon = "🧙‍♂️",
                Color = "#61afef",
                Greeting = "Welcome back to Sanctuary Haven, Chosen One. The Void surges relentlessly from the depths of Aethelis...",
                OptionsJson = JsonSerializer.Serialize(new[]
                {
                    new { label = "📜 Lore of Aethelis", actionType = "lore", response = "Eras ago, our continent was guarded by ancient constellations. When the barrier fractured, darkness spilled across the realm. Reclaim Genesis Orbs to rekindle the Eternal Shrine." },
                    new { label = "💊 Blessed Blessing: Restore Full Vitality", actionType = "heal", response = "May the primal light cleanse your wounds and restore your spirit!" },
                    new { label = "✨ Open Celestial Devotion Grid", actionType = "open_devotion", response = "" },
                    new { label = "💎 Where can I find Skill Gems?", actionType = "lore", response = "Skill & Support Gems are crystallized shards of the Eternal Core. Farm them from wild biomes and Dungeon Bosses!" }
                })
            },
            new()
            {
                Id = "npc_doran",
                NpcName = "Doran (Blacksmith)",
                Title = "Master Craftsman & Smith",
                ZoneId = "SanctuaryHaven",
                AvatarIcon = "🔨",
                Color = "#e5c07b",
                Greeting = "My forge burns day and night! Have you brought Genesis Orbs to reforge your weapons and armor?",
                OptionsJson = JsonSerializer.Serialize(new[]
                {
                    new { label = "🔨 Open Genesis Crafting Forge", actionType = "open_forge", response = "" },
                    new { label = "🎁 Claim Sacred Vanguard Set (Demo)", actionType = "give_vanguard_set", response = "Wear all 4 pieces to unlock Sacred Bastion and Holy Blade Waves!" },
                    new { label = "❓ Socket Reforging & Metamods Guide", actionType = "lore", response = "Use Socketing Cores to re-roll sockets, Harmonic Tethers for link chains, and Fracture Cores to lock metamods!" }
                })
            },
            new()
            {
                Id = "npc_kaelen",
                NpcName = "Kaelen (Vault Keeper)",
                Title = "Keeper of the Vault",
                ZoneId = "SanctuaryHaven",
                AvatarIcon = "📦",
                Color = "#98c379",
                Greeting = "This vault is bound by ancient celestial seals, linking the soul inventory across all your heroes in Aethelis.",
                OptionsJson = JsonSerializer.Serialize(new[]
                {
                    new { label = "📦 Open Account Shared Stash", actionType = "open_stash", response = "" },
                    new { label = "🔮 Currency Vault Storage Advice", actionType = "lore", response = "In the Currency Vault tab, all 8 Genesis Orbs stack without limit across your entire account!" }
                })
            },
            new()
            {
                Id = "npc_lyra",
                NpcName = "Lyra (Astromancer)",
                Title = "Astromancer of the Void",
                ZoneId = "SanctuaryHaven",
                AvatarIcon = "🌌",
                Color = "#c678dd",
                Greeting = "The constellations align... The Gate of Eternity is ready to receive Map Keystones to open dimensional rifts to Pinnacle Bosses.",
                OptionsJson = JsonSerializer.Serialize(new[]
                {
                    new { label = "🌌 Open Gate of Eternity Map Device", actionType = "open_map_device", response = "" },
                    new { label = "🗺️ Pinnacle Rift Mechanics Guide", actionType = "lore", response = "Insert Tier 1-16 Map Keystones, augment with affixes for IIQ/IIR bonuses, and combine with Celestial Fragments!" }
                })
            }
        };
    }

    public static (List<DevotionConstellationEntity> Constellations, List<DevotionNodeEntity> Nodes) BuildDefaultDevotionSystem()
    {
        var constellations = new List<DevotionConstellationEntity>
        {
            new()
            {
                Id = "phoenix", Name = "The Phoenix", Affiliation = "Chaos", Tier = "Tier 1", TotalStars = 4,
                AffinityGrantedJson = JsonSerializer.Serialize(new { Chaos = 3 }),
                AffinityRequiredJson = JsonSerializer.Serialize(new { Chaos = 1 }),
                Description = "Ancient firebird embodying eternal rebirth, blazing critical strikes, and hellfire pillars."
            },
            new()
            {
                Id = "frost_warden", Name = "The Frost Warden", Affiliation = "Eldritch", Tier = "Tier 1", TotalStars = 4,
                AffinityGrantedJson = JsonSerializer.Serialize(new { Eldritch = 3 }),
                AffinityRequiredJson = JsonSerializer.Serialize(new { Eldritch = 1 }),
                Description = "Glacial guardian providing impenetrable energy shield bastions and freezing blasts."
            },
            new()
            {
                Id = "storm_herald", Name = "The Storm Herald", Affiliation = "Ascendant", Tier = "Tier 2", TotalStars = 4,
                AffinityGrantedJson = JsonSerializer.Serialize(new { Ascendant = 4 }),
                AffinityRequiredJson = JsonSerializer.Serialize(new { Ascendant = 2 }),
                Description = "Tempestuous thunder lord amplifying lightning penetration and chain shock procs."
            },
            new()
            {
                Id = "void_leviathan", Name = "The Void Leviathan", Affiliation = "Primordial", Tier = "Tier 3", TotalStars = 4,
                AffinityGrantedJson = JsonSerializer.Serialize(new { Primordial = 5 }),
                AffinityRequiredJson = JsonSerializer.Serialize(new { Primordial = 4 }),
                Description = "Abyssal behemoth commanding singularity black holes and cosmic disintegration."
            }
        };

        var nodes = new List<DevotionNodeEntity>
        {
            // Core Origin Nexus
            new() { Id = "nexus_root", ConstellationId = "", Name = "Genesis Nexus", Lore = "The primordial origin where all celestial leylines converge.", Description = "+10 to All Attributes (Core Origin)", StatKey = "allStats", StatValue = 10, X = 50, Y = 50, Color = "#00f2fe", Icon = "✨", IsRoot = true },

            // Constellation 1: The Phoenix (Fire / Crit)
            new() { Id = "ph_1", ConstellationId = "phoenix", Name = "Ember Heart", Description = "+15% Fire Damage", StatKey = "fireDmg", StatValue = 15, X = 63, Y = 38, ParentNodeId = "nexus_root", Color = "#ff7700", Icon = "🔥" },
            new() { Id = "ph_2", ConstellationId = "phoenix", Name = "Ash Walker", Description = "+15% Fire Resistance", StatKey = "fireRes", StatValue = 15, X = 74, Y = 28, ParentNodeId = "ph_1", Color = "#ff7700", Icon = "🛡️" },
            new() { Id = "ph_3", ConstellationId = "phoenix", Name = "Ignited Fury", Description = "+20% Critical Strike Multiplier", StatKey = "critMulti", StatValue = 20, X = 84, Y = 20, ParentNodeId = "ph_2", Color = "#ff7700", Icon = "⚡" },
            new() { Id = "ph_proc", ConstellationId = "phoenix", Name = "★ Phoenix Firestorm", Description = "Proc on Crit: Calls down a blazing celestial flame pillar", StatKey = "proc", StatValue = 1, StringValue = "proc_phoenix_firestorm", X = 92, Y = 12, ParentNodeId = "ph_3", Color = "#ff4400", Icon = "🦅", IsProc = true },

            // Constellation 2: The Frost Warden (Cold / Energy Shield)
            new() { Id = "fw_1", ConstellationId = "frost_warden", Name = "Frozen Veins", Description = "+60 Maximum Energy Shield", StatKey = "es", StatValue = 60, X = 37, Y = 38, ParentNodeId = "nexus_root", Color = "#00f2fe", Icon = "❄️" },
            new() { Id = "fw_2", ConstellationId = "frost_warden", Name = "Glacial Plating", Description = "+100 Armor Mitigation", StatKey = "armor", StatValue = 100, X = 26, Y = 28, ParentNodeId = "fw_1", Color = "#00f2fe", Icon = "🛡️" },
            new() { Id = "fw_3", ConstellationId = "frost_warden", Name = "Absolute Zero", Description = "+15% Cold Damage & +10% Freeze Duration", StatKey = "coldDmg", StatValue = 15, X = 16, Y = 20, ParentNodeId = "fw_2", Color = "#00f2fe", Icon = "🧊" },
            new() { Id = "fw_proc", ConstellationId = "frost_warden", Name = "★ Glacial Barrier", Description = "Proc on Hit Taken: Triggers a 250 HP Frost Barrier and freezes nearby enemies", StatKey = "proc", StatValue = 1, StringValue = "proc_glacial_barrier", X = 8, Y = 12, ParentNodeId = "fw_3", Color = "#00b4d8", Icon = "🏰", IsProc = true },

            // Constellation 3: The Storm Herald (Lightning / Speed)
            new() { Id = "sh_1", ConstellationId = "storm_herald", Name = "Spark Conduit", Description = "+15% Lightning Damage", StatKey = "lightDmg", StatValue = 15, X = 63, Y = 62, ParentNodeId = "nexus_root", Color = "#ffd700", Icon = "⚡" },
            new() { Id = "sh_2", ConstellationId = "storm_herald", Name = "Static Velocity", Description = "+10% Movement Speed & +8% Cast Speed", StatKey = "moveSpeed", StatValue = 10, X = 74, Y = 72, ParentNodeId = "sh_1", Color = "#ffd700", Icon = "💨" },
            new() { Id = "sh_3", ConstellationId = "storm_herald", Name = "Thunder Penetration", Description = "+15% Lightning Penetration", StatKey = "lightPen", StatValue = 15, X = 84, Y = 80, ParentNodeId = "sh_2", Color = "#ffd700", Icon = "🌩️" },
            new() { Id = "sh_proc", ConstellationId = "storm_herald", Name = "★ Chain Lightning Surge", Description = "Proc on Spell Cast: Releases 3 leaping lightning bolts across enemies", StatKey = "proc", StatValue = 1, StringValue = "proc_chain_lightning", X = 92, Y = 88, ParentNodeId = "sh_3", Color = "#ffb703", Icon = "⚡", IsProc = true },

            // Constellation 4: The Void Leviathan (Chaos / Maximum Life)
            new() { Id = "vl_1", ConstellationId = "void_leviathan", Name = "Abyssal Siphon", Description = "+80 Maximum Life", StatKey = "life", StatValue = 80, X = 37, Y = 62, ParentNodeId = "nexus_root", Color = "#c678dd", Icon = "💜" },
            new() { Id = "vl_2", ConstellationId = "void_leviathan", Name = "Warp Resilience", Description = "+20% Chaos Resistance & +5% Max Chaos Res", StatKey = "chaosRes", StatValue = 20, X = 26, Y = 72, ParentNodeId = "vl_1", Color = "#c678dd", Icon = "🛡️" },
            new() { Id = "vl_3", ConstellationId = "void_leviathan", Name = "Cosmic Decay", Description = "+25% Chaos Damage & +10% Damage Over Time", StatKey = "chaosDmg", StatValue = 25, X = 16, Y = 80, ParentNodeId = "vl_2", Color = "#c678dd", Icon = "🌌" },
            new() { Id = "vl_proc", ConstellationId = "void_leviathan", Name = "★ Singularity Vortex", Description = "Proc on Kill: Spawns a gravitational vortex pulling enemies and dealing Chaos DoT", StatKey = "proc", StatValue = 1, StringValue = "proc_singularity_vortex", X = 8, Y = 88, ParentNodeId = "vl_3", Color = "#9d4edd", Icon = "🕳️", IsProc = true }
        };

        return (constellations, nodes);
    }
}

