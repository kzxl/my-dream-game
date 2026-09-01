using Godot;
using System;
using Mdg.Core.Common.Math;
using Mdg.Core.Features.Combat;

namespace Mdg.Client.Godot.Scripts.Combat
{
    public partial class ProjectileView : Area2D
    {
        [Export] public Sprite2D? ProjectileSprite { get; set; }
        [Export] public float Speed { get; set; } = 480f;
        [Export] public float Radius { get; set; } = 16f;
        [Export] public float MaxLifeTime { get; set; } = 2.0f;

        public string ProjectileType { get; private set; } = "fireball";
        public Vector2 VelocityDir { get; private set; } = Vector2.Right;
        public DamagePayload? Payload { get; private set; }
        public float ExplosionRadius { get; private set; } = 90f;

        private float _lifeTimer = 0f;
        private Action<Vector2, float, DamagePayload>? _onExplosionCallback;
        private Texture2D? _spellsTexture;

        public override void _Ready()
        {
            BodyEntered += OnHitBody;
            AreaEntered += OnHitArea;

            if (ResourceLoader.Exists("res://Assets/spells_fx_master_pack.png"))
            {
                _spellsTexture = GD.Load<Texture2D>("res://Assets/spells_fx_master_pack.png");
            }
            else if (ResourceLoader.Exists("res://Assets/spells_fx_pack.png"))
            {
                _spellsTexture = GD.Load<Texture2D>("res://Assets/spells_fx_pack.png");
            }
        }

        public void Setup(string type, Vector2 startPos, Vector2 direction, DamagePayload payload, float explosionRadius, Action<Vector2, float, DamagePayload> onExplode)
        {
            ProjectileType = type;
            Position = startPos;
            VelocityDir = direction.Normalized();
            Payload = payload;
            ExplosionRadius = explosionRadius;
            _onExplosionCallback = onExplode;

            Rotation = VelocityDir.Angle();

            if (ProjectileSprite != null)
            {
                ProjectileSprite.Modulate = type switch
                {
                    "fireball" => new Color(1f, 0.45f, 0.2f),
                    "frost" => new Color(0.2f, 0.8f, 1f),
                    "arcane" => new Color(0.8f, 0.3f, 1f),
                    _ => Colors.White
                };
            }
        }

        public override void _PhysicsProcess(double delta)
        {
            Position += VelocityDir * Speed * (float)delta;
            _lifeTimer += (float)delta;

            if (_lifeTimer >= MaxLifeTime)
            {
                Explode();
            }
        }

        private void OnHitBody(Node2D body)
        {
            if (body.IsInGroup("Player") || body.Name == "Player") return;
            Explode();
        }

        private void OnHitArea(Area2D area)
        {
            if (area == this) return;
        }

        private void Explode()
        {
            SetPhysicsProcess(false);

            if (Payload != null)
            {
                _onExplosionCallback?.Invoke(Position, ExplosionRadius, Payload);
            }

            // Hiệu ứng hạt nổ bùng
            if (ProjectileSprite != null)
            {
                var tween = CreateTween();
                tween.SetParallel(true);
                tween.TweenProperty(ProjectileSprite, "scale", new Vector2(2.5f, 2.5f), 0.2f);
                tween.TweenProperty(ProjectileSprite, "modulate:a", 0.0f, 0.2f);
                tween.SetParallel(false);
                tween.TweenCallback(Callable.From(QueueFree));
            }
            else
            {
                QueueFree();
            }
        }
    }
}
