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
