using Godot;
using System;
using Mdg.Client.Godot.Scripts.Common;
using Mdg.Core.Common.Math;
using Mdg.Core.Features.Combat;

namespace Mdg.Client.Godot.Scripts.Entities
{
    public partial class MonsterView : CharacterBody2D
    {
        [Export] public Sprite2D? MonsterSprite { get; set; }
        [Export] public ProgressBar? HealthBar { get; set; }
        [Export] public ProgressBar? StaggerBar { get; set; }
        [Export] public Label? NameLabel { get; set; }
        [Export] public Node2D? AuraRing { get; set; }

        public MonsterEntity? CoreEntity { get; private set; }
        public Guid MonsterId { get; private set; }

        private Node2D? _playerTarget;
        private Texture2D? _monstersTexture;
        private AtlasTexture? _atlasTexture;

        private float _hurtTimer = 0f;
        private float _wanderTimer = 0f;
        private Vector2 _wanderDir = Vector2.Zero;
        private float _animTimer = 0f;

        public void Initialize(MonsterEntity entity, FixVector2 spawnPos, Node2D? playerTarget = null)
        {
            CoreEntity = entity ?? throw new ArgumentNullException(nameof(entity));
            MonsterId = entity.Id;
            Position = new Vector2(spawnPos.X, spawnPos.Y);
            _playerTarget = playerTarget;

            SetupMonsterVisuals();
            UpdateHealthDisplay();
        }

        private void SetupMonsterVisuals()
        {
            if (CoreEntity == null || MonsterSprite == null) return;

            string nameLower = CoreEntity.Name.ToLowerInvariant();
            float scaleMultiplier = 1.0f;

            if (CoreEntity.Rarity == MonsterRarity.PinnacleBoss)
            {
                _monstersTexture = TextureLoader.LoadTexture("res://Assets/bosses_pack.png");
                if (_monstersTexture != null)
                {
                    float colW = _monstersTexture.GetWidth() / 4f;
                    float rowH = _monstersTexture.GetHeight() / 4f;
                    int row = 0;
                    if (nameLower.Contains("cryomancer") || nameLower.Contains("vael") || nameLower.Contains("frost")) row = 1;
                    else if (nameLower.Contains("ignis") || nameLower.Contains("tyrant") || nameLower.Contains("magma") || nameLower.Contains("fire")) row = 2;
                    else if (nameLower.Contains("drake") || nameLower.Contains("dragon") || nameLower.Contains("storm")) row = 3;
                    else row = 0; // Malakor, Void Inquisitor

                    _atlasTexture = new AtlasTexture
                    {
                        Atlas = _monstersTexture,
                        Region = new Rect2(0, row * rowH, colW, rowH)
                    };
                    MonsterSprite.Texture = _atlasTexture;
                    MonsterSprite.Scale = new Vector2(0.65f, 0.65f);
                    scaleMultiplier = 1.7f;
                }
            }
            else if (nameLower.Contains("spectre") || nameLower.Contains("chaos") || nameLower.Contains("tentacle") || nameLower.Contains("stalker") || nameLower.Contains("void"))
            {
                _monstersTexture = TextureLoader.LoadTexture("res://Assets/abyssal_void_monsters_pack.png", "white");
                if (_monstersTexture != null)
                {
                    float colW = _monstersTexture.GetWidth() / 4f;
                    float rowH = _monstersTexture.GetHeight() / 4f;
                    int row = 0;
                    if (nameLower.Contains("chaos") || nameLower.Contains("eye")) row = 1;
                    else if (nameLower.Contains("tentacle")) row = 2;
                    else if (nameLower.Contains("stalker")) row = 3;
                    else row = 0;

                    _atlasTexture = new AtlasTexture
                    {
                        Atlas = _monstersTexture,
                        Region = new Rect2(0, row * rowH, colW, rowH)
                    };
                    MonsterSprite.Texture = _atlasTexture;
                    MonsterSprite.Scale = new Vector2(0.5f, 0.5f);
                    scaleMultiplier = 1.25f;
                }
            }
            else if (nameLower.Contains("drake") || nameLower.Contains("salamander") || nameLower.Contains("serpent") || nameLower.Contains("roc"))
            {
                _monstersTexture = TextureLoader.LoadTexture("res://Assets/elemental_beasts_pack.png", "white");
                if (_monstersTexture != null)
                {
                    float colW = _monstersTexture.GetWidth() / 4f;
                    float rowH = _monstersTexture.GetHeight() / 4f;
                    int row = 0;
                    if (nameLower.Contains("salamander")) row = 1;
                    else if (nameLower.Contains("serpent")) row = 2;
                    else if (nameLower.Contains("roc")) row = 3;
                    else row = 0;

                    _atlasTexture = new AtlasTexture
                    {
                        Atlas = _monstersTexture,
                        Region = new Rect2(0, row * rowH, colW, rowH)
                    };
                    MonsterSprite.Texture = _atlasTexture;
                    MonsterSprite.Scale = new Vector2(0.5f, 0.5f);
                    scaleMultiplier = 1.2f;
                }
            }
            else
            {
                // Aethelis Monsters Pack (4 cols x 2 rows, black background)
                _monstersTexture = TextureLoader.LoadTexture("res://Assets/aethelis_monsters_pack.jpg", "black")
                    ?? TextureLoader.LoadTexture("res://Assets/monsters_creatures_grid.png", "white");

                if (_monstersTexture != null)
                {
                    float colW = _monstersTexture.GetWidth() / 4f;
                    float rowH = _monstersTexture.GetHeight() / 2f;
                    int col = 0, row = 0;

                    if (nameLower.Contains("imp") || nameLower.Contains("cinder")) { col = 0; row = 0; }
                    else if (nameLower.Contains("wraith") || nameLower.Contains("spectre")) { col = 1; row = 0; }
                    else if (nameLower.Contains("skeleton") || nameLower.Contains("undead")) { col = 2; row = 0; }
                    else if (nameLower.Contains("wolf") || nameLower.Contains("hound")) { col = 3; row = 0; }
                    else if (nameLower.Contains("scorpion") || nameLower.Contains("golem")) { col = 0; row = 1; }
                    else if (nameLower.Contains("goblin")) { col = 1; row = 1; }
                    else if (nameLower.Contains("spider")) { col = 2; row = 1; }
                    else { col = 3; row = 1; } // Dreadknight

                    _atlasTexture = new AtlasTexture
                    {
                        Atlas = _monstersTexture,
                        Region = new Rect2(col * colW, row * rowH, colW, rowH)
                    };
                    MonsterSprite.Texture = _atlasTexture;
                    MonsterSprite.Scale = new Vector2(0.48f, 0.48f);
                    scaleMultiplier = CoreEntity.Rarity == MonsterRarity.Champion ? 1.15f : (CoreEntity.Rarity == MonsterRarity.Rare ? 1.3f : 1.0f);
                }
            }

            Scale = new Vector2(scaleMultiplier, scaleMultiplier);

            if (AuraRing != null)
            {
                AuraRing.Visible = CoreEntity.Rarity != MonsterRarity.Normal;
                AuraRing.Modulate = CoreEntity.Rarity switch
                {
                    MonsterRarity.Champion => new Color(0.2f, 0.6f, 1f, 0.7f),
                    MonsterRarity.Rare => new Color(1f, 0.85f, 0.2f, 0.8f),
                    MonsterRarity.PinnacleBoss => new Color(0.95f, 0.2f, 0.2f, 0.9f),
                    _ => Colors.Transparent
                };
            }
        }

