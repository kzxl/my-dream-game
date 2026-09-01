using Godot;
using System;
using System.Collections.Generic;
using Mdg.Client.Adapter.Bridges;
using Mdg.Client.Godot.Scripts.Audio;
using Mdg.Client.Godot.Scripts.Combat;
using Mdg.Client.Godot.Scripts.Common;
using Mdg.Client.Godot.Scripts.Entities;
using Mdg.Client.Godot.Scripts.UI;
using Mdg.Client.Godot.Scripts.World;
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
        [Export] public PackedScene? PlayerScene { get; set; }
        [Export] public PackedScene? MonsterScene { get; set; }
        [Export] public PackedScene? FloatingTextScene { get; set; }
        [Export] public PackedScene? ProjectileScene { get; set; }
        [Export] public PackedScene? SkillEffectScene { get; set; }
        [Export] public PackedScene? GroundLootScene { get; set; }
        [Export] public PackedScene? CompanionScene { get; set; }
        [Export] public MapManager? Map { get; set; }
        [Export] public HudController? Hud { get; set; }

        public GameWorld World { get; private set; } = default!;
        public GameTickScheduler Scheduler { get; private set; } = default!;
        public IEventBus EventBus => World.EventBus;
        public PresentationEventBridge EventBridge { get; private set; } = default!;

        public Character? LocalPlayer { get; private set; }
        public PlayerController? PlayerView { get; private set; }
        public CompanionView? CompanionView { get; private set; }

        private readonly Dictionary<Guid, (MonsterEntity Entity, MonsterView View)> _monsters = new();
        private float _cameraShakeDuration = 0f;
        private float _cameraShakeIntensity = 0f;

        public override void _Ready()
        {
            InitializeCoreSystems();
            InitializeMapAndZone();
            SpawnPlayer();
            SpawnCompanion();
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

        private void InitializeMapAndZone()
        {
            if (Map != null)
            {
                Map.LoadZone("SanctuaryHaven");
                Map.OnZoneChanged += HandleZoneChanged;
                Map.OnBannerRequested += (title, sub) =>
                {
                    Hud?.SetCombatStatus($"🌿 {title} — {sub}");
                };
            }
        }

        private void HandleZoneChanged(string targetZone, double targetX, double targetY)
        {
            if (Map == null || LocalPlayer == null) return;

            Map.LoadZone(targetZone);

            // Cập nhật vị trí người chơi
            var spawnPos = new Vector2((float)targetX, (float)targetY);
            if (PlayerView != null)
            {
                PlayerView.Position = spawnPos;
            }
            LocalPlayer.Position = new FixVector2((float)targetX, (float)targetY);

            // Dọn quái vật cũ và sinh quái vật theo vùng mới
            ClearMonsters();
            SpawnInitialMonsters();

            AudioManager.Instance?.PlayPortal();
            Hud?.SetCombatStatus($"🌀 Đã dịch chuyển đến [{targetZone}]!");
        }

        private void SpawnPlayer()
        {
            LocalPlayer = new Character("Hero_Aethelis");
            LocalPlayer.Position = new FixVector2(1500f, 1500f);

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
                pNode.Initialize(LocalPlayer, this, "Vanguard", "Male");
                PlayerView = pNode;
            }
        }

        private void SpawnCompanion()
        {
            if (CompanionScene != null && PlayerView != null)
            {
                var comp = CompanionScene.Instantiate<CompanionView>();
                AddChild(comp);
                comp.Position = PlayerView.Position + new Vector2(40, 40);
                comp.Setup(PlayerView, "🐾 Luna, Astral Pet", new Color(0.4f, 0.85f, 1f));
                CompanionView = comp;
            }
        }

        private void SpawnInitialMonsters()
        {
            var spawnConfigs = new[]
            {
                (Name: "Sylvan Stalker", Rarity: MonsterRarity.Normal, Pos: new Vector2(1300, 1400), BaseHp: 120f, BaseDmg: 15f),
                (Name: "Void Creeper", Rarity: MonsterRarity.Normal, Pos: new Vector2(1700, 1420), BaseHp: 150f, BaseDmg: 18f),
                (Name: "Abyssal Brute", Rarity: MonsterRarity.Champion, Pos: new Vector2(1200, 1700), BaseHp: 200f, BaseDmg: 25f),
                (Name: "Celestial Goliath", Rarity: MonsterRarity.Rare, Pos: new Vector2(1800, 1750), BaseHp: 280f, BaseDmg: 32f),
                (Name: "Malakor, Void Inquisitor", Rarity: MonsterRarity.PinnacleBoss, Pos: new Vector2(1500, 1100), BaseHp: 500f, BaseDmg: 45f),
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
                    mView.Initialize(monster, monsterPos, PlayerView);
                    _monsters[monster.Id] = (monster, mView);
                }
            }

            Hud?.UpdateMonstersAlive(_monsters.Count);
        }

        private void ClearMonsters()
        {
            foreach (var kvp in _monsters)
            {
                if (IsInstanceValid(kvp.Value.View))
                {
                    kvp.Value.View.QueueFree();
                }
            }
            _monsters.Clear();
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

            // 3. Xử lý Camera Shake
            if (_cameraShakeDuration > 0f && PlayerView?.Camera != null)
            {
                _cameraShakeDuration -= (float)delta;
                var offset = new Vector2(
                    (float)GD.RandRange(-_cameraShakeIntensity, _cameraShakeIntensity),
                    (float)GD.RandRange(-_cameraShakeIntensity, _cameraShakeIntensity)
                );
                PlayerView.Camera.Offset = offset;
            }
            else if (PlayerView?.Camera != null)
            {
                PlayerView.Camera.Offset = Vector2.Zero;
            }
        }

        public void TriggerCameraShake(float duration, float intensity)
        {
            _cameraShakeDuration = duration;
            _cameraShakeIntensity = intensity;
        }

        public void CastPlayerSkill(string skillId, Vector2 targetPos, Vector2 aimDir)
        {
            if (LocalPlayer == null || PlayerView == null) return;

            switch (skillId)
            {
                case "slash":
                    ExecuteSlash(targetPos, aimDir);
                    break;
                case "fireball":
                    ExecuteFireball(targetPos, aimDir);
                    break;
                case "frost":
                    ExecuteFrostNova();
                    break;
                case "dash":
                    ExecuteDash(aimDir);
                    break;
            }
        }

        private void ExecuteSlash(Vector2 targetPos, Vector2 aimDir)
        {
            if (LocalPlayer == null || PlayerView == null) return;

            float baseDmg = LocalPlayer.Stats.GetValue(StatType.PhysicalDamage);
            if (baseDmg <= 0) baseDmg = 45f;

            var payload = new DamagePayload
            {
                AttackerId = LocalPlayer.Id,
                AccuracyRating = LocalPlayer.Stats.GetValue(StatType.AccuracyRating),
                CritChance = LocalPlayer.Stats.GetValue(StatType.CriticalStrikeChance),
                CritMultiplier = LocalPlayer.Stats.GetValue(StatType.CriticalStrikeMultiplier)
            };
            payload.AddPortion(DamageType.Physical, baseDmg);

            // Spawn VFX chém kiếm
            if (SkillEffectScene != null)
            {
                var vfx = SkillEffectScene.Instantiate<SkillEffectView>();
                AddChild(vfx);
                vfx.Setup("slash", PlayerView.GlobalPosition + aimDir * 40f, 90f, new Color(1f, 0.85f, 0.2f), 0.25f);
                vfx.Rotation = aimDir.Angle();
            }

            EventBus.Publish(new SkillExecutedEvent
            {
                CasterId = LocalPlayer.Id,
                SkillId = "slash_cleave",
                TargetPosition = new FixVector2(targetPos.X, targetPos.Y)
            });

            ApplyAreaDamage(PlayerView.Position.ToFixVector2() + aimDir.ToFixVector2() * 40f, 95f, payload);
        }

        private void ExecuteFireball(Vector2 targetPos, Vector2 aimDir)
        {
            if (LocalPlayer == null || PlayerView == null) return;

            float fireDmg = 75f;
            var payload = new DamagePayload
            {
                AttackerId = LocalPlayer.Id,
                AccuracyRating = 500f,
                CritChance = 20f,
                CritMultiplier = 180f
            };
            payload.AddPortion(DamageType.Fire, fireDmg);

            // Spawn Projectile Fireball bay về phía mục tiêu
            if (ProjectileScene != null)
            {
                var proj = ProjectileScene.Instantiate<ProjectileView>();
                AddChild(proj);
                proj.Setup("fireball", PlayerView.GlobalPosition, aimDir, payload, 110f, (explodePos, rad, pLoad) =>
                {
                    // Spawn VFX nổ lửa
                    if (SkillEffectScene != null)
                    {
                        var expVfx = SkillEffectScene.Instantiate<SkillEffectView>();
                        AddChild(expVfx);
                        expVfx.Setup("meteor", explodePos, rad, new Color(1f, 0.45f, 0.1f), 0.35f);
                    }

                    TriggerCameraShake(0.15f, 4f);
                    ApplyAreaDamage(explodePos.ToFixVector2(), rad, pLoad);
                });
            }

            EventBus.Publish(new SkillExecutedEvent
            {
                CasterId = LocalPlayer.Id,
                SkillId = "pyro_fireball",
                TargetPosition = new FixVector2(targetPos.X, targetPos.Y)
            });
        }

        private void ExecuteFrostNova()
        {
            if (LocalPlayer == null || PlayerView == null) return;

            float coldDmg = 55f;
            var payload = new DamagePayload
            {
                AttackerId = LocalPlayer.Id,
                AccuracyRating = 500f,
                CritChance = 30f,
                CritMultiplier = 160f
            };
            payload.AddPortion(DamageType.Cold, coldDmg);

            // Spawn VFX vòng tròn sóng băng mở rộng
            if (SkillEffectScene != null)
            {
                var vfx = SkillEffectScene.Instantiate<SkillEffectView>();
                AddChild(vfx);
                vfx.Setup("frost_nova", PlayerView.GlobalPosition, 160f, new Color(0.2f, 0.85f, 1f), 0.35f);
            }

            TriggerCameraShake(0.2f, 3f);

            EventBus.Publish(new SkillExecutedEvent
            {
                CasterId = LocalPlayer.Id,
                SkillId = "frost_nova",
                TargetPosition = LocalPlayer.Position
            });

            ApplyAreaDamage(PlayerView.Position.ToFixVector2(), 160f, payload);
        }

        private void ExecuteDash(Vector2 aimDir)
        {
            if (LocalPlayer == null || PlayerView == null) return;

            if (aimDir == Vector2.Zero)
            {
                aimDir = PlayerView.PlayerSprite != null && PlayerView.PlayerSprite.FlipH ? Vector2.Left : Vector2.Right;
            }

            // Spawn Dash Ghost VFX
            if (SkillEffectScene != null)
            {
                var vfx = SkillEffectScene.Instantiate<SkillEffectView>();
                AddChild(vfx);
                vfx.Setup("dash", PlayerView.GlobalPosition, 30f, new Color(0.3f, 0.7f, 1f), 0.25f);
            }

            PlayerView.Position += aimDir * 160f;
            LocalPlayer.Position = PlayerView.Position.ToFixVector2();
        }

        public void ApplyAreaDamage(FixVector2 center, float radius, DamagePayload payload)
        {
            float radiusSq = radius * radius;
            var damagedMonsters = new List<(MonsterEntity Entity, MonsterView View)>();

            foreach (var kvp in _monsters)
            {
                var (entity, view) = kvp.Value;
                if (!entity.IsAlive || !IsInstanceValid(view)) continue;

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
            if (_monsters.TryGetValue(e.TargetId, out var tuple) && IsInstanceValid(tuple.View))
            {
                tuple.View.TakeHitVisualFeedback(e.IsCrit);
            }

            AudioManager.Instance?.PlayHit(e.IsCrit);

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
                    color = new Color(1f, 0.9f, 0.2f);
                }
                else if (e.IsBlocked)
                {
                    text = "BLOCKED";
                    color = new Color(0.4f, 0.7f, 1f);
                }

                fct.Setup(text, color);
            }
        }

        private void HandleDeathEffect(DeathEffectArgs e)
        {
            if (_monsters.TryGetValue(e.TargetId, out var tuple))
            {
                var deathPos = tuple.View.GlobalPosition;
                tuple.View.PlayDeathAnimation();
                _monsters.Remove(e.TargetId);
                Hud?.UpdateMonstersAlive(_monsters.Count);

                // Rơi vật phẩm / vàng khi quái vật bị hạ gục
                SpawnGroundLoot(deathPos, tuple.Entity);

                if (_monsters.Count == 0)
                {
                    AudioManager.Instance?.PlayLevelUp();
                    Hud?.SetCombatStatus("🎉 CHIẾN THẮNG! Đã quét sạch quái vật vùng đất Aethelis!");
                }
            }
        }

        private void SpawnGroundLoot(Vector2 pos, MonsterEntity monster)
        {
            if (GroundLootScene == null) return;

            var lootNode = GroundLootScene.Instantiate<GroundLootView>();
            AddChild(lootNode);
            lootNode.Position = pos + new Vector2((float)GD.RandRange(-20, 20), (float)GD.RandRange(-20, 20));

            AudioManager.Instance?.PlayLootDrop(monster.Rarity.ToString());

            var rand = new Random();
            int gold = rand.Next(15, 60);

            if (monster.Rarity == MonsterRarity.Rare || monster.Rarity == MonsterRarity.PinnacleBoss)
            {
                lootNode.Setup("item_dragon_axe", "Rìu Long Cốt Huyền Thoại", "Rare", gold * 3);
            }
            else
            {
                lootNode.Setup("gold_drop", $"🪙 {gold} Vàng", "Normal", gold);
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
