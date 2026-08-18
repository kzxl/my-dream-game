using System;
using System.Collections.Generic;
using Mdg.Core.Features.Stats;

namespace Mdg.Core.Features.Buffs
{
    public enum BuffType
    {
        Buff = 1,
        Debuff = 2,
        Ailment = 3 // Ignite, Chill, Freeze, Shock, Bleed, Poison
    }

    public sealed class BuffDefinition
    {
        public string Id { get; }
        public string Name { get; }
        public BuffType Type { get; }
        public float Duration { get; } // Seconds (0 = Permanent / Aura)
        public int MaxStacks { get; }
        public float PeriodicTickInterval { get; } // e.g. 0.5s for DoT
        public float PeriodicDamageAmount { get; }
        public List<StatModifier> Modifiers { get; } = new();

        public BuffDefinition(string id, string name, BuffType type, float duration, int maxStacks = 1, float periodicTickInterval = 0f, float periodicDamageAmount = 0f)
        {
            Id = id;
            Name = name;
            Type = type;
            Duration = duration;
            MaxStacks = Math.Max(1, maxStacks);
            PeriodicTickInterval = periodicTickInterval;
            PeriodicDamageAmount = periodicDamageAmount;
        }

        public BuffDefinition AddModifier(StatType stat, ModifierType modType, float value)
        {
            Modifiers.Add(new StatModifier(stat, modType, value, this));
            return this;
        }
    }

    public sealed class BuffInstance
    {
        public BuffDefinition Definition { get; }
        public float RemainingDuration { get; set; }
        public int CurrentStacks { get; set; }
        public float PeriodicTimer { get; set; }
        public bool IsExpired => Definition.Duration > 0f && RemainingDuration <= 0f;

        public BuffInstance(BuffDefinition definition, int initialStacks = 1)
        {
            Definition = definition;
            RemainingDuration = definition.Duration;
            CurrentStacks = Math.Clamp(initialStacks, 1, definition.MaxStacks);
        }

        public void RefreshDuration()
        {
            RemainingDuration = Definition.Duration;
        }

        public void AddStack(int amount = 1)
        {
            CurrentStacks = Math.Min(CurrentStacks + amount, Definition.MaxStacks);
            RefreshDuration();
        }
    }

    public sealed class BuffManager
    {
        private readonly Dictionary<string, BuffInstance> _activeBuffs = new();
        private readonly StatCollection _stats;
        private readonly List<string> _expiredBuffer = new();

        public event Action<BuffInstance>? OnBuffApplied;
        public event Action<BuffInstance>? OnBuffExpired;
        public event Action<BuffInstance, float>? OnPeriodicTick; // BuffInstance, PeriodicDamage

        public IReadOnlyCollection<BuffInstance> ActiveBuffs => _activeBuffs.Values;

        public BuffManager(StatCollection stats)
        {
            _stats = stats ?? throw new ArgumentNullException(nameof(stats));
        }

        public void ApplyBuff(BuffDefinition definition, int stacks = 1)
        {
            if (definition == null) return;

            if (_activeBuffs.TryGetValue(definition.Id, out var existing))
            {
                existing.AddStack(stacks);
            }
            else
            {
                var instance = new BuffInstance(definition, stacks);
                _activeBuffs[definition.Id] = instance;

                // Thêm modifiers vào stats
                for (int i = 0; i < definition.Modifiers.Count; i++)
                {
                    _stats.AddModifier(definition.Modifiers[i]);
                }

                OnBuffApplied?.Invoke(instance);
            }
        }

        public bool RemoveBuff(string buffId)
        {
            if (_activeBuffs.TryGetValue(buffId, out var instance))
            {
                _activeBuffs.Remove(buffId);
                _stats.RemoveAllFromSource(instance.Definition);
                OnBuffExpired?.Invoke(instance);
                return true;
            }
            return false;
        }

        public void Update(float deltaTime)
        {
            _expiredBuffer.Clear();

            foreach (var kvp in _activeBuffs)
            {
                var buff = kvp.Value;
                if (buff.Definition.Duration > 0f)
                {
                    buff.RemainingDuration -= deltaTime;
                    if (buff.IsExpired)
                    {
                        _expiredBuffer.Add(kvp.Key);
                        continue;
                    }
                }

                // Xử lý DoT / HoT periodic tick
                if (buff.Definition.PeriodicTickInterval > 0f)
                {
                    buff.PeriodicTimer += deltaTime;
                    if (buff.PeriodicTimer >= buff.Definition.PeriodicTickInterval)
                    {
                        buff.PeriodicTimer -= buff.Definition.PeriodicTickInterval;
                        float tickDamage = buff.Definition.PeriodicDamageAmount * buff.CurrentStacks;
                        OnPeriodicTick?.Invoke(buff, tickDamage);
                    }
                }
            }

            for (int i = 0; i < _expiredBuffer.Count; i++)
            {
                RemoveBuff(_expiredBuffer[i]);
            }
        }

        public void Clear()
        {
            foreach (var buff in _activeBuffs.Values)
            {
                _stats.RemoveAllFromSource(buff.Definition);
            }
            _activeBuffs.Clear();
        }
    }
}
