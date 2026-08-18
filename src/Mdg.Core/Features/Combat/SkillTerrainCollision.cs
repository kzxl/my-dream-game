using System;
using Mdg.Core.Features.Maps;

namespace Mdg.Core.Features.Combat;

public static class SkillTerrainCollision
{
    public static bool IsProjectileBlockedByTile(int tileType)
    {
        return tileType == ZoneMapGenerator.TILE_WALL || tileType == ZoneMapGenerator.TILE_ANCIENT_PILLAR;
    }

    public static bool CanProjectilePassOverTile(int tileType)
    {
        return !IsProjectileBlockedByTile(tileType);
    }

    public static (float FinalX, float FinalY, bool HitObstacle) RaymarchDash(
        float startX,
        float startY,
        float dirX,
        float dirY,
        float totalDistance,
        Func<float, float, bool> isWalkableFunc,
        float stepSize = 16f)
    {
        float currentX = startX;
        float currentY = startY;
        float remaining = totalDistance;

        float len = (float)Math.Sqrt(dirX * dirX + dirY * dirY);
        if (len <= 0.0001f) return (startX, startY, false);

        float normDx = dirX / len;
        float normDy = dirY / len;

        while (remaining > 0f)
        {
            float step = Math.Min(stepSize, remaining);
            float nextX = currentX + normDx * step;
            float nextY = currentY + normDy * step;

            if (!isWalkableFunc(nextX, nextY))
            {
                return (currentX, currentY, true);
            }

            currentX = nextX;
            currentY = nextY;
            remaining -= step;
        }

        return (currentX, currentY, false);
    }
}
