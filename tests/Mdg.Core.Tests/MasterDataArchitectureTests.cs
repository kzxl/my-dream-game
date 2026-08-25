using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Mdg.Server.Database;
using Mdg.Server.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Mdg.Core.Tests;

public class MasterDataArchitectureTests : IDisposable
{
    private readonly string _testDbPath;
    private readonly TestDbContextFactory _dbFactory;

    public MasterDataArchitectureTests()
    {
        _testDbPath = Path.Combine(Path.GetTempPath(), $"mdg_test_master_{Guid.NewGuid():N}.db");
        var options = new DbContextOptionsBuilder<MdgDbContext>()
            .UseSqlite($"Data Source={_testDbPath}")
            .Options;

        _dbFactory = new TestDbContextFactory(options);
    }

    public void Dispose()
    {
        try
        {
            if (File.Exists(_testDbPath)) File.Delete(_testDbPath);
        }
        catch { }
    }

    private class TestDbContextFactory : IDbContextFactory<MdgDbContext>
    {
        private readonly DbContextOptions<MdgDbContext> _options;

        public TestDbContextFactory(DbContextOptions<MdgDbContext> options)
        {
            _options = options;
        }

        public MdgDbContext CreateDbContext() => new MdgDbContext(_options);
        public Task<MdgDbContext> CreateDbContextAsync(System.Threading.CancellationToken cancellationToken = default)
            => Task.FromResult(new MdgDbContext(_options));
    }

    [Fact]
    public async Task MasterDataCache_Warmup_PopulatesItemsKitsAndModifiers()
    {
        await DatabaseSeeder.SeedAllAsync(_dbFactory);

        var cache = new MasterDataCacheService(_dbFactory);
        await cache.WarmupAsync();

        // 1. Check Item Templates
        var blade = cache.GetItemTemplate("starter_blade_1");
        Assert.NotNull(blade);
        Assert.Equal("Rusty Iron Blade", blade!.Name);
        Assert.Equal("MainHand", blade.Slot);

        var staff = cache.GetItemTemplate("starter_staff_1");
        Assert.NotNull(staff);
        Assert.Equal("Novice Apprentice Staff", staff!.Name);

        // 2. Check Class Starter Kits
        var vanguardKit = cache.GetStarterKitForClass("Vanguard");
        Assert.NotEmpty(vanguardKit);
        Assert.Equal("starter_blade_1", vanguardKit[0].ItemTemplateId);

        var sorceressKit = cache.GetStarterKitForClass("Sorceress");
        Assert.NotEmpty(sorceressKit);
        Assert.Equal("starter_staff_1", sorceressKit[0].ItemTemplateId);

        var rogueKit = cache.GetStarterKitForClass("Rogue");
        Assert.NotEmpty(rogueKit);
        Assert.Equal("starter_dagger_1", rogueKit[0].ItemTemplateId);

        var rangerKit = cache.GetStarterKitForClass("Ranger");
        Assert.NotEmpty(rangerKit);
        Assert.Equal("starter_bow_1", rangerKit[0].ItemTemplateId);

        // 3. Check Modifiers
        var prefixes = cache.GetModifiers("Equipment", "Prefix");
        Assert.NotEmpty(prefixes);
        Assert.Contains(prefixes, p => p.StatKey == "FlatPhys");
        Assert.Contains(prefixes, p => p.StatKey == "MaxLife");

        var suffixes = cache.GetModifiers("Equipment", "Suffix");
        Assert.NotEmpty(suffixes);
        Assert.Contains(suffixes, s => s.StatKey == "FireRes");
        Assert.Contains(suffixes, s => s.StatKey == "AttackSpeed");

        var monsterAffixes = cache.GetMonsterAffixes();
        Assert.NotEmpty(monsterAffixes);
        Assert.Contains(monsterAffixes, m => m.Id == "mon_hellfire_aura");
    }

    [Theory]
    [InlineData("Vanguard", "starter_blade_1")]
    [InlineData("Sorceress", "starter_staff_1")]
    [InlineData("Rogue", "starter_dagger_1")]
    [InlineData("Ranger", "starter_bow_1")]
    [InlineData("Paladin", "starter_blade_1")]
    public async Task BuildStarterGearForClass_ReturnsCorrectSlotAndWeapon(string classSpec, string expectedTemplateId)
    {
        await DatabaseSeeder.SeedAllAsync(_dbFactory);

        var cache = new MasterDataCacheService(_dbFactory);
        await cache.WarmupAsync();

        var gear = cache.BuildStarterGearForClass(classSpec);
        Assert.NotNull(gear);
        Assert.True(gear.ContainsKey("MainHand"));

        var mainHand = gear["MainHand"] as Dictionary<string, object>;
        Assert.NotNull(mainHand);
        Assert.Equal(expectedTemplateId, mainHand!["id"]);
    }

    [Fact]
    public async Task GameDatabaseService_CreateCharacter_UsesStarterKitFromCache()
    {
        await DatabaseSeeder.SeedAllAsync(_dbFactory);

        var cache = new MasterDataCacheService(_dbFactory);
        await cache.WarmupAsync();

        var dbService = new GameDatabaseService(_dbFactory, cache);
        var created = await dbService.CreateCharacterAsync(new CharacterCreateDto
        {
            Id = "char_mage_001",
            AccountId = "acc_test",
            Name = "IgnisMage",
            ClassSpec = "Sorceress",
            Gender = "Female"
        });

        Assert.True(created);

        var loaded = await dbService.GetCharacterAsync("char_mage_001");
        Assert.NotNull(loaded);
        Assert.Equal("Sorceress", loaded!.ClassSpec);
        Assert.NotNull(loaded.EquippedGear);
        var weaponObj = loaded.EquippedGear["MainHand"];
        Assert.NotNull(weaponObj);

        string? weaponId = null;
        if (weaponObj is System.Text.Json.JsonElement jsonEl)
        {
            weaponId = jsonEl.GetProperty("id").GetString();
        }
        else if (weaponObj is Dictionary<string, object> dict && dict.TryGetValue("id", out var idVal))
        {
            weaponId = idVal?.ToString();
        }

        Assert.Equal("starter_staff_1", weaponId);
    }
}
