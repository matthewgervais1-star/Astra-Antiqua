using System.Globalization;
using System.Text.Json;
using AstraAntiqua.Core.Astronomy;
using AstraAntiqua.Core.Chart;
using AstraAntiqua.Core.Charting;
using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Forecast;
using AstraAntiqua.Core.Model;
using AstraAntiqua.Core.Reading;

namespace AstraAntiqua.Core.Tests;

/// <summary>
/// Parity with web past the bare chart. TestData/horizons.json is written by
/// web/scripts/export-goldens.mjs from web's own reading, week, season,
/// transit and synastry functions. Composed text must match web byte for
/// byte; computed instants must land within <see cref="InstantTolerance"/>.
/// </summary>
public class HorizonParityTests
{
    /// <summary>
    /// Both surfaces run the same searches on the same upstream engine, so a
    /// found instant agrees to well under a second. Anything wider means a
    /// search went down a different branch, which is a real disagreement.
    /// </summary>
    private static readonly TimeSpan InstantTolerance = TimeSpan.FromSeconds(1);

    private const double DegreeTolerance = 1e-6;

    private static readonly JsonElement Root;
    private static readonly JsonElement Goldens;
    private static readonly ContentStore Store = ContentStore.Shared;

    static HorizonParityTests()
    {
        var dir = Path.Combine(AppContext.BaseDirectory, "TestData");
        Root = JsonDocument.Parse(File.ReadAllText(Path.Combine(dir, "horizons.json"))).RootElement;
        Goldens = JsonDocument.Parse(File.ReadAllText(Path.Combine(dir, "goldens.json"))).RootElement;
    }

    private static DateTime Utc(JsonElement e) => Utc(e.GetString()!);

    private static DateTime Utc(string s) => DateTime.Parse(
        s, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal);

    private static string Str(JsonElement e, string name) => e.GetProperty(name).GetString()!;

    private static void Near(DateTime expected, DateTime actual, string what)
        => Assert.True(
            (expected - actual).Duration() <= InstantTolerance,
            $"{what}: web {expected:O}, core {actual:O} ({(actual - expected).TotalSeconds:F3} s)");

    private static IReadOnlyDictionary<Planet, double> Chart(JsonElement longitudes)
        => longitudes.EnumerateObject().ToDictionary(p => PlanetInfo.FromId(p.Name), p => p.Value.GetDouble());

    private static IReadOnlyDictionary<Planet, double> GoldenChart(string name)
        => Chart(Goldens.GetProperty("cases").EnumerateArray()
            .Single(c => Str(c, "name") == name).GetProperty("longitudes"));

    // ---- Readings --------------------------------------------------------

    public static IEnumerable<object[]> ReadingIndexes()
        => Enumerable.Range(0, Root.GetProperty("readings").GetArrayLength()).Select(i => new object[] { i });

    [Theory]
    [MemberData(nameof(ReadingIndexes))]
    public void A_natal_reading_composes_exactly_what_web_composes(int index)
    {
        var golden = Root.GetProperty("readings")[index];
        var culture = CultureIds.FromId(Str(golden, "culture"));
        var reading = NatalReadingBuilder.Build(culture, Chart(golden.GetProperty("longitudes")), Store);
        var label = $"{Str(golden, "chart")}/{Str(golden, "culture")}";

        var placements = golden.GetProperty("placements").EnumerateArray().ToList();
        Assert.Equal(placements.Count, reading.Placements.Count);
        for (var i = 0; i < placements.Count; i++)
        {
            var g = placements[i];
            var p = reading.Placements[i];
            Assert.Equal(PlanetInfo.FromId(Str(g, "planet")), p.Planet);
            Assert.Equal(ZodiacSigns.FromName(Str(g, "sign")), p.Sign);
            Assert.True(Math.Abs(g.GetProperty("degreeInSign").GetDouble() - p.DegreeInSign) < DegreeTolerance, label);
            Assert.Equal(Str(g, "deityName"), p.DeityName);
            Assert.Equal(Str(g, "deityEpithet"), p.DeityEpithet);
            Assert.Equal(Str(g, "domain"), p.Domain);
            Assert.Equal(Str(g, "culturalLine"), p.CulturalLine);
            Assert.Equal(Str(g, "signReading"), p.SignReading);
        }

        var aspects = golden.GetProperty("aspects").EnumerateArray().ToList();
        Assert.Equal(aspects.Count, reading.Aspects.Count);
        for (var i = 0; i < aspects.Count; i++)
        {
            var g = aspects[i];
            var a = reading.Aspects[i];
            Assert.Equal(PlanetInfo.FromId(Str(g, "a")), a.Aspect.A);
            Assert.Equal(PlanetInfo.FromId(Str(g, "b")), a.Aspect.B);
            Assert.Equal(AspectKinds.FromId(Str(g, "kind")), a.Aspect.Kind);
            Assert.Equal(Str(g, "verbLine"), a.VerbLine);
            Assert.Equal(Str(g, "pairTheme"), a.PairTheme);
            Assert.Equal(Str(g, "culturalReflection"), a.CulturalReflection);
        }

        Assert.Equal(Str(golden, "summary"), reading.Summary);
    }

