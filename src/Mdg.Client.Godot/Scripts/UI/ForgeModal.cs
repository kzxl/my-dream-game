using Godot;
using System;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class ForgeModal : Control
    {
        [Export] public TabContainer? TabCtrl { get; set; }

        public bool IsOpen => Visible;

        public override void _Ready()
        {
            Visible = false;
        }

        public void Toggle()
        {
            Visible = !Visible;
        }
    }
}
