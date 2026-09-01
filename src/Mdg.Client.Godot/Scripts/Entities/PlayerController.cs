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
            if (_heroTexture == null || PlayerSprite == null) return;

            float totalW = _heroTexture.GetWidth();
            float totalH = _heroTexture.GetHeight();
            float cellW = totalW / 4f;
            float cellH = totalH / 2f;

            bool isFemale = Gender == "Female";
            int col = 0, row = 0;

            if (ClassSpec == "Vanguard")
            {
                col = isFemale ? 3 : 2; row = 0;
            }
            else if (ClassSpec == "Arcanist")
            {
                col = isFemale ? 1 : 0; row = 1;
            }
            else if (ClassSpec == "ShadowRogue")
            {
                col = isFemale ? 3 : 2; row = 1;
            }
            else
            {
                col = isFemale ? 1 : 0; row = 0;
            }

            _atlasTexture = new AtlasTexture
            {
                Atlas = _heroTexture,
                Region = new Rect2(col * cellW, row * cellH, cellW, cellH)
            };

            PlayerSprite.Texture = _atlasTexture;
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

        public override void _PhysicsProcess(double delta)
        {
            if (CorePlayer == null || _gameManager == null) return;

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
                    _animTimer += (float)delta * 12f;
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
                _gameManager.CastPlayerSkill("slash", mousePos, aimDirection);
            }
            else if (Input.IsActionJustPressed("skill_fireball"))
            {
                _gameManager.CastPlayerSkill("fireball", mousePos, aimDirection);
            }
            else if (Input.IsActionJustPressed("skill_frostnova"))
            {
                _gameManager.CastPlayerSkill("frost", GlobalPosition, aimDirection);
            }
            else if (Input.IsActionJustPressed("skill_meteor"))
            {
                _gameManager.CastPlayerSkill("meteor", mousePos, aimDirection);
            }
            else if (Input.IsActionJustPressed("skill_dash"))
            {
                _gameManager.CastPlayerSkill("dash", GlobalPosition + aimDirection * 180f, aimDirection);
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
    }
}
