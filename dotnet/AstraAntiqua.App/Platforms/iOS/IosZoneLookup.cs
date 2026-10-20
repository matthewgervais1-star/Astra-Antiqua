using Foundation;
using MapKit;

namespace AstraAntiqua.App.Platforms.iOS;

/// <summary>
/// The iOS hooks the shared code asks for.
///
/// Place search: one MapKit local search by name. Each result is a map item
/// carrying its coordinates and the IANA zone the place keeps, which is what
/// web resolves with tz-lookup. One request per search, because Apple
/// throttles these and a refused zone would fall back to an estimate. It
/// needs a network and no location permission: it searches a name, never
/// the device. (CLGeocoder did the same job and is obsolete from iOS 26.)
///
/// Backups: the birth record's file is excluded from iCloud and device
/// backups, so the record stays on this phone.
/// </summary>
internal static class IosZoneLookup
{
    public static void Register()
    {
        ZoneLookup.PlatformSearch = SearchAsync;
        AppState.ExcludeFromBackup = Exclude;
    }

    private static async Task<PlaceHit?> SearchAsync(string query)
    {
        var request = new MKLocalSearchRequest { NaturalLanguageQuery = query };
        var response = await new MKLocalSearch(request).StartAsync();
        var item = response?.MapItems?.FirstOrDefault();
        if (item is null) return null;

        double latitude, longitude;
        string? country = null;
        if (OperatingSystem.IsIOSVersionAtLeast(26) || OperatingSystem.IsMacCatalystVersionAtLeast(26))
        {
            var coordinate = item.Location.Coordinate;
            latitude = coordinate.Latitude;
            longitude = coordinate.Longitude;
        }
        else
        {
            var placemark = item.Placemark;
            latitude = placemark.Coordinate.Latitude;
            longitude = placemark.Coordinate.Longitude;
            country = placemark.Country;
        }

        var name = string.Join(", ", new[] { item.Name, country }.Where(s => !string.IsNullOrWhiteSpace(s)));
        return new PlaceHit(string.IsNullOrWhiteSpace(name) ? query : name, latitude, longitude, item.TimeZone?.Name);
    }

    private static void Exclude(string path)
    {
        var url = NSUrl.FromFilename(path);
        url.SetResource(NSUrl.IsExcludedFromBackupKey, NSNumber.FromBoolean(true), out _);
    }
}
