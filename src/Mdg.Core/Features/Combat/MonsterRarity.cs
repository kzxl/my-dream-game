namespace Mdg.Core.Features.Combat
{
    public enum MonsterRarity
    {
        Normal = 0,
        Champion = 1,
        Rare = 2,
        PinnacleBoss = 3
    }

    public enum MonsterAffixType
    {
        MagmaConduit = 0,   // Fire damage + OnHit lava balls
        Frostpulse = 1,     // Periodic chill wave + Freeze chance
        StaticDischarge = 2,// Shock retaliation bolts on hit
        CorruptedMiasma = 3,// Death poison pool + Chaos DoT trail
        AetherWard = 4,     // 75% Damage absorption shield
        VampiricLeech = 5,  // 5% Life steal on hit
        TemporalSnare = 6,  // Slows player move & attack speed in radius
        Gargantuan = 7      // +80% HP, +30% Damage, -20% MoveSpeed
    }
}
