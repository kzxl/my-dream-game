using System;
using System.Collections.Generic;
using Mdg.Core.Common.Math;
using Mdg.Core.Features.Combat;

namespace Mdg.Core.Features.Skills
{
    public enum SkillTargetType
    {
        Self = 1,
        Direction = 2,
        TargetUnit = 3,
        Point = 4
    }

    public sealed class SkillDefinition
    {
        public string Id { get; }
        public string Name { get; }
        public SkillTargetType TargetType { get; }
        public float BaseCooldown { get; } // Seconds
        public float ManaCost { get; }
        public float CastTime { get; }
        public float Range { get; }
        public float Radius { get; } // Bán kính AoE (nếu có)
        public DamagePayload BaseDamage { get; } = new();

        public SkillDefinition(string id, string name, SkillTargetType targetType, float baseCooldown, float manaCost, float castTime = 0f, float range = 10f, float radius = 0f)
        {
            Id = id;
            Name = name;
            TargetType = targetType;
            BaseCooldown = MathF.Max(0f, baseCooldown);
            ManaCost = MathF.Max(0f, manaCost);
            CastTime = MathF.Max(0f, castTime);
            Range = range;
            Radius = radius;
        }

        public SkillDefinition AddDamage(DamageType type, float amount)
        {
            BaseDamage.AddPortion(type, amount);
            return this;
        }
    }

    public sealed class SkillInstance
    {
        public SkillDefinition Definition { get; }
        public int Level { get; set; } = 1;
        public float CurrentCooldown { get; set; }
        public bool IsReady => CurrentCooldown <= 0f;

        public SkillInstance(SkillDefinition definition, int level = 1)
        {
            Definition = definition;
            Level = Math.Max(1, level);
        }

        public void TriggerCooldown()
        {
            CurrentCooldown = Definition.BaseCooldown;
        }

        public void UpdateCooldown(float deltaTime)
        {
            if (CurrentCooldown > 0f)
            {
                CurrentCooldown = MathF.Max(0f, CurrentCooldown - deltaTime);
            }
        }
    }

    public sealed class SkillCastRequest
    {
        public string SkillId { get; }
        public FixVector2 TargetPosition { get; }
        public Guid? TargetEntityId { get; }

        public SkillCastRequest(string skillId, FixVector2 targetPosition, Guid? targetEntityId = null)
        {
            SkillId = skillId;
            TargetPosition = targetPosition;
            TargetEntityId = targetEntityId;
        }
    }

    public sealed class SkillManager
    {
        private readonly Dictionary<string, SkillInstance> _skills = new();

        public event Action<SkillInstance, SkillCastRequest>? OnSkillCasted;

        public IReadOnlyCollection<SkillInstance> Skills => _skills.Values;

        public void AddSkill(SkillDefinition definition, int level = 1)
        {
            if (definition == null) return;
            _skills[definition.Id] = new SkillInstance(definition, level);
        }

        public bool TryGetSkill(string skillId, out SkillInstance? skill)
        {
            return _skills.TryGetValue(skillId, out skill);
        }

        public bool CanCast(string skillId, float currentMana, out string? failureReason)
        {
            if (!_skills.TryGetValue(skillId, out var skill))
            {
                failureReason = "Skill not learned.";
                return false;
            }

            if (!skill.IsReady)
            {
                failureReason = $"Skill is on cooldown ({skill.CurrentCooldown:F1}s remaining).";
                return false;
            }

            if (currentMana < skill.Definition.ManaCost)
            {
                failureReason = $"Not enough mana (Required: {skill.Definition.ManaCost}, Current: {currentMana}).";
                return false;
            }

            failureReason = null;
            return true;
        }

        public bool ExecuteSkill(SkillCastRequest request, ref float currentMana, out string? failureReason)
        {
            if (!CanCast(request.SkillId, currentMana, out failureReason))
            {
                return false;
            }

            var skill = _skills[request.SkillId];
            currentMana -= skill.Definition.ManaCost;
            skill.TriggerCooldown();

            OnSkillCasted?.Invoke(skill, request);
            return true;
        }

        public void Update(float deltaTime)
        {
            foreach (var skill in _skills.Values)
            {
                skill.UpdateCooldown(deltaTime);
            }
        }
    }
}
