import AstraCore
import SwiftUI

/// Draws a deity glyph from shared/content/glyphs.json: the designer's own
/// paths on the 24-unit grid they were drawn on, each with its own stroke
/// width, cap and join, scaled as a whole so the strokes scale with it.
struct GlyphView: View {
    let culture: Culture
    let planet: Planet
    var size: CGFloat = 32
    var tint: Color = Ink.bone

    var body: some View {
        let glyph = Content.store.glyph(culture, planet)
        Canvas { context, canvasSize in
            let scale = min(canvasSize.width, canvasSize.height) / 24
            context.scaleBy(x: scale, y: scale)
            for spec in glyph.paths {
                let path = SVGPath.parse(spec.data)
                if spec.fill {
                    context.fill(path, with: .color(tint))
                }
                if spec.stroke {
                    context.stroke(path, with: .color(tint), style: StrokeStyle(
                        lineWidth: spec.strokeWidth,
                        lineCap: spec.lineCap == "round" ? .round : spec.lineCap == "square" ? .square : .butt,
                        lineJoin: spec.lineJoin == "round" ? .round : spec.lineJoin == "bevel" ? .bevel : .miter))
                }
            }
        }
        .frame(width: size, height: size)
        .accessibilityLabel(Text("\(glyph.deity), glyph \(glyph.status.rawValue)"))
    }
}

/// SVG path data to a SwiftUI Path. Handles every command (M L H V C S Q T A
/// Z, absolute and relative), implicit repeats, and elliptical arcs, which it
/// converts to cubic Béziers per the SVG implementation notes (F.6).
enum SVGPath {
    static func parse(_ d: String) -> Path {
        var path = Path()
        var scanner = Tokens(d)
        var current = CGPoint.zero
        var start = CGPoint.zero
        var lastControl: CGPoint? = nil
        var lastCommand: Character = " "
        var command: Character = " "

        while let next = scanner.nextCommandOrNil(previous: command) {
            command = next
            let relative = command.isLowercase
            func point(_ x: Double, _ y: Double) -> CGPoint {
                relative ? CGPoint(x: current.x + CGFloat(x), y: current.y + CGFloat(y)) : CGPoint(x: x, y: y)
            }
            switch command.lowercased().first! {
            case "m":
                guard let x = scanner.number(), let y = scanner.number() else { return path }
                current = point(x, y); start = current
                path.move(to: current)
                lastControl = nil
                // Further pairs after a move are line-tos.
                command = relative ? "l" : "L"
            case "l":
                guard let x = scanner.number(), let y = scanner.number() else { return path }
                current = point(x, y); path.addLine(to: current); lastControl = nil
            case "h":
                guard let x = scanner.number() else { return path }
                current = CGPoint(x: relative ? current.x + CGFloat(x) : CGFloat(x), y: current.y); path.addLine(to: current); lastControl = nil
            case "v":
                guard let y = scanner.number() else { return path }
                current = CGPoint(x: current.x, y: relative ? current.y + CGFloat(y) : CGFloat(y)); path.addLine(to: current); lastControl = nil
            case "c":
                guard let x1 = scanner.number(), let y1 = scanner.number(), let x2 = scanner.number(),
                      let y2 = scanner.number(), let x = scanner.number(), let y = scanner.number() else { return path }
                let c1 = point(x1, y1), c2 = point(x2, y2), end = point(x, y)
                path.addCurve(to: end, control1: c1, control2: c2)
                lastControl = c2; current = end
            case "s":
                guard let x2 = scanner.number(), let y2 = scanner.number(), let x = scanner.number(), let y = scanner.number() else { return path }
                let c1 = ("cCsS".contains(lastCommand) ? lastControl.map { reflect($0, about: current) } : nil) ?? current
                let c2 = point(x2, y2), end = point(x, y)
                path.addCurve(to: end, control1: c1, control2: c2)
                lastControl = c2; current = end
            case "q":
                guard let x1 = scanner.number(), let y1 = scanner.number(), let x = scanner.number(), let y = scanner.number() else { return path }
                let c = point(x1, y1), end = point(x, y)
                path.addQuadCurve(to: end, control: c)
                lastControl = c; current = end
            case "t":
                guard let x = scanner.number(), let y = scanner.number() else { return path }
                let c = ("qQtT".contains(lastCommand) ? lastControl.map { reflect($0, about: current) } : nil) ?? current
                let end = point(x, y)
                path.addQuadCurve(to: end, control: c)
                lastControl = c; current = end
            case "a":
                guard let rx = scanner.number(), let ry = scanner.number(), let rotation = scanner.number(),
                      let large = scanner.flag(), let sweep = scanner.flag(),
                      let x = scanner.number(), let y = scanner.number() else { return path }
                let end = point(x, y)
                addArc(&path, from: current, to: end, rx: rx, ry: ry, rotationDegrees: rotation, largeArc: large, sweep: sweep)
                current = end; lastControl = nil
            case "z":
                path.closeSubpath(); current = start; lastControl = nil
            default:
                return path
            }
            lastCommand = command
        }
        return path
    }

