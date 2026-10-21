import AstraCore
import SwiftUI

/// The year ahead read against the reader's own chart: the solar return that
/// opens the personal year, the long transits open in the next twelve
/// months, and the stations inside them. Port of ForecastPage.cs.
struct ForecastView: View {
    @Environment(AppState.self) private var state
    @State private var year: ForecastYear?
    @State private var yearFor: SavedBirth?
    @State private var castingChart = false

    init() {}

    var body: some View {
        Page(title: "The year ahead") {
            NaveHead(kicker: "Read against your own sky", headline: "The year ahead")
            if state.chart == nil {
                Panel {
                    Prose(text: "A forecast is scored against your own sky, the chart cast once at the hour of your birth and kept. There is no chart on this device.")
                }
                ActionButton(title: "Cast your chart") { castingChart = true }
            } else if let year {
                reading(year)
            } else {
                Working(text: "Reading the year…")
            }
        }
        // BirthView dismisses itself once the chart is saved.
        .navigationDestination(isPresented: $castingChart) {
            BirthView(mode: .own)
        }
        .task(id: state.birth) { await load() }
    }

    /// The spans come from AppState; the solar return and the stations are
    /// computed here, off the main thread. A year read today for this birth
    /// stands until the day turns.
    private func load() async {
        guard let chart = state.chart else {
            year = nil
            yearFor = nil
            return
        }
        let birth = state.birth
        if let year, yearFor == birth, Calendar.current.isDate(year.now, inSameDayAs: Date()) { return }
        if yearFor != birth { year = nil }

        let now = Date()
        let natalSun = chart.longitudes[.sun]!
        let spans = await state.spans()
        let (solarReturn, stations) = await Task.detached(priority: .userInitiated) {
            (SkyEvents.solarReturn(natalSun, from: now), SkyEvents.stations(now, days: Horizons.yearDays))
        }.value
        guard !Task.isCancelled else { return }

        let yearEnd = Instant.addDays(now, Double(Horizons.yearDays))
        year = ForecastYear(
            now: now,
            solarReturn: solarReturn,
            spans: spans.filter { $0.end >= now && $0.start <= yearEnd },
            stations: stations)
        yearFor = birth
    }

    @ViewBuilder
    private func reading(_ year: ForecastYear) -> some View {
        let words = Words(state.cultureOrDefault, zone: state.zone)
        if let solarReturn = year.solarReturn {
            SectionDivider(label: "The solar return")
            Inset {
                Title(text: words.dayMonthYear(solarReturn.date))
                Prose(text: "The Sun stands again at \(Format.degree(solarReturn.degree)) \(solarReturn.sign.name), the degree it held at your birth. "
                    + "Computed, not counted from the calendar: the return drifts against the date.")
            }
        }

        SectionDivider(label: "\(year.spans.count) long transits this year")
        ForEach(year.spans) { span in
            spanRow(span, words: words)
        }

        SectionDivider(label: "The stations")
        ForEach(Array(year.stations.enumerated()), id: \.offset) { _, station in
            stationRow(station, words: words)
        }
    }

    private func spanRow(_ span: TransitSpan, words: Words) -> some View {
        let banks = state.store.banks
        let tone = TransitSpans.tone(span)
        let title = "\(words.deity(span.transitPlanet)) \(banks.aspectVerb(words.culture, span.kind)) \(words.natalPoint(span.natalKey))"
        let caption = "\(words.monthYear(span.start)) → \(words.monthYear(span.end)) · \(span.passes.count) exact"
        return LinkRow(destination: { TransitDetailView(span: span) }) {
            Title(text: title, size: 17)
            Caption(text: caption, color: tone == .ease ? Ink.harmony : Ink.conflict)
        }
    }

    private func stationRow(_ station: StationEvent, words: Words) -> some View {
        let retrograde = station.kind == .retrograde
        let caption = "\(words.dayMonthYear(station.date)) · \(words.label(station.planet)) turns " + (retrograde ? "retrograde" : "direct")
        return RowBody {
            Caption(text: caption, color: retrograde ? Ink.conflict : Ink.harmony)
            Prose(text: "\(words.deity(station.planet)) stands still at \(Format.degree(station.degree)) \(station.sign.name).")
        }
    }
}
