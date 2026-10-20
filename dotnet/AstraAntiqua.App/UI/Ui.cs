using Microsoft.Maui.Controls.Shapes;

namespace AstraAntiqua.App;

/// <summary>
/// The component vocabulary every page is built from, the same pieces the
/// web and Android surfaces use: a nave head (mono kicker over a display
/// headline), a section divider, prose, a mono caption, a row with a 1px
/// rule, and a flat panel.
/// </summary>
public static class Ui
{
    public const double Gutter = 20;
    public const double Chapter = 32;

    public static Label Kicker(string text, Color? color = null) => new()
    {
        Text = text.ToUpperInvariant(),
        FontFamily = Ink.Mono,
        FontSize = 11,
        CharacterSpacing = 1.5,
        TextColor = color ?? Ink.Accent(),
        HorizontalTextAlignment = TextAlignment.Center,
    };

    public static Label Headline(string text, double size = 26) => new()
    {
        Text = text,
        FontFamily = Ink.Display,
        FontSize = size,
        TextColor = Ink.Bone,
        HorizontalTextAlignment = TextAlignment.Center,
        LineBreakMode = LineBreakMode.WordWrap,
    };

    /// <summary>A mono kicker over a display headline, with an optional sub line.</summary>
    public static View NaveHead(string kicker, string headline, string? sub = null, View? emblem = null)
    {
        var stack = new VerticalStackLayout
        {
            Spacing = 8,
            Padding = new Thickness(Gutter, Chapter, Gutter, 16),
        };
        if (emblem is not null)
        {
            emblem.HorizontalOptions = LayoutOptions.Center;
            stack.Add(emblem);
        }
        stack.Add(Kicker(kicker));
        stack.Add(Headline(headline));
        if (sub is not null) stack.Add(Caption(sub, center: true));
        return stack;
    }

    public static Label Prose(string text, bool italic = false, Color? color = null) => new()
    {
        Text = text,
        FontFamily = italic ? Ink.ProseItalic : Ink.Prose,
        FontSize = 17,
        LineHeight = 1.35,
        TextColor = color ?? Ink.ProseInk,
        LineBreakMode = LineBreakMode.WordWrap,
    };

    public static Label Caption(string text, bool center = false, Color? color = null) => new()
    {
        Text = text.ToUpperInvariant(),
        FontFamily = Ink.Mono,
        FontSize = 10.5,
        CharacterSpacing = 1.1,
        TextColor = color ?? Ink.Dim,
        LineBreakMode = LineBreakMode.WordWrap,
        HorizontalTextAlignment = center ? TextAlignment.Center : TextAlignment.Start,
    };

    public static Label Title(string text, double size = 19, Color? color = null) => new()
    {
        Text = text,
        FontFamily = Ink.Display,
        FontSize = size,
        TextColor = color ?? Ink.Bone,
        LineBreakMode = LineBreakMode.WordWrap,
    };

    /// <summary>A 1px rule.</summary>
    public static BoxView Rule(bool row = false) => new()
    {
        HeightRequest = 1,
        Color = row ? Ink.RuleRow : Ink.Rule,
        HorizontalOptions = LayoutOptions.Fill,
    };

    /// <summary>A rule with a caption set into it.</summary>
    public static View Divider(string label)
    {
        var grid = new Grid
        {
            ColumnDefinitions =
            {
                new ColumnDefinition(GridLength.Star),
                new ColumnDefinition(GridLength.Auto),
                new ColumnDefinition(GridLength.Star),
            },
            ColumnSpacing = 12,
            Padding = new Thickness(Gutter, 24, Gutter, 12),
        };
        var left = Rule();
        left.VerticalOptions = LayoutOptions.Center;
        var right = Rule();
        right.VerticalOptions = LayoutOptions.Center;
        var caption = Caption(label);
        caption.TextColor = Ink.Accent();
        grid.Add(left, 0);
        grid.Add(caption, 1);
        grid.Add(right, 2);
        return grid;
    }

    /// <summary>A flat panel with a 1px border, the only container the identity allows.</summary>
    public static Border Panel(View content, Color? border = null) => new()
    {
        Content = content,
        Stroke = new SolidColorBrush(border ?? Ink.Rule),
        StrokeThickness = 1,
        StrokeShape = new Rectangle(),
        BackgroundColor = Colors.Transparent,
        Padding = new Thickness(16),
        Margin = new Thickness(Gutter, 8),
    };

