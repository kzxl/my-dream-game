using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;

namespace Mdg.Server.Database
{
    public sealed class SaveGameDto
    {
        public string CharacterId { get; set; } = "hero_default";
        public string Name { get; set; } = "Novice Adventurer";
        public string Gender { get; set; } = "Male";
        public string ClassSpec { get; set; } = "Novice";
        public int Level { get; set; } = 1;
        public long CurrentExp { get; set; } = 0;
        public long ExpToNext { get; set; } = 100;
        public int SkillPoints { get; set; } = 3;

        public float Life { get; set; } = 250f;
        public float MaxLife { get; set; } = 250f;
        public float Mana { get; set; } = 120f;
        public float MaxMana { get; set; } = 120f;
        public float Es { get; set; } = 100f;
        public float MaxEs { get; set; } = 100f;

        public string ZoneId { get; set; } = "SanctuaryHaven";
        public float PositionX { get; set; } = 2000f;
        public float PositionY { get; set; } = 2000f;

        public Dictionary<string, SkillSaveDto> Skills { get; set; } = new();
        public Dictionary<string, object> EquippedGear { get; set; } = new();
        public List<object> BackpackItems { get; set; } = new();
    }

    public sealed class SkillSaveDto
    {
        public int Level { get; set; } = 1;
        public long Exp { get; set; } = 0;
        public long ExpToNext { get; set; } = 120;
    }

    public sealed class GameDatabaseService
    {
        private readonly string _connectionString;

        public GameDatabaseService(string dbPath = "mdg_world.db")
        {
            _connectionString = $"Data Source={dbPath}";
            InitializeDatabase();
        }

        private void InitializeDatabase()
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            var cmd = connection.CreateCommand();
            cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS Characters (
                    Id TEXT PRIMARY KEY,
                    Name TEXT NOT NULL,
                    Gender TEXT NOT NULL,
                    ClassSpec TEXT NOT NULL,
                    Level INTEGER NOT NULL,
                    CurrentExp INTEGER NOT NULL,
                    ExpToNext INTEGER NOT NULL,
                    SkillPoints INTEGER NOT NULL,
                    Life REAL NOT NULL,
                    MaxLife REAL NOT NULL,
                    Mana REAL NOT NULL,
                    MaxMana REAL NOT NULL,
                    Es REAL NOT NULL,
                    MaxEs REAL NOT NULL,
                    ZoneId TEXT NOT NULL,
                    PositionX REAL NOT NULL,
                    PositionY REAL NOT NULL,
                    SkillsJson TEXT,
                    EquippedJson TEXT,
                    BackpackJson TEXT,
                    UpdatedAt TEXT NOT NULL
                );
            ";
            cmd.ExecuteNonQuery();
        }

        public async Task<SaveGameDto?> LoadSaveGameAsync(string characterId = "hero_default")
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT * FROM Characters WHERE Id = @Id LIMIT 1";
            cmd.Parameters.AddWithValue("@Id", characterId);

            using var reader = await cmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            var dto = new SaveGameDto
            {
                CharacterId = reader.GetString(reader.GetOrdinal("Id")),
                Name = reader.GetString(reader.GetOrdinal("Name")),
                Gender = reader.GetString(reader.GetOrdinal("Gender")),
                ClassSpec = reader.GetString(reader.GetOrdinal("ClassSpec")),
                Level = reader.GetInt32(reader.GetOrdinal("Level")),
                CurrentExp = reader.GetInt64(reader.GetOrdinal("CurrentExp")),
                ExpToNext = reader.GetInt64(reader.GetOrdinal("ExpToNext")),
                SkillPoints = reader.GetInt32(reader.GetOrdinal("SkillPoints")),
                Life = reader.GetFloat(reader.GetOrdinal("Life")),
                MaxLife = reader.GetFloat(reader.GetOrdinal("MaxLife")),
                Mana = reader.GetFloat(reader.GetOrdinal("Mana")),
                MaxMana = reader.GetFloat(reader.GetOrdinal("MaxMana")),
                Es = reader.GetFloat(reader.GetOrdinal("Es")),
                MaxEs = reader.GetFloat(reader.GetOrdinal("MaxEs")),
                ZoneId = reader.GetString(reader.GetOrdinal("ZoneId")),
                PositionX = reader.GetFloat(reader.GetOrdinal("PositionX")),
                PositionY = reader.GetFloat(reader.GetOrdinal("PositionY"))
            };

            var skillsJson = reader.IsDBNull(reader.GetOrdinal("SkillsJson")) ? "{}" : reader.GetString(reader.GetOrdinal("SkillsJson"));
            var equippedJson = reader.IsDBNull(reader.GetOrdinal("EquippedJson")) ? "{}" : reader.GetString(reader.GetOrdinal("EquippedJson"));
            var bagJson = reader.IsDBNull(reader.GetOrdinal("BackpackJson")) ? "[]" : reader.GetString(reader.GetOrdinal("BackpackJson"));

