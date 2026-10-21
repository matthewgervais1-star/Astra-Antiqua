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
        if state.birth == nil && state.culture == nil {
            NavigationStack { CultureView(onboarding: true) }
        } else {
            MainTabs()
        }
    }
}

/// The five tabs: today, the longer horizons, the long transits, the chart,
/// and everything else.
struct MainTabs: View {
    @Environment(AppState.self) private var state

    var body: some View {
        TabView {
            NavigationStack {
                if let screen = ScreenshotMode.requested, let view = ScreenshotMode.view(for: screen) {
                    view
                } else {
                    DayView()
                }
            }
            .tabItem { Label("Today", systemImage: "sun.max") }

            NavigationStack { HorizonsView() }
                .tabItem { Label("Horizons", systemImage: "moon.stars") }

            NavigationStack { TransitsView() }
                .tabItem { Label("Transits", systemImage: "hourglass") }

            NavigationStack { PlacementsView() }
                .tabItem { Label("Chart", systemImage: "circle.grid.cross") }

            NavigationStack { MoreView() }
                .tabItem { Label("More", systemImage: "ellipsis.circle") }
        }
        .toolbarBackground(Ink.ground(state.culture), for: .tabBar)
    }
}
