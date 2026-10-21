import AstraCore
import SwiftUI

/// The day: today's line from the week reading, the Moon's phase, where the
/// season stands, today's sky against the natal chart, and the chart's own
/// summary with its two lights. Port of the MAUI DayPage.
///
/// The MAUI page rebuilds each time it appears, so a change of culture or of
/// the birth record reaches it. Here the sky is read off the main thread
/// whenever the screen appears and whenever the culture or the chart changes;
/// a reading for the same culture and chart stays up while a fresh one is
/// computed, and one for another culture or chart is never shown.
struct DayView: View {
    @Environment(AppState.self) private var state
    @State private var outcome: DayOutcome?

    init() {}

    var body: some View {
        let culture = state.cultureOrDefault
        let words = Words(culture, zone: state.zone)
        let key = DayKey(culture: culture, chart: state.chart)
        Page(title: "Today") {
            NaveHead(kicker: "\(words.cultureLabel) · \(words.weekdayDate(Date()))", headline: "The day") {
                GlyphView(culture: culture, planet: .sun, size: 40, tint: accent)
            }
            if let outcome, outcome.key == key {
                switch outcome.result {
                case .success(let sky):
                    reading(sky, chart: key.chart, words: words)
                case .failure(let error):
                    Failure(message: error.localizedDescription)
                }
            } else {
                Working(text: "Reading the sky…")
            }
        }
        .task(id: key) { await load(key) }
    }

    private var accent: Color { Ink.accent(state.culture) }

    // MARK: Sections, in the MAUI page's order

    @ViewBuilder
    private func reading(_ sky: DaySky, chart: NatalChart?, words: Words) -> some View {
        Panel(border: accent) { WeekDayLine(day: sky.today, words: words) }
        moonSection(sky.moon, words: words)
        seasonSection(sky.season)
        if let chart, let transits = sky.transits {
            transitsSection(transits, words: words)
            if let natal = state.reading {
                chartSection(chart, natal, words: words)
            }
        } else {
            needsChart
        }
    }

    @ViewBuilder
    private func moonSection(_ moon: MoonPhase, words: Words) -> some View {
        // Math.Round in the MAUI page rounds half to even.
        let lit = Int((moon.illuminationFraction * 100).rounded(.toNearestOrEven))
        SectionDivider(label: "The Moon")
        Inset {
            Title(text: "\(moon.name) · \(lit)% lit")
            Caption(text: "\(moon.nextQuarterName) on \(words.dayMonthYear(moon.nextQuarterDate))")
        }
    }

    @ViewBuilder
    private func seasonSection(_ season: SeasonWindow) -> some View {
        SectionDivider(label: "The season")
        LinkRow(destination: { HorizonsView(initial: .season) }) {
            Title(text: "The Sun in \(season.sign.name)")
            Caption(text: "Day \(season.dayOfSeason) of \(season.totalDays) · \(season.daysRemaining) to go")
        }
    }

    @ViewBuilder
    private func transitsSection(_ transits: [CrossAspect], words: Words) -> some View {
        let banks = state.store.banks
        let culture = words.culture
        SectionDivider(label: "The sky on your chart today")
        if transits.isEmpty {
            Inset { Prose(text: banks.quietLine(culture)) }
        }
        ForEach(transits, id: \.self) { t in
            let orb = String(format: "%.1f", t.orb)
            RowBody {
                Prose(text: "\(words.deity(t.from)) \(banks.aspectVerb(culture, t.kind)) your \(words.deity(t.to)).")
                Caption(
                    text: "\(words.label(t.from)) \(banks.aspectGlyph(t.kind)) natal \(words.label(t.to)) · \(orb)° from exact",
                    color: t.kind.isHard ? Ink.conflict : Ink.dim)
            }
        }
    }

