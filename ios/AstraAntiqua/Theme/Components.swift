import AstraCore
import SwiftUI

// The component vocabulary every screen is built from, the same pieces web
// and Android use: a nave head (mono kicker over a display headline), a
// section divider, prose, a mono caption, rows closed by a 1px rule, flat
// panels and framed text buttons.

enum Metrics {
    static let gutter: CGFloat = 20
    static let chapter: CGFloat = 32
}

/// The culture in force, for the components below.
private struct CultureKey: EnvironmentKey {
    static let defaultValue: Culture? = nil
}

extension EnvironmentValues {
    var culture: Culture? {
        get { self[CultureKey.self] }
        set { self[CultureKey.self] = newValue }
    }
}

// Every component below that reads the culture from the environment keeps
// that property private, and a private stored property makes the
// synthesized memberwise initialiser private too, out of reach of the
// screens. Those components therefore declare their initialisers.

struct Kicker: View {
    @Environment(\.culture) private var culture
    let text: String
    var color: Color? = nil
    var alignment: TextAlignment = .center

    init(text: String, color: Color? = nil, alignment: TextAlignment = .center) {
        self.text = text
        self.color = color
        self.alignment = alignment
    }

    var body: some View {
        Text(text.uppercased())
            .font(.custom(Ink.mono, size: 11))
            .tracking(1.5)
            .foregroundStyle(color ?? Ink.accent(culture))
            .multilineTextAlignment(alignment)
    }
}

struct Headline: View {
    let text: String
    var size: CGFloat = 26

    var body: some View {
        Text(text)
            .font(.custom(Ink.display, size: size))
            .foregroundStyle(Ink.bone)
            .multilineTextAlignment(.center)
    }
}

/// A mono kicker over a display headline, an optional sub line and emblem.
struct NaveHead<Emblem: View>: View {
    let kicker: String
    let headline: String
    var sub: String? = nil
    @ViewBuilder var emblem: () -> Emblem

    var body: some View {
        VStack(spacing: 8) {
            emblem()
            Kicker(text: kicker)
            Headline(text: headline)
            if let sub { Caption(text: sub, center: true) }
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, Metrics.gutter)
        .padding(.top, Metrics.chapter)
        .padding(.bottom, 16)
    }
}

extension NaveHead where Emblem == EmptyView {
    init(kicker: String, headline: String, sub: String? = nil) {
        self.init(kicker: kicker, headline: headline, sub: sub) { EmptyView() }
    }
}

struct Prose: View {
    let text: String
    var italic = false
    var color: Color = Ink.proseInk

    var body: some View {
        Text(text)
            .font(.custom(italic ? Ink.proseItalic : Ink.prose, size: 17))
            .lineSpacing(6)
            .foregroundStyle(color)
            .frame(maxWidth: .infinity, alignment: .leading)
            .fixedSize(horizontal: false, vertical: true)
    }
}

struct Caption: View {
    let text: String
    var color: Color = Ink.dim
    var center = false

    var body: some View {
        Text(text.uppercased())
            .font(.custom(Ink.mono, size: 10.5))
            .tracking(1.1)
            .foregroundStyle(color)
            .multilineTextAlignment(center ? .center : .leading)
            .frame(maxWidth: .infinity, alignment: center ? .center : .leading)
            .fixedSize(horizontal: false, vertical: true)
    }
}

struct Title: View {
    let text: String
    var size: CGFloat = 19
    var color: Color = Ink.bone

    var body: some View {
        Text(text)
            .font(.custom(Ink.display, size: size))
            .foregroundStyle(color)
            .frame(maxWidth: .infinity, alignment: .leading)
            .fixedSize(horizontal: false, vertical: true)
    }
}

/// A 1px rule.
struct Rule: View {
    var row = false
    var color: Color? = nil

    var body: some View {
        Rectangle().fill(color ?? (row ? Ink.ruleRow : Ink.rule)).frame(height: 1)
    }
}

/// A rule with a caption set into it.
struct SectionDivider: View {
    @Environment(\.culture) private var culture
    let label: String

    init(label: String) {
        self.label = label
    }

