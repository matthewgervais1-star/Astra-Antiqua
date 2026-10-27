package com.astra.antiqua.ui.components

import android.content.Context
import android.database.ContentObserver
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.waitForUpOrCancellation
import androidx.compose.foundation.interaction.InteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.layout.findRootCoordinates
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalInspectionMode
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.text
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.em
import com.astra.antiqua.domain.ReaderLanguage
import com.astra.antiqua.domain.ScriptNameKey
import com.astra.antiqua.domain.ScriptReveal
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import com.astra.antiqua.ui.theme.AstraAntiquaTheme
import com.astra.antiqua.ui.theme.Cinzel
import com.astra.antiqua.ui.theme.GfsDidot
import com.astra.antiqua.ui.theme.NotoHieroglyphs
import com.astra.antiqua.ui.theme.NotoPhoenician
import com.astra.antiqua.ui.theme.NotoUgaritic
import com.astra.antiqua.ui.theme.TypeScale
import com.astra.antiqua.ui.theme.displayCase
import kotlinx.coroutines.delay

/**
 * A deity or culture name in its culture's writing that resolves to the
 * reader's Latin form while it sits in the middle band of the window
 * (docs/superpowers/specs/2026-10-20-script-reveal.md, rules 3 to 5), the
 * Compose counterpart of web/src/components/chrome/ScriptName.tsx.
 *
 * The Latin form is the semantics of the whole name, so TalkBack reads it
 * whichever layer shows. Both forms sit in one Box, which takes the wider of
 * the two, so the swap moves nothing around it; the visible one cross-fades
 * over [ScriptReveal.FADE_MILLIS]. The fade runs in the draw phase, so a
 * frame of it recomposes nothing; scrolling recomposes only at a crossing.
 *
 * Rules: in the band (30% to 70% of the window height) the name reads Latin,
 * outside it the script. A tap resolves it at once, until the next crossing.
 * Focus on the container the name sits in ([interactionSource], the one that
 * container's `clickable` takes) shows Latin while it lasts and returns the name
 * to the band's form when it leaves (web's `:focus-visible`); during the intro it
 * also ends the intro (web's `focusin`), and Latin holds until the next crossing.
 * With [intro], the script shows from the first frame, holds for
 * [introDelayMillis], then resolves, and only a later crossing applies the
 * band again: a name at the top of a screen would otherwise never resolve.
 * Without it the name draws nothing until its first position is reported, one
 * blank frame, so no frame shows the form the band would not show.
 * A name with no attested script, or a device with animations off
 * (animator duration scale 0), shows Latin and never swaps.
 *
 * [upper] sets the Latin form in capitals; [displayFace] passes it through
 * [displayCase] for the small-caps surfaces. The script layer takes neither:
 * a script has its own case.
 */
@Composable
fun ScriptName(
    culture: AncientCulture,
    key: ScriptNameKey,
    modifier: Modifier = Modifier,
    style: TextStyle = LocalTextStyle.current,
    intro: Boolean = false,
    introDelayMillis: Long = ScriptReveal.INTRO_HOLD_MILLIS,
    color: Color = Color.Unspecified,
    upper: Boolean = false,
    displayFace: Boolean = false,
    textAlign: TextAlign? = null,
    maxLines: Int = Int.MAX_VALUE,
    contentAlignment: Alignment = Alignment.CenterStart,
    interactionSource: InteractionSource? = null,
) {
    val form = ScriptReveal.formFor(culture, key)
    val language = ScriptReveal.pickLanguage(LocalConfiguration.current.locales[0]?.language)
    val raw = ScriptReveal.latinFor(form, language, upper)
    val latin = if (displayFace) displayCase(raw) else raw
    val script = ScriptReveal.scriptFor(form)
    val animationsOff = rememberAnimationsOff()
    // Above the early return, so a finished intro stays finished when animations come back on.
    var introRunning by remember { mutableStateOf(intro) }
    // Latin until the next crossing: set by a tap or the end of the intro, which focus can cause.
    var held by remember { mutableStateOf(false) }

    if (script == null || animationsOff) {
        Text(
            text = latin,
            style = style,
            color = color,
            textAlign = textAlign,
            maxLines = maxLines,
            overflow = TextOverflow.Ellipsis,
            modifier = modifier,
        )
        return
    }

    var inBand by remember { mutableStateOf<Boolean?>(null) }
    val focused = interactionSource?.collectIsFocusedAsState()?.value == true
    // Null before the first position report, when neither layer draws.
    val showLatin = ScriptReveal.showsLatin(introRunning, held, inBand, focused)

    val latinFade = remember { Animatable(0f) }
    // False until the first form is on screen; that form takes its alpha at once, never a fade.
    var settled by remember { mutableStateOf(false) }
    LaunchedEffect(showLatin) {
        if (showLatin == null) return@LaunchedEffect
        val target = if (showLatin) 1f else 0f
        if (settled) {
            latinFade.animateTo(target, tween(ScriptReveal.FADE_MILLIS, easing = FastOutSlowInEasing))
        } else {
            latinFade.snapTo(target)
            settled = true
        }
    }
    val resolve = {
        introRunning = false
        held = true
    }
    LaunchedEffect(focused) { if (ScriptReveal.focusEndsIntro(introRunning, focused)) resolve() }
    if (intro) {
        LaunchedEffect(Unit) {
            delay(introDelayMillis)
            if (introRunning) resolve()
        }
    }

    Box(
        modifier = modifier
            .clearAndSetSemantics { text = AnnotatedString(latin) }
            .onGloballyPositioned { coordinates ->
                val bounds = coordinates.boundsInWindow()
                val height = coordinates.findRootCoordinates().size.height.toFloat()
                val now = ScriptReveal.inBand(bounds.top, bounds.bottom, height)
                val before = inBand
                if (before != now) {
                    inBand = now
                    // During the intro the band waits; afterwards a crossing clears a held Latin.
                    if (before != null && !introRunning) held = false
                }
            }
            .pointerInput(Unit) {
                // Watches for a tap without consuming it, so a row's own click still fires;
                // a drag that scrolls the list cancels it.
                awaitEachGesture {
                    awaitFirstDown(requireUnconsumed = false)
                    if (waitForUpOrCancellation() != null) resolve()
                }
            },
        contentAlignment = contentAlignment,
    ) {
        Text(
            text = latin,
            style = style,
            color = color,
            textAlign = textAlign,
            maxLines = maxLines,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.graphicsLayer {
                alpha = ScriptReveal.latinAlpha(showLatin, settled, latinFade.value)
            },
        )
        Text(
            text = script,
            style = scriptStyle(culture, style),
            color = color,
            textAlign = textAlign,
            maxLines = maxLines,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.graphicsLayer {
                alpha = ScriptReveal.scriptAlpha(showLatin, settled, latinFade.value)
            },
        )
    }
}

