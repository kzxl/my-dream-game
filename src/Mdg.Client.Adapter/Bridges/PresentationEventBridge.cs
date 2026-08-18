using System;
using System.Collections.Generic;
using Mdg.Core.Common.Events;
using Mdg.Core.Common.Math;
using Mdg.Core.Entities;
using Mdg.Core.Events.DomainEvents;
using Mdg.Core.Features.Combat;
using Mdg.Core.Features.Stats;

namespace Mdg.Client.Adapter.Bridges
{
    /// <summary>
    /// Cầu nối sự kiện giữa Game.Core và Presentation Engine (Unity / Godot / Cocos / MonoGame).
    /// Giúp Engine chỉ cần lắng nghe action mà không phụ thuộc vào logic nội bộ.
    /// </summary>
    public sealed class PresentationEventBridge
    {
        private readonly IEventBus _eventBus;

        public event Action<DamageEffectArgs>? OnDamageEffectRequested;
        public event Action<DeathEffectArgs>? OnDeathEffectRequested;
        public event Action<SkillCastEffectArgs>? OnSkillCastEffectRequested;
        public event Action<EntityMovedArgs>? OnEntityMoved;

        public PresentationEventBridge(IEventBus eventBus)
        {
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            RegisterEvents();
        }

        private void RegisterEvents()
        {
            _eventBus.Subscribe<EntityDamagedEvent>(e =>
            {
                OnDamageEffectRequested?.Invoke(new DamageEffectArgs
                {
                    TargetId = e.TargetId,
                    AttackerId = e.AttackerId,
                    TotalDamage = e.Hit.TotalDamageDealt,
                    IsCrit = e.Hit.IsCrit,
                    IsBlocked = e.Hit.IsBlocked,
                    DamageBreakdown = e.Hit.DamageBreakdown,
                    RemainingLife = e.RemainingLife,
                    RemainingEnergyShield = e.RemainingEnergyShield,
                    WorldPosition = e.Position,
                    ScreenIsoPosition = IsometricUtils.WorldToIsometric(e.Position)
                });
            });

            _eventBus.Subscribe<EntityDiedEvent>(e =>
            {
                OnDeathEffectRequested?.Invoke(new DeathEffectArgs
                {
                    TargetId = e.TargetId,
                    KillerId = e.KillerId,
                    WorldPosition = e.DeathPosition,
                    ScreenIsoPosition = IsometricUtils.WorldToIsometric(e.DeathPosition)
                });
            });

            _eventBus.Subscribe<SkillExecutedEvent>(e =>
            {
                OnSkillCastEffectRequested?.Invoke(new SkillCastEffectArgs
                {
                    CasterId = e.CasterId,
                    SkillId = e.SkillId,
                    TargetPosition = e.TargetPosition,
                    TargetIsoPosition = IsometricUtils.WorldToIsometric(e.TargetPosition),
                    TargetEntityId = e.TargetEntityId
                });
            });

            _eventBus.Subscribe<EntityMovedEvent>(e =>
            {
                OnEntityMoved?.Invoke(new EntityMovedArgs
                {
                    EntityId = e.EntityId,
                    WorldPosition = e.NewPosition,
                    IsoPosition = IsometricUtils.WorldToIsometric(e.NewPosition)
                });
            });
        }
    }

    public sealed class DamageEffectArgs
    {
        public Guid TargetId { get; init; }
        public Guid? AttackerId { get; init; }
        public float TotalDamage { get; init; }
        public bool IsCrit { get; init; }
        public bool IsBlocked { get; init; }
        public IReadOnlyDictionary<DamageType, float> DamageBreakdown { get; init; } = default!;
        public float RemainingLife { get; init; }
        public float RemainingEnergyShield { get; init; }
        public FixVector2 WorldPosition { get; init; }
        public FixVector2 ScreenIsoPosition { get; init; }
    }

    public sealed class DeathEffectArgs
    {
        public Guid TargetId { get; init; }
        public Guid? KillerId { get; init; }
        public FixVector2 WorldPosition { get; init; }
        public FixVector2 ScreenIsoPosition { get; init; }
    }

    public sealed class SkillCastEffectArgs
    {
        public Guid CasterId { get; init; }
        public string SkillId { get; init; } = string.Empty;
        public FixVector2 TargetPosition { get; init; }
        public FixVector2 TargetIsoPosition { get; init; }
        public Guid? TargetEntityId { get; init; }
    }

    public sealed class EntityMovedArgs
    {
        public Guid EntityId { get; init; }
        public FixVector2 WorldPosition { get; init; }
        public FixVector2 IsoPosition { get; init; }
    }
}
