using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Reading;

namespace AstraAntiqua.App;

/// <summary>The week strip's rows, shared by the day and the week.</summary>
public static class Strips
{
    /// <summary>A day of the week strip: its line, its shorthand and its tone.</summary>
    public static View DayLine(WeekDay day)
    {
        var stack = Ui.Column(8);
        var toneColor = day.Tone switch
        {
            WeekTone.Tension => Ink.Conflict,
            WeekTone.Harmony => Ink.Harmony,
            _ => Ink.Dim,
        };
        var head = $"{day.Label} · {Shorthand(day.Shorthand)}";
        if (day.Flag is { } flag) head += $" · {flag}";
        stack.Add(Ui.Caption(head, color: toneColor));
        stack.Add(Ui.Prose(day.Line));
        return stack;
    }

    /// <summary>"☉ □ ♄ · EXACT", "♂ → SCO", or "QUIET", as web's week strip prints it.</summary>
    public static string Shorthand(WeekShorthand s)
    {
        var store = ContentStore.Shared;
        return s.Kind switch
        {
            ShorthandKind.Aspect =>
                $"{store.GetPlanetCopy(s.A!.Value).Symbol} {store.Banks.AspectGlyph(s.Aspect!.Value)} " +
                $"{store.GetPlanetCopy(s.B!.Value).Symbol}{(s.Exact ? " · EXACT" : "")}",
            ShorthandKind.Ingress =>
                $"{store.GetPlanetCopy(s.Planet!.Value).Symbol} \u2192 {store.Banks.SignAbbreviation(s.Sign!.Value)}",
            _ => "QUIET",
        };
    }
}
