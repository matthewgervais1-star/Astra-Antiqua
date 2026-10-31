package com.astra.antiqua.ui.theme.glass

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.test.getBoundsInRoot
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.hasAnyAncestor
import androidx.compose.ui.test.hasTestTag
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.nav.Horizon
import com.astra.antiqua.ui.theme.AstraAntiquaTheme
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Conflict
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Rule
import com.astra.antiqua.ui.theme.RuleRow
import com.astra.antiqua.ui.theme.displayCase
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.ParameterizedRobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File
import javax.imageio.ImageIO

/**
 * The comparison Matthew asked for on 2026-10-31 ("Compare both"): the same
 * chrome over the same Sky Day content, drawn by Kyant0/AndroidLiquidGlass and
 * by chrisbanes/haze, in three frames: at rest, scrolled 420 (the canvas's
 * scrolled frame for Glass-Day), and scrolled 420 with a solid bone patch
 * under the top chrome and the tab bar. Each frame in five variants: each
 * library on Android 13+ and on 12 (the tier forced on one JVM), and the
 * tint tier both share on 8 to 11.
 *
 * The content is an approximation of Glass-Day's for Egypt: the strings of
 * the Round 6 Egypt board (`r6-work/egypt.html`, design worktree) at the
 * Round 1 table's y positions (`report.md`, P4 to P16). The glyphs are left
 * out. It is a backdrop for the glass, not step 2.
 *
 * Each dim label's contrast is read off the render with the labels hidden:
 * the brightest pixel of the glass under the label's box against #9A917D.
 */
