using Godot;
using System;
using System.Collections.Generic;
using Mdg.Client.Adapter.Bridges;
using Mdg.Client.Godot.Scripts.Common;
using Mdg.Client.Godot.Scripts.Entities;
using Mdg.Client.Godot.Scripts.UI;
using Mdg.Core.Common.Events;
using Mdg.Core.Common.Math;
using Mdg.Core.Engine;
using Mdg.Core.Entities;
using Mdg.Core.Events.DomainEvents;
using Mdg.Core.Features.Combat;
using Mdg.Core.Features.Stats;

namespace Mdg.Client.Godot.Scripts.Core
{
    public partial class GameManager : Node2D
    {
        [Export] public PackedScene PlayerScene { get; set; } = default!;
        [Export] public PackedScene MonsterScene { get; set; } = default!;
        [Export] public PackedScene FloatingTextScene { get; set; } = default!;
        [Export] public HudController Hud { get; set; } = default!;

        public GameWorld World { get; private set; } = default!;
        public GameTickScheduler Scheduler { get; private set; } = default!;
        public IEventBus EventBus => World.EventBus;
        public PresentationEventBridge EventBridge { get; private set; } = default!;

        public Character? LocalPlayer { get; private set; }
        public PlayerController? PlayerView { get; private set; }

        private readonly Dictionary<Guid, (MonsterEntity Entity, MonsterView View)> _monsters = new();

        public override void _Ready()
        {
            InitializeCoreSystems();
            SpawnPlayer();
            SpawnInitialMonsters();
        }

        private void InitializeCoreSystems()
        {
            // 1. Khởi tạo GameWorld và Fixed-Tick Scheduler (30 Ticks/s)
            World = new GameWorld();
            World.Initialize();
            Scheduler = new GameTickScheduler(World, 30f);

            // 2. Khởi tạo Cầu nối sự kiện PresentationEventBridge
            EventBridge = new PresentationEventBridge(World.EventBus);

            // 3. Đăng ký nhận phản hồi từ Presentation Bridge
            EventBridge.OnDamageEffectRequested += HandleDamageEffect;
            EventBridge.OnDeathEffectRequested += HandleDeathEffect;
            EventBridge.OnSkillCastEffectRequested += HandleSkillCastEffect;
        }

        private void SpawnPlayer()
        {
            LocalPlayer = new Character("Hero_Aethelis");
            LocalPlayer.Position = new FixVector2(640f, 360f);

            // Thiết lập chỉ số khởi đầu
            LocalPlayer.Stats.SetBaseValue(StatType.MaxLife, 250f);
            LocalPlayer.Stats.SetBaseValue(StatType.MaxMana, 120f);
            LocalPlayer.Stats.SetBaseValue(StatType.MaxEnergyShield, 80f);
            LocalPlayer.Stats.SetBaseValue(StatType.PhysicalDamage, 45f);
            LocalPlayer.Stats.SetBaseValue(StatType.MovementSpeed, 240f);
            LocalPlayer.Stats.SetBaseValue(StatType.CriticalStrikeChance, 18f);
            LocalPlayer.Stats.SetBaseValue(StatType.CriticalStrikeMultiplier, 175f);
            LocalPlayer.Stats.SetBaseValue(StatType.AccuracyRating, 450f);

            // Tạo Player Node
            if (PlayerScene != null)
            {
                var pNode = PlayerScene.Instantiate<PlayerController>();
                AddChild(pNode);
                pNode.Initialize(LocalPlayer, this);
                PlayerView = pNode;
            }
        }

        private void SpawnInitialMonsters()
        {
            var spawnConfigs = new[]
            {
                (Name: "Sylvan Stalker", Rarity: MonsterRarity.Normal, Pos: new Vector2(400, 250), BaseHp: 120f, BaseDmg: 15f),
                (Name: "Void Creeper", Rarity: MonsterRarity.Normal, Pos: new Vector2(850, 220), BaseHp: 150f, BaseDmg: 18f),
                (Name: "Abyssal Brute", Rarity: MonsterRarity.Champion, Pos: new Vector2(300, 500), BaseHp: 200f, BaseDmg: 25f),
                (Name: "Celestial Goliath", Rarity: MonsterRarity.Rare, Pos: new Vector2(900, 520), BaseHp: 280f, BaseDmg: 32f),
                (Name: "Malakor, Void Inquisitor", Rarity: MonsterRarity.PinnacleBoss, Pos: new Vector2(640, 100), BaseHp: 500f, BaseDmg: 45f),
            };

            foreach (var cfg in spawnConfigs)
            {
                var monster = new MonsterEntity(cfg.Name, cfg.Rarity, cfg.BaseHp, cfg.BaseDmg);
                var monsterPos = new FixVector2(cfg.Pos.X, cfg.Pos.Y);

                if (cfg.Rarity == MonsterRarity.Rare || cfg.Rarity == MonsterRarity.PinnacleBoss)
                {
                    monster.AddAffix(MonsterAffixType.AetherWard);
                    monster.AddAffix(MonsterAffixType.MagmaConduit);
                }

                if (MonsterScene != null)
                {
                    var mView = MonsterScene.Instantiate<MonsterView>();
                    AddChild(mView);
                    mView.Initialize(monster, monsterPos);
                    _monsters[monster.Id] = (monster, mView);
                }
            }

            Hud?.UpdateMonstersAlive(_monsters.Count);
        }

