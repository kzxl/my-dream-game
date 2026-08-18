using System;

namespace Mdg.Core.Features.Companion
{
    public sealed class CompanionManager
    {
        public CompanionEntity Companion { get; } = new();

        public (float speedBonus, float armorBonus, float resBonus) GetCurrentAuraBuffs()
        {
            if (Companion.IsDeliveringToTown)
            {
                // No aura while companion is in town selling items
                return (0f, 0f, 0f);
            }

            return Companion.ActiveAura switch
            {
                CompanionAuraType.SwiftWings => (0.15f, 0f, 0f),
                CompanionAuraType.AegisShell => (0f, 0.20f, 0f),
                CompanionAuraType.WardSong => (0f, 0f, 15f),
                _ => (0f, 0f, 0f)
            };
        }

        public void SetAura(CompanionAuraType aura)
        {
            Companion.ActiveAura = aura;
        }
    }
}
