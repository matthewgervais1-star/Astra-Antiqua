import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
    kotlin("plugin.serialization")
}

/**
 * Release signing. keystore.properties is gitignored; without it the release
 * build falls back to debug signing so a fresh clone still builds. See
 * keystore.properties.template for how to generate the keystore.
 */
val keystorePropertiesFile = rootProject.file("keystore.properties")
val keystoreProperties = Properties().apply {
    if (keystorePropertiesFile.exists()) {
        keystorePropertiesFile.inputStream().use { load(it) }
    }
}
val hasReleaseKeystore = keystorePropertiesFile.exists()

/**
 * The web API the account screens talk to. Debug builds reach the host
 * machine's `pnpm dev` through the emulator alias 10.0.2.2; release builds
 * take the deployed origin from `astra.apiOrigin` (gradle.properties or -P),
 * and the release build stops if it is unset or not https. The check runs in
 * preReleaseBuild, so a debug build never needs the property.
 */
val debugApiOrigin = "http://10.0.2.2:3000"
val releaseApiOrigin: String = providers.gradleProperty("astra.apiOrigin").orNull?.trim().orEmpty()

android {
    namespace = "com.astra.antiqua"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.astra.antiqua"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        if (hasReleaseKeystore) {
            create("release") {
                storeFile = rootProject.file(keystoreProperties.getProperty("storeFile"))
                storePassword = keystoreProperties.getProperty("storePassword")
                keyAlias = keystoreProperties.getProperty("keyAlias")
                keyPassword = keystoreProperties.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        debug {
            buildConfigField("String", "API_ORIGIN", "\"$debugApiOrigin\"")
        }
        release {
            buildConfigField("String", "API_ORIGIN", "\"$releaseApiOrigin\"")
            signingConfig = if (hasReleaseKeystore) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    buildFeatures {
        compose = true
        // Needed for BuildConfig.DEBUG, used to gate the missing-content-key
        // log in NatalReadingRepository so it only fires in debug builds.
        buildConfig = true
    }
    sourceSets {
        getByName("main") {
            // The universal placement layer (planet-in-sign.json, plus the
            // rest of shared/content/) is generated from web
            // (docs/shared-content-model.md) and embedded by the dotnet
            // surface the same way: read in place rather than copied into
            // Kotlin or duplicated under an android/ asset, so the repo keeps
            // exactly one copy of the content. This merges with (now empty,
            // since oracle_decrees.json is retired) src/main/assets.
            assets.srcDir(rootProject.file("../shared/content"))
        }
    }
    testOptions {
        unitTests {
            // Some code under test (e.g. android.util.Log) is only stubbed by
            // the Android jar; without this, calling it from a JVM unit test
            // throws instead of being a no-op.
            isReturnDefaultValues = true
        }
    }
}

tasks.configureEach {
    if (name == "preReleaseBuild") {
        val origin = releaseApiOrigin
        doFirst {
            if (!Regex("""^https://[^/\s"]+$""").matches(origin)) {
                throw GradleException(
                    "astra.apiOrigin must be set to the deployed https origin (no path, " +
                        "no trailing slash) for a release build; found \"$origin\"."
                )
            }
        }
    }
}

// The exported schema is committed, so a future entity change has a baseline
// to write a migration against rather than being discovered in production.
ksp {
    arg("room.schemaLocation", "$projectDir/schemas")
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_11)
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)

    // Astronomy Engine
    implementation(libs.astronomy)
    implementation(libs.kotlinx.serialization.json)

    // Room
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // DataStore
    implementation(libs.androidx.datastore.preferences)

    // The web account's HTTP client
    implementation(libs.okhttp)

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
    testImplementation(libs.okhttp.mockwebserver)
    // A real SQLite on the JVM for the Room migration test. Pinned to the
    // androidx.sqlite version Room 2.8.4 resolves, so its API classes match.
    testImplementation(libs.sqlite.bundled.jvm)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}
