import AstraCore
import SwiftUI

/// Every long-transit span: the five slow bodies against the Sun, the Moon
/// and the rising degree, from a year back to roughly two years ahead.
/// Port of TransitsPage.cs.
struct TransitsView: View {
    @Environment(AppState.self) private var state
    @State private var spans: [TransitSpan]?
    @State private var spansFor: SavedBirth?
    @State private var now = Date()
    @State private var castingChart = false

    init() {}

    var body: some View {
        Page(title: "Transits") {
            NaveHead(kicker: "Read against your own sky", headline: "The long transits")
            if state.chart == nil {
                Panel {
                    Prose(text: "A long transit is scored against your own sky, the chart cast once at the hour of your birth and kept. There is no chart on this device.")
                }
                ActionButton(title: "Cast your chart") { castingChart = true }
            } else if let spans {
                groups(spans)
            } else {
                Working(text: "Computing the sky…")
            }
        }
        // BirthView dismisses itself once the chart is saved.
        .navigationDestination(isPresented: $castingChart) {
            BirthView(mode: .own)
        }
        .task(id: state.birth) { await load() }
    }

    /// The spans come from AppState, which computes them off the main thread
    /// and holds them for the day.
    private func load() async {
        guard state.chart != nil else {
            spans = nil
            spansFor = nil
            return
        }
        let birth = state.birth
        if spansFor != birth { spans = nil }
        let loaded = await state.spans()
        guard !Task.isCancelled else { return }
        now = Date()
        spans = loaded
        spansFor = birth
    }

    @ViewBuilder
    private func groups(_ spans: [TransitSpan]) -> some View {
        let words = Words(state.cultureOrDefault, zone: state.zone)
        group("Open now", spans.filter { $0.start <= now && $0.end >= now }, words: words)
        group("Ahead", spans.filter { $0.start > now }, words: words)
        group("Behind", behind(spans), words: words)
        Panel {
            Caption(text: "A span holds while the slow body stays within \(String(format: "%.0f", TransitSpans.spanOrb))° of exact. "
                + "A slow body crosses a degree three times where it retrogrades; those passes belong to one transit.")
        }
    }

    /// The spans already closed, the most recent first. Equal end dates keep
    /// their order, as the C#'s OrderByDescending does.
    private func behind(_ spans: [TransitSpan]) -> [TransitSpan] {
        spans.enumerated()
            .filter { $0.element.end < now }
            .sorted { lhs, rhs in
                if lhs.element.end != rhs.element.end { return lhs.element.end > rhs.element.end }
                return lhs.offset < rhs.offset
            }
            .map { $0.element }
    }

    @ViewBuilder
    private func group(_ label: String, _ spans: [TransitSpan], words: Words) -> some View {
        if !spans.isEmpty {
            SectionDivider(label: label)
            ForEach(spans) { span in
                row(span, words: words)
            }
        }
    }

    private func row(_ span: TransitSpan, words: Words) -> some View {
        let banks = state.store.banks
        let tone = TransitSpans.tone(span)
        let ahead = span.passes.filter { $0 > now }.count
        let title = "\(words.deity(span.transitPlanet)) \(banks.aspectVerb(words.culture, span.kind)) \(words.natalPoint(span.natalKey))"
        let caption = "\(words.monthYear(span.start)) → \(words.monthYear(span.end)) · \(span.passes.count) exact · \(ahead) ahead · "
            + (tone == .ease ? "ease" : "tension")
        return LinkRow(destination: { TransitDetailView(span: span) }) {
            Title(text: title, size: 17)
            Caption(text: caption, color: tone == .ease ? Ink.harmony : Ink.conflict)
        }
    }
}

/// One long transit: what meets what, from when to when, and every exact pass.
/// Port of TransitDetailPage in TransitsPage.cs.
struct TransitDetailView: View {
    @Environment(AppState.self) private var state
    @Environment(\.culture) private var culture
    @State private var now = Date()
    let span: TransitSpan

    init(span: TransitSpan) {
        self.span = span
    }

    var body: some View {
        let words = Words(state.cultureOrDefault, zone: state.zone)
        let deity = state.store.deity(words.culture, span.transitPlanet)
        let natal = words.natalPoint(span.natalKey)
        let verb = state.store.banks.aspectVerb(words.culture, span.kind)
        let accent = Ink.accent(culture)
        Page(title: "A long transit") {
            NaveHead(kicker: "\(words.cultureLabel) · a long transit", headline: "\(deity.name) \(verb) \(natal)") {
                GlyphView(culture: words.culture, planet: span.transitPlanet, size: 44, tint: accent)
            }

            TransitSpanProgress(fraction: progress, tint: accent)

            SectionDivider(label: "What is meeting what")
            Inset {
                Prose(text: "\(deity.name), \(deity.epithet), holds within \(String(format: "%.0f", TransitSpans.spanOrb)) degrees of exact against \(natal) "
                    + "from \(words.monthYear(span.start)) to \(words.monthYear(span.end)). Nothing here is forecast: the dates are the ephemeris read forward.")
            }

            SectionDivider(label: "The exact passes")
            ForEach(Array(span.passes.enumerated()), id: \.offset) { _, pass in
                passRow(pass, words: words, accent: accent)
            }

            Inset {
                Caption(text: "At first pass: \(span.transitSign.name) \(Format.degree(span.transitDegree))")
            }
        }
        .onAppear { now = Date() }
    }

    /// Where today sits inside the stretch, from 0 at its start to 1 at its end.
    private var progress: Double {
        let total = span.end.timeIntervalSince(span.start)
        guard total > 0 else { return 1 }
        return max(0, min(1, now.timeIntervalSince(span.start) / total))
    }

    private func passRow(_ pass: Date, words: Words, accent: Color) -> some View {
        let passed = pass <= now
        return RowBody {
            HStack(alignment: .firstTextBaseline, spacing: 12) {
                Title(text: words.dayMonthYear(pass), size: 17)
                Caption(text: passed ? "Passed" : "Ahead", color: passed ? Ink.dim : accent)
                    .fixedSize(horizontal: true, vertical: false)
            }
        }
    }
}

/// Where today sits inside the stretch, as a rule in the accent up to a
/// square marker and the plain rule after it.
private struct TransitSpanProgress: View {
    let fraction: Double
    let tint: Color

    var body: some View {
        GeometryReader { proxy in
            let marker: CGFloat = 8
            let reach = max(0, proxy.size.width - marker) * CGFloat(fraction)
            HStack(spacing: 0) {
                Rule(color: tint).frame(width: reach)
                Rectangle().fill(tint).frame(width: marker, height: marker)
                Rule()
            }
            .frame(width: proxy.size.width, height: proxy.size.height)
        }
        .frame(height: 10)
        .padding(.horizontal, Metrics.gutter)
        .padding(.vertical, 8)
    }
}
