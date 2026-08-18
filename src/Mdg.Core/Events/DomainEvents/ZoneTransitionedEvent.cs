using System;
using Mdg.Core.Common.Events;
using Mdg.Core.Common.Math;
using Mdg.Core.Features.World;

namespace Mdg.Core.Events.DomainEvents
{
    public sealed record ZoneTransitionedEvent : DomainEventBase
    {
        public Guid PlayerId { get; init; }
        public ZoneType PreviousZone { get; init; }
        public ZoneType NewZone { get; init; }
        public string ZoneName { get; init; } = string.Empty;
        public FixVector2 SpawnPosition { get; init; }
    }
}
