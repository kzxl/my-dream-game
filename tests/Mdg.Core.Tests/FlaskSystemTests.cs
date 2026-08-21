using Mdg.Core.Features.Items;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class FlaskSystemTests
    {
        [Fact]
        public void FlaskEntity_InitialCharges_AreFull()
        {
            var flask = new FlaskEntity("flask_life", "Divine Life Flask", FlaskType.Life, 60, 20, 4.0f, "🧪", "#ff4d4f");

            Assert.Equal(60, flask.CurrentCharges);
            Assert.Equal(60, flask.MaxCharges);
            Assert.True(flask.CanConsume());
        }

        [Fact]
        public void FlaskEntity_Consume_DeductsChargesCorrectly()
        {
            var flask = new FlaskEntity("flask_life", "Divine Life Flask", FlaskType.Life, 60, 20, 4.0f, "🧪", "#ff4d4f");

            var success = flask.TryConsume(out var msg);

            Assert.True(success);
            Assert.Equal(40, flask.CurrentCharges);
            Assert.Contains("Consumed Divine Life Flask", msg);
        }

        [Fact]
        public void FlaskEntity_DepletedCharges_FailsConsume()
        {
            var flask = new FlaskEntity("flask_quicksilver", "Quicksilver Flask", FlaskType.Quicksilver, 50, 30, 5.0f, "⚡", "#00f2fe");
            flask.CurrentCharges = 15; // less than 30 required

            var success = flask.TryConsume(out var msg);

            Assert.False(success);
            Assert.Equal(15, flask.CurrentCharges);
            Assert.Contains("Not enough charges", msg);
        }

        [Fact]
        public void FlaskEntity_AddCharges_CapsAtMax()
        {
            var flask = new FlaskEntity("flask_granite", "Granite Flask", FlaskType.Granite, 60, 30, 5.0f, "🛡️", "#ffd700");
            flask.CurrentCharges = 50;

            flask.AddCharges(25);

            Assert.Equal(60, flask.CurrentCharges); // capped at max 60
        }
    }
}
