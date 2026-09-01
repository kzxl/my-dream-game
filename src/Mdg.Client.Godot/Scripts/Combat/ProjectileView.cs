using Godot;
using System;
using Mdg.Client.Godot.Scripts.Common;
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

            _spellsTexture = TextureLoader.LoadTexture("res://Assets/spells_fx_master_pack.png")
                ?? TextureLoader.LoadTexture("res://Assets/spells_fx_pack.png");

            UpdateProjectileVisuals();
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
            UpdateProjectileVisuals();
        }

        private void UpdateProjectileVisuals()
        {
            if (ProjectileSprite == null || _spellsTexture == null) return;

            float totalW = _spellsTexture.GetWidth();
            float totalH = _spellsTexture.GetHeight();
            float cellW = totalW / 4f;
            float cellH = totalH / 4f;

            int col = 0, row = 0;
            if (ProjectileType == "fireball") { col = 0; row = 0; }
            else if (ProjectileType == "frost") { col = 1; row = 0; }
            else if (ProjectileType == "arcane") { col = 2; row = 0; }
            else { col = 3; row = 0; }

            ProjectileSprite.Texture = new AtlasTexture
            {
                Atlas = _spellsTexture,
                Region = new Rect2(col * cellW, row * cellH, cellW, cellH)
            };
            ProjectileSprite.Scale = new Vector2(0.55f, 0.55f);
            ProjectileSprite.Modulate = ProjectileType switch
            {
                "fireball" => new Color(1f, 0.45f, 0.2f),
                "frost" => new Color(0.2f, 0.8f, 1f),
                "arcane" => new Color(0.8f, 0.3f, 1f),
                _ => Colors.White
            };
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
