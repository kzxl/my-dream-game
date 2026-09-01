using Godot;
using System;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class SkillsModal : Control
    {
        [Export] public VBoxContainer? SkillsListContainer { get; set; }

        public bool IsOpen => Visible;

        public override void _Ready()
        {
            Visible = false;
            PopulateSkills();
        }

        public void Toggle()
        {
            Visible = !Visible;
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
                (Key: "slash", Name: "⚔️ Chém Kiếm Quét (Slash Cleave)", Rank: "Rank S", Level: "Lv. 15", Exp: 85, Desc: "Nhát chém sát thương vật lý hình quạt gây 45 ST."),
                (Key: "fireball", Name: "🔥 Hỏa Cầu (Pyro Fireball)", Rank: "Rank A", Level: "Lv. 12", Exp: 60, Desc: "Phóng hỏa cầu nổ diện rộng bán kính 110px gây 75 ST Lửa."),
                (Key: "frost", Name: "❄️ Sóng Băng (Frost Nova)", Rank: "Rank B", Level: "Lv. 8", Exp: 40, Desc: "Giải phóng vụ nổ băng lan tỏa làm đông cứng và gây 55 ST Băng."),
                (Key: "meteor", Name: "☄️ Thiên Thạch (Meteor Strike)", Rank: "Rank C", Level: "Lv. 5", Exp: 20, Desc: "Triệu hồi sao băng giáng xuống gây 140 ST Lửa diện rộng."),
                (Key: "dash", Name: "💨 Lướt Tốc Biến (Aether Dash)", Rank: "Rank S", Level: "Lv. 20", Exp: 100, Desc: "Lướt nhanh 160px thoát khỏi vòng vây kẻ địch.")
            };

            foreach (var sk in skills)
            {
                var panel = new PanelContainer { CustomMinimumSize = new Vector2(0, 70) };
                var hbox = new HBoxContainer();

                var lblInfo = new Label
                {
                    Text = $"{sk.Name} — [{sk.Rank}] — {sk.Level}\n{sk.Desc}",
                    SizeFlagsHorizontal = SizeFlags.ExpandFill
                };
                lblInfo.AddThemeFontSizeOverride("font_size", 12);

                var btnUpgrade = new Button
                {
                    Text = "⭐ Nâng Cấp",
                    CustomMinimumSize = new Vector2(100, 36)
                };

                btnUpgrade.Pressed += () =>
                {
                    lblInfo.Text = $"{sk.Name} — [Đã Thăng Cấp ⭐] — {sk.Level}\n{sk.Desc}";
                };

                hbox.AddChild(lblInfo);
                hbox.AddChild(btnUpgrade);
                panel.AddChild(hbox);
                SkillsListContainer.AddChild(panel);
            }
        }
    }
}
