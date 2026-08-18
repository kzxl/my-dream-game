using System;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace Mdg.Core.Common.Events
{
    public interface IEventBus
    {
        void Publish<TEvent>(TEvent @event) where TEvent : IDomainEvent;
        void Subscribe<TEvent>(Action<TEvent> handler) where TEvent : IDomainEvent;
        void Unsubscribe<TEvent>(Action<TEvent> handler) where TEvent : IDomainEvent;
        void Clear();
    }

    /// <summary>
    /// Event Bus bộ nhớ tốc độ cao, thread-safe, phục vụ cho giao tiếp giữa các feature module
    /// và bắn event ra Presentation / Client Adapter.
    /// </summary>
    public sealed class InMemoryEventBus : IEventBus
    {
        private readonly ConcurrentDictionary<Type, List<Delegate>> _subscribers = new();
        private readonly object _lock = new();

        public void Publish<TEvent>(TEvent @event) where TEvent : IDomainEvent
        {
            if (@event == null) return;

            Type eventType = typeof(TEvent);
            if (_subscribers.TryGetValue(eventType, out var handlers))
            {
                Delegate[] snapshot;
                lock (_lock)
                {
                    snapshot = handlers.ToArray();
                }

                for (int i = 0; i < snapshot.Length; i++)
                {
                    if (snapshot[i] is Action<TEvent> action)
                    {
                        action(@event);
                    }
                }
            }
        }

        public void Subscribe<TEvent>(Action<TEvent> handler) where TEvent : IDomainEvent
        {
            if (handler == null) return;

            Type eventType = typeof(TEvent);
            lock (_lock)
            {
                var list = _subscribers.GetOrAdd(eventType, _ => new List<Delegate>());
                if (!list.Contains(handler))
                {
                    list.Add(handler);
                }
            }
        }

        public void Unsubscribe<TEvent>(Action<TEvent> handler) where TEvent : IDomainEvent
        {
            if (handler == null) return;

            Type eventType = typeof(TEvent);
            lock (_lock)
            {
                if (_subscribers.TryGetValue(eventType, out var list))
                {
                    list.Remove(handler);
                }
            }
        }

        public void Clear()
        {
            lock (_lock)
            {
                _subscribers.Clear();
            }
        }
    }
}
