using Godot;
using System;
using Mdg.Core.Entities;
using Mdg.Core.Features.Stats;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class HudController : CanvasLayer
    {
        [Export] public ProgressBar? LifeBar { get; set; }
        [Export] public ProgressBar? ManaBar { get; set; }
        [Export] public ProgressBar? EnergyShieldBar { get; set; }
        [Export] public Label? LifeText { get; set; }
        [Export] public Label? ManaText { get; set; }
        [Export] public Label? EsText { get; set; }
        [Export] public Label? MonstersAliveLabel { get; set; }
        [Export] public Label? CombatStatusLabel { get; set; }
        [Export] public Label? PlayerNameLabel { get; set; }
        [Export] public Label? LevelLabel { get; set; }
        [Export] public ProgressBar? ExpBar { get; set; }
        [Export] public Label? ExpText { get; set; }

        // Boss HUD
        [Export] public Control? BossHudContainer { get; set; }
        [Export] public Label? BossNameLabel { get; set; }
        [Export] public ProgressBar? BossHpBar { get; set; }
        [Export] public ProgressBar? BossStaggerBar { get; set; }

        // Modals
        [Export] public InventoryModal? InventoryModal { get; set; }
        [Export] public SkillsModal? SkillsModal { get; set; }
        [Export] public ForgeModal? ForgeModal { get; set; }
        [Export] public CompendiumModal? CompendiumModal { get; set; }
        [Export] public WorldMapModal? WorldMapModal { get; set; }
        [Export] public DefeatModal? DefeatModal { get; set; }

        public override void _Ready()
        {
            if (BossHudContainer != null) BossHudContainer.Visible = false;

            var btnChar = GetNodeOrNull<Button>("Root/TopRightNav/VBox/BtnChar");
            if (btnChar != null) btnChar.Pressed += () => InventoryModal?.Toggle();

            var btnSkills = GetNodeOrNull<Button>("Root/TopRightNav/VBox/BtnSkills");
            if (btnSkills != null) btnSkills.Pressed += () => SkillsModal?.Toggle();

            var btnForge = GetNodeOrNull<Button>("Root/TopRightNav/VBox/BtnForge");
            if (btnForge != null) btnForge.Pressed += () => ForgeModal?.Toggle();

            var btnComp = GetNodeOrNull<Button>("Root/TopRightNav/VBox/BtnComp");
            if (btnComp != null) btnComp.Pressed += () => CompendiumModal?.Toggle();

            var btnMap = GetNodeOrNull<Button>("Root/TopRightNav/VBox/BtnMap");
            if (btnMap != null) btnMap.Pressed += () => WorldMapModal?.Toggle();
        }

        public override void _UnhandledInput(InputEvent @event)
        {
            if (@event is InputEventKey keyEvent && keyEvent.Pressed && !keyEvent.Echo)
            {
                switch (keyEvent.Keycode)
                {
                    case Key.I:
                    case Key.C:
                        InventoryModal?.Toggle();
                        break;
                    case Key.K:
                        SkillsModal?.Toggle();
                        break;
                    case Key.B:
                        ForgeModal?.Toggle();
                        break;
                    case Key.Y:
                        CompendiumModal?.Toggle();
                        break;
                    case Key.M:
                        WorldMapModal?.Toggle();
                        break;
                    case Key.Escape:
                        CloseAllModals();
                        break;
                }
            }
        }

        public void CloseAllModals()
        {
            if (InventoryModal != null) InventoryModal.Visible = false;
            if (SkillsModal != null) SkillsModal.Visible = false;
            if (ForgeModal != null) ForgeModal.Visible = false;
            if (CompendiumModal != null) CompendiumModal.Visible = false;
            if (WorldMapModal != null) WorldMapModal.Visible = false;
        }

        public void UpdatePlayerStats(Character player)
        {
            if (player == null) return;

            float maxLife = player.Stats.GetValue(StatType.MaxLife);
            float maxMana = player.Stats.GetValue(StatType.MaxMana);
            float maxEs = player.Stats.GetValue(StatType.MaxEnergyShield);

            if (maxLife <= 0f) maxLife = 250f;
            if (maxMana <= 0f) maxMana = 120f;
            if (maxEs <= 0f) maxEs = 80f;

            if (LifeBar != null)
            {
                LifeBar.MaxValue = maxLife;
                LifeBar.Value = player.CurrentLife;
            }
            if (LifeText != null)
            {
                LifeText.Text = $"HP: {MathF.Ceiling(player.CurrentLife)} / {MathF.Ceiling(maxLife)}";
            }

            if (ManaBar != null)
            {
                ManaBar.MaxValue = maxMana;
                ManaBar.Value = player.CurrentMana;
            }
            if (ManaText != null)
            {
                ManaText.Text = $"MP: {MathF.Ceiling(player.CurrentMana)} / {MathF.Ceiling(maxMana)}";
            }

            if (EnergyShieldBar != null)
            {
                EnergyShieldBar.MaxValue = maxEs;
                EnergyShieldBar.Value = player.CurrentEnergyShield;
            }
            if (EsText != null)
            {
                EsText.Text = $"ES: {MathF.Ceiling(player.CurrentEnergyShield)} / {MathF.Ceiling(maxEs)}";
            }
        }

        public void UpdateProgression(int level, float currentExp, float expToNext, string charName, string classSpec, string gender)
        {
            if (LevelLabel != null)
            {
                LevelLabel.Text = $"Cấp {level}";
            }

            if (PlayerNameLabel != null)
            {
                string symbol = gender == "Male" ? "♂" : "♀";
                PlayerNameLabel.Text = $"{symbol} {charName} [{classSpec}]";
            }

            if (ExpBar != null)
            {
                ExpBar.MaxValue = expToNext;
                ExpBar.Value = currentExp;
            }

            if (ExpText != null)
            {
                int pct = expToNext > 0 ? (int)MathF.Round((currentExp / expToNext) * 100f) : 0;
                ExpText.Text = $"EXP: {MathF.Ceiling(currentExp)} / {MathF.Ceiling(expToNext)} ({pct}%)";
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

        public void ShowBossHud(string name, float currentHp, float maxHp, float staggerPct)
        {
            if (BossHudContainer != null)
            {
                BossHudContainer.Visible = true;
                if (BossNameLabel != null) BossNameLabel.Text = $"💀 {name}";
                if (BossHpBar != null)
                {
                    BossHpBar.MaxValue = maxHp;
                    BossHpBar.Value = currentHp;
                }
                if (BossStaggerBar != null)
                {
                    BossStaggerBar.Value = staggerPct;
                }
            }
        }

        public void HideBossHud()
        {
            if (BossHudContainer != null) BossHudContainer.Visible = false;
        }
    }
}
