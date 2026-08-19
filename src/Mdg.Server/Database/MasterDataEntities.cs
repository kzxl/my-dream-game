using System;
using System.Collections.Generic;

namespace Mdg.Server.Database;

public class MonsterTemplateEntity
{
    public string Id { get; set; } = string.Empty; // e.g. goblin_scout, direwolf, malakor
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = "👾";
    public string Family { get; set; } = "Beast"; // Beast, Undead, Fiend, Elemental, Construct
    public int Act { get; set; } = 1;
    public string Biome { get; set; } = "Plains";
    public bool IsBoss { get; set; } = false;
    public int BaseHp { get; set; } = 200;
    public int BaseDmg { get; set; } = 30;
    public float Speed { get; set; } = 3.5f;
    public string Element { get; set; } = "Physical";
    public string PrimaryWeakness { get; set; } = "Fire";
    public string Skills { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SignatureItemId { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class UnifiedModifierTemplateEntity
{
    public string Id { get; set; } = string.Empty; // e.g. aff_fire_res_t1, mon_hellfire_aura
    public string TargetCategory { get; set; } = "Equipment"; // Equipment, Monster, Map, Mastery
    public string ModType { get; set; } = "Prefix"; // Prefix, Suffix, MonsterAffix, MonsterAura, Keystone, Talent
    public string StatKey { get; set; } = string.Empty; // FireRes, Armor, MaxLife, FlatPhys, ExtraChaos, etc.
    public float ValueMin { get; set; } = 0;
    public float ValueMax { get; set; } = 0;
    public int Tier { get; set; } = 1;
    public int Weight { get; set; } = 1000;
    public string DescriptionTemplate { get; set; } = string.Empty; // "+{0}% to Fire Resistance"
    public string TagsJson { get; set; } = "[]";
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class DropTableEntryEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string SourceType { get; set; } = "Monster"; // Monster, Zone, Family, Global
    public string SourceKey { get; set; } = string.Empty; // e.g. direwolf, ForgottenCrypt, Beast
    public string ItemTemplateId { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public string ItemRarity { get; set; } = "Normal";
    public string ItemSlot { get; set; } = "None";
    public float DropChancePercent { get; set; } = 10.0f;
    public int MinQuantity { get; set; } = 1;
    public int MaxQuantity { get; set; } = 1;
    public int RequiredMasteryRank { get; set; } = 0; // 0 to 4
    public bool IsSignature { get; set; } = false;
    public int MinIlvl { get; set; } = 1;
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class FamilyMasteryTemplateEntity
{
    public string Id { get; set; } = string.Empty; // Beast, Undead, Fiend, Elemental, Construct
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = "🐾";
    public string Color { get; set; } = "#ffd700";
    public string Description { get; set; } = string.Empty;
    public string RootNodeId { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class FamilyTalentNodeEntity
{
    public string Id { get; set; } = string.Empty; // e.g. beast_root, beast_a1, beast_b_keystone
    public string FamilyId { get; set; } = "Beast";
    public string Branch { get; set; } = "harvest"; // root, harvest, combat, survival
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = "🎯";
    public string Description { get; set; } = string.Empty;
    public string ParentNodeId { get; set; } = string.Empty;
    public bool IsKeystone { get; set; } = false;
    public string StatKey { get; set; } = string.Empty;
    public float StatValue { get; set; } = 0;
    public int Tier { get; set; } = 1;
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class ItemTemplateEntity
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string BaseType { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Rarity { get; set; } = "Normal";
    public string Slot { get; set; } = "None";
    public int RequiredLevel { get; set; } = 1;
    public int MinIlvl { get; set; } = 1;
    public string Icon { get; set; } = "📦";
    public string Color { get; set; } = "#ffffff";
    public string Description { get; set; } = string.Empty;
    public string Lore { get; set; } = string.Empty;
    public string StatsJson { get; set; } = "{}";
    public string ModsJson { get; set; } = "[]";
    public string SetBonusJson { get; set; } = "{}";
    public string TagsJson { get; set; } = "[]";
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class SkillTemplateEntity
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string SkillKey { get; set; } = string.Empty;
    public string BaseType { get; set; } = string.Empty;
    public int MaxLevel { get; set; } = 20;
    public int BaseDamage { get; set; } = 50;
    public float BaseCooldown { get; set; } = 1.0f;
    public int ManaCost { get; set; } = 10;
    public string Icon { get; set; } = "⚡";
    public string Description { get; set; } = string.Empty;
    public string MasteryTreeJson { get; set; } = "{}";
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class ZoneTemplateEntity
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string BiomeType { get; set; } = string.Empty;
    public int RecommendedLevel { get; set; } = 1;
    public int ActNumber { get; set; } = 1;
    public string BossName { get; set; } = string.Empty;
    public string AmbientColor { get; set; } = "#ffffff";
    public string MonsterTypesJson { get; set; } = "[]";
    public string HazardsJson { get; set; } = "[]";
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class CampaignActEntity
{
    public int ActNumber { get; set; } = 1;
    public string Name { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string LevelRange { get; set; } = string.Empty;
    public string Boss { get; set; } = string.Empty;
    public string CoverArt { get; set; } = string.Empty;
    public string ZonesJson { get; set; } = "[]";
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

