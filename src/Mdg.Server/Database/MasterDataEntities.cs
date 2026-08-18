using System;

namespace Mdg.Server.Database;

public class ItemTemplateEntity
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string BaseType { get; set; } = string.Empty;
    public string Category { get; set; } = "equipment"; // equipment, unique, set, gem, currency, consumable
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
    public string Id { get; set; } = string.Empty; // slash, fireball, frost, meteor, dash
    public string Name { get; set; } = string.Empty;
    public string SkillKey { get; set; } = string.Empty;
    public string BaseType { get; set; } = "Melee Attack";
    public int MaxLevel { get; set; } = 20;
    public int BaseDamage { get; set; } = 25;
    public float BaseCooldown { get; set; } = 0.5f;
    public int ManaCost { get; set; } = 0;
    public string Icon { get; set; } = "⚔️";
    public string Description { get; set; } = string.Empty;
    public string MasteryTreeJson { get; set; } = "{}";
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class ZoneTemplateEntity
{
    public string Id { get; set; } = string.Empty; // SanctuaryHaven, WhisperingPlains, etc.
    public string Name { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string BiomeType { get; set; } = "Town"; // Town, Forest, Dungeon, Volcanic, Tundra, Void
    public int RecommendedLevel { get; set; } = 1;
    public int ActNumber { get; set; } = 1;
    public string BossName { get; set; } = string.Empty;
    public string AmbientColor { get; set; } = "#141821";
    public string MonsterTypesJson { get; set; } = "[]";
    public string HazardsJson { get; set; } = "[]";
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class CampaignActEntity
{
    public int ActNumber { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string LevelRange { get; set; } = "Lv. 1 - 15";
    public string Boss { get; set; } = string.Empty;
    public string CoverArt { get; set; } = string.Empty;
    public string ZonesJson { get; set; } = "[]";
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}
