using System;

namespace Mdg.Core.Common.Math
{
    /// <summary>
    /// AABB 2D Bounding Box cho kiểm tra va chạm, tầm đánh và quét vùng (AoE).
    /// </summary>
    public readonly struct BoundingBox2D : IEquatable<BoundingBox2D>
    {
        public FixVector2 Center { get; }
        public FixVector2 Extents { get; }

        public FixVector2 Min => Center - Extents;
        public FixVector2 Max => Center + Extents;
        public FixVector2 Size => Extents * 2f;

        public BoundingBox2D(FixVector2 center, FixVector2 extents)
        {
            Center = center;
            Extents = new FixVector2(MathF.Abs(extents.X), MathF.Abs(extents.Y));
        }

        public static BoundingBox2D FromMinMax(FixVector2 min, FixVector2 max)
        {
            FixVector2 center = (min + max) * 0.5f;
            FixVector2 extents = (max - min) * 0.5f;
            return new BoundingBox2D(center, extents);
        }

        public bool Contains(FixVector2 point)
        {
            FixVector2 min = Min;
            FixVector2 max = Max;
            return point.X >= min.X && point.X <= max.X &&
                   point.Y >= min.Y && point.Y <= max.Y;
        }

        public bool Intersects(BoundingBox2D other)
        {
            FixVector2 minA = Min;
            FixVector2 maxA = Max;
            FixVector2 minB = other.Min;
            FixVector2 maxB = other.Max;

            return minA.X <= maxB.X && maxA.X >= minB.X &&
                   minA.Y <= maxB.Y && maxA.Y >= minB.Y;
        }

        public bool IntersectsCircle(FixVector2 circleCenter, float circleRadius)
        {
            FixVector2 min = Min;
            FixVector2 max = Max;

            float closestX = System.Math.Clamp(circleCenter.X, min.X, max.X);
            float closestY = System.Math.Clamp(circleCenter.Y, min.Y, max.Y);

            float distanceSquared = FixVector2.DistanceSquared(circleCenter, new FixVector2(closestX, closestY));
            return distanceSquared <= (circleRadius * circleRadius);
        }

        public bool Equals(BoundingBox2D other) => Center == other.Center && Extents == other.Extents;
        public override bool Equals(object? obj) => obj is BoundingBox2D other && Equals(other);
        public override int GetHashCode() => HashCode.Combine(Center, Extents);
    }
}
