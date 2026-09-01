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
        private readonly List<GroundLootView> _groundLoots = new();

        // Flask System (PoE Style 4 Flasks)
        private readonly int[] _flaskCharges = new int[] { 3, 3, 2, 2 };
        private readonly int[] _flaskMaxCharges = new int[] { 3, 3, 2, 2 };

        private float _cameraShakeDuration = 0f;
        private float _cameraShakeIntensity = 0f;

        // Boss Tracking
        private MonsterEntity? _activeBossEntity;
        private float _bossMaxStagger = 300f;
        private float _bossCurrentStagger = 0f;
        private bool _isBossStaggered = false;
        private float _staggerRecoveryTimer = 0f;

        public override void _Ready()
        {
            InitializeCoreSystems();
            InitializeMapAndZone();
            SpawnPlayer();
            SpawnCompanion();
            SpawnMonstersForCurrentZone();
        }

        private void InitializeCoreSystems()
        {
            World = new GameWorld();
            World.Initialize();
            Scheduler = new GameTickScheduler(World, 30f);

            EventBridge = new PresentationEventBridge(World.EventBus);

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

            var spawnPos = new Vector2((float)targetX, (float)targetY);
            if (PlayerView != null)
            {
                PlayerView.Position = spawnPos;
            }
            LocalPlayer.Position = new FixVector2((float)targetX, (float)targetY);

            // Sinh quái vật chính xác theo ZoneMap
            SpawnMonstersForCurrentZone();

            AudioManager.Instance?.PlayPortal();
            Hud?.SetCombatStatus($"🌀 Đã dịch chuyển đến [{targetZone}]!");
        }

        private void SpawnPlayer()
        {
            LocalPlayer = new Character("Hero_Aethelis");
            LocalPlayer.Position = new FixVector2(1500f, 1500f);

            LocalPlayer.Stats.SetBaseValue(StatType.MaxLife, 250f);
            LocalPlayer.Stats.SetBaseValue(StatType.MaxMana, 120f);
            LocalPlayer.Stats.SetBaseValue(StatType.MaxEnergyShield, 100f);
            LocalPlayer.Stats.SetBaseValue(StatType.PhysicalDamage, 45f);
            LocalPlayer.Stats.SetBaseValue(StatType.MovementSpeed, 240f);
            LocalPlayer.Stats.SetBaseValue(StatType.CriticalStrikeChance, 20f);
            LocalPlayer.Stats.SetBaseValue(StatType.CriticalStrikeMultiplier, 175f);
            LocalPlayer.Stats.SetBaseValue(StatType.AccuracyRating, 500f);
            LocalPlayer.Stats.SetBaseValue(StatType.Armor, 120f);
            LocalPlayer.Stats.SetBaseValue(StatType.FireResistance, 35f);
            LocalPlayer.Stats.SetBaseValue(StatType.ColdResistance, 35f);
            LocalPlayer.Stats.SetBaseValue(StatType.LightningResistance, 35f);
            LocalPlayer.ResetResources();

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

        private void SpawnMonstersForCurrentZone()
        {
            ClearMonsters();

            if (Map?.CurrentMap == null) return;

            var spawners = Map.CurrentMap.MonsterSpawns;
            if (spawners == null || spawners.Count == 0)
            {
                // Thị trấn an toàn (Sanctuary Haven) -> Không có quái vật hoang dã
                Hud?.UpdateMonstersAlive(0);
                return;
            }

            var rand = new Random();

            foreach (var sp in spawners)
            {
                if (sp.Type == "boss")
                {
                    var boss = new MonsterEntity("Malakor, Void Inquisitor", MonsterRarity.PinnacleBoss, 800f, 55f);
                    boss.AddAffix(MonsterAffixType.AetherWard);
                    boss.AddAffix(MonsterAffixType.MagmaConduit);
                    _activeBossEntity = boss;
                    _bossCurrentStagger = 0f;
                    _isBossStaggered = false;
                    Hud?.ShowBossHud(boss.Name, boss.CurrentHealth, boss.MaxHealth, 0f);

                    if (MonsterScene != null)
                    {
                        var mView = MonsterScene.Instantiate<MonsterView>();
                        AddChild(mView);
                        mView.Initialize(boss, new FixVector2((float)sp.X, (float)sp.Y), PlayerView);
                        _monsters[boss.Id] = (boss, mView);
                    }
                }
                else
                {
                    // Sinh thủ lĩnh bầy đàn (Champion / Rare)
                    string mName = GetMonsterDisplayName(sp.Type);
                    var leaderRarity = rand.NextDouble() < 0.35 ? MonsterRarity.Rare : MonsterRarity.Champion;
                    float leaderHp = (sp.Type == "golem" || sp.Type == "spectre") ? 320f : 200f;
                    var leader = new MonsterEntity(mName, leaderRarity, leaderHp, 28f);
                    leader.AddAffix(MonsterAffixType.AetherWard);

                    if (MonsterScene != null)
                    {
                        var lView = MonsterScene.Instantiate<MonsterView>();
                        AddChild(lView);
                        lView.Initialize(leader, new FixVector2((float)sp.X, (float)sp.Y), PlayerView);
                        _monsters[leader.Id] = (leader, lView);

                        // Sinh các quái vật tay sai đi kèm trong bầy
                        int minionCount = Math.Max(2, sp.Count - 1);
                        for (int i = 0; i < minionCount; i++)
                        {
                            float offsetX = (float)GD.RandRange(-65, 65);
                            float offsetY = (float)GD.RandRange(-65, 65);
                            var minion = new MonsterEntity(mName, MonsterRarity.Normal, leaderHp * 0.55f, 16f);
                            var minionView = MonsterScene.Instantiate<MonsterView>();
                            AddChild(minionView);
                            minionView.Initialize(minion, new FixVector2((float)sp.X + offsetX, (float)sp.Y + offsetY), PlayerView);
                            _monsters[minion.Id] = (minion, minionView);
                        }
                    }
                }
            }

            Hud?.UpdateMonstersAlive(_monsters.Count);
        }

        private static string GetMonsterDisplayName(string type) => type switch
        {
            "wolf" => "Shadow Direwolf",
            "goblin" => "Goblin Raider",
            "skeleton" => "Skeleton Guard",
            "undead_knight" => "Undead Dreadknight",
            "frost_golem" => "Glacial Frost Golem",
            "fire_imp" => "Infernal Fire Imp",
            "magma_golem" => "Magma Behemoth",
            "void_spectre" => "Abyssal Shadow Spectre",
            "chaos_eye" => "Void Eye of Chaos",
            "tentacle_fiend" => "Dark Tentacle Fiend",
            "horror_stalker" => "Cosmic Horror Stalker",
            "storm_drake" => "Storm Drake Dragon",
            "fire_salamander" => "Molten Fire Salamander",
            "crystal_serpent" => "Frost Crystal Serpent",
            _ => "Toxic Slime"
        };

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
            _activeBossEntity = null;
            Hud?.HideBossHud();
        }

        public override void _PhysicsProcess(double delta)
        {
            Scheduler?.Advance((float)delta);

            if (LocalPlayer != null && Hud != null)
            {
                Hud.UpdatePlayerStats(LocalPlayer);
            }

            // Xử lý Stagger Boss
            if (_activeBossEntity != null && _activeBossEntity.IsAlive)
            {
                if (_isBossStaggered)
                {
                    _staggerRecoveryTimer -= (float)delta;
                    if (_staggerRecoveryTimer <= 0f)
                    {
                        _isBossStaggered = false;
                        _bossCurrentStagger = 0f;
                        Hud?.SetCombatStatus("⚠️ Boss đã hồi phục từ trạng thái Choáng (Stagger)!");
                    }
                }

                float staggerPct = Math.Min(100f, (_bossCurrentStagger / _bossMaxStagger) * 100f);
                Hud?.ShowBossHud(_activeBossEntity.Name, _activeBossEntity.CurrentHealth, _activeBossEntity.MaxHealth, staggerPct);
            }

            // Companion tự động nhặt đồ xung quanh
            ProcessCompanionAutoLoot();

            // Camera Shake
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

        private void ProcessCompanionAutoLoot()
        {
            if (CompanionView == null || !IsInstanceValid(CompanionView)) return;

            for (int i = _groundLoots.Count - 1; i >= 0; i--)
            {
                var loot = _groundLoots[i];
                if (!IsInstanceValid(loot))
                {
                    _groundLoots.RemoveAt(i);
                    continue;
                }

                float dist = CompanionView.GlobalPosition.DistanceTo(loot.GlobalPosition);
                if (dist < 180f)
                {
                    loot.PickUp();
                    _groundLoots.RemoveAt(i);
                    AudioManager.Instance?.PlayPickup();
                    Hud?.SetCombatStatus($"🐾 Linh thú đã tự động nhặt: {loot.ItemName}!");
                    break;
                }
            }
        }

        public void TriggerCameraShake(float duration, float intensity)
        {
            _cameraShakeDuration = duration;
            _cameraShakeIntensity = intensity;
        }

        public void UsePlayerFlask(int slot)
        {
            if (LocalPlayer == null || slot < 1 || slot > 4) return;
            int idx = slot - 1;

            if (_flaskCharges[idx] <= 0)
            {
                Hud?.SetCombatStatus($"⚠️ Bình thuốc [{slot}] đã hết lần dùng (0/{_flaskMaxCharges[idx]})! Hãy diệt quái để nạp lại.");
                return;
            }

            _flaskCharges[idx]--;
            AudioManager.Instance?.PlayPickup();

            switch (slot)
            {
                case 1: // Life Flask
                    float healAmount = 150f;
                    LocalPlayer.Heal(healAmount, EventBus, 0);
                    Hud?.SetCombatStatus($"🧪 Dùng Bình Máu Thánh: Hồi phục +{healAmount} HP! (Còn {_flaskCharges[idx]}/{_flaskMaxCharges[idx]})");
                    break;

                case 2: // Mana Flask
                    float manaAmount = 80f;
                    Hud?.SetCombatStatus($"🧪 Dùng Bình Năng Lượng: Hồi phục +{manaAmount} MP! (Còn {_flaskCharges[idx]}/{_flaskMaxCharges[idx]})");
                    break;

                case 3: // Quicksilver Flask
                    LocalPlayer.Stats.SetBaseValue(StatType.MovementSpeed, 340f);
                    Hud?.SetCombatStatus($"💨 Dùng Quicksilver Flask: +40% Tốc độ di chuyển trong 4s! (Còn {_flaskCharges[idx]}/{_flaskMaxCharges[idx]})");
                    GetTree().CreateTimer(4.0).Timeout += () =>
                    {
                        LocalPlayer?.Stats.SetBaseValue(StatType.MovementSpeed, 240f);
                    };
                    break;

                case 4: // Diamond Flask
                    LocalPlayer.Stats.SetBaseValue(StatType.CriticalStrikeChance, 60f);
                    Hud?.SetCombatStatus($"✨ Dùng Diamond Flask: Tăng vọt Tỉ lệ bạo kích (+60% Crit) trong 4s! (Còn {_flaskCharges[idx]}/{_flaskMaxCharges[idx]})");
                    GetTree().CreateTimer(4.0).Timeout += () =>
                    {
                        LocalPlayer?.Stats.SetBaseValue(StatType.CriticalStrikeChance, 20f);
                    };
                    break;
            }
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
                case "meteor":
                    ExecuteMeteor(targetPos, aimDir);
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

            if (SkillEffectScene != null)
            {
                var vfx = SkillEffectScene.Instantiate<SkillEffectView>();
                AddChild(vfx);
                vfx.Setup("slash", PlayerView.GlobalPosition + aimDir * 40f, 95f, new Color(1f, 0.85f, 0.2f), 0.25f);
                vfx.Rotation = aimDir.Angle();
            }

            EventBus.Publish(new SkillExecutedEvent
            {
                CasterId = LocalPlayer.Id,
                SkillId = "slash_cleave",
                TargetPosition = new FixVector2(targetPos.X, targetPos.Y)
            });

            ApplyAreaDamage(PlayerView.Position.ToFixVector2() + aimDir.ToFixVector2() * 40f, 95f, payload, 35f);
        }

        private void ExecuteFireball(Vector2 targetPos, Vector2 aimDir)
        {
            if (LocalPlayer == null || PlayerView == null) return;

            float fireDmg = 75f;
            var payload = new DamagePayload
            {
                AttackerId = LocalPlayer.Id,
                AccuracyRating = 500f,
                CritChance = 25f,
                CritMultiplier = 180f
            };
            payload.AddPortion(DamageType.Fire, fireDmg);

            if (ProjectileScene != null)
            {
                var proj = ProjectileScene.Instantiate<ProjectileView>();
                AddChild(proj);
                proj.Setup("fireball", PlayerView.GlobalPosition, aimDir, payload, 110f, (explodePos, rad, pLoad) =>
                {
                    if (SkillEffectScene != null)
                    {
                        var expVfx = SkillEffectScene.Instantiate<SkillEffectView>();
                        AddChild(expVfx);
                        expVfx.Setup("meteor", explodePos, rad, new Color(1f, 0.45f, 0.1f), 0.35f);
                    }

                    TriggerCameraShake(0.15f, 4f);
                    ApplyAreaDamage(explodePos.ToFixVector2(), rad, pLoad, 50f);
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

            ApplyAreaDamage(PlayerView.Position.ToFixVector2(), 160f, payload, 40f);
        }

        private void ExecuteMeteor(Vector2 targetPos, Vector2 aimDir)
        {
            if (LocalPlayer == null || PlayerView == null) return;

            float fireDmg = 140f;
            var payload = new DamagePayload
            {
                AttackerId = LocalPlayer.Id,
                AccuracyRating = 600f,
                CritChance = 35f,
                CritMultiplier = 200f
            };
            payload.AddPortion(DamageType.Fire, fireDmg);

            if (SkillEffectScene != null)
            {
                var vfx = SkillEffectScene.Instantiate<SkillEffectView>();
                AddChild(vfx);
                vfx.Setup("meteor", targetPos, 140f, new Color(1f, 0.3f, 0.1f), 0.45f);
            }

            TriggerCameraShake(0.3f, 7f);

            EventBus.Publish(new SkillExecutedEvent
            {
                CasterId = LocalPlayer.Id,
                SkillId = "meteor_strike",
                TargetPosition = new FixVector2(targetPos.X, targetPos.Y)
            });

            ApplyAreaDamage(targetPos.ToFixVector2(), 140f, payload, 90f);
        }

        private void ExecuteDash(Vector2 aimDir)
        {
            if (LocalPlayer == null || PlayerView == null) return;

            if (aimDir == Vector2.Zero)
            {
                aimDir = PlayerView.PlayerSprite != null && PlayerView.PlayerSprite.FlipH ? Vector2.Left : Vector2.Right;
            }

            if (SkillEffectScene != null)
            {
                var vfx = SkillEffectScene.Instantiate<SkillEffectView>();
                AddChild(vfx);
                vfx.Setup("dash", PlayerView.GlobalPosition, 30f, new Color(0.3f, 0.7f, 1f), 0.25f);
            }

            PlayerView.Position += aimDir * 180f;
            LocalPlayer.Position = PlayerView.Position.ToFixVector2();
        }

        public void ApplyAreaDamage(FixVector2 center, float radius, DamagePayload payload, float staggerGain = 20f)
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

            // Tương tác tấn công bù nhìn Dummy trong thị trấn
            var dummies = GetTree().GetNodesInGroup("Dummy");
            foreach (Node node in dummies)
            {
                if (node is TrainingDummy dummy && IsInstanceValid(dummy))
                {
                    float distSq = dummy.GlobalPosition.DistanceSquaredTo(new Vector2(center.X, center.Y));
                    if (distSq <= radiusSq)
                    {
                        float dmg = 0f;
                        foreach (var p in payload.Portions) dmg += p.Amount;
                        if (dmg <= 0f) dmg = 50f;

                        bool isCrit = (float)GD.RandRange(0, 100) <= payload.CritChance;
                        if (isCrit) dmg *= payload.CritMultiplier / 100f;

                        dummy.TakeHit(dmg, isCrit);
                        AudioManager.Instance?.PlayHit(isCrit);

                        if (FloatingTextScene != null)
                        {
                            var fct = FloatingTextScene.Instantiate<FloatingCombatText>();
                            AddChild(fct);
                            fct.Position = dummy.GlobalPosition + new Vector2((float)GD.RandRange(-15, 15), -25);
                            fct.Setup($"{MathF.Ceiling(dmg)}" + (isCrit ? " CRIT!" : ""), isCrit ? new Color(1f, 0.9f, 0.2f) : Colors.White);
                        }
                    }
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
                    float finalDmg = hitResult.TotalDamageDealt;

                    // Nếu Boss đang bị Stagger -> Nhận thêm +50% More Damage
                    if (entity == _activeBossEntity && _isBossStaggered)
                    {
                        finalDmg *= 1.5f;
                    }

                    entity.TakeDamage(finalDmg);

                    // Tích lũy Stagger cho Boss
                    if (entity == _activeBossEntity && !_isBossStaggered)
                    {
                        _bossCurrentStagger += staggerGain;
                        if (_bossCurrentStagger >= _bossMaxStagger)
                        {
                            _isBossStaggered = true;
                            _staggerRecoveryTimer = 4.0f; // 4s Stagger
                            TriggerCameraShake(0.4f, 8f);
                            Hud?.SetCombatStatus("⚡ BOSS ĐÃ BỊ CHOÁNG (STAGGER)! Sát thương nhận vào tăng +50% trong 4s!");
                        }
                    }

                    // Hút máu (Life Leech: 4% sát thương)
                    if (LocalPlayer != null)
                    {
                        float leech = finalDmg * 0.04f;
                        LocalPlayer.Heal(leech, EventBus, 0);
                    }

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

                // Nạp lại bình thuốc khi hạ gục quái
                RechargeFlasks();

                // Rơi vật phẩm / vàng khi quái vật bị hạ gục
                SpawnGroundLoot(deathPos, tuple.Entity);

                if (_monsters.Count == 0)
                {
                    AudioManager.Instance?.PlayLevelUp();
                    Hud?.SetCombatStatus("🎉 CHIẾN THẮNG! Đã quét sạch quái vật vùng đất Aethelis!");
                }
            }
        }

        private void RechargeFlasks()
        {
            for (int i = 0; i < _flaskCharges.Length; i++)
            {
                if (_flaskCharges[i] < _flaskMaxCharges[i])
                {
                    _flaskCharges[i]++;
                }
            }
        }

        private void SpawnGroundLoot(Vector2 pos, MonsterEntity monster)
        {
            if (GroundLootScene == null) return;

            var lootNode = GroundLootScene.Instantiate<GroundLootView>();
            AddChild(lootNode);
            lootNode.Position = pos + new Vector2((float)GD.RandRange(-20, 20), (float)GD.RandRange(-20, 20));
            _groundLoots.Add(lootNode);

            AudioManager.Instance?.PlayLootDrop(monster.Rarity.ToString());

            var rand = new Random();
            int gold = rand.Next(20, 80);

            if (monster.Rarity == MonsterRarity.Rare || monster.Rarity == MonsterRarity.PinnacleBoss)
            {
                lootNode.Setup("item_dragon_axe", "Rìu Long Cốt Huyền Thoại", "Rare", gold * 3);
            }
            else if (monster.Rarity == MonsterRarity.Champion)
            {
                lootNode.Setup("item_magic_blade", "Thanh Kiếm Phong Ma", "Magic", gold * 2);
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
