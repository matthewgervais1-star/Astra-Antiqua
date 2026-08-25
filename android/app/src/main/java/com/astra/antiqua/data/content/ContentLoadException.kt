package com.astra.antiqua.data.content

/**
 * The old `OracleRepository.getDecree` wrapped its entire read-and-parse in a
 * single `catch (_: Exception)` and turned every failure into the same
 * silent `null`, so a malformed asset, a missing JSON key, and a genuine IO
 * failure (a bad build, a locked file, whatever) were indistinguishable and
 * all vanished the same way. Content loaded from the `shared/content` JSON
 * files throws one of these three instead, so callers -- and tests -- can
 * tell them apart.
 */
sealed class ContentLoadException(message: String, cause: Throwable? = null) :
    Exception(message, cause) {

    /** The asset could not be opened or read (e.g. the packaged file is missing). */
    class Io(assetName: String, cause: Throwable) :
        ContentLoadException("Failed to read \"$assetName\"", cause)

    /** The asset was read but is not valid JSON, or not shaped as expected. */
    class Malformed(assetName: String, cause: Throwable) :
        ContentLoadException("Malformed JSON in \"$assetName\"", cause)

    /** The asset parsed cleanly but has no entry for the requested key. */
    class MissingKey(assetName: String, key: String) :
        ContentLoadException("\"$assetName\" has no entry for \"$key\"")
}