    /// <summary>A tappable row closed by a 1px rule.</summary>
    public static View Row(View content, Func<Task>? onTap = null)
    {
        var stack = new VerticalStackLayout { Spacing = 0 };
        var body = new ContentView { Content = content, Padding = new Thickness(Gutter, 14) };
        stack.Add(body);
        var rule = Rule(row: true);
        rule.Margin = new Thickness(Gutter, 0);
        stack.Add(rule);
        if (onTap is not null)
        {
            var tap = new TapGestureRecognizer();
            tap.Tapped += (_, _) => Guarded(stack, onTap);
            stack.GestureRecognizers.Add(tap);
        }
        return stack;
    }

    /// <summary>A plain text button in the accent: no fill, a 1px frame.</summary>
    public static Button Action(string text, Func<Task> onClick, bool destructive = false)
    {
        var color = destructive ? Ink.Conflict : Ink.Accent();
        var button = new Button
        {
            Text = text.ToUpperInvariant(),
            FontFamily = Ink.MonoStrong,
            FontSize = 12,
            CharacterSpacing = 1.4,
            TextColor = color,
            BackgroundColor = Colors.Transparent,
            BorderColor = color,
            BorderWidth = 1,
            CornerRadius = 0,
            Padding = new Thickness(18, 12),
            Margin = new Thickness(Gutter, 8),
        };
        button.Clicked += (_, _) => Guarded(button, onClick);
        return button;
    }

    private static readonly HashSet<object> Busy = new();

    /// <summary>
    /// Runs a tap's action once at a time per control (a double tap does not
    /// run it twice), and turns a failure into a line on screen rather than
    /// an unhandled exception in an event handler, which would end the app.
    /// </summary>
    public static async void Guarded(View source, Func<Task> action)
    {
        if (!Busy.Add(source)) return;
        try
        {
            await action();
        }
        catch (Exception e)
        {
            ShowFailure(source, e);
        }
        finally
        {
            Busy.Remove(source);
        }
    }

    /// <summary>Puts a failure on the nearest layout above the control.</summary>
    public static void ShowFailure(Element source, Exception e)
    {
        for (var parent = source.Parent; parent is not null; parent = parent.Parent)
        {
            if (parent is VerticalStackLayout layout)
            {
                layout.Add(Failure(e));
                return;
            }
        }
    }

    /// <summary>The panel a failed reading or action shows in its place.</summary>
    public static View Failure(Exception e)
    {
        var text = Column(6);
        text.Add(Caption("This could not be read", color: Ink.Conflict));
        text.Add(Prose(e.Message, color: Ink.Dim));
        return Panel(text, Ink.Conflict);
    }

    /// <summary>The page every screen sits on: the culture's ground, scrolling.</summary>
    public static ContentPage Page(string title, View content) => Dress(new ContentPage(), title, content);

    public static T Dress<T>(T page, string title, View content) where T : ContentPage
    {
        page.Title = title;
        page.BackgroundColor = Ink.Ground();
        page.Content = new ScrollView { Content = content };
        return page;
    }

    /// <summary>A placeholder line while the sky is computed off the main thread.</summary>
    public static View Working(string text)
    {
        var stack = new VerticalStackLayout { Spacing = 12, Padding = new Thickness(Gutter, Chapter) };
        stack.Add(new ActivityIndicator { IsRunning = true, Color = Ink.Accent(), HorizontalOptions = LayoutOptions.Center });
        stack.Add(Caption(text, center: true));
        return stack;
    }

    /// <summary>A body's ten-glyph symbol (☉ ☽ ☿ …) in the symbols face.</summary>
    public static Label Symbol(string glyph, double size = 18, Color? color = null) => new()
    {
        Text = glyph,
        FontFamily = Ink.Symbols,
        FontSize = size,
        TextColor = color ?? Ink.Accent(),
        VerticalTextAlignment = TextAlignment.Center,
        HorizontalTextAlignment = TextAlignment.Center,
    };

    public static VerticalStackLayout Column(double spacing = 0) => new() { Spacing = spacing };

    public static Thickness Inset => new(Gutter, 4);
}
