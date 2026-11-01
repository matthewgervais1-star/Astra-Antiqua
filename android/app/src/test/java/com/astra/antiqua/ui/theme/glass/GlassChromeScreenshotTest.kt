package com.astra.antiqua.ui.theme.glass

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.test.getBoundsInRoot
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.nav.Horizon
import com.astra.antiqua.ui.theme.AstraAntiquaTheme
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.RuleRow
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Assert.assertTrue
import org.junit.BeforeClass
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File
import kotlin.math.abs

/**
 * The glass chrome at 390x844 dp, rendered on the JVM (Robolectric's native
 * graphics, captured by Roborazzi) and checked against the canvas's placement
 * table to within 1 dp. The table is the Round 7 spec boards
 * (`.superpowers/sdd/glass-build/report-r7.md`, design worktree), the same
 * rects as the iOS port's `ios/placement/chrome.json`.
 *
 * The content is a test pattern of bone bars at 30% and 50% and 1px rules,
 * no copy, so each frame shows what the glass does to what scrolls beneath.
 * Robolectric reports no system bars, so the chrome sits at the canvas's own
 * safe top 62 and home line 810.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [35], qualifiers = "w390dp-h844dp-xxhdpi")
class GlassChromeScreenshotTest {

    companion object {
        @JvmStatic
        @BeforeClass
        fun clearTable() {
            File("build/outputs/roborazzi/glass/placement.txt").delete()
        }
    }

    @get:Rule
    val compose = createComposeRule()

    private val out = File("build/outputs/roborazzi/glass").apply { mkdirs() }

    /** x, y, width, height on the 390x844 frame. */
    private data class Rect(val x: Float, val y: Float, val w: Float, val h: Float)

    private val tabScreen = mapOf(
        "P1" to Rect(24f, 75f, 153.8f, 18f),
        "P3" to Rect(270f, 62f, 104f, 44f),
        "P2" to Rect(16f, 113f, 358f, 44f),
        "P17" to Rect(16f, 748f, 358f, 56f),
        "P20" to Rect(0f, 0f, 390f, 173f),
    )

    private val pushedScreen = mapOf(
        "P55" to Rect(16f, 62f, 44f, 44f),
        "P1" to Rect(88.1f, 75f, 153.8f, 18f),
        "P3" to Rect(270f, 62f, 104f, 44f),
        "P56" to Rect(16f, 692f, 358f, 48f),
        "P17" to Rect(16f, 748f, 358f, 56f),
        "P20" to Rect(0f, 0f, 390f, 122f),
    )

    @Composable
    private fun Pattern() {
        // Forty rows: a bar at 50% bone, a bar at 30%, a 1px rule. Enough to
        // run under both the top chrome and the tab bar at any scroll.
        Column(Modifier.fillMaxWidth().padding(horizontal = 24.dp)) {
            repeat(40) { i ->
                Box(Modifier.width(if (i % 3 == 0) 342.dp else 220.dp).height(14.dp).background(Bone.copy(alpha = 0.5f)))
                Box(Modifier.height(8.dp))
                Box(Modifier.width(if (i % 2 == 0) 300.dp else 160.dp).height(10.dp).background(Bone.copy(alpha = 0.3f)))
                Box(Modifier.height(8.dp))
                Box(Modifier.fillMaxWidth().height(1.dp).background(RuleRow))
                Box(Modifier.height(12.dp))
            }
        }
    }

    private fun render(
        name: String,
        tier: GlassTier? = null,
        culture: AncientCulture = AncientCulture.EGYPT,
        pressed: Set<String> = emptySet(),
        scroll: Dp = 0.dp,
        pushed: Boolean = false,
        previousEnabled: Boolean = true,
    ) {
        compose.setContent {
            val base = LocalGlassTier.current
            AstraAntiquaTheme(selectedCulture = culture) {
                CompositionLocalProvider(
                    LocalGlassTier provides (tier ?: base),
                    LocalPressedPreview provides pressed,
                ) {
                    val state = rememberScrollState(with(LocalDensity.current) { scroll.roundToPx() })
                    if (pushed) {
                        GlassScreen(
                            culture = culture,
                            section = GlassSection.CHART,
                            back = "CHART",
                            scrollState = state,
                            accessory = { BodySwitcher("Osiris", "Khonsu", previousEnabled = previousEnabled) },
                        ) { Pattern() }
                    } else {
                        GlassScreen(
                            culture = culture,
                            section = GlassSection.SKY,
                            horizon = Horizon.DAY,
                            scrollState = state,
                        ) { Pattern() }
                    }
                }
            }
        }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage(File(out, "$name.png").path)
    }

    private fun check(name: String, table: Map<String, Rect>): List<String> {
        val lines = mutableListOf<String>()
        val misses = mutableListOf<String>()
        table.forEach { (id, want) ->
            val b = compose.onNodeWithTag(id).getBoundsInRoot()
            val got = Rect(b.left.value, b.top.value, (b.right - b.left).value, (b.bottom - b.top).value)
            val worst = maxOf(abs(got.x - want.x), abs(got.y - want.y), abs(got.w - want.w), abs(got.h - want.h))
            val line = "%s %s want %.1f, %.1f · %.1fx%.1f got %.1f, %.1f · %.1fx%.1f off %.2f".format(
                name, id, want.x, want.y, want.w, want.h, got.x, got.y, got.w, got.h, worst,
            )
            lines += line
            if (worst > 1f) misses += line
        }
        File(out, "placement.txt").appendText(lines.joinToString("\n", postfix = "\n"))
        return misses
    }

    private fun assertPlaced(name: String, table: Map<String, Rect>) {
        val misses = check(name, table)
        assertTrue("placements off by more than 1 dp:\n" + misses.joinToString("\n"), misses.isEmpty())
    }

    @Test
    fun chrome() {
        render("chrome")
        assertPlaced("chrome", tabScreen)
    }

    @Test
    fun chromeScrolledLens() {
        render("chrome-scrolled-lens", tier = GlassTier.LENS, scroll = 420.dp)
        assertPlaced("chrome-scrolled-lens", tabScreen)
    }

    @Test
    fun chromeScrolledBlur() {
        render("chrome-scrolled-blur", tier = GlassTier.BLUR, scroll = 420.dp)
        assertPlaced("chrome-scrolled-blur", tabScreen)
    }

    @Test
    fun chromeScrolledTint() {
        render("chrome-scrolled-tint", tier = GlassTier.TINT, scroll = 420.dp)
        assertPlaced("chrome-scrolled-tint", tabScreen)
    }

    @Test
    fun chromePressed() {
        render("chrome-pressed", pressed = setOf("P163.transits", "P164", "P166.week"), scroll = 420.dp)
        assertPlaced("chrome-pressed", tabScreen)
    }

    @Test
    fun chromePushed() {
        render("chrome-pushed", pushed = true, scroll = 100.dp)
        assertPlaced("chrome-pushed", pushedScreen)
    }

    @Test
    fun chromePushedPressed() {
        render("chrome-pushed-pressed", pushed = true, scroll = 100.dp, pressed = setOf("P165", "P167.next"), previousEnabled = false)
        assertPlaced("chrome-pushed-pressed", pushedScreen)
    }

    @Test
    fun cultureMenuWidths() {
        // Round 6 (report-r6.md): right edge at 374, never under 104.
        val widths = mapOf(
            AncientCulture.EGYPT to 104f,
            AncientCulture.GREECE to 113f,
            AncientCulture.CANAAN to 113f,
            AncientCulture.CARTHAGE to 129f,
            AncientCulture.ROME to 104f,
        )
        val culture = AncientCulture.CARTHAGE
        render("chrome-carthage", culture = culture)
        val w = widths.getValue(culture)
        assertPlaced("chrome-carthage", tabScreen + ("P3" to Rect(374f - w, 62f, w, 44f)))
        widths.forEach { (c, width) -> assertTrue(Chrome.menuWidth(c).value == width) }
    }
}
