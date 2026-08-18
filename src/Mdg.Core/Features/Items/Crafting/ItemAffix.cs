namespace Mdg.Core.Features.Items.Crafting
{
    public enum AffixClassification
    {
        Prefix = 0,
        Suffix = 1
    }

    public sealed class ItemAffix
    {
        public string Key { get; }
        public AffixClassification Classification { get; }
        public string StatKey { get; }
        public float MinValue { get; }
        public float MaxValue { get; }
        public float CurrentValue { get; set; }
        public string FormatTemplate { get; } // e.g. "+{0} to Physical Damage" or "+{0}% to Fire Resistance"

        public string Description => string.Format(FormatTemplate, CurrentValue);

        public ItemAffix(string key, AffixClassification classification, string statKey, float minValue, float maxValue, float currentValue, string formatTemplate)
        {
            Key = key;
            Classification = classification;
            StatKey = statKey;
            MinValue = minValue;
            MaxValue = maxValue;
            CurrentValue = currentValue;
            FormatTemplate = formatTemplate;
        }

        public ItemAffix CloneWithRerolledValue(float rollFraction)
        {
            float clampedFraction = System.Math.Clamp(rollFraction, 0f, 1f);
            float newVal = System.MathF.Round(MinValue + (MaxValue - MinValue) * clampedFraction);
            return new ItemAffix(Key, Classification, StatKey, MinValue, MaxValue, newVal, FormatTemplate);
        }
    }
}