    [Fact]
    public void The_reading_fixtures_cover_every_summary_branch()
    {
        var summaries = Root.GetProperty("readings").EnumerateArray().Select(r => Str(r, "summary")).ToList();
        Assert.Contains(summaries, s => s.Contains(Store.Banks.SummaryTone("tension")));
        Assert.Contains(summaries, s => s.Contains(Store.Banks.SummaryTone("harmony")));
        Assert.Contains(summaries, s => s.Contains(Store.Banks.SummaryTone("even")));
        Assert.Contains(summaries, s => s.EndsWith(Store.Banks.SummaryFused(1), StringComparison.Ordinal));
        Assert.Contains(summaries, s => s.Contains("pairs of powers sit fused"));
    }

    // ---- The week --------------------------------------------------------

    public static IEnumerable<object[]> WeekIndexes()
        => Enumerable.Range(0, Root.GetProperty("weeks").GetArrayLength()).Select(i => new object[] { i });

    [Theory]
    [MemberData(nameof(WeekIndexes))]
    public void The_week_reads_day_for_day_as_web_reads_it(int index)
    {
        var golden = Root.GetProperty("weeks")[index];
        var culture = CultureIds.FromId(Str(golden, "culture"));
        var start = Utc(golden.GetProperty("weekStart"));
        var days = WeekReading.Build(culture, start.Date, TimeZoneInfo.Utc, start, Store);

        var expected = golden.GetProperty("days").EnumerateArray().ToList();
        Assert.Equal(7, days.Count);
        for (var i = 0; i < 7; i++)
        {
            var g = expected[i];
            var d = days[i];
            var label = $"{Str(golden, "culture")} {Str(g, "label")}";
            Assert.Equal(Utc(g.GetProperty("date")), d.Date);
            Assert.Equal(Str(g, "label"), d.Label);
            var headline = g.GetProperty("headline");
            Assert.Equal(headline.ValueKind == JsonValueKind.Null ? null : headline.GetString(), d.Headline);
            Assert.Equal(Str(g, "line"), d.Line);
            Assert.Equal(Str(g, "tone"), d.Tone.ToString().ToLowerInvariant());
            var flag = g.GetProperty("flag");
            Assert.Equal(flag.ValueKind == JsonValueKind.Null ? null : flag.GetString(), d.Flag?.ToString());

            var sh = g.GetProperty("shorthand");
            Assert.Equal(Str(sh, "kind"), d.Shorthand.Kind.ToString().ToLowerInvariant());
            switch (d.Shorthand.Kind)
            {
                case ShorthandKind.Aspect:
                    Assert.Equal(PlanetInfo.FromId(Str(sh, "a")), d.Shorthand.A);
                    Assert.Equal(PlanetInfo.FromId(Str(sh, "b")), d.Shorthand.B);
                    Assert.Equal(AspectKinds.FromId(Str(sh, "aspect")), d.Shorthand.Aspect);
                    Assert.Equal(sh.GetProperty("tight").GetBoolean(), d.Shorthand.Tight);
                    break;
                case ShorthandKind.Ingress:
                    Assert.Equal(PlanetInfo.FromId(Str(sh, "planet")), d.Shorthand.Planet);
                    Assert.Equal(ZodiacSigns.FromName(Str(sh, "sign")), d.Shorthand.Sign);
                    break;
            }
            _ = label;
        }
    }

