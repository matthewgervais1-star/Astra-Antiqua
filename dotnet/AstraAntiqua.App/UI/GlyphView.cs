using AstraAntiqua.Core.Content;
using AstraAntiqua.Core.Model;
using Microsoft.Maui.Graphics;

namespace AstraAntiqua.App;

/// <summary>
/// Draws a deity glyph from shared/content/glyphs.json: the designer's own
/// paths on the 24-unit grid they were drawn on, each with its own stroke
/// width, cap and join. The canvas is scaled as a whole, so stroke widths
/// scale with the drawing exactly as the SVG's do.
/// </summary>
public sealed class GlyphView : GraphicsView
{
    public GlyphView(Culture culture, Planet planet, double size = 32, Color? tint = null)
    {
        WidthRequest = size;
        HeightRequest = size;
        BackgroundColor = Colors.Transparent;
        Drawable = new GlyphDrawable(ContentStore.Shared.GetGlyph(culture, planet), tint ?? Ink.Bone, (float)size);
    }

    private sealed class GlyphDrawable : IDrawable
    {
        private readonly DeityGlyph _glyph;
        private readonly Color _tint;
        private readonly IReadOnlyList<(PathF Path, GlyphPath Spec)> _paths;
        private readonly float _size;

        public GlyphDrawable(DeityGlyph glyph, Color tint, float size)
        {
            _glyph = glyph;
            _tint = tint;
            _size = size;
            _paths = glyph.Paths.Select(p => (PathBuilder.Build(p.Data), p)).ToList();
        }

        public void Draw(ICanvas canvas, RectF dirtyRect)
        {
            // The view's own size, not dirtyRect: UIKit may redraw only part of it.
            var scale = _size / 24f;
            canvas.SaveState();
            canvas.Scale(scale, scale);
            foreach (var (path, spec) in _paths)
            {
                if (spec.Fill)
                {
                    canvas.FillColor = _tint;
                    canvas.FillPath(path);
                }
                if (spec.Stroke)
                {
                    canvas.StrokeColor = _tint;
                    canvas.StrokeSize = (float)spec.StrokeWidth;
                    canvas.StrokeLineCap = spec.LineCap switch
                    {
                        "round" => LineCap.Round,
                        "square" => LineCap.Square,
                        _ => LineCap.Butt,
                    };
                    canvas.StrokeLineJoin = spec.LineJoin switch
                    {
                        "round" => LineJoin.Round,
                        "bevel" => LineJoin.Bevel,
                        _ => LineJoin.Miter,
                    };
                    canvas.DrawPath(path);
                }
            }
            canvas.RestoreState();
        }
    }
}
