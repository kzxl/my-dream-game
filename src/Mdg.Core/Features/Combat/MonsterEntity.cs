using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Combat
{
    public sealed class MonsterEntity
    {
        public Guid Id { get; } = Guid.NewGuid();
        public string Name { get; set; }
        public MonsterRarity Rarity { get; set; }
        public float MaxHealth { get; set; }
        public float CurrentHealth { get; set; }
        public float BaseDamage { get; set; }
        public float MoveSpeed { get; set; }
        public float WardShield { get; set; } = 0f;
        public float MaxWardShield { get; set; } = 0f;

        public int Level { get; set; } = 1;

        // 3-Tier Defensive Layers
        public float EvasionChance { get; set; } = 0f;
        public float BlockChance { get; set; } = 0f;
        public float BlockMitigation { get; set; } = 75f; // 75% damage reduction on successful block
        public float Armor { get; set; } = 0f;
        public float FireResistance { get; set; } = 0f;
        public float ColdResistance { get; set; } = 0f;
        public float LightningResistance { get; set; } = 0f;
        public float ChaosResistance { get; set; } = 0f;

        public List<MonsterAffixType> Affixes { get; } = new();

        public bool IsAlive => CurrentHealth > 0;
        public float HealthPercentage => MaxHealth > 0 ? (CurrentHealth / MaxHealth) * 100f : 0f;

        public MonsterEntity(string name, MonsterRarity rarity, float baseHealth, float baseDamage, float moveSpeed = 100f, int level = 1)
        {
            Name = name;
            Rarity = rarity;
            MoveSpeed = moveSpeed;
            Level = Math.Max(1, level);

            // Scale HP và Damage dựa trên Cấp độ (Level) và Phẩm cấp (Rarity)
            float levelHpMult = 1.0f + (Level - 1) * 0.18f;
            float levelDmgMult = 1.0f + (Level - 1) * 0.12f;

            float hpMult = rarity switch
            {
                MonsterRarity.Champion => 3.5f,
                MonsterRarity.Rare => 8.0f,
                MonsterRarity.PinnacleBoss => 50.0f,
                _ => 1.0f
            };

            float dmgMult = rarity switch
            {
                MonsterRarity.Champion => 1.4f,
                MonsterRarity.Rare => 1.8f,
                MonsterRarity.PinnacleBoss => 2.5f,
                _ => 1.0f
            };

            MaxHealth = baseHealth * hpMult * levelHpMult;
            CurrentHealth = MaxHealth;
            BaseDamage = baseDamage * dmgMult * levelDmgMult;
        }

        public void AddAffix(MonsterAffixType affix)
        {
            if (!Affixes.Contains(affix))
            {
                Affixes.Add(affix);

                if (affix == MonsterAffixType.Gargantuan)
                {
                    MaxHealth *= 1.8f;
                    CurrentHealth = MaxHealth;
                    BaseDamage *= 1.3f;
                    MoveSpeed *= 0.8f;
                }
                else if (affix == MonsterAffixType.AetherWard)
                {
                    MaxWardShield = MaxHealth * 0.5f;
                    WardShield = MaxWardShield;
                }
            }
        }

        public float TakeDamage(float incomingDamage)
        {
            if (!IsAlive) return 0f;

            float remainingDmg = incomingDamage;

            // Absorb with AetherWard if active
            if (WardShield > 0)
            {
                float absorbed = Math.Min(WardShield, incomingDamage * 0.75f);
                WardShield -= absorbed;
                remainingDmg = incomingDamage - absorbed;
            }

            float actualDmg = Math.Min(CurrentHealth, remainingDmg);
            CurrentHealth -= actualDmg;
            return actualDmg;
        }

        public void Heal(float amount)
        {
            if (!IsAlive) return;
            CurrentHealth = Math.Min(MaxHealth, CurrentHealth + amount);
        }
    }
}
