using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Mdg.Server.Hubs;

public sealed class PlayerStateDto
{
    public string ConnectionId { get; set; } = string.Empty;
    public string CharacterId { get; set; } = string.Empty;
    public string CharacterName { get; set; } = string.Empty;
    public string ClassSpec { get; set; } = "Novice";
    public string Gender { get; set; } = "Male";
    public string ZoneId { get; set; } = "SanctuaryHaven";
    public string ChannelId { get; set; } = "CH-1";
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

    private static string GetGroupKey(string channelId, string zoneId) => $"{channelId ?? "CH-1"}_{zoneId ?? "SanctuaryHaven"}";

    public async Task JoinZone(string characterId, string characterName, string classSpec, string gender, string zoneId, string channelId, double x, double y, int level, double life, double maxLife)
    {
        var resolvedCharId = (string.IsNullOrWhiteSpace(characterId) || characterId == "hero_default")
            ? $"hero_guest_{Context.ConnectionId[..Math.Min(6, Context.ConnectionId.Length)]}"
            : characterId;

        var resolvedCharName = (string.IsNullOrWhiteSpace(characterName) || characterName == "The Unbound")
            ? $"Adventurer #{Context.ConnectionId[..Math.Min(4, Context.ConnectionId.Length)].ToUpper()}"
            : characterName;

        var player = new PlayerStateDto
        {
            ConnectionId = Context.ConnectionId,
            CharacterId = resolvedCharId,
            CharacterName = resolvedCharName,
            ClassSpec = classSpec ?? "Novice",
            Gender = gender ?? "Male",
            ZoneId = zoneId ?? "SanctuaryHaven",
            ChannelId = string.IsNullOrWhiteSpace(channelId) ? "CH-1" : channelId,
            X = x,
            Y = y,
            Level = level > 0 ? level : 1,
            Life = life > 0 ? life : 500,
            MaxLife = maxLife > 0 ? maxLife : 500
        };

        ActivePlayers[Context.ConnectionId] = player;
        var groupKey = GetGroupKey(player.ChannelId, player.ZoneId);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupKey);

        // Notify existing peers in the same channel + zone
        await Clients.OthersInGroup(groupKey).SendAsync("PlayerJoined", player);

        // Send all existing peers in this channel + zone back to the caller
        var peersInZone = new List<PlayerStateDto>();
        foreach (var kvp in ActivePlayers)
        {
            if (kvp.Key != Context.ConnectionId && kvp.Value.ChannelId == player.ChannelId && kvp.Value.ZoneId == player.ZoneId)
            {
                peersInZone.Add(kvp.Value);
            }
        }
        await Clients.Caller.SendAsync("ZonePeersSnapshot", peersInZone);
    }

    public async Task ChangeChannel(string newChannelId)
    {
        if (ActivePlayers.TryGetValue(Context.ConnectionId, out var player))
        {
            var oldGroup = GetGroupKey(player.ChannelId, player.ZoneId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, oldGroup);
            await Clients.OthersInGroup(oldGroup).SendAsync("PlayerLeft", new { characterId = player.CharacterId });

            player.ChannelId = string.IsNullOrWhiteSpace(newChannelId) ? "CH-1" : newChannelId;
            var newGroup = GetGroupKey(player.ChannelId, player.ZoneId);
            await Groups.AddToGroupAsync(Context.ConnectionId, newGroup);
            await Clients.OthersInGroup(newGroup).SendAsync("PlayerJoined", player);

            var peersInZone = new List<PlayerStateDto>();
            foreach (var kvp in ActivePlayers)
            {
                if (kvp.Key != Context.ConnectionId && kvp.Value.ChannelId == player.ChannelId && kvp.Value.ZoneId == player.ZoneId)
                {
                    peersInZone.Add(kvp.Value);
                }
            }
            await Clients.Caller.SendAsync("ZonePeersSnapshot", peersInZone);
            await Clients.Caller.SendAsync("ChannelChanged", new { channelId = player.ChannelId, peersCount = peersInZone.Count });
        }
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

            var groupKey = GetGroupKey(player.ChannelId, player.ZoneId);
            await Clients.OthersInGroup(groupKey).SendAsync("PlayerMoved", new
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
            var groupKey = GetGroupKey(player.ChannelId, player.ZoneId);
            await Clients.OthersInGroup(groupKey).SendAsync("PlayerSkillCast", new
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

    public async Task SendZoneChat(string message, string scope = "zone")
    {
        if (ActivePlayers.TryGetValue(Context.ConnectionId, out var player))
        {
            var cleanMsg = (message ?? "").Trim();
            if (cleanMsg.Length > 200) cleanMsg = cleanMsg[..200];

            var chatPayload = new
            {
                id = Guid.NewGuid().ToString("N"),
                characterId = player.CharacterId,
                characterName = player.CharacterName,
                classSpec = player.ClassSpec,
                channelId = player.ChannelId,
                zoneId = player.ZoneId,
                scope,
                message = cleanMsg,
                timestamp = DateTime.UtcNow.ToString("HH:mm")
            };

            if (scope == "world")
            {
                await Clients.All.SendAsync("ZoneChatMessage", chatPayload);
            }
            else
            {
                var groupKey = GetGroupKey(player.ChannelId, player.ZoneId);
                await Clients.Group(groupKey).SendAsync("ZoneChatMessage", chatPayload);
            }
        }
    }

    public async Task ChangeZone(string newZoneId, double newX, double newY)
    {
        if (ActivePlayers.TryGetValue(Context.ConnectionId, out var player))
        {
            var oldGroup = GetGroupKey(player.ChannelId, player.ZoneId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, oldGroup);
            await Clients.OthersInGroup(oldGroup).SendAsync("PlayerLeft", new { characterId = player.CharacterId });

            player.ZoneId = newZoneId;
            player.X = newX;
            player.Y = newY;

            var newGroup = GetGroupKey(player.ChannelId, newZoneId);
            await Groups.AddToGroupAsync(Context.ConnectionId, newGroup);
            await Clients.OthersInGroup(newGroup).SendAsync("PlayerJoined", player);

            var peersInZone = new List<PlayerStateDto>();
            foreach (var kvp in ActivePlayers)
            {
                if (kvp.Key != Context.ConnectionId && kvp.Value.ChannelId == player.ChannelId && kvp.Value.ZoneId == player.ZoneId)
                {
                    peersInZone.Add(kvp.Value);
                }
            }
            await Clients.Caller.SendAsync("ZonePeersSnapshot", peersInZone);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (ActivePlayers.TryRemove(Context.ConnectionId, out var player))
        {
            var groupKey = GetGroupKey(player.ChannelId, player.ZoneId);
            await Clients.OthersInGroup(groupKey).SendAsync("PlayerLeft", new { characterId = player.CharacterId });
        }
        await base.OnDisconnectedAsync(exception);
    }
}

