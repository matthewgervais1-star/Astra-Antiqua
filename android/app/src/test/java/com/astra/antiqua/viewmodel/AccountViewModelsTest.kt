package com.astra.antiqua.viewmodel

import com.astra.antiqua.data.account.AccountError
import com.astra.antiqua.data.account.AccountExport
import com.astra.antiqua.data.account.RemoteChart
import com.astra.antiqua.data.account.SyncOutcome
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.AppPhase
import java.io.File
import java.nio.file.Files
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

/**
 * THE RECORD, ACCOUNT and THE ROLL against [FakeAccount], and the profile
 * save's mirror to the account.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class AccountViewModelsTest {
    private val dispatcher = StandardTestDispatcher()
    private val exportDir: File = Files.createTempDirectory("export").toFile()

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() {
        Dispatchers.resetMain()
        exportDir.deleteRecursively()
    }

    private val rome = Place("Rome, Italy", "Rome", 41.9028, 12.4964, offline = true)

    // THE RECORD

    @Test
    fun `sign-in success syncs and navigates`() = runTest(dispatcher) {
        val profiles = FakeProfiles(romeProfile())
        val account = FakeAccount(profiles)
        val model = SignInViewModel(account)

        model.submit("livia@example.com", "correct horse")
        advanceUntilIdle()

        assertEquals(listOf("signIn", "syncAfterSignIn", "putChart"), account.calls)
        assertTrue(account.signedIn())
        assertTrue(model.state.value.signedIn)
        assertEquals(SyncOutcome.DEVICE_CHART_UPLOADED, model.state.value.sync)
        assertNull(model.state.value.notice)
    }

    @Test
    fun `sign-in takes the server chart when the server has one`() = runTest(dispatcher) {
        val profiles = FakeProfiles(romeProfile())
        val account = FakeAccount(
            profiles,
            serverChart = RemoteChart("c-9", "Livia", "1985-03-02", "06:15", "Athens", 37.98, 23.73, "2026-01-01T00:00:00.000Z"),
        )
        val model = SignInViewModel(account)

        model.submit("livia@example.com", "correct horse")
        advanceUntilIdle()

        assertEquals(SyncOutcome.SERVER_CHART_KEPT, model.state.value.sync)
        assertEquals("Athens", profiles.stored()?.cityName)
        assertFalse("putChart" in account.calls)
    }

    @Test
    fun `a wrong password shows the server's error and keeps any session`() = runTest(dispatcher) {
        val account = FakeAccount(
            signedIn = true,
            failWith = AccountError.Server(401, "Email or password is incorrect."),
        )
        val model = SignInViewModel(account)

        model.submit("livia@example.com", "wrong")
        advanceUntilIdle()

        assertEquals(AccountNotice.Server("Email or password is incorrect."), model.state.value.notice)
        assertFalse(model.state.value.signedIn)
        assertFalse(model.state.value.submitting)
        assertTrue(account.signedIn())
        assertEquals(listOf("signIn"), account.calls)
    }

    @Test
    fun `a first entry with an existing email shows the server's error`() = runTest(dispatcher) {
        val account = FakeAccount(failWith = AccountError.Server(400, "An account with this email already exists."))
        val model = SignInViewModel(account)
        model.setMode(RecordMode.FIRST_ENTRY)

        model.submit("livia@example.com", "long enough", confirm = "long enough", displayName = "Livia")
        advanceUntilIdle()

        assertEquals(AccountNotice.Server("An account with this email already exists."), model.state.value.notice)
        assertFalse(model.state.value.signedIn)
        assertFalse(account.signedIn())
        assertEquals(listOf("signUp"), account.calls)
    }

    @Test
    fun `a first entry whose passwords differ calls nothing`() = runTest(dispatcher) {
        val account = FakeAccount()
        val model = SignInViewModel(account)
        model.setMode(RecordMode.FIRST_ENTRY)

        model.submit("livia@example.com", "long enough", confirm = "long enougj")
        advanceUntilIdle()

        assertEquals(AccountNotice.PasswordsDisagree, model.state.value.notice)
        assertTrue(account.calls.isEmpty())
    }

    @Test
    fun `a first entry signs up, syncs and navigates`() = runTest(dispatcher) {
        val account = FakeAccount(FakeProfiles(romeProfile()))
        val model = SignInViewModel(account)
        model.setMode(RecordMode.FIRST_ENTRY)

        model.submit("livia@example.com", "long enough", confirm = "long enough")
        advanceUntilIdle()

        assertEquals(listOf("signUp", "syncAfterSignIn", "putChart"), account.calls)
        assertTrue(model.state.value.signedIn)
    }

    @Test
    fun `a session the device cannot keep is a device-write notice`() = runTest(dispatcher) {
        val account = FakeAccount(failWith = AccountError.DeviceWriteFailed)
        val model = SignInViewModel(account)

        model.submit("livia@example.com", "correct horse")
        advanceUntilIdle()

        assertEquals(AccountNotice.DeviceWriteFailed, model.state.value.notice)
        assertFalse(model.state.value.signedIn)
    }

    // ACCOUNT

    private fun accountModel(account: FakeAccount, profiles: FakeProfiles) =
        AccountViewModel(account, profiles, exportDir = { exportDir }, io = dispatcher)

    @Test
    fun `the ledger shows the email and the device chart`() = runTest(dispatcher) {
        val profiles = FakeProfiles(romeProfile())
        val model = accountModel(FakeAccount(profiles, signedIn = true), profiles)
        advanceUntilIdle()

        assertEquals(AccountPhase.READY, model.state.value.phase)
        assertEquals("livia@example.com", model.state.value.email)
        assertTrue(model.state.value.hasChart)
    }

    @Test
    fun `signed out, the account sends the reader to the record`() = runTest(dispatcher) {
        val profiles = FakeProfiles()
        val model = accountModel(FakeAccount(profiles, signedIn = false), profiles)
        advanceUntilIdle()

        assertEquals(AccountPhase.SIGNED_OUT, model.state.value.phase)
    }

    @Test
    fun `sign-out keeps the profile`() = runTest(dispatcher) {
        val profiles = FakeProfiles(romeProfile())
        val account = FakeAccount(profiles, signedIn = true)
        val model = accountModel(account, profiles)
        advanceUntilIdle()

        model.signOut()
        advanceUntilIdle()

        assertEquals(AccountExit.SIGNED_OUT, model.state.value.exit)
        assertFalse(account.signedIn())
        assertEquals(romeProfile(), profiles.stored())
        assertEquals(0, profiles.saveCount)
    }

    @Test
    fun `the strike requires the exact email, then returns to culture selection`() = runTest(dispatcher) {
        val profiles = FakeProfiles(romeProfile())
        val account = FakeAccount(profiles, signedIn = true)
        val model = accountModel(account, profiles)
        advanceUntilIdle()

        assertFalse(model.canStrike("livia@example.co"))
        model.strike("livia@example.co")
        advanceUntilIdle()
        assertFalse("strike" in account.calls)
        assertNull(model.state.value.exit)

        // Web compares trimmed and in any case.
        assertTrue(model.canStrike("  LIVIA@example.com "))
        model.strike("  LIVIA@example.com ")
        advanceUntilIdle()

        assertTrue("strike" in account.calls)
        assertEquals(AccountExit.STRUCK, model.state.value.exit)
        assertNull(model.state.value.notice)
        assertFalse(account.signedIn())
        assertEquals(romeProfile(), profiles.stored())

        // The app's half: back to culture selection, and the kept chart
        // skips the birth form once a culture is chosen.
        val settings = FakeSettings(AncientCulture.ROME, onboardingCompleted = true)
        val app = AppViewModel(settings, profiles)
        app.start()
        advanceUntilIdle()
        app.returnToCultureSelection()
        assertEquals(AppPhase.CULTURE_SELECTION, app.currentPhase.value)
        app.selectCulture(AncientCulture.EGYPT)
        advanceUntilIdle()
        assertEquals(AppPhase.MAIN_DASHBOARD, app.currentPhase.value)
    }

    @Test
    fun `a refused strike shows the server's error and stays`() = runTest(dispatcher) {
        val profiles = FakeProfiles(romeProfile())
        val account = FakeAccount(profiles, signedIn = true)
        val model = accountModel(account, profiles)
        advanceUntilIdle()

        account.failWith = AccountError.Server(500, "Could not delete the account.")
        model.strike("livia@example.com")
        advanceUntilIdle()

        assertNull(model.state.value.exit)
        assertEquals(AccountNotice.Server("Could not delete the account."), model.state.value.notice)
        assertTrue(account.signedIn())
    }

    @Test
    fun `a used exit starts over, so a restored screen does not leave again`() = runTest(dispatcher) {
        val profiles = FakeProfiles(romeProfile())
        val account = FakeAccount(profiles, signedIn = true)
        val model = accountModel(account, profiles)
        advanceUntilIdle()
        model.signOut()
        advanceUntilIdle()

        model.consumeExit()
        advanceUntilIdle()

        assertNull(model.state.value.exit)
        assertEquals(AccountPhase.SIGNED_OUT, model.state.value.phase)
    }

    @Test
    fun `export produces a file`() = runTest(dispatcher) {
        val profiles = FakeProfiles(romeProfile())
        val account = FakeAccount(profiles, signedIn = true)
        account.lastExport = AccountExport("""{"user":{"email":"livia@example.com"},"chart":null}""", "astra-antiqua-data.json")
        File(exportDir, "old.json").writeText("{}")
        val model = accountModel(account, profiles)
        advanceUntilIdle()

        model.export()
        advanceUntilIdle()

        val file = model.state.value.exportFile
        assertNotNull(file)
        assertEquals("astra-antiqua-data.json", file!!.name)
        assertEquals(exportDir, file.parentFile)
        assertEquals("""{"user":{"email":"livia@example.com"},"chart":null}""", file.readText())
        // One export at most in the cache.
        assertEquals(listOf("astra-antiqua-data.json"), exportDir.list()!!.toList())

        model.consumeExport()
        assertNull(model.state.value.exportFile)
    }

    @Test
    fun `an export name from the server cannot leave the export directory`() = runTest(dispatcher) {
        val profiles = FakeProfiles()
        val account = FakeAccount(profiles, signedIn = true)
        account.lastExport = AccountExport("{}", "../../evil")
        val model = accountModel(account, profiles)
        advanceUntilIdle()

        model.export()
        advanceUntilIdle()

        val file = model.state.value.exportFile!!
        assertEquals(exportDir, file.parentFile)
        assertTrue(file.name.endsWith(".json"))
        assertFalse(file.name.contains(".."))
    }

    @Test
    fun `an export the device cannot write says so`() = runTest(dispatcher) {
        val profiles = FakeProfiles()
        val account = FakeAccount(profiles, signedIn = true)
        val blocked = File(exportDir, "blocked").apply { writeText("a file where the directory should be") }
        val model = AccountViewModel(account, profiles, exportDir = { blocked }, io = dispatcher)
        advanceUntilIdle()

        model.export()
        advanceUntilIdle()

        assertNull(model.state.value.exportFile)
        assertEquals(AccountNotice.ExportNotWritten, model.state.value.notice)
    }

    // THE ROLL

    @Test
    fun `the wait list shows the position`() = runTest(dispatcher) {
        val account = FakeAccount(waitListPosition = 12)
        val model = WaitListViewModel(account)

        model.submit("scribe@example.com")
        advanceUntilIdle()

        assertEquals(12, model.state.value.position)
        assertEquals("12TH", rollOrdinal(model.state.value.position!!))
        assertNull(model.state.value.notice)
    }

    @Test
    fun `the wait list shows the field's own error`() = runTest(dispatcher) {
        val account = FakeAccount(
            failWith = AccountError.Server(400, "Invalid input.", mapOf("email" to listOf("Enter a valid email address."))),
        )
        val model = WaitListViewModel(account)

        model.submit("not an email")
        advanceUntilIdle()

        assertNull(model.state.value.position)
        assertEquals(AccountNotice.Server("Enter a valid email address."), model.state.value.notice)
    }

    @Test
    fun `ordinals follow web's rule, teens included`() {
        assertEquals(
            listOf("1ST", "2ND", "3RD", "4TH", "11TH", "12TH", "13TH", "21ST", "22ND", "101ST", "111TH"),
            listOf(1, 2, 3, 4, 11, 12, 13, 21, 22, 101, 111).map(::rollOrdinal),
        )
    }

    // The profile save's mirror

    @Test
    fun `a profile save while signed in PUTs the chart`() = runTest(dispatcher) {
        val profiles = FakeProfiles()
        val account = FakeAccount(profiles, signedIn = true)
        val model = LocationSearchViewModel(profiles, account)
        var saved = false

        model.saveProfile("Livia", ROME_BIRTH_UTC_MS, "Europe/Rome", rome, "1990-06-15", "14:30") { saved = true }
        advanceUntilIdle()

        assertTrue(saved)
        assertEquals(listOf("putChart"), account.calls)
        assertEquals(profiles.stored(), account.uploaded)
        assertEquals("14:30", account.serverChart?.time)
    }

    @Test
    fun `a profile save while signed out sends nothing`() = runTest(dispatcher) {
        val profiles = FakeProfiles()
        val account = FakeAccount(profiles, signedIn = false)
        val model = LocationSearchViewModel(profiles, account)

        model.saveProfile("Livia", ROME_BIRTH_UTC_MS, "Europe/Rome", rome) {}
        advanceUntilIdle()

        assertTrue(account.calls.isEmpty())
        assertNotNull(profiles.stored())
    }

    @Test
    fun `a failed PUT does not block the save`() = runTest(dispatcher) {
        val profiles = FakeProfiles()
        val account = FakeAccount(profiles, signedIn = true, failWith = AccountError.Unreachable)
        val model = LocationSearchViewModel(profiles, account)
        var saved = false

        model.saveProfile("Livia", ROME_BIRTH_UTC_MS, "Europe/Rome", rome) { saved = true }
        advanceUntilIdle()

        assertTrue(saved)
        assertEquals(1, profiles.saveCount)
        assertEquals("Rome", profiles.stored()?.cityName)
        assertEquals(listOf("putChart"), account.calls)
        assertTrue(account.signedIn())
    }
}
