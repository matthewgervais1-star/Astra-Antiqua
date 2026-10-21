import AstraCore
import CoreLocation
import MapKit
import SwiftUI

/// A birth as entered: the person's words, the place, and the zone it is read in.
struct BirthEntry: Sendable, Hashable {
    let name: String
    let input: BirthInput
    let placeName: String
    let zoneId: String
    let estimated: Bool

    /// The zone the wall clock is read in: the longitude estimate when the
    /// zone was estimated, or when this runtime does not know the stored id.
    var zone: TimeZone {
        if estimated { return BirthResolver.estimateZoneForLongitude(input.longitude) }
        return BirthResolver.findZone(zoneId) ?? BirthResolver.estimateZoneForLongitude(input.longitude)
    }

    func resolve() -> ResolvedBirth { BirthResolver.resolve(input, zone: zone) }
}

/// Birth entry. For the reader's own chart the entry is saved as the one
/// record this device keeps. For a second person (synastry) it is handed
/// back to the caller and never written anywhere. Port of the MAUI BirthPage.
struct BirthView: View {
    enum Mode { case own, other }

    let mode: Mode
    let onEntered: ((BirthEntry) -> Void)?

    @Environment(AppState.self) private var state
    /// The culture in force. During onboarding this is the doorway just
    /// chosen, which the save records with the birth.
    @Environment(\.culture) private var culture
    /// The zone the date and hour pickers show their wall clock in.
    @Environment(\.timeZone) private var pickerZone
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var day = BirthView.wallClock(year: 1990, month: 1, day: 1, hour: 12, minute: 0, zone: .current)
    @State private var time = BirthView.wallClock(year: 2001, month: 1, day: 1, hour: 12, minute: 0, zone: .current)
    @State private var place = ""
    @State private var picked: Pick?
    @State private var note: Note?
    @State private var searchId = 0
    @State private var searchingFor: String?
    @State private var needsPlace = false
    @State private var submitting = false
    @State private var saveError: String?
    @State private var prefilled = false
    @FocusState private var focus: Field?

    init(mode: Mode = .own, onEntered: ((BirthEntry) -> Void)? = nil) {
        self.mode = mode
        self.onEntered = onEntered
    }

    /// The place chosen, from the city list or the worldwide search.
    private struct Pick: Equatable {
        let name: String
        let latitude: Double
        let longitude: Double
        let zoneId: String
        let estimated: Bool
    }

    /// What the worldwide search has to say while no place is chosen.
    private enum Note {
        case searching, notFound, offline

        var text: String {
            switch self {
            case .searching: return "SEARCHING…"
            case .notFound: return "NO PLACE BY THAT NAME WAS FOUND. TRY A DIFFERENT NAME."
            case .offline: return "THE WORLDWIDE SEARCH NEEDS A NETWORK. THE CITIES ABOVE WORK WITHOUT ONE."
            }
        }

        var color: Color { self == .offline ? Ink.conflict : Ink.dim }
    }

    private enum Field { case name, place }

    private static let earliest = BirthView.wallClock(year: 1800, month: 1, day: 1, hour: 0, minute: 0, zone: .current)

    var body: some View {
        Page(title: mode == .own ? "Your birth" : "Their birth") {
            head
            nameSection
            whenSection
            placeSection
            submitSection
        }
        .tint(Ink.accent(culture))
        .scrollDismissesKeyboard(.interactively)
        .onAppear { prefill() }
        .onChange(of: place) { _, query in placeEdited(query) }
        .onChange(of: picked) { _, _ in needsPlace = false }
        .onChange(of: day) { _, _ in needsPlace = false }
        .onChange(of: time) { _, _ in needsPlace = false }
    }

    // MARK: Sections

    @ViewBuilder
    private var head: some View {
        if mode == .own {
            NaveHead(kicker: "Fixed at the hour of your birth", headline: "Enter your birth")
        } else {
            NaveHead(kicker: "The bond between two skies", headline: "The second birth")
        }
        Inset {
            Prose(text: mode == .own
                ? "The chart is cast once from what you enter here and kept on this device, out of its backups. The city list works offline; a worldwide search sends only the place name to Apple's geocoder."
                : "Enter the second person's birth to read the bond. Nothing about them is saved. A worldwide search sends only the place name to Apple's geocoder.")
        }
    }

