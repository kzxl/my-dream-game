using System;

namespace Mdg.Core.Common.Events
{
    /// <summary>
    /// Contract cho mọi Domain Event trong hệ thống Game Core.
    /// Mang tính chất bất biến (Immutable), thể hiện hành động đã xảy ra trong quá khứ.
    /// </summary>
    public interface IDomainEvent
    {
        Guid EventId { get; }
        DateTime Timestamp { get; }
        long Tick { get; }
    }

    /// <summary>
    /// Base class tiện ích cho Domain Events.
    /// </summary>
    public abstract record DomainEventBase : IDomainEvent
    {
        public Guid EventId { get; init; } = Guid.NewGuid();
        public DateTime Timestamp { get; init; } = DateTime.UtcNow;
        public long Tick { get; init; }
    }
}
