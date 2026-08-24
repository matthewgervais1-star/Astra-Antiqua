using AstraAntiqua.Core.Model;

namespace AstraAntiqua.Core.Charting;

/// <summary>
/// Whole-sign houses (port of web/src/lib/houses.ts): the entire sign rising
/// on the eastern horizon is the 1st house; each following sign is the next
/// house in order. Cusps fall on 0 degrees of each sign, so a planet's house
/// depends only on its sign relative to the Ascendant's sign.
/// </summary>
public static class WholeSignHouses
{
    /// <summary>Houses 1..12 in order, from the Ascendant longitude.</summary>
    public static IReadOnlyList<(int House, ZodiacSign Sign)> FromAscendant(double ascendantLongitude)
    {
        var (ascSign, _) = ZodiacMath.LongitudeToSign(ascendantLongitude);
        var ascIndex = (int)ascSign;
        var houses = new (int, ZodiacSign)[12];
        for (var h = 0; h < 12; h++)
            houses[h] = (h + 1, (ZodiacSign)((ascIndex + h) % 12));
        return houses;
    }

    /// <summary>The whole-sign house (1..12) a given sign falls in.</summary>
    public static int HouseOfSign(ZodiacSign sign, int ascSignIndex)
        => (((int)sign - ascSignIndex + 12) % 12) + 1;

    /// <summary>The whole-sign house (1..12) a given ecliptic longitude falls in.</summary>
    public static int HouseOfLongitude(double longitude, int ascSignIndex)
        => HouseOfSign(ZodiacMath.LongitudeToSign(longitude).Sign, ascSignIndex);
}
