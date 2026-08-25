using System;
using System.Collections.Generic;
using Mdg.Core.Features.Spire;

namespace Mdg.Server.Services
{
    public sealed class SpireService
    {
        public SpireFloorDefinition GetFloor(int floorNumber)
        {
            return EndlessSpireEngine.GetFloorDefinition(floorNumber);
        }

        public ClaimSpireFloorResultDto ClaimFloor(ClaimSpireFloorRequestDto req)
        {
            int floor = Math.Clamp(req.FloorNumber, 1, EndlessSpireEngine.MAX_SPIRE_FLOOR);
            int highest = Math.Max(0, req.HighestClearedFloor);

            if (!EndlessSpireEngine.CanAccessFloor(floor, highest))
            {
                return new ClaimSpireFloorResultDto(
                    false,
                    $"Cannot claim floor {floor}. Highest cleared floor is {highest}.",
                    highest,
                    0,
                    new());
            }

            int newHighest = Math.Max(highest, floor);
            var floorDef = EndlessSpireEngine.GetFloorDefinition(floor);

            // Calculate authoritative rewards based on floor
            long expAwarded = 250L * floor + (floorDef.IsBossFloor ? 1000L * floor : 0);
            var currencies = new Dictionary<string, int>
            {
                ["gold"] = 100 * floor + (floorDef.IsBossFloor ? 500 * floor : 0)
            };

            if (floor % 5 == 0)
            {
                currencies["mat_shard_genesis"] = (floor / 5);
            }

            if (floorDef.IsBossFloor)
            {
                currencies["fracture_core"] = Math.Max(1, floor / 10);
            }

            string msg = floorDef.IsBossFloor
                ? $"👑 VICTORY! Conquered Guardian Sovereign at Floor {floor}! Awarded {currencies["gold"]} Gold, {expAwarded} Exp."
                : $"✨ Ascendant Trial Floor {floor} Cleared! (+{expAwarded} Exp).";

            return new ClaimSpireFloorResultDto(
                true,
                msg,
                newHighest,
                expAwarded,
                currencies);
        }
    }

    public record ClaimSpireFloorRequestDto(
        int FloorNumber,
        int HighestClearedFloor,
        string? CharacterId);

    public record ClaimSpireFloorResultDto(
        bool Success,
        string Message,
        int HighestClearedFloor,
        long ExpAwarded,
        Dictionary<string, int> RewardCurrencies);
}
