using System.Collections.Generic;

namespace Mdg.Core.Features.Maps;

public sealed class ZonePortalDto
{
    public double X { get; set; }
    public double Y { get; set; }
    public string TargetZone { get; set; } = string.Empty;
    public double TargetX { get; set; }
    public double TargetY { get; set; }
    public string Name { get; set; } = string.Empty;
}

public sealed class ZoneNpcDto
{
    public double X { get; set; }
    public double Y { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Color { get; set; } = "#ffd700";
}

public sealed class ZoneDummyDto
{
    public double X { get; set; }
    public double Y { get; set; }
    public string Name { get; set; } = "Training Dummy";
}

public sealed class ZonePropDto
{
    public double X { get; set; }
    public double Y { get; set; }
    public string Type { get; set; } = "tree";
}

public sealed class MonsterClusterSpawnDto
{
    public double X { get; set; }
    public double Y { get; set; }
    public int Count { get; set; } = 5;
    public string Type { get; set; } = "slime";
}

public sealed class ZoneMapDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public ZoneBiomeType Biome { get; set; }
    public string LevelRange { get; set; } = "Lv. 1-5";
    public EnvironmentalHazardConfig? Hazard { get; set; }

    public int WidthInTiles { get; set; }
    public int HeightInTiles { get; set; }
    public int TileSize { get; set; } = 48;
    public int WorldWidth { get; set; }
    public int WorldHeight { get; set; }

    public List<List<int>> Grid { get; set; } = new();
    public double SpawnX { get; set; }
    public double SpawnY { get; set; }

    public List<ZonePortalDto> Portals { get; set; } = new();
    public List<ZoneNpcDto> Npcs { get; set; } = new();
    public List<ZoneDummyDto> Dummies { get; set; } = new();
    public List<ZonePropDto> Props { get; set; } = new();
    public List<MonsterClusterSpawnDto> MonsterSpawns { get; set; } = new();
}