            dto.Skills = JsonSerializer.Deserialize<Dictionary<string, SkillSaveDto>>(skillsJson) ?? new();
            dto.EquippedGear = JsonSerializer.Deserialize<Dictionary<string, object>>(equippedJson) ?? new();
            dto.BackpackItems = JsonSerializer.Deserialize<List<object>>(bagJson) ?? new();

            return dto;
        }

        public async Task SaveGameAsync(SaveGameDto dto)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var skillsJson = JsonSerializer.Serialize(dto.Skills);
            var equippedJson = JsonSerializer.Serialize(dto.EquippedGear);
            var bagJson = JsonSerializer.Serialize(dto.BackpackItems);

            var cmd = connection.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO Characters (
                    Id, Name, Gender, ClassSpec, Level, CurrentExp, ExpToNext, SkillPoints,
                    Life, MaxLife, Mana, MaxMana, Es, MaxEs,
                    ZoneId, PositionX, PositionY, SkillsJson, EquippedJson, BackpackJson, UpdatedAt
                ) VALUES (
                    @Id, @Name, @Gender, @ClassSpec, @Level, @CurrentExp, @ExpToNext, @SkillPoints,
                    @Life, @MaxLife, @Mana, @MaxMana, @Es, @MaxEs,
                    @ZoneId, @PositionX, @PositionY, @SkillsJson, @EquippedJson, @BackpackJson, @UpdatedAt
                )
                ON CONFLICT(Id) DO UPDATE SET
                    Name = excluded.Name,
                    Gender = excluded.Gender,
                    ClassSpec = excluded.ClassSpec,
                    Level = excluded.Level,
                    CurrentExp = excluded.CurrentExp,
                    ExpToNext = excluded.ExpToNext,
                    SkillPoints = excluded.SkillPoints,
                    Life = excluded.Life,
                    MaxLife = excluded.MaxLife,
                    Mana = excluded.Mana,
                    MaxMana = excluded.MaxMana,
                    Es = excluded.Es,
                    MaxEs = excluded.MaxEs,
                    ZoneId = excluded.ZoneId,
                    PositionX = excluded.PositionX,
                    PositionY = excluded.PositionY,
                    SkillsJson = excluded.SkillsJson,
                    EquippedJson = excluded.EquippedJson,
                    BackpackJson = excluded.BackpackJson,
                    UpdatedAt = excluded.UpdatedAt;
            ";

            cmd.Parameters.AddWithValue("@Id", dto.CharacterId);
            cmd.Parameters.AddWithValue("@Name", dto.Name);
            cmd.Parameters.AddWithValue("@Gender", dto.Gender);
            cmd.Parameters.AddWithValue("@ClassSpec", dto.ClassSpec);
            cmd.Parameters.AddWithValue("@Level", dto.Level);
            cmd.Parameters.AddWithValue("@CurrentExp", dto.CurrentExp);
            cmd.Parameters.AddWithValue("@ExpToNext", dto.ExpToNext);
            cmd.Parameters.AddWithValue("@SkillPoints", dto.SkillPoints);
            cmd.Parameters.AddWithValue("@Life", dto.Life);
            cmd.Parameters.AddWithValue("@MaxLife", dto.MaxLife);
            cmd.Parameters.AddWithValue("@Mana", dto.Mana);
            cmd.Parameters.AddWithValue("@MaxMana", dto.MaxMana);
            cmd.Parameters.AddWithValue("@Es", dto.Es);
            cmd.Parameters.AddWithValue("@MaxEs", dto.MaxEs);
            cmd.Parameters.AddWithValue("@ZoneId", dto.ZoneId);
            cmd.Parameters.AddWithValue("@PositionX", dto.PositionX);
            cmd.Parameters.AddWithValue("@PositionY", dto.PositionY);
            cmd.Parameters.AddWithValue("@SkillsJson", skillsJson);
            cmd.Parameters.AddWithValue("@EquippedJson", equippedJson);
            cmd.Parameters.AddWithValue("@BackpackJson", bagJson);
            cmd.Parameters.AddWithValue("@UpdatedAt", DateTime.UtcNow.ToString("o"));

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task ResetSaveGameAsync(string characterId = "hero_default")
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var cmd = connection.CreateCommand();
            cmd.CommandText = "DELETE FROM Characters WHERE Id = @Id";
            cmd.Parameters.AddWithValue("@Id", characterId);
            await cmd.ExecuteNonQueryAsync();
        }
    }
}
