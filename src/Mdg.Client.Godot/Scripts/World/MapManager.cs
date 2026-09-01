using Godot;
using System;
using System.Collections.Generic;
using Mdg.Core.Common.Math;
using Mdg.Core.Features.Combat;
using Mdg.Core.Features.Maps;

namespace Mdg.Client.Godot.Scripts.World
{
    public partial class MapManager : Node2D
    {
        [Export] public PackedScene? PortalScene { get; set; }
        [Export] public PackedScene? ShrineScene { get; set; }
        [Export] public PackedScene? GatheringNodeScene { get; set; }
        [Export] public PackedScene? NpcScene { get; set; }

        public ZoneMapDto? CurrentMap { get; private set; }
        public string CurrentZoneId { get; private set; } = "SanctuaryHaven";

        private Texture2D? _terrainTexture;
        private Texture2D? _waterTexture;
        private Texture2D? _natureTexture;
        private Texture2D? _propsTexture;

        private Node2D? _environmentObjectsContainer;
        private Node2D? _collisionContainer;

        public event Action<string, double, double>? OnZoneChanged;
        public event Action<string, string>? OnBannerRequested;

        public override void _Ready()
        {
            LoadTextures();

            _environmentObjectsContainer = new Node2D { Name = "EnvironmentObjects" };
            AddChild(_environmentObjectsContainer);

            _collisionContainer = new Node2D { Name = "MapCollisions" };
            AddChild(_collisionContainer);
        }

        private void LoadTextures()
        {
            if (ResourceLoader.Exists("res://Assets/aethelis_terrain_tileset.jpg"))
                _terrainTexture = GD.Load<Texture2D>("res://Assets/aethelis_terrain_tileset.jpg");

            if (ResourceLoader.Exists("res://Assets/aethelis_water_liquid_tileset.jpg"))
                _waterTexture = GD.Load<Texture2D>("res://Assets/aethelis_water_liquid_tileset.jpg");

            if (ResourceLoader.Exists("res://Assets/nature_props_master_pack.png"))
                _natureTexture = GD.Load<Texture2D>("res://Assets/nature_props_master_pack.png");

            if (ResourceLoader.Exists("res://Assets/props_pack.png"))
                _propsTexture = GD.Load<Texture2D>("res://Assets/props_pack.png");
        }

        public ZoneMapDto LoadZone(string zoneId, double? spawnX = null, double? spawnY = null)
        {
            CurrentZoneId = zoneId;
            CurrentMap = ZoneMapGenerator.GenerateZone(zoneId);

            // Xóa các vật thể cũ
            ClearOldZone();

            // Sinh collision tĩnh cho tường và chướng ngại vật
            BuildCollisions();

            // Sinh Portals
            SpawnPortals();

            // Sinh Shrines
            SpawnShrines();

            // Sinh Gathering Nodes
            SpawnGatheringNodes();

            // Sinh NPCs
            SpawnNpcs();

            // Yêu cầu vẽ lại Tilemap
            QueueRedraw();

            OnBannerRequested?.Invoke(CurrentMap.Name, CurrentMap.Subtitle);

            return CurrentMap;
        }

        private void ClearOldZone()
        {
            if (_environmentObjectsContainer != null)
            {
                foreach (Node child in _environmentObjectsContainer.GetChildren())
                {
                    child.QueueFree();
                }
            }

            if (_collisionContainer != null)
            {
                foreach (Node child in _collisionContainer.GetChildren())
                {
                    child.QueueFree();
                }
            }
        }

