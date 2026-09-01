using Godot;
using System;
using System.Collections.Generic;
using Mdg.Client.Godot.Scripts.Entities;
using Mdg.Client.Godot.Scripts.World;
using Mdg.Core.Entities;
using Mdg.Core.Features.Combat;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class MinimapWidget : Control
    {
        [Export] public float RadarRadius { get; set; } = 80f;
        [Export] public float WorldViewRadius { get; set; } = 800f; // Tương đương tầm nhìn 800px trong game

        private Node2D? _player;
        private readonly List<MonsterView> _monsters = new();
        private readonly List<PortalView> _portals = new();
        private readonly List<ShrineView> _shrines = new();
        private readonly List<GatheringNodeView> _nodes = new();

        public void BindWorldEntities(Node2D player, IEnumerable<MonsterView> monsters, IEnumerable<PortalView> portals, IEnumerable<ShrineView> shrines, IEnumerable<GatheringNodeView> nodes)
        {
            _player = player;
            _monsters.Clear();
            _monsters.AddRange(monsters);
            _portals.Clear();
            _portals.AddRange(portals);
            _shrines.Clear();
            _shrines.AddRange(shrines);
            _nodes.Clear();
            _nodes.AddRange(nodes);
        }

        public override void _Process(double delta)
        {
            QueueRedraw();
        }

        public override void _Draw()
        {
            Vector2 center = Size * 0.5f;

            // 1. Vẽ nền Radar hình tròn viền dạ quang
            DrawCircle(center, RadarRadius, new Color(0.05f, 0.08f, 0.12f, 0.85f));
            DrawArc(center, RadarRadius, 0, Mathf.Tau, 32, new Color(0.2f, 0.7f, 1f, 0.8f), 2.0f);
            DrawArc(center, RadarRadius * 0.5f, 0, Mathf.Tau, 24, new Color(0.2f, 0.7f, 1f, 0.25f), 1.0f);

            // Đường chữ thập radar
            DrawLine(center + new Vector2(-RadarRadius, 0), center + new Vector2(RadarRadius, 0), new Color(0.2f, 0.7f, 1f, 0.2f), 1.0f);
            DrawLine(center + new Vector2(0, -RadarRadius), center + new Vector2(0, RadarRadius), new Color(0.2f, 0.7f, 1f, 0.2f), 1.0f);

            if (_player == null || !IsInstanceValid(_player)) return;

            Vector2 playerPos = _player.GlobalPosition;
            float scaleRatio = RadarRadius / WorldViewRadius;

            // 2. Vẽ Portals (Cổng dịch chuyển - Xanh lam sáng)
            foreach (var portal in _portals)
            {
                if (!IsInstanceValid(portal)) continue;
                Vector2 diff = (portal.GlobalPosition - playerPos) * scaleRatio;
                if (diff.Length() <= RadarRadius - 4f)
                {
                    DrawCircle(center + diff, 4.5f, new Color(0.2f, 0.85f, 1f, 0.95f));
                }
            }

            // 3. Vẽ Shrines (Đền thờ - Vàng kim)
            foreach (var shrine in _shrines)
            {
                if (!IsInstanceValid(shrine)) continue;
                Vector2 diff = (shrine.GlobalPosition - playerPos) * scaleRatio;
                if (diff.Length() <= RadarRadius - 4f)
                {
                    DrawRect(new Rect2(center + diff - new Vector2(3.5f, 3.5f), new Vector2(7f, 7f)), new Color(1f, 0.85f, 0.2f, 0.95f));
                }
            }

            // 4. Vẽ Gathering Nodes (Quặng & Thảo dược - Xanh lá mạ)
            foreach (var node in _nodes)
            {
                if (!IsInstanceValid(node)) continue;
                Vector2 diff = (node.GlobalPosition - playerPos) * scaleRatio;
                if (diff.Length() <= RadarRadius - 4f)
                {
                    DrawCircle(center + diff, 3.0f, new Color(0.2f, 0.9f, 0.35f, 0.85f));
                }
            }

            // 5. Vẽ Quái vật trong bán kính Perception Proximity (320px)
            const float perceptionRadius = 380f;
            foreach (var monster in _monsters)
            {
                if (!IsInstanceValid(monster) || monster.CoreEntity == null || !monster.CoreEntity.IsAlive) continue;

                float dist = monster.GlobalPosition.DistanceTo(playerPos);
                if (dist <= perceptionRadius)
                {
                    Vector2 diff = (monster.GlobalPosition - playerPos) * scaleRatio;
                    if (diff.Length() <= RadarRadius - 3f)
                    {
                        if (monster.CoreEntity.Rarity == MonsterRarity.PinnacleBoss)
                        {
                            DrawCircle(center + diff, 6.0f, new Color(1f, 0.2f, 0.2f, 1.0f));
                            DrawCircle(center + diff, 3.0f, new Color(1f, 0.85f, 0.2f, 1.0f));
                        }
                        else if (monster.CoreEntity.Rarity == MonsterRarity.Rare || monster.CoreEntity.Rarity == MonsterRarity.Champion)
                        {
                            DrawCircle(center + diff, 4.0f, new Color(1f, 0.6f, 0.1f, 0.95f));
                        }
                        else
                        {
                            DrawCircle(center + diff, 2.5f, new Color(0.9f, 0.25f, 0.25f, 0.85f));
                        }
                    }
                }
            }

            // 6. Vẽ Người chơi ở trung tâm (🟢 Hero Dot)
            DrawCircle(center, 4.0f, new Color(1f, 1f, 1f));
            DrawCircle(center, 2.5f, new Color(0.1f, 0.9f, 0.4f));
        }
    }
}