        public override void _PhysicsProcess(double delta)
        {
            // 1. Tiến hành tick simulation trong Core
            Scheduler?.Advance((float)delta);

            // 2. Cập nhật HUD
            if (LocalPlayer != null && Hud != null)
            {
                Hud.UpdatePlayerStats(LocalPlayer);
            }
        }

        public void ApplyAreaDamage(FixVector2 center, float radius, DamagePayload payload)
        {
            float radiusSq = radius * radius;
            var damagedMonsters = new List<(MonsterEntity Entity, MonsterView View)>();

            foreach (var kvp in _monsters)
            {
                var (entity, view) = kvp.Value;
                if (!entity.IsAlive) continue;

                var monsterPos = view.Position.ToFixVector2();
                if (FixVector2.DistanceSquared(center, monsterPos) <= radiusSq)
                {
                    damagedMonsters.Add((entity, view));
                }
            }

            foreach (var (entity, view) in damagedMonsters)
            {
                var defenderStats = new StatCollection();
                defenderStats.SetBaseValue(StatType.Armor, entity.Armor);
                defenderStats.SetBaseValue(StatType.FireResistance, entity.FireResistance);
                defenderStats.SetBaseValue(StatType.ColdResistance, entity.ColdResistance);
                defenderStats.SetBaseValue(StatType.LightningResistance, entity.LightningResistance);
                defenderStats.SetBaseValue(StatType.ChaosResistance, entity.ChaosResistance);
                defenderStats.SetBaseValue(StatType.Evasion, entity.EvasionChance);
                defenderStats.SetBaseValue(StatType.BlockChance, entity.BlockChance);

                float currentEs = entity.WardShield;
                float currentHp = entity.CurrentHealth;

                var hitResult = DamageCalculator.CalculateHit(payload, defenderStats, ref currentEs, ref currentHp);

                if (!hitResult.IsEvaded)
                {
                    entity.TakeDamage(hitResult.TotalDamageDealt);

                    // Phát sinh Domain Event vào Core EventBus
                    EventBus.Publish(new EntityDamagedEvent
                    {
                        TargetId = entity.Id,
                        AttackerId = payload.AttackerId,
                        Hit = hitResult,
                        RemainingLife = entity.CurrentHealth,
                        RemainingEnergyShield = entity.WardShield,
                        Position = view.Position.ToFixVector2()
                    });

                    if (!entity.IsAlive)
                    {
                        EventBus.Publish(new EntityDiedEvent
                        {
                            TargetId = entity.Id,
                            KillerId = payload.AttackerId,
                            DeathPosition = view.Position.ToFixVector2()
                        });
                    }
                }
            }
        }

        private void HandleDamageEffect(DamageEffectArgs e)
        {
            if (_monsters.TryGetValue(e.TargetId, out var tuple))
            {
                tuple.View.TakeHitVisualFeedback(e.IsCrit);
            }

            // Spawn số nhảy Floating Combat Text
            if (FloatingTextScene != null)
            {
                var fct = FloatingTextScene.Instantiate<FloatingCombatText>();
                AddChild(fct);

                fct.Position = new Vector2(e.WorldPosition.X + (float)GD.RandRange(-15, 15), e.WorldPosition.Y - 25);

                string text = $"{MathF.Ceiling(e.TotalDamage)}";
                Color color = Colors.White;

                if (e.IsCrit)
                {
                    text += " CRIT!";
                    color = new Color(1f, 0.9f, 0.2f); // Vàng
                }
                else if (e.IsBlocked)
                {
                    text = "BLOCKED";
                    color = new Color(0.4f, 0.7f, 1f); // Xanh dương
                }

                fct.Setup(text, color);
            }
        }

        private void HandleDeathEffect(DeathEffectArgs e)
        {
            if (_monsters.TryGetValue(e.TargetId, out var tuple))
            {
                tuple.View.PlayDeathAnimation();
                _monsters.Remove(e.TargetId);
                Hud?.UpdateMonstersAlive(_monsters.Count);

                if (_monsters.Count == 0)
                {
                    Hud?.SetCombatStatus("🎉 CHIẾN THẮNG! Đã quét sạch quái vật vùng đất Aethelis!");
                }
            }
        }

        private void HandleSkillCastEffect(SkillCastEffectArgs e)
        {
            Hud?.SetCombatStatus($"⚔️ Thi triển chiêu thức: [{e.SkillId}]");
        }

        public override void _ExitTree()
        {
            if (EventBridge != null)
            {
                EventBridge.OnDamageEffectRequested -= HandleDamageEffect;
                EventBridge.OnDeathEffectRequested -= HandleDeathEffect;
                EventBridge.OnSkillCastEffectRequested -= HandleSkillCastEffect;
            }
            World?.Shutdown();
        }
    }
}
