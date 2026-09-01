using Godot;
using System;
using System.Collections.Generic;
using Mdg.Core.Entities;
using Mdg.Core.Features.Items;
using Mdg.Core.Features.Stats;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class InventoryModal : Control
    {
        [Export] public GridContainer? BackpackGrid { get; set; }
        [Export] public Label? GoldLabel { get; set; }
        [Export] public Label? SparksLabel { get; set; }
        [Export] public Control? ItemTooltip { get; set; }
        [Export] public Label? TooltipName { get; set; }
        [Export] public Label? TooltipType { get; set; }
        [Export] public Label? TooltipStats { get; set; }
        [Export] public Label? TooltipMods { get; set; }

        public bool IsOpen => Visible;
        private Character? _character;

        public override void _Ready()
        {
            Visible = false;
            if (ItemTooltip != null) ItemTooltip.Visible = false;
            BuildBackpackSlots();
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
                RefreshUI();
            }
            else
            {
                if (ItemTooltip != null) ItemTooltip.Visible = false;
            }
        }

        private void BuildBackpackSlots()
        {
            if (BackpackGrid == null) return;

            foreach (Node child in BackpackGrid.GetChildren())
            {
                child.QueueFree();
            }

            // Tạo 32 ô túi đồ
            for (int i = 0; i < 32; i++)
            {
                int slotIndex = i;
                var btn = new Button
                {
                    CustomMinimumSize = new Vector2(48, 48),
                    Text = slotIndex switch
                    {
                        0 => "⚔️",
                        1 => "🛡️",
                        2 => "👢",
                        3 => "🧪",
                        4 => "📜",
                        _ => ""
                    }
                };

                btn.MouseEntered += () => ShowSlotTooltip(slotIndex);
                btn.MouseExited += HideTooltip;
                btn.Pressed += () => OnSlotClicked(slotIndex);

                BackpackGrid.AddChild(btn);
            }
        }

        public void RefreshUI()
        {
            if (GoldLabel != null) GoldLabel.Text = "🪙 1,500";
            if (SparksLabel != null) SparksLabel.Text = "✨ 24";
        }

        private void ShowSlotTooltip(int slotIndex)
        {
            if (ItemTooltip == null) return;

            string name = slotIndex switch
            {
                0 => "Thanh Kiếm Aethelis Rực Lửa",
                1 => "Khiên Hộ Vệ Thần Thánh",
                2 => "Giày Tốc Biến Phong Thần",
                3 => "Bình Máu Thánh",
                4 => "Cuộn Giấy Hồi Sinh",
                _ => ""
            };

            if (string.IsNullOrEmpty(name))
            {
                ItemTooltip.Visible = false;
                return;
            }

            string type = slotIndex switch
            {
                0 => "Vũ khí chính - Rare Two-Hand Sword",
                1 => "Trang bị phòng thủ - Rare Shield",
                2 => "Giày - Magic Boots",
                3 => "Bình thuốc - Consumable",
                4 => "Vật phẩm phụ trợ - Scroll",
                _ => "Item"
            };

            string stats = slotIndex switch
            {
                0 => "+45 Sát thương Vật lý\n+15% Tốc độ đánh",
                1 => "+60 Giáp\n+25% Kháng tất cả nguyên tố",
                2 => "+15% Tốc độ di chuyển",
                3 => "Hồi phục 150 Máu trong 3 giây",
                4 => "Hồi sinh tại chỗ khi tử trận",
                _ => ""
            };

            string mods = slotIndex switch
            {
                0 => "🔥 +25 Sát thương Lửa\n⚡ +10% Tỉ lệ bạo kích",
                1 => "🛡️ +40 Khiên Năng Lượng (Energy Shield)",
                _ => ""
            };

            if (TooltipName != null) TooltipName.Text = name;
            if (TooltipType != null) TooltipType.Text = type;
            if (TooltipStats != null) TooltipStats.Text = stats;
            if (TooltipMods != null) TooltipMods.Text = mods;

            ItemTooltip.Visible = true;
        }

        private void HideTooltip()
        {
            if (ItemTooltip != null) ItemTooltip.Visible = false;
        }

        private void OnSlotClicked(int slotIndex)
        {
            // Trang bị hoặc sử dụng vật phẩm
        }
    }
}
