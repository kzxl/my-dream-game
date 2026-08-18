using System;
using System.Collections.Generic;
using Mdg.Core.Features.Items;

namespace Mdg.Core.Features.Seasons
{
    public enum SeasonTheme
    {
        BloodAndIron = 1,  // Season 1: Đấu trường sinh tử & vũ khí biến dị
        AbyssalDepths = 2, // Season 2: Quái vật bóng tối & trang bị bóng tối
        AncientForge = 3   // Season 3: Hầm ngục rèn thánh tích cổ đại
    }

    public sealed class SeasonLeagueEngine
    {
        public SeasonTheme CurrentSeason { get; } = SeasonTheme.BloodAndIron;
        public string SeasonName => "Season 1: Blood & Iron";
        public bool IsEventActive { get; private set; } = false;
        public int RemainingEventSeconds { get; private set; } = 0;

        private static readonly List<string> _corruptedImplicits = new()
        {
            "+1 to Level of All Skill Gems",
            "+35% to Global Critical Strike Multiplier",
            "+5% Additional Physical Damage Reduction",
            "Gain 15% of Physical Damage as Extra Fire Damage",
            "+1 to Maximum Frenzy Charges / Combat Focus"
        };

        private readonly Random _rng;

        public SeasonLeagueEngine(Random? rng = null)
        {
            _rng = rng ?? new Random();
        }

        public bool TriggerTemporalObelisk(out string message)
        {
            if (IsEventActive)
            {
                message = "A Temporal Obelisk event is already in progress!";
                return false;
            }

            IsEventActive = true;
            RemainingEventSeconds = 45;
            message = "Temporal Obelisk activated! Survive the 45-second mutated monster surge!";
            return true;
        }

        public void TickEvent(int deltaSeconds)
        {
            if (!IsEventActive) return;

            RemainingEventSeconds -= deltaSeconds;
            if (RemainingEventSeconds <= 0)
            {
                IsEventActive = false;
                RemainingEventSeconds = 0;
            }
        }

        public bool TryCorruptItem(ItemEntity item, out string message)
        {
            if (item.Rarity == ItemRarity.Currency)
            {
                message = "Currency cannot be corrupted.";
                return false;
            }

            int roll = _rng.Next(100);

            if (roll < 50)
            {
                // Successful mutation: Add Tier 0 Corrupted Implicit
                string chosenMod = _corruptedImplicits[_rng.Next(_corruptedImplicits.Count)];
                item.AddMod($"[Corrupted T0] {chosenMod}");
                message = $"Item successfully corrupted with ancient power: {chosenMod}!";
                return true;
            }
            else
            {
                // Neutral corruption (Item becomes unmodifiable but stats remain)
                item.AddMod("[Corrupted] Unmodifiable");
                message = "Item was corrupted without mutating new affixes.";
                return true;
            }
        }
    }
}
