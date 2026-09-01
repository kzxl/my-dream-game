using Godot;
using Mdg.Core.Common.Math;

namespace Mdg.Client.Godot.Scripts.Common
{
    public static class GodotMathExtensions
    {
        public static Vector2 ToGodotVector2(this FixVector2 v)
        {
            return new Vector2(v.X, v.Y);
        }

        public static FixVector2 ToFixVector2(this Vector2 v)
        {
            return new FixVector2(v.X, v.Y);
        }
    }
}
