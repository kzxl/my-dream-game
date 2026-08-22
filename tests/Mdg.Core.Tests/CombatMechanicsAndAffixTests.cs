using System;
using Mdg.Core.Features.Combat;
using Xunit;

namespace Mdg.Core.Tests;

public sealed class CombatMechanicsAndAffixTests
{
    [Fact]
    public void Bleed_MovingTarget_Deals_Triple_Damage()
    {
        float baseDotPerSec = 100.0f;
        float dt = 1.0f;

        float stationaryDmg = DamageCalculator.CalculateBleedDamage(baseDotPerSec, isMoving: false, dt);
        float movingDmg = DamageCalculator.CalculateBleedDamage(baseDotPerSec, isMoving: true, dt);

        Assert.Equal(100.0f, stationaryDmg);
        Assert.Equal(300.0f, movingDmg);
        Assert.Equal(3.0f, movingDmg / stationaryDmg);
    }

    [Fact]
    public void Shock_Scales_Between_10_And_50_Percent()
    {
        float lowShock = DamageCalculator.CalculateShockMultiplier(5.0f); // Clamped to 10%
        float midShock = DamageCalculator.CalculateShockMultiplier(30.0f); // 30% -> 1.3x
        float maxShock = DamageCalculator.CalculateShockMultiplier(65.0f); // Clamped to 50% -> 1.5x

        Assert.Equal(1.10f, lowShock, precision: 2);
        Assert.Equal(1.30f, midShock, precision: 2);
        Assert.Equal(1.50f, maxShock, precision: 2);
    }

    [Fact]
    public void BossStateMachine_Executes_3_Phases_Transitions()
    {
        var bossEntity = new MonsterEntity("Malakor", MonsterRarity.PinnacleBoss, baseHealth: 200, baseDamage: 50);
        var bossSM = new BossStateMachine(bossEntity);

        Assert.Equal(BossPhase.Phase1, bossSM.CurrentPhase);
        Assert.False(bossSM.IsEnraged);

        // Take damage down to 60% HP -> Phase 2 Transition
        float prevHp = bossEntity.CurrentHealth;
        bossEntity.CurrentHealth = bossEntity.MaxHealth * 0.60f;
        bossSM.UpdateHealth(prevHp, bossEntity.CurrentHealth);

        Assert.Equal(BossPhase.Phase2, bossSM.CurrentPhase);
        Assert.True(bossSM.IsInvulnerable);

        // Break shield and take damage down to 20% HP -> Phase 3 Enrage
        bossSM.BreakPhase2Shield();
        prevHp = bossEntity.CurrentHealth;
        bossEntity.CurrentHealth = bossEntity.MaxHealth * 0.20f;
        bossSM.UpdateHealth(prevHp, bossEntity.CurrentHealth);

        Assert.Equal(BossPhase.Phase3, bossSM.CurrentPhase);
        Assert.True(bossSM.IsEnraged);
        Assert.Equal(1.4f, bossSM.AttackSpeedMultiplier, precision: 1);
    }
}
