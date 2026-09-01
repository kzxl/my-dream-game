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

        public Guid MonsterId { get; private set; }
        public MonsterEntity? CoreEntity { get; private set; }

        private Texture2D? _monstersTexture;
        private AtlasTexture? _atlasTexture;
        private Vector2 _targetPosition = Vector2.Zero;
        private Node2D? _playerTarget;
        private float _wanderTimer = 0f;
        private Vector2 _wanderDir = Vector2.Zero;

        public override void _Ready()
        {
            LoadMonsterTexture();
        }

        private void LoadMonsterTexture()
        {
            if (CoreEntity?.Rarity == MonsterRarity.PinnacleBoss)
            {
                _monstersTexture = TextureLoader.LoadTexture("res://Assets/bosses_pack.png")
                    ?? TextureLoader.LoadTexture("res://Assets/monsters_master_pack.png");
            }
            else if (CoreEntity?.Rarity == MonsterRarity.Rare || CoreEntity?.Rarity == MonsterRarity.Champion)
            {
                _monstersTexture = TextureLoader.LoadTexture("res://Assets/abyssal_void_monsters_pack.png", "white")
                    ?? TextureLoader.LoadTexture("res://Assets/monsters_master_pack.png");
            }
            else
            {
                _monstersTexture = TextureLoader.LoadTexture("res://Assets/monsters_creatures_grid.png", "white")
                    ?? TextureLoader.LoadTexture("res://Assets/monsters_pack.png");
            }
        }

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
            if (CoreEntity == null) return;

            LoadMonsterTexture();

            if (_monstersTexture != null && MonsterSprite != null)
            {
                float totalW = _monstersTexture.GetWidth();
                float totalH = _monstersTexture.GetHeight();
                float cellW = totalW / 4f;
                float cellH = totalH / 3f;

                // Chọn ô sprite dựa theo tên và loại quái
                int col = Math.Abs(CoreEntity.Name.GetHashCode()) % 4;
                int row = Math.Abs(CoreEntity.Name.GetHashCode() / 4) % 3;

                _atlasTexture = new AtlasTexture
                {
                    Atlas = _monstersTexture,
                    Region = new Rect2(col * cellW, row * cellH, cellW, cellH)
                };

                MonsterSprite.Texture = _atlasTexture;
                MonsterSprite.Modulate = Colors.White;
            }

            // Thiết lập tỷ lệ và màu sắc theo Rarity
            float scaleMultiplier = CoreEntity.Rarity switch
            {
                MonsterRarity.Champion => 1.15f,
                MonsterRarity.Rare => 1.3f,
                MonsterRarity.PinnacleBoss => 1.6f,
                _ => 1.0f
            };

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

            if (NameLabel != null)
            {
                string tag = CoreEntity.Rarity != MonsterRarity.Normal ? $" [{CoreEntity.Rarity}]" : "";
                NameLabel.Text = $"{CoreEntity.Name}{tag}";
                NameLabel.Modulate = CoreEntity.Rarity switch
                {
                    MonsterRarity.Champion => new Color(0.3f, 0.7f, 1f),
                    MonsterRarity.Rare => new Color(1f, 0.88f, 0.3f),
                    MonsterRarity.PinnacleBoss => new Color(1f, 0.25f, 0.25f),
                    _ => Colors.White
                };
            }

            if (StaggerBar != null)
            {
                StaggerBar.Visible = CoreEntity.Rarity == MonsterRarity.PinnacleBoss;
            }
        }

        public override void _PhysicsProcess(double delta)
        {
            if (CoreEntity == null || !CoreEntity.IsAlive) return;

            // AI di chuyển: Nếu người chơi ở gần (< 400px), đuổi theo người chơi; nếu không thì lượn lờ ngẫu nhiên
            if (_playerTarget != null && IsInstanceValid(_playerTarget))
            {
                float dist = GlobalPosition.DistanceTo(_playerTarget.GlobalPosition);
                if (dist < 450f && dist > 40f)
                {
                    Vector2 dir = (AcademicAimDirection(_playerTarget.GlobalPosition)).Normalized();
                    Velocity = dir * 110f;
                    MoveAndSlide();

                    if (MonsterSprite != null && dir.X != 0)
                    {
                        MonsterSprite.FlipH = dir.X < 0;
                    }
                }
                else
                {
                    Wander((float)delta);
                }
            }
            else
            {
                Wander((float)delta);
            }

            // Xoay vòng Aura quái tinh anh/boss
            if (AuraRing != null && AuraRing.Visible)
            {
                AuraRing.Rotation += (float)delta * 1.5f;
            }
        }

        private Vector2 AcademicAimDirection(Vector2 target)
        {
            return target - GlobalPosition;
        }

        private void Wander(float delta)
        {
            _wanderTimer -= delta;
            if (_wanderTimer <= 0f)
            {
                var rand = new Random();
                _wanderDir = new Vector2((float)(rand.NextDouble() * 2 - 1), (float)(rand.NextDouble() * 2 - 1)).Normalized();
                _wanderTimer = (float)(rand.NextDouble() * 3 + 2);
            }

            Velocity = _wanderDir * 35f;
            MoveAndSlide();
        }

        public void UpdateHealthDisplay()
        {
            if (CoreEntity != null && HealthBar != null)
            {
                HealthBar.MaxValue = CoreEntity.MaxHealth;
                HealthBar.Value = CoreEntity.CurrentHealth;
            }
        }

        public void TakeHitVisualFeedback(bool isCrit)
        {
            UpdateHealthDisplay();

            if (MonsterSprite != null)
            {
                var flashColor = isCrit ? new Color(2f, 0.4f, 0.4f) : new Color(1.8f, 1.8f, 1.8f);
                MonsterSprite.Modulate = flashColor;

                var tween = CreateTween();
                tween.TweenProperty(MonsterSprite, "modulate", Colors.White, 0.15f);
            }
        }

        public void PlayDeathAnimation()
        {
            SetPhysicsProcess(false);
            if (HealthBar != null) HealthBar.Visible = false;
            if (NameLabel != null) NameLabel.Visible = false;
            if (AuraRing != null) AuraRing.Visible = false;

            var tween = CreateTween();
            tween.SetParallel(true);
            tween.TweenProperty(this, "scale", new Vector2(0.1f, 0.1f), 0.35f);
            tween.TweenProperty(this, "modulate:a", 0.0f, 0.35f);
            tween.SetParallel(false);
            tween.TweenCallback(Callable.From(QueueFree));
        }
    }
}
