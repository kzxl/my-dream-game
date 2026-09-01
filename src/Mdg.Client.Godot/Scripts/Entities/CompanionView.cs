using Godot;
using System;

namespace Mdg.Client.Godot.Scripts.Entities
{
    public partial class CompanionView : CharacterBody2D
    {
        [Export] public Sprite2D? PetSprite { get; set; }
        [Export] public Label? NameLabel { get; set; }

        public Node2D? FollowTarget { get; set; }
        public string CompanionName { get; set; } = "🐾 Luna, Astral Wolf";

        private float _bobTimer = 0f;

        public override void _Ready()
        {
            if (NameLabel != null)
            {
                NameLabel.Text = CompanionName;
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
