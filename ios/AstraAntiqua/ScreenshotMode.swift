import AstraCore
import SwiftUI

/// Opens one named screen at launch, for the CI run that boots an iOS
/// simulator and photographs every screen (.github/workflows/swift.yml). The
/// simulator passes ASTRA_SCREEN through
/// `SIMCTL_CHILD_ASTRA_SCREEN=… xcrun simctl launch`. Nothing on a phone can
/// set it, so outside that run this does nothing.
enum ScreenshotMode {
    static var requested: String? {
        let value = ProcessInfo.processInfo.environment["ASTRA_SCREEN"] ?? ""
        return value.isEmpty ? nil : value
    }

    /// A screen drawn over the whole window, in place of the tabs: the
    /// glass chrome's captures (Phase B, step 1). They draw Egypt, the
    /// ground the canvas's spec boards use, and need no birth record.
    @MainActor
    static func fullScreen(for screen: String) -> AnyView? {
        switch screen {
        case "chrome": return AnyView(ChromeCapture(variant: .rest))
        case "chrome-scrolled": return AnyView(ChromeCapture(variant: .scrolled))
        case "chrome-approx": return AnyView(ChromeCapture(variant: .scrolled).environment(\.systemGlass, false))
        case "chrome-pressed": return AnyView(ChromeCapture(variant: .rest).environment(\.pressedPreview, ["P163.transits", "P164", "P166.week"]))
        case "chrome-pushed": return AnyView(ChromeCapture(variant: .pushed))
        case "chrome-pushed-pressed": return AnyView(ChromeCapture(variant: .pushed).environment(\.pressedPreview, ["P165"]))
        default: return nil
        }
    }

    /// The screen a name opens in place of the day, or nil for the day itself.
    @MainActor
    static func view(for screen: String) -> AnyView? {
        switch screen {
        case "week": return AnyView(HorizonsView(initial: .week))
        case "season": return AnyView(HorizonsView(initial: .season))
        case "year": return AnyView(HorizonsView(initial: .year))
        case "transits": return AnyView(TransitsView())
        case "chart": return AnyView(PlacementsView())
        case "placement-sun": return AnyView(PlacementView(planet: .sun))
        case "voices": return AnyView(VoicesView())
        case "voice-egypt": return AnyView(VoiceView(culture: .egypt))
        case "voice-canaan": return AnyView(VoiceView(culture: .canaan))
        case "voice-carthage": return AnyView(VoiceView(culture: .carthage))
        case "matrix": return AnyView(MatrixView())
        case "method": return AnyView(MethodView())
        case "learn": return AnyView(LearnView())
        case "learn-aspects":
            guard let section = Content.store.learn.sections.first(where: { $0.table == "ASPECTS" }) else { return nil }
            return AnyView(LearnSectionView(section: section))
        case "forecast": return AnyView(ForecastView())
        case "synastry": return AnyView(SynastryView())
        case "more": return AnyView(MoreView())
        default: return nil
        }
    }
}

/// The glass chrome on its own, for CI to photograph at 390x844 and to
/// measure against ios/placement/chrome.json. `scrolled` runs a test pattern
/// under the glass in place of content: 1px rules and bars of bone at 30% and
/// 50%, the backdrops the canvas's contrast table (Round 1) checks the dim
/// labels against. It carries no copy.
struct ChromeCapture: View {
    enum Variant { case rest, scrolled, pushed }
    let variant: Variant

    var body: some View {
        GlassScreen(
            culture: .egypt,
            section: variant == .pushed ? .chart : .sky,
            horizon: variant == .pushed ? nil : .day,
            back: variant == .pushed ? "CHART" : nil,
            scrolled: variant == .scrolled ? Chrome.chromeBottom(top: Chrome.safeTop, horizon: true) + Chrome.contentGap : 0
        ) {
            if variant == .scrolled {
                ForEach(0..<48, id: \.self) { row in
                    VStack(alignment: .leading, spacing: 6) {
                        Rectangle().fill(Ink.bone.opacity(0.5)).frame(width: row % 3 == 0 ? 300 : 342, height: 12)
                        Rectangle().fill(Ink.bone.opacity(0.3)).frame(width: row % 2 == 0 ? 260 : 330, height: 10)
                        Rectangle().fill(Ink.ruleRow).frame(height: 1)
                    }
                    .padding(.horizontal, Chrome.contentSide)
                    .padding(.vertical, 6)
                }
            }
        }
    }
}