    var body: some View {
        HStack(spacing: 12) {
            Rule()
            Text(label.uppercased())
                .font(.custom(Ink.mono, size: 10.5))
                .tracking(1.1)
                .foregroundStyle(Ink.accent(culture))
                .layoutPriority(1)
            Rule()
        }
        .padding(.horizontal, Metrics.gutter)
        .padding(.top, 24)
        .padding(.bottom, 12)
    }
}

/// A flat panel with a 1px border, the only container the identity allows.
struct Panel<Content: View>: View {
    var border: Color = Ink.rule
    @ViewBuilder var content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) { content() }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .overlay(Rectangle().stroke(border, lineWidth: 1))
            .padding(.horizontal, Metrics.gutter)
            .padding(.vertical, 8)
    }
}

/// A row closed by a 1px rule.
struct RowBody<Content: View>: View {
    @ViewBuilder var content: () -> Content

    var body: some View {
        VStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 4) { content() }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, Metrics.gutter)
                .padding(.vertical, 14)
                .contentShape(Rectangle())
            Rule(row: true).padding(.horizontal, Metrics.gutter)
        }
    }
}

/// A row that opens another screen.
struct LinkRow<Destination: View, Content: View>: View {
    @ViewBuilder var destination: () -> Destination
    @ViewBuilder var content: () -> Content

    var body: some View {
        NavigationLink { destination() } label: { RowBody(content: content) }
            .buttonStyle(.plain)
    }
}

/// A plain text button in the accent: no fill, a 1px frame.
struct ActionButton: View {
    @Environment(\.culture) private var culture
    let title: String
    var destructive = false
    let action: () -> Void

    init(title: String, destructive: Bool = false, action: @escaping () -> Void) {
        self.title = title
        self.destructive = destructive
        self.action = action
    }

    var body: some View {
        let color = destructive ? Ink.conflict : Ink.accent(culture)
        Button(action: action) {
            Text(title.uppercased())
                .font(.custom(Ink.monoStrong, size: 12))
                .tracking(1.4)
                .foregroundStyle(color)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .overlay(Rectangle().stroke(color, lineWidth: 1))
        }
        .buttonStyle(.plain)
        .padding(.horizontal, Metrics.gutter)
        .padding(.vertical, 8)
    }
}

/// A placeholder while the sky is computed off the main thread.
struct Working: View {
    @Environment(\.culture) private var culture
    let text: String

    init(text: String) {
        self.text = text
    }

    var body: some View {
        VStack(spacing: 12) {
            ProgressView().tint(Ink.accent(culture))
            Caption(text: text, center: true)
        }
        .padding(.horizontal, Metrics.gutter)
        .padding(.vertical, Metrics.chapter)
    }
}

/// The panel a failed reading shows in its place.
struct Failure: View {
    let message: String

    var body: some View {
        Panel(border: Ink.conflict) {
            Caption(text: "This could not be read", color: Ink.conflict)
            Prose(text: message, color: Ink.dim)
        }
    }
}

/// Every screen sits on its culture's ground, in one scrolling column, with
/// room at the end for the tab bar that floats over content from iOS 26.
struct Page<Content: View>: View {
    @Environment(\.culture) private var culture
    let title: String
    @ViewBuilder var content: () -> Content

    init(title: String, @ViewBuilder content: @escaping () -> Content) {
        self.title = title
        self.content = content
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                content()
                Color.clear.frame(height: Metrics.chapter + 24)
            }
        }
        .background(Ink.ground(culture).ignoresSafeArea())
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Ink.ground(culture), for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }
}

/// Inset prose or captions to the page gutter.
struct Inset<Content: View>: View {
    @ViewBuilder var content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 4) { content() }
            .padding(.horizontal, Metrics.gutter)
            .padding(.vertical, 4)
    }
}

/// A body's symbol character (☉ ☽ ☿ …) in the symbols face.
struct Symbol: View {
    @Environment(\.culture) private var culture
    let glyph: String
    var size: CGFloat = 18
    var color: Color? = nil

    init(glyph: String, size: CGFloat = 18, color: Color? = nil) {
        self.glyph = glyph
        self.size = size
        self.color = color
    }

    var body: some View {
        Text(glyph).font(.custom(Ink.symbols, size: size)).foregroundStyle(color ?? Ink.accent(culture))
    }
}
