import AstraCore
import Foundation
import Observation

/// The one birth record, the culture it is read in, and what is computed
/// from it. The record is a file in Application Support marked to stay out
/// of iCloud and device backups; the app has no server and sends nothing.
/// Only the culture id, which says nothing about a person, lives in
/// UserDefaults.
///
/// Casting a chart and composing its reading are quick and done on change;
/// the long transits are slow, so they are computed off the main thread,
/// held for the day, and dropped if the computation fails.
///
/// The state lives on the main actor: every screen reads it from its body,
/// and `spans()` must not read the chart or swap the held task on another
/// thread while `recompute()` clears them on the main one. The heavy work
/// still runs in a detached task that captures only the Sendable chart.
@MainActor
@Observable
final class AppState {
    static let shared = AppState()

    private static let cultureKey = "astra.culture.v1"
    private static let birthFile = "birth.v1.json"

    private(set) var birth: SavedBirth?
    private(set) var culture: Culture?
    private(set) var chart: NatalChart?
    private(set) var reading: NatalReading?

    @ObservationIgnored private var spansTask: Task<[TransitSpan], Never>?
    @ObservationIgnored private var spansDay: Date?

    var store: ContentStore { Content.store }

    /// The zone the reader's own calendar days are counted in.
    var zone: TimeZone { .current }

    var cultureOrDefault: Culture { culture ?? .greece }

    private init() {
        birth = SavedBirth.fromJSON(try? String(contentsOf: Self.birthURL, encoding: .utf8))
        if let birth {
            culture = birth.culture
        } else if let id = UserDefaults.standard.string(forKey: Self.cultureKey) {
            culture = Culture(rawValue: id)
        }
        recompute()
    }

    private static var birthURL: URL {
        let dir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent(birthFile)
    }

    func chooseCulture(_ culture: Culture) {
        UserDefaults.standard.set(culture.id, forKey: Self.cultureKey)
        self.culture = culture
        if let birth {
            try? save(SavedBirth(
                name: birth.name, culture: culture, year: birth.year, month: birth.month, day: birth.day,
                hour: birth.hour, minute: birth.minute, latitude: birth.latitude, longitude: birth.longitude,
                placeName: birth.placeName, timeZone: birth.timeZone, zoneEstimated: birth.zoneEstimated))
        } else {
            recompute()
        }
    }

    func save(_ birth: SavedBirth) throws {
        var url = Self.birthURL
        try birth.toJSON().write(to: url, atomically: true, encoding: .utf8)
        var values = URLResourceValues()
        values.isExcludedFromBackup = true
        try url.setResourceValues(values)
        UserDefaults.standard.set(birth.culture.id, forKey: Self.cultureKey)
        self.birth = birth
        self.culture = birth.culture
        recompute()
    }

    /// Deletes the record from this device. Nothing else holds a copy.
    func forget() {
        try? FileManager.default.removeItem(at: Self.birthURL)
        UserDefaults.standard.removeObject(forKey: Self.cultureKey)
        birth = nil
        culture = nil
        recompute()
    }

    private func recompute() {
        spansTask = nil
        spansDay = nil
        guard let birth else {
            chart = nil
            reading = nil
            return
        }
        let chart = birth.cast(rules: store.aspectRules)
        self.chart = chart
        reading = NatalReadingBuilder.build(culture: birth.culture, chart: chart.longitudes, store: store)
    }

    /// The long-transit spans for the record, computed off the main thread and
    /// held for the day, so the window stays centred on today.
    func spans() async -> [TransitSpan] {
        guard let chart else { return [] }
        let today = Calendar.current.startOfDay(for: Date())
        if spansTask == nil || spansDay != today {
            spansDay = today
            spansTask = Task.detached(priority: .userInitiated) { Horizons.spans(chart: chart, now: Date()) }
        }
        return await spansTask!.value
    }
}
