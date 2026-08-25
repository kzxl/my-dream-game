using System;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace Mdg.Server.Database;

public class UserAccountEntity
{
    public string Id { get; set; } = string.Empty; // Google Sub ID or Dev ID
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string PictureUrl { get; set; } = string.Empty;
    public string LastLoginAt { get; set; } = DateTime.UtcNow.ToString("o");
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class CharacterEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string AccountId { get; set; } = "guest"; // Bound Google Account ID
    public string Name { get; set; } = "Novice Adventurer";
    public string Gender { get; set; } = "Male";
    public string ClassSpec { get; set; } = "Novice";
    public string Ascendance { get; set; } = "";
    public int Level { get; set; } = 1;
    public int CurrentExp { get; set; } = 0;
    public int ExpToNext { get; set; } = 100;
    public int SkillPoints { get; set; } = 3;
    public int DevotionPoints { get; set; } = 8;
    public double Life { get; set; } = 250;
    public double MaxLife { get; set; } = 250;
    public double Mana { get; set; } = 120;
    public double MaxMana { get; set; } = 120;
    public double Es { get; set; } = 100;
    public double MaxEs { get; set; } = 100;
    public string ZoneId { get; set; } = "SanctuaryHaven";
    public double PositionX { get; set; } = 2000;
    public double PositionY { get; set; } = 2000;

    public Dictionary<string, object> Skills { get; set; } = new();
    public Dictionary<string, object> EquippedGear { get; set; } = new();
    public List<object> BackpackItems { get; set; } = new();
    public Dictionary<string, int> MonsterKills { get; set; } = new();
    public Dictionary<string, List<string>> FamilyTalents { get; set; } = new();
    public Dictionary<string, int> FamilyPoints { get; set; } = new();
    public List<string> AllocatedDevotionNodes { get; set; } = new();
    public List<string> CompletedQuests { get; set; } = new();
    public Dictionary<string, object> ActiveQuests { get; set; } = new();
    public List<string> UnlockedWaypoints { get; set; } = new();
    public Dictionary<string, int> Currencies { get; set; } = new();

    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
    public string UpdatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class SharedStashItemEntity
{
    public string Id { get; set; } = "guest_0"; // {AccountId}_{SlotIndex}
    public string AccountId { get; set; } = "guest";
    public int SlotIndex { get; set; }
    public string ItemJson { get; set; } = "{}";
    public string UpdatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class MarketListingEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string SellerAccountId { get; set; } = "guest";
    public string SellerCharacterName { get; set; } = "Unknown";
    public string ItemJson { get; set; } = "{}";
    public string ItemName { get; set; } = "Unknown Item";
    public string ItemRarity { get; set; } = "Normal";
    public string ItemCategory { get; set; } = "General";
    public int ItemLevel { get; set; } = 1;
    public int PriceAmount { get; set; } = 1;
    public string PriceCurrency { get; set; } = "fracture_core";
    public int TaxGold { get; set; } = 0;
    public int Status { get; set; } = 1; // 1: Active, 2: Sold, 3: Cancelled, 4: Expired
    public string? BuyerAccountId { get; set; }
    public string? BuyerCharacterName { get; set; }
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");
    public string ExpireAt { get; set; } = DateTime.UtcNow.AddDays(7).ToString("o");
    public string? SoldAt { get; set; }
}

public class MdgDbContext : DbContext
{
    public DbSet<UserAccountEntity> UserAccounts => Set<UserAccountEntity>();
    public DbSet<CharacterEntity> Characters => Set<CharacterEntity>();
    public DbSet<SharedStashItemEntity> SharedStash => Set<SharedStashItemEntity>();
    public DbSet<MarketListingEntity> MarketListings => Set<MarketListingEntity>();
    public DbSet<ItemTemplateEntity> ItemTemplates => Set<ItemTemplateEntity>();
    public DbSet<SkillTemplateEntity> SkillTemplates => Set<SkillTemplateEntity>();
    public DbSet<ZoneTemplateEntity> ZoneTemplates => Set<ZoneTemplateEntity>();
    public DbSet<CampaignActEntity> CampaignActs => Set<CampaignActEntity>();
    public DbSet<MonsterTemplateEntity> MonsterTemplates => Set<MonsterTemplateEntity>();
    public DbSet<UnifiedModifierTemplateEntity> UnifiedModifiers => Set<UnifiedModifierTemplateEntity>();
    public DbSet<DropTableEntryEntity> DropTables => Set<DropTableEntryEntity>();
    public DbSet<FamilyMasteryTemplateEntity> FamilyMasteries => Set<FamilyMasteryTemplateEntity>();
    public DbSet<FamilyTalentNodeEntity> FamilyTalentNodes => Set<FamilyTalentNodeEntity>();
    public DbSet<QuestTemplateEntity> QuestTemplates => Set<QuestTemplateEntity>();
    public DbSet<NpcDialogueTemplateEntity> NpcDialogues => Set<NpcDialogueTemplateEntity>();
    public DbSet<DevotionConstellationEntity> DevotionConstellations => Set<DevotionConstellationEntity>();
    public DbSet<DevotionNodeEntity> DevotionNodes => Set<DevotionNodeEntity>();
    public DbSet<ClassStarterKitEntity> ClassStarterKits => Set<ClassStarterKitEntity>();

