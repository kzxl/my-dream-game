using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Maps;

/// <summary>
/// Handcrafted Room Prefab Modules & Smart Modular Assembly.
/// Blends handcrafted level-design motifs (Blood Altars, Ancient Forges, Puzzle Chambers) into procedural graphs.
/// </summary>
public static class DungeonPrefabManager
{
    public static void StampBloodSacrificeAltar(
        List<List<int>> grid,
        DungeonNode room,
        List<ZonePropDto> props,
        List<ZonePoiDto> pois,
        int tileSize = 48)
    {
        int cx = room.GridX + room.Width / 2;
        int cy = room.GridY + room.Height / 2;

        // Blood pool in center
        for (int dy = -2; dy <= 2; dy++)
        {
            for (int dx = -2; dx <= 2; dx++)
            {
                if (Math.Abs(dx) + Math.Abs(dy) <= 3)
                {
                    grid[cy + dy][cx + dx] = ZoneMapGenerator.TILE_BURNT_GROUND;
                }
            }
        }
        grid[cy][cx] = ZoneMapGenerator.TILE_TOXIC_MIASMA;

        // 4 Ritual Obelisks
        grid[cy - 3][cx - 3] = ZoneMapGenerator.TILE_ANCIENT_PILLAR;
        grid[cy - 3][cx + 3] = ZoneMapGenerator.TILE_ANCIENT_PILLAR;
        grid[cy + 3][cx - 3] = ZoneMapGenerator.TILE_ANCIENT_PILLAR;
        grid[cy + 3][cx + 3] = ZoneMapGenerator.TILE_ANCIENT_PILLAR;

        pois.Add(new ZonePoiDto
        {
            Id = $"Altar_Blood_{room.Id}",
            Type = "shrine",
            Name = "🩸 Altar of Sanguine Sacrifice",
            Description = "Sacrifice 20% current Life to empower all attacks with +60% Critical Damage for 90s.",
            X = cx * tileSize,
            Y = cy * tileSize,
            BuffType = "BloodFrenzy",
            BuffDuration = 90,
            Color = "#e74c3c",
            Icon = "🩸"
        });
    }

    public static void StampAncientSubterraneanForge(
        List<List<int>> grid,
        DungeonNode room,
        List<ZonePropDto> props,
        List<ZonePoiDto> pois,
        int tileSize = 48)
    {
        int cx = room.GridX + room.Width / 2;
        int cy = room.GridY + room.Height / 2;

        // Forge plaza hearth
        for (int dy = -2; dy <= 2; dy++)
        {
            for (int dx = -2; dx <= 2; dx++)
            {
                grid[cy + dy][cx + dx] = ZoneMapGenerator.TILE_PLAZA;
            }
        }

        grid[cy][cx] = ZoneMapGenerator.TILE_LAVA;

        props.Add(new ZonePropDto { X = (cx - 2) * tileSize, Y = cy * tileSize, Type = "chest" });
        props.Add(new ZonePropDto { X = (cx + 2) * tileSize, Y = cy * tileSize, Type = "barrel" });
    }

    public static void StampAetherPuzzleChamber(
        List<List<int>> grid,
        DungeonNode room,
        List<ZonePropDto> props,
        List<ZonePoiDto> pois,
        int tileSize = 48)
    {
        int cx = room.GridX + room.Width / 2;
        int cy = room.GridY + room.Height / 2;

        // 3 Triangular Aether Pylons
        grid[cy - 3][cx] = ZoneMapGenerator.TILE_ELECTRIC_GROUND;
        grid[cy + 2][cx - 3] = ZoneMapGenerator.TILE_ELECTRIC_GROUND;
        grid[cy + 2][cx + 3] = ZoneMapGenerator.TILE_ELECTRIC_GROUND;

        pois.Add(new ZonePoiDto
        {
            Id = $"Puzzle_Monolith_{room.Id}",
            Type = "monolith",
            Name = "🔮 Aether Tri-Pillar Monolith",
            Description = "Resonate with all 3 aether pylons to awaken the ancient hoard!",
            X = cx * tileSize,
            Y = cy * tileSize,
            BuffType = "None",
            Color = "#9b59b6",
            Icon = "🔮",
            WaveCount = 3
        });
    }
}
