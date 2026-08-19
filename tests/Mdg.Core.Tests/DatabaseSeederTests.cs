using System;
using System.IO;
using System.Threading.Tasks;
using Mdg.Server.Database;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Mdg.Core.Tests;

public sealed class DatabaseSeederTests : IDisposable
{
    private readonly string _testDbPath;
    private readonly IDbContextFactory<MdgDbContext> _dbFactory;

    public DatabaseSeederTests()
    {
        _testDbPath = Path.Combine(Path.GetTempPath(), $"mdg_test_seed_{Guid.NewGuid():N}.db");
        var options = new DbContextOptionsBuilder<MdgDbContext>()
            .UseSqlite($"Data Source={_testDbPath}")
            .Options;

        _dbFactory = new TestDbContextFactory(options);
    }

    [Fact]
    public async Task DatabaseSeeder_SeedsAllMasterData_Successfully()
    {
        // 1. Run Seeder
        await DatabaseSeeder.SeedAllAsync(_dbFactory);

        await using var db = await _dbFactory.CreateDbContextAsync();

        // 2. Verify Item Templates
        var items = await db.ItemTemplates.ToListAsync();
        Assert.True(items.Count >= 10);
        Assert.Contains(items, i => i.Id == "scroll_resurrection" && i.Category == "consumable");
        Assert.Contains(items, i => i.Rarity == "Set");
        Assert.Contains(items, i => i.Rarity == "Unique");
        Assert.Contains(items, i => i.Rarity == "Currency");

        // 3. Verify Skill Templates & Mastery Trees
        var skills = await db.SkillTemplates.ToListAsync();
        Assert.Equal(5, skills.Count);
        Assert.Contains(skills, s => s.SkillKey == "slash");
        Assert.Contains(skills, s => s.SkillKey == "fireball");
        Assert.Contains(skills, s => s.SkillKey == "frost");
        Assert.Contains(skills, s => s.SkillKey == "meteor");
        Assert.Contains(skills, s => s.SkillKey == "dash");

        // 4. Verify Zone Templates (All 5 Acts & 5 Towns)
        var zones = await db.ZoneTemplates.ToListAsync();
        Assert.True(zones.Count >= 15);
        Assert.Contains(zones, z => z.Id == "SanctuaryHaven" && z.BiomeType == "Town" && z.ActNumber == 1);
        Assert.Contains(zones, z => z.Id == "GlacialOutpost" && z.BiomeType == "Town" && z.ActNumber == 2);
        Assert.Contains(zones, z => z.Id == "AshenRedoubt" && z.BiomeType == "Town" && z.ActNumber == 3);
        Assert.Contains(zones, z => z.Id == "OasisSanctum" && z.BiomeType == "Town" && z.ActNumber == 4);
        Assert.Contains(zones, z => z.Id == "AethelisCitadel" && z.BiomeType == "Town" && z.ActNumber == 5);

        // 5. Verify Campaign Acts (5 Acts)
        var acts = await db.CampaignActs.ToListAsync();
        Assert.Equal(5, acts.Count);
        Assert.Contains(acts, a => a.ActNumber == 1 && a.Boss.Contains("Malakor"));
        Assert.Contains(acts, a => a.ActNumber == 2 && a.Boss.Contains("Vael"));
        Assert.Contains(acts, a => a.ActNumber == 3 && a.Boss.Contains("Ignis"));
        Assert.Contains(acts, a => a.ActNumber == 4 && a.Boss.Contains("Morvath"));
        Assert.Contains(acts, a => a.ActNumber == 5 && a.Boss.Contains("Void Sovereign"));

        // 6. Verify Quest Templates
        var quests = await db.QuestTemplates.ToListAsync();
        Assert.True(quests.Count >= 3);
        Assert.Contains(quests, q => q.Id == "q1_1" && q.ActNumber == 1);

        // 7. Verify NPC Dialogues
        var npcs = await db.NpcDialogues.ToListAsync();
        Assert.True(npcs.Count >= 3);
        Assert.Contains(npcs, n => n.NpcName == "Elder Aethel");
        Assert.Contains(npcs, n => n.NpcName.Contains("Doran"));

        // 8. Verify Devotion System
        var constellations = await db.DevotionConstellations.ToListAsync();
        var nodes = await db.DevotionNodes.ToListAsync();
        Assert.True(constellations.Count >= 4);
        Assert.True(nodes.Count >= 5);
        Assert.Contains(nodes, n => n.Id == "nexus_root" && n.IsRoot);
    }

    [Fact]
    public async Task DatabaseSeeder_IsIdempotent_DoesNotDuplicateOnMultipleRuns()
    {
        // Run twice
        await DatabaseSeeder.SeedAllAsync(_dbFactory);
        await DatabaseSeeder.SeedAllAsync(_dbFactory);

        await using var db = await _dbFactory.CreateDbContextAsync();
        var skills = await db.SkillTemplates.ToListAsync();
        var acts = await db.CampaignActs.ToListAsync();

        Assert.Equal(5, skills.Count);
        Assert.Equal(5, acts.Count);
    }

    public void Dispose()
    {
        try
        {
            if (File.Exists(_testDbPath)) File.Delete(_testDbPath);
        }
        catch { }
    }

    private sealed class TestDbContextFactory : IDbContextFactory<MdgDbContext>
    {
        private readonly DbContextOptions<MdgDbContext> _options;
        public TestDbContextFactory(DbContextOptions<MdgDbContext> options) => _options = options;
        public MdgDbContext CreateDbContext() => new(_options);
    }
}
