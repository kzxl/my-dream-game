using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Mdg.Server.Hubs;

public sealed class PlayerStateDto
{
    public string ConnectionId { get; set; } = string.Empty;
    public string CharacterId { get; set; } = string.Empty;
    public string CharacterName { get; set; } = string.Empty;
    public string ClassSpec { get; set; } = "Novice";
    public string ZoneId { get; set; } = "SanctuaryHaven";
    public double X { get; set; }
    public double Y { get; set; }
    public double Vx { get; set; }
    public double Vy { get; set; }
    public string Facing { get; set; } = "down";
    public double Life { get; set; } = 500;
    public double MaxLife { get; set; } = 500;
    public double Es { get; set; }
    public double MaxEs { get; set; }
    public int Level { get; set; } = 1;
}

public sealed class GameHub : Hub
{
    // Active players keyed by ConnectionId
    private static readonly ConcurrentDictionary<string, PlayerStateDto> ActivePlayers = new();

    public async Task JoinZone(string characterId, string characterName, string classSpec, string zoneId, double x, double y, int level, double life, double maxLife)
    {
        var player = new PlayerStateDto
        {
            ConnectionId = Context.ConnectionId,
            CharacterId = string.IsNullOrWhiteSpace(characterId) ? Context.ConnectionId : characterId,
            CharacterName = string.IsNullOrWhiteSpace(characterName) ? "Hero" : characterName,
            ClassSpec = classSpec ?? "Novice",
            ZoneId = zoneId ?? "SanctuaryHaven",
            X = x,
            Y = y,
            Level = level > 0 ? level : 1,
            Life = life > 0 ? life : 500,
            MaxLife = maxLife > 0 ? maxLife : 500
        };

        ActivePlayers[Context.ConnectionId] = player;
        await Groups.AddToGroupAsync(Context.ConnectionId, player.ZoneId);

        // Notify existing players in zone about the new player
        await Clients.Group(player.ZoneId).SendAsync("PlayerJoined", player);

        // Send all existing peers in this zone back to the caller
        var peersInZone = new System.Collections.Generic.List<PlayerStateDto>();
        foreach (var kvp in ActivePlayers)
        {
            if (kvp.Key != Context.ConnectionId && kvp.Value.ZoneId == player.ZoneId)
            {
                peersInZone.Add(kvp.Value);
            }
        }
        await Clients.Caller.SendAsync("ZonePeersSnapshot", peersInZone);
    }

    public async Task UpdatePosition(double x, double y, double vx, double vy, string facing)
    {
        if (ActivePlayers.TryGetValue(Context.ConnectionId, out var player))
        {
            player.X = x;
            player.Y = y;
            player.Vx = vx;
            player.Vy = vy;
            player.Facing = facing ?? "down";

            await Clients.OthersInGroup(player.ZoneId).SendAsync("PlayerMoved", new
            {
                characterId = player.CharacterId,
                x = player.X,
                y = player.Y,
                vx = player.Vx,
                vy = player.Vy,
                facing = player.Facing
            });
        }
    }

    public async Task CastSkill(string skillKey, double originX, double originY, double targetX, double targetY)
    {
        if (ActivePlayers.TryGetValue(Context.ConnectionId, out var player))
        {
            await Clients.OthersInGroup(player.ZoneId).SendAsync("PlayerSkillCast", new
            {
                characterId = player.CharacterId,
                characterName = player.CharacterName,
                skillKey,
                originX,
                originY,
                targetX,
                targetY
            });
        }
    }

    public async Task SendZoneChat(string message)
    {
        if (ActivePlayers.TryGetValue(Context.ConnectionId, out var player))
        {
            var cleanMsg = (message ?? "").Trim();
            if (cleanMsg.Length > 200) cleanMsg = cleanMsg[..200];

            await Clients.Group(player.ZoneId).SendAsync("ZoneChatMessage", new
            {
                id = Guid.NewGuid().ToString("N"),
                characterId = player.CharacterId,
                characterName = player.CharacterName,
                classSpec = player.ClassSpec,
                message = cleanMsg,
                timestamp = DateTime.UtcNow.ToString("HH:mm")
            });
        }
    }

    public async Task ChangeZone(string newZoneId, double newX, double newY)
    {
        if (ActivePlayers.TryGetValue(Context.ConnectionId, out var player))
        {
            var oldZone = player.ZoneId;
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, oldZone);
            await Clients.Group(oldZone).SendAsync("PlayerLeft", new { characterId = player.CharacterId });

            player.ZoneId = newZoneId;
            player.X = newX;
            player.Y = newY;

            await Groups.AddToGroupAsync(Context.ConnectionId, newZoneId);
            await Clients.Group(newZoneId).SendAsync("PlayerJoined", player);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (ActivePlayers.TryRemove(Context.ConnectionId, out var player))
        {
            await Clients.Group(player.ZoneId).SendAsync("PlayerLeft", new { characterId = player.CharacterId });
        }
        await base.OnDisconnectedAsync(exception);
    }
}
