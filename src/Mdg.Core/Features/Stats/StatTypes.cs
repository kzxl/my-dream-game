namespace Mdg.Core.Features.Stats
{
    public enum StatType
    {
        // Core Resources
        Life = 1,
        MaxLife,
        Mana,
        MaxMana,
        EnergyShield,
        MaxEnergyShield,

        // Defenses
        Armor = 20,
        Evasion,
        BlockChance,
        SpellSuppressionChance,

        // Resistances (Cap mặc định: 75%)
        FireResistance = 40,
        ColdResistance,
        LightningResistance,
        ChaosResistance,
        MaxFireResistance,
        MaxColdResistance,
        MaxLightningResistance,
        MaxChaosResistance,

        // Offenses
        PhysicalDamage = 60,
        FireDamage,
        ColdDamage,
        LightningDamage,
        ChaosDamage,

        // Speed & Combat Modifiers
        AttackSpeed = 80,
        CastSpeed,
        MovementSpeed,
        CriticalStrikeChance,
        CriticalStrikeMultiplier,
        AccuracyRating,

        // Recovery
        LifeRegen = 100,
        ManaRegen,
        LifeLeechRate
    }

    public enum ModifierType
    {
        /// <summary>
        /// Cộng trừ giá trị phẳng trực tiếp vào Base (+10 Max Life, +5 Physical Damage).
        /// </summary>
        Flat = 1,

        /// <summary>
        /// Tăng giảm tỉ lệ % cộng dồn (e.g. 15% increased damage, 10% reduced damage = +5%).
        /// </summary>
        Increased = 2,

        /// <summary>
        /// Tăng giảm tỉ lệ % nhân độc lập (e.g. 30% more damage -> nhân 1.3).
        /// </summary>
        More = 3
    }
}
