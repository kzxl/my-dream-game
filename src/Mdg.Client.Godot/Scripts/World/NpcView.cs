using Godot;
using System;
using Mdg.Client.Godot.Scripts.Common;

namespace Mdg.Client.Godot.Scripts.World
{
    public partial class NpcView : Area2D
    {
        [Export] public string NpcName { get; set; } = "Luna";
        [Export] public string NpcTitle { get; set; } = "Arcane Scholar";
        [Export] public string DialogText { get; set; } = "Chào mừng dũng sĩ đến với thánh địa Aethelis!";

        private Label? _nameLabel;
        private Sprite2D? _npcSprite;
        private bool _isPlayerInside = false;
        private Texture2D? _npcTexture;

        public event Action<NpcView>? OnNpcInteracted;

        public override void _Ready()
        {
            BodyEntered += OnBodyEntered;
            BodyExited += OnBodyExited;

            _nameLabel = GetNodeOrNull<Label>("NameLabel");
            _npcSprite = GetNodeOrNull<Sprite2D>("Sprite2D");

            _npcTexture = TextureLoader.LoadTexture("res://Assets/aethelis_npcs_pack.jpg", "white")
                ?? TextureLoader.LoadTexture("res://Assets/npcs_pack.png");

            UpdateNpcVisuals();
            UpdateDisplay();
        }

        public void Setup(string name, string title, Color color, string dialog)
        {
            NpcName = name;
            NpcTitle = title;
            DialogText = dialog;

            UpdateNpcVisuals();
            UpdateDisplay();
        }

        private void UpdateNpcVisuals()
        {
            if (_npcSprite == null) return;

            _npcSprite.Texture = TextureLoader.LoadNpcTexture(NpcName + " " + NpcTitle);
            _npcSprite.Scale = new Vector2(1.5f, 1.5f);
            _npcSprite.Offset = new Vector2(0, -10);
        }

        public override void _Process(double delta)
        {
            if (_isPlayerInside && Input.IsActionJustPressed("interact"))
            {
                OnNpcInteracted?.Invoke(this);
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

        private void UpdateDisplay()
        {
            if (_nameLabel != null)
            {
                if (_isPlayerInside)
                {
                    _nameLabel.Text = $"[F] Trò chuyện {NpcName} <{NpcTitle}>";
                    _nameLabel.Modulate = new Color(1f, 0.9f, 0.2f);
                }
                else
                {
                    _nameLabel.Text = $"{NpcName}\n<{NpcTitle}>";
                    _nameLabel.Modulate = new Color(0.9f, 0.9f, 0.6f);
                }
            }
        }
    }
}
