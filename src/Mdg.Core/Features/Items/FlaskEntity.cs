using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Items
{
    public enum FlaskType
    {
        Life = 0,
        Mana = 1,
        Quicksilver = 2,
        Granite = 3,
        Diamond = 4
    }

    public sealed class FlaskEntity
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public FlaskType Type { get; set; }
        public int CurrentCharges { get; set; }
        public int MaxCharges { get; set; }
        public int ChargesPerUse { get; set; }
        public float Duration { get; set; }
        public string Icon { get; set; } = "🧪";
        public string Color { get; set; } = "#ff4d4f";
        public List<string> Modifiers { get; set; } = new();

        public FlaskEntity(string id, string name, FlaskType type, int maxCharges, int chargesPerUse, float duration, string icon, string color)
        {
            Id = id;
            Name = name;
            Type = type;
            MaxCharges = maxCharges;
            CurrentCharges = maxCharges;
            ChargesPerUse = chargesPerUse;
            Duration = duration;
            Icon = icon;
            Color = color;
        }

        public bool CanConsume()
        {
            return CurrentCharges >= ChargesPerUse;
        }

        public bool TryConsume(out string message)
        {
            if (!CanConsume())
            {
                message = $"Not enough charges ({CurrentCharges}/{ChargesPerUse}). Defeat monsters to refill.";
                return false;
            }

            CurrentCharges -= ChargesPerUse;
            message = $"Consumed {Name} (Duration: {Duration}s). Remaining charges: {CurrentCharges}/{MaxCharges}.";
            return true;
        }

        public void AddCharges(int amount)
        {
            if (amount <= 0) return;
            CurrentCharges = Math.Min(MaxCharges, CurrentCharges + amount);
        }
    }
}
