# R8 rules for the release build.
#
# Most libraries here ship their own consumer rules (AGP merges them in
# automatically), so this file carries only what is genuinely ours or not
# covered upstream. Each block says why it exists, because an unexplained keep
# rule is impossible to retire safely later.

# ---------------------------------------------------------------------------
# kotlinx.serialization
#
# The library ships consumer rules, but they cannot see OUR @Serializable
# classes. R8 strips the synthetic Companion and $serializer members it cannot
# prove are used, and the failure is at runtime on the first decode, not at
# build time: the oracle decree asset parses to nothing and the card silently
# disappears. Keep the generated serializer machinery for our model package.
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**

-keepclassmembers class com.astra.antiqua.** {
    *** Companion;
}
-keepclasseswithmembers class com.astra.antiqua.** {
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class com.astra.antiqua.**$$serializer { *; }

# The decree asset deserializes into these; their field names are the JSON
# contract, so they must not be renamed.
-keep class com.astra.antiqua.domain.OracleContent { *; }
-keep class com.astra.antiqua.domain.CultureSyncretism { *; }

# ---------------------------------------------------------------------------
# Room
#
# Room's own consumer rules cover the generated _Impl classes. Entities are
# kept here because their column names are the schema contract.
-keep class com.astra.antiqua.data.local.room.UserProfile { *; }

# ---------------------------------------------------------------------------
# Astronomy engine (com.github.cosinekitty:astronomy)
#
# A plain computational library with no reflection, so it needs no keep rules.
# Recorded here so the next person does not have to re-derive that.

# ---------------------------------------------------------------------------
# Enums crossing the serialization and persistence boundaries keep their
# valueOf/values, which R8 otherwise removes when it sees no direct call.
-keepclassmembers enum com.astra.antiqua.** {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
