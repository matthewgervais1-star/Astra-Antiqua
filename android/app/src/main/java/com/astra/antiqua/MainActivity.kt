package com.astra.antiqua

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.astra.antiqua.model.AppPhase
import com.astra.antiqua.ui.screens.CultureSelectionScreen
import com.astra.antiqua.ui.screens.MainDashboardScreen
import com.astra.antiqua.ui.screens.MethodScreen
import com.astra.antiqua.ui.screens.OnboardingScreen
import com.astra.antiqua.ui.LauncherIcon
import com.astra.antiqua.ui.components.Monogram
import com.astra.antiqua.ui.theme.AstraAntiquaTheme
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.viewmodel.AppViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: AppViewModel by viewModels()

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
            val currentPhase by viewModel.currentPhase.collectAsState()
            val selectedCulture by viewModel.selectedCulture.collectAsState()
            val context = LocalContext.current

            AstraAntiquaTheme(selectedCulture = selectedCulture) {
                LaunchedEffect(Unit) {
                    viewModel.init(context)
                }

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
                            fadeIn(animationSpec = tween(1000)) togetherWith
                            fadeOut(animationSpec = tween(1000))
                        },
                        label = "PhaseTransition"
                    ) { phase ->
                        when (phase) {
                            AppPhase.ENGINE_WARMUP -> EngineWarmupScreen()
                            AppPhase.CULTURE_SELECTION -> CultureSelectionScreen { culture ->
                                viewModel.selectCulture(context, culture.name)
                            }
                            AppPhase.ONBOARDING -> OnboardingScreen {
                                viewModel.completeOnboarding(context)
                            }
                            AppPhase.MAIN_DASHBOARD -> {
                                // The first-run flow stays a phase machine: it
                                // is a sequence, not somewhere you navigate. Past
                                // it, destinations are real places with real back
                                // behaviour, which is what the nav graph is for.
                                val navController = rememberNavController()
                                NavHost(navController, startDestination = "reading") {
                                    composable("reading") {
                                        MainDashboardScreen(
                                            onOpenMethod = { navController.navigate("method") },
                                        )
                                    }
                                    composable("method") {
                                        MethodScreen(onBack = { navController.popBackStack() })
                                    }
                                }
                            }
                        }
                    }
                  }
                }
            }
        }
    }
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
