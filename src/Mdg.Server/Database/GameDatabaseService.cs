using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;

namespace Mdg.Server.Database;

public sealed class GameDatabaseService
{
    private readonly string _connectionString;

    public GameDatabaseService(string dbPath)
    {
        _connectionString = $"Data Source={dbPath}";
        InitializeDatabase();
    }

    private void InitializeDatabase()
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS Characters (
                Id TEXT PRIMARY KEY,
                Name TEXT NOT NULL,
                Gender TEXT NOT NULL DEFAULT 'Male',
                ClassSpec TEXT NOT NULL DEFAULT 'Novice',
                Level INTEGER NOT NULL DEFAULT 1,
                CurrentExp INTEGER NOT NULL DEFAULT 0,
                ExpToNext INTEGER NOT NULL DEFAULT 100,
                SkillPoints INTEGER NOT NULL DEFAULT 3,
                Life REAL NOT NULL DEFAULT 250,
                MaxLife REAL NOT NULL DEFAULT 250,
                Mana REAL NOT NULL DEFAULT 120,
                MaxMana REAL NOT NULL DEFAULT 120,
                Es REAL NOT NULL DEFAULT 100,
                MaxEs REAL NOT NULL DEFAULT 100,
                ZoneId TEXT NOT NULL DEFAULT 'SanctuaryHaven',
                PositionX REAL NOT NULL DEFAULT 2000,
                PositionY REAL NOT NULL DEFAULT 2000,
                SkillsJson TEXT,
                EquippedJson TEXT,
                BackpackJson TEXT,
                CreatedAt TEXT NOT NULL DEFAULT '',
                UpdatedAt TEXT NOT NULL DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS SharedStash (
                SlotIndex INTEGER PRIMARY KEY,
                ItemJson TEXT NOT NULL,
                UpdatedAt TEXT NOT NULL
            );
        ";
        cmd.ExecuteNonQuery();

        try
        {
            using var alterCmd = conn.CreateCommand();
            alterCmd.CommandText = "ALTER TABLE Characters ADD COLUMN CreatedAt TEXT NOT NULL DEFAULT '';";
            alterCmd.ExecuteNonQuery();
        }
        catch { }
    }

    public async Task<List<CharacterSummaryDto>> GetAllCharactersAsync()
    {
        var list = new List<CharacterSummaryDto>();
        using var conn = new SqliteConnection(_connectionString);
        await conn.OpenAsync();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT Id, Name, Gender, ClassSpec, Level, ZoneId, UpdatedAt FROM Characters ORDER BY UpdatedAt DESC";

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            list.Add(new CharacterSummaryDto
            {
                Id = reader.GetString(0),
                Name = reader.GetString(1),
                Gender = reader.GetString(2),
                ClassSpec = reader.GetString(3),
                Level = reader.GetInt32(4),
                ZoneId = reader.GetString(5),
                UpdatedAt = reader.GetString(6)
            });
        }

