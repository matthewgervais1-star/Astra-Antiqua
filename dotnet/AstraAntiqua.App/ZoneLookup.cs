using AstraAntiqua.Core.Chart;

namespace AstraAntiqua.App;

/// <summary>A place found by name: what to print, where it is, and its zone if the geocoder gave one.</summary>
public sealed record PlaceHit(string Name, double Latitude, double Longitude, string? ZoneId);

/// <summary>
/// Finds the time zone a birthplace keeps its clocks by. A city from the
/// offline list already carries its zone. Any other place is searched by
/// name through the platform (on iOS, MapKit, which returns the place's own
/// zone); failing that, the zone is estimated from longitude and the screen
/// says so.
/// </summary>
public static class ZoneLookup
{
    /// <summary>Set by the platform head: a place name in, one place with its zone out.</summary>
    public static Func<string, Task<PlaceHit?>>? PlatformSearch { get; set; }

    /// <summary>
    /// Resolves a zone id handed back by a geocoder, or falls back to the
    /// longitude estimate when there is none or this runtime cannot load it.
    /// </summary>
    public static (string ZoneId, bool Estimated) Accept(string? zoneId, double longitude)
    {
        if (!string.IsNullOrEmpty(zoneId))
        {
            try
            {
                BirthResolver.FindZone(zoneId!);
                return (zoneId!, false);
            }
            catch (Exception)
            {
                // A zone this runtime does not know: fall through to the estimate.
            }
        }
        return (BirthResolver.EstimateZoneForLongitude(longitude).Id, true);
    }
}
