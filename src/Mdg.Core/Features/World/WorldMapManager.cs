using System;
using System.Collections.Generic;
using Mdg.Core.Common.Events;
using Mdg.Core.Common.Math;

namespace Mdg.Core.Features.World
{
    public enum ZoneType
    {
        SanctuaryHaven = 1,
        WhisperingPlains = 2,
        ForgottenCrypt = 3,
        MoltenCaldera = 4
    }

    public sealed class Portal
    {
        public string Id { get; }
        public string Name { get; }
        public FixVector2 Position { get; }
        public ZoneType TargetZone { get; }
        public FixVector2 TargetPosition { get; }
        public float TriggerRadius { get; }

        public Portal(string id, string name, FixVector2 position, ZoneType targetZone, FixVector2 targetPosition, float triggerRadius = 40f)
        {
            Id = id;
            Name = name;
            Position = position;
            TargetZone = targetZone;
            TargetPosition = targetPosition;
            TriggerRadius = triggerRadius;
        }

        public bool IsPlayerInside(FixVector2 playerPos)
        {
            return FixVector2.Distance(playerPos, Position) <= TriggerRadius;
        }
    }

    public sealed class ZoneDefinition
    {
        public ZoneType Type { get; }
        public string Name { get; }
        public string Subtitle { get; }
        public string LevelRange { get; }
        public bool IsSafeZone { get; }
        public FixVector2 DefaultSpawnPoint { get; }
        public List<Portal> Portals { get; } = new();

        public ZoneDefinition(ZoneType type, string name, string subtitle, string levelRange, FixVector2 defaultSpawnPoint, bool isSafeZone = false)
        {
            Type = type;
            Name = name;
            Subtitle = subtitle;
            LevelRange = levelRange;
            DefaultSpawnPoint = defaultSpawnPoint;
            IsSafeZone = isSafeZone;
        }

        public ZoneDefinition AddPortal(Portal portal)
        {
            Portals.Add(portal);
            return this;
        }
    }

    public sealed class WorldMapManager
    {
        private readonly Dictionary<ZoneType, ZoneDefinition> _zones = new();
        public ZoneType CurrentZone { get; private set; } = ZoneType.SanctuaryHaven;

        public event Action<ZoneDefinition, FixVector2>? OnZoneTransitioned;

        public WorldMapManager()
        {
            InitializeDefaultZones();
        }

        private void InitializeDefaultZones()
        {
            // 1. Sanctuary Haven (Town / Safe Zone)
            var haven = new ZoneDefinition(
                ZoneType.SanctuaryHaven,
                "Sanctuary Haven",
                "Starting Town - Safe Haven",
                "Lv. 1-5",
                new FixVector2(2000, 2000),
                isSafeZone: true
            );
            haven.AddPortal(new Portal(
                "haven_to_plains",
                "To Whispering Plains",
                new FixVector2(3200, 2000),
                ZoneType.WhisperingPlains,
                new FixVector2(600, 2000)
            ));
            _zones[ZoneType.SanctuaryHaven] = haven;

            // 2. Whispering Plains (Wilderness / Slimes & Goblins)
            var plains = new ZoneDefinition(
                ZoneType.WhisperingPlains,
                "Whispering Plains",
                "Wild Hunting Grounds - Roaming Beasts",
                "Lv. 5-15",
                new FixVector2(600, 2000)
            );
            plains.AddPortal(new Portal(
                "plains_to_haven",
                "Return to Sanctuary Haven",
                new FixVector2(500, 2000),
                ZoneType.SanctuaryHaven,
                new FixVector2(3000, 2000)
            ));
            plains.AddPortal(new Portal(
                "plains_to_crypt",
                "Portal to Forgotten Crypt",
                new FixVector2(3500, 2000),
                ZoneType.ForgottenCrypt,
                new FixVector2(600, 2000)
            ));
            _zones[ZoneType.WhisperingPlains] = plains;

            // 3. Forgotten Crypt (Dungeon / Skeletons & Shadow Fiend Boss)
            var crypt = new ZoneDefinition(
                ZoneType.ForgottenCrypt,
                "Forgotten Crypt",
                "Ancient Crypt - Shadow Fiend Lair",
                "Lv. 15-25",
                new FixVector2(600, 2000)
            );
            crypt.AddPortal(new Portal(
                "crypt_to_plains",
                "Escape Dungeon",
                new FixVector2(500, 2000),
                ZoneType.WhisperingPlains,
                new FixVector2(3300, 2000)
            ));
            _zones[ZoneType.ForgottenCrypt] = crypt;
        }

        public ZoneDefinition GetZone(ZoneType type)
        {
            return _zones.TryGetValue(type, out var zone) ? zone : _zones[ZoneType.SanctuaryHaven];
        }

        public bool TravelTo(ZoneType targetZone, FixVector2? spawnPosition = null)
        {
            if (_zones.TryGetValue(targetZone, out var zone))
            {
                CurrentZone = targetZone;
                var spawn = spawnPosition ?? zone.DefaultSpawnPoint;
                OnZoneTransitioned?.Invoke(zone, spawn);
                return true;
            }
            return false;
        }
    }
}
