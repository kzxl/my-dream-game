using Godot;
using System;
using Mdg.Client.Godot.Scripts.Common;

namespace Mdg.Client.Godot.Scripts.World
{
    public partial class ShrineView : Area2D
    {
        [Export] public string ShrineId { get; set; } = string.Empty;
        [Export] public string ShrineName { get; set; } = "Celestial Shrine";
        [Export] public string BuffType { get; set; } = "TempestAura";
        [Export] public float BuffDuration { get; set; } = 60f;
        [Export] public bool IsActivated { get; set; } = false;

        private Label? _nameLabel;
        private Sprite2D? _shrineSprite;
        private bool _isPlayerInside = false;
        private Texture2D? _shrineTexture;

        public event Action<ShrineView>? OnShrineActivated;

        public override void _Ready()
        {
            BodyEntered += OnBodyEntered;
            BodyExited += OnBodyExited;

            _nameLabel = GetNodeOrNull<Label>("NameLabel");
            _shrineSprite = GetNodeOrNull<Sprite2D>("Sprite2D");

            _shrineTexture = TextureLoader.LoadTexture("res://Assets/shrines_monoliths_pack.jpg", "black")
                ?? TextureLoader.LoadTexture("res://Assets/props_interactive_grid.png", "black");

            UpdateShrineVisuals();
            UpdateDisplay();
        }

        public void Setup(string id, string name, string buffType, float duration, Color color)
        {
            ShrineId = id;
            ShrineName = name;
            BuffType = buffType;
            BuffDuration = duration;

            UpdateShrineVisuals();
            UpdateDisplay();
        }

        private void UpdateShrineVisuals()
        {
            if (_shrineSprite == null) return;

            string keyLower = (ShrineId + " " + ShrineName + " " + BuffType).ToLowerInvariant();

            if (keyLower.Contains("cave") || keyLower.Contains("dungeon"))
            {
                _shrineSprite.Texture = TextureLoader.LoadTexture("res://Assets/PixelCrawler/Environment/Props/Static/Dungeon_Props.png");
            }
            else
            {
                _shrineSprite.Texture = TextureLoader.LoadTexture("res://Assets/PixelCrawler/Environment/Props/Static/Esoteric.png")
                    ?? TextureLoader.LoadPropTexture("alchemy");
            }

            _shrineSprite.Scale = new Vector2(1.5f, 1.5f);
            _shrineSprite.Offset = new Vector2(0, -10);
        }

        public override void _Process(double delta)
        {
            if (_isPlayerInside && !IsActivated && Input.IsActionJustPressed("interact"))
            {
                ActivateShrine();
            }
        }

        private void OnBodyEntered(Node2D body)
        {
            if (body.Name == "Player" || body.IsInGroup("Player"))
            {
                _isPlayerInside = true;
                UpdateDisplay();
            }
        }

        private void OnBodyExited(Node2D body)
        {
            if (body.Name == "Player" || body.IsInGroup("Player"))
            {
                _isPlayerInside = false;
                UpdateDisplay();
            }
        }

        private void ActivateShrine()
        {
            IsActivated = true;
            UpdateDisplay();

            // Hiệu ứng phát sáng kích hoạt
            if (_shrineSprite != null)
            {
                var tween = CreateTween();
                tween.TweenProperty(_shrineSprite, "modulate:a", 0.4f, 0.5f);
            }

            OnShrineActivated?.Invoke(this);
        }

        private void UpdateDisplay()
        {
            if (_nameLabel != null)
            {
                if (IsActivated)
                {
                    _nameLabel.Text = $"{ShrineName} (Đã nhận)";
                    _nameLabel.Modulate = new Color(0.6f, 0.6f, 0.6f);
                }
                else if (_isPlayerInside)
                {
                    _nameLabel.Text = $"[F] Cầu nguyện {ShrineName}";
                    _nameLabel.Modulate = new Color(1f, 0.9f, 0.2f);
                }
                else
                {
                    _nameLabel.Text = ShrineName;
                    _nameLabel.Modulate = Colors.White;
                }
            }
        }
    }
}
