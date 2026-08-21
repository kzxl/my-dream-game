using Mdg.Core.Features.Combat;
using Xunit;

namespace Mdg.Core.Tests
{
    public sealed class BossStaggerTests
    {
        [Fact]
        public void StaggerState_AccumulatesStagger_Correctly()
        {
            var state = new StaggerState(100.0f);

            state.AddStagger(40.0f, out var triggered1);
            Assert.False(triggered1);
            Assert.Equal(40.0f, state.CurrentStagger);
            Assert.False(state.IsStaggered);

            state.AddStagger(60.0f, out var triggered2);
            Assert.True(triggered2);
            Assert.True(state.IsStaggered);
            Assert.Equal(6.0f, state.StaggerTimer);
        }

        [Fact]
        public void StaggerState_UpdatesTimer_AndRecovers()
        {
            var state = new StaggerState(100.0f);
            state.AddStagger(100.0f, out _);

            Assert.True(state.IsStaggered);

            state.Update(3.0f);
            Assert.True(state.IsStaggered);
            Assert.Equal(3.0f, state.StaggerTimer);

            state.Update(3.5f); // Stagger expires
            Assert.False(state.IsStaggered);
            Assert.Equal(0.0f, state.CurrentStagger);
        }
    }
}