    [Fact]
    public void The_week_fixtures_include_a_tight_day_and_an_ingress_day()
    {
        var days = Root.GetProperty("weeks").EnumerateArray()
            .SelectMany(w => w.GetProperty("days").EnumerateArray()).ToList();
        Assert.Contains(days, d => d.GetProperty("shorthand").TryGetProperty("tight", out var e) && e.GetBoolean());
        Assert.Contains(days, d => Str(d.GetProperty("shorthand"), "kind") == "ingress");
    }

    // ---- The sky's own events --------------------------------------------

    [Fact]
    public void Ingresses_land_where_web_finds_them()
    {
        var g = Root.GetProperty("ingresses");
        var found = SkyEvents.Ingresses(Utc(g.GetProperty("start")), g.GetProperty("days").GetInt32());
        var expected = g.GetProperty("events").EnumerateArray().ToList();
        Assert.Equal(expected.Count, found.Count);
        for (var i = 0; i < expected.Count; i++)
        {
            Assert.Equal(PlanetInfo.FromId(Str(expected[i], "planet")), found[i].Planet);
            Assert.Equal(ZodiacSigns.FromName(Str(expected[i], "fromSign")), found[i].FromSign);
            Assert.Equal(ZodiacSigns.FromName(Str(expected[i], "toSign")), found[i].ToSign);
            Near(Utc(expected[i].GetProperty("date")), found[i].Date, $"ingress {i} {found[i].Planet}");
        }
    }

    [Fact]
    public void Stations_land_where_web_finds_them()
    {
        var g = Root.GetProperty("stations");
        var found = SkyEvents.Stations(Utc(g.GetProperty("start")), g.GetProperty("days").GetInt32());
        var expected = g.GetProperty("events").EnumerateArray().ToList();
        Assert.Equal(expected.Count, found.Count);
        for (var i = 0; i < expected.Count; i++)
        {
            Assert.Equal(PlanetInfo.FromId(Str(expected[i], "planet")), found[i].Planet);
            Assert.Equal(Str(expected[i], "kind"), found[i].Kind.ToString().ToLowerInvariant());
            Assert.Equal(ZodiacSigns.FromName(Str(expected[i], "sign")), found[i].Sign);
            Near(Utc(expected[i].GetProperty("date")), found[i].Date, $"station {i} {found[i].Planet}");
        }
    }

    [Fact]
    public void Moon_quarters_land_where_web_finds_them()
    {
        var g = Root.GetProperty("moonQuarters");
        var found = SkyEvents.MoonQuarters(Utc(g.GetProperty("start")), g.GetProperty("days").GetInt32());
        var expected = g.GetProperty("events").EnumerateArray().ToList();
        Assert.Equal(expected.Count, found.Count);
        for (var i = 0; i < expected.Count; i++)
        {
            Assert.Equal(Str(expected[i], "name"), found[i].Name);
            Assert.Equal(ZodiacSigns.FromName(Str(expected[i], "sign")), found[i].Sign);
            Near(Utc(expected[i].GetProperty("date")), found[i].Date, $"quarter {i}");
        }
    }

    [Fact]
    public void Eclipses_land_where_web_finds_them()
    {
        var g = Root.GetProperty("eclipses");
        var found = SkyEvents.Eclipses(Utc(g.GetProperty("start")), g.GetProperty("days").GetInt32());
        var expected = g.GetProperty("events").EnumerateArray().ToList();
        Assert.Equal(expected.Count, found.Count);
        for (var i = 0; i < expected.Count; i++)
        {
            Assert.Equal(Str(expected[i], "scope"), found[i].Scope.ToString().ToLowerInvariant());
            Assert.Equal(Str(expected[i], "kind"), found[i].Kind);
            Assert.Equal(ZodiacSigns.FromName(Str(expected[i], "sign")), found[i].Sign);
            Assert.True(Math.Abs(expected[i].GetProperty("obscuration").GetDouble() - found[i].Obscuration) < 1e-6);
            Near(Utc(expected[i].GetProperty("date")), found[i].Date, $"eclipse {i}");
        }
    }