    private static func reflect(_ p: CGPoint, about c: CGPoint) -> CGPoint { CGPoint(x: 2 * c.x - p.x, y: 2 * c.y - p.y) }

    /// Endpoint-parameterised elliptical arc to cubic Béziers (SVG 1.1 F.6.5, F.6.6).
    private static func addArc(_ path: inout Path, from p0: CGPoint, to p1: CGPoint, rx rxIn: Double, ry ryIn: Double,
                               rotationDegrees: Double, largeArc: Bool, sweep: Bool) {
        if p0 == p1 { return }
        var rx = abs(rxIn), ry = abs(ryIn)
        if rx == 0 || ry == 0 { path.addLine(to: p1); return }
        // All the arithmetic in Double: mixing CGFloat into these long
        // expressions leans on implicit conversions the type checker can
        // take too long to settle.
        let x0 = Double(p0.x), y0 = Double(p0.y)
        let x1 = Double(p1.x), y1 = Double(p1.y)
        let phi = rotationDegrees * .pi / 180
        let cosPhi = cos(phi), sinPhi = sin(phi)
        let dx = (x0 - x1) / 2, dy = (y0 - y1) / 2
        let x1p = cosPhi * dx + sinPhi * dy
        let y1p = -sinPhi * dx + cosPhi * dy
        let lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry)
        if lambda > 1 { rx *= sqrt(lambda); ry *= sqrt(lambda) }
        let num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p
        let den = rx * rx * y1p * y1p + ry * ry * x1p * x1p
        var coef = den == 0 ? 0 : sqrt(max(0, num / den))
        if largeArc == sweep { coef = -coef }
        let cxp = coef * rx * y1p / ry
        let cyp = -coef * ry * x1p / rx
        let cx = cosPhi * cxp - sinPhi * cyp + (x0 + x1) / 2
        let cy = sinPhi * cxp + cosPhi * cyp + (y0 + y1) / 2

        func angle(_ ux: Double, _ uy: Double, _ vx: Double, _ vy: Double) -> Double {
            let a = atan2(ux * vy - uy * vx, ux * vx + uy * vy)
            return a
        }
        let theta1 = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
        var delta = angle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
        if !sweep && delta > 0 { delta -= 2 * .pi }
        if sweep && delta < 0 { delta += 2 * .pi }

        let segments = max(1, Int(ceil(abs(delta) / (.pi / 2))))
        let step = delta / Double(segments)
        let t = 4.0 / 3.0 * tan(step / 4)
        var theta = theta1
        for _ in 0..<segments {
            let cos1 = cos(theta), sin1 = sin(theta)
            let theta2 = theta + step
            let cos2 = cos(theta2), sin2 = sin(theta2)
            func map(_ x: Double, _ y: Double) -> CGPoint {
                CGPoint(x: cx + rx * cosPhi * x - ry * sinPhi * y, y: cy + rx * sinPhi * x + ry * cosPhi * y)
            }
            let c1 = map(cos1 - t * sin1, sin1 + t * cos1)
            let c2 = map(cos2 + t * sin2, sin2 - t * cos2)
            let e = map(cos2, sin2)
            path.addCurve(to: e, control1: c1, control2: c2)
            theta = theta2
        }
    }

    /// A tokenizer over SVG path data: command letters, numbers (including
    /// "1.5.5" and "-.5"), and single-character arc flags.
    private struct Tokens {
        private let chars: [Character]
        private var i = 0

        init(_ s: String) { chars = Array(s) }

        private mutating func skip() {
            while i < chars.count, chars[i] == " " || chars[i] == "," || chars[i].isNewline || chars[i] == "\t" { i += 1 }
        }

        /// The next command letter, or the previous command again when the
        /// data continues with numbers (an implicit repeat); nil at the end.
        mutating func nextCommandOrNil(previous: Character) -> Character? {
            skip()
            guard i < chars.count else { return nil }
            if chars[i].isLetter {
                let c = chars[i]; i += 1
                return c
            }
            // Numbers straight after a close path have no command to repeat:
            // stop there, or the Z case would loop without consuming them.
            if previous == " " || previous == "z" || previous == "Z" { return nil }
            return previous
        }

        mutating func number() -> Double? {
            skip()
            var j = i
            if j < chars.count, chars[j] == "+" || chars[j] == "-" { j += 1 }
            var sawDot = false, sawDigit = false
            while j < chars.count {
                let c = chars[j]
                if c.isNumber { sawDigit = true; j += 1 }
                else if c == "." && !sawDot { sawDot = true; j += 1 }
                else { break }
            }
            if j < chars.count, chars[j] == "e" || chars[j] == "E" {
                var k = j + 1
                if k < chars.count, chars[k] == "+" || chars[k] == "-" { k += 1 }
                if k < chars.count, chars[k].isNumber {
                    while k < chars.count, chars[k].isNumber { k += 1 }
                    j = k
                }
            }
            guard sawDigit, let value = Double(String(chars[i..<j])) else { return nil }
            i = j
            return value
        }

        mutating func flag() -> Bool? {
            skip()
            guard i < chars.count, chars[i] == "0" || chars[i] == "1" else { return nil }
            defer { i += 1 }
            return chars[i] == "1"
        }
    }
}
