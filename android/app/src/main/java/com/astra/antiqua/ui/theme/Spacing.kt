package com.astra.antiqua.ui.theme

import androidx.compose.ui.unit.dp

/**
 * One spacing scale, so measurements stop being invented per call site.
 * Named for use, not size, so a screen reads as intent.
 */
object Spacing {
    /** Between a label and the thing it labels. */
    val Tight = 4.dp
    /** Within a row or a small cluster. */
    val Snug = 8.dp
    /** The default gap between siblings. */
    val Step = 16.dp
    /** Screen gutters. */
    val Gutter = 24.dp
    /** Between one section and the next. */
    val Section = 32.dp
    /** Around a page's major turns. */
    val Chapter = 48.dp
}
