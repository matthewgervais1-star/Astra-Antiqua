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
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.AppPhase
import com.astra.antiqua.model.ClassicalPlanet
import com.astra.antiqua.ui.LauncherIcon
import com.astra.antiqua.ui.components.Monogram
import com.astra.antiqua.ui.nav.Route
import com.astra.antiqua.ui.screens.CultureSelectionScreen
import com.astra.antiqua.ui.screens.LearnScreen
import com.astra.antiqua.ui.screens.MainDashboardScreen
import com.astra.antiqua.ui.screens.MatrixScreen
import com.astra.antiqua.ui.screens.MethodScreen
import com.astra.antiqua.ui.screens.OnboardingScreen
import com.astra.antiqua.ui.screens.PlacementScreen
import com.astra.antiqua.ui.screens.PlacementsScreen
import com.astra.antiqua.ui.screens.SeasonScreen
import com.astra.antiqua.ui.screens.YearScreen
import com.astra.antiqua.ui.screens.TransitDetailScreen
import com.astra.antiqua.ui.screens.TransitsScreen
import com.astra.antiqua.ui.screens.VoiceScreen
import com.astra.antiqua.ui.screens.VoicesScreen
import com.astra.antiqua.ui.screens.WeekScreen
import com.astra.antiqua.ui.theme.AstraAntiquaTheme
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.LocalAccent
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
                    Box(modifier = Modifier.safeDrawingPadding()) {
                        AnimatedContent(
                            targetState = currentPhase,
                            transitionSpec = {
                                // A plain opacity fade, which is the only motion
                                // this identity allows. Nothing moves or scales.
                                fadeIn(animationSpec = tween(FADE_MS)) togetherWith
                                    fadeOut(animationSpec = tween(FADE_MS))
                            },
                            label = "PhaseTransition"
                        ) { phase ->
                            when (phase) {
                                AppPhase.ENGINE_WARMUP -> EngineWarmupScreen()
                                AppPhase.CULTURE_SELECTION -> CultureSelectionScreen { culture ->
                                    viewModel.selectCulture(culture)
                                }
                                AppPhase.ONBOARDING -> OnboardingScreen {
                                    viewModel.completeOnboarding()
                                }
                                AppPhase.MAIN_DASHBOARD -> AstraNavHost(
                                    culture = selectedCulture,
                                    onChooseCulture = viewModel::selectCulture,
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    private companion object {
        const val FADE_MS = 400
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
) {
    val navController = rememberNavController()

    // The bars navigate BETWEEN sections; a row inside a section navigates
    // INTO one. The two need different stacks, so they are different lambdas.
    val go: (String) -> Unit = { route -> navController.goToSection(route) }
    val open: (String) -> Unit = { route -> navController.openDetail(route) }
    val openVoice: (AncientCulture) -> Unit = { open(Route.voice(it)) }

    NavHost(navController, startDestination = Route.DAY) {
        composable(Route.DAY) {
            MainDashboardScreen(
                culture = culture,
                onNavigate = go,
                onOpenMethod = { open(Route.METHOD) },
            )
        }
        composable(Route.WEEK) {
            WeekScreen(culture = culture, onNavigate = go)
        }
        composable(Route.SEASON) {
            SeasonScreen(culture = culture, onNavigate = go)
        }
        composable(Route.YEAR) {
            YearScreen(culture = culture, onNavigate = go)
        }
        composable(Route.VOICES) {
            VoicesScreen(culture = culture, onNavigate = go, onOpenVoice = openVoice)
        }
        composable(Route.VOICE) { entry ->
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
        composable(Route.TRANSITS) {
            TransitsScreen(
                culture = culture,
                onNavigate = go,
                onOpenSpan = { open(Route.transitDetail(it)) },
            )
        }
        composable(Route.TRANSIT_DETAIL) { entry ->
            TransitDetailScreen(
                spanId = entry.arguments?.getString("id").orEmpty(),
                culture = culture,
                onNavigate = go,
                onBack = { navController.popBackStack() },
            )
        }
        composable(Route.MATRIX) {
            MatrixScreen(culture = culture, onNavigate = go)
        }
        composable(Route.PLACEMENTS) {
            PlacementsScreen(
                culture = culture,
                onNavigate = go,
                onOpenPlacement = { open(Route.placement(it)) },
            )
        }
        composable(Route.PLACEMENT) { entry ->
            val name = entry.arguments?.getString("body").orEmpty()
            val body = runCatching { ClassicalPlanet.valueOf(name.uppercase()) }.getOrNull()
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
        composable(Route.LEARN) { entry ->
            val slug = entry.arguments?.getString("slug") ?: Route.LEARN_INDEX
            LearnScreen(
                href = Route.learnHref(slug),
                culture = culture,
                onNavigate = go,
                onOpenSection = { open(Route.learn(it)) },
            )
        }
        composable(Route.METHOD) {
            MethodScreen(onBack = { navController.popBackStack() })
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
fun EngineWarmupScreen() {
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
