using System;
using System.Collections.Generic;
using Mdg.Core.Features.Items;

namespace Mdg.Core.Features.Maps
{
    public sealed class MapDeviceActivationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string TargetZoneId { get; set; } = string.Empty;
        public int Tier { get; set; } = 1;
        public float FinalQuantityBonus { get; set; }
        public float FinalRarityBonus { get; set; }
        public float FinalPackSizeBonus { get; set; }
        public List<string> ActiveModifiers { get; set; } = new();
        public bool IsPinnacleArena { get; set; }
        public string BossName { get; set; } = string.Empty;
    }

    public sealed class MapDeviceManager
    {
        public const int MAX_DEVICE_SLOTS = 4;

        // Slot 0: Primary Map / Rift Tablet
        // Slots 1-3: Catalyst Fragments / Sacrificial Offerings
        public RiftMapEntity? PrimaryMap { get; set; }
        public List<string> FragmentKeys { get; } = new(3);

        public bool InsertPrimaryMap(RiftMapEntity map, out string message)
        {
            PrimaryMap = map;
            message = $"Map Tier {map.Tier} ({map.ZoneName}) placed in the central conduit.";
            return true;
        }

        public bool InsertFragment(string fragmentKey, out string message)
        {
            if (FragmentKeys.Count >= 3)
            {
                message = "Map Device fragment slots are full (Max 3 fragments).";
                return false;
            }

            FragmentKeys.Add(fragmentKey);
            message = $"Fragment '{fragmentKey}' infused into the Map Device.";
            return true;
        }

        public void ClearSlots()
        {
            PrimaryMap = null;
            FragmentKeys.Clear();
        }

        public MapDeviceActivationResult ActivateDevice()
        {
            if (PrimaryMap == null)
            {
                return new MapDeviceActivationResult
                {
                    Success = false,
                    Message = "No primary Rift Map placed in the device."
                };
            }

            float extraQty = 0f;
            float extraRarity = 0f;
            float extraPackSize = 0f;

            // Process Fragments
            foreach (var frag in FragmentKeys)
            {
                switch (frag.ToLowerInvariant())
                {
                    case "catalyst_fire":
                    case "molten_fragment":
                        extraQty += 15f;
                        extraRarity += 20f;
                        break;
                    case "catalyst_cold":
                    case "glacial_fragment":
                        extraQty += 15f;
                        extraRarity += 20f;
                        break;
                    case "catalyst_chaos":
                    case "abyssal_fragment":
                        extraQty += 25f;
                        extraRarity += 35f;
                        extraPackSize += 10f;
                        break;
                    case "divine_vessel":
                        extraQty += 30f;
                        extraRarity += 50f;
                        break;
                    default:
                        extraQty += 10f;
                        extraRarity += 15f;
                        break;
                }
            }

            var activeMods = new List<string>();
            foreach (var affix in PrimaryMap.Affixes)
            {
                activeMods.Add(affix.Description);
            }

            bool isPinnacle = PrimaryMap.Tier >= 14;
            string bossName = PrimaryMap.Tier switch
            {
                14 => "Ignis, The Molten Archon",
                15 => "Vael, The Frost Sovereign",
                16 => "Malakor, The Shadow Devourer",
                _ => "Rift Guardian"
            };

            string targetZoneId = isPinnacle ? PrimaryMap.Tier switch
            {
                14 => "ArenaCaldera",
                15 => "ArenaGlacial",
                16 => "ArenaVoid",
                _ => "ForgottenCrypt"
            } : "ForgottenCrypt";

            return new MapDeviceActivationResult
            {
                Success = true,
                Message = $"The Gate of Eternity opens! Portal stabilized to {targetZoneId} (Tier {PrimaryMap.Tier}).",
                TargetZoneId = targetZoneId,
                Tier = PrimaryMap.Tier,
                FinalQuantityBonus = PrimaryMap.TotalQuantityBonus + extraQty,
                FinalRarityBonus = PrimaryMap.TotalRarityBonus + extraRarity,
                FinalPackSizeBonus = PrimaryMap.TotalPackSizeBonus + extraPackSize,
                ActiveModifiers = activeMods,
                IsPinnacleArena = isPinnacle,
                BossName = bossName
            };
        }
    }
}
