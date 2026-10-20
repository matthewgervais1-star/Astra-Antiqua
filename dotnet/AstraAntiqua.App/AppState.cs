using AstraAntiqua.Core.Chart;
using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Forecast;
using AstraAntiqua.Core.Model;
using AstraAntiqua.Core.Reading;
using Microsoft.Maui.Storage;

namespace AstraAntiqua.App;

/// <summary>
/// The one birth record, the culture it is read in, and what is computed
/// from it. The record is a file in the app's data directory, marked on iOS
/// to stay out of iCloud and device backups (preferences would be backed
/// up). The app has no server. Only the culture id, which says nothing about
/// a person, lives in preferences.
///
/// Casting a chart is quick; the long transits are not, so they are computed
/// once per record, off the main thread, and held.
/// </summary>
public sealed class AppState
{
    private const string BirthFile = "birth.v1.json";
    private const string CultureKey = "astra.culture.v1";

    public static AppState Current { get; } = new();

    private SavedBirth? _birth;
    private NatalChart? _chart;
    private NatalReading? _reading;
    private Task<IReadOnlyList<TransitSpan>>? _spans;
    private DateTime _spansDay;
    private bool _loaded;

    public ContentStore Store => ContentStore.Shared;

    /// <summary>Set by the platform head: marks a file to stay out of device and cloud backups.</summary>
    public static Action<string>? ExcludeFromBackup { get; set; }

    private static string BirthPath => Path.Combine(FileSystem.AppDataDirectory, BirthFile);

    /// <summary>The zone the reader's own calendar days are counted in.</summary>
    public TimeZoneInfo LocalZone => TimeZoneInfo.Local;

    public SavedBirth? Birth
    {
        get
        {
            EnsureLoaded();
            return _birth;
        }
    }

    /// <summary>The culture in force: the record's, or the one chosen during onboarding.</summary>
    public Culture? Culture
    {
        get
        {
            EnsureLoaded();
            if (_birth is not null) return _birth.Culture;
            var stored = Preferences.Default.Get(CultureKey, "");
            return stored.Length > 0 ? CultureIds.FromId(stored) : null;
        }
    }

    public Culture CultureOrDefault => Culture ?? Core.Model.Culture.Greece;

    public NatalChart? Chart
    {
        get
        {
            if (Birth is null) return null;
            return _chart ??= Birth.Cast(Store.AspectRules);
        }
    }

    public NatalReading? Reading
    {
        get
        {
            if (Chart is null) return null;
            return _reading ??= NatalReadingBuilder.Build(CultureOrDefault, Chart.Longitudes, Store);
        }
    }

    /// <summary>
    /// The long-transit spans for the record, computed off the main thread and
    /// held for the day. A failed computation is not held, and a new day
    /// recomputes, so the window stays centred on today.
    /// </summary>
    public Task<IReadOnlyList<TransitSpan>> SpansAsync()
    {
        var chart = Chart;
        if (chart is null) return Task.FromResult<IReadOnlyList<TransitSpan>>(Array.Empty<TransitSpan>());
        var today = DateTime.UtcNow.Date;
        if (_spans is null || _spans.IsFaulted || _spans.IsCanceled || _spansDay != today)
        {
            _spansDay = today;
            _spans = Task.Run(() => Horizons.Spans(chart, DateTime.UtcNow));
        }
        return _spans;
    }

    public void ChooseCulture(Culture culture)
    {
        Preferences.Default.Set(CultureKey, CultureIds.Id(culture));
        if (_birth is not null) Save(_birth with { Culture = culture });
    }

    public void Save(SavedBirth birth)
    {
        var path = BirthPath;
        File.WriteAllText(path, birth.ToJson());
        ExcludeFromBackup?.Invoke(path);
        Preferences.Default.Set(CultureKey, CultureIds.Id(birth.Culture));
        _birth = birth;
        Invalidate();
    }

    /// <summary>Deletes the record from this device. Nothing else holds a copy.</summary>
    public void Forget()
    {
        if (File.Exists(BirthPath)) File.Delete(BirthPath);
        Preferences.Default.Remove(CultureKey);
        _birth = null;
        Invalidate();
    }

    private void Invalidate()
    {
        _chart = null;
        _reading = null;
        _spans = null;
    }

    private void EnsureLoaded()
    {
        if (_loaded) return;
        _loaded = true;
        _birth = File.Exists(BirthPath) ? SavedBirth.FromJson(File.ReadAllText(BirthPath)) : null;
    }
}
