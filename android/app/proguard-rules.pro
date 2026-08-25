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
# build time. Keep the generated serializer machinery for our model package.
#
# PlacementContentStore decodes planet-in-sign.json into a plain
# Map<String, Map<String, String>> (built-in kotlinx.serialization
# collection/String serializers, no project @Serializable class of our own),
# so there is no per-class keep rule to carry for it the way the retired
# OracleContent/CultureSyncretism pair needed.
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**

-keepclassmembers class com.astra.antiqua.** {
    *** Companion;
}
-keepclasseswithmembers class com.astra.antiqua.** {
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class com.astra.antiqua.**$$serializer { *; }

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
