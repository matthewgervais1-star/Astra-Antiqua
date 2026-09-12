package com.astra.antiqua.ui

import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import com.astra.antiqua.model.AncientCulture

/**
 * The home screen icon follows the chosen culture.
 *
 * AndroidManifest.xml declares one activity-alias per culture plus a neutral
 * one, all targeting MainActivity, all but neutral disabled. Enabling exactly
 * one and disabling the rest is what swaps the icon, so this is the single
 * place that does it and the culture setter is its only caller.
 *
 * Two things to expect on a device. A launcher may take a moment to redraw
 * after the change, and some launchers cache the icon until the home screen
 * is reloaded, so an icon that has not changed yet is not evidence that the
 * alias did not switch. DONT_KILL_APP keeps the process alive through the
 * change, which is why the reader stays on the screen they were on.
 */
object LauncherIcon {

    private const val NEUTRAL = ".Launcher"

    private fun aliasFor(culture: AncientCulture?): String = when (culture) {
        AncientCulture.EGYPT -> ".LauncherEgypt"
        AncientCulture.GREECE -> ".LauncherGreece"
        AncientCulture.CANAAN -> ".LauncherCanaan"
        AncientCulture.CARTHAGE -> ".LauncherCarthage"
        AncientCulture.ROME -> ".LauncherRome"
        null -> NEUTRAL
    }

    private val allAliases: List<String> =
        listOf(NEUTRAL) + AncientCulture.entries.map { aliasFor(it) }

    /**
     * Enables [culture]'s launcher alias and disables the others. A null
     * culture restores the neutral icon. Enabling first and disabling after
     * means the app never has zero enabled entries, which is what makes a
     * launcher drop the icon rather than replace it.
     */
    fun applyLauncherIcon(context: Context, culture: AncientCulture?) {
        val packageManager = context.packageManager
        val packageName = context.packageName
        val wanted = aliasFor(culture)

        setState(packageManager, packageName, wanted, enabled = true)
        for (alias in allAliases) {
            if (alias != wanted) setState(packageManager, packageName, alias, enabled = false)
        }
    }

    private fun setState(
        packageManager: PackageManager,
        packageName: String,
        alias: String,
        enabled: Boolean,
    ) {
        val component = ComponentName(packageName, packageName + alias)
        val state = if (enabled) {
            PackageManager.COMPONENT_ENABLED_STATE_ENABLED
        } else {
            PackageManager.COMPONENT_ENABLED_STATE_DISABLED
        }
        if (packageManager.getComponentEnabledSetting(component) == state) return
        packageManager.setComponentEnabledSetting(component, state, PackageManager.DONT_KILL_APP)
    }
}
