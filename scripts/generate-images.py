#!/usr/bin/env python3
"""
Generates warm, aesthetic placeholder artwork (not stock photos) for:
  - public/images/memory-1..3.jpg   (polaroid photo slots)
  - public/images/og-cover.jpg      (WhatsApp/IG share preview, 1200x630)

Replace these files with your own photos — keep the same filenames and
no code changes are needed.

Run:  python3 scripts/generate-images.py
"""

from __future__ import annotations

import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images"

# Warm palette from the PRD
CREAM = (253, 251, 247)
IVORY = (250, 243, 240)
ROSE = (212, 140, 148)
TERRACOTTA = (200, 109, 81)
GOLD = (229, 193, 133)
WINE = (141, 47, 61)


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def gradient(size, top, bottom, diagonal=True):
    w, h = size
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    if diagonal:
        t = (xx / max(w - 1, 1) * 0.35 + yy / max(h - 1, 1) * 0.65)
    else:
        t = yy / max(h - 1, 1)
    top_arr = np.array(top, dtype=np.float32)
    bottom_arr = np.array(bottom, dtype=np.float32)
    arr = top_arr[None, None, :] + (bottom_arr - top_arr)[None, None, :] * t[:, :, None]
    return Image.fromarray(arr.astype(np.uint8), mode="RGB")


def soft_blob(size, color, radius, center, alpha=70, blur=90):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    cx, cy = center
    draw.ellipse(
        (cx - radius, cy - radius, cx + radius, cy + radius),
        fill=color + (alpha,),
    )
    return layer.filter(ImageFilter.GaussianBlur(blur))


def grain(size, strength=6):
    w, h = size
    rng = np.random.default_rng(11)
    noise = rng.normal(0, strength, (h, w, 1)).repeat(3, axis=2)
    return noise


def finish(image, noise_strength=5):
    arr = np.asarray(image.convert("RGB"), dtype=np.float32)
    arr = np.clip(arr + grain(image.size, noise_strength), 0, 255)
    return Image.fromarray(arr.astype(np.uint8), mode="RGB")


def vignette(image, strength=0.22):
    w, h = image.size
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy = w / 2, h / 2
    dist = np.sqrt(((xx - cx) / (w * 0.62)) ** 2 + ((yy - cy) / (h * 0.62)) ** 2)
    mask = np.clip(1.0 - strength * np.clip(dist, 0, 1.6) ** 2, 0, 1)[:, :, None]
    arr = np.asarray(image, dtype=np.float32) * mask
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), mode="RGB")


def petal(draw, cx, cy, size, color, angle):
    """A simple petal: one flattened ellipse rotated to follow the wind."""
    rad = math.radians(angle)
    half_len = size * 0.75
    half_w = size * 0.34
    # Four petal extremities, then take their bounding box (PIL cannot draw a
    # rotated ellipse — flattening it along the angle is close enough).
    pts = [
        (cx + math.cos(rad) * half_len, cy + math.sin(rad) * half_len),
        (cx - math.cos(rad) * half_len, cy - math.sin(rad) * half_len),
        (cx - math.sin(rad) * half_w, cy + math.cos(rad) * half_w),
        (cx + math.sin(rad) * half_w, cy - math.cos(rad) * half_w),
    ]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    x0, x1 = min(xs), max(xs)
    y0, y1 = min(ys), max(ys)
    if x1 - x0 < 1 or y1 - y0 < 1:
        return
    draw.ellipse((x0, y0, x1, y1), fill=color)


