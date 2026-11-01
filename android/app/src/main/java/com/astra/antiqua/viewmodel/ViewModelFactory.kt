package com.astra.antiqua.viewmodel

import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.CreationExtras
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import com.astra.antiqua.AppContainer
import com.astra.antiqua.AstraApplication

/**
 * The one place a ViewModel is wired to the container. A screen asks for a
 * ViewModel and gets one with its dependencies already in it, so no screen
 * passes a Context into a method and no ViewModel builds a database.
 */
private fun CreationExtras.container(): AppContainer =
    (this[APPLICATION_KEY] as AstraApplication).container

val AstraViewModelFactory: ViewModelProvider.Factory = viewModelFactory {
    initializer { AppViewModel(container().settings, container().profiles) }
    initializer { LocationSearchViewModel(container().profiles, container().account, container().appScope) }
    initializer { DashboardViewModel(container().astronomy, container().profiles, container().settings, container().readings) }
    initializer { TransitsViewModel(container().astronomy, container().profiles) }
    initializer { SkyDayViewModel(container().astronomy, container().profiles) }
    initializer { SkyWeekViewModel(container().astronomy) }
    initializer { SkySeasonViewModel(container().astronomy, container().profiles) }
    initializer { SkyYearViewModel(container().astronomy, container().profiles) }
    initializer { FigureViewModel(container().astronomy, container().profiles) }
    initializer { HorizonViewModel(container().astronomy, container().settings) }
    initializer { ForecastViewModel(container().astronomy, container().profiles, container().settings) }
    initializer { SynastryViewModel(container().astronomy, container().profiles, container().settings) }
    initializer { SignInViewModel(container().account) }
    initializer {
        val container = container()
        AccountViewModel(container.account, container.profiles, exportDir = { container.exportDir })
    }
    initializer { WaitListViewModel(container().account) }
}
