using System;
using System.Collections.Generic;
using Mdg.Core.Features.Stats;

namespace Mdg.Core.Features.Inventory
{
    public enum ItemRarity
    {
        Normal = 1,
        Magic = 2,
        Rare = 3,
        Unique = 4
    }

    public enum EquipmentSlotType
    {
        MainHand = 1,
        OffHand = 2,
        Helmet = 3,
        BodyArmor = 4,
        Gloves = 5,
        Boots = 6,
        Amulet = 7,
        Ring1 = 8,
        Ring2 = 9,
        Belt = 10
    }

    public sealed class ItemAffix
    {
        public string Name { get; }
        public StatModifier Modifier { get; }

        public ItemAffix(string name, StatModifier modifier)
        {
            Name = name;
            Modifier = modifier;
        }
    }

    public sealed class Item
    {
        public Guid UniqueId { get; } = Guid.NewGuid();
        public string ItemId { get; }
        public string Name { get; }
        public ItemRarity Rarity { get; }
        public EquipmentSlotType? AllowedSlot { get; }
        public int RequiredLevel { get; }
        public List<StatModifier> ImplicitModifiers { get; } = new();
        public List<ItemAffix> ExplicitAffixes { get; } = new();

        public Item(string itemId, string name, ItemRarity rarity, EquipmentSlotType? allowedSlot = null, int requiredLevel = 1)
        {
            ItemId = itemId;
            Name = name;
            Rarity = rarity;
            AllowedSlot = allowedSlot;
            RequiredLevel = requiredLevel;
        }

        public Item AddImplicit(StatType stat, ModifierType modType, float value)
        {
            ImplicitModifiers.Add(new StatModifier(stat, modType, value, this));
            return this;
        }

        public Item AddAffix(string name, StatType stat, ModifierType modType, float value)
        {
            ExplicitAffixes.Add(new ItemAffix(name, new StatModifier(stat, modType, value, this)));
            return this;
        }
    }

    public sealed class EquipmentManager
    {
        private readonly Dictionary<EquipmentSlotType, Item> _equippedItems = new();
        private readonly StatCollection _stats;

        public event Action<EquipmentSlotType, Item?>? OnEquipmentChanged;

        public EquipmentManager(StatCollection stats)
        {
            _stats = stats ?? throw new ArgumentNullException(nameof(stats));
        }

        public Item? GetItem(EquipmentSlotType slot)
        {
            return _equippedItems.TryGetValue(slot, out var item) ? item : null;
        }

        public bool Equip(EquipmentSlotType slot, Item item, out Item? unequippedItem)
        {
            unequippedItem = null;
            if (item.AllowedSlot.HasValue && item.AllowedSlot.Value != slot)
            {
                // Cho phép Ring1 và Ring2 dùng chung AllowedSlot = Ring1 hoặc Ring2
                bool isRing = (slot == EquipmentSlotType.Ring1 || slot == EquipmentSlotType.Ring2) &&
                              (item.AllowedSlot == EquipmentSlotType.Ring1 || item.AllowedSlot == EquipmentSlotType.Ring2);

                if (!isRing)
                {
                    return false;
                }
            }

            // Gỡ trang bị cũ nếu có
            if (_equippedItems.TryGetValue(slot, out var oldItem))
            {
                UnequipInternal(slot, oldItem);
                unequippedItem = oldItem;
            }

            // Gắn trang bị mới
            _equippedItems[slot] = item;
            ApplyItemModifiers(item);
            OnEquipmentChanged?.Invoke(slot, item);
            return true;
        }

        public bool Unequip(EquipmentSlotType slot, out Item? unequippedItem)
        {
            if (_equippedItems.TryGetValue(slot, out var item))
            {
                UnequipInternal(slot, item);
                _equippedItems.Remove(slot);
                unequippedItem = item;
                OnEquipmentChanged?.Invoke(slot, null);
                return true;
            }

            unequippedItem = null;
            return false;
        }

        private void UnequipInternal(EquipmentSlotType slot, Item item)
        {
            _stats.RemoveAllFromSource(item);
        }

        private void ApplyItemModifiers(Item item)
        {
            for (int i = 0; i < item.ImplicitModifiers.Count; i++)
            {
                _stats.AddModifier(item.ImplicitModifiers[i]);
            }

            for (int i = 0; i < item.ExplicitAffixes.Count; i++)
            {
                _stats.AddModifier(item.ExplicitAffixes[i].Modifier);
            }
        }
    }
}
