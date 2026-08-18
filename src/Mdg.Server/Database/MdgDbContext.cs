using System;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace Mdg.Server.Database;

public class CharacterEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
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
    public int SlotIndex { get; set; }
    public string ItemJson { get; set; } = "{}";
    public string UpdatedAt { get; set; } = DateTime.UtcNow.ToString("o");
}

public class MdgDbContext : DbContext
{
    public DbSet<CharacterEntity> Characters => Set<CharacterEntity>();
    public DbSet<SharedStashItemEntity> SharedStash => Set<SharedStashItemEntity>();

    public MdgDbContext(DbContextOptions<MdgDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<CharacterEntity>(b =>
        {
            b.ToTable("Characters");
            b.HasKey(c => c.Id);

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
            b.HasKey(s => s.SlotIndex);
        });
    }
}
