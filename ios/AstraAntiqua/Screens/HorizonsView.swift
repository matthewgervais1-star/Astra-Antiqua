import AstraCore
import SwiftUI

/// The longer horizons behind the W / S / Y control the other surfaces carry:
/// the week in the culture's voice, the season the Sun's sign defines, and
/// the sky's year from the first of this month. Port of the MAUI HorizonsPage.
///
/// Each horizon is read off the main thread when the screen appears, when the
/// switcher changes it, and when the culture or the chart changes. A reading
/// for the same horizon, culture and chart stays up while a fresh one is
/// computed; one for another is never shown.
struct HorizonsView: View {
    enum Horizon: CaseIterable, Hashable, Sendable {
        case week, season, year
    }

    @Environment(AppState.self) private var state
    @State private var horizon: Horizon
    @State private var outcome: HorizonsOutcome?

    /// False under the glass horizon control (P2), which picks the horizon
    /// in its place; the screen keeps its own switcher where it stands alone.
    private let showsSwitcher: Bool

    init(initial: Horizon = .week, showsSwitcher: Bool = true) {
        _horizon = State(initialValue: initial)
        self.showsSwitcher = showsSwitcher
    }

    var body: some View {
        let culture = state.cultureOrDefault
        let words = Words(culture, zone: state.zone)
        let key = HorizonsKey(horizon: horizon, culture: culture, chart: state.chart)
        Page(title: "Horizons") {
            if showsSwitcher {
                switcher
            }
            if horizon == .week {
                weekHead(words)
            }
            if let outcome, outcome.key == key {
                switch outcome.result {
                case .success(let sky):
                    reading(sky, chart: key.chart, words: words)
                case .failure(let error):
                    Failure(message: error.localizedDescription)
                }
            } else {
                Working(text: workingText)
            }
        }
        .task(id: key) { await load(key) }
    }

    private var accent: Color { Ink.accent(state.culture) }

    private var workingText: String {
        switch horizon {
        case .week: return "Reading the week…"
        case .season: return "Reading the season…"
        case .year: return "Reading the year…"
        }
    }

    // MARK: The W / S / Y switcher

    private var switcher: some View {
        HStack(spacing: 8) {
            ForEach(Horizon.allCases, id: \.self) { choice in
                switchButton(choice)
            }
        }
        .padding(.horizontal, Metrics.gutter)
        .padding(.top, 16)
    }

