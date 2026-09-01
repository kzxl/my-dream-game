using Godot;
using System;
using Mdg.Core.Features.Items;

namespace Mdg.Client.Godot.Scripts.Combat
{
    public partial class GroundLootView : Area2D
    {
        [Export] public Label? ItemLabel { get; set; }
        [Export] public Line2D? LootBeam { get; set; }

        public string ItemId { get; private set; } = string.Empty;
        public string ItemName { get; private set; } = "Item";
        public string Rarity { get; private set; } = "Normal";
        public int GoldAmount { get; private set; } = 0;

        public event Action<GroundLootView>? OnLootPickedUp;

        private bool _isPlayerInside = false;

        public override void _Ready()
        {
            BodyEntered += OnBodyEntered;
            BodyExited += OnBodyExited;
        }

        public void Setup(string itemId, string name, string rarity, int goldAmount = 0)
        {
            ItemId = itemId;
            ItemName = name;
            Rarity = rarity;
            GoldAmount = goldAmount;

            var rarityColor = rarity switch
            {
                "Magic" => new Color(0.3f, 0.6f, 1f),
                "Rare" => new Color(1f, 0.85f, 0.2f),
                "Unique" => new Color(0.9f, 0.45f, 0.1f),
                "Currency" => new Color(0.85f, 0.75f, 0.5f),
                _ => Colors.White
            };

            if (goldAmount > 0)
            {
                ItemName = $"🪙 {goldAmount} Vàng";
                rarityColor = new Color(1f, 0.85f, 0.2f);
            }

            if (ItemLabel != null)
            {
                ItemLabel.Text = ItemName;
                ItemLabel.Modulate = rarityColor;
            }

            if (LootBeam != null)
            {
                LootBeam.Visible = rarity == "Rare" || rarity == "Unique" || goldAmount > 50;
                LootBeam.DefaultColor = rarityColor;
            }
        }

        public override void _Process(double delta)
        {
            if (_isPlayerInside && (Input.IsActionJustPressed("interact") || Input.IsActionJustPressed("ui_accept")))
            {
                PickUp();
            }
        }

        public void PickUp()
        {
            OnLootPickedUp?.Invoke(this);

            var tween = CreateTween();
            tween.SetParallel(true);
            tween.TweenProperty(this, "position:y", Position.Y - 20f, 0.2f);
            tween.TweenProperty(this, "modulate:a", 0.0f, 0.2f);
            tween.SetParallel(false);
            tween.TweenCallback(Callable.From(QueueFree));
        }

        private void OnBodyEntered(Node2D body)
        {
            if (body.Name == "Player" || body.IsInGroup("Player"))
            {
                _isPlayerInside = true;
                if (ItemLabel != null)
                {
                    ItemLabel.Text = $"[F] {ItemName}";
                }
            }
        }

        private void OnBodyExited(Node2D body)
        {
            if (body.Name == "Player" || body.IsInGroup("Player"))
            {
                _isPlayerInside = false;
                if (ItemLabel != null)
                {
                    ItemLabel.Text = ItemName;
                }
            }
        }
    }
}
