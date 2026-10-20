using AstraAntiqua.Core.Chart;
using AstraAntiqua.Core.Model;
using Microsoft.Maui.Devices.Sensors;

namespace AstraAntiqua.App.Pages;

/// <summary>A birth as entered: the person's words, the place, and the zone it is read in.</summary>
public sealed record BirthEntry(string Name, BirthInput Input, string PlaceName, string ZoneId, bool Estimated)
{
    public TimeZoneInfo Zone => Estimated
        ? BirthResolver.EstimateZoneForLongitude(Input.Longitude)
        : BirthResolver.FindZone(ZoneId);

    public ResolvedBirth Resolve() => BirthResolver.Resolve(Input, Zone);
}

/// <summary>
/// Birth entry. For the reader's own chart the entry is saved as the one
/// record this device keeps. For a second person (synastry) it is handed
/// back to the caller and never written anywhere.
/// </summary>
public sealed class BirthPage : SkyPage
{
    public enum Mode { Own, Other }

    private readonly Mode _mode;
    private readonly Func<BirthEntry, Task>? _onEntered;

    private readonly Entry _name = new();
    private readonly DatePicker _date = new();
    private readonly TimePicker _time = new();
    private readonly Entry _place = new();
    private readonly VerticalStackLayout _results = Ui.Column();
    private readonly Label _placeLine = Ui.Caption("");
    private readonly Label _readLine = Ui.Caption("");

    private City? _city;
    private (string Name, double Lat, double Lon, string ZoneId, bool Estimated)? _picked;

    public BirthPage(Mode mode, Func<BirthEntry, Task>? onEntered = null)
        : base(mode == Mode.Own ? "Your birth" : "Their birth")
    {
        _mode = mode;
        _onEntered = onEntered;

        foreach (var input in new View[] { _name, _place })
        {
            if (input is Entry e)
            {
                e.FontFamily = Ink.Prose;
                e.FontSize = 18;
                e.TextColor = Ink.Bone;
                e.PlaceholderColor = Ink.Faint;
                e.BackgroundColor = Colors.Transparent;
            }
        }
        // The keyboard must not learn names: the second person's above all.
        _name.IsTextPredictionEnabled = false;
        _name.IsSpellCheckEnabled = false;
        _name.Placeholder = mode == Mode.Own ? "Your name, as it should be printed" : "Their name";
        _place.Placeholder = "City of birth";
        _place.TextChanged += (_, _) => RenderResults();

        _date.MinimumDate = new DateTime(1800, 1, 1);
        _date.MaximumDate = DateTime.Today;
        _date.Date = new DateTime(1990, 1, 1);
        _date.TextColor = Ink.Bone;
        _date.FontFamily = Ink.Mono;
        _date.Format = "d MMM yyyy";
        _date.DateSelected += (_, _) => RenderReadLine();

        _time.Time = new TimeSpan(12, 0, 0);
        _time.TextColor = Ink.Bone;
        _time.FontFamily = Ink.Mono;
        _time.Format = "HH:mm";
        _time.PropertyChanged += (_, e) =>
        {
            if (e.PropertyName == nameof(TimePicker.Time)) RenderReadLine();
        };
    }

    protected override bool RebuildOnAppear => false;

    /// <summary>Editing the saved record starts from what was entered before.</summary>
    private void Prefill()
    {
        if (_mode != Mode.Own || State.Birth is not { } b) return;
        _name.Text = b.Name;
        _date.Date = new DateTime(b.Year, b.Month, b.Day);
        _time.Time = new TimeSpan(b.Hour, b.Minute, 0);
        _picked = (b.PlaceName, b.Latitude, b.Longitude, b.TimeZone, b.ZoneEstimated);
        _place.Text = b.PlaceName;
    }

    // MAUI 10 made these nullable; MAUI 8 has them plain. Both pass here.
    private static DateTime DateOf(DateTime? value) => value ?? DateTime.Today;
    private static TimeSpan TimeOf(TimeSpan? value) => value ?? new TimeSpan(12, 0, 0);

    protected override Task BuildAsync(VerticalStackLayout column)
    {
        column.Add(_mode == Mode.Own
            ? Ui.NaveHead("Fixed at the hour of your birth", "Enter your birth")
            : Ui.NaveHead("The bond between two skies", "The second birth"));

        column.Add(new ContentView
        {
            Padding = Ui.Inset,
            Content = Ui.Prose(_mode == Mode.Own
                ? "The chart is cast once from what you enter here and kept on this device, out of its backups. The city list works offline; a worldwide search sends only the place name to Apple's geocoder."
                : "Enter the second person's birth to read the bond. Nothing about them is saved. A worldwide search sends only the place name to Apple's geocoder."),
        });

        column.Add(Ui.Divider("Name"));
        column.Add(Padded(_name));
        column.Add(Ui.Divider("Date and hour"));
        var when = new Grid
        {
            ColumnDefinitions = { new ColumnDefinition(GridLength.Star), new ColumnDefinition(GridLength.Star) },
            ColumnSpacing = 16,
        };
        when.Add(_date, 0);
        when.Add(_time, 1);
        column.Add(Padded(when));
        column.Add(new ContentView
        {
            Padding = Ui.Inset,
            Content = Ui.Caption("The hour is read on the birthplace's own clock, not this phone's."),
        });

        column.Add(Ui.Divider("Place"));
        column.Add(Padded(_place));
        column.Add(_results);
        column.Add(Padded(_placeLine));
        column.Add(Padded(_readLine));
        Prefill();
        if (_picked is not null) AfterPick();
        else RenderResults();
        RenderReadLine();

        column.Add(Ui.Action(_mode == Mode.Own ? "Cast the chart" : "Read the bond", SubmitAsync));
        return Task.CompletedTask;
    }

