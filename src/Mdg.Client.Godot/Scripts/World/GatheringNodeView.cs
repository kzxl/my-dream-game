using Godot;
using System;
using Mdg.Client.Godot.Scripts.Common;

namespace Mdg.Client.Godot.Scripts.World
{
    public partial class GatheringNodeView : Area2D
    {
        [Export] public string NodeId { get; set; } = string.Empty;
        [Export] public string NodeName { get; set; } = "Quặng Sắt";
        [Export] public string ProfessionType { get; set; } = "mining"; // mining, herbalism, skinning
        [Export] public int RequiredLevel { get; set; } = 1;
        [Export] public string YieldItemId { get; set; } = "mat_iron_ore";
        [Export] public int MinYield { get; set; } = 2;
        [Export] public int MaxYield { get; set; } = 4;
        [Export] public int ExpGain { get; set; } = 25;
        [Export] public float ChannelTime { get; set; } = 1.0f;

        private Label? _nameLabel;
        private ProgressBar? _progressBar;
        private Sprite2D? _nodeSprite;
        private bool _isPlayerInside = false;
        private bool _isHarvesting = false;
        private float _currentChannel = 0f;
        private bool _isDepleted = false;
        private Texture2D? _nodeTexture;

        public event Action<GatheringNodeView, int>? OnNodeHarvested;

        public override void _Ready()
        {
            BodyEntered += OnBodyEntered;
            BodyExited += OnBodyExited;

            _nameLabel = GetNodeOrNull<Label>("NameLabel");
            _progressBar = GetNodeOrNull<ProgressBar>("ProgressBar");
            _nodeSprite = GetNodeOrNull<Sprite2D>("Sprite2D");

            _nodeTexture = TextureLoader.LoadTexture("res://Assets/gathering_nodes_pack.jpg", "black")
                ?? TextureLoader.LoadTexture("res://Assets/props_interactive_grid.png", "black");

            UpdateNodeVisuals();

            if (_progressBar != null)
            {
                _progressBar.Visible = false;
                _progressBar.MaxValue = ChannelTime;
                _progressBar.Value = 0;
            }

            UpdateDisplay();
        }

        public void Setup(string id, string name, string profType, int reqLevel, string yieldItem, Color color, float channelTime = 1.0f)
        {
            NodeId = id;
            NodeName = name;
            ProfessionType = profType;
            RequiredLevel = reqLevel;
            YieldItemId = yieldItem;
            ChannelTime = channelTime;

            if (_nodeSprite != null)
            {
                _nodeSprite.Modulate = color;
            }

            UpdateNodeVisuals();
            UpdateDisplay();
        }

        private void UpdateNodeVisuals()
        {
            if (_nodeSprite == null) return;

            string keyLower = (NodeId + " " + NodeName + " " + YieldItemId + " " + ProfessionType).ToLowerInvariant();

            if (ProfessionType == "herbalism" || keyLower.Contains("herb") || keyLower.Contains("lotus") || keyLower.Contains("flower") || keyLower.Contains("bloom"))
            {
                _nodeSprite.Texture = TextureLoader.LoadTexture("res://Assets/PixelCrawler/Environment/Props/Static/Vegetation.png");
            }
            else if (keyLower.Contains("aether") || keyLower.Contains("crystal"))
            {
                _nodeSprite.Texture = TextureLoader.LoadTexture("res://Assets/PixelCrawler/Environment/Props/Static/Esoteric.png");
            }
            else
            {
                _nodeSprite.Texture = TextureLoader.LoadTexture("res://Assets/PixelCrawler/Environment/Props/Static/Resources.png")
                    ?? TextureLoader.LoadTexture("res://Assets/PixelCrawler/Environment/Props/Static/Rocks.png");
            }

            _nodeSprite.Scale = new Vector2(1.5f, 1.5f);
            _nodeSprite.Offset = new Vector2(0, -10);
        }

        public override void _Process(double delta)
        {
            if (_isDepleted) return;

            if (_isPlayerInside && !_isHarvesting && Input.IsActionJustPressed("interact"))
            {
                StartHarvesting();
            }

            if (_isHarvesting)
            {
                _currentChannel += (float)delta;
                if (_progressBar != null)
                {
                    _progressBar.Value = _currentChannel;
                }

                if (_currentChannel >= ChannelTime)
                {
                    CompleteHarvesting();
                }
            }
        }

        private void StartHarvesting()
        {
            _isHarvesting = true;
            _currentChannel = 0f;
            if (_progressBar != null)
            {
                _progressBar.Visible = true;
                _progressBar.Value = 0;
            }
        }

        private void CompleteHarvesting()
        {
            _isHarvesting = false;
            _isDepleted = true;
            if (_progressBar != null)
            {
                _progressBar.Visible = false;
            }

            var rand = new Random();
            int yieldCount = rand.Next(MinYield, MaxYield + 1);

            // Mờ dần và tái sinh sau 15 giây
            if (_nodeSprite != null)
            {
                var tween = CreateTween();
                tween.TweenProperty(_nodeSprite, "modulate:a", 0.2f, 0.3f);
            }

            UpdateDisplay();
            OnNodeHarvested?.Invoke(this, yieldCount);

            // Hẹn giờ hồi sinh điểm tài nguyên
            GetTree().CreateTimer(15.0).Timeout += RespawnNode;
        }

        private void RespawnNode()
        {
            _isDepleted = false;
            _currentChannel = 0f;
            if (_nodeSprite != null)
            {
                var tween = CreateTween();
                tween.TweenProperty(_nodeSprite, "modulate:a", 1.0f, 0.5f);
            }
            UpdateDisplay();
        }

        private void OnBodyEntered(Node2D body)
        {
            if (body.Name == "Player" || body.IsInGroup("Player"))
            {
                _isPlayerInside = true;
                UpdateDisplay();
            }
        }

        private void OnBodyExited(Node2D body)
        {
            if (body.Name == "Player" || body.IsInGroup("Player"))
            {
                _isPlayerInside = false;
                _isHarvesting = false;
                if (_progressBar != null) _progressBar.Visible = false;
                UpdateDisplay();
            }
        }

        private void UpdateDisplay()
        {
            if (_nameLabel != null)
            {
                if (_isDepleted)
                {
                    _nameLabel.Text = $"{NodeName} (Đã khai thác)";
                    _nameLabel.Modulate = new Color(0.5f, 0.5f, 0.5f);
                }
                else if (_isPlayerInside)
                {
                    _nameLabel.Text = $"[F] Khai thác {NodeName} (Lv.{RequiredLevel})";
                    _nameLabel.Modulate = new Color(0.3f, 1f, 0.5f);
                }
                else
                {
                    _nameLabel.Text = NodeName;
                    _nameLabel.Modulate = Colors.White;
                }
            }
        }
    }
}