    @ViewBuilder
    private var nameSection: some View {
        SectionDivider(label: "Name")
        Inset {
            // The keyboard must not learn names: the second person's above all.
            // With autocorrection off, iOS also stops spell checking the field.
            entryField(
                text: $name,
                prompt: mode == .own ? "Your name, as it should be printed" : "Their name",
                label: "Name",
                field: .name)
        }
    }

    @ViewBuilder
    private var whenSection: some View {
        SectionDivider(label: "Date and hour")
        Inset {
            HStack(spacing: 16) {
                DatePicker("Date of birth", selection: $day, in: BirthView.earliest...latestDay, displayedComponents: .date)
                    .labelsHidden()
                    .frame(maxWidth: .infinity, alignment: .leading)
                DatePicker("Hour of birth", selection: $time, displayedComponents: .hourAndMinute)
                    .labelsHidden()
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        Inset {
            Caption(text: "The hour is read on the birthplace's own clock, not this phone's.")
        }
    }

    @ViewBuilder
    private var placeSection: some View {
        SectionDivider(label: "Place")
        Inset {
            entryField(text: $place, prompt: "City of birth", label: "City of birth", field: .place)
        }
        if picked == nil { results }
        Inset { placeLine }
        Inset { readLineCaption }
    }

    @ViewBuilder
    private var submitSection: some View {
        ActionButton(title: mode == .own ? "Cast the chart" : "Read the bond") { submit() }
        if let saveError {
            Failure(message: saveError)
        }
    }

    private func entryField(text: Binding<String>, prompt: String, label: String, field: Field) -> some View {
        VStack(spacing: 6) {
            TextField(text: text, prompt: Text(prompt).foregroundStyle(Ink.faint)) { Text(label) }
                .font(.custom(Ink.prose, size: 18))
                .foregroundStyle(Ink.bone)
                .autocorrectionDisabled(true)
                .textInputAutocapitalization(.words)
                .submitLabel(.done)
                .focused($focus, equals: field)
                .padding(.vertical, 6)
            Rule()
        }
    }

    /// The offline cities matching what is typed, then the worldwide search.
    @ViewBuilder
    private var results: some View {
        ForEach(state.store.searchCities(place), id: \.self) { city in
            Button {
                pick(city)
            } label: {
                RowBody {
                    Title(text: city.name, size: 17)
                    Caption(text: city.country)
                }
            }
            .buttonStyle(.plain)
        }
        if trimmedPlace.count >= 2 {
            searchRow(trimmedPlace)
        }
    }

    private func searchRow(_ query: String) -> some View {
        Button {
            searchWorldwide(query)
        } label: {
            RowBody {
                Caption(text: "Search everywhere for “\(query)”", color: Ink.accent(culture))
            }
        }
        .buttonStyle(.plain)
    }

    @ViewBuilder
    private var placeLine: some View {
        if let p = picked {
            if p.estimated {
                Caption(
                    text: "\(p.name) · \(BirthView.fixed2(p.latitude)), \(BirthView.fixed2(p.longitude))\n"
                        + "The birth zone is estimated from the place's longitude · a transition date may be off by up to an hour",
                    color: Ink.conflict)
            } else {
                Caption(text: "\(p.name) · \(BirthView.fixed2(p.latitude)), \(BirthView.fixed2(p.longitude)) · \(p.zoneId)")
            }
        } else if let note {
            Caption(text: note.text, color: note.color)
        }
    }

    private var readLineCaption: some View {
        let line = readLine()
        return Caption(text: line.text, color: line.color)
    }

    // MARK: Behaviour

    private var trimmedPlace: String { place.trimmingCharacters(in: .whitespacesAndNewlines) }

    /// The last moment of today on the pickers' clock: a birth may be today.
    private var latestDay: Date {
        let calendar = Instant.calendar(pickerZone)
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: calendar.startOfDay(for: Date())) ?? Date()
        return tomorrow.addingTimeInterval(-1)
    }

    /// Editing the saved record starts from what was entered before.
    private func prefill() {
        guard !prefilled else { return }
        prefilled = true
        guard mode == .own, let b = state.birth else { return }
        name = b.name
        day = BirthView.wallClock(year: b.year, month: b.month, day: b.day, hour: 12, minute: 0, zone: pickerZone)
        time = BirthView.wallClock(year: 2001, month: 1, day: 1, hour: b.hour, minute: b.minute, zone: pickerZone)
        picked = Pick(name: b.placeName, latitude: b.latitude, longitude: b.longitude,
                      zoneId: b.timeZone, estimated: b.zoneEstimated)
        place = b.placeName
    }

    private func placeEdited(_ query: String) {
        if let p = picked, query == p.name { return }
        // The name was edited after a pick: the old coordinates no longer apply.
        if picked != nil { picked = nil }
        note = nil
    }

    private func pick(_ city: City) {
        let chosen = Pick(name: "\(city.name), \(city.country)", latitude: city.latitude, longitude: city.longitude,
                          zoneId: city.timeZone, estimated: false)
        picked = chosen
        note = nil
        place = chosen.name
        focus = nil
    }

    private func searchWorldwide(_ query: String) {
        // One request per search: Apple throttles these, and a refused zone
        // would fall back to an estimate. A tap on the same search while it
        // is out does nothing.
        if searchingFor == query { return }
        // A later search, or more typing, supersedes this one: its answer is dropped.
        searchId += 1
        let id = searchId
        searchingFor = query
        note = .searching
        focus = nil
        Task { @MainActor in
            do {
                let hit = try await WorldSearch.first(query)
                if id == searchId { searchingFor = nil }
                if isStale(id, query) { return }
                guard let hit else {
                    note = .notFound
                    return
                }
                let zone = BirthView.accept(hit.zoneId, longitude: hit.longitude)
                let chosen = Pick(name: hit.name, latitude: hit.latitude, longitude: hit.longitude,
                                  zoneId: zone.id, estimated: zone.estimated)
                picked = chosen
                note = nil
                place = chosen.name
            } catch {
                if id == searchId { searchingFor = nil }
                if isStale(id, query) { return }
                note = .offline
            }
        }
    }

    private func isStale(_ id: Int, _ query: String) -> Bool {
        id != searchId || trimmedPlace != query
    }

    /// A zone handed back by the geocoder, if this runtime can load it;
    /// otherwise the longitude estimate, which the screen then says it is.
    private static func accept(_ zoneId: String?, longitude: Double) -> (id: String, estimated: Bool) {
        if let zoneId, !zoneId.isEmpty, BirthResolver.findZone(zoneId) != nil {
            return (zoneId, false)
        }
        return (BirthResolver.estimatedZoneId(forLongitude: longitude), true)
    }

    /// The birth as entered so far, or nil until a place is chosen.
    private var current: BirthEntry? {
        guard let p = picked else { return nil }
        let calendar = Instant.calendar(pickerZone)
        let date = calendar.dateComponents([.year, .month, .day], from: day)
        let clock = calendar.dateComponents([.hour, .minute], from: time)
        guard let year = date.year, let month = date.month, let dayOfMonth = date.day,
              let hour = clock.hour, let minute = clock.minute else { return nil }
        let input = BirthInput(year: year, month: month, day: dayOfMonth, hour: hour, minute: minute,
                               latitude: p.latitude, longitude: p.longitude)
        let typed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let who = typed.isEmpty ? (mode == .own ? "You" : "Them") : typed
        return BirthEntry(name: who, input: input, placeName: p.name, zoneId: p.zoneId, estimated: p.estimated)
    }

    private func readLine() -> (text: String, color: Color) {
        guard let entry = current else {
            if needsPlace {
                return ("A CHART NEEDS A PLACE. CHOOSE THE CITY OF BIRTH FIRST.", Ink.conflict)
            }
            return ("Choose the city of birth from the list.", Ink.dim)
        }
        let resolved = entry.resolve()
        let offset = BirthResolver.formatOffset(resolved.offsetMinutes)
        return ("Read as \(BirthView.utcStamp(resolved.utc)) UTC · \(offset)", Ink.dim)
    }

    private func submit() {
        // A second tap while the first is still navigating would pop twice,
        // so the guard stays up once the screen is on its way out.
        guard !submitting else { return }
        submitting = true
        saveError = nil
        guard let entry = current else {
            needsPlace = true
            submitting = false
            return
        }

        switch mode {
        case .other:
            onEntered?(entry)
            dismiss()
        case .own:
            let i = entry.input
            do {
                try state.save(SavedBirth(
                    name: entry.name, culture: culture ?? state.cultureOrDefault,
                    year: i.year, month: i.month, day: i.day, hour: i.hour, minute: i.minute,
                    latitude: i.latitude, longitude: i.longitude,
                    placeName: entry.placeName, timeZone: entry.zoneId, zoneEstimated: entry.estimated))
                dismiss()
            } catch {
                saveError = error.localizedDescription
                submitting = false
            }
        }
    }

    // MARK: Helpers

    /// A wall-clock moment on the Gregorian calendar in `zone`. Nonisolated,
    /// so the @State initial values above may call it whatever isolation the
    /// compiler gives property initialisers.
    nonisolated private static func wallClock(year: Int, month: Int, day: Int, hour: Int, minute: Int, zone: TimeZone) -> Date {
        let components = DateComponents(year: year, month: month, day: day, hour: hour, minute: minute)
        return Instant.calendar(zone).date(from: components) ?? Date()
    }

    /// "1990-01-01 11:00", the instant on the UTC clock.
    private static func utcStamp(_ date: Date) -> String {
        let utc = TimeZone(identifier: "UTC") ?? TimeZone(secondsFromGMT: 0)!
        let c = Instant.calendar(utc).dateComponents([.year, .month, .day, .hour, .minute], from: date)
        return String(format: "%04ld-%02ld-%02ld %02ld:%02ld",
                      c.year ?? 0, c.month ?? 0, c.day ?? 0, c.hour ?? 0, c.minute ?? 0)
    }

    /// Two decimals, with a point whatever the phone's locale.
    private static func fixed2(_ value: Double) -> String { String(format: "%.2f", value) }
}

/// A place found by name: what to print, where it is, and its zone if the
/// geocoder gave one.
private struct PlaceHit: Sendable {
    let name: String
    let latitude: Double
    let longitude: Double
    let zoneId: String?
}

/// Place search: one MapKit local search by name. Each result is a map item
/// carrying its coordinates and the IANA zone the place keeps, which is what
/// web resolves with tz-lookup. It needs a network and no location
/// permission: it searches a name, never the device.
private enum WorldSearch {
    @MainActor
    static func first(_ query: String) async throws -> PlaceHit? {
        let request = MKLocalSearch.Request()
        request.naturalLanguageQuery = query
        let response: MKLocalSearch.Response
        do {
            response = try await MKLocalSearch(request: request).start()
        } catch let error as MKError where error.code == .placemarkNotFound {
            // MapKit reports an empty answer as an error: no such place, not no network.
            return nil
        }
        guard let item = response.mapItems.first else { return nil }

        let latitude: Double
        let longitude: Double
        var country: String? = nil
        if #available(iOS 26.0, *) {
            // From iOS 26 the item carries its own location; placemark is deprecated there.
            let location: CLLocation? = item.location
            guard let coordinate = location?.coordinate else { return nil }
            latitude = coordinate.latitude
            longitude = coordinate.longitude
        } else {
            let placemark = item.placemark
            latitude = placemark.coordinate.latitude
            longitude = placemark.coordinate.longitude
            country = placemark.country
        }

        let name = [item.name, country]
            .compactMap { $0?.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
            .joined(separator: ", ")
        return PlaceHit(name: name.isEmpty ? query : name, latitude: latitude, longitude: longitude,
                        zoneId: item.timeZone?.identifier)
    }
}
