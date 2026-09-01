using Godot;
using System;
using Mdg.Client.Godot.Scripts.Common;
using Mdg.Client.Godot.Scripts.Core;
using Mdg.Core.Common.Math;
using Mdg.Core.Entities;
using Mdg.Core.Events.DomainEvents;
using Mdg.Core.Features.Combat;
using Mdg.Core.Features.Stats;

namespace Mdg.Client.Godot.Scripts.Entities
{
    public partial class PlayerController : CharacterBody2D
    {
        [Export] public Sprite2D PlayerSprite { get; set; } = default!;
        [Export] public Camera2D Camera { get; set; } = default!;

        public Character? CorePlayer { get; private set; }
        private GameManager? _gameManager;

        public void Initialize(Character character, GameManager gameManager)
        {
            CorePlayer = character ?? throw new ArgumentNullException(nameof(character));
            _gameManager = gameManager ?? throw new ArgumentNullException(nameof(gameManager));
            Position = new Vector2(character.Position.X, character.Position.Y);
        }

        public override void _PhysicsProcess(double delta)
        {
            if (CorePlayer == null || _gameManager == null) return;

            // 1. Thu thập input di chuyển
            var inputDir = Input.GetVector("move_left", "move_right", "move_up", "move_down");
            float moveSpeed = CorePlayer.Stats.GetValue(StatType.MovementSpeed);
            if (moveSpeed <= 0f) moveSpeed = 220f;

            Velocity = inputDir * moveSpeed;
            MoveAndSlide();

            // 2. Cập nhật vị trí và hướng vào Core Entity
            CorePlayer.Position = new FixVector2(Position.X, Position.Y);
            if (inputDir != Vector2.Zero)
            {
                CorePlayer.Direction = new FixVector2(inputDir.X, inputDir.Y).Normalized;
                if (PlayerSprite != null)
                {
                    // Lật sprite theo hướng di chuyển ngang
                    if (inputDir.X < 0) PlayerSprite.FlipH = true;
                    else if (inputDir.X > 0) PlayerSprite.FlipH = false;
                }
            }

            // 3. Xử lý Input Tấn công & Skill
            HandleCombatInput();
        }

        private void HandleCombatInput()
        {
            if (_gameManager == null || CorePlayer == null) return;

            var mousePos = GetGlobalMousePosition();
            var aimDirection = (mousePos - GlobalPosition).Normalized();

            if (Input.IsActionJustPressed("attack_primary"))
            {
                ExecuteSlashAttack(mousePos);
            }
            else if (Input.IsActionJustPressed("skill_fireball"))
            {
                ExecuteFireball(mousePos, aimDirection);
            }
            else if (Input.IsActionJustPressed("skill_frostnova"))
            {
                ExecuteFrostNova();
            }
            else if (Input.IsActionJustPressed("skill_dash"))
            {
                ExecuteDash(aimDirection);
            }
        }

        private void ExecuteSlashAttack(Vector2 targetPos)
        {
            if (_gameManager == null || CorePlayer == null) return;

            // Tạo Damage Payload cho đòn đánh thường
            float baseDmg = CorePlayer.Stats.GetValue(StatType.PhysicalDamage);
            if (baseDmg <= 0) baseDmg = 35f;

            var payload = new DamagePayload(
                attackerId: CorePlayer.Id,
                portions: new[] { new DamagePortion(DamageType.Physical, baseDmg) },
                accuracyRating: CorePlayer.Stats.GetValue(StatType.Accuracy),
                critChance: CorePlayer.Stats.GetValue(StatType.CritChance),
                critMultiplier: CorePlayer.Stats.GetValue(StatType.CritMultiplier)
            );

            // Bắn event SkillExecuted
            _gameManager.EventBus.Publish(new SkillExecutedEvent
            {
                CasterId = CorePlayer.Id,
                SkillId = "slash_cleave",
                TargetPosition = new FixVector2(targetPos.X, targetPos.Y)
            });

            // Quét mục tiêu trong bán kính chém 90px
            _gameManager.ApplyAreaDamage(Position.ToFixVector2(), 90f, payload);
        }

        private void ExecuteFireball(Vector2 targetPos, Vector2 direction)
        {
            if (_gameManager == null || CorePlayer == null) return;

            float fireDmg = 65f;
            var payload = new DamagePayload(
                attackerId: CorePlayer.Id,
                portions: new[] { new DamagePortion(DamageType.Fire, fireDmg) },
                accuracyRating: 500f,
                critChance: 15f,
                critMultiplier: 180f
            );

            _gameManager.EventBus.Publish(new SkillExecutedEvent
            {
                CasterId = CorePlayer.Id,
                SkillId = "pyro_fireball",
                TargetPosition = new FixVector2(targetPos.X, targetPos.Y)
            });

            // Gây sát thương tại vị trí target của Fireball (bán kính nổ 110px)
            _gameManager.ApplyAreaDamage(targetPos.ToFixVector2(), 110f, payload);
        }

        private void ExecuteFrostNova()
        {
            if (_gameManager == null || CorePlayer == null) return;

            float coldDmg = 45f;
            var payload = new DamagePayload(
                attackerId: CorePlayer.Id,
                portions: new[] { new DamagePortion(DamageType.Cold, coldDmg) },
                accuracyRating: 500f,
                critChance: 25f,
                critMultiplier: 150f
            );

            _gameManager.EventBus.Publish(new SkillExecutedEvent
            {
                CasterId = CorePlayer.Id,
                SkillId = "frost_nova",
                TargetPosition = CorePlayer.Position
            });

            // Vòng tròn băng xung quanh người chơi bán kính 160px
            _gameManager.ApplyAreaDamage(Position.ToFixVector2(), 160f, payload);
        }

        private void ExecuteDash(Vector2 direction)
        {
            if (direction == Vector2.Zero)
            {
                direction = PlayerSprite != null && PlayerSprite.FlipH ? Vector2.Left : Vector2.Right;
            }

            Position += direction * 150f;
            if (CorePlayer != null)
            {
                CorePlayer.Position = Position.ToFixVector2();
            }
        }
    }
}