    public MdgDbContext(DbContextOptions<MdgDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<MarketListingEntity>(b =>
        {
            b.ToTable("MarketListings");
            b.HasKey(m => m.Id);
            b.HasIndex(m => m.SellerAccountId);
            b.HasIndex(m => m.Status);
        });

        modelBuilder.Entity<UserAccountEntity>(b =>
        {
            b.ToTable("UserAccounts");
            b.HasKey(u => u.Id);
        });

        modelBuilder.Entity<CharacterEntity>(b =>
        {
            b.ToTable("Characters");
            b.HasKey(c => c.Id);
            b.HasIndex(c => c.AccountId);

            b.Property(c => c.Skills)
                .HasColumnName("SkillsJson")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => string.IsNullOrEmpty(v) ? new() : (JsonSerializer.Deserialize<Dictionary<string, object>>(v, (JsonSerializerOptions?)null) ?? new())
                );

            b.Property(c => c.EquippedGear)
                .HasColumnName("EquippedJson")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => string.IsNullOrEmpty(v) ? new() : (JsonSerializer.Deserialize<Dictionary<string, object>>(v, (JsonSerializerOptions?)null) ?? new())
                );

            b.Property(c => c.BackpackItems)
                .HasColumnName("BackpackJson")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => string.IsNullOrEmpty(v) ? new() : (JsonSerializer.Deserialize<List<object>>(v, (JsonSerializerOptions?)null) ?? new())
                );

            b.Property(c => c.MonsterKills)
                .HasColumnName("MonsterKillsJson")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => string.IsNullOrEmpty(v) ? new() : (JsonSerializer.Deserialize<Dictionary<string, int>>(v, (JsonSerializerOptions?)null) ?? new())
                );

