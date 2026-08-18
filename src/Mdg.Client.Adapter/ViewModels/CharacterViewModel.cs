using System;
using System.Collections.Generic;
using Mdg.Core.Common.Math;
using Mdg.Core.Entities;
using Mdg.Core.Features.Stats;

namespace Mdg.Client.Adapter.ViewModels
{
    /// <summary>
    /// ViewModel đóng gói dữ liệu của Character để Engine Data-Binding trực tiếp lên UI (Health Bar, Mana Globe, v.v.)
    /// </summary>
    public sealed class CharacterViewModel
    {
        private readonly Character _character;

        public Guid Id => _character.Id;
        public string Name => _character.Name;
        public FixVector2 WorldPosition => _character.Position;
        public FixVector2 IsometricPosition => IsometricUtils.WorldToIsometric(_character.Position);
        public int DepthOrder => IsometricUtils.CalculateDepthOrder(_character.Position);

        public bool IsAlive => _character.IsAlive;
        public float CurrentLife => _character.CurrentLife;
        public float MaxLife => _character.Stats.GetValue(StatType.MaxLife);
        public float LifePercent => MaxLife > 0f ? Math.Clamp(CurrentLife / MaxLife, 0f, 1f) : 0f;

        public float CurrentMana => _character.CurrentMana;
        public float MaxMana => _character.Stats.GetValue(StatType.MaxMana);
        public float ManaPercent => MaxMana > 0f ? Math.Clamp(CurrentMana / MaxMana, 0f, 1f) : 0f;

        public float CurrentEnergyShield => _character.CurrentEnergyShield;
        public float MaxEnergyShield => _character.Stats.GetValue(StatType.MaxEnergyShield);
        public float EnergyShieldPercent => MaxEnergyShield > 0f ? Math.Clamp(CurrentEnergyShield / MaxEnergyShield, 0f, 1f) : 0f;

        public float FireResistance => _character.Stats.GetValue(StatType.FireResistance);
        public float ColdResistance => _character.Stats.GetValue(StatType.ColdResistance);
        public float LightningResistance => _character.Stats.GetValue(StatType.LightningResistance);
        public float ChaosResistance => _character.Stats.GetValue(StatType.ChaosResistance);
        public float Armor => _character.Stats.GetValue(StatType.Armor);
        public float Evasion => _character.Stats.GetValue(StatType.Evasion);

        public CharacterViewModel(Character character)
        {
            _character = character ?? throw new ArgumentNullException(nameof(character));
        }

        public List<SkillUiItem> GetSkillStatuses()
        {
            var list = new List<SkillUiItem>();
            foreach (var skill in _character.Skills.Skills)
            {
                list.Add(new SkillUiItem
                {
                    SkillId = skill.Definition.Id,
                    Name = skill.Definition.Name,
                    CooldownRemaining = skill.CurrentCooldown,
                    BaseCooldown = skill.Definition.BaseCooldown,
                    IsReady = skill.IsReady,
                    ManaCost = skill.Definition.ManaCost
                });
            }
            return list;
        }
    }

    public sealed class SkillUiItem
    {
        public string SkillId { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public float CooldownRemaining { get; init; }
        public float BaseCooldown { get; init; }
        public bool IsReady { get; init; }
        public float ManaCost { get; init; }
        public float CooldownPercent => BaseCooldown > 0f ? Math.Clamp(CooldownRemaining / BaseCooldown, 0f, 1f) : 0f;
    }
}
