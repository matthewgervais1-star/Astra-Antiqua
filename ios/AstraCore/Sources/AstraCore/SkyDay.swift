import Foundation

/// Everything Sky Day prints, in its order (the Glass-Day board): the
/// kicker, the decree, the sky computed (the Moon and the season), the
/// chart rows and the long transit. The decree, the chart rows' sentences
/// and the long transit's titles are the web's own strings; the kicker's
/// date, the chart rows' data lines and the long transit's meta and footer
/// lines are the board's forms built from the web's numbers.
public struct SkyDayPage: Sendable, Hashable {
    public struct ChartRow: Sendable, Hashable {
        /// The moving body: the row's glyph.
        public let planet: Planet
        /// dayPressure's clause: "Isis rows in time with your Amun in the eighth. It touches …"
        public let sentence: String
        /// "VENUS △ NATAL JUPITER · 0.8° FROM EXACT · ", or nil on a group nothing touches.
        public let data: String?
        /// "EASE", "TENSION" or "UNION", printed after `data`.
        public let tone: String?
        public let tension: Bool
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
        public let spanId: String
    }

    /// "WED 21 OCT 2026 · THE HALL OF MA’AT"
    public let kicker: String
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
    /// The four house groups that hold a contact, in the groups' fixed
    /// order; nil without a chart.
    public let chartRows: [ChartRow]?
    /// Nil without a chart, or when no slow body comes within reach.
    public let longTransit: LongTransitCard?
}

public enum SkyDayBuilder {
    private static let utc = TimeZone(secondsFromGMT: 0)!

    /// "WED 21 OCT 2026" for the UTC day `date` falls in, the day the decree reads.
    public static func kickerDate(_ date: Date) -> String {
        let ymd = Instant.localYMD(date, utc)
        return "\(Format.weekday(date, zone: utc)) \(ymd.day) \(Format.month(date, zone: utc)) \(ymd.year)"
    }

    /// "0.8°": the orb to one decimal, as the board's data lines print it.
    public static func orbTenths(_ orb: Double) -> String {
        String(format: "%.1f°", (orb * 10).rounded() / 10)
    }

    /// The tone word of a contact (web's toneOf): EASE, TENSION or UNION.
    public static func toneWord(_ kind: AspectKind) -> String {
        switch kind {
        case .trine, .sextile: return "EASE"
        case .square, .opposition: return "TENSION"
        case .conjunction: return "UNION"
        }
    }

    /// "VENUS △ NATAL JUPITER · 0.8° FROM EXACT · "
    public static func dataLine(_ c: PressureContact, store: ContentStore) -> String {
        let a = store.planetCopy(c.transit).label.uppercased()
        let b = store.planetCopy(c.natal).label.uppercased()
        return "\(a) \(store.day.aspectGlyph(c.kind)) NATAL \(b) · \(orbTenths(c.orb)) FROM EXACT · "
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
        let decree = DayDecreeComposer.composeDayPage(culture, date: now, store: store)
        let hero = decree.figures.first.flatMap { DayDecreeComposer.headlineBody($0.a, $0.b, store: store)?.body }

        let moon = MoonPhaseCalculator.compute(now)
        let lit = Int(DayDecreeComposer.jsRound(moon.illuminationFraction * 100))
        let nq = moon.nextQuarterDate
        let nqDate = "\(Format.dayMonth(nq, zone: zone)) \(Instant.localYMD(nq, zone).year)"

        let season = Season.current(now, zone: zone)
        let progress = season.totalDays > 0 ? min(1, max(0, Double(season.dayOfSeason) / Double(season.totalDays))) : 0

        var rows: [SkyDayPage.ChartRow]? = nil
        var card: SkyDayPage.LongTransitCard? = nil
        if let natal {
            let today = Ephemeris.computeChart(DayDecreeComposer.utcDayStart(now))
            let groups = DayPressure.compute(
                natal: natal.longitudes, ascendant: natal.ascendant, today: today, culture: culture, store: store)
            rows = groups.compactMap { g in
                guard let lead = g.lead else { return nil }
                return SkyDayPage.ChartRow(
                    planet: lead.transit, sentence: g.sentence, data: dataLine(lead, store: store),
                    tone: toneWord(lead.kind), tension: lead.kind.isHard)
            }
            if let spans,
               let lt = LongTransitPick.pick(spans: spans, now: now, today: today, culture: culture, store: store) {
                let ahead = lt.span.passes.filter { $0 > now }.count
                let tone = TransitSpans.tone(lt.span) == .ease ? "EASE" : "TENSION"
                card = SkyDayPage.LongTransitCard(
                    meta: "\(lt.active ? "OPEN NOW" : "NEXT") · \(lt.rangeLabel)",
                    title1: lt.title1,
                    title2: lt.title2,
                    progress: lt.progressPct / 100,
                    footer: "\(lt.span.passes.count) EXACT · \(ahead) AHEAD · \(tone)",
                    spanId: lt.span.id)
            }
        }

        return SkyDayPage(
            kicker: "\(kickerDate(now)) · \(store.day.institution(culture))",
            heroPlanet: hero,
            headline: decree.headline,
            evidence: decree.evidence,
            paragraph: decree.paragraph,
            moon: "\(moon.name.uppercased()) · \(lit)% LIT",
            nextQuarterName: moon.nextQuarterName.uppercased(),
            nextQuarterDate: nqDate,
            season: "SUN IN \(season.sign.name.uppercased()) · DAY \(season.dayOfSeason) OF \(season.totalDays)",
            seasonProgress: progress,
            seasonStart: Format.dayMonth(season.start, zone: zone),
            seasonToGo: "\(season.daysRemaining) TO GO",
            seasonEnd: Format.dayMonth(season.end, zone: zone),
            chartRows: rows,
            longTransit: card)
    }
}
