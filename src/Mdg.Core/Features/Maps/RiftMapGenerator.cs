using System;
using System.Collections.Generic;
using System.Linq;
using Mdg.Core.Features.Items;

namespace Mdg.Core.Features.Maps
{
    public sealed class RiftMapGenerator
    {
        private static readonly List<RiftMapAffix> _affixPool = new()
        {
            new RiftMapAffix("extra_fire", "Monsters deal +40% Extra Damage as Fire", 20f, 25f),
            new RiftMapAffix("extra_cold", "Monsters deal +40% Extra Damage as Cold", 20f, 25f),
            new RiftMapAffix("extra_lightning", "Monsters deal +40% Extra Damage as Lightning", 20f, 25f),
            new RiftMapAffix("pack_size", "+30% Monster Pack Size & +20% Magic Monsters", 15f, 30f, 30f),
            new RiftMapAffix("minus_res", "Players have -20% to all Elemental Resistances", 35f, 50f, 15f),
            new RiftMapAffix("reflect_phys", "Monsters reflect 15% Elemental Damage", 25f, 35f),
            new RiftMapAffix("monster_speed", "Monsters have +30% Movement & Attack Speed", 20f, 30f, 20f),
            new RiftMapAffix("boss_frenzy", "Map Boss has +60% Life & +25% Area of Effect", 30f, 45f)
        };

        private readonly Random _rng;

        public RiftMapGenerator(Random? rng = null)
        {
            _rng = rng ?? new Random();
        }

        public bool UpgradeWithGenesisPrism(RiftMapEntity map, out string message)
        {
            if (map.Rarity != ItemRarity.Normal)
            {
                message = "Genesis Prism can only be applied to Normal maps.";
                return false;
            }

            map.Rarity = ItemRarity.Rare;
            map.ClearAffixes();

            int affixCount = _rng.Next(4, 7); // 4 to 6 affixes
            var shuffled = _affixPool.OrderBy(_ => _rng.Next()).Take(affixCount);

            foreach (var affix in shuffled)
            {
                map.AddAffix(affix);
            }

            message = $"Map infused with Genesis Prism into Rare with {affixCount} modifiers (+{map.TotalQuantityBonus}% Quantity, +{map.TotalRarityBonus}% Rarity).";
            return true;
        }

        public bool RerollWithFractureCore(RiftMapEntity map, out string message)
        {
            if (map.Rarity != ItemRarity.Rare)
            {
                message = "Fracture Core can only be applied to Rare maps.";
                return false;
            }

            map.ClearAffixes();
            int affixCount = _rng.Next(4, 7);
            var shuffled = _affixPool.OrderBy(_ => _rng.Next()).Take(affixCount);

            foreach (var affix in shuffled)
            {
                map.AddAffix(affix);
            }

            message = $"Map reforged with Fracture Core (+{map.TotalQuantityBonus}% Quantity, +{map.TotalRarityBonus}% Rarity).";
            return true;
        }
    }
}
