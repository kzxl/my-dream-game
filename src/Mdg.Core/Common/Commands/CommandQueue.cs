using System;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace Mdg.Core.Common.Commands
{
    public interface ICommandHandler<in TCommand> where TCommand : ICommand
    {
        CommandResult Handle(TCommand command);
    }

    /// <summary>
    /// Hàng đợi lệnh (Command Queue) lưu trữ các hành động người chơi gửi lên và xử lý tuần tự trong mỗi game tick.
    /// </summary>
    public sealed class CommandQueue
    {
        private readonly ConcurrentQueue<ICommand> _incomingQueue = new();
        private readonly Dictionary<Type, Action<ICommand>> _handlers = new();

        public void Enqueue(ICommand command)
        {
            if (command != null)
            {
                _incomingQueue.Enqueue(command);
            }
        }

        public void RegisterHandler<TCommand>(ICommandHandler<TCommand> handler) where TCommand : ICommand
        {
            _handlers[typeof(TCommand)] = cmd => handler.Handle((TCommand)cmd);
        }

        public int ProcessAll()
        {
            int count = 0;
            while (_incomingQueue.TryDequeue(out var command))
            {
                if (_handlers.TryGetValue(command.GetType(), out var handler))
                {
                    handler(command);
                    count++;
                }
            }
            return count;
        }

        public void Clear()
        {
            while (_incomingQueue.TryDequeue(out _)) { }
        }
    }
}
