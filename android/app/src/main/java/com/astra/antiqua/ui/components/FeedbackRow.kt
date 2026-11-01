package com.astra.antiqua.ui.components

import android.content.Context
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.onClick
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import com.astra.antiqua.domain.generated.SharedStrings
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.FaintInk
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.glass.focusOutline

/** web lib/feedback.ts's key; here a SharedPreferences file of reading id to "so" or "notso". */
private const val FEEDBACK_PREFS = "astra-antiqua.feedback.v1"

/**
 * web's FeedbackRow: "AGAINST THIS WEEK → IT WAS SO · IT WAS NOT SO · KEPT ON
 * THIS DEVICE", from the shared catalog (chrome.feedback.*; [noun] is the
 * screen's `<screen>.feedback.noun`). The verdict stays on the device, as on
 * web, where it lives in localStorage; tapping the chosen verdict again clears it.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun FeedbackRow(readingId: String, noun: String, style: TextStyle, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val prefs = remember(context) { context.getSharedPreferences(FEEDBACK_PREFS, Context.MODE_PRIVATE) }
    var verdict by remember(readingId) { mutableStateOf(prefs.getString(readingId, null)) }
    val choose = { value: String ->
        val next = if (verdict == value) null else value
        prefs.edit().apply { if (next == null) remove(readingId) else putString(readingId, next) }.apply()
        verdict = next
    }
    FlowRow(modifier.selectableGroup(), horizontalArrangement = Arrangement.Center, itemVerticalAlignment = Alignment.Top) {
        Text(
            SharedStrings.fill(SharedStrings.CHROME_FEEDBACK_LEAD, mapOf("noun" to noun)) + " ",
            style = style,
            color = Dim,
            modifier = Modifier.semantics { contentDescription = "Against this ${noun.lowercase()}" },
        )
        Verdict(SharedStrings.CHROME_FEEDBACK_SO, verdict == "so", style) { choose("so") }
        Text(" · ", style = style, color = Dim)
        Verdict(SharedStrings.CHROME_FEEDBACK_NOT_SO, verdict == "notso", style) { choose("notso") }
        Text(" · ${SharedStrings.CHROME_FEEDBACK_KEPT}", style = style, color = FaintInk)
    }
}

/** One verdict: bone over a bone/40 rule; chosen, the accent over the accent rule (web rule-active). */
@Composable
private fun Verdict(label: String, chosen: Boolean, style: TextStyle, onClick: () -> Unit) {
    val accent = LocalAccent.current
    val source = remember { MutableInteractionSource() }
    val rule = if (chosen) accent else Bone.copy(alpha = 0.4f)
    Text(
        label,
        style = style,
        color = if (chosen) accent else Bone,
        modifier = Modifier
            .focusOutline(source)
            .selectable(chosen, source, indication = null, role = Role.RadioButton, onClick = onClick)
            // A radio pair the reader can clear: the chosen verdict's action says so.
            .semantics { if (chosen) onClick(label = "Clear") { onClick(); true } }
            // web's border-b with pb-[2px]: a 1 dp rule 2 under the text, inside the box.
            .drawBehind { drawRect(rule, topLeft = Offset(0f, size.height - 1.dp.toPx()), size = Size(size.width, 1.dp.toPx())) }
            .padding(bottom = 3.dp),
    )
}