/** The script layer's face: each culture's epigraphic face; Rome keeps Cinzel at display tracking. */
private fun scriptStyle(culture: AncientCulture, base: TextStyle): TextStyle {
    val family: FontFamily = when (culture) {
        AncientCulture.EGYPT -> NotoHieroglyphs
        AncientCulture.GREECE -> GfsDidot
        AncientCulture.CANAAN -> NotoUgaritic
        AncientCulture.CARTHAGE -> NotoPhoenician
        AncientCulture.ROME -> Cinzel
    }
    return if (culture == AncientCulture.ROME) {
        base.copy(fontFamily = family, letterSpacing = TypeScale.TrackDisplay)
    } else {
        // The epigraphic faces ship one weight; asking for more would synthesise a false bold.
        base.copy(fontFamily = family, fontWeight = FontWeight.Normal, letterSpacing = 0.em)
    }
}

/** True when the system animator duration scale is 0 (Developer options or "Remove animations"). */
private fun readAnimationsOff(context: Context): Boolean =
    Settings.Global.getFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f

/**
 * The animator-scale flag, kept current by [AnimationsOffProvider]. Null where nothing
 * provides it (a preview, a test), and [ScriptName] reads the setting once instead.
 */
private val LocalAnimationsOff = staticCompositionLocalOf<State<Boolean>?> { null }

/**
 * Observes the animator duration scale once for everything below it, so a change
 * made while the app runs reaches every [ScriptName] on screen. One observer per
 * activity, never one per name; it is unregistered when this leaves the composition.
 */
@Composable
fun AnimationsOffProvider(content: @Composable () -> Unit) {
    val context = LocalContext.current
    val off = remember(context) { mutableStateOf(readAnimationsOff(context)) }
    DisposableEffect(context) {
        val resolver = context.contentResolver
        val observer = object : ContentObserver(Handler(Looper.getMainLooper())) {
            override fun onChange(selfChange: Boolean) {
                off.value = readAnimationsOff(context)
            }
        }
        resolver.registerContentObserver(
            Settings.Global.getUriFor(Settings.Global.ANIMATOR_DURATION_SCALE),
            false,
            observer,
        )
        // A change between the first read and the registration would otherwise be missed.
        off.value = readAnimationsOff(context)
        onDispose { resolver.unregisterContentObserver(observer) }
    }
    CompositionLocalProvider(LocalAnimationsOff provides off, content = content)
}

@Composable
private fun rememberAnimationsOff(): Boolean {
    if (LocalInspectionMode.current) return false
    val shared = LocalAnimationsOff.current
    if (shared != null) return shared.value
    val context = LocalContext.current
    return remember(context) { readAnimationsOff(context) }
}

@Preview
@Composable
private fun ScriptNamePreview() {
    AstraAntiquaTheme(selectedCulture = AncientCulture.EGYPT) {
        ScriptName(
            culture = AncientCulture.EGYPT,
            key = ScriptNameKey.Deity(Planet.SUN),
            intro = true,
        )
    }
}
