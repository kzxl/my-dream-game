using System.Collections.Concurrent;
using Mdg.Core.Features.Combat;

namespace Mdg.Server.Services
{
    public class ResurrectionSessionManager
    {
        private readonly ConcurrentDictionary<string, PlayerDefeatState> _playerStates = new();

        public PlayerDefeatState GetOrCreateState(string characterId, string zoneId = "SanctuaryHaven")
        {
            var state = _playerStates.GetOrAdd(characterId, id => new PlayerDefeatState(id, zoneId));
            if (state.CurrentZoneId != zoneId)
            {
                state.ResetZoneSession(zoneId);
            }
            return state;
        }

        public ResurrectionResult ProcessSpotResurrection(
            string characterId,
            string zoneId,
            ref int scrollCount,
            float maxLife,
            float maxMana,
            float maxEs)
        {
            var state = GetOrCreateState(characterId, zoneId);
            return ResurrectionEngine.ExecuteSpotResurrection(state, ref scrollCount, maxLife, maxMana, maxEs);
        }

        public ResurrectionResult ProcessTownResurrection(
            string characterId,
            float maxLife,
            float maxMana,
            float maxEs)
        {
            var state = GetOrCreateState(characterId, "SanctuaryHaven");
            state.ResetZoneSession("SanctuaryHaven");
            return ResurrectionEngine.ExecuteTownResurrection(state, maxLife, maxMana, maxEs);
        }

        public int GetRemainingZoneResurrections(string characterId, string zoneId)
        {
            var state = GetOrCreateState(characterId, zoneId);
            return state.RemainingZoneResurrections;
        }
    }
}
