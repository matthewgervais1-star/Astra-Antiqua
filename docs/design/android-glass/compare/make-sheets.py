import sys
from PIL import Image, ImageDraw, ImageFont

src, dst, font_path = sys.argv[1], sys.argv[2], sys.argv[3]
cols = [('kyant-13', 'KYANT · ANDROID 13+ (12: SAME)'), ('haze-13', 'HAZE · ANDROID 13+ (12: SAME)'), ('tint', 'BOTH · ANDROID 8 TO 11 (TINT .90)')]
frames = [('rest', 'AT REST'), ('scrolled', 'SCROLLED 420'), ('bright', 'SCROLLED 420, SOLID BONE UNDER THE GLASS')]
contrast = {}
for line in open(src + '/contrast.txt', encoding='utf-8'):
    p = line.split()
    contrast[(p[0], p[1])] = (p[3], p[4].strip('()'))
D = 3  # px per dp
BG = (12, 11, 9)
INK = (230, 222, 204)
DIM = (154, 145, 125)
font = ImageFont.truetype(font_path, 22)
small = ImageFont.truetype(font_path, 18)


def strips(frame, variant, scale):
    im = Image.open(f'{src}/{frame}-{variant}.png').convert('RGB')
    top = im.crop((0, 0, 390 * D, 190 * D))
    bot = im.crop((0, 680 * D, 390 * D, 844 * D))
    w = int(390 * D * scale)
    return top.resize((w, int(190 * D * scale)), Image.LANCZOS), bot.resize((w, int(164 * D * scale)), Image.LANCZOS)


# One sheet: three frames, the top bar and tab bar strips side by side.
scale = 0.5
cw = int(390 * D * scale)
gap = 24
th, bh = int(190 * D * scale), int(164 * D * scale)
head = 70
fh = 44 + th + 12 + bh + 64
W = gap + len(cols) * (cw + gap)
H = head + len(frames) * fh
sheet = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(sheet)
d.text((gap, 20), 'ANDROID GLASS CHROME · KYANT0/ANDROIDLIQUIDGLASS 1.0.6 AGAINST CHRISBANES/HAZE 1.7.2 · 390x844 DP', font=font, fill=INK)
for fi, (frame, ftitle) in enumerate(frames):
    y0 = head + fi * fh
    d.text((gap, y0 + 8), ftitle, font=font, fill=INK)
    for ci, (variant, ctitle) in enumerate(cols):
        x = gap + ci * (cw + gap)
        t, b = strips(frame, variant, scale)
        sheet.paste(t, (x, y0 + 44))
        sheet.paste(b, (x, y0 + 44 + th + 12))
        worst, label = contrast[(frame, variant)]
        d.text((x, y0 + 44 + th + 12 + bh + 8), ctitle, font=small, fill=DIM)
        d.text((x, y0 + 44 + th + 12 + bh + 30), f'DIM LABEL WORST {worst}:1 ({label})', font=small, fill=DIM)
sheet.save(f'{dst}/compare-chrome.png')

# One full screen per frame, the three columns side by side.
scale = 0.4
cw = int(390 * D * scale)
ch = int(844 * D * scale)
for frame, ftitle in frames:
    W = gap + len(cols) * (cw + gap)
    im = Image.new('RGB', (W, 60 + ch + 70), BG)
    d = ImageDraw.Draw(im)
    d.text((gap, 18), ftitle, font=font, fill=INK)
    for ci, (variant, ctitle) in enumerate(cols):
        x = gap + ci * (cw + gap)
        shot = Image.open(f'{src}/{frame}-{variant}.png').convert('RGB').resize((cw, ch), Image.LANCZOS)
        im.paste(shot, (x, 60))
        worst, label = contrast[(frame, variant)]
        d.text((x, 60 + ch + 10), ctitle, font=small, fill=DIM)
        d.text((x, 60 + ch + 30), f'DIM WORST {worst}:1 ({label})', font=small, fill=DIM)
    im.save(f'{dst}/compare-{frame}.png')
print('ok')
