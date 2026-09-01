using Godot;
using System;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class DefeatModal : Control
    {
        [Export] public Button? RespawnTownButton { get; set; }
        [Export] public Button? ReviveScrollButton { get; set; }

        public event Action? OnRespawnTownRequested;
        public event Action? OnReviveScrollRequested;

        public override void _Ready()
        {
            Visible = false;

            if (RespawnTownButton != null)
            {
                RespawnTownButton.Pressed += () =>
                {
                    Visible = false;
                    OnRespawnTownRequested?.Invoke();
                };
            }

            if (ReviveScrollButton != null)
            {
                ReviveScrollButton.Pressed += () =>
                {
                    Visible = false;
                    OnReviveScrollRequested?.Invoke();
                };
            }
        }

        public void ShowDefeat()
        {
            Visible = true;
        }
    }
}
