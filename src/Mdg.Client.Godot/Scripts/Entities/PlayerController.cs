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
        [Export] public Sprite2D? PlayerSprite { get; set; }
        [Export] public Camera2D? Camera { get; set; }
        [Export] public Label? NameLabel { get; set; }

        public Character? CorePlayer { get; private set; }
        public string ClassSpec { get; private set; } = "Vanguard"; // Vanguard, Arcanist, ShadowRogue, Novice
        public string Gender { get; private set; } = "Male";

        private GameManager? _gameManager;
        private Texture2D? _heroTexture;
        private AtlasTexture? _atlasTexture;

        private float _animTimer = 0f;
        private int _animFrame = 0;
        private bool _isMoving = false;

        public override void _Ready()
        {
            LoadHeroTexture();
        }

        private void LoadHeroTexture()
        {
            _heroTexture = TextureLoader.LoadTexture("res://Assets/aethelis_heroes_classes_pack.jpg", "white")
                ?? TextureLoader.LoadTexture("res://Assets/character_spritesheet.png");

            UpdateHeroSprite();
        }

        public void Initialize(Character character, GameManager gameManager, string classSpec = "Vanguard", string gender = "Male")
        {
            CorePlayer = character ?? throw new ArgumentNullException(nameof(character));
            _gameManager = gameManager ?? throw new ArgumentNullException(nameof(gameManager));
            ClassSpec = classSpec;
            Gender = gender;
            Position = new Vector2(character.Position.X, character.Position.Y);

            UpdateHeroSprite();
            UpdateNameDisplay();
        }

        public void SetClassSpec(string spec, string gender)
        {
            ClassSpec = spec;
            Gender = gender;
            UpdateHeroSprite();
            UpdateNameDisplay();
        }

        private void UpdateHeroSprite()
        {
            if (PlayerSprite == null) return;

            bool isFemale = Gender == "Female";
            string fileName = "hero_novice_male.png";

            if (ClassSpec == "Vanguard")
            {
                fileName = isFemale ? "hero_vanguard_female.png" : "hero_vanguard_male.png";
            }
            else if (ClassSpec == "Arcanist")
            {
                fileName = isFemale ? "hero_arcanist_female.png" : "hero_arcanist_male.png";
            }
            else if (ClassSpec == "ShadowRogue")
            {
                fileName = isFemale ? "hero_shadowrogue_female.png" : "hero_shadowrogue_male.png";
            }
            else
            {
                fileName = isFemale ? "hero_novice_female.png" : "hero_novice_male.png";
            }

            PlayerSprite.Texture = TextureLoader.LoadIndividual("Heroes", fileName);
            PlayerSprite.Scale = new Vector2(0.45f, 0.45f);
            PlayerSprite.Modulate = Colors.White;
        }

        private void UpdateNameDisplay()
        {
            if (NameLabel != null && CorePlayer != null)
            {
                string symbol = Gender == "Male" ? "♂" : "♀";
                NameLabel.Text = $"{symbol} {CorePlayer.Name} [{ClassSpec}]";
                NameLabel.Modulate = ClassSpec switch
                {
                    "Vanguard" => new Color(1f, 0.85f, 0.3f),
                    "Arcanist" => new Color(0.38f, 0.75f, 1f),
                    "ShadowRogue" => new Color(0.85f, 0.45f, 1f),
                    _ => Colors.White
                };
            }
        }

        public void TakeHitVisualFeedback()
        {
            if (PlayerSprite != null)
            {
                var tween = CreateTween();
                tween.TweenProperty(PlayerSprite, "modulate", new Color(1f, 0.25f, 0.25f), 0.05f);
                tween.TweenProperty(PlayerSprite, "modulate", Colors.White, 0.1f);
            }
        }

        private float _slashCd = 0f;
        private float _fireballCd = 0f;
        private float _frostCd = 0f;
        private float _meteorCd = 0f;
        private float _dashCd = 0f;

        public override void _PhysicsProcess(double delta)
        {
            if (CorePlayer == null || _gameManager == null) return;

            // Giảm hồi chiêu kỹ năng
            float dt = (float)delta;
            if (_slashCd > 0f) _slashCd -= dt;
            if (_fireballCd > 0f) _fireballCd -= dt;
            if (_frostCd > 0f) _frostCd -= dt;
            if (_meteorCd > 0f) _meteorCd -= dt;
            if (_dashCd > 0f) _dashCd -= dt;

            // Hồi phục Mana tự nhiên (+15 Mana/giây)
            CorePlayer.RestoreMana(15f * dt);

            // 1. Thu thập input di chuyển
            var inputDir = Input.GetVector("move_left", "move_right", "move_up", "move_down");
            float moveSpeed = CorePlayer.Stats.GetValue(StatType.MovementSpeed);
            if (moveSpeed <= 0f) moveSpeed = 240f;

            Velocity = inputDir * moveSpeed;
            MoveAndSlide();

            _isMoving = inputDir != Vector2.Zero;

            // 2. Cập nhật vị trí và hướng vào Core Entity
            CorePlayer.Position = new FixVector2(Position.X, Position.Y);
            if (_isMoving)
            {
                CorePlayer.Direction = new FixVector2(inputDir.X, inputDir.Y).Normalized;
                if (PlayerSprite != null)
                {
                    if (inputDir.X < 0) PlayerSprite.FlipH = true;
                    else if (inputDir.X > 0) PlayerSprite.FlipH = false;

                    // Hiệu ứng bước đi nhịp nhàng (bobbing)
                    _animTimer += dt * 12f;
                    float bobOffset = MathF.Sin(_animTimer) * 2.5f;
                    PlayerSprite.Position = new Vector2(0, bobOffset);
                }
            }
            else
            {
                if (PlayerSprite != null)
                {
                    PlayerSprite.Position = Vector2.Zero;
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
                if (_slashCd <= 0f)
                {
                    _slashCd = 0.32f;
                    OrientFacing(aimDirection);
                    _gameManager.CastPlayerSkill("slash", mousePos, aimDirection);
                }
            }
            else if (Input.IsActionJustPressed("skill_fireball"))
            {
                const float cost = 15f;
                if (_fireballCd <= 0f)
                {
                    if (CorePlayer.SpendMana(cost))
                    {
                        _fireballCd = 0.6f;
                        OrientFacing(aimDirection);
                        _gameManager.CastPlayerSkill("fireball", mousePos, aimDirection);
                    }
                    else
                    {
                        _gameManager.Hud?.SetCombatStatus("⚠️ Không đủ Mana để bắn Fireball! (Cần 15 MP)");
                    }
                }
            }
            else if (Input.IsActionJustPressed("skill_frostnova"))
            {
                const float cost = 25f;
                if (_frostCd <= 0f)
                {
                    if (CorePlayer.SpendMana(cost))
                    {
                        _frostCd = 2.2f;
                        _gameManager.CastPlayerSkill("frost", GlobalPosition, aimDirection);
                    }
                    else
                    {
                        _gameManager.Hud?.SetCombatStatus("⚠️ Không đủ Mana để giải phóng Frost Nova! (Cần 25 MP)");
                    }
                }
            }
            else if (Input.IsActionJustPressed("skill_meteor"))
            {
                const float cost = 35f;
                if (_meteorCd <= 0f)
                {
                    if (CorePlayer.SpendMana(cost))
                    {
                        _meteorCd = 3.5f;
                        OrientFacing(aimDirection);
                        _gameManager.CastPlayerSkill("meteor", mousePos, aimDirection);
                    }
                    else
                    {
                        _gameManager.Hud?.SetCombatStatus("⚠️ Không đủ Mana để triệu hồi Meteor Strike! (Cần 35 MP)");
                    }
                }
            }
            else if (Input.IsActionJustPressed("skill_dash"))
            {
                const float cost = 10f;
                if (_dashCd <= 0f)
                {
                    if (CorePlayer.SpendMana(cost))
                    {
                        _dashCd = 1.2f;
                        _gameManager.CastPlayerSkill("dash", GlobalPosition + aimDirection * 180f, aimDirection);
                    }
                }
            }
            else if (Input.IsActionJustPressed("flask_1"))
            {
                _gameManager.UsePlayerFlask(1);
            }
            else if (Input.IsActionJustPressed("flask_2"))
            {
                _gameManager.UsePlayerFlask(2);
            }
            else if (Input.IsActionJustPressed("flask_3"))
            {
                _gameManager.UsePlayerFlask(3);
            }
            else if (Input.IsActionJustPressed("flask_4"))
            {
                _gameManager.UsePlayerFlask(4);
            }
        }

        private void OrientFacing(Vector2 aimDir)
        {
            if (PlayerSprite != null && aimDir != Vector2.Zero)
            {
                PlayerSprite.FlipH = aimDir.X < 0;
            }
        }
    }
}
