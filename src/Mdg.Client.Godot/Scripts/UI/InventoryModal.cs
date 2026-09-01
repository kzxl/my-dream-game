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
        [Export] public GridContainer? EquipmentGrid { get; set; }
        [Export] public Control? ItemTooltip { get; set; }
        [Export] public Label? TooltipName { get; set; }
        [Export] public Label? TooltipType { get; set; }
        [Export] public Label? TooltipStats { get; set; }
        [Export] public Label? TooltipMods { get; set; }
        [Export] public Label? StatsSummaryLabel { get; set; }

        public bool IsOpen => Visible;
        private Character? _character;

        public override void _Ready()
        {
            Visible = false;
            if (ItemTooltip != null) ItemTooltip.Visible = false;
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

        public void RefreshUI()
        {
            if (_character == null) return;

            RenderBackpack();
            RenderEquipment();
            RenderStatsSummary();
        }

        private void RenderBackpack()
        {
            if (BackpackGrid == null || _character == null) return;

            foreach (Node child in BackpackGrid.GetChildren())
            {
                child.QueueFree();
            }

            // 32 ô túi đồ
            for (int i = 0; i < 32; i++)
            {
                int index = i;
                ItemEntity? item = (index < _character.Inventory.Count) ? _character.Inventory[index] : null;

                var slotBtn = new Button
                {
                    CustomMinimumSize = new Vector2(48, 48),
                    Text = item != null ? item.Icon : "",
                    TooltipText = ""
                };

                if (item != null)
                {
                    slotBtn.Modulate = GetRarityColor(item.Rarity);
                    slotBtn.MouseEntered += () => ShowItemTooltip(item);
                    slotBtn.MouseExited += HideTooltip;
                    slotBtn.Pressed += () => OnBackpackSlotClicked(item);
                }

                BackpackGrid.AddChild(slotBtn);
            }
        }

        private void RenderEquipment()
        {
            if (EquipmentGrid == null || _character == null) return;

            foreach (Node child in EquipmentGrid.GetChildren())
            {
                child.QueueFree();
            }

            var slots = new[]
            {
                (ItemSlot.Helm, "👑 Nón"),
                (ItemSlot.BodyArmor, "🥋 Áo Giáp"),
                (ItemSlot.MainHand, "🗡️ Vũ Khí Chính"),
                (ItemSlot.OffHand, "🛡️ Khiên/Vũ Khí Phụ"),
                (ItemSlot.Amulet, "📿 Dây Chuyền"),
                (ItemSlot.Ring, "💍 Nhẫn")
            };

            foreach (var (slot, label) in slots)
            {
                _character.EquippedItems.TryGetValue(slot, out var item);

                var slotBtn = new Button
                {
                    CustomMinimumSize = new Vector2(56, 56),
                    Text = item != null ? $"{item.Icon}\n{slot}" : $"[{label}]",
                    ClipText = true
                };

                if (item != null)
                {
                    slotBtn.Modulate = GetRarityColor(item.Rarity);
                    slotBtn.MouseEntered += () => ShowItemTooltip(item);
                    slotBtn.MouseExited += HideTooltip;
                    slotBtn.Pressed += () =>
                    {
                        _character.UnequipItem(slot);
                        RefreshUI();
                    };
                }

                EquipmentGrid.AddChild(slotBtn);
            }
        }

        private void RenderStatsSummary()
        {
            if (StatsSummaryLabel == null || _character == null) return;

            float life = _character.Stats.GetValue(StatType.MaxLife);
            float mana = _character.Stats.GetValue(StatType.MaxMana);
            float es = _character.Stats.GetValue(StatType.MaxEnergyShield);
            float armor = _character.Stats.GetValue(StatType.Armor);
            float evasion = _character.Stats.GetValue(StatType.Evasion);
            float physDmg = _character.Stats.GetValue(StatType.PhysicalDamage);
            float critChance = _character.Stats.GetValue(StatType.CriticalStrikeChance);
            float critMulti = _character.Stats.GetValue(StatType.CriticalStrikeMultiplier);

            StatsSummaryLabel.Text = $"❤️ Máu: {life:0} | 💧 Mana: {mana:0} | 🛡️ Khiên ES: {es:0}\n" +
                                     $"⚔️ Sát thương: {physDmg:0} | ⚡ Bạo kích: {critChance:0}% (x{critMulti / 100f:0.0})\n" +
                                     $"🛡️ Giáp: {armor:0} | 💨 Né tránh: {evasion:0}";
        }

        private void OnBackpackSlotClicked(ItemEntity item)
        {
            if (_character == null) return;

            if (item.Slot != ItemSlot.None)
            {
                // Trang bị món đồ vào người
                _character.EquipItem(item);
                RefreshUI();
            }
            else if (item.Rarity == ItemRarity.Consumable)
            {
                // Sử dụng bình thuốc / cuộn giấy
                _character.Heal(120f, null!, 0);
                _character.Inventory.Remove(item);
                RefreshUI();
            }
        }

        private void ShowItemTooltip(ItemEntity item)
        {
            if (ItemTooltip == null) return;

            var rarityColor = GetRarityColor(item.Rarity);

            if (TooltipName != null)
            {
                TooltipName.Text = $"{item.Icon} {item.Name}";
                TooltipName.Modulate = rarityColor;
            }

            if (TooltipType != null)
            {
                string socketStr = item.Sockets > 0 ? $" | 🔗 {item.Sockets} Sockets ({item.SocketLinks} Linked)" : "";
                TooltipType.Text = $"[{item.Rarity}] {item.BaseType} (iLvl {item.ItemLevel}){socketStr}";
                TooltipType.Modulate = new Color(0.8f, 0.8f, 0.8f);
            }

            if (TooltipStats != null)
            {
                var statList = new List<string>();
                foreach (var kvp in item.StatBonuses)
                {
                    statList.Add($"• +{kvp.Value} {kvp.Key}");
                }
                TooltipStats.Text = statList.Count > 0 ? string.Join("\n", statList) : "Không có chỉ số cơ bản";
            }

            if (TooltipMods != null)
            {
                TooltipMods.Text = item.ExplicitMods.Count > 0 ? string.Join("\n", item.ExplicitMods) : "Không có thuộc tính phụ";
                TooltipMods.Modulate = new Color(0.4f, 0.85f, 1f);
            }

            ItemTooltip.Visible = true;
        }

        private void HideTooltip()
        {
            if (ItemTooltip != null) ItemTooltip.Visible = false;
        }

        private static Color GetRarityColor(ItemRarity rarity) => rarity switch
        {
            ItemRarity.Unique => new Color(0.95f, 0.45f, 0.15f),
            ItemRarity.Set => new Color(0.1f, 0.9f, 0.4f),
            ItemRarity.Rare => new Color(1f, 0.85f, 0.2f),
            ItemRarity.Magic => new Color(0.35f, 0.65f, 1f),
            ItemRarity.Currency => new Color(1f, 0.85f, 0.35f),
            ItemRarity.Consumable => new Color(0.4f, 0.9f, 0.9f),
            _ => new Color(0.85f, 0.85f, 0.85f)
        };
    }
}
