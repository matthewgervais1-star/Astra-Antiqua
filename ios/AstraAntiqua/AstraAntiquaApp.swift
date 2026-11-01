import AstraCore
import SwiftUI

/// The app. SwiftUI's App lifecycle runs on UIScene, which iOS requires of
/// apps built with the iOS 27 SDK. It opens on the five doorways the first
/// time and on the day once a culture or a birth is on the device.
@main
struct AstraAntiquaApp: App {
    @State private var state = AppState.shared

    init() {
        // Touch the corpus at launch: a hole in shared/content stops the app
        // here with every missing cell named, not later on some screen.
        _ = Content.store
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(state)
                .environment(\.culture, state.culture)
                .preferredColorScheme(.dark)
                .tint(Ink.accent(state.culture))
        }
    }
}

struct RootView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        if let screen = ScreenshotMode.requested, let view = ScreenshotMode.fullScreen(for: screen) {
            view
        } else if state.birth == nil && state.culture == nil {
            NavigationStack { CultureView(onboarding: true) }
        } else {
            MainTabs()
        }
    }
}

/// The four sections on the glass tab bar (P17): SKY, TRANSITS, CHART,
/// MORE. SKY holds the four horizons on the horizon control (P2): DAY and
/// WEEK are Sky Day and Sky Week on the glass chrome; SEASON and YEAR show
/// the horizon screens that predate the glass until their steps (Phase B,
/// steps 4 and 5), under the glass horizon control. TRANSITS, CHART and
/// MORE show their existing screens under the glass tab bar until theirs.
/// The old Today and Horizons tabs live on in SKY; the old Today page is
/// linked from More.
struct MainTabs: View {
    @Environment(AppState.self) private var state
    @State private var section: ChromeSection
    @State private var horizon: SkyHorizon
    @State private var showCultures = false

    init() {
        let start = ScreenshotMode.requested.map(ScreenshotMode.place(for:)) ?? (section: ChromeSection.sky, horizon: SkyHorizon.day)
        _section = State(initialValue: start.section)
        _horizon = State(initialValue: start.horizon)
    }

    var body: some View {
        Group {
            if section == .sky && horizon == .day && !legacyScreenRequested {
                SkyDayView(onSection: { section = $0 }, onHorizon: { horizon = $0 }, onMenu: { showCultures = true })
            } else if section == .sky && horizon == .week && !legacyScreenRequested {
                SkyWeekView(onSection: { section = $0 }, onHorizon: { horizon = $0 }, onMenu: { showCultures = true })
            } else {
                LegacySection(
                    section: section,
                    horizon: section == .sky ? horizon : nil,
                    onSection: { section = $0; if $0 == .sky { horizon = .day } },
                    onHorizon: { horizon = $0 }
                ) {
                    legacyScreen
                }
                .id("\(section.rawValue)-\(horizon.rawValue)")
            }
        }
        .sheet(isPresented: $showCultures) {
            NavigationStack { CultureView(onboarding: false) }
                .environment(state)
        }
    }

    /// A screenshot run that names a screen the glass does not draw yet.
    private var legacyScreenRequested: Bool {
        guard let screen = ScreenshotMode.requested else { return false }
        return ScreenshotMode.view(for: screen) != nil
    }

    @ViewBuilder
    private var legacyScreen: some View {
        if let screen = ScreenshotMode.requested, let view = ScreenshotMode.view(for: screen),
           ScreenshotMode.place(for: screen).section == section,
           ScreenshotMode.place(for: screen).horizon == (section == .sky ? horizon : SkyHorizon.day) {
            view
        } else {
            switch section {
            case .sky:
                switch horizon {
                case .day: DayView()
                case .week: HorizonsView(initial: .week, showsSwitcher: false)
                case .season: HorizonsView(initial: .season, showsSwitcher: false)
                case .year: HorizonsView(initial: .year, showsSwitcher: false)
                }
            case .transits: TransitsView()
            case .chart: PlacementsView()
            case .more: MoreView()
            }
        }
    }
}

/// A section whose glass screen is not built yet: its existing screen in a
/// navigation stack, the glass horizon control above it on the Sky horizons,
/// and the glass tab bar floating over its foot.
struct LegacySection<Screen: View>: View {
    let section: ChromeSection
    var horizon: SkyHorizon?
    var onSection: (ChromeSection) -> Void
    var onHorizon: (SkyHorizon) -> Void
    @ViewBuilder var screen: () -> Screen
    @Environment(AppState.self) private var state

    var body: some View {
        NavigationStack { screen() }
            .safeAreaInset(edge: .top, spacing: 0) {
                if let horizon {
                    HorizonControl(selection: horizon, onSelect: onHorizon)
                        .padding(.horizontal, Chrome.inset)
                        .padding(.vertical, 8)
                        .background(Ink.ground(state.culture).ignoresSafeArea(edges: .top))
                }
            }
            .safeAreaInset(edge: .bottom, spacing: 0) {
                GlassTabBar(selection: section, onSelect: onSection)
                    .padding(.horizontal, Chrome.inset)
                    .padding(.bottom, Chrome.homeGap)
            }
    }
}
