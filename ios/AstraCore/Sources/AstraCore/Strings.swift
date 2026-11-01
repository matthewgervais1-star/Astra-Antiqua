import Foundation

/// The shared strings catalog (shared/strings/en.json), generated from web's
/// web/src/strings by `pnpm export:strings`. A key is `<screen>.<slot>`; a
/// value is one string, or one string per culture. `{name}` marks a fill.
///
/// The catalog stores the case the reader sees, so no caller transforms a
/// string it reads here. A key the catalog lacks prints as the key itself,
/// and `ScreenGoldenTests` fails on it, so a gap shows on screen and in the
/// tests instead of printing an empty slot.
public final class Strings: @unchecked Sendable {
    private enum Value {
        case plain(String)
        case perCulture([Culture: String])
    }

    private let values: [String: Value]

    /// Every key in the catalog.
    public var keys: [String] { values.keys.sorted() }

    /// True when the catalog holds the key.
    public func has(_ key: String) -> Bool { values[key] != nil }

    /// True when the key carries one string per culture.
    public func isPerCulture(_ key: String) -> Bool {
        if case .perCulture = values[key] { return true }
        return false
    }

    /// The string for a key, in the culture's form where the key has one.
    /// A missing key returns the key.
    public func text(_ key: String, _ culture: Culture? = nil) -> String {
        switch values[key] {
        case let .plain(s): return s
        case let .perCulture(map):
            guard let culture else { return key }
            return map[culture] ?? key
        case nil: return key
        }
    }

    /// The string for a key with its `{name}` slots filled. A slot with no
    /// value stays as written, as web's fill leaves it.
    public func fill(_ key: String, _ culture: Culture? = nil, _ slots: [String: String] = [:]) -> String {
        Strings.fill(text(key, culture), slots)
    }

    /// Replaces each `{name}` in a template whose name is in `slots`.
    public static func fill(_ template: String, _ slots: [String: String]) -> String {
        guard !slots.isEmpty else { return template }
        var out = ""
        var rest = Substring(template)
        while let open = rest.firstIndex(of: "{") {
            out += rest[..<open]
            let afterOpen = rest.index(after: open)
            guard let close = rest[afterOpen...].firstIndex(of: "}") else {
                out += rest[open...]
                return out
            }
            let name = String(rest[afterOpen..<close])
            if let value = slots[name] {
                out += value
            } else {
                out += rest[open...close]
            }
            rest = rest[rest.index(after: close)...]
        }
        out += rest
        return out
    }

    /// The catalog key of a Moon phase or quarter name as the ephemeris port
    /// names it (web's moonPhaseKey): "Full Moon" is "common.moon.fullMoon".
    public static func moonPhaseKey(_ name: String) -> String {
        let words = name.split(separator: " ").map(String.init)
        guard let first = words.first else { return "common.moon." }
        let camel = first.prefix(1).lowercased() + first.dropFirst()
            + words.dropFirst().map { $0.prefix(1).uppercased() + $0.dropFirst() }.joined()
        return "common.moon.\(camel)"
    }

    /// Loads en.json from a directory holding the shared/strings files.
    /// Every per-culture value must carry all five cultures; the load names
    /// each missing cell.
    public init(directory: URL) throws {
        let name = "en.json"
        let url = directory.appendingPathComponent(name)
        guard let data = try? Data(contentsOf: url) else { throw ContentError.missingFile("strings/\(name)") }
        let root: Any
        do {
            root = try JSONSerialization.jsonObject(with: data)
        } catch {
            throw ContentError.malformed("strings/\(name)", String(describing: error))
        }
        guard let object = root as? [String: Any] else {
            throw ContentError.malformed("strings/\(name)", "the top level is not an object")
        }
        var values: [String: Value] = [:]
        var gaps: [String] = []
        for (key, raw) in object {
            if let s = raw as? String {
                values[key] = .plain(s)
            } else if let byCulture = raw as? [String: Any] {
                var map: [Culture: String] = [:]
                for culture in Culture.allCases {
                    if let s = byCulture[culture.id] as? String {
                        map[culture] = s
                    } else {
                        gaps.append("\(key).\(culture.id)")
                    }
                }
                values[key] = .perCulture(map)
            } else {
                throw ContentError.malformed("strings/\(name)", "\(key) is neither a string nor a culture map")
            }
        }
        if !gaps.isEmpty { throw ContentError.incomplete("shared/strings/\(name)", gaps.sorted()) }
        self.values = values
    }
}
