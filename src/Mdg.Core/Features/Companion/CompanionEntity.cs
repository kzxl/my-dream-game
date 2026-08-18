using System;
using System.Collections.Generic;
using Mdg.Core.Features.Items;

namespace Mdg.Core.Features.Companion
{
    public enum CompanionAuraType
    {
        None = 0,
        SwiftWings = 1,   // +15% Movement Speed
        AegisShell = 2,   // +20% Armor & Physical Mitigation
        WardSong = 3      // +15% All Elemental & Chaos Resistances
    }

    public sealed class CompanionEntity
    {
        public string Name { get; set; } = "Genesis Sprite";
        public string Species { get; set; } = "Celestial Wisp";
        public CompanionAuraType ActiveAura { get; set; } = CompanionAuraType.SwiftWings;
        
        public bool AutoLootCurrency { get; set; } = true;
        public bool AutoLootGems { get; set; } = true;
        public bool AutoLootRares { get; set; } = false;
        
        public float PickupRadius { get; set; } = 350f; // Pixels radius
        public List<ItemEntity> MuleBackpack { get; } = new(8); // 8 slots companion bag

        public bool IsDeliveringToTown { get; set; } = false;
        public float DeliveryTimerSeconds { get; set; } = 0f;
        public const float DELIVERY_DURATION = 20f; // 20 seconds to return from town

        public int GoldOrCurrencyEarnedFromLastTrip { get; set; } = 0;

        public void SendToTownToSellJunk()
        {
            if (MuleBackpack.Count == 0 || IsDeliveringToTown) return;

            IsDeliveringToTown = true;
            DeliveryTimerSeconds = DELIVERY_DURATION;
        }

        public bool UpdateDeliveryTick(float deltaTime, out int earnedCurrency)
        {
            earnedCurrency = 0;
            if (!IsDeliveringToTown) return false;

            DeliveryTimerSeconds -= deltaTime;
            if (DeliveryTimerSeconds <= 0f)
            {
                IsDeliveringToTown = false;
                DeliveryTimerSeconds = 0f;
                
                // Convert junk items to currency (e.g. 1 Aether Spark per 2 junk items, minimum 1)
                earnedCurrency = Math.Max(1, MuleBackpack.Count / 2);
                GoldOrCurrencyEarnedFromLastTrip = earnedCurrency;
                MuleBackpack.Clear();
                return true;
            }

            return false;
        }
    }
}
