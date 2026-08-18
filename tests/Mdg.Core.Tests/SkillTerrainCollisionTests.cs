using Mdg.Core.Features.Combat;
using Mdg.Core.Features.Maps;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class SkillTerrainCollisionTests
    {
        [Fact]
        public void Projectile_HitsWallOrPillar_IsBlocked()
        {
            Assert.True(SkillTerrainCollision.IsProjectileBlockedByTile(ZoneMapGenerator.TILE_WALL));
            Assert.True(SkillTerrainCollision.IsProjectileBlockedByTile(ZoneMapGenerator.TILE_ANCIENT_PILLAR));
        }

        [Fact]
        public void Projectile_PassesOverWaterAndChasm()
        {
            Assert.False(SkillTerrainCollision.IsProjectileBlockedByTile(ZoneMapGenerator.TILE_WATER_DEEP));
            Assert.False(SkillTerrainCollision.IsProjectileBlockedByTile(ZoneMapGenerator.TILE_CHASM));
            Assert.False(SkillTerrainCollision.IsProjectileBlockedByTile(ZoneMapGenerator.TILE_FLOOR));
            Assert.False(SkillTerrainCollision.IsProjectileBlockedByTile(ZoneMapGenerator.TILE_LAVA));
        }

        [Fact]
        public void RaymarchDash_StopsBeforeSolidWall()
        {
            // Walkable if X < 200, solid wall at X >= 200
            bool IsWalkable(float x, float y) => x < 200f;

            var (finalX, finalY, hitObstacle) = SkillTerrainCollision.RaymarchDash(
                startX: 100f,
                startY: 100f,
                dirX: 1f,
                dirY: 0f,
                totalDistance: 250f,
                isWalkableFunc: IsWalkable,
                stepSize: 16f
            );

            Assert.True(hitObstacle);
            Assert.True(finalX < 200f);
            Assert.True(finalX >= 180f); // Stopped just right before the wall
            Assert.Equal(100f, finalY);
        }
    }
}
