using Godot;
using System;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class CompendiumModal : Control
    {
        [Export] public VBoxContainer? BestiaryListContainer { get; set; }

        public bool IsOpen => Visible;

        public override void _Ready()
        {
            Visible = false;
            PopulateBestiary();
        }

        public void Toggle()
        {
            Visible = !Visible;
        }

        private void PopulateBestiary()
        {
            if (BestiaryListContainer == null) return;

            var monsters = new[]
            {
                (Name: "🐺 Sylvan Stalker", Kills: 142, Rank: "Mastery Tier III", Drops: "Da thú, Vuốt sói phong ba, Ngọc Aether"),
                (Name: "👁️ Void Creeper", Kills: 89, Rank: "Mastery Tier II", Drops: "Tinh hoa hư không, Mảnh vỡ bóng tối"),
                (Name: "👹 Abyssal Brute", Kills: 35, Rank: "Mastery Tier II", Drops: "Giáp xương quỷ, Sừng hắc ám"),
                (Name: "🗿 Celestial Goliath", Kills: 12, Rank: "Mastery Tier I", Drops: "Đá thiên giới, Lõi năng lượng cổ đại"),
                (Name: "👑 Malakor, Void Inquisitor", Kills: 3, Rank: "Apex Sovereign Slayer", Drops: "Vũ khí huyền thoại, Ngọc thức tỉnh Mythic")
            };

            foreach (var m in monsters)
            {
                var p = new PanelContainer { CustomMinimumSize = new Vector2(0, 60) };
                var l = new Label
                {
                    Text = $"{m.Name} — Đã hạ: {m.Kills} | [{m.Rank}]\nVật phẩm rơi: {m.Drops}"
                };
                l.AddThemeFontSizeOverride("font_size", 12);
                p.AddChild(l);
                BestiaryListContainer.AddChild(p);
            }
        }
    }
}