        private void BuildCollisions()
        {
            if (CurrentMap == null || _collisionContainer == null) return;

            int tileSize = CurrentMap.TileSize > 0 ? CurrentMap.TileSize : 48;
            var grid = CurrentMap.Grid;
            int height = grid.Count;
            int width = height > 0 ? grid[0].Count : 0;

            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    int tile = grid[y][x];
                    // 1: Tường, 2: Nước sâu, 10: Cột đá, 11: Vực thẳm, 15: Tường phá hủy
                    if (tile == 1 || tile == 2 || tile == 10 || tile == 11 || tile == 15)
                    {
                        var body = new StaticBody2D();
                        body.Position = new Vector2(x * tileSize + tileSize / 2f, y * tileSize + tileSize / 2f);

                        var colShape = new CollisionShape2D();
                        var rectShape = new RectangleShape2D();
                        rectShape.Size = new Vector2(tileSize, tileSize);
                        colShape.Shape = rectShape;

                        body.AddChild(colShape);
                        _collisionContainer.AddChild(body);
                    }
                }
            }
        }

        private void SpawnPortals()
        {
            if (CurrentMap == null || _environmentObjectsContainer == null || PortalScene == null) return;

            foreach (var pDto in CurrentMap.Portals)
            {
                var portalNode = PortalScene.Instantiate<PortalView>();
                _environmentObjectsContainer.AddChild(portalNode);
                portalNode.Position = new Vector2((float)pDto.X, (float)pDto.Y);
                portalNode.Setup(pDto.TargetZone, new Vector2((float)pDto.TargetX, (float)pDto.TargetY), pDto.Name);

                portalNode.OnPortalTriggered += (tgtZone, tgtPos) =>
                {
                    OnZoneChanged?.Invoke(tgtZone, tgtPos.X, tgtPos.Y);
                };
            }
        }

        private void SpawnShrines()
        {
            if (CurrentMap == null || _environmentObjectsContainer == null || ShrineScene == null) return;

            foreach (var poi in CurrentMap.Pois)
            {
                if (poi.Type == "shrine")
                {
                    var shrineNode = ShrineScene.Instantiate<ShrineView>();
                    _environmentObjectsContainer.AddChild(shrineNode);
                    shrineNode.Position = new Vector2((float)poi.X, (float)poi.Y);

                    var color = new Color(poi.Color);
                    shrineNode.Setup(poi.Id, poi.Name, poi.BuffType, (float)poi.BuffDuration, color);
                }
            }
        }

        private void SpawnGatheringNodes()
        {
            if (CurrentMap == null || _environmentObjectsContainer == null || GatheringNodeScene == null) return;

            // Sinh các điểm khai thác mẫu theo Biome
            var rand = new Random(CurrentZoneId.GetHashCode());
            int numNodes = 6;
            int tileSize = CurrentMap.TileSize > 0 ? CurrentMap.TileSize : 48;
            int maxX = CurrentMap.WidthInTiles;
            int maxY = CurrentMap.HeightInTiles;

            for (int i = 0; i < numNodes; i++)
            {
                int tx = rand.Next(4, Math.Max(5, maxX - 4));
                int ty = rand.Next(4, Math.Max(5, maxY - 4));

                if (CurrentMap.Grid.Count > ty && CurrentMap.Grid[ty].Count > tx && CurrentMap.Grid[ty][tx] == 0)
                {
                    var nodeObj = GatheringNodeScene.Instantiate<GatheringNodeView>();
                    _environmentObjectsContainer.AddChild(nodeObj);
                    nodeObj.Position = new Vector2(tx * tileSize, ty * tileSize);

                    if (i % 2 == 0)
                    {
                        nodeObj.Setup($"ore_{i}", "Quặng Aetherite", "mining", 1, "mat_aether_ore", new Color(0.2f, 0.8f, 1f), 1.2f);
                    }
                    else
                    {
                        nodeObj.Setup($"herb_{i}", "Hoa Dạ Quang", "herbalism", 1, "mat_luna_bloom", new Color(0.4f, 1f, 0.4f), 0.9f);
                    }
                }
            }
        }

        private void SpawnNpcs()
        {
            if (CurrentMap == null || _environmentObjectsContainer == null || NpcScene == null) return;

            foreach (var npcDto in CurrentMap.Npcs)
            {
                var npcNode = NpcScene.Instantiate<NpcView>();
                _environmentObjectsContainer.AddChild(npcNode);
                npcNode.Position = new Vector2((float)npcDto.X, (float)npcDto.Y);

                var color = new Color(npcDto.Color);
                npcNode.Setup(npcDto.Name, npcDto.Title, color, $"Chào mừng bạn đến với {CurrentMap.Name}. Hãy cẩn trọng quái vật ngoài cổng thành!");
            }
        }

        public override void _Draw()
        {
            if (CurrentMap == null || CurrentMap.Grid == null) return;

            int tileSize = CurrentMap.TileSize > 0 ? CurrentMap.TileSize : 48;
            var grid = CurrentMap.Grid;
            int height = grid.Count;
            int width = height > 0 ? grid[0].Count : 0;

            float terCellW = _terrainTexture != null ? _terrainTexture.GetWidth() / 4f : 256f;
            float terCellH = _terrainTexture != null ? _terrainTexture.GetHeight() / 4f : 256f;
            float watCellW = _waterTexture != null ? _waterTexture.GetWidth() / 4f : 256f;
            float watCellH = _waterTexture != null ? _waterTexture.GetHeight() / 4f : 256f;

            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    int tile = grid[y][x];
                    var destRect = new Rect2(x * tileSize, y * tileSize, tileSize, tileSize);

                    // Tùy theo loại Tile vẽ texture hoặc fallback color
                    switch (tile)
                    {
                        case 0: // Sàn thường
                            if (_terrainTexture != null)
                            {
                                var srcRect = new Rect2(0, 0, terCellW, terCellH);
                                DrawTextureRectRegion(_terrainTexture, destRect, srcRect);
                            }
                            else
                            {
                                DrawRect(destRect, new Color(0.12f, 0.15f, 0.12f));
                            }
                            break;

                        case 1: // Tường đá / vách núi
                            if (_terrainTexture != null)
                            {
                                var srcRect = new Rect2(0, 3 * terCellH, terCellW, terCellH);
                                DrawTextureRectRegion(_terrainTexture, destRect, srcRect);
                            }
                            else
                            {
                                DrawRect(destRect, new Color(0.2f, 0.2f, 0.25f));
                            }
                            break;

                        case 2: // Nước sâu
                            if (_waterTexture != null)
                            {
                                var srcRect = new Rect2(0, 0, watCellW, watCellH);
                                DrawTextureRectRegion(_waterTexture, destRect, srcRect);
                            }
                            else
                            {
                                DrawRect(destRect, new Color(0.1f, 0.35f, 0.7f));
                            }
                            break;

                        case 3: // Đường lát đá
                        case 4: // Quảng trường
                            if (_terrainTexture != null)
                            {
                                var srcRect = new Rect2(terCellW, 2 * terCellH, terCellW, terCellH);
                                DrawTextureRectRegion(_terrainTexture, destRect, srcRect);
                            }
                            else
                            {
                                DrawRect(destRect, new Color(0.4f, 0.38f, 0.35f));
                            }
                            break;

                        case 5: // Dung nham (Lava)
                            if (_waterTexture != null)
                            {
                                var srcRect = new Rect2(watCellW, 3 * watCellH, watCellW, watCellH);
                                DrawTextureRectRegion(_waterTexture, destRect, srcRect);
                            }
                            else
                            {
                                DrawRect(destRect, new Color(0.85f, 0.25f, 0.1f));
                            }
                            break;

                        case 7: // Băng tuyết (Glacial Ice)
                            if (_waterTexture != null)
                            {
                                var srcRect = new Rect2(3 * watCellW, 3 * watCellH, watCellW, watCellH);
                                DrawTextureRectRegion(_waterTexture, destRect, srcRect);
                            }
                            else
                            {
                                DrawRect(destRect, new Color(0.2f, 0.75f, 0.95f));
                            }
                            break;

                        case 10: // Cột đá cổ đại
                            if (_terrainTexture != null)
                            {
                                var srcRect = new Rect2(terCellW, 3 * terCellH, terCellW, terCellH);
                                DrawTextureRectRegion(_terrainTexture, destRect, srcRect);
                            }
                            else
                            {
                                DrawRect(destRect, new Color(0.1f, 0.12f, 0.16f));
                            }
                            break;

                        default:
                            if (_terrainTexture != null)
                            {
                                var srcRect = new Rect2(0, 0, terCellW, terCellH);
                                DrawTextureRectRegion(_terrainTexture, destRect, srcRect);
                            }
                            else
                            {
                                DrawRect(destRect, new Color(0.15f, 0.18f, 0.15f));
                            }
                            break;
                    }
                }
            }
        }
    }
}
