using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Maps;

public sealed class MapChunk
{
    public int ChunkX { get; set; }
    public int ChunkY { get; set; }
    public int StartTileX { get; set; }
    public int StartTileY { get; set; }
    public int SizeInTiles { get; set; } = 32;
    public bool IsActive { get; set; }
    public List<MonsterClusterSpawnDto> LocalSpawns { get; set; } = new();
    public List<ZonePropDto> LocalProps { get; set; } = new();
}

/// <summary>
/// Spatial Chunk Partitioning & Active Viewport Streaming for massive open-world zones.
/// Divides world into 32x32 tile sub-chunks to optimize memory and active entity tick simulation.
/// </summary>
public sealed class SpatialChunkManager
{
    public const int CHUNK_SIZE_IN_TILES = 32;
    public const int TILE_SIZE = 48;
    public const int CHUNK_WORLD_SIZE = CHUNK_SIZE_IN_TILES * TILE_SIZE; // 1536 px

    private readonly int _chunksX;
    private readonly int _chunksY;
    private readonly MapChunk[,] _chunks;

    public int ChunksWide => _chunksX;
    public int ChunksHigh => _chunksY;

    public SpatialChunkManager(int mapWidthInTiles, int mapHeightInTiles)
    {
        _chunksX = (int)Math.Ceiling((double)mapWidthInTiles / CHUNK_SIZE_IN_TILES);
        _chunksY = (int)Math.Ceiling((double)mapHeightInTiles / CHUNK_SIZE_IN_TILES);
        _chunks = new MapChunk[_chunksY, _chunksX];

        for (int cy = 0; cy < _chunksY; cy++)
        {
            for (int cx = 0; cx < _chunksX; cx++)
            {
                _chunks[cy, cx] = new MapChunk
                {
                    ChunkX = cx,
                    ChunkY = cy,
                    StartTileX = cx * CHUNK_SIZE_IN_TILES,
                    StartTileY = cy * CHUNK_SIZE_IN_TILES,
                    SizeInTiles = CHUNK_SIZE_IN_TILES,
                    IsActive = false
                };
            }
        }
    }

    public List<MapChunk> GetActiveChunks(double playerX, double playerY, int radiusInChunks = 1)
    {
        int playerChunkX = (int)Math.Floor(playerX / CHUNK_WORLD_SIZE);
        int playerChunkY = (int)Math.Floor(playerY / CHUNK_WORLD_SIZE);

        var activeList = new List<MapChunk>();

        for (int cy = 0; cy < _chunksY; cy++)
        {
            for (int cx = 0; cx < _chunksX; cx++)
            {
                bool inRange = Math.Abs(cx - playerChunkX) <= radiusInChunks &&
                               Math.Abs(cy - playerChunkY) <= radiusInChunks;

                _chunks[cy, cx].IsActive = inRange;
                if (inRange)
                {
                    activeList.Add(_chunks[cy, cx]);
                }
            }
        }

        return activeList;
    }
}
