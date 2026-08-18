using System;

namespace Mdg.Core.Common.Commands
{
    public interface ICommand
    {
        Guid CommandId { get; }
        Guid IssuerId { get; }
        long CreatedTick { get; }
    }

    public abstract record CommandBase : ICommand
    {
        public Guid CommandId { get; init; } = Guid.NewGuid();
        public Guid IssuerId { get; init; }
        public long CreatedTick { get; init; }
    }

    public readonly struct CommandResult
    {
        public bool IsSuccess { get; }
        public string? ErrorMessage { get; }

        private CommandResult(bool isSuccess, string? errorMessage)
        {
            IsSuccess = isSuccess;
            ErrorMessage = errorMessage;
        }

        public static CommandResult Success() => new CommandResult(true, null);
        public static CommandResult Fail(string message) => new CommandResult(false, message);
    }
}