        return list;
    }

    public async Task<bool> CreateCharacterAsync(CharacterCreateDto dto)
    {
        using var conn = new SqliteConnection(_connectionString);
        await conn.OpenAsync();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO Characters (
                Id, Name, Gender, ClassSpec, Level, CurrentExp, ExpToNext, SkillPoints,
                Life, MaxLife, Mana, MaxMana, Es, MaxEs, ZoneId, PositionX, PositionY,
                SkillsJson, EquippedJson, BackpackJson, CreatedAt, UpdatedAt
            ) VALUES (
                $id, $name, $gender, $classSpec, 1, 0, 100, 3,
                250, 250, 120, 120, 100, 100, 'SanctuaryHaven', 2000, 2000,
                '{}', '{}', '[]', $now, $now
            )";

        cmd.Parameters.AddWithValue("$id", dto.Id ?? Guid.NewGuid().ToString("N"));
        cmd.Parameters.AddWithValue("$name", dto.Name);
        cmd.Parameters.AddWithValue("$gender", dto.Gender ?? "Male");
        cmd.Parameters.AddWithValue("$classSpec", dto.ClassSpec ?? "Novice");
        cmd.Parameters.AddWithValue("$now", DateTime.UtcNow.ToString("o"));

        var rows = await cmd.ExecuteNonQueryAsync();
        return rows > 0;
    }

    public async Task<bool> DeleteCharacterAsync(string characterId)
    {
        using var conn = new SqliteConnection(_connectionString);
        await conn.OpenAsync();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM Characters WHERE Id = $id";
        cmd.Parameters.AddWithValue("$id", characterId);

        var rows = await cmd.ExecuteNonQueryAsync();
        return rows > 0;
    }

    public async Task<bool> SaveCharacterAsync(SaveGameDto data)
    {
        using var conn = new SqliteConnection(_connectionString);
        await conn.OpenAsync();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO Characters (
                Id, Name, Gender, ClassSpec, Level, CurrentExp, ExpToNext, SkillPoints,
                Life, MaxLife, Mana, MaxMana, Es, MaxEs, ZoneId, PositionX, PositionY,
                SkillsJson, EquippedJson, BackpackJson, CreatedAt, UpdatedAt
            ) VALUES (
                $id, $name, $gender, $classSpec, $level, $curExp, $expNext, $sp,
                $life, $maxLife, $mana, $maxMana, $es, $maxEs, $zone, $posX, $posY,
                $skills, $equipped, $backpack, $now, $now
            )
            ON CONFLICT(Id) DO UPDATE SET
                Name = $name,
                Gender = $gender,
                ClassSpec = $classSpec,
                Level = $level,
                CurrentExp = $curExp,
                ExpToNext = $expNext,
                SkillPoints = $sp,
                Life = $life,
                MaxLife = $maxLife,
                Mana = $mana,
                MaxMana = $maxMana,
                Es = $es,
                MaxEs = $maxEs,
                ZoneId = $zone,
                PositionX = $posX,
                PositionY = $posY,
                SkillsJson = $skills,
                EquippedJson = $equipped,
                BackpackJson = $backpack,
                UpdatedAt = $now;
        ";

        cmd.Parameters.AddWithValue("$id", data.CharacterId ?? "hero_default");
        cmd.Parameters.AddWithValue("$name", data.Name ?? "Novice Adventurer");
        cmd.Parameters.AddWithValue("$gender", data.Gender ?? "Male");
        cmd.Parameters.AddWithValue("$classSpec", data.ClassSpec ?? "Novice");
        cmd.Parameters.AddWithValue("$level", data.Level);
        cmd.Parameters.AddWithValue("$curExp", data.CurrentExp);
        cmd.Parameters.AddWithValue("$expNext", data.ExpToNext);
        cmd.Parameters.AddWithValue("$sp", data.SkillPoints);
        cmd.Parameters.AddWithValue("$life", data.Life);
        cmd.Parameters.AddWithValue("$maxLife", data.MaxLife);
        cmd.Parameters.AddWithValue("$mana", data.Mana);
        cmd.Parameters.AddWithValue("$maxMana", data.MaxMana);
        cmd.Parameters.AddWithValue("$es", data.Es);
        cmd.Parameters.AddWithValue("$maxEs", data.MaxEs);
        cmd.Parameters.AddWithValue("$zone", data.ZoneId ?? "SanctuaryHaven");
        cmd.Parameters.AddWithValue("$posX", data.PositionX);
        cmd.Parameters.AddWithValue("$posY", data.PositionY);
        cmd.Parameters.AddWithValue("$skills", JsonSerializer.Serialize(data.Skills ?? new()));
        cmd.Parameters.AddWithValue("$equipped", JsonSerializer.Serialize(data.EquippedGear ?? new()));
        cmd.Parameters.AddWithValue("$backpack", JsonSerializer.Serialize(data.BackpackItems ?? new()));
        cmd.Parameters.AddWithValue("$now", DateTime.UtcNow.ToString("o"));

        var rows = await cmd.ExecuteNonQueryAsync();
        return rows > 0;
    }

    public async Task<SaveGameDto?> GetCharacterAsync(string characterId)
    {
        using var conn = new SqliteConnection(_connectionString);
        await conn.OpenAsync();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT * FROM Characters WHERE Id = $id LIMIT 1";
        cmd.Parameters.AddWithValue("$id", characterId);

        using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new SaveGameDto
            {
                CharacterId = reader.GetString(reader.GetOrdinal("Id")),
                Name = reader.GetString(reader.GetOrdinal("Name")),
                Gender = reader.GetString(reader.GetOrdinal("Gender")),
                ClassSpec = reader.GetString(reader.GetOrdinal("ClassSpec")),
                Level = reader.GetInt32(reader.GetOrdinal("Level")),
                CurrentExp = reader.GetInt32(reader.GetOrdinal("CurrentExp")),
                ExpToNext = reader.GetInt32(reader.GetOrdinal("ExpToNext")),
                SkillPoints = reader.GetInt32(reader.GetOrdinal("SkillPoints")),
                Life = reader.GetDouble(reader.GetOrdinal("Life")),
                MaxLife = reader.GetDouble(reader.GetOrdinal("MaxLife")),
                Mana = reader.GetDouble(reader.GetOrdinal("Mana")),
                MaxMana = reader.GetDouble(reader.GetOrdinal("MaxMana")),
                Es = reader.GetDouble(reader.GetOrdinal("Es")),
                MaxEs = reader.GetDouble(reader.GetOrdinal("MaxEs")),
                ZoneId = reader.GetString(reader.GetOrdinal("ZoneId")),
                PositionX = reader.GetDouble(reader.GetOrdinal("PositionX")),
                PositionY = reader.GetDouble(reader.GetOrdinal("PositionY")),
                Skills = JsonSerializer.Deserialize<Dictionary<string, object>>(reader.GetString(reader.GetOrdinal("SkillsJson")) ?? "{}"),
                EquippedGear = JsonSerializer.Deserialize<Dictionary<string, object>>(reader.GetString(reader.GetOrdinal("EquippedJson")) ?? "{}"),
                BackpackItems = JsonSerializer.Deserialize<List<object>>(reader.GetString(reader.GetOrdinal("BackpackJson")) ?? "[]")
            };
        }

        return null;
    }

    public async Task<bool> ResetSavegameAsync(string characterId = "hero_default")
    {
        using var conn = new SqliteConnection(_connectionString);
        await conn.OpenAsync();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM Characters WHERE Id = $id";
        cmd.Parameters.AddWithValue("$id", characterId);

        await cmd.ExecuteNonQueryAsync();
        return true;
    }
}

public sealed class CharacterSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Gender { get; set; } = "Male";
    public string ClassSpec { get; set; } = "Novice";
    public int Level { get; set; } = 1;
    public string ZoneId { get; set; } = "SanctuaryHaven";
    public string UpdatedAt { get; set; } = string.Empty;
}

public sealed class CharacterCreateDto
{
    public string? Id { get; set; }
    public string Name { get; set; } = "New Hero";
    public string? Gender { get; set; } = "Male";
    public string? ClassSpec { get; set; } = "Novice";
}

public sealed class SaveGameDto
{
    public string? CharacterId { get; set; } = "hero_default";
    public string? Name { get; set; } = "Novice Adventurer";
    public string? Gender { get; set; } = "Male";
    public string? ClassSpec { get; set; } = "Novice";
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
    public string? ZoneId { get; set; } = "SanctuaryHaven";
    public double PositionX { get; set; } = 2000;
    public double PositionY { get; set; } = 2000;
    public Dictionary<string, object>? Skills { get; set; }
    public Dictionary<string, object>? EquippedGear { get; set; }
    public List<object>? BackpackItems { get; set; }
}