    private static View Padded(View view) => new ContentView { Content = view, Padding = Ui.Inset };

    private void RenderResults()
    {
        _results.Clear();
        var query = _place.Text ?? "";
        if (_picked is not null && query == _picked.Value.Name) return;
        if (_picked is not null)
        {
            // The name was edited after a pick: the old coordinates no longer apply.
            _picked = null;
            _city = null;
            _placeLine.Text = "";
            _placeLine.TextColor = Ink.Dim;
            RenderReadLine();
        }

        foreach (var city in Store.SearchCities(query))
        {
            var row = Ui.Column(2);
            row.Add(Ui.Title(city.Name, 17));
            row.Add(Ui.Caption(city.Country));
            _results.Add(Ui.Row(row, () =>
            {
                _city = city;
                _picked = ($"{city.Name}, {city.Country}", city.Latitude, city.Longitude, city.TimeZone, false);
                _place.Text = _picked.Value.Name;
                AfterPick();
                return Task.CompletedTask;
            }));
        }

        if (query.Trim().Length >= 2)
        {
            _results.Add(Ui.Row(Ui.Caption($"Search everywhere for “{query.Trim()}”", color: Ink.Accent()),
                () => SearchWorldwideAsync(query.Trim())));
        }
    }

    private int _searchId;

    private async Task SearchWorldwideAsync(string query)
    {
        // A later search, or more typing, supersedes this one: its answer is dropped.
        var id = ++_searchId;
        bool Stale() => id != _searchId || (_place.Text ?? "").Trim() != query;

        _placeLine.Text = "SEARCHING…";
        _placeLine.TextColor = Ink.Dim;
        try
        {
            PlaceHit? hit;
            if (ZoneLookup.PlatformSearch is { } search)
            {
                // One request: the platform geocoder returns the place and its zone together.
                hit = await search(query);
            }
            else
            {
                var location = (await Geocoding.Default.GetLocationsAsync(query))?.FirstOrDefault();
                hit = location is null ? null : new PlaceHit(query, location.Latitude, location.Longitude, null);
            }
            if (Stale()) return;
            if (hit is null)
            {
                _placeLine.Text = "NO PLACE BY THAT NAME WAS FOUND. TRY A DIFFERENT NAME.";
                return;
            }
            var (zoneId, estimated) = ZoneLookup.Accept(hit.ZoneId, hit.Longitude);
            _city = null;
            _picked = (hit.Name, hit.Latitude, hit.Longitude, zoneId, estimated);
            _place.Text = hit.Name;
            AfterPick();
        }
        catch (Exception)
        {
            if (Stale()) return;
            _placeLine.Text = "THE WORLDWIDE SEARCH NEEDS A NETWORK. THE CITIES ABOVE WORK WITHOUT ONE.";
            _placeLine.TextColor = Ink.Conflict;
        }
    }

    private void AfterPick()
    {
        _results.Clear();
        if (_picked is not { } p) return;
        _placeLine.Text = p.Estimated
            ? $"{p.Name} · {p.Lat:F2}, {p.Lon:F2}\nThe birth zone is estimated from the place's longitude · a transition date may be off by up to an hour"
            : $"{p.Name} · {p.Lat:F2}, {p.Lon:F2} · {p.ZoneId}";
        _placeLine.TextColor = p.Estimated ? Ink.Conflict : Ink.Dim;
        RenderReadLine();
    }

    private BirthEntry? Current()
    {
        if (_picked is not { } p) return null;
        var date = DateOf(_date.Date);
        var time = TimeOf(_time.Time);
        var input = new BirthInput(date.Year, date.Month, date.Day, time.Hours, time.Minutes, p.Lat, p.Lon);
        var name = string.IsNullOrWhiteSpace(_name.Text) ? (_mode == Mode.Own ? "You" : "Them") : _name.Text.Trim();
        return new BirthEntry(name, input, p.Name, p.ZoneId, p.Estimated);
    }

    private void RenderReadLine()
    {
        var entry = Current();
        _readLine.TextColor = Ink.Dim;
        if (entry is null)
        {
            _readLine.Text = "Choose the city of birth from the list.";
            return;
        }
        var resolved = entry.Resolve();
        _readLine.Text = $"Read as {resolved.Utc:yyyy-MM-dd HH:mm} UTC · {BirthResolver.FormatOffset(resolved.OffsetMinutes)}";
    }

    private bool _submitting;

    private async Task SubmitAsync()
    {
        // A second tap while the first is still navigating would pop twice.
        if (_submitting) return;
        _submitting = true;
        try
        {
            await SubmitOnceAsync();
        }
        finally
        {
            _submitting = false;
        }
    }

    private async Task SubmitOnceAsync()
    {
        var entry = Current();
        if (entry is null)
        {
            _readLine.Text = "A CHART NEEDS A PLACE. CHOOSE THE CITY OF BIRTH FIRST.";
            _readLine.TextColor = Ink.Conflict;
            return;
        }

        if (_mode == Mode.Other)
        {
            if (_onEntered is not null) await _onEntered(entry);
            await Navigation.PopAsync();
            return;
        }

        var i = entry.Input;
        State.Save(new SavedBirth(
            entry.Name, State.CultureOrDefault, i.Year, i.Month, i.Day, i.Hour, i.Minute,
            i.Latitude, i.Longitude, entry.PlaceName, entry.ZoneId, entry.Estimated));
        App.ShowMain();
    }
}
