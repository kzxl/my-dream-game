namespace Mdg.Core.Features.Progression
{
    public enum EvolutionTier
    {
        Novice = 1,     // Lv. 1 - 10
        Adept = 2,      // Lv. 11 - 30
        Master = 3,     // Lv. 31 - 60
        Ascendant = 4   // Lv. 60+
    }

    public enum AscendanceArchetype
    {
        Unbound = 0,        // Linh hồn khởi nguyên tự do
        IronVanguard = 1,   // Thiết Vệ Tiên Phong (Physical/Armor/Reflect)
        AetherSeeker = 2,   // Hội Tầm Đạo Aether (Elemental/ES/Chaos Inoculation)
        ShadowSyndicate = 3 // Bóng Đêm Hiệp Hội (Evasion/Crit/Poison Stack)
    }

    public enum KeystonePassive
    {
        None = 0,
        IronFortress = 1,       // Cap Kháng 85%, -10% MoveSpeed
        ChaosInoculation = 2,   // Máu = 1, Miễn nhiễm 100% Chaos, ES +200%
        GhostShroud = 3         // Né đòn hồi 20% ES, Độc tố dồn stack vô hạn
    }
}