            b.Property(c => c.FamilyTalents)
                .HasColumnName("FamilyTalentsJson")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => string.IsNullOrEmpty(v) ? new() : (JsonSerializer.Deserialize<Dictionary<string, List<string>>>(v, (JsonSerializerOptions?)null) ?? new())
                );

            b.Property(c => c.FamilyPoints)
                .HasColumnName("FamilyPointsJson")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => string.IsNullOrEmpty(v) ? new() : (JsonSerializer.Deserialize<Dictionary<string, int>>(v, (JsonSerializerOptions?)null) ?? new())
                );

            b.Property(c => c.AllocatedDevotionNodes)
                .HasColumnName("DevotionNodesJson")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => string.IsNullOrEmpty(v) ? new() : (JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new())
                );

            b.Property(c => c.CompletedQuests)
                .HasColumnName("CompletedQuestsJson")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => string.IsNullOrEmpty(v) ? new() : (JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new())
                );

            b.Property(c => c.ActiveQuests)
                .HasColumnName("ActiveQuestsJson")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => string.IsNullOrEmpty(v) ? new() : (JsonSerializer.Deserialize<Dictionary<string, object>>(v, (JsonSerializerOptions?)null) ?? new())
                );

            b.Property(c => c.UnlockedWaypoints)
                .HasColumnName("WaypointsJson")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => string.IsNullOrEmpty(v) ? new() : (JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new())
                );

            b.Property(c => c.Currencies)
                .HasColumnName("CurrenciesJson")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => string.IsNullOrEmpty(v) ? new() : (JsonSerializer.Deserialize<Dictionary<string, int>>(v, (JsonSerializerOptions?)null) ?? new())
                );
        });

        modelBuilder.Entity<SharedStashItemEntity>(b =>
        {
            b.ToTable("SharedStash");
            b.HasKey(s => s.Id);
            b.HasIndex(s => s.AccountId);
        });

        modelBuilder.Entity<ItemTemplateEntity>(b =>
        {
            b.ToTable("ItemTemplates");
            b.HasKey(i => i.Id);
            b.HasIndex(i => i.Category);
            b.HasIndex(i => i.Rarity);
        });

        modelBuilder.Entity<SkillTemplateEntity>(b =>
        {
            b.ToTable("SkillTemplates");
            b.HasKey(s => s.Id);
        });

        modelBuilder.Entity<ZoneTemplateEntity>(b =>
        {
            b.ToTable("ZoneTemplates");
            b.HasKey(z => z.Id);
            b.HasIndex(z => z.ActNumber);
        });

        modelBuilder.Entity<CampaignActEntity>(b =>
        {
            b.ToTable("CampaignActs");
            b.HasKey(a => a.ActNumber);
        });

        modelBuilder.Entity<MonsterTemplateEntity>(b =>
        {
            b.ToTable("MonsterTemplates");
            b.HasKey(m => m.Id);
            b.HasIndex(m => m.Family);
            b.HasIndex(m => m.Act);
            b.HasIndex(m => m.IsBoss);
        });

        modelBuilder.Entity<UnifiedModifierTemplateEntity>(b =>
        {
            b.ToTable("UnifiedModifierTemplates");
            b.HasKey(m => m.Id);
            b.HasIndex(m => m.TargetCategory);
            b.HasIndex(m => m.ModType);
            b.HasIndex(m => m.StatKey);
        });

        modelBuilder.Entity<DropTableEntryEntity>(b =>
        {
            b.ToTable("DropTableEntries");
            b.HasKey(d => d.Id);
            b.HasIndex(d => d.SourceKey);
            b.HasIndex(d => d.SourceType);
            b.HasIndex(d => d.RequiredMasteryRank);
            b.HasIndex(d => d.IsSignature);
        });

        modelBuilder.Entity<FamilyMasteryTemplateEntity>(b =>
        {
            b.ToTable("FamilyMasteryTemplates");
            b.HasKey(f => f.Id);
        });

        modelBuilder.Entity<FamilyTalentNodeEntity>(b =>
        {
            b.ToTable("FamilyTalentNodes");
            b.HasKey(t => t.Id);
            b.HasIndex(t => t.FamilyId);
            b.HasIndex(t => t.Branch);
        });

        modelBuilder.Entity<QuestTemplateEntity>(b =>
        {
            b.ToTable("QuestTemplates");
            b.HasKey(q => q.Id);
            b.HasIndex(q => q.ActNumber);
        });

        modelBuilder.Entity<NpcDialogueTemplateEntity>(b =>
        {
            b.ToTable("NpcDialogues");
            b.HasKey(n => n.Id);
            b.HasIndex(n => n.ZoneId);
        });

        modelBuilder.Entity<DevotionConstellationEntity>(b =>
        {
            b.ToTable("DevotionConstellations");
            b.HasKey(d => d.Id);
        });

        modelBuilder.Entity<DevotionNodeEntity>(b =>
        {
            b.ToTable("DevotionNodes");
            b.HasKey(n => n.Id);
            b.HasIndex(n => n.ConstellationId);
        });

        modelBuilder.Entity<ClassStarterKitEntity>(b =>
        {
            b.ToTable("ClassStarterKits");
            b.HasKey(k => k.Id);
            b.HasIndex(k => k.ClassSpec);
        });
    }
}



