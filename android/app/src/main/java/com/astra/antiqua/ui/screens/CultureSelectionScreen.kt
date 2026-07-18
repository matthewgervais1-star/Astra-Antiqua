package com.astra.antiqua.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.astra.antiqua.ui.components.GlassCard

@Composable
fun CultureSelectionScreen(
    onCultureSelected: (String) -> Unit
) {
    val cultures = listOf("Egypt", "Greece", "Canaan", "Carthage", "Rome")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(horizontal = 32.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "CHOOSE YOUR PANTHEON",
            style = MaterialTheme.typography.displaySmall.copy(
                fontFamily = MaterialTheme.typography.displayLarge.fontFamily,
                letterSpacing = 3.sp
            ),
            color = androidx.compose.ui.graphics.Color.White,
            modifier = Modifier.padding(bottom = 48.dp)
        )

        LazyColumn {
            items(cultures) { culture ->
                GlassCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp)
                        .clickable { onCultureSelected(culture) }
                ) {
                    Text(
                        text = culture.uppercase(),
                        style = MaterialTheme.typography.headlineSmall.copy(
                            fontFamily = MaterialTheme.typography.displayLarge.fontFamily,
                            letterSpacing = 2.sp
                        ),
                        color = com.astra.antiqua.ui.theme.Gold
                    )
                }
            }
        }
    }
}
