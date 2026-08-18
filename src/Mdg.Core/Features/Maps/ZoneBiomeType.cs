namespace Mdg.Core.Features.Maps;

public enum ZoneBiomeType
{
    SanctuaryHaven,
    WhisperingPlains,
    FrostpeakTundra,
    MoltenCaldera,
    ForgottenCrypt,
    StormpeakRidge
}

public sealed class EnvironmentalHazardConfig
{
    public string HazardName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ResistanceRequired { get; set; } = "None";
    public double Threshold { get; set; } = 75.0;
    public string PenaltyType { get; set; } = "None"; // "FreezeOnHit", "FireDoT", "FlaskDecay", "ShockVulnerable"
}
