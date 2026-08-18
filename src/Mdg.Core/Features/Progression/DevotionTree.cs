using System;
using System.Collections.Generic;

namespace Mdg.Core.Features.Progression
{
    public sealed class DevotionNode
    {
        public string Id { get; }
        public string ConstellationKey { get; }
        public string Name { get; }
        public string Description { get; }
        public int Cost { get; } = 1;
        public string StatKey { get; }
        public float StatValue { get; }
        public bool IsKeystoneProc { get; }
        public string? ProcSkillId { get; }

        public DevotionNode(string id, string constellationKey, string name, string description, string statKey, float statValue, bool isKeystoneProc = false, string? procSkillId = null)
        {
            Id = id;
            ConstellationKey = constellationKey;
            Name = name;
            Description = description;
            StatKey = statKey;
            StatValue = statValue;
            IsKeystoneProc = isKeystoneProc;
            ProcSkillId = procSkillId;
        }
    }

    public sealed class DevotionConstellation
    {
        public string Key { get; }
        public string Name { get; }
        public string Affinity { get; } // "Eldritch", "Primordial", "Ascendant", "Chaos"
        public string Lore { get; }
        public List<DevotionNode> Nodes { get; } = new();

        public DevotionConstellation(string key, string name, string affinity, string lore)
        {
            Key = key;
            Name = name;
            Affinity = affinity;
            Lore = lore;
        }
    }

    public sealed class DevotionTree
    {
        public static readonly List<DevotionConstellation> Constellations = new()
        {
            // 1. THE PHOENIX (Fire & Resurrection)
            new DevotionConstellation("phoenix", "🔥 The Phoenix", "Primordial", "Born from the primordial flame of the Genesis Core.")
            {
                Nodes =
                {
                    new DevotionNode("ph_1", "phoenix", "Ember Heart", "+15% Fire Damage", "IncFire", 15f),
                    new DevotionNode("ph_2", "phoenix", "Ash Walker", "+15% Fire Resistance", "FireRes", 15f),
                    new DevotionNode("ph_3", "phoenix", "Ignited Fury", "+20% Critical Strike Multiplier", "CritMulti", 20f),
                    new DevotionNode("ph_proc", "phoenix", "★ Phoenix Firestorm", "Proc on Crit: Calls down a pillar of blazing flame", "ProcSkill", 1f, true, "proc_phoenix_firestorm")
                }
            },

            // 2. THE FROST WARDEN (Cold & Barrier Defense)
            new DevotionConstellation("frost_warden", "❄️ The Frost Warden", "Ascendant", "The eternal guardian of the Glacial Pinnacle.")
            {
                Nodes =
                {
                    new DevotionNode("fw_1", "frost_warden", "Frozen Veins", "+60 Maximum Energy Shield", "FlatEs", 60f),
                    new DevotionNode("fw_2", "frost_warden", "Glacial Plating", "+100 Armor", "Armor", 100f),
                    new DevotionNode("fw_3", "frost_warden", "Absolute Zero", "+15% Cold Resistance", "ColdRes", 15f),
                    new DevotionNode("fw_proc", "frost_warden", "★ Glacial Barrier", "Proc on Low Life (<35% HP): Grants 400 Absorption Barrier for 5s", "ProcSkill", 1f, true, "proc_glacial_barrier")
                }
            },

            // 3. THE THUNDER LORD (Lightning & Chain Reactions)
            new DevotionConstellation("thunder_lord", "⚡ The Thunder Lord", "Chaos", "Unleashes unrestrained celestial plasma across the sky.")
            {
                Nodes =
                {
                    new DevotionNode("tl_1", "thunder_lord", "Static Surge", "+10% Attack & Cast Speed", "AttackSpeed", 10f),
                    new DevotionNode("tl_2", "thunder_lord", "Storm Conduit", "+15% Lightning Damage", "IncLightning", 15f),
                    new DevotionNode("tl_3", "thunder_lord", "High Voltage", "+8% Critical Strike Chance", "CritChance", 8f),
                    new DevotionNode("tl_proc", "thunder_lord", "★ Chain Lightning", "Proc on Hit: 25% chance to discharge 3-target arc lightning", "ProcSkill", 1f, true, "proc_chain_lightning")
                }
            },

            // 4. THE VOID REAPER (Chaos, Leech & Shadows)
            new DevotionConstellation("void_reaper", "☠️ The Void Reaper", "Eldritch", "Reaps the vitality of enemies fallen into the dark void.")
            {
                Nodes =
                {
                    new DevotionNode("vr_1", "void_reaper", "Shadow Infusion", "+15% Chaos Resistance", "ChaosRes", 15f),
                    new DevotionNode("vr_2", "void_reaper", "Reaper's Harvest", "+5% Life Leech on Hit", "LifeLeech", 5f),
                    new DevotionNode("vr_3", "void_reaper", "Nether Touch", "+20% Chaos & Poison Damage", "IncChaos", 20f),
                    new DevotionNode("vr_proc", "void_reaper", "★ Void Siphon", "Proc on Kill: Siphons 10% Max Life & ES instantly", "ProcSkill", 1f, true, "proc_void_siphon")
                }
            }
        };

        public HashSet<string> AllocatedNodeIds { get; } = new();
        public int AvailableDevotionPoints { get; set; } = 10;

        public bool TryAllocateNode(string nodeId, out string message)
        {
            if (AllocatedNodeIds.Contains(nodeId))
            {
                message = "Devotion node already allocated.";
                return false;
            }

            if (AvailableDevotionPoints <= 0)
            {
                message = "No available Devotion Points. Restore Shrines in the world to gain more points.";
                return false;
            }

            var node = FindNode(nodeId);
            if (node == null)
            {
                message = $"Node '{nodeId}' not found in Celestial Devotion Grid.";
                return false;
            }

            AllocatedNodeIds.Add(nodeId);
            AvailableDevotionPoints--;
            message = $"Allocated '{node.Name}': {node.Description}.";
            return true;
        }

        public bool TryRefundNode(string nodeId, out string message)
        {
            if (!AllocatedNodeIds.Contains(nodeId))
            {
                message = "Node is not currently allocated.";
                return false;
            }

            AllocatedNodeIds.Remove(nodeId);
            AvailableDevotionPoints++;
            message = $"Refunded devotion node '{nodeId}'.";
            return true;
        }

        public static DevotionNode? FindNode(string nodeId)
        {
            foreach (var constellation in Constellations)
            {
                foreach (var node in constellation.Nodes)
                {
                    if (node.Id == nodeId) return node;
                }
            }
            return null;
        }
    }
}
