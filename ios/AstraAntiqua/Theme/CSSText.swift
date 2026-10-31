import CoreText
import SwiftUI
import UIKit

// Text set the way the canvas boards set it: every line in a box exactly
// `lineHeight` tall (CSS line-height), the glyphs centred in it (CSS
// half-leading), lines broken at the column's width. SwiftUI's own Text takes
// its line height from the font (Spectral 1.522 em, IBM Plex Mono 1.3 em) and
// cannot set a line box smaller than that, which the boards' headlines (1.35)
// and labels (1.0) need. Here CoreText finds the line breaks and each line
// is drawn on its own in a Canvas, so the heights match the boards' markup.

/// One CSS text style: face, size, line height and letter spacing in points.
struct CSSTextStyle: Hashable {
    var font: String
    var size: CGFloat
    var lineHeight: CGFloat
    var tracking: CGFloat = 0
    var color: Color = Ink.bone
    var center = false

    /// The style at a Dynamic Type scale (1 at the default size, where the
    /// numbers are the board's).
    func scaled(_ scale: CGFloat) -> CSSTextStyle {
        var s = self
        s.size *= scale
        s.lineHeight *= scale
        s.tracking *= scale
        return s
    }

    /// The width of the widest paragraph set on one line, for a proposal
    /// with no width limit.
    func naturalWidth(_ text: String) -> CGFloat {
        let uiFont = UIFont(name: font, size: size) ?? UIFont.systemFont(ofSize: size)
        return text.components(separatedBy: "\n").map { paragraph -> CGFloat in
            let attributed = NSAttributedString(string: paragraph, attributes: [.font: uiFont, .tracking: tracking])
            return CGFloat(CTLineGetTypographicBounds(CTLineCreateWithAttributedString(attributed), nil, nil, nil))
        }.max() ?? 0
    }

    /// The lines `text` breaks into at `width`. An explicit newline always breaks.
    func lines(_ text: String, width: CGFloat) -> [String] {
        guard width > 0 else { return [text] }
        let uiFont = UIFont(name: font, size: size) ?? UIFont.systemFont(ofSize: size)
        var out: [String] = []
        for paragraph in text.components(separatedBy: "\n") {
            if paragraph.isEmpty {
                out.append("")
                continue
            }
            let attributed = NSAttributedString(string: paragraph, attributes: [.font: uiFont, .tracking: tracking])
            let typesetter = CTTypesetterCreateWithAttributedString(attributed)
            let utf16 = paragraph.utf16
            var start = 0
            while start < utf16.count {
                var count = CTTypesetterSuggestLineBreak(typesetter, start, Double(width))
                if count <= 0 { count = utf16.count - start }
                let from = utf16.index(utf16.startIndex, offsetBy: start)
                let to = utf16.index(from, offsetBy: count)
                let line = String(paragraph[from..<to])
                out.append(line.trimmingCharacters(in: .whitespaces))
                start += count
            }
        }
        return out
    }
}

/// A block of text in CSS line boxes. `accent` colours a trailing word (the
/// chart rows' TENSION) where a line ends with it.
struct CSSText: View {
    let text: String
    let style: CSSTextStyle
    var accent: (suffix: String, color: Color)? = nil
    var isHeader = false
    @ScaledMetric(relativeTo: .body) private var scale: CGFloat = 1

    init(_ text: String, style: CSSTextStyle, accent: (suffix: String, color: Color)? = nil, isHeader: Bool = false) {
        self.text = text
        self.style = style
        self.accent = accent
        self.isHeader = isHeader
    }

    var body: some View {
        let style = style.scaled(scale)
        let accent = accent
        let text = text
        CSSLinesLayout(text: text, style: style) {
            Canvas { context, size in
                for (i, line) in style.lines(text, width: size.width).enumerated() {
                    var drawn = Text(line)
                    if let accent, !accent.suffix.isEmpty, line.hasSuffix(accent.suffix) {
                        let head = Text(String(line.dropLast(accent.suffix.count)))
                        let tail = Text(accent.suffix).foregroundStyle(accent.color)
                        drawn = Text("\(head)\(tail)")
                    }
                    let resolved = context.resolve(
                        drawn
                            .font(.custom(style.font, fixedSize: style.size))
                            .tracking(style.tracking)
                            .foregroundStyle(style.color))
                    let measured = resolved.measure(in: CGSize(width: CGFloat.infinity, height: CGFloat.infinity))
                    let x = style.center ? (size.width - measured.width) / 2 : 0
                    let y = CGFloat(i) * style.lineHeight + (style.lineHeight - measured.height) / 2
                    context.draw(resolved, at: CGPoint(x: x, y: y), anchor: .topLeading)
                }
            }
        }
        .accessibilityElement()
        .accessibilityLabel(text)
        .accessibilityAddTraits(isHeader ? .isHeader : [])
    }
}

/// Sizes its one subview (the Canvas) to the proposed width and the height of
/// the text's lines at that width.
private struct CSSLinesLayout: Layout {
    let text: String
    let style: CSSTextStyle

    private func height(_ width: CGFloat) -> CGFloat {
        CGFloat(style.lines(text, width: width).count) * style.lineHeight
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        // An ideal-size query proposes no width; the board column is 342.
        let proposed = proposal.width ?? 342
        let width = proposed.isFinite ? proposed : ceil(style.naturalWidth(text))
        return CGSize(width: width, height: height(width))
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        for view in subviews {
            view.place(at: bounds.origin, proposal: ProposedViewSize(width: bounds.width, height: bounds.height))
        }
    }
}

/// A one-line label in a box `height` tall (the boards' line-height: 1
/// labels are 11 tall though the face's own line is 14.3).
struct BoxLabel: View {
    let text: String
    var font: String = Ink.mono
    var size: CGFloat = 11
    var height: CGFloat
    var tracking: CGFloat = 0
    var color: Color = Ink.dim

    var body: some View {
        Text(text)
            .font(.custom(font, fixedSize: size))
            .tracking(tracking)
            .foregroundStyle(color)
            .lineLimit(1)
            .fixedSize()
            .frame(height: height)
    }
}
