using Godot;
using System;
using System.Collections.Generic;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class CompendiumModal : Control
    {
        [Export] public VBoxContainer? BestiaryListContainer { get; set; }
        [Export] public Label? TotalKillsLabel { get; set; }

        public bool IsOpen => Visible;
        private readonly Dictionary<string, int> _monsterKills = new();

        public override void _Ready()
        {
            Visible = false;
        }

        public void RecordMonsterKill(string monsterName)
        {
            int current = _monsterKills.GetValueOrDefault(monsterName, 0);
            _monsterKills[monsterName] = current + 1;
            if (Visible)
            {
                RefreshUI();
            }
        }

        public void Toggle()
        {
            Visible = !Visible;
            if (Visible)
            {
                RefreshUI();
            }
        }

        public void RefreshUI()
        {
            PopulateBestiary();
        }

        private void PopulateBestiary()
        {
            if (BestiaryListContainer == null) return;

            foreach (Node child in BestiaryListContainer.GetChildren())
            {
                child.QueueFree();
            }

            var monsters = new[]
            {
                (Name: "Fire Imp", Icon: "🔥", Lore: "Quỷ lửa sinh ra từ dung nham núi lửa Molten Caldera.", Signature: "Imp Flame Orb"),
                (Name: "Void Wraith", Icon: "👻", Lore: "Linh hồn tha hóa trôi dạt từ khe nứt Hư Không.", Signature: "Wraith Cloak"),
                (Name: "Skeleton Warrior", Icon: "💀", Lore: "Bộ xương chiến binh cổ đại canh giữ lăng mộ.", Signature: "Aegis of the Forgotten Crypt"),
                (Name: "Direwolf", Icon: "🐺", Lore: "Sói hoang dã dũng mãnh của vùng thảo nguyên.", Signature: "Fang of the Alpha Wolf"),
                (Name: "Magma Scorpion", Icon: "🦂", Lore: "Bọ cạp khổng lồ với nọc độc lửa thiêu đốt.", Signature: "Heart of the Molten Colossus"),
                (Name: "Goblin Scout", Icon: "👺", Lore: "Yêu tinh trinh sát nhanh nhẹn với túi độc.", Signature: "Scout's Poisoned Pouch"),
                (Name: "Venom Spider", Icon: "🕷️", Lore: "Nhện độc bóng tối giăng bẫy trong rừng sâu.", Signature: "Venom Silk"),
                (Name: "Dreadknight", Icon: "⚔️", Lore: "Hiệp sĩ sa ngã mang giáp nặng hắc ám.", Signature: "Dreadplate"),
                (Name: "Malakor, Void Inquisitor", Icon: "👑", Lore: "Đại Tông Sư Hư Không thống lĩnh quân đoàn sa đọa.", Signature: "Malakor’s Dreadfire Cleaver"),
                (Name: "Vael, Glacial Sovereign", Icon: "❄️", Lore: "Băng Hoàng tối cao ngự trị đỉnh núi tuyết.", Signature: "Vael’s Glacial Spire Staff"),
                (Name: "Ignis, Wyrm of Calamity", Icon: "🐉", Lore: "Hỏa Long Bất Diệt thiêu rụi muôn loài.", Signature: "Crown of the Scourge Wyrm")
            };

            int totalKills = 0;

            foreach (var m in monsters)
            {
                int kills = _monsterKills.GetValueOrDefault(m.Name, 0);
                totalKills += kills;

                int rank = kills switch
                {
                    >= 50 => 5,
                    >= 25 => 4,
                    >= 10 => 3,
                    >= 5 => 2,
                    >= 1 => 1,
                    _ => 0
                };

                string rankStr = rank switch
                {
                    5 => "⭐ BẬC 5 (Grandmaster) [+15% Sát Thương & +25% IIR/IIQ]",
                    4 => "⭐ BẬC 4 (Master) [Mở Khóa Rơi Thần Khí Unique]",
                    3 => "⭐ BẬC 3 (Artisan) [+8% Sát Thương]",
                    2 => "⭐ BẬC 2 (Journeyman) [+4% Sát Thương]",
                    1 => "⭐ BẬC 1 (Novice) [Mở Khóa Truyền Thuyết]",
                    _ => "🔒 CHƯA KHAI MỞ (Hạ gục 1 lần để ghi chép)"
                };

                var p = new PanelContainer { CustomMinimumSize = new Vector2(0, 75) };
                var l = new Label
                {
                    Text = $"{m.Icon} {m.Name} — Đã Hạ: {kills} con | {rankStr}\n" +
                           $"📖 Truyền thuyết: {(rank >= 1 ? m.Lore : "???")}\n" +
                           $"💎 Thần khí Signature: {(rank >= 4 ? m.Signature : "??? (Yêu cầu Mastery Bậc 4)")}"
                };
                l.AddThemeFontSizeOverride("font_size", 11);
                l.Modulate = rank > 0 ? new Color(0.9f, 0.95f, 1f) : new Color(0.6f, 0.6f, 0.6f);

                p.AddChild(l);
                BestiaryListContainer.AddChild(p);
            }

            if (TotalKillsLabel != null)
            {
                TotalKillsLabel.Text = $"📜 Tổng số quái vật đã tiêu diệt: {totalKills} quái vật";
            }
        }
    }
}
