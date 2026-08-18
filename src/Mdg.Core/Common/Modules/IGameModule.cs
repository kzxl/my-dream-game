using System;
using System.Collections.Generic;

namespace Mdg.Core.Common.Modules
{
    public interface IGameWorld
    {
        long CurrentTick { get; }
        float TotalTime { get; }
        Common.Events.IEventBus EventBus { get; }
        Common.Commands.CommandQueue CommandQueue { get; }
        TModule GetModule<TModule>() where TModule : class, IGameModule;
    }

    /// <summary>
    /// Chuẩn module theo Universe Plugin Architecture v4.0.
    /// Mỗi hệ thống game (Combat, Inventory, Skill, AI) đóng vai trò là một module tự trị.
    /// </summary>
    public interface IGameModule
    {
        string Name { get; }
        int Priority { get; } // Thứ tự cập nhật trong tick (ưu tiên số nhỏ trước)
        void Initialize(IGameWorld world);
        void Update(float deltaTime, long currentTick);
        void Shutdown();
    }

    public sealed class ModuleRegistry
    {
        private readonly List<IGameModule> _modules = new();
        private readonly Dictionary<Type, IGameModule> _moduleLookup = new();
        private bool _isInitialized;
        private IGameWorld? _world;

        public void RegisterModule<TModule>(TModule module) where TModule : class, IGameModule
        {
            if (module == null) throw new ArgumentNullException(nameof(module));
            _modules.Add(module);
            _moduleLookup[typeof(TModule)] = module;

            if (_isInitialized && _world != null)
            {
                module.Initialize(_world);
                _modules.Sort((a, b) => a.Priority.CompareTo(b.Priority));
            }
        }

        public TModule GetModule<TModule>() where TModule : class, IGameModule
        {
            if (_moduleLookup.TryGetValue(typeof(TModule), out var module))
            {
                return (TModule)module;
            }
            throw new InvalidOperationException($"Module {typeof(TModule).Name} is not registered.");
        }

        public void InitializeAll(IGameWorld world)
        {
            _world = world;
            _modules.Sort((a, b) => a.Priority.CompareTo(b.Priority));
            foreach (var module in _modules)
            {
                module.Initialize(world);
            }
            _isInitialized = true;
        }

        public void UpdateAll(float deltaTime, long currentTick)
        {
            for (int i = 0; i < _modules.Count; i++)
            {
                _modules[i].Update(deltaTime, currentTick);
            }
        }

        public void ShutdownAll()
        {
            foreach (var module in _modules)
            {
                module.Shutdown();
            }
            _modules.Clear();
            _moduleLookup.Clear();
            _isInitialized = false;
        }
    }
}
