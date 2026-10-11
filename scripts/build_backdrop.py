#!/usr/bin/env python3
"""Compose the two WebGL backdrop collage sheets from local LoL assets.

The reference system (synchronized.studio) drives its fixed WebGL stage with TWO
large pre-composed collage sheets (a "lower" and an "upper" layer) that parallax at
different speeds over a black field. We reproduce that structure, but we compose the
sheets from this project's own authorized-local assets instead of fetching theirs:

  - the three Ekko splash arts (TD 245019, Breakout 245056, Arcane 245057)
  - the in-game skin colour textures (tx_cm PNGs from the CDragon extraction)

Output: public/assets/bg-lower.webp, public/assets/bg-upper.webp  (both 4096 wide).

Deterministic: fixed seed, so re-running reproduces byte-comparable layouts.
"""
from __future__ import annotations

import os
import random
from PIL import Image, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "public", "assets")
FIELD = (8, 6, 15)  # #08060F — the page field, so gaps read as page background

W, H = 4096, 2048


def load_tiles() -> list[Image.Image]:
    """Load every usable source tile; skip (and report) anything unreadable."""
    tiles: list[Image.Image] = []
    names = (
        "splash-td.jpg", "splash-breakout.jpg", "splash-arcane.jpg",
        "tex/ekko-tx.png", "tex/breakout-tx.png", "tex/ekko-weapon-tx.png",
    )
    for name in names:
        p = os.path.join(ASSETS, name)
        if not os.path.exists(p):
            print(f"  ! missing {name}")
            continue
        try:
            im = Image.open(p)
            im.load()
            tiles.append(im.convert("RGB"))
        except Exception as exc:  # truncated / unsupported source — skip, do not fail the build
            print(f"  ! unusable {name}: {type(exc).__name__}: {exc}")
    return tiles


def crop_region(im: Image.Image, aspect: float, rng: random.Random) -> Image.Image:
    """Take a random region of the source with the requested aspect ratio."""
    w, h = im.size
    if w / h > aspect:          # source wider than target -> crop width
        nw, nh = int(h * aspect), h
    else:                        # source taller -> crop height
        nw, nh = w, int(w / aspect)
    nw, nh = max(8, min(nw, w)), max(8, min(nh, h))
    x = rng.randint(0, max(0, w - nw))
    y = rng.randint(0, max(0, h - nh))
    return im.crop((x, y, x + nw, y + nh))


def compose(seed: int, count: int, scale: float, dim: float, out: str) -> None:
    rng = random.Random(seed)
    sources = load_tiles()
    if not sources:
        raise SystemExit("no source tiles found under public/assets")

    sheet = Image.new("RGB", (W, H), FIELD)
    sheet = Image.blend(sheet, Image.new("RGB", (W, H), (19, 10, 32)), 0.35)  # violet-black wash

    # Margin band keeps the sheet edges quiet so the parallax never shows a hard tile edge.
    margin_x, margin_y = int(W * 0.03), int(H * 0.05)

    for i in range(count):
        src = sources[i % len(sources)]
        aspect = rng.choice([4 / 5, 3 / 4, 16 / 10, 1 / 1, 4 / 3])
        tile = crop_region(src, aspect, rng)
        tw = int(rng.uniform(0.055, 0.20) * W * scale)
        th = max(8, int(tw / aspect))
        tile = tile.resize((tw, th), Image.LANCZOS)

        tile = ImageEnhance.Brightness(tile).enhance(dim)
        tile = ImageEnhance.Color(tile).enhance(0.62)      # de-saturate so the stage stays atmospheric
        tile = ImageEnhance.Contrast(tile).enhance(0.88)

        # Soft dark plate behind each tile, like a mounted print on the black field.
        pad = max(4, tw // 40)
        plate = Image.new("RGB", (tw + pad * 2, th + pad * 2), (0, 0, 0))
        plate.paste(tile, (pad, pad))
        plate = plate.filter(ImageFilter.GaussianBlur(0.6))

        x = rng.randint(margin_x, max(margin_x, W - plate.width - margin_x))
        y = rng.randint(margin_y, max(margin_y, H - plate.height - margin_y))
        sheet.paste(plate, (x, y))

    sheet = sheet.filter(ImageFilter.GaussianBlur(0.4))
    path = os.path.join(ASSETS, out)
    sheet.save(path, "WEBP", quality=72, method=5)
    print(f"{out}: {sheet.size} {os.path.getsize(path) // 1024} KB  ({count} tiles)")


if __name__ == "__main__":
    compose(seed=245019, count=22, scale=1.00, dim=0.40, out="bg-lower.webp")
    compose(seed=245057, count=16, scale=1.35, dim=0.30, out="bg-upper.webp")
