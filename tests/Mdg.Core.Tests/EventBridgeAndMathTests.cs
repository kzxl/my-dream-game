using System;
using Mdg.Client.Adapter.Bridges;
using Mdg.Core.Common.Events;
using Mdg.Core.Common.Math;
using Mdg.Core.Entities;
using Mdg.Core.Features.Combat;
using Mdg.Core.Features.Skills;
using Xunit;

namespace Mdg.Core.Tests
{
    public class EventBridgeAndMathTests
    {
        [Fact]
        public void WorldToIsometric_TransformsCoordinatesCorrectly()
        {
            var cartesian = new FixVector2(10f, 10f);
            var iso = IsometricUtils.WorldToIsometric(cartesian);

            // IsoX = X - Y = 10 - 10 = 0
            // IsoY = (X + Y) * 0.5 = (10 + 10) * 0.5 = 10
            Assert.Equal(0f, iso.X, precision: 3);
            Assert.Equal(10f, iso.Y, precision: 3);

            // Chuyển ngược lại
            var backToWorld = IsometricUtils.IsometricToWorld(iso);
            Assert.Equal(10f, backToWorld.X, precision: 3);
            Assert.Equal(10f, backToWorld.Y, precision: 3);
        }

        [Fact]
        public void PresentationBridge_ReceivesDamageAndConvertsToIsometricFx()
        {
            var eventBus = new InMemoryEventBus();
            var bridge = new PresentationEventBridge(eventBus);

            DamageEffectArgs? capturedEffect = null;
            bridge.OnDamageEffectRequested += args =>
            {
                capturedEffect = args;
            };

            var character = new Character("Hero")
            {
                Position = new FixVector2(20f, 10f)
            };

            var payload = new DamagePayload { AccuracyRating = 9999f };
            payload.AddPortion(DamageType.Physical, 50f);

            character.TakeDamage(payload, eventBus, currentTick: 100);

            Assert.NotNull(capturedEffect);
            Assert.Equal(character.Id, capturedEffect.TargetId);
            Assert.True(capturedEffect.TotalDamage > 0f);

            // Tọa độ isometric của (20, 10)
            // IsoX = 20 - 10 = 10
            // IsoY = (20 + 10) * 0.5 = 15
            Assert.Equal(10f, capturedEffect.ScreenIsoPosition.X, precision: 2);
            Assert.Equal(15f, capturedEffect.ScreenIsoPosition.Y, precision: 2);
        }

        [Fact]
        public void PresentationBridge_ReceivesSkillCastEffect()
        {
            var eventBus = new InMemoryEventBus();
            var bridge = new PresentationEventBridge(eventBus);

            SkillCastEffectArgs? capturedSkill = null;
            bridge.OnSkillCastEffectRequested += args =>
            {
                capturedSkill = args;
            };

            var character = new Character("Mage");
            var frostNova = new SkillDefinition("frost_nova", "Frost Nova", SkillTargetType.Self, baseCooldown: 1f, manaCost: 5f);
            character.Skills.AddSkill(frostNova);

            character.CastSkill("frost_nova", new FixVector2(5f, 5f), eventBus, currentTick: 1);

            Assert.NotNull(capturedSkill);
            Assert.Equal("frost_nova", capturedSkill.SkillId);
            Assert.Equal(character.Id, capturedSkill.CasterId);
        }
    }
}
