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
    public int Level { get; set; } = 1;
    public int CurrentExp { get; set; } = 0;
    public int ExpToNext { get; set; } = 100;
    public int SkillPoints { get; set; } = 3;
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

public class MdgDbContext : DbContext
{
    public DbSet<UserAccountEntity> UserAccounts => Set<UserAccountEntity>();
    public DbSet<CharacterEntity> Characters => Set<CharacterEntity>();
    public DbSet<SharedStashItemEntity> SharedStash => Set<SharedStashItemEntity>();
    public DbSet<ItemTemplateEntity> ItemTemplates => Set<ItemTemplateEntity>();
    public DbSet<SkillTemplateEntity> SkillTemplates => Set<SkillTemplateEntity>();
    public DbSet<ZoneTemplateEntity> ZoneTemplates => Set<ZoneTemplateEntity>();
    public DbSet<CampaignActEntity> CampaignActs => Set<CampaignActEntity>();

    public MdgDbContext(DbContextOptions<MdgDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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
                    v => JsonSerializer.Deserialize<Dictionary<string, object>>(v, (JsonSerializerOptions?)null) ?? new()
                );

            b.Property(c => c.EquippedGear)
                .HasColumnName("EquippedJson")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<Dictionary<string, object>>(v, (JsonSerializerOptions?)null) ?? new()
                );

            b.Property(c => c.BackpackItems)
                .HasColumnName("BackpackJson")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<object>>(v, (JsonSerializerOptions?)null) ?? new()
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
    }
}