def make_memory(index: int, size=(900, 1125)) -> Image.Image:
    """Warm abstract placeholder — no people, so it stays safe and neutral."""
    w, h = size
    variants = [
        # (atas, bawah, blob1, blob2)
        (IVORY, (238, 214, 205), ROSE, GOLD),
        ((252, 246, 240), (232, 220, 216), GOLD, TERRACOTTA),
        ((250, 243, 238), (226, 208, 206), TERRACOTTA, ROSE),
    ]
    top, bottom, blob_a, blob_b = variants[index % len(variants)]

    base = gradient(size, top, bottom).convert("RGBA")
    base.alpha_composite(soft_blob(size, blob_a, int(w * 0.52), (int(w * 0.28), int(h * 0.24)), 88, 120))
    base.alpha_composite(soft_blob(size, blob_b, int(w * 0.46), (int(w * 0.76), int(h * 0.68)), 76, 110))
    base.alpha_composite(soft_blob(size, (255, 255, 255), int(w * 0.34), (int(w * 0.5), int(h * 0.46)), 70, 130))

    # Soft horizon line (reads like a blurred landscape photo)
    horizon = Image.new("RGBA", size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(horizon)
    hy = int(h * (0.58 + 0.03 * (index % 3)))
    hd.rectangle((0, hy, w, h), fill=(120, 92, 84, 26))
    base.alpha_composite(horizon.filter(ImageFilter.GaussianBlur(40)))

    # Scattered blurred petals in the foreground
    petals = Image.new("RGBA", size, (0, 0, 0, 0))
    pd = ImageDraw.Draw(petals)
    rnd = random.Random(90 + index)
    for i in range(10):
        px = rnd.uniform(0.05, 0.95) * w
        py = rnd.uniform(0.1, 0.92) * h
        ps = rnd.uniform(0.018, 0.05) * w
        color = rnd.choice([ROSE, TERRACOTTA, GOLD]) + (rnd.randint(48, 96),)
        petal(pd, px, py, ps, color, rnd.uniform(0, 360))
    base.alpha_composite(petals.filter(ImageFilter.GaussianBlur(2.2)))

    flat = base.convert("RGB")
    flat = flat.filter(ImageFilter.GaussianBlur(0.6))
    return finish(vignette(flat, 0.18), noise_strength=4)


def make_og_cover(size=(1200, 630)) -> Image.Image:
    w, h = size
    base = gradient(size, (252, 245, 238), (238, 214, 205)).convert("RGBA")
    base.alpha_composite(soft_blob(size, ROSE, 320, (200, 120), 96, 140))
    base.alpha_composite(soft_blob(size, GOLD, 280, (980, 520), 84, 140))
    base.alpha_composite(soft_blob(size, (255, 255, 255), 300, (600, 315), 78, 150))

    # Envelope in the centre: triangular flap + body + heart seal
    overlay = Image.new("RGBA", size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    ew, eh = 340, 220
    ex, ey = (w - ew) // 2, (h - eh) // 2 + 10
    od.rounded_rectangle((ex, ey, ex + ew, ey + eh), radius=10, fill=(249, 235, 221, 235))
    od.polygon(
        [(ex, ey), (ex + ew, ey), (ex + ew // 2, ey + int(eh * 0.62))],
        fill=(243, 220, 205, 245),
    )
    od.ellipse((ex + ew // 2 - 34, ey + int(eh * 0.52) - 34,
                ex + ew // 2 + 34, ey + int(eh * 0.52) + 34),
               fill=WINE + (255,))
    od.ellipse((ex + ew // 2 - 30, ey + int(eh * 0.52) - 30,
                ex + ew // 2 + 30, ey + int(eh * 0.52) + 30),
               outline=GOLD + (150,), width=2)
    # Little heart on the seal
    cx, cy = ex + ew // 2, ey + int(eh * 0.52)
    s = 15
    od.ellipse((cx - s, cy - s * 0.9, cx, cy + s * 0.25), fill=GOLD + (240,))
    od.ellipse((cx, cy - s * 0.9, cx + s, cy + s * 0.25), fill=GOLD + (240,))
    od.polygon([(cx - s, cy), (cx + s, cy), (cx, cy + s * 1.25)], fill=GOLD + (240,))

    overlay = overlay.filter(ImageFilter.GaussianBlur(0.4))
    base.alpha_composite(overlay)

    flat = finish(vignette(base.convert("RGB"), 0.14), noise_strength=3)
    return flat


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    for i in range(3):
        path = OUT / f"memory-{i + 1}.jpg"
        make_memory(i).save(path, "JPEG", quality=84, optimize=True, progressive=True)
        print(f"OK  {path}  ({path.stat().st_size / 1024:.0f} KB)")

    og = OUT / "og-cover.jpg"
    make_og_cover().save(og, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"OK  {og}  ({og.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