    [Fact]
    public void The_season_window_matches_web()
    {
        foreach (var g in Root.GetProperty("seasons").EnumerateArray())
        {
            var w = Season.Current(Utc(g.GetProperty("at")), TimeZoneInfo.Utc);
            Assert.Equal(ZodiacSigns.FromName(Str(g, "sign")), w.Sign);
            Near(Utc(g.GetProperty("start")), w.Start, "season start");
            Near(Utc(g.GetProperty("end")), w.End, "season end");
            Assert.Equal(g.GetProperty("dayOfSeason").GetInt32(), w.DayOfSeason);
            Assert.Equal(g.GetProperty("totalDays").GetInt32(), w.TotalDays);
            Assert.Equal(g.GetProperty("daysRemaining").GetInt32(), w.DaysRemaining);
        }
    }

    [Fact]
    public void The_season_lists_the_events_web_lists()
    {
        var g = Root.GetProperty("seasonEvents");
        var sky = Season.SkyEventsIn(Season.Current(Utc(g.GetProperty("at")), TimeZoneInfo.Utc));

        var quarters = g.GetProperty("moonPhases").EnumerateArray().ToList();
        Assert.Equal(quarters.Select(q => Str(q, "name")), sky.MoonQuarters.Select(q => q.Name));
        var stations = g.GetProperty("retrogrades").EnumerateArray().ToList();
        Assert.Equal(stations.Select(s => Str(s, "planet")), sky.Stations.Select(s => PlanetInfo.Id(s.Planet)));
        var ingresses = g.GetProperty("ingresses").EnumerateArray().ToList();
        Assert.Equal(ingresses.Select(s => Str(s, "planet")), sky.Ingresses.Select(s => PlanetInfo.Id(s.Planet)));
        Assert.Equal(g.GetProperty("eclipses").GetArrayLength(), sky.Eclipses.Count);
    }

    [Fact]
    public void The_moon_phase_matches_web()
    {
        foreach (var g in Root.GetProperty("moonPhases").EnumerateArray())
        {
            var m = MoonPhaseCalculator.Compute(Utc(g.GetProperty("at")));
            Assert.True(Math.Abs(g.GetProperty("angle").GetDouble() - m.Angle) < DegreeTolerance);
            Assert.True(Math.Abs(g.GetProperty("illuminationFraction").GetDouble() - m.IlluminationFraction) < 1e-9);
            Assert.Equal(Str(g, "name"), m.Name);
            Assert.Equal(g.GetProperty("isWaxing").GetBoolean(), m.IsWaxing);
            Assert.Equal(Str(g, "nextQuarterName"), m.NextQuarterName);
            Near(Utc(g.GetProperty("nextQuarterDate")), m.NextQuarterDate, "next quarter");
        }
    }

    [Fact]
    public void The_solar_return_matches_web()
    {
        foreach (var g in Root.GetProperty("solarReturns").EnumerateArray())
        {
            var r = SkyEvents.SolarReturn(g.GetProperty("natalSunLongitude").GetDouble(), Utc(g.GetProperty("from")));
            Assert.NotNull(r);
            Assert.Equal(ZodiacSigns.FromName(Str(g, "sign")), r!.Sign);
            Assert.True(Math.Abs(g.GetProperty("degree").GetDouble() - r.Degree) < DegreeTolerance);
            Near(Utc(g.GetProperty("date")), r.Date, $"solar return {Str(g, "natal")}");
        }
    }

    // ---- Charts against charts -------------------------------------------

