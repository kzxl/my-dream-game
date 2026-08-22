using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Combat
{
    /// <summary>
    /// Thực thể lưu trữ một lần hút máu/ES theo thời gian (Leech Instance).
    /// Tuân theo chuẩn ARPG PoE/Grim Dawn: phân bổ đều qua nhiều giây và bị chặn bởi Leech Rate Cap.
    /// </summary>
    public sealed class LeechInstance
    {
        public float TotalAmount { get; }
        public float RemainingAmount { get; private set; }
        public float DurationSeconds { get; }
        public float ElapsedSeconds { get; private set; }
        public float RatePerSecond { get; }
        public bool IsEnergyShield { get; }

        public LeechInstance(float totalAmount, float durationSeconds = 3.0f, bool isEnergyShield = false)
        {
            TotalAmount = MathF.Max(0f, totalAmount);
            RemainingAmount = TotalAmount;
            DurationSeconds = MathF.Max(0.1f, durationSeconds);
            RatePerSecond = TotalAmount / DurationSeconds;
            ElapsedSeconds = 0f;
            IsEnergyShield = isEnergyShield;
        }

        public float Tick(float deltaSeconds)
        {
            if (RemainingAmount <= 0f || ElapsedSeconds >= DurationSeconds)
            {
                return 0f;
            }

            float tickTime = MathF.Min(deltaSeconds, DurationSeconds - ElapsedSeconds);
            float amountToHeal = MathF.Min(RemainingAmount, RatePerSecond * tickTime);

            ElapsedSeconds += tickTime;
            RemainingAmount = MathF.Max(0f, RemainingAmount - amountToHeal);
            return amountToHeal;
        }

        public bool IsFinished => RemainingAmount <= 0f || ElapsedSeconds >= DurationSeconds;
    }

    /// <summary>
    /// Bộ xử lý Leech Pool: Tổng hợp các instance và áp đặt trần tối đa Max Leech Rate (mặc định 20% Max Pool / giây).
    /// </summary>
    public sealed class LeechEngine
    {
        public const float DefaultMaxLeechRatePercent = 20.0f; // 20% max pool / sec
        public const float DefaultLeechDuration = 3.0f;        // 3s duration per instance

        private readonly List<LeechInstance> _instances = new();

        public int ActiveInstanceCount => _instances.Count;

        public void AddInstance(float amount, float durationSeconds = DefaultLeechDuration, bool isEnergyShield = false)
        {
            if (amount > 0f)
            {
                _instances.Add(new LeechInstance(amount, durationSeconds, isEnergyShield));
            }
        }

        /// <summary>
        /// Xử lý một tick hồi phục theo thời gian deltaTime, đảm bảo không vượt quá Max Leech Rate Cap.
        /// </summary>
        public float ProcessTick(float maxPool, float deltaSeconds, float maxLeechRatePercent = DefaultMaxLeechRatePercent)
        {
            if (_instances.Count == 0 || maxPool <= 0f || deltaSeconds <= 0f)
            {
                return 0f;
            }

            float rawHealRequested = 0f;
            for (int i = _instances.Count - 1; i >= 0; i--)
            {
                var instance = _instances[i];
                rawHealRequested += instance.Tick(deltaSeconds);
                if (instance.IsFinished)
                {
                    _instances.RemoveAt(i);
                }
            }

            // Áp đặt trần Leech Cap (Max Leech Rate = 20% of Max Pool per second)
            float maxAllowedHeal = (maxPool * (maxLeechRatePercent / 100f)) * deltaSeconds;
            return Math.Clamp(rawHealRequested, 0f, maxAllowedHeal);
        }

        public void Clear()
        {
            _instances.Clear();
        }

        /// <summary>
        /// Hàm static tính toán nhanh một tick Leech cơ bản độc lập với đối tượng.
        /// </summary>
        public static float CalculateLeechTick(
            float currentLeechPool,
            float maxPool,
            float deltaSeconds,
            float maxLeechRatePercent = DefaultMaxLeechRatePercent,
            float leechDuration = DefaultLeechDuration)
        {
            if (currentLeechPool <= 0f || maxPool <= 0f || deltaSeconds <= 0f) return 0f;

            float rawRate = currentLeechPool / leechDuration;
            float maxRate = maxPool * (maxLeechRatePercent / 100f);
            float effectiveRate = MathF.Min(rawRate, maxRate);

            return effectiveRate * deltaSeconds;
        }
    }
}
