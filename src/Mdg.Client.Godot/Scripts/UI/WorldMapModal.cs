using Godot;
using System;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class WorldMapModal : Control
    {
        [Export] public VBoxContainer? ZonesContainer { get; set; }

        public bool IsOpen => Visible;
        public event Action<string>? OnZoneSelected;

        public override void _Ready()
        {
            Visible = false;
            PopulateZones();
        }

        public void Toggle()
        {
            Visible = !Visible;
        }

        private void PopulateZones()
        {
            if (ZonesContainer == null) return;

            var zones = new[]
            {
                (Id: "SanctuaryHaven", Name: "🌿 Sanctuary Haven (Thị trấn khởi đầu)", Level: "Lv. 1-5"),
                (Id: "WhisperingPlains", Name: "🌾 Whispering Plains (Đồng cỏ thầm thì)", Level: "Lv. 5-10"),
                (Id: "ForgottenCrypt", Name: "🏰 Forgotten Crypt (Hầm mộ lãng quên)", Level: "Lv. 10-15"),
                (Id: "FrostpeakTundra", Name: "❄️ Frostpeak Tundra (Lãnh nguyên băng giá)", Level: "Lv. 15-25"),
                (Id: "MoltenCaldera", Name: "🔥 Molten Caldera (Miệng núi lửa dung nham)", Level: "Lv. 25-35"),
                (Id: "VoidAbyss", Name: "🌌 Void Abyss (Vực thẳm hư không vô tận)", Level: "Lv. 35-50")
            };

            foreach (var z in zones)
            {
                var btn = new Button
                {
                    Text = $"{z.Name} — [{z.Level}]",
                    CustomMinimumSize = new Vector2(0, 42)
                };

                btn.Pressed += () =>
                {
                    OnZoneSelected?.Invoke(z.Id);
                    Visible = false;
                };

                ZonesContainer.AddChild(btn);
            }
        }
    }
}
