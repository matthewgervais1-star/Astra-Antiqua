using CoreLocation;
using Foundation;

namespace AstraAntiqua.App.Platforms.iOS;

/// <summary>
/// The iOS hooks the shared code asks for.
///
/// Place search: one CLGeocoder forward lookup returns the placemark with its
/// coordinates, its locality and the IANA zone the place keeps, which is what
/// web resolves with tz-lookup. One request per search, not three, because
/// Apple throttles geocoding and a throttled zone lookup would fall back to an
/// estimate. It needs a network and no location permission: it geocodes a
/// name, never the device.
///
/// Backups: the birth record's file is excluded from iCloud and device
/// backups, so the record stays on this phone.
/// </summary>
internal static class IosZoneLookup
{
    public static void Register()
    {
        ZoneLookup.Platform = ReverseAsync;
        ZoneLookup.PlatformSearch = SearchAsync;
        AppState.ExcludeFromBackup = Exclude;
    }

    private static async Task<PlaceHit?> SearchAsync(string query)
    {
        using var geocoder = new CLGeocoder();
        var mark = (await geocoder.GeocodeAddressAsync(query))?.FirstOrDefault();
        if (mark?.Location is not { } location) return null;
        var name = string.Join(", ", new[] { mark.Locality ?? mark.Name, mark.Country }
            .Where(s => !string.IsNullOrWhiteSpace(s)));
        return new PlaceHit(
            string.IsNullOrWhiteSpace(name) ? query : name,
            location.Coordinate.Latitude,
            location.Coordinate.Longitude,
            mark.TimeZone?.Name);
    }

    private static async Task<string?> ReverseAsync(double latitude, double longitude)
    {
        using var geocoder = new CLGeocoder();
        var placemarks = await geocoder.ReverseGeocodeLocationAsync(new CLLocation(latitude, longitude));
        return placemarks?.FirstOrDefault()?.TimeZone?.Name;
    }

    private static void Exclude(string path)
    {
        var url = NSUrl.FromFilename(path);
        url.SetResource(NSUrl.IsExcludedFromBackupKey, NSNumber.FromBoolean(true), out _);
    }
}
