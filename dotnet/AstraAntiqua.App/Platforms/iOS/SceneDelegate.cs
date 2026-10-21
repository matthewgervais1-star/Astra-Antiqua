using Foundation;

namespace AstraAntiqua.App;

/// <summary>
/// The UIScene lifecycle, which iOS requires of an app built with the iOS 27
/// SDK: without a scene delegate, iOS 27 stops the app at launch (the CI smoke
/// run's crash reports show UIKit's
/// _UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption trap). MAUI
/// supplies the delegate; Info.plist's UIApplicationSceneManifest names it.
/// </summary>
[Register("SceneDelegate")]
public class SceneDelegate : MauiUISceneDelegate
{
}
