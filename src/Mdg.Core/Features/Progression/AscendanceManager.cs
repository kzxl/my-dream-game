using System;
using System.Collections.Generic;
using Mdg.Core.Features.Stats;

namespace Mdg.Core.Features.Progression
{
    public sealed class AscendanceManager
    {
        public int CharacterLevel { get; private set; } = 1;
        public EvolutionTier Tier { get; private set; } = EvolutionTier.Novice;
        public AscendanceArchetype Archetype { get; private set; } = AscendanceArchetype.Unbound;
        public bool IsTrialOfGenesisCompleted { get; private set; } = false;

        public HashSet<KeystonePassive> ActiveKeystones { get; } = new();

        public event Action<EvolutionTier>? OnTierAdvanced;
        public event Action<AscendanceArchetype>? OnArchetypeSelected;
        public event Action<KeystonePassive>? OnKeystoneAllocated;

        public void SetLevel(int level)
        {
            CharacterLevel = Math.Max(1, level);
            UpdateTier();
        }

        private void UpdateTier()
        {
            var prevTier = Tier;
            Tier = CharacterLevel switch
            {
                >= 60 => EvolutionTier.Ascendant,
                >= 31 => EvolutionTier.Master,
                >= 11 => EvolutionTier.Adept,
                _ => EvolutionTier.Novice
            };

            if (Tier != prevTier)
            {
                OnTierAdvanced?.Invoke(Tier);
            }
        }

        public bool CompleteTrialOfGenesis()
        {
            if (Tier != EvolutionTier.Ascendant)
                return false;

            IsTrialOfGenesisCompleted = true;
            return true;
        }

        public bool SelectArchetype(AscendanceArchetype archetype, out string message)
        {
            if (archetype == AscendanceArchetype.Unbound)
            {
                message = "Cannot select Unbound as an Ascendance specialization.";
                return false;
            }

            if (!IsTrialOfGenesisCompleted)
            {
                message = "Trial of Genesis must be completed before selecting an Ascendance Archetype.";
                return false;
            }

            Archetype = archetype;

            // Auto-allocate archetype's signature keystone
            var keystone = archetype switch
            {
                AscendanceArchetype.IronVanguard => KeystonePassive.IronFortress,
                AscendanceArchetype.AetherSeeker => KeystonePassive.ChaosInoculation,
                AscendanceArchetype.ShadowSyndicate => KeystonePassive.GhostShroud,
                _ => KeystonePassive.None
            };

            if (keystone != KeystonePassive.None)
            {
                AllocateKeystone(keystone);
            }

            message = $"Awakened into {archetype}!";
            OnArchetypeSelected?.Invoke(archetype);
            return true;
        }

        public bool AllocateKeystone(KeystonePassive keystone)
        {
            if (keystone == KeystonePassive.None) return false;
            bool added = ActiveKeystones.Add(keystone);
            if (added)
            {
                OnKeystoneAllocated?.Invoke(keystone);
            }
            return added;
        }

        public void ApplyKeystoneModifiers(StatCollection stats)
        {
            if (ActiveKeystones.Contains(KeystonePassive.IronFortress))
            {
                // Max Resistances +10% (from 75% to 85%), Move Speed -10%
                stats.SetBaseValue(StatType.MaxFireResistance, 85f);
                stats.SetBaseValue(StatType.MaxColdResistance, 85f);
                stats.SetBaseValue(StatType.MaxLightningResistance, 85f);
                stats.SetBaseValue(StatType.MaxChaosResistance, 85f);
                stats.AddModifier(StatModifier.Increased(StatType.MovementSpeed, -10f, "Keystone:IronFortress"));
            }

            if (ActiveKeystones.Contains(KeystonePassive.ChaosInoculation))
            {
                // Maximum Life becomes 1, Immune to Chaos (Max Chaos Res 100%), ES +200%
                stats.SetBaseValue(StatType.MaxLife, 1f);
                stats.SetBaseValue(StatType.MaxChaosResistance, 100f);
                stats.SetBaseValue(StatType.ChaosResistance, 100f);
                stats.AddModifier(StatModifier.Increased(StatType.MaxEnergyShield, 200f, "Keystone:ChaosInoculation"));
            }

            if (ActiveKeystones.Contains(KeystonePassive.GhostShroud))
            {
                // Evasion +50%, Critical Strike Multiplier +50%
                stats.AddModifier(StatModifier.Increased(StatType.Evasion, 50f, "Keystone:GhostShroud"));
                stats.AddModifier(StatModifier.Flat(StatType.CriticalStrikeMultiplier, 50f, "Keystone:GhostShroud"));
            }
        }
    }
}
