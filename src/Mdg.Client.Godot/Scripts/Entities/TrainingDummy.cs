using Godot;
using System;
using Mdg.Client.Godot.Scripts.Common;

namespace Mdg.Client.Godot.Scripts.Entities
{
    public partial class TrainingDummy : CharacterBody2D
    {
        [Export] public Sprite2D? DummySprite { get; set; }
        [Export] public Label? NameLabel { get; set; }
        [Export] public ProgressBar? HealthBar { get; set; }

        public string DummyName { get; private set; } = "🎯 Training Dummy (Alpha)";
        public float MaxLife { get; set; } = 999999f;
        public float CurrentLife { get; set; } = 999999f;
        public float Armor { get; set; } = 200f;
        public bool IsAlive => true;

        private float _hurtTimer = 0f;
        private Texture2D? _dummyTexture;

        public override void _Ready()
        {
            _dummyTexture = TextureLoader.LoadTexture("res://Assets/props_interactive_grid.png", "black")
                ?? TextureLoader.LoadTexture("res://Assets/props_pack.png", "black");

            if (DummySprite != null && _dummyTexture != null)
            {
                DummySprite.Texture = _dummyTexture;
                DummySprite.Scale = new Vector2(0.45f, 0.45f);
            }

            if (NameLabel != null)
            {
                NameLabel.Text = DummyName;
            }

            if (HealthBar != null)
            {
                HealthBar.MaxValue = 100;
                HealthBar.Value = 100;
            }
        }

        public void Setup(string name, Vector2 pos)
        {
            DummyName = name;
            Position = pos;
            if (NameLabel != null) NameLabel.Text = name;
        }

        public void TakeHit(float damage, bool isCrit)
        {
            _hurtTimer = 0.2f;

            if (DummySprite != null)
            {
                var tween = CreateTween();
                tween.TweenProperty(DummySprite, "modulate", new Color(1f, 0.3f, 0.3f), 0.05f);
                tween.TweenProperty(DummySprite, "modulate", Colors.White, 0.15f);
            }
        }

        public override void _Process(double delta)
        {
            if (_hurtTimer > 0f)
            {
                _hurtTimer -= (float)delta;
            }
        }
    }
}
