using System;

namespace Mdg.Core.Common.Math
{
    /// <summary>
    /// Vector 2D số thực chính xác, độc lập với Game Engine.
    /// Có thể dùng cho cả logic Server authoritative và Client simulation.
    /// </summary>
    public readonly struct FixVector2 : IEquatable<FixVector2>
    {
        public float X { get; }
        public float Y { get; }

        public static readonly FixVector2 Zero = new FixVector2(0f, 0f);
        public static readonly FixVector2 One = new FixVector2(1f, 1f);
        public static readonly FixVector2 Up = new FixVector2(0f, 1f);
        public static readonly FixVector2 Down = new FixVector2(0f, -1f);
        public static readonly FixVector2 Left = new FixVector2(-1f, 0f);
        public static readonly FixVector2 Right = new FixVector2(1f, 0f);

        public FixVector2(float x, float y)
        {
            X = x;
            Y = y;
        }

        public float SqrMagnitude => (X * X) + (Y * Y);
        public float Magnitude => MathF.Sqrt(SqrMagnitude);

        public FixVector2 Normalized
        {
            get
            {
                float mag = Magnitude;
                return mag > 1e-5f ? new FixVector2(X / mag, Y / mag) : Zero;
            }
        }

        public static FixVector2 operator +(FixVector2 a, FixVector2 b) => new FixVector2(a.X + b.X, a.Y + b.Y);
        public static FixVector2 operator -(FixVector2 a, FixVector2 b) => new FixVector2(a.X - b.X, a.Y - b.Y);
        public static FixVector2 operator -(FixVector2 a) => new FixVector2(-a.X, -a.Y);
        public static FixVector2 operator *(FixVector2 a, float scalar) => new FixVector2(a.X * scalar, a.Y * scalar);
        public static FixVector2 operator *(float scalar, FixVector2 a) => new FixVector2(a.X * scalar, a.Y * scalar);
        public static FixVector2 operator /(FixVector2 a, float scalar) => scalar != 0f ? new FixVector2(a.X / scalar, a.Y / scalar) : Zero;

        public static bool operator ==(FixVector2 a, FixVector2 b) => MathF.Abs(a.X - b.X) < 1e-5f && MathF.Abs(a.Y - b.Y) < 1e-5f;
        public static bool operator !=(FixVector2 a, FixVector2 b) => !(a == b);

        public static float Distance(FixVector2 a, FixVector2 b) => (a - b).Magnitude;
        public static float DistanceSquared(FixVector2 a, FixVector2 b) => (a - b).SqrMagnitude;
        public static float Dot(FixVector2 a, FixVector2 b) => (a.X * b.X) + (a.Y * b.Y);

        public static FixVector2 MoveTowards(FixVector2 current, FixVector2 target, float maxDistanceDelta)
        {
            FixVector2 toVector = target - current;
            float dist = toVector.Magnitude;
            if (dist <= maxDistanceDelta || dist < 1e-5f)
            {
                return target;
            }
            return current + (toVector / dist * maxDistanceDelta);
        }

        public static FixVector2 Lerp(FixVector2 a, FixVector2 b, float t)
        {
            t = System.Math.Clamp(t, 0f, 1f);
            return new FixVector2(a.X + (b.X - a.X) * t, a.Y + (b.Y - a.Y) * t);
        }

        public bool Equals(FixVector2 other) => this == other;
        public override bool Equals(object? obj) => obj is FixVector2 other && Equals(other);
        public override int GetHashCode() => HashCode.Combine(X, Y);
        public override string ToString() => $"({X:F2}, {Y:F2})";
    }
}