    @ViewBuilder
    private func chartSection(_ chart: NatalChart, _ natal: NatalReading, words: Words) -> some View {
        SectionDivider(label: "Your chart")
        Inset { Prose(text: natal.summary, italic: true) }
        ForEach([Planet.sun, Planet.moon], id: \.self) { planet in
            let p = natal.placements[planet.index]
            LinkRow(destination: { PlacementView(planet: planet) }) {
                Kicker(text: "\(words.label(planet)) in \(p.sign.name) · House \(chart[planet].house)", alignment: .leading)
                Title(text: "\(p.deityName), \(p.deityEpithet)")
                Prose(text: p.signReading)
            }
        }
        DayLinkButton(title: "All ten placements") { PlacementsView() }
    }

    /// What the day shows in place of the chart's sections when no chart is
    /// on the device (the MAUI SkyPage's AddNeedsChart).
    @ViewBuilder
    private var needsChart: some View {
        SectionDivider(label: "Your sky")
        Panel {
            Prose(text: "The day above is the sky's own. Read against a birth, it becomes yours: the transits to your chart and your two lights.")
        }
        DayLinkButton(title: "Cast your chart") { BirthView() }
    }

    // MARK: Reading the sky

    private func load(_ key: DayKey) async {
        let store = state.store
        let zone = state.zone
        let culture = key.culture
        let natal = key.chart?.longitudes
        let result: Result<DaySky, Error>
        do {
            let sky = try await Task.detached(priority: .userInitiated) { () throws -> DaySky in
                try DaySky.read(culture: culture, natal: natal, zone: zone, store: store)
            }.value
            result = .success(sky)
        } catch {
            result = .failure(error)
        }
        // A newer key started its own reading; this one is stale.
        if Task.isCancelled { return }
        outcome = DayOutcome(key: key, result: result)
    }
}

/// What the day is read for: the culture in force and the chart, if any.
private struct DayKey: Hashable, Sendable {
    let culture: Culture
    let chart: NatalChart?
}

/// A finished reading of the day and the key it was read for.
private struct DayOutcome {
    let key: DayKey
    let result: Result<DaySky, Error>
}

/// Everything the day computes off the main thread.
private struct DaySky: Sendable {
    let today: WeekDay
    let moon: MoonPhase
    let season: SeasonWindow
    /// Today's tightest transits to the natal chart; nil when there is no chart.
    let transits: [CrossAspect]?

    static func read(culture: Culture, natal: [Planet: Double]?, zone: TimeZone, store: ContentStore) throws -> DaySky {
        let now = Date()
        let week = WeekReading.build(
            culture: culture,
            weekStart: WeekReading.mondayOf(now, zone: zone),
            zone: zone,
            now: now,
            store: store)
        guard let today = week.first(where: { $0.isToday }) ?? week.first else {
            throw DayError(message: "The week came back with no days in it.")
        }
        let transits = natal.map { longitudes in
            CrossAspects.topTransits(
                CrossAspects.compute(Ephemeris.computeChart(now), longitudes, rules: store.aspectRules))
        }
        return DaySky(
            today: today,
            moon: MoonPhaseCalculator.compute(now),
            season: Season.current(now, zone: zone),
            transits: transits)
    }
}

private struct DayError: LocalizedError {
    let message: String
    var errorDescription: String? { message }
}

/// ActionButton's framed accent text as a link that opens another screen,
/// for the MAUI actions that push a page.
private struct DayLinkButton<Destination: View>: View {
    @Environment(\.culture) private var culture
    let title: String
    @ViewBuilder var destination: () -> Destination

    // The private environment property would make the memberwise
    // initialiser private, out of DayView's reach.
    init(title: String, @ViewBuilder destination: @escaping () -> Destination) {
        self.title = title
        self.destination = destination
    }

    var body: some View {
        let color = Ink.accent(culture)
        NavigationLink {
            destination()
        } label: {
            Text(title.uppercased())
                .font(.custom(Ink.monoStrong, size: 12))
                .tracking(1.4)
                .foregroundStyle(color)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .overlay(Rectangle().stroke(color, lineWidth: 1))
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .padding(.horizontal, Metrics.gutter)
        .padding(.vertical, 8)
    }
}
