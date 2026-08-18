using System;

namespace Mdg.Core.Common.Math
{
    /// <summary>
    /// Chuyển đổi tọa độ giữa Không gian logic Cartesian 2D và Không gian hiển thị 2.5D Isometric (Diamond / Staggered).
    /// </summary>
    public static class IsometricUtils
    {
        // Góc Isometric chuẩn 2:1 (tan(theta) = 0.5, theta ≈ 26.565°)
        public const float IsoRatio = 0.5f;

        /// <summary>
        /// Chuyển từ Tọa độ thế giới Cartesian logic (X, Y) sang Tọa độ hiển thị màn hình Isometric (IsoX, IsoY).
        /// </summary>
        public static FixVector2 WorldToIsometric(FixVector2 cartesian)
        {
            float isoX = cartesian.X - cartesian.Y;
            float isoY = (cartesian.X + cartesian.Y) * IsoRatio;
            return new FixVector2(isoX, isoY);
        }

        /// <summary>
        /// Chuyển từ Tọa độ màn hình Isometric (IsoX, IsoY) về Tọa độ thế giới Cartesian logic (X, Y).
        /// </summary>
        public static FixVector2 IsometricToWorld(FixVector2 isometric)
        {
            float cartX = (isometric.X + (isometric.Y / IsoRatio)) * 0.5f;
            float cartY = ((isometric.Y / IsoRatio) - isometric.X) * 0.5f;
            return new FixVector2(cartX, cartY);
        }

        /// <summary>
        /// Tính toán Depth Sorting (Sort Order) cho 2.5D dựa trên vị trí Y và X.
        /// Quái hoặc người chơi ở phía dưới (Y thấp hơn trong logic hoặc Y cao hơn trên màn hình) sẽ vẽ đè lên.
        /// </summary>
        public static int CalculateDepthOrder(FixVector2 worldPos, int precisionMultiplier = 100)
        {
            return (int)(-worldPos.Y * precisionMultiplier);
        }
    }
}
