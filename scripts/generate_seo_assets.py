import os
from PIL import Image, ImageOps

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO_DIR = os.path.join(BASE_DIR, "public", "Logo")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
APP_DIR = os.path.join(BASE_DIR, "app")

# Source assets
ring_logo_path = os.path.join(LOGO_DIR, "unifolio-ring-transparent.png")
wordmark_dark_path = os.path.join(LOGO_DIR, "unifolio-wordmark-dark.png")

print(f"Loading ring logo from: {ring_logo_path}")
ring_img = Image.open(ring_logo_path).convert("RGBA")

# Trim any transparent borders from ring logo for max clarity
bbox = ring_img.getbbox()
if bbox:
    ring_img = ring_img.crop(bbox)

# 1. Generate Favicon.ico (contains 16x16, 32x32, 48x48)
sizes = [(16, 16), (32, 32), (48, 48)]
icon_images = []
for s in sizes:
    resized = ring_img.resize(s, Image.Resampling.LANCZOS)
    icon_images.append(resized)

favicon_public = os.path.join(PUBLIC_DIR, "favicon.ico")
favicon_app = os.path.join(APP_DIR, "favicon.ico")

icon_images[0].save(
    favicon_public,
    format="ICO",
    sizes=sizes,
    append_images=icon_images[1:]
)
icon_images[0].save(
    favicon_app,
    format="ICO",
    sizes=sizes,
    append_images=icon_images[1:]
)
print(f"Saved favicon.ico to public/ and app/")

# 2. Generate Apple Touch Icon (180x180) with subtle padding for iOS
apple_size = 180
apple_pad = 20
ring_apple = ring_img.resize((apple_size - (apple_pad * 2), apple_size - (apple_pad * 2)), Image.Resampling.LANCZOS)
apple_canvas = Image.new("RGBA", (apple_size, apple_size), (255, 255, 255, 0))
apple_canvas.paste(ring_apple, (apple_pad, apple_pad), ring_apple)

apple_canvas.save(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"), format="PNG")
apple_canvas.save(os.path.join(APP_DIR, "apple-icon.png"), format="PNG")
print(f"Saved apple-touch-icon.png to public/ and app/apple-icon.png")

# 3. Generate icon.png (192x192)
icon_192 = ring_img.resize((192, 192), Image.Resampling.LANCZOS)
icon_192.save(os.path.join(PUBLIC_DIR, "icon-192.png"), format="PNG")
icon_192.save(os.path.join(APP_DIR, "icon.png"), format="PNG")
print(f"Saved icon-192.png and app/icon.png")

# 4. Generate OpenGraph Image (1200x630, pure white background, black logo centered)
og_width = 1200
og_height = 630
og_canvas = Image.new("RGB", (og_width, og_height), (255, 255, 255))

wordmark_img = Image.open(wordmark_dark_path).convert("RGBA")
wm_bbox = wordmark_img.getbbox()
if wm_bbox:
    wordmark_img = wordmark_img.crop(wm_bbox)

# Target width: ~540px width (leaving ~330px margin on each side so it never clips)
target_wm_w = 540
aspect = wordmark_img.height / wordmark_img.width
target_wm_h = int(target_wm_w * aspect)

wordmark_resized = wordmark_img.resize((target_wm_w, target_wm_h), Image.Resampling.LANCZOS)

# Center in 1200x630
paste_x = (og_width - target_wm_w) // 2
paste_y = (og_height - target_wm_h) // 2

og_canvas.paste(wordmark_resized, (paste_x, paste_y), wordmark_resized)

og_public = os.path.join(PUBLIC_DIR, "og-image.png")
og_app = os.path.join(APP_DIR, "opengraph-image.png")

og_canvas.save(og_public, format="PNG", quality=95)
og_canvas.save(og_app, format="PNG", quality=95)
print(f"Saved og-image.png to public/ and app/opengraph-image.png (1200x630)")
