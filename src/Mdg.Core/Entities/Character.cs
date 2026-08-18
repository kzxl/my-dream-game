using System;
using Mdg.Core.Common.Events;
using Mdg.Core.Common.Math;
using Mdg.Core.Events.DomainEvents;
using Mdg.Core.Features.Buffs;
using Mdg.Core.Features.Combat;
using Mdg.Core.Features.Inventory;
using Mdg.Core.Features.Skills;
using Mdg.Core.Features.Stats;

namespace Mdg.Core.Entities
{
    public abstract class Entity
    {
        public Guid Id { get; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public FixVector2 Position { get; set; }
        public FixVector2 Velocity { get; set; }
        public FixVector2 Direction { get; set; } = FixVector2.Down;
        public bool IsAlive { get; protected set; } = true;
        public string Tag { get; set; } = string.Empty;

        public virtual void Update(float deltaTime, IEventBus eventBus, long currentTick)
        {
            if (Velocity != FixVector2.Zero)
            {
                var prev = Position;
                Position += Velocity * deltaTime;
                eventBus.Publish(new EntityMovedEvent
                {
                    EntityId = Id,
                    PreviousPosition = prev,
                    NewPosition = Position,
                    Tick = currentTick
                });
            }
        }
    }

    public class Character : Entity
    {
        public StatCollection Stats { get; }
        public BuffManager Buffs { get; }
        public SkillManager Skills { get; }
        public EquipmentManager Equipment { get; }

        public float CurrentLife { get; protected set; }
        public float CurrentMana { get; protected set; }
        public float CurrentEnergyShield { get; protected set; }

        public Character(string name)
        {
            Name = name;
            Stats = new StatCollection();
            Buffs = new BuffManager(Stats);
            Skills = new SkillManager();
            Equipment = new EquipmentManager(Stats);

            // Khởi tạo stats cơ bản
            Stats.SetBaseValue(StatType.MaxLife, 100f);
            Stats.SetBaseValue(StatType.MaxMana, 50f);
            Stats.SetBaseValue(StatType.MaxEnergyShield, 0f);
            Stats.SetBaseValue(StatType.MovementSpeed, 5f);
            Stats.SetBaseValue(StatType.CriticalStrikeMultiplier, 150f);
            Stats.SetBaseValue(StatType.AccuracyRating, 500f);

            ResetResources();
        }

        public void ResetResources()
        {
            CurrentLife = Stats.GetValue(StatType.MaxLife);
            CurrentMana = Stats.GetValue(StatType.MaxMana);
            CurrentEnergyShield = Stats.GetValue(StatType.MaxEnergyShield);
        }

        public HitResult TakeDamage(DamagePayload payload, IEventBus eventBus, long currentTick)
        {
            if (!IsAlive) return HitResult.Evaded();

            float es = CurrentEnergyShield;
            float life = CurrentLife;

            var hit = DamageCalculator.CalculateHit(payload, Stats, ref es, ref life);
            CurrentEnergyShield = es;
            CurrentLife = life;

            if (hit.IsHit)
            {
                eventBus.Publish(new EntityDamagedEvent
                {
                    TargetId = Id,
                    AttackerId = payload.AttackerId,
                    Hit = hit,
                    RemainingLife = CurrentLife,
                    RemainingEnergyShield = CurrentEnergyShield,
                    Position = Position,
                    Tick = currentTick
                });

                if (CurrentLife <= 0f)
                {
                    IsAlive = false;
                    Velocity = FixVector2.Zero;
                    eventBus.Publish(new EntityDiedEvent
                    {
                        TargetId = Id,
                        KillerId = payload.AttackerId,
                        DeathPosition = Position,
                        Tick = currentTick
                    });
                }
            }

            return hit;
        }

        public void Heal(float amount, IEventBus eventBus, long currentTick)
        {
            if (!IsAlive || amount <= 0f) return;

            float maxLife = Stats.GetValue(StatType.MaxLife);
            CurrentLife = MathF.Min(maxLife, CurrentLife + amount);

            eventBus.Publish(new EntityHealedEvent
            {
                TargetId = Id,
                Amount = amount,
                CurrentLife = CurrentLife,
                Tick = currentTick
            });
        }

        public bool CastSkill(string skillId, FixVector2 targetPos, IEventBus eventBus, long currentTick, Guid? targetEntityId = null)
        {
            if (!IsAlive) return false;

            var request = new SkillCastRequest(skillId, targetPos, targetEntityId);
            float mana = CurrentMana;

            if (Skills.ExecuteSkill(request, ref mana, out string? _))
            {
                CurrentMana = mana;
                eventBus.Publish(new SkillExecutedEvent
                {
                    CasterId = Id,
                    SkillId = skillId,
                    TargetPosition = targetPos,
                    TargetEntityId = targetEntityId,
                    Tick = currentTick
                });
                return true;
            }

            return false;
        }

        public override void Update(float deltaTime, IEventBus eventBus, long currentTick)
        {
            base.Update(deltaTime, eventBus, currentTick);

            if (IsAlive)
            {
                Buffs.Update(deltaTime);
                Skills.Update(deltaTime);

                // Regen
                float lifeRegen = Stats.GetValue(StatType.LifeRegen);
                if (lifeRegen > 0f && CurrentLife < Stats.GetValue(StatType.MaxLife))
                {
                    CurrentLife = MathF.Min(Stats.GetValue(StatType.MaxLife), CurrentLife + (lifeRegen * deltaTime));
                }

                float manaRegen = Stats.GetValue(StatType.ManaRegen);
                if (manaRegen > 0f && CurrentMana < Stats.GetValue(StatType.MaxMana))
                {
                    CurrentMana = MathF.Min(Stats.GetValue(StatType.MaxMana), CurrentMana + (manaRegen * deltaTime));
                }
            }
        }
    }
}
