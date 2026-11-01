import Foundation

/// Everything Sky Day prints, in its order (the Glass-Day board): the
/// kicker, the decree, the sky computed (the Moon and the season), the
/// chart rows and the long transit. The decree, the chart rows' sentences
/// and the long transit's titles are the web's own strings; every frame and
/// label is a key of the shared catalog (shared/strings/en.json) and every
/// date, count and angle a named format (formats.json), as the ruled table
/// docs/design/shared-strings-table-2026-11.md sets them. ScreenGoldenTests
/// holds the page to shared/goldens/screens/day.json.
public struct SkyDayPage: Sendable, Hashable {
    public struct ChartRow: Sendable, Hashable {
        /// The moving body: the row's glyph, or nil on a group nothing touches.
        public let planet: Planet?
        /// dayPressure's clause: "Isis rows in time with your Amun in the eighth. It touches …"
        public let sentence: String
        /// "VENUS △ NATAL JUPITER · 0.8° FROM EXACT · ", or nil on a group nothing touches.
        public let data: String?
        /// "EASE", "TENSION" or "UNION", printed after `data`.
        public let tone: String?
        public let tension: Bool
        /// The whole data line, `data` then `tone` (day.chart.row.data).
        public var dataLine: String? { data.map { $0 + (tone ?? "") } }
    }

    public struct LongTransitCard: Sendable, Hashable {
        /// "OPEN NOW · OCT 2026 → JUN 2027"
        public let meta: String
        public let title1: String
        public let title2: String
        /// 0 to 1.
        public let progress: Double
        /// "3 EXACT · 2 AHEAD · EASE"
        public let footer: String
        /// "READ →"
        public let link: String
        public let spanId: String
    }

    /// "WED 21 OCT 2026 · THE HALL OF MA’AT"
    public let kicker: String
    /// The section labels: "THE SKY, COMPUTED", "MOON", "SEASON",
    /// "ON YOUR CHART TODAY", "THE LONG TRANSIT".
    public let skyLabel: String
    public let moonLabel: String
    public let seasonLabel: String
    public let chartLabel: String
    public let longTransitLabel: String
    /// The decree's headline body, drawn above the headline; nil on a quiet day.
    public let heroPlanet: Planet?
    public let headline: String
    /// "ISIS □ OSIRIS · 0°25′", or "" on a quiet day.
    public let evidence: String
    public let paragraph: String
    /// "WAXING GIBBOUS · 74% LIT"
    public let moon: String
    /// "FULL MOON"
    public let nextQuarterName: String
    /// "26 OCT 2026"
    public let nextQuarterDate: String
    /// "SUN IN LIBRA · DAY 29 OF 31"
    public let season: String
    /// Days gone over the season's days, 0 to 1.
    public let seasonProgress: Double
    /// "23 SEP", "2 TO GO", "23 OCT"
    public let seasonStart: String
    public let seasonToGo: String
    public let seasonEnd: String
    /// The house groups that hold a contact, in the groups' fixed order;
    /// nil without a chart or when no group holds one.
    public let chartRows: [ChartRow]?
    /// Nil without a chart, or when no slow body comes within reach.
    public let longTransit: LongTransitCard?
    /// Web's footer links, "THE WEEK →", "THE SEASON →", "THE YEAR →"; the board hides them.
    public let footer: [String]
    /// Web's feedback row, "AGAINST THIS DECREE →" and its three parts; the board hides it.
    public let feedback: [String]
}

public enum SkyDayBuilder {
    private static let utc = TimeZone(secondsFromGMT: 0)!

    /// "WED 21 OCT 2026" for the UTC day `date` falls in, the day the decree reads (F1).
    public static func kickerDate(_ date: Date, store: ContentStore) -> String {
        store.formats.dateDay(date, zone: utc)
    }

    /// "VENUS △ NATAL JUPITER · 0.8° FROM EXACT · ": day.chart.row.data up to
    /// its tone word, which the row prints in its own colour.
    public static func dataLine(_ c: PressureContact, culture: Culture, store: ContentStore) -> String {
        let f = store.formats
        return store.strings.fill("day.chart.row.data", culture, [
            "planet": f.planetName(c.transit),
            "aspectGlyph": store.day.aspectGlyph(c.kind),
            "natalPlanet": f.planetName(c.natal),
            "orb": f.orbDecimal(c.orb),
            "tone": "",
        ])
    }

    /// The four lines web's feedback row prints for a screen's noun.
    public static func feedbackLines(noun: String, store: ContentStore) -> [String] {
        let s = store.strings
        return [
            s.fill("chrome.feedback.lead", nil, ["noun": noun]),
            s.text("chrome.feedback.so"),
            s.text("chrome.feedback.notSo"),
            s.text("chrome.feedback.kept"),
        ]
    }

