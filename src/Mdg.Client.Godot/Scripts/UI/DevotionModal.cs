using Godot;
using System;
using System.Collections.Generic;
using Mdg.Core.Entities;
using Mdg.Core.Features.Stats;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class DevotionModal : Control
    {
        [Export] public GridContainer? ConstellationsGrid { get; set; }
        [Export] public Label? DevotionPointsLabel { get; set; }
        [Export] public Label? ActiveBlessingsSummaryLabel { get; set; }

        public bool IsOpen => Visible;
        private Character? _character;
        private int _availableDevotionPoints = 3;
        private readonly HashSet<string> _unlockedNodes = new();

        public override void _Ready()
        {
            Visible = false;
        }

        public void Setup(Character character)
        {
            _character = character;
            RefreshUI();
        }

        public void Toggle()
        {
            Visible = !Visible;
            if (Visible)
            {
                RefreshUI();
            }
        }

        public void RefreshUI()
        {
            if (DevotionPointsLabel != null)
            {
                DevotionPointsLabel.Text = $"✨ Điểm Tinh Tú Khởi Nguyên: {_availableDevotionPoints} Devotion Points";
                DevotionPointsLabel.Modulate = _availableDevotionPoints > 0 ? new Color(1f, 0.85f, 0.2f) : new Color(0.7f, 0.7f, 0.7f);
            }

            PopulateConstellations();
            UpdateBlessingsSummary();
        }

        private void PopulateConstellations()
        {
            if (ConstellationsGrid == null) return;

            foreach (Node child in ConstellationsGrid.GetChildren())
            {
                child.QueueFree();
            }

            var constellations = new[]
            {
                (Id: "leo", Name: "🦁 Chòm Sao Sư Tử (The Lion)", Bonus: "+15% Sát Thương Vật Lý & +100 Máu", Stat: StatType.PhysicalDamage, Val: 15f),
                (Id: "phoenix", Name: "🔥 Chòm Sao Phượng Hoàng (The Phoenix)", Bonus: "+20% Sát Thương Lửa & +15 Kháng Lửa", Stat: StatType.FireResistance, Val: 15f),
                (Id: "frost_titan", Name: "❄️ Chòm Sao Khổng Lồ Băng (Frost Titan)", Bonus: "+25% Thời Gian Đóng Băng & +120 Khiên ES", Stat: StatType.MaxEnergyShield, Val: 120f),
                (Id: "storm_eagle", Name: "⚡ Chòm Sao Ưng Lôi (Storm Eagle)", Bonus: "+12% Tốc Độ Tấn Công & +10% Tốc Chạy", Stat: StatType.MovementSpeed, Val: 30f),
                (Id: "shadow_weaver", Name: "🕷️ Chòm Sao Dệt Bóng Tối (Shadow Weaver)", Bonus: "+25% Tỉ Lệ Bạo Kích & +35% Sát Thương Crit", Stat: StatType.CriticalStrikeChance, Val: 15f),
                (Id: "genesis_nexus", Name: "🌌 Tâm Điểm Khởi Nguyên (Genesis Nexus)", Bonus: "+10% Mọi Chỉ Số & +500 Kháng Mọi Nguyên Tố", Stat: StatType.Armor, Val: 100f)
            };

            foreach (var c in constellations)
            {
                bool isUnlocked = _unlockedNodes.Contains(c.Id);

                var panel = new PanelContainer { CustomMinimumSize = new Vector2(360, 90) };
                var vbox = new VBoxContainer();

                var lblTitle = new Label
                {
                    Text = $"{c.Name} " + (isUnlocked ? "✅ [ĐÃ KÍCH HOẠT]" : "🔒 [CHƯA KHAI MỞ]")
                };
                lblTitle.Modulate = isUnlocked ? new Color(0.2f, 0.95f, 0.4f) : new Color(0.8f, 0.8f, 0.8f);

                var lblDesc = new Label
                {
                    Text = c.Bonus,
                    AutowrapMode = TextServer.AutowrapMode.Word
                };
                lblDesc.AddThemeFontSizeOverride("font_size", 11);

                var btnUnlock = new Button
                {
                    Text = isUnlocked ? "Đã Kích Hoạt" : (_availableDevotionPoints > 0 ? "✨ Kích Hoạt (1 Point)" : "Thiếu Point"),
                    Disabled = isUnlocked || _availableDevotionPoints <= 0,
                    CustomMinimumSize = new Vector2(0, 32)
                };

                string cId = c.Id;
                StatType stat = c.Stat;
                float val = c.Val;

                btnUnlock.Pressed += () =>
                {
                    if (!isUnlocked && _availableDevotionPoints > 0)
                    {
                        _availableDevotionPoints--;
                        _unlockedNodes.Add(cId);
                        if (_character != null)
                        {
                            _character.Stats.SetBaseValue(stat, _character.Stats.GetValue(stat) + val);
                        }
                        RefreshUI();
                    }
                };

                vbox.AddChild(lblTitle);
                vbox.AddChild(lblDesc);
                vbox.AddChild(btnUnlock);
                panel.AddChild(vbox);
                ConstellationsGrid.AddChild(panel);
            }
        }

        private void UpdateBlessingsSummary()
        {
            if (ActiveBlessingsSummaryLabel == null) return;
            ActiveBlessingsSummaryLabel.Text = $"🌟 Đã kích hoạt {_unlockedNodes.Count}/6 Đại Chòm Sao Hoàng Đạo";
        }
    }
}
