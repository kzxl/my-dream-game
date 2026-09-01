using Godot;
using System;

namespace Mdg.Client.Godot.Scripts.Combat
{
    public partial class SkillEffectView : Node2D
    {
        [Export] public string EffectType { get; set; } = "slash";
        [Export] public float Radius { get; set; } = 80f;
        [Export] public Color EffectColor { get; set; } = new Color(1f, 0.8f, 0.2f);
        [Export] public float Duration { get; set; } = 0.35f;

        private float _elapsed = 0f;
        private float _currentRadius = 0f;

        public void Setup(string type, Vector2 position, float radius, Color color, float duration = 0.35f)
        {
            EffectType = type;
            Position = position;
            Radius = radius;
            EffectColor = color;
            Duration = duration;
            _currentRadius = type == "frost_nova" ? 10f : radius;
        }

        public override void _Process(double delta)
        {
            _elapsed += (float)delta;
            float t = Math.Clamp(_elapsed / Duration, 0f, 1f);

            if (EffectType == "frost_nova")
            {
                _currentRadius = Mathf.Lerp(10f, Radius, t);
            }

            QueueRedraw();

            if (_elapsed >= Duration)
            {
                QueueFree();
            }
        }

        public override void _Draw()
        {
            float alpha = 1f - (_elapsed / Duration);
            var drawColor = new Color(EffectColor.R, EffectColor.G, EffectColor.B, EffectColor.A * alpha);

            switch (EffectType)
            {
                case "slash":
                    // Vẽ hình vòng cung chém kiếm
                    DrawArc(Vector2.Zero, Radius, -Mathf.Pi / 3f, Mathf.Pi / 3f, 16, drawColor, 6f);
                    DrawArc(Vector2.Zero, Radius * 0.8f, -Mathf.Pi / 4f, Mathf.Pi / 4f, 12, new Color(1f, 1f, 1f, alpha), 3f);
                    break;

                case "frost_nova":
                    // Vẽ vòng tròn sóng băng mở rộng
                    DrawArc(Vector2.Zero, _currentRadius, 0, Mathf.Tau, 32, drawColor, 5f);
                    DrawCircle(Vector2.Zero, _currentRadius * 0.9f, new Color(0.2f, 0.8f, 1f, alpha * 0.15f));
                    break;

                case "meteor":
                    // Vẽ vòng tròn nổ lửa sao băng
                    DrawCircle(Vector2.Zero, Radius, new Color(1f, 0.35f, 0.1f, alpha * 0.35f));
                    DrawArc(Vector2.Zero, Radius, 0, Mathf.Tau, 24, new Color(1f, 0.8f, 0.2f, alpha), 4f);
                    break;

                case "dash":
                    // Vẽ vệt lướt bóng
                    DrawCircle(Vector2.Zero, 20f, new Color(0.3f, 0.85f, 1f, alpha * 0.5f));
                    break;

                default:
                    DrawCircle(Vector2.Zero, Radius, new Color(drawColor.R, drawColor.G, drawColor.B, alpha * 0.3f));
                    break;
            }
        }
    }
}