    [Fact]
    public void Long_transit_spans_match_web()
    {
        var g = Root.GetProperty("spans");
        var points = g.GetProperty("natalPoints").EnumerateArray()
            .Select(p => new NatalPoint(Str(p, "key"), p.GetProperty("longitude").GetDouble())).ToList();
        var spans = TransitSpans.Compute(points, SkyEvents.SlowBodies, Utc(g.GetProperty("start")),
            g.GetProperty("days").GetInt32());

        var expected = g.GetProperty("spans").EnumerateArray().ToList();
        Assert.Equal(expected.Select(s => Str(s, "id")), spans.Select(s => s.Id));
        for (var i = 0; i < expected.Count; i++)
        {
            var e = expected[i];
            var s = spans[i];
            Near(Utc(e.GetProperty("start")), s.Start, $"{s.Id} start");
            Near(Utc(e.GetProperty("end")), s.End, $"{s.Id} end");
            var passes = e.GetProperty("passes").EnumerateArray().Select(Utc).ToList();
            Assert.Equal(passes.Count, s.Passes.Count);
            for (var p = 0; p < passes.Count; p++) Near(passes[p], s.Passes[p], $"{s.Id} pass {p}");
            Assert.Equal(ZodiacSigns.FromName(Str(e, "transitSign")), s.TransitSign);
            Assert.True(Math.Abs(e.GetProperty("transitDegree").GetDouble() - s.TransitDegree) < 1e-4);
        }
    }

    [Fact]
    public void Synastry_finds_the_contacts_web_finds_in_the_same_order()
    {
        var g = Root.GetProperty("synastry");
        var aspects = CrossAspects.Compute(GoldenChart(Str(g, "chartA")), GoldenChart(Str(g, "chartB")), Store.AspectRules);
        var expected = g.GetProperty("aspects").EnumerateArray().ToList();
        Assert.Equal(
            expected.Select(a => (Str(a, "a"), Str(a, "b"), Str(a, "kind"))),
            aspects.Select(a => (PlanetInfo.Id(a.From), PlanetInfo.Id(a.To), AspectKinds.Id(a.Kind))));
        for (var i = 0; i < expected.Count; i++)
            Assert.True(Math.Abs(expected[i].GetProperty("orb").GetDouble() - aspects[i].Orb) < 1e-9);
        Assert.Equal(
            g.GetProperty("top5").EnumerateArray().Select(a => (Str(a, "a"), Str(a, "b"), Str(a, "kind"))),
            CrossAspects.Tightest(aspects, 5).Select(a => (PlanetInfo.Id(a.From), PlanetInfo.Id(a.To), AspectKinds.Id(a.Kind))));
    }

    [Fact]
    public void Transits_to_a_natal_chart_match_web()
    {
        var g = Root.GetProperty("transits");
        var hits = CrossAspects.Compute(GoldenChart(Str(g, "transitChart")), GoldenChart(Str(g, "natalChart")), Store.AspectRules);
        Assert.Equal(
            g.GetProperty("hits").EnumerateArray().Select(a => (Str(a, "transit"), Str(a, "natal"), Str(a, "kind"))),
            hits.Select(a => (PlanetInfo.Id(a.From), PlanetInfo.Id(a.To), AspectKinds.Id(a.Kind))));
        Assert.Equal(
            g.GetProperty("top5").EnumerateArray().Select(a => (Str(a, "transit"), Str(a, "natal"), Str(a, "kind"))),
            CrossAspects.TopTransits(hits).Select(a => (PlanetInfo.Id(a.From), PlanetInfo.Id(a.To), AspectKinds.Id(a.Kind))));
    }

    // ---- Births ----------------------------------------------------------

    /// <summary>
    /// iOS and Linux read the IANA zone history, as web does. Windows maps an
    /// IANA id onto its own registry rules, which drop some history outright:
    /// it has no daylight saving for Tunis in any year, where IANA has it in
    /// 1978 and 2006 to 2008. On Windows a case whose zone data disagrees with
    /// web's offset at web's own instant is therefore not a test of this code,
    /// and is left out; at least three cases must still run everywhere.
    /// </summary>
    [Fact]
    public void A_birth_resolves_to_the_instant_web_resolves_it_to()
    {
        var checkedCases = 0;
        foreach (var g in Root.GetProperty("births").EnumerateArray())
        {
            var i = g.GetProperty("input");
            var input = new BirthInput(
                i.GetProperty("year").GetInt32(), i.GetProperty("month").GetInt32(), i.GetProperty("day").GetInt32(),
                i.GetProperty("hour").GetInt32(), i.GetProperty("minute").GetInt32(),
                i.GetProperty("latitude").GetDouble(), i.GetProperty("longitude").GetDouble());
            var zone = BirthResolver.FindZone(Str(g, "timezone"));
            var expectedUtc = Utc(g.GetProperty("utc"));
            var expectedOffset = g.GetProperty("offsetMinutes").GetInt32();

            if (OperatingSystem.IsWindows()
                && (int)zone.GetUtcOffset(expectedUtc).TotalMinutes != expectedOffset)
                continue;

            var resolved = BirthResolver.Resolve(input, zone);
            Assert.Equal(expectedUtc, resolved.Utc);
            Assert.Equal(expectedOffset, resolved.OffsetMinutes);
            checkedCases++;
        }
        Assert.True(checkedCases >= 3, $"only {checkedCases} birth cases ran");
        if (!OperatingSystem.IsWindows())
            Assert.Equal(Root.GetProperty("births").GetArrayLength(), checkedCases);
    }

