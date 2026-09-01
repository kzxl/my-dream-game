using Godot;
using System;
using Mdg.Client.Godot.Scripts.Common;

namespace Mdg.Client.Godot.Scripts.Entities
{
    public partial class CompanionView : CharacterBody2D
    {
        [Export] public Sprite2D? PetSprite { get; set; }
        [Export] public Label? NameLabel { get; set; }

        public Node2D? FollowTarget { get; set; }
        public string CompanionName { get; set; } = "🐾 Luna, Astral Wolf";

        private float _bobTimer = 0f;
        private Texture2D? _petTexture;

        public override void _Ready()
        {
            if (NameLabel != null)
            {
                NameLabel.Text = CompanionName;
            }

            _petTexture = TextureLoader.LoadTexture("res://Assets/monsters_creatures_grid.png", "white")
                ?? TextureLoader.LoadTexture("res://Assets/nature_props_master_pack.png", "black");

            if (PetSprite != null && _petTexture != null)
            {
                float cellW = _petTexture.GetWidth() / 4f;
                float cellH = _petTexture.GetHeight() / 4f;
                PetSprite.Texture = new AtlasTexture
                {
                    Atlas = _petTexture,
                    Region = new Rect2(0, 0, cellW, cellH)
                };
                PetSprite.Scale = new Vector2(0.35f, 0.35f);
            }
        }

        public void Setup(Node2D target, string name, Color color)
        {
            FollowTarget = target;
            CompanionName = name;

            if (NameLabel != null)
            {
                NameLabel.Text = name;
            }

            if (PetSprite != null)
            {
                PetSprite.Modulate = color;
            }
        }

        public override void _PhysicsProcess(double delta)
        {
            if (FollowTarget == null || !IsInstanceValid(FollowTarget)) return;

            float dist = GlobalPosition.DistanceTo(FollowTarget.GlobalPosition);
            if (dist > 75f)
            {
                Vector2 dir = (FollowTarget.GlobalPosition - GlobalPosition).Normalized();
                Velocity = dir * 260f;
                MoveAndSlide();

                if (PetSprite != null && dir.X != 0)
                {
                    PetSprite.FlipH = dir.X < 0;
                    _bobTimer += (float)delta * 14f;
                    PetSprite.Position = new Vector2(0, MathF.Sin(_bobTimer) * 2f);
                }
            }
            else
            {
                Velocity = Vector2.Zero;
                if (PetSprite != null) PetSprite.Position = Vector2.Zero;
            }
        }
    }
}
