package com.astra.antiqua.ui.components

import androidx.annotation.DrawableRes
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.astra.antiqua.R
import com.astra.antiqua.ui.brand.TypesetSign
import com.astra.antiqua.ui.brand.typesetSign
import com.astra.antiqua.ui.theme.Bone

/**
 * A mark a tile can hold, from docs/design/system/readme.md, Iconography.
 *
 * Three exist as encoded characters and were cut from their faces to
 * outlines; three only ever existed as objects and were traced from a source
 * photograph. The traced three are alpha masks: one file takes any ink,
 * because tinting replaces the colour and leaves the alpha alone, which is
 * the same trick mask-image does on the web surface.
 */
sealed interface TileMark {
    val markName: String
    val caption: String

    /** A sign palaeographers drew from the record, carried here as an outline. */
    data class Sign(val sign: TypesetSign) : TileMark {
        override val markName: String get() = sign.markName
        override val caption: String get() = "${sign.markName} · ${sign.codepoints}"
    }

    /** A figure traced from a photograph, held as an alpha mask. */
    data class Traced(
        @DrawableRes val resource: Int,
        override val markName: String,
        val source: String,
    ) : TileMark {
        override val caption: String get() = "$markName · $source"
    }
}

/** The three traced marks the design system ships, with their sources. */
object TracedMarks {
    val SHEWOLF = TileMark.Traced(
        R.drawable.mark_shewolf,
        "The she-wolf",
        "Capitoline bronze",
    )
    val AUGUSTUS = TileMark.Traced(
        R.drawable.mark_augustus,
        "Augustus",
        "Prima Porta",
    )
    val BAAL_STELE = TileMark.Traced(
        R.drawable.mark_baal_stele,
        "The Baal stele",
        "Louvre AO 15775",
    )
}

/** --tile-sm, --tile-md and --tile-lg from tokens/rules.css. */
enum class TileSize(val px: Dp) {
    SMALL(48.dp),
    MEDIUM(150.dp),
    LARGE(170.dp),
}

/**
 * A square tile holding one mark
 * (docs/design/system/components/specs/IconTile.prompt.md).
 *
 * The design notes put the traced figures at tier 2 and editorial only: a
 * figure at launcher size says "five civilisations" where the set needs to
 * say "five ways of reading the sky". Nothing here may be used as an icon.
 */
@Composable
fun IconTile(
    mark: TileMark,
    modifier: Modifier = Modifier,
    size: TileSize = TileSize.MEDIUM,
    ink: Color = Bone,
    decorative: Boolean = true,
) {
    // The share of the tile the mark takes: 0.62 for a single sign and 0.8 for
    // a traced figure, the proportions the guideline cards are drawn at.
    val scale = when (mark) {
        is TileMark.Sign -> if (mark.sign == TypesetSign.IL) SIGN_PAIR else SIGN_SINGLE
        is TileMark.Traced -> TRACED
    }
    val inner = size.px * scale

    Box(
        modifier = modifier
            .size(size.px)
            .then(
                if (decorative) {
                    Modifier
                } else {
                    Modifier.semantics { contentDescription = mark.markName }
                }
            ),
        contentAlignment = Alignment.Center,
    ) {
        when (mark) {
            is TileMark.Sign -> Icon(
                imageVector = typesetSign(mark.sign),
                contentDescription = null,
                modifier = Modifier.size(inner),
                tint = ink,
            )

            is TileMark.Traced -> Image(
                painter = painterResource(mark.resource),
                contentDescription = null,
                modifier = Modifier.size(inner),
                // The PNG's alpha is the shape. Tinting swaps the colour and
                // leaves the alpha, so one file serves every ink.
                colorFilter = ColorFilter.tint(ink),
            )
        }
    }
}

/** One glyph in a square tile. */
private const val SIGN_SINGLE = 0.62f

/** Two glyphs on one line, as the Ugaritic pair is. */
private const val SIGN_PAIR = 0.44f

/** 77 of 96, the proportion guidelines/marks-traced.html draws them at. */
private const val TRACED = 0.8f
