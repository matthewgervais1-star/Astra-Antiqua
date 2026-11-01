package com.astra.antiqua

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.layout.height
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavBackStackEntry
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.AppPhase
import com.astra.antiqua.model.Planet
import com.astra.antiqua.ui.LauncherIcon
import com.astra.antiqua.ui.components.AnimationsOffProvider
import com.astra.antiqua.ui.components.Monogram
import com.astra.antiqua.ui.nav.Route
import com.astra.antiqua.ui.screens.AccountScreen
import com.astra.antiqua.ui.screens.LicencesScreen
import com.astra.antiqua.ui.screens.SignInScreen
import com.astra.antiqua.ui.screens.WaitListScreen
import com.astra.antiqua.ui.screens.CultureSelectionScreen
import com.astra.antiqua.ui.screens.ForecastScreen
import com.astra.antiqua.ui.screens.LearnScreen
import com.astra.antiqua.ui.screens.SkyDayScreen
import com.astra.antiqua.ui.screens.MatrixScreen
import com.astra.antiqua.ui.screens.MethodScreen
import com.astra.antiqua.ui.screens.OnboardingScreen
import com.astra.antiqua.ui.screens.PlacementScreen
import com.astra.antiqua.ui.screens.PlacementsScreen
import com.astra.antiqua.ui.screens.SynastryScreen
import com.astra.antiqua.ui.screens.SkySeasonScreen
import com.astra.antiqua.ui.screens.SkyYearScreen
import com.astra.antiqua.ui.screens.FigureScreen
import com.astra.antiqua.ui.screens.TransitDetailScreen
import com.astra.antiqua.ui.screens.TransitsScreen
import com.astra.antiqua.ui.screens.VoiceScreen
import com.astra.antiqua.ui.screens.VoicesScreen
import com.astra.antiqua.ui.screens.SkyWeekScreen
import com.astra.antiqua.ui.theme.AstraAntiquaTheme
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.ShellType
import com.astra.antiqua.viewmodel.AppViewModel
import com.astra.antiqua.viewmodel.AstraViewModelFactory

class MainActivity : ComponentActivity() {

