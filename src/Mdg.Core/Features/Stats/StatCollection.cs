using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Stats
{
    public sealed class StatModifier : IEquatable<StatModifier>
    {
        public Guid Id { get; } = Guid.NewGuid();
        public StatType StatType { get; }
        public ModifierType ModifierType { get; }
        public float Value { get; }
        public object? Source { get; } // Nguồn gốc (e.g. Equipment, PassiveTree, Buff)

        public StatModifier(StatType statType, ModifierType modifierType, float value, object? source = null)
        {
            StatType = statType;
            ModifierType = modifierType;
            Value = value;
            Source = source;
        }

        public static StatModifier Flat(StatType stat, float val, object? source = null) => new StatModifier(stat, ModifierType.Flat, val, source);
        public static StatModifier Increased(StatType stat, float val, object? source = null) => new StatModifier(stat, ModifierType.Increased, val, source);
        public static StatModifier More(StatType stat, float val, object? source = null) => new StatModifier(stat, ModifierType.More, val, source);

        public bool Equals(StatModifier? other) => other != null && Id == other.Id;
        public override bool Equals(object? obj) => obj is StatModifier other && Equals(other);
        public override int GetHashCode() => Id.GetHashCode();
    }

    /// <summary>
    /// Bộ lưu trữ và tính toán thuộc tính thời gian thực theo công thức PoE với Dirty Caching để tối ưu hiệu năng.
    /// </summary>
    public sealed class StatCollection
    {
        private readonly Dictionary<StatType, float> _baseValues = new();
        private readonly Dictionary<StatType, List<StatModifier>> _modifiers = new();
        private readonly Dictionary<StatType, float> _cachedValues = new();
        private readonly HashSet<StatType> _dirtyStats = new();

        public event Action<StatType, float>? OnStatChanged;

        public void SetBaseValue(StatType stat, float baseValue)
        {
            _baseValues[stat] = baseValue;
            MarkDirty(stat);
        }

        public float GetBaseValue(StatType stat)
        {
            return _baseValues.TryGetValue(stat, out float val) ? val : 0f;
        }

        public void AddModifier(StatModifier modifier)
        {
            if (modifier == null) return;

            if (!_modifiers.TryGetValue(modifier.StatType, out var list))
            {
                list = new List<StatModifier>();
                _modifiers[modifier.StatType] = list;
            }

            list.Add(modifier);
            MarkDirty(modifier.StatType);
        }

        public bool RemoveModifier(StatModifier modifier)
        {
            if (modifier == null) return false;

            if (_modifiers.TryGetValue(modifier.StatType, out var list) && list.Remove(modifier))
            {
                MarkDirty(modifier.StatType);
                return true;
            }
            return false;
        }

        public void RemoveAllFromSource(object source)
        {
            if (source == null) return;

            foreach (var kvp in _modifiers)
            {
                int removed = kvp.Value.RemoveAll(m => ReferenceEquals(m.Source, source) || Equals(m.Source, source));
                if (removed > 0)
                {
                    MarkDirty(kvp.Key);
                }
            }
        }

        public float GetValue(StatType stat)
        {
            if (_dirtyStats.Contains(stat) || !_cachedValues.ContainsKey(stat))
            {
                float computed = CalculateStat(stat);
                _cachedValues[stat] = computed;
                _dirtyStats.Remove(stat);
            }
            return _cachedValues[stat];
        }

        private float CalculateStat(StatType stat)
        {
            float baseVal = GetBaseValue(stat);
            if (!_modifiers.TryGetValue(stat, out var mods) || mods.Count == 0)
            {
                return ApplyCaps(stat, baseVal);
            }

            float flatSum = 0f;
            float increasedSum = 0f;
            float moreProduct = 1f;

            for (int i = 0; i < mods.Count; i++)
            {
                var mod = mods[i];
                switch (mod.ModifierType)
                {
                    case ModifierType.Flat:
                        flatSum += mod.Value;
                        break;
                    case ModifierType.Increased:
                        increasedSum += mod.Value;
                        break;
                    case ModifierType.More:
                        moreProduct *= (1f + (mod.Value / 100f));
                        break;
                }
            }

            // Công thức PoE: (Base + Flat) * (1 + sum(Increased) / 100) * product(1 + More / 100)
            float finalValue = (baseVal + flatSum) * (1f + (increasedSum / 100f)) * moreProduct;
            return ApplyCaps(stat, finalValue);
        }

        private float ApplyCaps(StatType stat, float value)
        {
            // Xử lý caps đặc thù
            switch (stat)
            {
                case StatType.FireResistance:
                    float maxFire = GetValue(StatType.MaxFireResistance);
                    if (maxFire <= 0f) maxFire = 75f;
                    return Math.Min(value, maxFire);

                case StatType.ColdResistance:
                    float maxCold = GetValue(StatType.MaxColdResistance);
                    if (maxCold <= 0f) maxCold = 75f;
                    return Math.Min(value, maxCold);

                case StatType.LightningResistance:
                    float maxLightning = GetValue(StatType.MaxLightningResistance);
                    if (maxLightning <= 0f) maxLightning = 75f;
                    return Math.Min(value, maxLightning);

                case StatType.ChaosResistance:
                    float maxChaos = GetValue(StatType.MaxChaosResistance);
                    if (maxChaos <= 0f) maxChaos = 75f;
                    return Math.Min(value, maxChaos);

                case StatType.CriticalStrikeChance:
                    return Math.Clamp(value, 0f, 100f);

                case StatType.BlockChance:
                    return Math.Clamp(value, 0f, 75f);

                default:
                    return value;
            }
        }

        private void MarkDirty(StatType stat)
        {
            _dirtyStats.Add(stat);

            // Invalidate dependent stats when max caps change
            switch (stat)
            {
                case StatType.MaxFireResistance:
                    _dirtyStats.Add(StatType.FireResistance);
                    break;
                case StatType.MaxColdResistance:
                    _dirtyStats.Add(StatType.ColdResistance);
                    break;
                case StatType.MaxLightningResistance:
                    _dirtyStats.Add(StatType.LightningResistance);
                    break;
                case StatType.MaxChaosResistance:
                    _dirtyStats.Add(StatType.ChaosResistance);
                    break;
            }

            // Kích hoạt event thông báo
            float newVal = GetValue(stat);
            OnStatChanged?.Invoke(stat, newVal);
        }
    }
}
