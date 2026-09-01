using Godot;
using System;
using Mdg.Core.Common.Math;
using Mdg.Core.Features.Combat;

namespace Mdg.Client.Godot.Scripts.Entities
{
    public partial class MonsterView : CharacterBody2D
    {
        [Export] public Sprite2D MonsterSprite { get; set; } = default!;
        [Export] public ProgressBar HealthBar { get; set; } = default!;
        [Export] public Label NameLabel { get; set; } = default!;

        public Guid MonsterId { get; private set; }
        public MonsterEntity? CoreEntity { get; private set; }

        public void Initialize(MonsterEntity entity, FixVector2 spawnPos)
        {
            CoreEntity = entity ?? throw new ArgumentNullException(nameof(entity));
            MonsterId = entity.Id;
            Position = new Vector2(spawnPos.X, spawnPos.Y);

            if (NameLabel != null)
            {
                NameLabel.Text = $"{entity.Name} [{entity.Rarity}]";
                NameLabel.Modulate = entity.Rarity switch
                {
                    MonsterRarity.Champion => new Color(0.3f, 0.6f, 1f),
                    MonsterRarity.Rare => new Color(1f, 0.85f, 0.2f),
                    MonsterRarity.PinnacleBoss => new Color(0.9f, 0.2f, 0.2f),
                    _ => Colors.White
                };
            }

            UpdateHealthDisplay();
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

            // Hiệu ứng nhấp nháy đỏ/trắng khi bị đánh trúng
            if (MonsterSprite != null)
            {
                var flashColor = isCrit ? new Color(2f, 0.5f, 0.5f) : new Color(1.8f, 1.8f, 1.8f);
                MonsterSprite.Modulate = flashColor;

                var tween = CreateTween();
                tween.TweenProperty(MonsterSprite, "modulate", Colors.White, 0.15f);
            }
        }

        public void PlayDeathAnimation()
        {
            var tween = CreateTween();
            tween.SetParallel(true);
            tween.TweenProperty(this, "scale", new Vector2(0.1f, 0.1f), 0.35f);
            tween.TweenProperty(this, "modulate:a", 0.0f, 0.35f);
            tween.SetParallel(false);
            tween.TweenCallback(Callable.From(QueueFree));
        }
    }
}
