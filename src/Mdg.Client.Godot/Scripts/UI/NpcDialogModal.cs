using Godot;
using System;
using Mdg.Client.Godot.Scripts.Common;

namespace Mdg.Client.Godot.Scripts.UI
{
    public partial class NpcDialogModal : Control
    {
        [Export] public TextureRect? NpcAvatar { get; set; }
        [Export] public Label? NpcNameLabel { get; set; }
        [Export] public Label? NpcTitleLabel { get; set; }
        [Export] public Label? DialogTextLabel { get; set; }
        [Export] public VBoxContainer? ActionButtonsContainer { get; set; }

        public bool IsOpen => Visible;

        public event Action? OnOpenForgeRequested;
        public event Action? OnOpenShopRequested;
        public event Action? OnOpenBestiaryRequested;
        public event Action? OnOpenWorldMapRequested;

        public override void _Ready()
        {
            Visible = false;
        }

        public void OpenDialog(string npcName, string npcTitle, string dialogText, string npcType)
        {
            if (NpcNameLabel != null) NpcNameLabel.Text = npcName;
            if (NpcTitleLabel != null) NpcTitleLabel.Text = npcTitle;
            if (DialogTextLabel != null) DialogTextLabel.Text = dialogText;

            // Nạp ảnh chân dung NPC
            if (NpcAvatar != null)
            {
                string nameLower = (npcName + " " + npcTitle).ToLowerInvariant();
                string fileName = "npc_priestess.png";
                if (nameLower.Contains("smith") || nameLower.Contains("lisbeth")) fileName = "npc_lisbeth.png";
                else if (nameLower.Contains("merchant")) fileName = "npc_merchant.png";
                else if (nameLower.Contains("elder") || nameLower.Contains("verin")) fileName = "npc_elder_verin.png";
                else if (nameLower.Contains("alchemist") || nameLower.Contains("elina")) fileName = "npc_alchemist_elina.png";
                else if (nameLower.Contains("hunter") || nameLower.Contains("valen")) fileName = "npc_hunter_valen.png";
                else if (nameLower.Contains("lore") || nameLower.Contains("lyra")) fileName = "npc_lorekeeper_lyra.png";
                else if (nameLower.Contains("guard") || nameLower.Contains("kaelen")) fileName = "npc_guard_kaelen.png";

                NpcAvatar.Texture = TextureLoader.LoadIndividual("Npcs", fileName);
            }

            BuildActions(npcName, npcTitle, npcType);
            Visible = true;
        }

        private void BuildActions(string npcName, string npcTitle, string npcType)
        {
            if (ActionButtonsContainer == null) return;

            foreach (Node child in ActionButtonsContainer.GetChildren())
            {
                child.QueueFree();
            }

            string keyLower = (npcName + " " + npcTitle + " " + npcType).ToLowerInvariant();

            if (keyLower.Contains("smith") || keyLower.Contains("lisbeth"))
            {
                AddActionButton("🔨 Lò Rèn Cường Hóa (Infusion Forge)", () =>
                {
                    Visible = false;
                    OnOpenForgeRequested?.Invoke();
                });
            }
            else if (keyLower.Contains("merchant") || keyLower.Contains("shop") || keyLower.Contains("alchemist") || keyLower.Contains("elina"))
            {
                AddActionButton("🛒 Cửa Hàng Mua Bán (Haven Store)", () =>
                {
                    Visible = false;
                    OnOpenShopRequested?.Invoke();
                });
            }
            else if (keyLower.Contains("hunter") || keyLower.Contains("lore") || keyLower.Contains("lyra") || keyLower.Contains("valen"))
            {
                AddActionButton("📖 Sổ Tay Quái Vật & Thợ Săn (Bestiary)", () =>
                {
                    Visible = false;
                    OnOpenBestiaryRequested?.Invoke();
                });
            }
            else if (keyLower.Contains("verin") || keyLower.Contains("elder"))
            {
                AddActionButton("🗺️ Bản Đồ Thám Hiểm Thế Giới", () =>
                {
                    Visible = false;
                    OnOpenWorldMapRequested?.Invoke();
                });
            }

            AddActionButton("👋 Tạm biệt", () =>
            {
                Visible = false;
            });
        }

        private void AddActionButton(string text, Action callback)
        {
            if (ActionButtonsContainer == null) return;

            var btn = new Button
            {
                Text = text,
                CustomMinimumSize = new Vector2(0, 40)
            };
            btn.Pressed += callback;
            ActionButtonsContainer.AddChild(btn);
        }

        public void Close()
        {
            Visible = false;
        }
    }
}