@RunWith(ParameterizedRobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [35], qualifiers = "w390dp-h844dp-xxhdpi")
class GlassLibraryComparisonTest(
    private val frame: String,
    private val variant: String,
) {
    companion object {
        private val frames = listOf("rest", "scrolled", "bright")
        private val variants = listOf("kyant-13", "haze-13", "kyant-12", "haze-12", "tint")

        @JvmStatic
        @ParameterizedRobolectricTestRunner.Parameters(name = "{0} {1}")
        fun params(): List<Array<Any>> = frames.flatMap { f -> variants.map { v -> arrayOf<Any>(f, v) } }
    }

    @get:Rule
    val compose = createComposeRule()

    private val out = File("build/outputs/roborazzi/compare").apply { mkdirs() }

    /** The dim labels at rest: the three unlit tabs and the three unlit horizons. */
    private val dimLabels = listOf("TRANSITS", "CHART", "MORE", "WEEK", "SEASON", "YEAR")

    @Composable
    private fun Mono(text: String, color: Color = Dim, modifier: Modifier = Modifier, align: TextAlign = TextAlign.Start) {
        Text(text, style = MaterialTheme.typography.labelSmall, color = color, textAlign = align, modifier = modifier)
    }

    /** Glass-Day's content for Egypt, each block at its Round 1 y (screen y less the content top 189). */
    @Composable
    private fun SkyDay(bright: Boolean) {
        val top = 189f
        fun at(y: Float): Modifier = Modifier.offset(y = (y - top).dp)
        Box(Modifier.fillMaxWidth().height((1260f - top).dp)) {
            if (bright) {
                // Solid bone under the top chrome and the tab bar at scroll 420.
                Box(at(420f + 40f).fillMaxWidth().height(140.dp).background(Bone))
                Box(at(420f + 720f).fillMaxWidth().height(110.dp).background(Bone))
            }
            val side = Modifier.padding(horizontal = 24.dp).fillMaxWidth()
            Mono("WED 21 OCT 2026 · THE HALL OF MA’AT", modifier = at(189f).then(side), align = TextAlign.Center)
            Text(
                displayCase("KHONSU IS FERRIED INTO THE FISHES"),
                style = MaterialTheme.typography.displaySmall,
                color = Bone,
                textAlign = TextAlign.Center,
                modifier = at(280.6f).then(side),
            )
            Mono("MOON INTO PISCES", modifier = at(360.8f).then(side), align = TextAlign.Center)
            Box(at(402.4f).padding(start = 173.dp).width(44.dp).height(1.dp).background(Rule))
            Text(
                "The count of the nights crosses to a new bank of the river, and the old mark no longer measures it.",
                style = MaterialTheme.typography.bodyMedium,
                color = Prose,
                textAlign = TextAlign.Center,
                modifier = at(427.4f).then(side),
            )
            Mono("THE SKY, COMPUTED", modifier = at(556.4f).then(side))
            Column(
                at(581.4f).padding(horizontal = 24.dp).fillMaxWidth().height(178.4.dp).border(1.dp, Rule).padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Mono("MOON")
                Mono("WAXING GIBBOUS · 74% LIT", Bone)
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Mono("FULL MOON")
                    Mono("26 OCT 2026", Bone)
                }
                Mono("SEASON")
                Mono("SUN IN LIBRA · DAY 29 OF 31", Bone)
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Mono("23 SEP")
                    Mono("2 TO GO")
                    Mono("23 OCT")
                }
            }
            Mono("ON YOUR CHART TODAY", modifier = at(799.8f).then(side))
            listOf(
                Triple(814.8f, "Isis rows in time with your Amun.", "VENUS △ NATAL JUPITER · 0.9° FROM EXACT · EASE"),
                Triple(910.1f, "Nun tips the scales against your Amun.", "NEPTUNE □ NATAL JUPITER · 1.1° FROM EXACT · TENSION"),
            ).forEach { (y, line, data) ->
                Column(at(y).then(side).height(95.3.dp).padding(top = 18.dp)) {
                    Text(line, style = MaterialTheme.typography.bodyMedium, color = Bone)
                    Mono(data, if (data.endsWith("TENSION")) Conflict else Dim)
                    Box(Modifier.weight(1f))
                    Box(Modifier.fillMaxWidth().height(1.dp).background(RuleRow))
                }
            }
            Mono("THE LONG TRANSIT", modifier = at(1045.4f).then(side))
            Column(
                at(1070.4f).padding(horizontal = 24.dp).fillMaxWidth().height(147.8.dp).border(1.dp, Rule).padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Mono("OPEN NOW · OCT 2026 → JUN 2027")
                Text("Amun rows in time with your rising", style = MaterialTheme.typography.bodyMedium, color = Bone)
                Mono("3 EXACT · 2 AHEAD · EASE")
                Mono("READ →", Bone, Modifier.align(Alignment.End))
            }
        }
    }

    private fun contrast(a: Color, b: Color): Double {
        val la = a.luminance().toDouble()
        val lb = b.luminance().toDouble()
        return (maxOf(la, lb) + 0.05) / (minOf(la, lb) + 0.05)
    }

    @Test
    fun render() {
        val engine = if (variant.startsWith("haze")) GlassEngine.HAZE else GlassEngine.KYANT
        val tier = when {
            variant == "tint" -> GlassTier.TINT
            variant.endsWith("-12") -> GlassTier.BLUR
            else -> GlassTier.LENS
        }
        val scroll: Dp = if (frame == "rest") 0.dp else 420.dp
        var hidden by mutableStateOf(false)
        compose.setContent {
            AstraAntiquaTheme(selectedCulture = AncientCulture.EGYPT) {
                CompositionLocalProvider(
                    LocalGlassEngine provides engine,
                    LocalGlassTier provides tier,
                    LocalChromeLabelsHidden provides hidden,
                ) {
                    val state = rememberScrollState(with(LocalDensity.current) { scroll.roundToPx() })
                    GlassScreen(
                        culture = AncientCulture.EGYPT,
                        section = GlassSection.SKY,
                        horizon = Horizon.DAY,
                        scrollState = state,
                    ) { SkyDay(bright = frame == "bright") }
                }
            }
        }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage(File(out, "$frame-$variant.png").path)

        // The chrome's own labels: "SEASON" is also a label in the data box.
        val inChrome = hasAnyAncestor(hasTestTag("P2") or hasTestTag("P17"))
        val boxes = dimLabels.associateWith {
            compose.onNode(hasText(it) and inChrome, useUnmergedTree = true).getBoundsInRoot()
        }
        hidden = true
        compose.waitForIdle()
        // Compose's captureToImage hangs under Robolectric; Roborazzi writes the
        // frame and ImageIO reads it back.
        val hiddenFile = File(out, "hidden/$frame-$variant.png").apply { parentFile?.mkdirs() }
        compose.onRoot().captureRoboImage(hiddenFile.path)
        val image = ImageIO.read(hiddenFile)
        val density = image.width / 390f
        val lines = boxes.map { (label, b) ->
            var brightest = Color.Black
            for (y in (b.top.value * density).toInt() until (b.bottom.value * density).toInt()) {
                for (x in (b.left.value * density).toInt() until (b.right.value * density).toInt()) {
                    val c = Color(image.getRGB(x, y))
                    if (c.luminance() > brightest.luminance()) brightest = c
                }
            }
            label to contrast(Dim, brightest)
        }
        val worst = lines.minBy { it.second }
        File(out, "contrast.txt").appendText(
            "%s %s worst %.2f (%s) all %s\n".format(
                frame, variant, worst.second, worst.first,
                lines.joinToString(" ") { "%s=%.2f".format(it.first, it.second) },
            ),
        )
    }
}
