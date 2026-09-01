using Godot;
using System;

namespace Mdg.Client.Godot.Scripts.World
{
    public partial class PortalView : Area2D
    {
        [Export] public string TargetZone { get; set; } = string.Empty;
        [Export] public Vector2 TargetPosition { get; set; } = Vector2.Zero;
        [Export] public string PortalName { get; set; } = "Portal";

        private Label? _nameLabel;
        private Sprite2D? _portalSprite;
        private bool _isPlayerInside = false;

        public event Action<string, Vector2>? OnPortalTriggered;

        public override void _Ready()
        {
            BodyEntered += OnBodyEntered;
            BodyExited += OnBodyExited;

            _nameLabel = GetNodeOrNull<Label>("NameLabel");
            _portalSprite = GetNodeOrNull<Sprite2D>("Sprite2D");

            if (_nameLabel != null)
            {
                _nameLabel.Text = PortalName;
            }
        }

        public void Setup(string targetZone, Vector2 targetPos, string portalName)
        {
            TargetZone = targetZone;
            TargetPosition = targetPos;
            PortalName = portalName;

            if (_nameLabel != null)
            {
                _nameLabel.Text = portalName;
            }
        }

        public override void _Process(double delta)
        {
            // Hiệu ứng xoay tròn cổng không gian
            if (_portalSprite != null)
            {
                _portalSprite.Rotation += (float)(delta * 2.0);
            }

            // Nhấn F hoặc tự động bước vào cổng
            if (_isPlayerInside && (Input.IsActionJustPressed("interact") || Input.IsActionJustPressed("ui_accept")))
            {
                TriggerPortal();
            }
        }

        private void OnBodyEntered(Node2D body)
        {
            if (body.Name == "Player" || body.IsInGroup("Player"))
            {
                _isPlayerInside = true;
                if (_nameLabel != null)
                {
                    _nameLabel.Text = $"[F] {PortalName}";
                    _nameLabel.Modulate = new Color(1f, 0.9f, 0.2f);
                }
            }
        }

        private void OnBodyExited(Node2D body)
        {
            if (body.Name == "Player" || body.IsInGroup("Player"))
            {
                _isPlayerInside = false;
                if (_nameLabel != null)
                {
                    _nameLabel.Text = PortalName;
                    _nameLabel.Modulate = Colors.White;
                }
            }
        }

        private void TriggerPortal()
        {
            if (!string.IsNullOrEmpty(TargetZone))
            {
                OnPortalTriggered?.Invoke(TargetZone, TargetPosition);
            }
        }
    }
}
