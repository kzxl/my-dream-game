using Godot;
using System;
using System.Collections.Generic;
using Mdg.Core.Entities;
using Mdg.Core.Features.Items;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class ForgeModal : Control
    {
        [Export] public Label? TargetItemLabel { get; set; }
        [Export] public Label? SuccessRateLabel { get; set; }
        [Export] public Label? MasteryRankLabel { get; set; }
        [Export] public Label? ResultStatusLabel { get; set; }
        [Export] public Button? EnhanceButton { get; set; }
        [Export] public HBoxContainer? InfusionMaterialsContainer { get; set; }

        public bool IsOpen => Visible;

        private Character? _character;
        private ItemEntity? _selectedItem;
        private int _currentLevel = 0;
        private int _infusedMaterialsCount = 0;

        public override void _Ready()
        {
            Visible = false;
            if (EnhanceButton != null)
            {
                EnhanceButton.Pressed += OnEnhanceClicked;
            }
        }

        public void Setup(Character character)
        {
            _character = character;
            RefreshUI();
        }

        public void Toggle()
        {
            Visible = !Visible;
            if (Visible)
            {
                // Chọn trang bị đầu tiên trong người nếu chưa chọn
                if (_selectedItem == null && _character != null && _character.Inventory.Count > 0)
                {
                    _selectedItem = _character.Inventory[0];
                }
                RefreshUI();
            }
        }

        public void SetItemToForge(ItemEntity item)
        {
            _selectedItem = item;
            _currentLevel = 0;
            _infusedMaterialsCount = 0;
            RefreshUI();
        }

        public void RefreshUI()
        {
            if (TargetItemLabel != null)
            {
                if (_selectedItem != null)
                {
                    string lvlStr = _currentLevel > 0 ? $" (+{_currentLevel})" : "";
                    TargetItemLabel.Text = $"{_selectedItem.Icon} {_selectedItem.Name}{lvlStr} [{_selectedItem.Rarity}]";
                }
                else
                {
                    TargetItemLabel.Text = "Chọn một món trang bị từ Túi Đồ để rèn đúc";
                }
            }

            // Tính tỷ lệ thành công theo cấp độ và nguyên liệu bổ trợ
            float baseRate = Math.Max(15f, 95f - (_currentLevel * 10f));
            float infusionBonus = _infusedMaterialsCount * 5f;
            float totalRate = Math.Min(100f, baseRate + infusionBonus);

            if (SuccessRateLabel != null)
            {
                SuccessRateLabel.Text = $"Tỷ lệ thành công: {totalRate:0}% (Cơ bản: {baseRate:0}% + Nạp nguyên liệu: +{infusionBonus:0}%)";
                SuccessRateLabel.Modulate = totalRate >= 70f ? new Color(0.2f, 0.9f, 0.4f) : new Color(1f, 0.8f, 0.2f);
            }

            if (MasteryRankLabel != null)
            {
                MasteryRankLabel.Text = "🏆 Thông thạo nghề rèn: Bậc 3 - Nghệ Nhân (Artisan Smith) [+6% Tỷ lệ thành công]";
            }
        }

        private void OnEnhanceClicked()
        {
            if (_selectedItem == null) return;

            float baseRate = Math.Max(15f, 95f - (_currentLevel * 10f));
            float infusionBonus = _infusedMaterialsCount * 5f;
            float totalRate = Math.Min(100f, baseRate + infusionBonus);

            var rand = new Random();
            bool isSuccess = rand.NextDouble() * 100f <= totalRate;

            if (isSuccess)
            {
                _currentLevel++;
                _selectedItem.AddMod($"+{_currentLevel * 10} Chỉ số cường hóa (+{_currentLevel})");
                if (ResultStatusLabel != null)
                {
                    ResultStatusLabel.Text = $"✨ ĐẠI THÀNH CÔNG! Trang bị đã đạt cấp độ +{_currentLevel}!";
                    ResultStatusLabel.Modulate = new Color(0.2f, 0.95f, 0.3f);
                }
            }
            else
            {
                if (ResultStatusLabel != null)
                {
                    ResultStatusLabel.Text = "⚠️ Cường hóa thất bại! Nhờ đặc quyền Nghệ Nhân nên phôi được bảo toàn an toàn.";
                    ResultStatusLabel.Modulate = new Color(1f, 0.3f, 0.3f);
                }
            }

            _infusedMaterialsCount = 0;
            RefreshUI();
        }
    }
}
