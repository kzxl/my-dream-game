using System;
using System.IO;
using System.Threading.Tasks;
using Mdg.Server.Database;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Mdg.Core.Tests;

public sealed class MultiplayerAndRosterTests : IDisposable
{
    private readonly string _testDbPath;
    private readonly IDbContextFactory<MdgDbContext> _dbFactory;

    public MultiplayerAndRosterTests()
    {
        _testDbPath = Path.Combine(Path.GetTempPath(), $"mdg_test_roster_{Guid.NewGuid():N}.db");
        var options = new DbContextOptionsBuilder<MdgDbContext>()
            .UseSqlite($"Data Source={_testDbPath}")
            .Options;

        _dbFactory = new TestDbContextFactory(options);
    }

    [Fact]
    public async Task CharacterRoster_CanCreateListAndDelete_Characters()
    {
        var dbService = new GameDatabaseService(_dbFactory);

        // 1. Create 2 characters
        var char1 = new CharacterCreateDto
        {
            Id = "char_aria_01",
            Name = "Aria",
            ClassSpec = "Arcanist",
            Gender = "Female",
            AccountId = "test_acc"
        };
        var char2 = new CharacterCreateDto
        {
            Id = "char_brand_02",
            Name = "Brand",
            ClassSpec = "Vanguard",
            Gender = "Male",
            AccountId = "test_acc"
        };

        var res1 = await dbService.CreateCharacterAsync(char1);
        var res2 = await dbService.CreateCharacterAsync(char2);

        Assert.True(res1);
        Assert.True(res2);

        // 2. Fetch roster
        var roster = await dbService.GetAllCharactersAsync("test_acc");
        Assert.Equal(2, roster.Count);
        Assert.Contains(roster, c => c.Name == "Aria" && c.ClassSpec == "Arcanist");
        Assert.Contains(roster, c => c.Name == "Brand" && c.ClassSpec == "Vanguard");

        // 3. Delete char1
        var delRes = await dbService.DeleteCharacterAsync("char_aria_01");
        Assert.True(delRes);

        var updatedRoster = await dbService.GetAllCharactersAsync("test_acc");
        Assert.Single(updatedRoster);
        Assert.Equal("Brand", updatedRoster[0].Name);
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