    [Fact]
    public void A_wall_clock_hour_that_never_happened_moves_forward_as_web_moves_it()
    {
        // 02:30 on 2021-03-28 does not exist in London: the clocks jumped from
        // 01:00 to 02:00 UTC. Web reads it at the new offset, 01:30 UTC.
        var resolved = BirthResolver.Resolve(
            new BirthInput(2021, 3, 28, 2, 30, 51.5074, -0.1278),
            BirthResolver.FindZone("Europe/London"));
        Assert.Equal(new DateTime(2021, 3, 28, 1, 30, 0, DateTimeKind.Utc), resolved.Utc);
        Assert.Equal(60, resolved.OffsetMinutes);
    }

    [Fact]
    public void A_saved_birth_round_trips_and_casts_the_chart_it_describes()
    {
        var saved = new SavedBirth("Test", Culture.Rome, 1990, 1, 15, 5, 30, 41.9028, 12.4964, "Rome, Italy",
            "Europe/Rome", ZoneEstimated: false);
        var back = SavedBirth.FromJson(saved.ToJson());
        Assert.Equal(saved, back);
        // 05:30 in Rome in January is 04:30 UTC: the rome-1990 golden.
        var chart = back!.Cast(Store.AspectRules);
        Assert.Equal(new DateTime(1990, 1, 15, 4, 30, 0, DateTimeKind.Utc), chart.Utc);
        var golden = GoldenChart("rome-1990");
        foreach (var planet in PlanetInfo.Order)
            Assert.True(Math.Abs(golden[planet] - chart.Longitudes[planet]) < 0.001, planet.ToString());
        Assert.Null(SavedBirth.FromJson("{not json"));
        Assert.Null(SavedBirth.FromJson(null));
    }

    /// <summary>
    /// The CI smoke run seeds this file into the iOS simulator's app container,
    /// so its format is pinned here: if SavedBirth's JSON shape changes, this
    /// fails on Windows before the simulator run silently shows onboarding.
    /// </summary>
    [Fact]
    public void The_smoke_run_s_seed_record_reads_as_the_rome_1990_birth()
    {
        var json = File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "TestData", "smoke-birth.v1.json"));
        var birth = SavedBirth.FromJson(json);
        Assert.NotNull(birth);
        Assert.Equal(Culture.Egypt, birth!.Culture);
        Assert.Equal(new DateTime(1990, 1, 15, 4, 30, 0, DateTimeKind.Utc), birth.Resolve().Utc);
        Assert.Equal(json.Trim(), birth.ToJson());
    }

    [Fact]
    public void A_zone_estimated_from_longitude_is_a_whole_hour_band()
    {
        Assert.Equal(TimeSpan.FromHours(5), BirthResolver.EstimateZoneForLongitude(72.88).BaseUtcOffset);
        Assert.Equal(TimeSpan.FromHours(-5), BirthResolver.EstimateZoneForLongitude(-74.0).BaseUtcOffset);
        Assert.Equal(TimeSpan.Zero, BirthResolver.EstimateZoneForLongitude(-0.13).BaseUtcOffset);
        Assert.Equal("UTC+05:30", BirthResolver.FormatOffset(330));
        Assert.Equal("UTC-04:00", BirthResolver.FormatOffset(-240));
    }

    [Fact]
    public void Every_offline_city_carries_a_zone_this_runtime_can_load()
    {
        Assert.NotEmpty(Store.Cities);
        foreach (var city in Store.Cities)
            Assert.NotNull(BirthResolver.FindZone(city.TimeZone));
    }
}
