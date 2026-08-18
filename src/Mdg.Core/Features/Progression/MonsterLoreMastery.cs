namespace Mdg.Core.Features.Progression;

public enum MonsterLoreTier
{
    None = 0,
    Novice = 1,
    Adept = 2,
    Master = 3,
    Apex = 4
}

public sealed class MonsterLoreBonus
{
    public MonsterLoreTier Tier { get; set; } = MonsterLoreTier.None;
    public string TierTitle { get; set; } = "Unfamiliar";
    public float BonusDamagePercent { get; set; } = 0f;
    public float BonusCritChance { get; set; } = 0f;
    public float BonusCritMulti { get; set; } = 0f;
    public float DamageReductionPercent { get; set; } = 0f;
    public float BonusIir { get; set; } = 0f;
    public float BonusIiq { get; set; } = 0f;
}

public static class MonsterLoreMastery
{
    public static MonsterLoreTier CalculateTier(int killCount, bool isBoss = false)
    {
        if (isBoss)
        {
            return killCount switch
            {
                >= 25 => MonsterLoreTier.Apex,
                >= 12 => MonsterLoreTier.Master,
                >= 6 => MonsterLoreTier.Adept,
                >= 2 => MonsterLoreTier.Novice,
                _ => MonsterLoreTier.None
            };
        }

        return killCount switch
        {
            >= 500 => MonsterLoreTier.Apex,
            >= 150 => MonsterLoreTier.Master,
            >= 50 => MonsterLoreTier.Adept,
            >= 10 => MonsterLoreTier.Novice,
            _ => MonsterLoreTier.None
        };
    }

    public static MonsterLoreBonus GetBonus(int killCount, bool isBoss = false)
    {
        var tier = CalculateTier(killCount, isBoss);

        return tier switch
        {
            MonsterLoreTier.Apex => new MonsterLoreBonus
            {
                Tier = MonsterLoreTier.Apex,
                TierTitle = "Apex Nemesis",
                BonusDamagePercent = 30f,
                BonusCritChance = 15f,
                BonusCritMulti = 40f,
                DamageReductionPercent = 15f,
                BonusIir = 35f,
                BonusIiq = 20f
            },
            MonsterLoreTier.Master => new MonsterLoreBonus
            {
                Tier = MonsterLoreTier.Master,
                TierTitle = "Master Inquisitor",
                BonusDamagePercent = 20f,
                BonusCritChance = 10f,
                BonusCritMulti = 25f,
                DamageReductionPercent = 5f,
                BonusIir = 20f,
                BonusIiq = 10f
            },
            MonsterLoreTier.Adept => new MonsterLoreBonus
            {
                Tier = MonsterLoreTier.Adept,
                TierTitle = "Adept Slayer",
                BonusDamagePercent = 12f,
                BonusCritChance = 5f,
                BonusCritMulti = 0f,
                DamageReductionPercent = 0f,
                BonusIir = 10f,
                BonusIiq = 0f
            },
            MonsterLoreTier.Novice => new MonsterLoreBonus
            {
                Tier = MonsterLoreTier.Novice,
                TierTitle = "Novice Hunter",
                BonusDamagePercent = 5f,
                BonusCritChance = 0f,
                BonusCritMulti = 0f,
                DamageReductionPercent = 0f,
                BonusIir = 0f,
                BonusIiq = 0f
            },
            _ => new MonsterLoreBonus
            {
                Tier = MonsterLoreTier.None,
                TierTitle = "Unfamiliar",
                BonusDamagePercent = 0f,
                BonusCritChance = 0f,
                BonusCritMulti = 0f,
                DamageReductionPercent = 0f,
                BonusIir = 0f,
                BonusIiq = 0f
            }
        };
    }

    public static float ApplyDamageBonus(float baseDamage, int killCount, bool isBoss = false)
    {
        var bonus = GetBonus(killCount, isBoss);
        return baseDamage * (1f + bonus.BonusDamagePercent / 100f);
    }

    public static (float EffectiveCritChance, float EffectiveCritMulti) ApplyCritBonus(
        float baseCritChance, float baseCritMulti, int killCount, bool isBoss = false)
    {
        var bonus = GetBonus(killCount, isBoss);
        return (baseCritChance + bonus.BonusCritChance, baseCritMulti + bonus.BonusCritMulti);
    }
}