        public void UpdateHealthDisplay()
        {
            if (CoreEntity == null) return;

            if (HealthBar != null)
            {
                HealthBar.MaxValue = CoreEntity.MaxHealth;
                HealthBar.Value = CoreEntity.CurrentHealth;
            }

            if (NameLabel != null)
            {
                string rarityPrefix = CoreEntity.Rarity switch
                {
                    MonsterRarity.Champion => "⚔️ [Champion] ",
                    MonsterRarity.Rare => "⭐ [Rare] ",
                    MonsterRarity.PinnacleBoss => "👑 [BOSS] ",
                    _ => ""
                };

                NameLabel.Text = $"{rarityPrefix}{CoreEntity.Name}";
                NameLabel.Modulate = CoreEntity.Rarity switch
                {
                    MonsterRarity.Champion => new Color(0.35f, 0.75f, 1f),
                    MonsterRarity.Rare => new Color(1f, 0.85f, 0.2f),
                    MonsterRarity.PinnacleBoss => new Color(1f, 0.25f, 0.25f),
                    _ => new Color(0.9f, 0.9f, 0.9f)
                };
            }
        }

        public void TakeHitVisualFeedback(bool isCrit)
        {
            _hurtTimer = 0.15f;
            UpdateHealthDisplay();

            if (MonsterSprite != null)
            {
                var tween = CreateTween();
                Color hitColor = isCrit ? new Color(1f, 0.9f, 0.2f) : new Color(1f, 0.2f, 0.2f);
                tween.TweenProperty(MonsterSprite, "modulate", hitColor, 0.05f);
                tween.TweenProperty(MonsterSprite, "modulate", Colors.White, 0.1f);
            }
        }

        public override void _PhysicsProcess(double delta)
        {
            if (CoreEntity == null || !CoreEntity.IsAlive) return;

            if (_hurtTimer > 0f)
            {
                _hurtTimer -= (float)delta;
            }

            // AI di chuyển
            ProcessMonsterAI((float)delta);
        }

        private void ProcessMonsterAI(float delta)
        {
            if (_playerTarget == null || !IsInstanceValid(_playerTarget)) return;

            float distToPlayer = GlobalPosition.DistanceTo(_playerTarget.GlobalPosition);

            // Bán kính phát hiện 450px
            if (distToPlayer < 450f && distToPlayer > 35f)
            {
                Vector2 dir = (_playerTarget.GlobalPosition - GlobalPosition).Normalized();
                Velocity = dir * 90f;
                MoveAndSlide();

                if (MonsterSprite != null && dir.X != 0)
                {
                    MonsterSprite.FlipH = dir.X < 0;
                    _animTimer += delta * 10f;
                    MonsterSprite.Position = new Vector2(0, MathF.Sin(_animTimer) * 2f);
                }
            }
            else
            {
                _wanderTimer -= delta;
                if (_wanderTimer <= 0f)
                {
                    _wanderTimer = (float)GD.RandRange(2.0, 5.0);
                    _wanderDir = new Vector2((float)GD.RandRange(-1.0, 1.0), (float)GD.RandRange(-1.0, 1.0)).Normalized();
                }

                Velocity = _wanderDir * 25f;
                MoveAndSlide();
            }
        }

        public void PlayDeathAnimation()
        {
            SetPhysicsProcess(false);
            if (MonsterSprite != null)
            {
                var tween = CreateTween();
                tween.SetParallel(true);
                tween.TweenProperty(MonsterSprite, "modulate:a", 0.0f, 0.35f);
                tween.TweenProperty(MonsterSprite, "scale", MonsterSprite.Scale * 1.3f, 0.35f);
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
