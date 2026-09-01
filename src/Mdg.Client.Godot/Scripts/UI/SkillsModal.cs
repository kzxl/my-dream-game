using Godot;
using System;
using System.Collections.Generic;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class SkillsModal : Control
    {
        [Export] public VBoxContainer? SkillsListContainer { get; set; }
        [Export] public Label? SpAvailableLabel { get; set; }

        public bool IsOpen => Visible;
        public event Action<string>? OnSkillLevelUpRequested;

        private int _availableSp = 0;
        private readonly Dictionary<string, int> _skillLevels = new()
        {
            ["slash"] = 1,
            ["fireball"] = 1,
            ["frost"] = 1,
            ["meteor"] = 1,
            ["dash"] = 1
        };

        public override void _Ready()
        {
            Visible = false;
        }

        public void Setup(int availableSp)
        {
            _availableSp = availableSp;
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
            if (SpAvailableLabel != null)
            {
                SpAvailableLabel.Text = $"⭐ Điểm Kỹ Năng Hiện Có: {_availableSp} SP";
                SpAvailableLabel.Modulate = _availableSp > 0 ? new Color(1f, 0.85f, 0.2f) : new Color(0.7f, 0.7f, 0.7f);
            }

            PopulateSkills();
        }

        private void PopulateSkills()
        {
            if (SkillsListContainer == null) return;

            foreach (Node child in SkillsListContainer.GetChildren())
            {
                child.QueueFree();
            }

            var skills = new[]
            {
                (Key: "slash", Name: "⚔️ Chém Kiếm Quét (Slash Cleave)", BaseDmg: 45, DmgType: "Vật lý", Desc: "Nhát chém hình quạt quét 95px về hướng con trỏ chuột."),
                (Key: "fireball", Name: "🔥 Hỏa Cầu (Pyro Fireball)", BaseDmg: 75, DmgType: "Lửa", Desc: "Bắn cầu lửa phát nổ diện rộng 110px gây sát thương Lửa."),
                (Key: "frost", Name: "❄️ Sóng Băng (Frost Nova)", BaseDmg: 55, DmgType: "Băng", Desc: "Giải phóng sóng băng 160px và ĐÓNG BĂNG toàn bộ quái vật 1.5s."),
                (Key: "meteor", Name: "☄️ Thiên Thạch (Meteor Strike)", BaseDmg: 140, DmgType: "Lửa", Desc: "Triệu hồi thiên thạch giáng xuống sau 0.35s gây nổ 140px cực lớn."),
                (Key: "dash", Name: "💨 Lướt Tốc Biến (Aether Dash)", BaseDmg: 0, DmgType: "Né tránh", Desc: "Lướt nhanh 180px thoát khỏi vòng vây kẻ địch.")
            };

            foreach (var sk in skills)
            {
                int lvl = _skillLevels.GetValueOrDefault(sk.Key, 1);
                int dmg = sk.BaseDmg + (lvl - 1) * 15;

                var panel = new PanelContainer { CustomMinimumSize = new Vector2(0, 70) };
                var hbox = new HBoxContainer();

                string dmgText = sk.BaseDmg > 0 ? $" | ST: {dmg} {sk.DmgType}" : "";
                var lblInfo = new Label
                {
                    Text = $"{sk.Name} — [Cấp {lvl}]{dmgText}\n{sk.Desc}",
                    SizeFlagsHorizontal = SizeFlags.ExpandFill
                };
                lblInfo.AddThemeFontSizeOverride("font_size", 12);

                var btnUpgrade = new Button
                {
                    Text = _availableSp > 0 ? "⭐ Nâng Cấp (1 SP)" : "Hết SP",
                    Disabled = _availableSp <= 0,
                    CustomMinimumSize = new Vector2(140, 36)
                };

                string skillKey = sk.Key;
                btnUpgrade.Pressed += () =>
                {
                    if (_availableSp > 0)
                    {
                        _availableSp--;
                        _skillLevels[skillKey] = lvl + 1;
                        OnSkillLevelUpRequested?.Invoke(skillKey);
                        RefreshUI();
                    }
                };

                hbox.AddChild(lblInfo);
                hbox.AddChild(btnUpgrade);
                panel.AddChild(hbox);
                SkillsListContainer.AddChild(panel);
            }
        }
    }
}
