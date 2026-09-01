using Godot;
using System;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class FloatingCombatText : Node2D
    {
        [Export] public Label TextLabel { get; set; } = default!;

        public void Setup(string text, Color color, float duration = 0.8f, float floatDistance = 45f)
        {
            if (TextLabel != null)
            {
                TextLabel.Text = text;
                TextLabel.Modulate = color;
            }

            // Hiệu ứng Tween bay lên và mờ dần
            var tween = CreateTween();
            tween.SetParallel(true);
            tween.TweenProperty(this, "position:y", Position.Y - floatDistance, duration)
                 .SetTrans(Tween.TransitionType.Cubic)
                 .SetEase(Tween.EaseType.Out);
            tween.TweenProperty(this, "modulate:a", 0.0f, duration)
                 .SetTrans(Tween.TransitionType.Quad)
                 .SetEase(Tween.EaseType.In);

            tween.SetParallel(false);
            tween.TweenCallback(Callable.From(QueueFree));
        }
    }
}
