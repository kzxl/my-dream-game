using System;
using Mdg.Core.Common.Commands;
using Mdg.Core.Common.Events;
using Mdg.Core.Common.Modules;

namespace Mdg.Core.Engine
{
    /// <summary>
    /// GameWorld đại diện cho toàn bộ trạng thái của một Realm / Map / Session game độc lập.
    /// Có thể chạy trên Server (Authoritative) hoặc chạy trên Client (Singleplayer / Offline / Simulation).
    /// </summary>
    public sealed class GameWorld : IGameWorld
    {
        public long CurrentTick { get; private set; }
        public float TotalTime { get; private set; }
        public IEventBus EventBus { get; }
        public CommandQueue CommandQueue { get; }
        public ModuleRegistry Modules { get; }

        public GameWorld(IEventBus? eventBus = null, CommandQueue? commandQueue = null)
        {
            EventBus = eventBus ?? new InMemoryEventBus();
            CommandQueue = commandQueue ?? new CommandQueue();
            Modules = new ModuleRegistry();
        }

        public void Initialize()
        {
            Modules.InitializeAll(this);
        }

        public TModule GetModule<TModule>() where TModule : class, IGameModule
        {
            return Modules.GetModule<TModule>();
        }

        /// <summary>
        /// Bước tiến 1 Tick cố định (Fixed-Tick) độc lập với FPS render.
        /// </summary>
        public void Step(float deltaTime)
        {
            CurrentTick++;
            TotalTime += deltaTime;

            // 1. Xử lý toàn bộ lệnh input nhận được trong tick
            CommandQueue.ProcessAll();

            // 2. Cập nhật các modules theo thứ tự ưu tiên
            Modules.UpdateAll(deltaTime, CurrentTick);
        }

        public void Shutdown()
        {
            Modules.ShutdownAll();
            EventBus.Clear();
            CommandQueue.Clear();
        }
    }

    /// <summary>
    /// Điều phối vòng lặp tick cố định (ví dụ 30Hz hoặc 60Hz), tích lũy deltaTime từ frame rate thực tế.
    /// </summary>
    public sealed class GameTickScheduler
    {
        public float TargetTickRate { get; } // e.g. 30 = 30 ticks/giây
        public float FixedDeltaTime { get; } // 1 / 30 = 0.0333s

        private readonly GameWorld _world;
        private float _accumulator;

        public GameTickScheduler(GameWorld world, float targetTickRate = 30f)
        {
            _world = world ?? throw new ArgumentNullException(nameof(world));
            TargetTickRate = targetTickRate;
            FixedDeltaTime = 1f / targetTickRate;
        }

        /// <summary>
        /// Được gọi mỗi frame của Game Engine (hoặc Server Loop) truyền vào frame delta time thực.
        /// Tự động chia thành các fixed-ticks chính xác.
        /// </summary>
        public int Advance(float frameDeltaTime)
        {
            // Tránh "spiral of death" khi frame drop quá sâu
            frameDeltaTime = Math.Min(frameDeltaTime, 0.25f);
            _accumulator += frameDeltaTime;

            int ticksExecuted = 0;
            while (_accumulator >= FixedDeltaTime)
            {
                _world.Step(FixedDeltaTime);
                _accumulator -= FixedDeltaTime;
                ticksExecuted++;
            }

            return ticksExecuted;
        }
    }
}
