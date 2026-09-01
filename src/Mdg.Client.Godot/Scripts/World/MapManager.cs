using Godot;
using System;
using System.Collections.Generic;
using Mdg.Client.Godot.Scripts.Common;
using Mdg.Client.Godot.Scripts.Entities;
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
        [Export] public PackedScene? DummyScene { get; set; }

        public ZoneMapDto? CurrentMap { get; private set; }
        public string CurrentZoneId { get; private set; } = "SanctuaryHaven";

        private Texture2D? _terrainTexture;
        private Texture2D? _waterTexture;
        private Texture2D? _treesTexture;
        private Texture2D? _foliageTexture;
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
            _terrainTexture = TextureLoader.LoadTexture("res://Assets/aethelis_terrain_tileset.jpg");
            _waterTexture = TextureLoader.LoadTexture("res://Assets/aethelis_water_liquid_tileset.jpg");
            _treesTexture = TextureLoader.LoadTexture("res://Assets/aethelis_trees_master_pack.jpg", "black")
                ?? TextureLoader.LoadTexture("res://Assets/nature_props_master_pack.png", "black");
            _foliageTexture = TextureLoader.LoadTexture("res://Assets/nature_props_master_pack.png", "black");
            _propsTexture = TextureLoader.LoadTexture("res://Assets/props_interactive_grid.png", "black")
                ?? TextureLoader.LoadTexture("res://Assets/props_pack.png", "black");
        }

        public ZoneMapDto LoadZone(string zoneId, double? spawnX = null, double? spawnY = null)
        {
            CurrentZoneId = zoneId;
            CurrentMap = ZoneMapGenerator.GenerateZone(zoneId);

            // Nạp lại texture nếu chưa nạp
            if (_terrainTexture == null) LoadTextures();

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

            // Sinh Training Dummies (ở làng Haven)
            SpawnDummies();

            // Sinh Props trang trí (Cây cối, đống lửa, hòm rương)
            SpawnProps();

            // Yêu cầu vẽ lại Tilemap
            QueueRedraw();

            OnBannerRequested?.Invoke(CurrentMap.Name, CurrentMap.Subtitle);

            return CurrentMap;
        }

        private void SpawnDummies()
        {
            if (CurrentMap == null || _environmentObjectsContainer == null || DummyScene == null) return;

            foreach (var dDto in CurrentMap.Dummies)
            {
                var dummyNode = DummyScene.Instantiate<TrainingDummy>();
                _environmentObjectsContainer.AddChild(dummyNode);
                dummyNode.Setup(dDto.Name, new Vector2((float)dDto.X, (float)dDto.Y));
            }
        }

        private void SpawnProps()
        {
            if (CurrentMap == null || _environmentObjectsContainer == null) return;

            foreach (var propDto in CurrentMap.Props)
            {
                var spr = new Sprite2D();
                string type = propDto.Type.ToLowerInvariant();

                if (IsTreeProp(type) && _treesTexture != null)
                {
                    // Master Trees Pack (4 cols x 3 rows)
                    float colW = _treesTexture.GetWidth() / 4f;
                    float rowH = _treesTexture.GetHeight() / 3f;
                    int col = 0, row = 0;

                    if (type.Contains("pine") || type.Contains("snow")) { col = 1; row = 0; }
                    else if (type.Contains("aether") || type.Contains("mystic")) { col = 2; row = 0; }
                    else if (type.Contains("volcanic") || type.Contains("basalt")) { col = 3; row = 0; }
                    else if (type.Contains("autumn") || type.Contains("maple")) { col = 0; row = 1; }
                    else if (type.Contains("mushroom")) { col = 1; row = 1; }
                    else if (type.Contains("willow")) { col = 2; row = 1; }
                    else if (type.Contains("cherry") || type.Contains("sakura")) { col = 3; row = 2; }
                    else { col = 0; row = 0; } // ancient oak

                    spr.Texture = new AtlasTexture
                    {
                        Atlas = _treesTexture,
                        Region = new Rect2(col * colW, row * rowH, colW, rowH)
                    };
                    spr.Scale = new Vector2(0.85f, 0.85f);
                    spr.Offset = new Vector2(0, -35);
                }
                else if (IsFloraProp(type) && _foliageTexture != null)
                {
                    // Foliage & Flora Pack (4 cols x 4 rows)
                    float colW = _foliageTexture.GetWidth() / 4f;
                    float rowH = _foliageTexture.GetHeight() / 4f;
                    int col = 0, row = 0;

                    if (type.Contains("blue")) { col = 1; row = 0; }
                    else if (type.Contains("gold")) { col = 2; row = 0; }
                    else if (type.Contains("purple") || type.Contains("mana")) { col = 3; row = 0; }
                    else if (type.Contains("bush")) { col = 0; row = 1; }
                    else if (type.Contains("tall_grass") || type.Contains("fern")) { col = 2; row = 1; }
                    else if (type.Contains("glow")) { col = 0; row = 2; }
                    else if (type.Contains("cyan")) { col = 1; row = 2; }
                    else if (type.Contains("clover")) { col = 2; row = 2; }
                    else if (type.Contains("lily")) { col = 3; row = 2; }
                    else if (type.Contains("wildflowers")) { col = 3; row = 3; }
                    else { col = 0; row = 0; } // flowers_red

                    spr.Texture = new AtlasTexture
                    {
                        Atlas = _foliageTexture,
                        Region = new Rect2(col * colW, row * rowH, colW, rowH)
                    };
                    spr.Scale = new Vector2(0.55f, 0.55f);
                    spr.Offset = new Vector2(0, -10);
                }
                else if (_propsTexture != null)
                {
                    // Interactive Props Pack (4 cols x 4 rows)
                    float colW = _propsTexture.GetWidth() / 4f;
                    float rowH = _propsTexture.GetHeight() / 4f;
                    int col = 0, row = 0;

                    if (type.Contains("gold")) { col = 1; row = 0; }
                    else if (type.Contains("crystal")) { col = 2; row = 0; }
                    else if (type.Contains("waypoint")) { col = 3; row = 0; }
                    else if (type.Contains("barrel")) { col = 0; row = 1; }
                    else if (type.Contains("vase") || type.Contains("pots")) { col = 1; row = 1; }
                    else if (type.Contains("lever")) { col = 2; row = 1; }
                    else if (type.Contains("campfire") || type.Contains("fire")) { col = 3; row = 1; }
                    else if (type.Contains("torch")) { col = 0; row = 2; }
                    else if (type.Contains("pile")) { col = 1; row = 2; }
                    else if (type.Contains("gargoyle")) { col = 2; row = 2; }
                    else if (type.Contains("gate")) { col = 3; row = 2; }
                    else { col = 0; row = 0; } // chest

                    spr.Texture = new AtlasTexture
                    {
                        Atlas = _propsTexture,
                        Region = new Rect2(col * colW, row * rowH, colW, rowH)
                    };
                    spr.Scale = new Vector2(0.55f, 0.55f);
                    spr.Offset = new Vector2(0, -15);
                }

                spr.Position = new Vector2((float)propDto.X, (float)propDto.Y);
                _environmentObjectsContainer.AddChild(spr);
            }
        }

        private static bool IsTreeProp(string type) =>
            type.Contains("tree") || type.Contains("pine") || type.Contains("oak") ||
            type.Contains("willow") || type.Contains("mushroom") || type.Contains("cherry");

        private static bool IsFloraProp(string type) =>
            type.Contains("flower") || type.Contains("bush") || type.Contains("grass") ||
            type.Contains("clover") || type.Contains("lily") || type.Contains("fern") ||
            type.Contains("bloom") || type.Contains("moss");

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

            var rand = new Random(CurrentZoneId.GetHashCode());
            int numNodes = 8;
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

                    if (i % 3 == 0)
                    {
                        nodeObj.Setup($"ore_{i}", "Quặng Aetherite", "mining", 1, "mat_aether_ore", new Color(0.2f, 0.85f, 1f), 1.2f);
                    }
                    else if (i % 3 == 1)
                    {
                        nodeObj.Setup($"herb_{i}", "Hoa Dạ Quang", "herbalism", 1, "mat_luna_bloom", new Color(0.4f, 1f, 0.4f), 0.9f);
                    }
                    else
                    {
                        nodeObj.Setup($"tree_{i}", "Gỗ Thần Cổ Đại", "mining", 1, "mat_elder_wood", new Color(0.85f, 0.6f, 0.3f), 1.0f);
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

                    switch (tile)
                    {
                        case 0: // Sàn cỏ tự nhiên
                            if (_terrainTexture != null)
                            {
                                int varCol = (x + y) % 3;
                                var srcRect = new Rect2(varCol * terCellW, 0, terCellW, terCellH);
                                DrawTextureRectRegion(_terrainTexture, destRect, srcRect);
                            }
                            else
                            {
                                DrawRect(destRect, new Color(0.12f, 0.25f, 0.12f));
                            }
                            break;

                        case 1: // Tường đá / vách núi
                            if (_terrainTexture != null)
                            {
                                var srcRect = new Rect2(0, 3 * terCellH, terCellW, terCellH);
                                DrawTextureRectRegion(_terrainTexture, destRect, srcRect);
                                // Viền nổi 3D
                                DrawRect(new Rect2(x * tileSize, y * tileSize, tileSize, 3), new Color(1f, 1f, 1f, 0.15f));
                                DrawRect(new Rect2(x * tileSize, y * tileSize + tileSize - 4, tileSize, 4), new Color(0f, 0f, 0f, 0.35f));
                            }
                            else
                            {
                                DrawRect(destRect, new Color(0.2f, 0.2f, 0.25f));
                            }
                            break;

                        case 2: // Nước sâu (Azure Fluid)
                            if (_waterTexture != null)
                            {
                                int animCol = (x + y) % 4;
                                var srcRect = new Rect2(animCol * watCellW, 0, watCellW, watCellH);
                                DrawTextureRectRegion(_waterTexture, destRect, srcRect);
                            }
                            else
                            {
                                DrawRect(destRect, new Color(0.1f, 0.35f, 0.7f));
                            }
                            break;

                        case 3: // Đường lát đá (Cobblestone Path)
                        case 4: // Quảng trường (Plaza)
                            if (_terrainTexture != null)
                            {
                                int col = (x ^ y) % 2;
                                var srcRect = new Rect2(col * terCellW, 2 * terCellH, terCellW, terCellH);
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

                        case 14: // Bụi rậm ngụy trang (Camouflage Bush)
                            if (_terrainTexture != null)
                            {
                                var srcRect = new Rect2(0, 0, terCellW, terCellH);
                                DrawTextureRectRegion(_terrainTexture, destRect, srcRect);
                                DrawCircle(new Vector2(x * tileSize + tileSize / 2f, y * tileSize + tileSize / 2f), tileSize / 2.5f, new Color(0.18f, 0.55f, 0.25f, 0.85f));
                            }
                            break;

                        case 15: // Tường phá hủy (Destructible Wall)
                            DrawRect(destRect, new Color(0.28f, 0.22f, 0.18f));
                            DrawRect(new Rect2(x * tileSize + 3, y * tileSize + 3, tileSize - 6, tileSize - 6), new Color(1f, 0.85f, 0.2f), false, 1.5f);
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
