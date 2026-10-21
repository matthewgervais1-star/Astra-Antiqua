// swift-tools-version:5.9
//
// AstraCore: the Swift surface's domain layer, a port of
// dotnet/AstraAntiqua.Core held to web's output by the same fixtures
// (dotnet/AstraAntiqua.Core.Tests/TestData). It reads the generated corpus in
// shared/content at runtime from a directory it is handed, so the package
// and the app share one copy of every sentence.
//
// The ephemeris is cosinekitty/astronomy's C edition, v2.1.19: the same
// engine web (npm), Android (JAR) and the C# core (NuGet) use.
import PackageDescription

let package = Package(
    name: "AstraCore",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "AstraCore", targets: ["AstraCore"]),
    ],
    targets: [
        .target(
            name: "CAstronomy",
            path: "Sources/CAstronomy",
            exclude: ["LICENSE"],
            linkerSettings: [.linkedLibrary("m", .when(platforms: [.linux]))]
        ),
        .target(
            name: "AstraCore",
            dependencies: ["CAstronomy"],
            path: "Sources/AstraCore"
        ),
        .testTarget(
            name: "AstraCoreTests",
            dependencies: ["AstraCore"],
            path: "Tests/AstraCoreTests"
        ),
    ]
)
