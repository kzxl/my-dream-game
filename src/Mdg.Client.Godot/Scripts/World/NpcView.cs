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

            string nameLower = (NpcName + " " + NpcTitle).ToLowerInvariant();
            string fileName = "npc_priestess.png";

            if (nameLower.Contains("smith") || nameLower.Contains("doran") || nameLower.Contains("lisbeth"))
            {
                fileName = "npc_lisbeth.png"; // Thợ rèn Lisbeth
            }
            else if (nameLower.Contains("merchant") || nameLower.Contains("trader") || nameLower.Contains("shop"))
            {
                fileName = "npc_merchant.png"; // Thương gia Haven
            }
            else if (nameLower.Contains("elder") || nameLower.Contains("verin") || nameLower.Contains("sage") || nameLower.Contains("aethel"))
            {
                fileName = "npc_elder_verin.png"; // Trưởng lão Verin
            }
            else if (nameLower.Contains("alchemist") || nameLower.Contains("elina") || nameLower.Contains("potion"))
            {
                fileName = "npc_alchemist_elina.png"; // Nhà giả kim Elina
            }
            else if (nameLower.Contains("hunter") || nameLower.Contains("captain") || nameLower.Contains("valen"))
            {
                fileName = "npc_hunter_valen.png"; // Thuyền trưởng thợ săn Valen
            }
            else if (nameLower.Contains("lore") || nameLower.Contains("astromancer") || nameLower.Contains("lyra"))
            {
                fileName = "npc_lorekeeper_lyra.png"; // Học giả chiêm tinh Lyra
            }
            else if (nameLower.Contains("guard") || nameLower.Contains("kaelen") || nameLower.Contains("vault") || nameLower.Contains("stash"))
            {
                fileName = "npc_guard_kaelen.png"; // Thủ kho Kaelen
            }

            _npcSprite.Texture = TextureLoader.LoadIndividual("Npcs", fileName);
            _npcSprite.Scale = new Vector2(0.5f, 0.5f);
            _npcSprite.Offset = new Vector2(0, -18);
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
