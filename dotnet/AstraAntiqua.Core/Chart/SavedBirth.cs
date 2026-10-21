using System.Text.Json;
using System.Text.Json.Serialization;
using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Chart;

/// <summary>
/// The one birth record this surface keeps, and the culture it reads in. The
/// record holds what the person entered (the wall clock and the place) and
/// the zone it was read in, never only a derived instant, so it can be
/// re-resolved if a zone rule changes. A second party entered for synastry
/// is never turned into one of these: nothing about another person is stored.
/// </summary>
public sealed record SavedBirth(
    string Name,
    Culture Culture,
    int Year,
    int Month,
    int Day,
    int Hour,
    int Minute,
    double Latitude,
    double Longitude,
    string PlaceName,
    string TimeZone,
    bool ZoneEstimated)
{
    // Computed from the fields above, so never written to the record.
    [JsonIgnore]
    public BirthInput Input => new(Year, Month, Day, Hour, Minute, Latitude, Longitude);

    [JsonIgnore]
    public TimeZoneInfo Zone => ZoneEstimated
        ? BirthResolver.EstimateZoneForLongitude(Longitude)
        : BirthResolver.FindZone(TimeZone);

    public ResolvedBirth Resolve() => BirthResolver.Resolve(Input, Zone);

    public NatalChart Cast(IReadOnlyList<AspectRule> rules)
        => NatalChart.Cast(Resolve().Utc, Latitude, Longitude, rules);

    // Source-generated, not reflection: iOS builds are trimmed, and a trimmed
    // app may have reflection-based System.Text.Json switched off.
    public string ToJson() => JsonSerializer.Serialize(this, SavedBirthJson.Default.SavedBirth);

    /// <summary>Null for anything unreadable, so a damaged record sends the reader to onboarding.</summary>
    public static SavedBirth? FromJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            return JsonSerializer.Deserialize(json!, SavedBirthJson.Default.SavedBirth);
        }
        catch (Exception e) when (e is JsonException or NotSupportedException or InvalidOperationException)
        {
            return null;
        }
    }
}

[JsonSourceGenerationOptions(UseStringEnumConverter = true)]
[JsonSerializable(typeof(SavedBirth))]
internal partial class SavedBirthJson : JsonSerializerContext
{
}
