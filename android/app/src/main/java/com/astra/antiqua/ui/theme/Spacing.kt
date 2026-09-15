package com.astra.antiqua.ui.theme

import androidx.compose.ui.unit.dp

/**
 * THE SPACING SCALE, from docs/design/system/tokens/rules.css. Eight steps,
 * the same eight web binds as --space-1 through --space-8, so a gap on one
 * surface is the same gap on the other.
 *
 * The named steps are what screens actually write, so a layout reads as
 * intent rather than arithmetic; each names the numbered step it is, and
 * there is nothing between them. A measurement that is not one of these
 * eight does not belong in a screen.
 *
 * These were 4, 8, 16, 24, 32, 48: a scale of its own that happened to look
 * like the system's. They are now the system's.
 */
object Spacing {
    val Step1 = 6.dp
    val Step2 = 12.dp
    val Step3 = 18.dp
    val Step4 = 26.dp
    val Step5 = 34.dp
    val Step6 = 44.dp
    val Step7 = 64.dp
    val Step8 = 80.dp

    /** Between a label and the thing it labels. */
    val Tight = Step1
    /** Within a row or a small cluster. */
    val Snug = Step2
    /** The default gap between siblings. */
    val Step = Step3
    /** Screen gutters. */
    val Gutter = Step4
    /** Between one section and the next. */
    val Section = Step5
    /** Around a page's major turns. */
    val Chapter = Step6
}
