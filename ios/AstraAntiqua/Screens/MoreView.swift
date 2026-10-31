import AstraCore
import SwiftUI

/// Everything past the four tabs: the readings that need a second chart or a
/// year, the reference pages, and the record itself, which can be changed or
/// deleted from here. Port of the MAUI MorePage.
struct MoreView: View {
    @Environment(AppState.self) private var state
    @State private var confirmDelete = false
    @State private var openCulture = false
    @State private var openBirth = false

    init() {}

    var body: some View {
        Page(title: "More") {
            NaveHead(kicker: "Astra Antiqua", headline: "More")
            readings
            reference
            record
        }
        .navigationDestination(isPresented: $openCulture) {
            CultureView(onboarding: false)
        }
        .navigationDestination(isPresented: $openBirth) {
            BirthView()
        }
    }

    // MARK: Sections

    @ViewBuilder
    private var readings: some View {
        SectionDivider(label: "Readings")
        link("Today in full", "The week's line, the Moon, the season, today's transits and your two lights") { DayView() }
        link("The year ahead", "Your solar return, long transits and stations") { ForecastView() }
        link("Synastry", "Two charts read against each other") { SynastryView() }
    }

    @ViewBuilder
    private var reference: some View {
        SectionDivider(label: "Reference")
        link("Learn", "How the sky becomes a chart, in seven sections") { LearnView() }
        link("The five voices", "One sky, five theologies") { VoicesView() }
        link("The matrix", "Ten bodies across five pantheons") { MatrixView() }
        link("The method", "The numbers the app runs, and its sources") { MethodView() }
    }

    @ViewBuilder
    private var record: some View {
        SectionDivider(label: "Your record")
        if let birth = state.birth {
            recordLines(birth)
        }
        ActionButton(title: "Change the culture") { openCulture = true }
        ActionButton(title: state.birth == nil ? "Cast your chart" : "Edit the birth") { openBirth = true }

        if state.birth != nil {
            Inset {
                Caption(text: "The record is kept on this device only. Nothing is sent anywhere, and deleting it here deletes the only copy.")
            }
            ActionButton(title: "Delete the record", destructive: true) { confirmDelete = true }
                .confirmationDialog("Delete the record", isPresented: $confirmDelete, titleVisibility: .visible) {
                    // Forgetting clears the culture too, so the root shows the doorways by itself.
                    Button("Yes, delete it from this device", role: .destructive) { state.forget() }
                    Button("Keep it", role: .cancel) {}
                }
        }
    }

    // MARK: Pieces

    /// A row that opens another screen: its title over a mono line.
    private func link<Destination: View>(
        _ title: String,
        _ sub: String,
        @ViewBuilder to destination: @escaping () -> Destination
    ) -> some View {
        LinkRow(destination: destination, content: {
            VStack(alignment: .leading, spacing: 2) {
                Title(text: title, size: 18)
                Caption(text: sub)
            }
        })
    }

    /// The name, the birth as entered, and the instant it is read as, with
    /// the zone that produced it (in the conflict ink when only estimated).
    private func recordLines(_ birth: SavedBirth) -> some View {
        let resolved = birth.resolve()
        let entered = "\(Self.digits(birth.year, 4))-\(Self.digits(birth.month, 2))-\(Self.digits(birth.day, 2)) "
            + "\(Self.digits(birth.hour, 2)):\(Self.digits(birth.minute, 2)) · \(birth.placeName)"
        let zone = birth.zoneEstimated ? " · zone estimated from longitude" : " · \(birth.timeZone)"
        let readAs = "Read as \(Self.utcStamp(resolved.utc)) UTC · \(BirthResolver.formatOffset(resolved.offsetMinutes))\(zone)"
        return Inset {
            Title(text: birth.name)
            Caption(text: entered)
            Caption(text: readAs, color: birth.zoneEstimated ? Ink.conflict : Ink.dim)
        }
    }

    /// "1990-07-23 12:05": the instant on the UTC wall clock, counted on the
    /// proleptic Gregorian calendar as C#'s DateTime prints it. Foundation's
    /// Gregorian calendar turns Julian before 1582, so the count is done here
    /// (Howard Hinnant's civil_from_days).
    private static func utcStamp(_ date: Date) -> String {
        let seconds = Int(date.timeIntervalSince1970.rounded(.down))
        let days = Int((Double(seconds) / 86_400).rounded(.down))
        let secondOfDay = seconds - days * 86_400
        let z = days + 719_468
        let era = (z >= 0 ? z : z - 146_096) / 146_097
        let dayOfEra = z - era * 146_097
        let yearOfEra = (dayOfEra - dayOfEra / 1_460 + dayOfEra / 36_524 - dayOfEra / 146_096) / 365
        let dayOfYear = dayOfEra - (365 * yearOfEra + yearOfEra / 4 - yearOfEra / 100)
        let monthFromMarch = (5 * dayOfYear + 2) / 153
        let day = dayOfYear - (153 * monthFromMarch + 2) / 5 + 1
        let month = monthFromMarch < 10 ? monthFromMarch + 3 : monthFromMarch - 9
        let year = yearOfEra + era * 400 + (month <= 2 ? 1 : 0)
        let ymd = "\(digits(year, 4))-\(digits(month, 2))-\(digits(day, 2))"
        return "\(ymd) \(digits(secondOfDay / 3_600, 2)):\(digits(secondOfDay % 3_600 / 60, 2))"
    }

    /// C#'s "00" and "0000" formats: at least `width` digits, the sign in front.
    private static func digits(_ n: Int, _ width: Int) -> String {
        let text = String(n.magnitude)
        return (n < 0 ? "-" : "") + String(repeating: "0", count: max(0, width - text.count)) + text
    }
}
