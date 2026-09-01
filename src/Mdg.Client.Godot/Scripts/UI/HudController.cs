using Godot;
using System;
using Mdg.Core.Entities;
using Mdg.Core.Features.Stats;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class HudController : CanvasLayer
    {
        [Export] public ProgressBar LifeBar { get; set; } = default!;
        [Export] public ProgressBar ManaBar { get; set; } = default!;
        [Export] public ProgressBar EnergyShieldBar { get; set; } = default!;
        [Export] public Label LifeText { get; set; } = default!;
        [Export] public Label ManaText { get; set; } = default!;
        [Export] public Label EsText { get; set; } = default!;
        [Export] public Label MonstersAliveLabel { get; set; } = default!;
        [Export] public Label CombatStatusLabel { get; set; } = default!;

        public void UpdatePlayerStats(Character player)
        {
            if (player == null) return;

            float maxLife = player.Stats.GetValue(StatType.MaxLife);
            float maxMana = player.Stats.GetValue(StatType.MaxMana);
            float maxEs = player.Stats.GetValue(StatType.MaxEnergyShield);

            if (LifeBar != null)
            {
                LifeBar.MaxValue = MathF.Max(1f, maxLife);
                LifeBar.Value = player.CurrentLife;
            }

            if (LifeText != null)
            {
                LifeText.Text = $"HP: {MathF.Ceiling(player.CurrentLife)} / {MathF.Ceiling(maxLife)}";
            }

            if (ManaBar != null)
            {
                ManaBar.MaxValue = MathF.Max(1f, maxMana);
                ManaBar.Value = player.CurrentMana;
            }

            if (ManaText != null)
            {
                ManaText.Text = $"MP: {MathF.Ceiling(player.CurrentMana)} / {MathF.Ceiling(maxMana)}";
            }

            if (EnergyShieldBar != null)
            {
                EnergyShieldBar.MaxValue = MathF.Max(1f, maxEs);
                EnergyShieldBar.Value = player.CurrentEnergyShield;
                EnergyShieldBar.Visible = maxEs > 0;
            }

            if (EsText != null)
            {
                EsText.Text = maxEs > 0 ? $"ES: {MathF.Ceiling(player.CurrentEnergyShield)} / {MathF.Ceiling(maxEs)}" : "";
            }
        }

        public void UpdateMonstersAlive(int count)
        {
            if (MonstersAliveLabel != null)
            {
                MonstersAliveLabel.Text = $"Quái vật còn lại: {count}";
            }
        }

        public void SetCombatStatus(string status)
        {
            if (CombatStatusLabel != null)
            {
                CombatStatusLabel.Text = status;
            }
        }
    }
}