    /// The page for an instant. `natal` is nil without a birth record;
    /// `spans` are the long-transit spans for that chart (slow to compute,
    /// so the caller holds them); `zone` is the reader's calendar for the
    /// Moon's and the season's dates.
    public static func build(
        culture: Culture,
        now: Date,
        zone: TimeZone,
        natal: NatalChart?,
        spans: [TransitSpan]?,
        store: ContentStore
    ) -> SkyDayPage {
        let s = store.strings
        let f = store.formats
        let decree = DayDecreeComposer.composeDayPage(culture, date: now, store: store)
        let hero = decree.figures.first.flatMap { DayDecreeComposer.headlineBody($0.a, $0.b, store: store)?.body }

        let moon = MoonPhaseCalculator.compute(now)
        let phase = s.text(Strings.moonPhaseKey(moon.name), culture)
        let quarter = s.text(Strings.moonPhaseKey(moon.nextQuarterName), culture)

        let season = Season.current(now, zone: zone)
        let progress = season.totalDays > 0 ? min(1, max(0, Double(season.dayOfSeason) / Double(season.totalDays))) : 0

        var rows: [SkyDayPage.ChartRow]? = nil
        var card: SkyDayPage.LongTransitCard? = nil
        if let natal {
            let today = Ephemeris.computeChart(DayDecreeComposer.utcDayStart(now))
            let groups = DayPressure.compute(
                natal: natal.longitudes, ascendant: natal.ascendant, today: today, culture: culture, store: store)
            // Every group prints a row, as web's day model does: a group nothing
            // touches keeps its "Nothing exact touches your ..." sentence with
            // no glyph, data or tone.
            rows = groups.map { g -> SkyDayPage.ChartRow in
                guard let lead = g.lead else {
                    return SkyDayPage.ChartRow(planet: nil, sentence: g.sentence,
                                               data: nil, tone: nil, tension: false)
                }
                return SkyDayPage.ChartRow(
                    planet: lead.transit, sentence: g.sentence,
                    data: dataLine(lead, culture: culture, store: store),
                    tone: f.toneWord(lead.kind), tension: lead.kind.isHard)
            }
            if let spans,
               let lt = LongTransitPick.pick(spans: spans, now: now, today: today, culture: culture, store: store) {
                let ahead = lt.span.passes.filter { $0 > now }.count
                card = SkyDayPage.LongTransitCard(
                    meta: s.fill("day.longTransit.meta", culture, [
                        "status": s.text(lt.active ? "day.longTransit.open" : "day.longTransit.next", culture),
                        "range": lt.rangeLabel,
                    ]),
                    title1: lt.title1,
                    title2: lt.title2,
                    progress: lt.progressPct / 100,
                    footer: s.fill("day.longTransit.footer", culture, [
                        "exact": f.countDigits(lt.span.passes.count),
                        "ahead": f.countDigits(ahead),
                        "tone": f.spanToneWord(TransitSpans.tone(lt.span)),
                    ]),
                    link: s.text("day.longTransit.link", culture),
                    spanId: lt.span.id)
            }
        }

        return SkyDayPage(
            kicker: s.fill("day.kicker", culture, [
                "date": kickerDate(now, store: store),
                "institution": s.text("common.institution", culture),
            ]),
            skyLabel: s.text("day.sky.label", culture),
            moonLabel: s.text("day.sky.moon.label", culture),
            seasonLabel: s.text("day.sky.season.label", culture),
            chartLabel: s.text("day.chart.label", culture),
            longTransitLabel: s.text("day.longTransit.label", culture),
            heroPlanet: hero,
            headline: decree.headline,
            evidence: decree.evidence,
            paragraph: decree.paragraph,
            moon: s.fill("day.sky.moon.line", culture, [
                "phase": phase,
                "percent": f.percent(moon.illuminationFraction),
            ]),
            nextQuarterName: s.fill("day.sky.nextQuarter", culture, ["quarter": quarter]),
            nextQuarterDate: s.fill("day.sky.nextQuarter.date", culture, [
                "date": f.dayMonthYear(moon.nextQuarterDate, zone: zone),
            ]),
            season: s.fill("day.sky.season.line", culture, [
                "sign": f.signFull(season.sign),
                "n": String(season.dayOfSeason),
                "total": String(season.totalDays),
            ]),
            seasonProgress: progress,
            seasonStart: f.dayMonth(season.start, zone: zone),
            seasonToGo: s.fill("day.sky.bar.toGo", culture, [
                "remaining": String(max(0, season.totalDays - season.dayOfSeason)),
            ]),
            seasonEnd: f.dayMonth(season.end, zone: zone),
            chartRows: rows,
            longTransit: card,
            footer: ["chrome.footer.toWeek", "chrome.footer.toSeason", "chrome.footer.toYear"].map { s.text($0) },
            feedback: feedbackLines(noun: s.text("day.feedback.noun", culture), store: store))
    }
}