    private func switchButton(_ choice: Horizon) -> some View {
        let on = choice == horizon
        let color = on ? accent : Ink.dim
        return Button {
            horizon = choice
        } label: {
            Text(verbatim: "\(choice.letter) · \(choice.name.uppercased())")
                .font(.custom(Ink.monoStrong, size: 11))
                .foregroundStyle(color)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .overlay(Rectangle().stroke(on ? accent : Ink.rule, lineWidth: 1))
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(on ? .isSelected : [])
    }

    // MARK: The three horizons

    @ViewBuilder
    private func reading(_ sky: HorizonsSky, chart: NatalChart?, words: Words) -> some View {
        switch sky {
        case .week(let week):
            weekBody(week, words: words)
        case .season(let season):
            seasonBody(season, chart: chart, words: words)
        case .year(let year):
            yearBody(year, words: words)
        }
    }

    /// The week's head comes before its reading, as on the MAUI page: the
    /// Monday is a calendar sum and needs no sky.
    private func weekHead(_ words: Words) -> some View {
        let zone = words.zone
        let monday = loadedWeek?.monday ?? WeekReading.mondayOf(Date(), zone: zone)
        let sunday = Instant.calendar(zone).date(byAdding: .day, value: 6, to: monday) ?? Instant.addDays(monday, 6)
        return NaveHead(
            kicker: "\(words.cultureLabel) · the week",
            headline: "The week",
            sub: Format.enDashRange(Format.dayMonth(monday, zone: zone), words.dayMonthYear(sunday)))
    }

    private var loadedWeek: WeekSky? {
        guard let outcome, case .success(.week(let week)) = outcome.result else { return nil }
        return week
    }

    @ViewBuilder
    private func weekBody(_ week: WeekSky, words: Words) -> some View {
        ForEach(week.days, id: \.date) { day in
            if day.isToday {
                Panel(border: accent) { WeekDayLine(day: day, words: words) }
            } else {
                RowBody { WeekDayLine(day: day, words: words) }
            }
        }
        if words.culture == .rome {
            Inset {
                Caption(text: "F fastus, lawful for public business · N nefastus · C comitialis")
            }
        }
    }

    @ViewBuilder
    private func seasonBody(_ season: SeasonSky, chart: NatalChart?, words: Words) -> some View {
        let store = state.store
        let window = season.window
        NaveHead(
            kicker: "\(words.cultureLabel) · the season",
            headline: "The Sun in \(window.sign.name)",
            sub: "Day \(window.dayOfSeason) of \(window.totalDays) · \(words.dayMonthYear(window.start)) to \(words.dayMonthYear(window.end))")
        Inset { Prose(text: store.signInfo(window.sign).blurb) }

        if let chart {
            let house = WholeSignHouses.houseOfSign(window.sign, ascSignIndex: chart.ascendantSign.index)
            let meaning = store.house(house)
            SectionDivider(label: "Through your chart")
            Inset {
                Title(text: "The \(meaning.ordinal) house · \(meaning.title)")
                Prose(text: store.banks.seasonHouseLine(words.culture, house))
            }
        }

        SectionDivider(label: "The season's sky")
        HorizonEventRows(lines: seasonLines(season.events, words: words), quiet: store.banks.quietLine(words.culture))
    }

    @ViewBuilder
    private func yearBody(_ year: YearSky, words: Words) -> some View {
        let drafts = yearDrafts(year, words: words)
        NaveHead(
            kicker: "\(words.cultureLabel) · the year",
            headline: "The year ahead",
            sub: "\(words.dayMonthYear(year.start)) onward · \(drafts.count) turnings")
        ForEach(months(ordered(drafts, words: words), zone: words.zone)) { month in
            SectionDivider(label: month.label)
            HorizonEventRows(lines: month.lines, quiet: state.store.banks.quietLine(words.culture))
        }
    }

    // MARK: Event lines

    /// The season's sky in the MAUI page's order (quarters, eclipses,
    /// stations, ingresses), then by date.
    private func seasonLines(_ sky: SeasonSkyEvents, words: Words) -> [HorizonEventLine] {
        var drafts: [HorizonEventDraft] = []
        for q in sky.moonQuarters {
            drafts.append(HorizonEventDraft(
                date: q.date,
                head: "\(q.name) · \(q.sign.name)",
                text: "\(words.deity(.moon)) at \(Format.degree(q.degree)) \(q.sign.name).",
                color: Ink.dim))
        }
        for e in sky.eclipses { drafts.append(eclipseDraft(e)) }
        for s in sky.stations { drafts.append(stationDraft(s, words: words)) }
        for i in sky.ingresses { drafts.append(ingressDraft(i, words: words)) }
        return ordered(drafts, words: words)
    }

    /// The year's turnings in the MAUI page's order (ingresses, stations,
    /// eclipses), unsorted; the caller sorts them and groups them by month.
    private func yearDrafts(_ year: YearSky, words: Words) -> [HorizonEventDraft] {
        var drafts: [HorizonEventDraft] = []
        for i in year.ingresses { drafts.append(ingressDraft(i, words: words)) }
        for s in year.stations { drafts.append(stationDraft(s, words: words)) }
        for e in year.eclipses { drafts.append(eclipseDraft(e)) }
        return drafts
    }

    private func ingressDraft(_ i: IngressEvent, words: Words) -> HorizonEventDraft {
        HorizonEventDraft(
            date: i.date,
            head: "\(words.label(i.planet)) into \(i.toSign.name)",
            text: words.ingressLine(i.planet, i.toSign),
            color: Ink.harmony)
    }

    private func stationDraft(_ s: StationEvent, words: Words) -> HorizonEventDraft {
        let retrograde = s.kind == .retrograde
        let turn = retrograde ? "retrograde" : "direct"
        return HorizonEventDraft(
            date: s.date,
            head: "\(words.label(s.planet)) turns \(turn)",
            text: "\(words.deity(s.planet)) stands still at \(Format.degree(s.degree)) \(s.sign.name).",
            color: retrograde ? Ink.conflict : Ink.harmony)
    }

    private func eclipseDraft(_ e: EclipseEvent) -> HorizonEventDraft {
        let scope = e.scope == .solar ? "Solar" : "Lunar"
        return HorizonEventDraft(
            date: e.date,
            head: "\(scope) eclipse · \(e.kind)",
            text: "At \(Format.degree(e.degree)) \(e.sign.name).",
            color: accent)
    }

    /// By date, ties kept in the order the lines were added (the C#'s stable
    /// OrderBy), each with its dated caption.
    private func ordered(_ drafts: [HorizonEventDraft], words: Words) -> [HorizonEventLine] {
        let sorted = drafts.enumerated().sorted { (lhs: (offset: Int, element: HorizonEventDraft), rhs: (offset: Int, element: HorizonEventDraft)) -> Bool in
            if lhs.element.date != rhs.element.date { return lhs.element.date < rhs.element.date }
            return lhs.offset < rhs.offset
        }
        var lines: [HorizonEventLine] = []
        for (index, item) in sorted.enumerated() {
            let draft = item.element
            lines.append(HorizonEventLine(
                id: index,
                date: draft.date,
                caption: "\(words.dayMonthYear(draft.date)) · \(draft.head)",
                text: draft.text,
                color: draft.color))
        }
        return lines
    }

    /// Sorted lines grouped by the local month they fall in.
    private func months(_ lines: [HorizonEventLine], zone: TimeZone) -> [HorizonMonth] {
        var groups: [HorizonMonth] = []
        for line in lines {
            let local = Instant.localYMD(line.date, zone)
            let id = local.year * 12 + local.month
            if let last = groups.last, last.id == id {
                groups[groups.count - 1].lines.append(line)
            } else {
                groups.append(HorizonMonth(id: id, label: Format.monthYear(line.date, zone: zone), lines: [line]))
            }
        }
        return groups
    }

    // MARK: Reading the sky

    private func load(_ key: HorizonsKey) async {
        let store = state.store
        let zone = state.zone
        let culture = key.culture
        let horizon = key.horizon
        let result: Result<HorizonsSky, Error>
        do {
            let sky = try await Task.detached(priority: .userInitiated) { () throws -> HorizonsSky in
                try HorizonsSky.read(horizon, culture: culture, zone: zone, store: store)
            }.value
            result = .success(sky)
        } catch {
            result = .failure(error)
        }
        // A newer key started its own reading; this one is stale.
        if Task.isCancelled { return }
        outcome = HorizonsOutcome(key: key, result: result)
    }
}

private extension HorizonsView.Horizon {
    var letter: String {
        switch self {
        case .week: return "W"
        case .season: return "S"
        case .year: return "Y"
        }
    }

