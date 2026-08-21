using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Combat
{
    public sealed class ShadowSoldierEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        public string Name { get; set; } = string.Empty;
        public string MonsterType { get; set; } = string.Empty;
        public int MaxLife { get; set; }
        public int CurrentLife { get; set; }
        public int Damage { get; set; }
        public float AttackSpeed { get; set; } = 1.0f;
        public string Rarity { get; set; } = "Normal";
        public float Duration { get; set; } = 60.0f; // 60s active battlefield presence
        public string Icon { get; set; } = "👤";
    }

    public static class ShadowExtractionEngine
    {
        public const int DEFAULT_MAX_SHADOW_ARMY = 3;
        public const float STAT_SCALING_RATIO = 0.60f; // 60% of original monster stats

        public static bool TryExtractShadow(
            string monsterName,
            string monsterType,
            string rarity,
            int baseLife,
            int baseDamage,
            List<ShadowSoldierEntity> currentArmy,
            int maxCapacity,
            out ShadowSoldierEntity? soldier,
            out string message)
        {
            soldier = null;
            if (currentArmy == null) currentArmy = new List<ShadowSoldierEntity>();
            maxCapacity = Math.Max(1, maxCapacity);

            // If at max capacity, remove oldest soldier
            if (currentArmy.Count >= maxCapacity)
            {
                currentArmy.RemoveAt(0);
            }

            int scaledLife = Math.Max(100, (int)(baseLife * STAT_SCALING_RATIO));
            int scaledDamage = Math.Max(20, (int)(baseDamage * STAT_SCALING_RATIO));

            soldier = new ShadowSoldierEntity
            {
                Name = $"Shadow {monsterName}",
                MonsterType = monsterType,
                Rarity = rarity,
                MaxLife = scaledLife,
                CurrentLife = scaledLife,
                Damage = scaledDamage,
                Duration = rarity == "Boss" ? 90.0f : 60.0f,
                Icon = rarity == "Boss" ? "👑" : "👤"
            };

            currentArmy.Add(soldier);
            message = $"✨ ARISE! Extracted Shadow Soldier: {soldier.Name} (HP: {soldier.MaxLife}, DMG: {soldier.Damage}). Army size: {currentArmy.Count}/{maxCapacity}.";
            return true;
        }
    }
}
