using System;

namespace Mdg.Core.Features.Progression
{
    public enum GenderType
    {
        Male = 0,
        Female = 1
    }

    public enum ClassSpecialization
    {
        Novice = 0,       // Tân Binh / Tập Sự (Khởi đầu)
        Vanguard = 1,     // Chiến Binh Thiết Giáp (Physical, High Armor, Cleaves)
        Arcanist = 2,     // Pháp Sư Nguyên Tố (Fire/Cold, Energy Shield, AoE)
        ShadowRogue = 3   // Sát Thủ Bóng Đêm (Chaos/Crit, High Evasion, Dual Daggers)
    }

    public sealed class CharacterProgression
    {
        public GenderType Gender { get; set; } = GenderType.Male;
        public ClassSpecialization Specialization { get; private set; } = ClassSpecialization.Novice;
        public int Level { get; private set; } = 1;
        public long CurrentExp { get; private set; } = 0;
        public long ExpForNextLevel => Level * 100L;
        public bool IsSpecializationUnlocked => Level >= 10 || Specialization != ClassSpecialization.Novice;

        public event Action<int>? OnLevelUp;
        public event Action<ClassSpecialization>? OnSpecializationChanged;

        public CharacterProgression(GenderType gender = GenderType.Male)
        {
            Gender = gender;
        }

        public void AddExperience(long amount)
        {
            if (amount <= 0) return;
            CurrentExp += amount;

            while (CurrentExp >= ExpForNextLevel)
            {
                CurrentExp -= ExpForNextLevel;
                Level++;
                OnLevelUp?.Invoke(Level);
            }
        }

        public bool SelectSpecialization(ClassSpecialization spec)
        {
            if (spec == ClassSpecialization.Novice || !IsSpecializationUnlocked)
                return false;

            Specialization = spec;
            OnSpecializationChanged?.Invoke(spec);
            return true;
        }
    }
}
