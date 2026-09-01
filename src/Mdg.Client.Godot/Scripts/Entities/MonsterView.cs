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

        [Export] public float AttackRange { get; set; } = 48f;
        [Export] public float AttackCooldown { get; set; } = 1.3f;
        [Export] public float AttackDamage { get; set; } = 20f;
        [Export] public string AttackDamageType { get; set; } = "physical";

        private Node2D? _playerTarget;
        private Core.GameManager? _gameManager;
        private Texture2D? _monstersTexture;
        private AtlasTexture? _atlasTexture;

        private float _hurtTimer = 0f;
        private float _freezeTimer = 0f;
        private float _attackCooldownTimer = 0f;
        private float _wanderTimer = 0f;
        private Vector2 _wanderDir = Vector2.Zero;
        private float _animTimer = 0f;

        public void Initialize(MonsterEntity entity, FixVector2 spawnPos, Core.GameManager? gameManager = null, Node2D? playerTarget = null)
        {
            CoreEntity = entity ?? throw new ArgumentNullException(nameof(entity));
            MonsterId = entity.Id;
            Position = new Vector2(spawnPos.X, spawnPos.Y);
            _gameManager = gameManager;
            _playerTarget = playerTarget;

            string nameLower = entity.Name.ToLowerInvariant();
            if (nameLower.Contains("imp") || nameLower.Contains("eye") || nameLower.Contains("spectre"))
            {
                AttackRange = 220f;
                AttackDamage = 26f;
                AttackDamageType = nameLower.Contains("imp") ? "fire" : "chaos";
                AttackCooldown = 1.6f;
            }
            else if (nameLower.Contains("wolf") || nameLower.Contains("hound"))
            {
                AttackRange = 45f;
                AttackDamage = 22f;
                AttackDamageType = "physical";
                AttackCooldown = 1.1f;
            }
            else if (nameLower.Contains("golem") || nameLower.Contains("frost"))
            {
                AttackRange = 55f;
                AttackDamage = 35f;
                AttackDamageType = nameLower.Contains("frost") ? "cold" : "fire";
                AttackCooldown = 1.5f;
            }
            else if (entity.Rarity == MonsterRarity.PinnacleBoss)
            {
                AttackRange = 65f;
                AttackDamage = 55f;
                AttackDamageType = "chaos";
                AttackCooldown = 1.0f;
            }

            SetupMonsterSprite();
            UpdateHealthDisplay();
        }

        private void SetupMonsterSprite()
        {
            if (CoreEntity == null || MonsterSprite == null) return;

            string nameLower = CoreEntity.Name.ToLowerInvariant();
            float scaleMultiplier = 1.0f;
            string fileName = "monster_goblin.png";

            if (CoreEntity.Rarity == MonsterRarity.PinnacleBoss)
            {
                if (nameLower.Contains("cryomancer") || nameLower.Contains("vael") || nameLower.Contains("frost")) fileName = "boss_vael.png";
                else if (nameLower.Contains("ignis") || nameLower.Contains("tyrant") || nameLower.Contains("magma") || nameLower.Contains("fire")) fileName = "boss_ignis.png";
                else if (nameLower.Contains("drake") || nameLower.Contains("dragon") || nameLower.Contains("storm")) fileName = "boss_drake.png";
                else fileName = "boss_malakor.png";

                MonsterSprite.Scale = new Vector2(0.65f, 0.65f);
                scaleMultiplier = 1.7f;
            }
            else if (nameLower.Contains("spectre") || nameLower.Contains("chaos") || nameLower.Contains("tentacle") || nameLower.Contains("stalker") || nameLower.Contains("void"))
            {
                if (nameLower.Contains("chaos") || nameLower.Contains("eye")) fileName = "monster_chaos_eye.png";
                else if (nameLower.Contains("tentacle")) fileName = "monster_tentacle_fiend.png";
                else if (nameLower.Contains("stalker") || nameLower.Contains("horror")) fileName = "monster_horror_stalker.png";
                else fileName = "monster_void_spectre.png";

                MonsterSprite.Scale = new Vector2(0.5f, 0.5f);
                scaleMultiplier = 1.25f;
            }
            else if (nameLower.Contains("drake") || nameLower.Contains("salamander") || nameLower.Contains("serpent") || nameLower.Contains("roc"))
            {
                if (nameLower.Contains("salamander")) fileName = "monster_fire_salamander.png";
                else if (nameLower.Contains("serpent")) fileName = "monster_crystal_serpent.png";
                else if (nameLower.Contains("roc")) fileName = "monster_thunder_roc.png";
                else fileName = "monster_storm_drake.png";

                MonsterSprite.Scale = new Vector2(0.5f, 0.5f);
                scaleMultiplier = 1.2f;
            }
            else
            {
                if (nameLower.Contains("imp") || nameLower.Contains("cinder")) fileName = "monster_fire_imp.png";
                else if (nameLower.Contains("wraith")) fileName = "monster_void_wraith.png";
                else if (nameLower.Contains("skeleton") || nameLower.Contains("undead")) fileName = "monster_skeleton.png";
                else if (nameLower.Contains("wolf") || nameLower.Contains("hound")) fileName = "monster_wolf.png";
                else if (nameLower.Contains("scorpion") || nameLower.Contains("golem")) fileName = "monster_scorpion.png";
                else if (nameLower.Contains("goblin")) fileName = "monster_goblin.png";
                else if (nameLower.Contains("spider")) fileName = "monster_spider.png";
                else fileName = "monster_dreadknight.png";

                MonsterSprite.Scale = new Vector2(0.48f, 0.48f);
                scaleMultiplier = CoreEntity.Rarity == MonsterRarity.Champion ? 1.15f : (CoreEntity.Rarity == MonsterRarity.Rare ? 1.3f : 1.0f);
            }

            MonsterSprite.Texture = TextureLoader.LoadIndividual("Monsters", fileName);
            MonsterSprite.Offset = new Vector2(0, -15);

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

                NameLabel.Text = $"[Lv.{CoreEntity.Level}] {rarityPrefix}{CoreEntity.Name}";
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

        public void Freeze(float duration)
        {
            _freezeTimer = duration;
            if (MonsterSprite != null)
            {
                MonsterSprite.Modulate = new Color(0.2f, 0.85f, 1f);
            }
        }

        public override void _PhysicsProcess(double delta)
        {
            if (CoreEntity == null || !CoreEntity.IsAlive) return;

            if (_hurtTimer > 0f)
            {
                _hurtTimer -= (float)delta;
            }

            if (_freezeTimer > 0f)
            {
                _freezeTimer -= (float)delta;
                if (_freezeTimer <= 0f && MonsterSprite != null)
                {
                    MonsterSprite.Modulate = Colors.White;
                }
                return; // Khi bị đóng băng: không di chuyển, không tấn công
            }

            // AI di chuyển
            ProcessMonsterAI((float)delta);
        }

        private void ProcessMonsterAI(float delta)
        {
            if (_playerTarget == null || !IsInstanceValid(_playerTarget)) return;

            if (_attackCooldownTimer > 0f)
            {
                _attackCooldownTimer -= delta;
            }

            float distToPlayer = GlobalPosition.DistanceTo(_playerTarget.GlobalPosition);

            // 1. Nếu người chơi trong tầm đánh -> Đứng lại tấn công
            if (distToPlayer <= AttackRange)
            {
                Velocity = Vector2.Zero;

                if (MonsterSprite != null)
                {
                    MonsterSprite.FlipH = _playerTarget.GlobalPosition.X < GlobalPosition.X;
                }

                if (_attackCooldownTimer <= 0f && CoreEntity != null && CoreEntity.IsAlive)
                {
                    ExecuteAttackAgainstPlayer();
                }
            }
            else if (distToPlayer < 450f)
            {
                // 2. Đuổi theo người chơi
                Vector2 dir = (_playerTarget.GlobalPosition - GlobalPosition).Normalized();
                Velocity = dir * 95f;
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
                // 3. Đi lang thang tự do (Wander)
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

        private void ExecuteAttackAgainstPlayer()
        {
            _attackCooldownTimer = AttackCooldown;

            // Hiệu ứng nhào tới tấn công (Lunge attack)
            if (MonsterSprite != null)
            {
                var tween = CreateTween();
                Vector2 lungeDir = (_playerTarget != null && IsInstanceValid(_playerTarget))
                    ? (_playerTarget.GlobalPosition - GlobalPosition).Normalized() * 12f
                    : Vector2.Zero;

                tween.TweenProperty(MonsterSprite, "position", lungeDir, 0.08f);
                tween.TweenProperty(MonsterSprite, "position", Vector2.Zero, 0.12f);
            }

            float finalDmg = CoreEntity != null ? CoreEntity.BaseDamage : AttackDamage;
            _gameManager?.MonsterAttackPlayer(this, CoreEntity, finalDmg, AttackDamageType);
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
