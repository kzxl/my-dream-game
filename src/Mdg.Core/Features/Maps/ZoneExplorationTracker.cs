using System;

namespace Mdg.Core.Features.Maps;

/// <summary>
/// Server-Authoritative Exploration & Fog of War Matrix.
/// Tracks explored tiles, verifies field of view, and prevents fog-of-war bypass / maphack.
/// </summary>
public sealed class ZoneExplorationTracker
{
    private readonly int _width;
    private readonly int _height;
    private readonly int _tileSize;
    private readonly bool[,] _explored;
    private int _exploredCount;

    public int WidthInTiles => _width;
    public int HeightInTiles => _height;
    public int ExploredTileCount => _exploredCount;
    public int TotalTiles => _width * _height;

    public ZoneExplorationTracker(int widthInTiles, int heightInTiles, int tileSize = 48, bool preReveal = false)
    {
        _width = Math.Max(1, widthInTiles);
        _height = Math.Max(1, heightInTiles);
        _tileSize = tileSize;
        _explored = new bool[_height, _width];
        _exploredCount = 0;

        if (preReveal)
        {
            for (int y = 0; y < _height; y++)
            {
                for (int x = 0; x < _width; x++)
                {
                    _explored[y, x] = true;
                }
            }
            _exploredCount = TotalTiles;
        }
    }

    public int RevealAround(double worldX, double worldY, int radiusInTiles = 8)
    {
        int centerTx = (int)Math.Floor(worldX / _tileSize);
        int centerTy = (int)Math.Floor(worldY / _tileSize);
        int newlyRevealed = 0;

        int minX = Math.Max(0, centerTx - radiusInTiles);
        int maxX = Math.Min(_width - 1, centerTx + radiusInTiles);
        int minY = Math.Max(0, centerTy - radiusInTiles);
        int maxY = Math.Min(_height - 1, centerTy + radiusInTiles);

        int rSq = radiusInTiles * radiusInTiles;

        for (int y = minY; y <= maxY; y++)
        {
            for (int x = minX; x <= maxX; x++)
            {
                int dx = x - centerTx;
                int dy = y - centerTy;
                if (dx * dx + dy * dy <= rSq)
                {
                    if (!_explored[y, x])
                    {
                        _explored[y, x] = true;
                        _exploredCount++;
                        newlyRevealed++;
                    }
                }
            }
        }

        return newlyRevealed;
    }

    public bool IsTileExplored(int tileX, int tileY)
    {
        if (tileX < 0 || tileX >= _width || tileY < 0 || tileY >= _height) return false;
        return _explored[tileY, tileX];
    }

    public double GetExplorationPercentage()
    {
        if (TotalTiles == 0) return 0.0;
        return (double)_exploredCount / TotalTiles * 100.0;
    }
}
