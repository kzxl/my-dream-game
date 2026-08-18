using Mdg.Core.Features.Progression;
using Mdg.Core.Features.Stats;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class AscendanceKeystoneTests
    {
        [Fact]
        public void AscendanceManager_LevelProgression_AdvancesTiersProperly()
        {
            var manager = new AscendanceManager();
            Assert.Equal(EvolutionTier.Novice, manager.Tier);

            manager.SetLevel(15);
            Assert.Equal(EvolutionTier.Adept, manager.Tier);

            manager.SetLevel(35);
            Assert.Equal(EvolutionTier.Master, manager.Tier);

            manager.SetLevel(65);
            Assert.Equal(EvolutionTier.Ascendant, manager.Tier);
        }

        [Fact]
        public void AscendanceManager_ArchetypeSelection_RequiresTrialOfGenesis()
        {
            var manager = new AscendanceManager();
            manager.SetLevel(60);

            bool fail = manager.SelectArchetype(AscendanceArchetype.IronVanguard, out string msg);
            Assert.False(fail);

            bool trialOk = manager.CompleteTrialOfGenesis();
            Assert.True(trialOk);

            bool success = manager.SelectArchetype(AscendanceArchetype.IronVanguard, out msg);
            Assert.True(success);
            Assert.Equal(AscendanceArchetype.IronVanguard, manager.Archetype);
            Assert.Contains(KeystonePassive.IronFortress, manager.ActiveKeystones);
        }

        [Fact]
        public void AscendanceManager_ChaosInoculation_SetsLifeTo1AndESMultiplier()
        {
            var manager = new AscendanceManager();
            manager.SetLevel(65);
            manager.CompleteTrialOfGenesis();
            manager.SelectArchetype(AscendanceArchetype.AetherSeeker, out _);

            var stats = new StatCollection();
            stats.SetBaseValue(StatType.MaxLife, 500f);
            stats.SetBaseValue(StatType.MaxEnergyShield, 300f);

            manager.ApplyKeystoneModifiers(stats);

            Assert.Equal(1f, stats.GetValue(StatType.MaxLife));
            Assert.Equal(100f, stats.GetValue(StatType.ChaosResistance));
            Assert.Equal(900f, stats.GetValue(StatType.MaxEnergyShield)); // 300 * (1 + 200%) = 900
        }

        [Fact]
        public void AscendanceManager_IronFortress_CapsResistancesAt85()
        {
            var manager = new AscendanceManager();
            manager.SetLevel(65);
            manager.CompleteTrialOfGenesis();
            manager.SelectArchetype(AscendanceArchetype.IronVanguard, out _);

            var stats = new StatCollection();
            stats.SetBaseValue(StatType.MovementSpeed, 100f);
            stats.SetBaseValue(StatType.FireResistance, 90f);

            manager.ApplyKeystoneModifiers(stats);

            Assert.Equal(85f, stats.GetValue(StatType.MaxFireResistance));
            Assert.Equal(85f, stats.GetValue(StatType.FireResistance)); // Clamped to max 85%
            Assert.Equal(90f, stats.GetValue(StatType.MovementSpeed)); // 100 - 10%
        }
    }
}
