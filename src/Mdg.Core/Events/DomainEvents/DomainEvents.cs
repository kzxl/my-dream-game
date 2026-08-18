using System;
using Mdg.Core.Common.Events;
using Mdg.Core.Common.Math;
using Mdg.Core.Features.Combat;

namespace Mdg.Core.Events.DomainEvents
{
    public sealed record EntityDamagedEvent : DomainEventBase
    {
        public Guid TargetId { get; init; }
        public Guid? AttackerId { get; init; }
        public HitResult Hit { get; init; } = default!;
        public float RemainingLife { get; init; }
        public float RemainingEnergyShield { get; init; }
        public FixVector2 Position { get; init; }
    }

    public sealed record EntityHealedEvent : DomainEventBase
    {
        public Guid TargetId { get; init; }
        public float Amount { get; init; }
        public float CurrentLife { get; init; }
    }

    public sealed record EntityDiedEvent : DomainEventBase
    {
        public Guid TargetId { get; init; }
        public Guid? KillerId { get; init; }
        public FixVector2 DeathPosition { get; init; }
    }

    public sealed record SkillExecutedEvent : DomainEventBase
    {
        public Guid CasterId { get; init; }
        public string SkillId { get; init; } = string.Empty;
        public FixVector2 TargetPosition { get; init; }
        public Guid? TargetEntityId { get; init; }
    }

    public sealed record EntityMovedEvent : DomainEventBase
    {
        public Guid EntityId { get; init; }
        public FixVector2 PreviousPosition { get; init; }
        public FixVector2 NewPosition { get; init; }
    }
}