    /**
     * The launcher icon the reader chose is swapped here rather than at the
     * moment of choosing: disabling the alias that started this task would
     * close it. See ui.LauncherIcon.
     */
    override fun onStop() {
        super.onStop()
        LauncherIcon.applyPending(this)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val viewModel: AppViewModel = viewModel(factory = AstraViewModelFactory)
            val currentPhase by viewModel.currentPhase.collectAsState()
            val selectedCulture by viewModel.selectedCulture.collectAsState()

            // One observer of the animator scale for the whole activity; the script names read it.
            AnimationsOffProvider {
                AstraAntiquaTheme(selectedCulture = selectedCulture) {
                    LaunchedEffect(Unit) { viewModel.start() }

                    // Edge-to-edge is enforced from SDK 35. The Surface must fill the
                    // whole window so the culture's ground paints behind the system
                    // bars; the inset is applied to the CONTENT inside it, not to the
                    // Surface, or the bars show the bare window background instead.
                    Surface(
                        modifier = Modifier.fillMaxSize(),
                        color = MaterialTheme.colorScheme.background
                    ) {
                        // Glass screens paint their ground behind the system bars and
                        // place their own chrome against them (GlassScreen); the
                        // first-run phases and the flat destinations keep inside them.
                        Box {
                            AnimatedContent(
                                targetState = currentPhase,
                                transitionSpec = {
                                    // A plain opacity fade, which is the only motion
                                    // this identity allows. Nothing moves or scales.
                                    fadeIn(animationSpec = tween(AppPhase.FADE_MILLIS)) togetherWith
                                        fadeOut(animationSpec = tween(AppPhase.FADE_MILLIS))
                                },
                                label = "PhaseTransition"
                            ) { phase ->
                                when (phase) {
                                    AppPhase.ENGINE_WARMUP -> Box(Modifier.safeDrawingPadding()) { EngineWarmupScreen() }
                                    AppPhase.CULTURE_SELECTION -> Box(Modifier.safeDrawingPadding()) {
                                        CultureSelectionScreen { culture -> viewModel.selectCulture(culture) }
                                    }
                                    AppPhase.ONBOARDING -> Box(Modifier.safeDrawingPadding()) {
                                        OnboardingScreen(onLocationSaved = { viewModel.completeOnboarding() })
                                    }
                                    AppPhase.MAIN_DASHBOARD -> AstraNavHost(
                                        culture = selectedCulture,
                                        onChooseCulture = viewModel::switchCulture,
                                        onStruck = viewModel::returnToCultureSelection,
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Everywhere the app can go once the first-run sequence is behind it.
 *
 * The first-run flow stays a phase machine, because it is a sequence rather
 * than somewhere you navigate. Past it, destinations are real places with
 * real back behaviour, which is what a graph is for, and every screen inside
 * it wears the shell, so a reader always has a way back and a way across.
 */
@Composable
fun AstraNavHost(
    culture: AncientCulture,
    onChooseCulture: (AncientCulture) -> Unit,
    onStruck: () -> Unit = {},
) {
    val navController = rememberNavController()

    // The bars navigate BETWEEN sections; a row inside a section navigates
    // INTO one. The two need different stacks, so they are different lambdas.
    val go: (String) -> Unit = { route -> navController.goToSection(route) }
    val open: (String) -> Unit = { route -> navController.openDetail(route) }
    val openVoice: (AncientCulture) -> Unit = { open(Route.voice(it)) }

    NavHost(navController, startDestination = Route.DAY) {
        // SKY · DAY on the glass chrome (docs/design/android-glass.md, step 2).
        composable(Route.DAY) {
            SkyDayScreen(culture = culture, onNavigate = go, onOpen = open)
        }
        // SKY · WEEK on the glass chrome (step 3); the flat WeekScreen leaves the graph.
        composable(Route.WEEK) {
            SkyWeekScreen(culture = culture, onNavigate = go, onOpen = open)
        }
        // SKY · SEASON on the glass chrome (step 4); the flat SeasonScreen leaves the graph.
        composable(Route.SEASON) {
            SkySeasonScreen(culture = culture, onNavigate = go, onOpen = open)
        }
        // SKY · YEAR on the glass chrome (step 5); the flat YearScreen leaves the graph.
        composable(Route.YEAR) {
            SkyYearScreen(culture = culture, onNavigate = go, onOpen = open)
        }
        flat(Route.VOICES) {
            VoicesScreen(culture = culture, onNavigate = go, onOpenVoice = openVoice)
        }
        flat(Route.VOICE) { entry ->
            val name = entry.arguments?.getString("culture").orEmpty()
            val voice = runCatching { AncientCulture.valueOf(name.uppercase()) }.getOrNull()
            if (voice == null) {
                // An unknown culture in the route is not an error page's worth
                // of ceremony on a five-item list: show the list.
                VoicesScreen(culture = culture, onNavigate = go, onOpenVoice = openVoice)
            } else {
                VoiceScreen(
                    voice = voice,
                    onNavigate = go,
                    onEnterVoice = { chosen ->
                        onChooseCulture(chosen)
                        navController.popBackStack(Route.DAY, inclusive = false)
                    },
                )
            }
        }
        flat(Route.TRANSITS) {
            TransitsScreen(
                culture = culture,
                onNavigate = go,
                onOpenSpan = { open(Route.transitDetail(it)) },
            )
        }
        flat(Route.TRANSIT_DETAIL) { entry ->
            TransitDetailScreen(
                spanId = entry.arguments?.getString("id").orEmpty(),
                culture = culture,
                onNavigate = go,
                onBack = { navController.popBackStack() },
            )
        }
        flat(Route.FIGURE) { entry ->
            FigureScreen(
                date = entry.arguments?.getString("date").orEmpty(),
                id = entry.arguments?.getString("id").orEmpty(),
                culture = culture,
                onNavigate = go,
                onOpen = open,
            )
        }
        flat(Route.MATRIX) {
            MatrixScreen(culture = culture, onNavigate = go)
        }
        flat(Route.PLACEMENTS) {
            PlacementsScreen(
                culture = culture,
                onNavigate = go,
                onOpenPlacement = { open(Route.placement(it)) },
                onOpenForecast = { open(Route.FORECAST) },
                onRecast = { open(Route.READING) },
                onOpenSynastry = { open(Route.SYNASTRY) },
            )
        }
        flat(Route.PLACEMENT) { entry ->
            val name = entry.arguments?.getString("body").orEmpty()
            val body = runCatching { Planet.valueOf(name.uppercase()) }.getOrNull()
            if (body == null) {
                PlacementsScreen(
                    culture = culture,
                    onNavigate = go,
                    onOpenPlacement = { open(Route.placement(it)) },
                )
            } else {
                PlacementScreen(
                    body = body,
                    culture = culture,
                    onNavigate = go,
                    onOpenPlacement = { open(Route.placement(it)) },
                )
            }
        }
        flat(Route.LEARN) { entry ->
            val slug = entry.arguments?.getString("slug") ?: Route.LEARN_INDEX
            LearnScreen(
                href = Route.learnHref(slug),
                culture = culture,
                onNavigate = go,
                onOpenSection = { open(Route.learn(it)) },
            )
        }
        flat(Route.READING) {
            // The same form the first run uses. A chart cast again replaces
            // the one on the device, which is what the single birth record
            // this app keeps allows; web keeps many and this keeps one.
            // The form wears no shell, so it is the one screen a reader can
            // be stuck on: a restored stack can have it at the root, and
            // popping an empty stack does nothing. Leaving it therefore falls
            // back to the chart rather than trusting the pop.
            val leave = {
                if (!navController.popBackStack()) navController.goToSection(Route.PLACEMENTS)
            }
            OnboardingScreen(onLocationSaved = leave, onCancel = leave)
        }
        flat(Route.FORECAST) {
            ForecastScreen(
                culture = culture,
                onNavigate = go,
                onOpenSpan = { open(Route.transitDetail(it)) },
            )
        }
        flat(Route.SYNASTRY) {
            SynastryScreen(
                culture = culture,
                onNavigate = go,
                onCastChart = { open(Route.READING) },
            )
        }
        flat(Route.METHOD) {
            MethodScreen(
                onBack = { navController.popBackStack() },
                onOpenLicences = { open(Route.LICENCES) },
            )
        }
        flat(Route.LICENCES) {
            LicencesScreen(culture = culture, onNavigate = go)
        }
        flat(Route.ACCOUNT) {
            AccountScreen(
                culture = culture,
                onNavigate = go,
                // Signed out, the account is THE RECORD, as web's /account
                // sends an anonymous visitor to /signin. The swap replaces
                // this entry, so back does not return to a redirect.
                onSignIn = {
                    navController.navigate(Route.SIGN_IN) {
                        popUpTo(Route.ACCOUNT) { inclusive = true }
                    }
                },
                onSignedOut = { go(Route.DAY) },
                onStruck = onStruck,
                onChangeCulture = { go(Route.VOICES) },
                onOpenLicences = { open(Route.LICENCES) },
            )
        }
        flat(Route.SIGN_IN) {
            SignInScreen(
                culture = culture,
                onNavigate = go,
                onSignedIn = {
                    navController.navigate(Route.ACCOUNT) {
                        popUpTo(Route.SIGN_IN) { inclusive = true }
                    }
                },
                onContinue = { go(Route.DAY) },
                onOpenRoll = { open(Route.WAIT_LIST) },
            )
        }
        flat(Route.WAIT_LIST) {
            WaitListScreen(culture = culture, onNavigate = go)
        }
    }
}

/**
 * Moving between sections: one copy of a destination on the stack, and back
 * always leads home. Tapping TODAY four times should not put four days behind
 * you, and returning to a section it should find it where you left it.
 */
private fun NavHostController.goToSection(route: String) {
    navigate(route) {
        popUpTo(Route.DAY) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
}

/**
 * Moving INTO something: a culture's doorway, a placement, a long transit, a
 * Learn section. These are plain pushes.
 *
 * They must not restore state. A route that carries an argument, such as
 * learn/{slug}, is one destination with many arguments; asking the navigator
 * to restore that destination's saved state hands back the argument you were
 * already looking at, so the second Learn section you tapped never opened.
 * A push keeps the argument and puts the previous screen behind you, which is
 * also what the back gesture should find there.
 */
private fun NavHostController.openDetail(route: String) {
    navigate(route) { launchSingleTop = true }
}

@Composable
fun EngineWarmupScreen() = ShellType {
    // The warmup runs before start() loads the saved culture, while the theme
    // holds the GREECE default, so it keeps the shell's Cinzel for every reader.
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            // The app's own mark, on the one screen that speaks as the app
            // rather than as a culture. The architrave follows the accent.
            Monogram(height = 64.dp)
            Spacer(modifier = Modifier.height(32.dp))
            CircularProgressIndicator(color = LocalAccent.current, strokeWidth = 2.dp)
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = "Aligning the Astrolabe...",
                style = MaterialTheme.typography.headlineMedium,
                color = Bone
            )
        }
    }
}

/**
 * A flat destination: drawn inside the system bars, as every screen was before
 * the glass chrome. Glass screens are added with [composable] and place their
 * own chrome against the bars.
 */
private fun NavGraphBuilder.flat(route: String, content: @Composable (NavBackStackEntry) -> Unit) {
    composable(route) { entry -> Box(Modifier.safeDrawingPadding()) { content(entry) } }
}