    var name: String {
        switch self {
        case .week: return "Week"
        case .season: return "Season"
        case .year: return "Year"
        }
    }
}

/// A day of the week strip: its line, its shorthand and its tone. Shared by
/// the day and the week (the MAUI Strips.DayLine).
struct WeekDayLine: View {
    let day: WeekDay
    let words: Words

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Caption(text: head, color: toneColor)
            Prose(text: day.line)
        }
    }

    private var head: String {
        var text = "\(day.label) · \(words.shorthand(day.shorthand))"
        if let flag = day.flag { text += " · \(flag.rawValue)" }
        return text
    }

    private var toneColor: Color {
        switch day.tone {
        case .tension: return Ink.conflict
        case .harmony: return Ink.harmony
        case .quiet: return Ink.dim
        }
    }
}

/// The dated rows of a horizon, or the culture's quiet line when there are none.
private struct HorizonEventRows: View {
    let lines: [HorizonEventLine]
    let quiet: String

    @ViewBuilder
    var body: some View {
        if lines.isEmpty {
            Inset { Prose(text: quiet) }
        } else {
            ForEach(lines) { line in
                RowBody {
                    Caption(text: line.caption, color: line.color)
                    Prose(text: line.text)
                }
            }
        }
    }
}

private struct HorizonEventDraft {
    let date: Date
    let head: String
    let text: String
    let color: Color
}

private struct HorizonEventLine: Identifiable {
    let id: Int
    let date: Date
    let caption: String
    let text: String
    let color: Color
}

private struct HorizonMonth: Identifiable {
    let id: Int
    let label: String
    var lines: [HorizonEventLine]
}

/// What a horizon is read for: which one, the culture in force and the chart, if any.
private struct HorizonsKey: Hashable, Sendable {
    let horizon: HorizonsView.Horizon
    let culture: Culture
    let chart: NatalChart?
}

/// A finished reading of a horizon and the key it was read for.
private struct HorizonsOutcome {
    let key: HorizonsKey
    let result: Result<HorizonsSky, Error>
}

private struct WeekSky: Sendable {
    /// The UTC instant of local midnight on the week's Monday.
    let monday: Date
    let days: [WeekDay]
}

private struct SeasonSky: Sendable {
    let window: SeasonWindow
    let events: SeasonSkyEvents
}

private struct YearSky: Sendable {
    let start: Date
    let ingresses: [IngressEvent]
    let stations: [StationEvent]
    let eclipses: [EclipseEvent]
}

/// Everything a horizon computes off the main thread.
private enum HorizonsSky: Sendable {
    case week(WeekSky)
    case season(SeasonSky)
    case year(YearSky)

    static func read(_ horizon: HorizonsView.Horizon, culture: Culture, zone: TimeZone, store: ContentStore) throws -> HorizonsSky {
        let now = Date()
        switch horizon {
        case .week:
            let monday = WeekReading.mondayOf(now, zone: zone)
            let days = WeekReading.build(culture: culture, weekStart: monday, zone: zone, now: now, store: store)
            if days.isEmpty { throw HorizonsError(message: "The week came back with no days in it.") }
            return .week(WeekSky(monday: monday, days: days))
        case .season:
            let window = Season.current(now, zone: zone)
            return .season(SeasonSky(window: window, events: Season.skyEventsIn(window)))
        case .year:
            let year = Horizons.year(now: now, zone: zone)
            return .year(YearSky(
                start: year.start,
                ingresses: year.ingresses,
                stations: year.stations,
                eclipses: year.eclipses))
        }
    }
}

private struct HorizonsError: LocalizedError {
    let message: String
    var errorDescription: String? { message }
}
