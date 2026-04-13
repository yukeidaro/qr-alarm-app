from PIL import Image, ImageDraw
import numpy as np

# Load images
fg = Image.open('assets/screenshots/screenshot-feature-graphic.png').convert('RGB')
icon = Image.open('assets/Scan Alarm Icon Final.png').convert('RGB')

arr = np.array(fg, dtype=np.float64)
h, w = arr.shape[:2]

# Solid background color
BG = np.array([244, 239, 234], dtype=np.float64)

# Start with solid background
canvas = np.full((h, w, 3), BG, dtype=np.uint8)

# Only copy the text+badge region from original (ignore decorative elements)
# Text+badges are in approximately x=130-530, y=185-326
# Be more restrictive to avoid decorative circles/QR patterns
text_region = {
    'x1': 100, 'x2': 540,
    'y1': 175, 'y2': 340
}

# Copy content pixels from text region only (high threshold to catch anti-aliased edges)
for y in range(text_region['y1'], text_region['y2']):
    for x in range(text_region['x1'], text_region['x2']):
        px = arr[y, x, :]
        # Use local background estimate from original gradient
        # Sample BG from leftmost pixel at same y (definitely clean)
        local_bg = arr[y, 20, :]
        dist = np.sqrt(np.sum((px - local_bg) ** 2))
        if dist > 15:
            # Content pixel - map it onto solid BG
            # For anti-aliased edges, blend with solid BG
            alpha = min(dist / 40.0, 1.0)
            blended = BG * (1 - alpha) + px * alpha
            canvas[y, x, :] = np.clip(blended, 0, 255).astype(np.uint8)

# Vertical centering: content y=175-340 (165px), image h=560
# Current center: (175+340)/2 = 257.5, target: 280
# Shift down by ~22px
content_center = (text_region['y1'] + text_region['y2']) // 2
target_center = h // 2
shift = target_center - content_center

shifted = np.full((h, w, 3), BG, dtype=np.uint8)
for y in range(h):
    src_y = y - shift
    if 0 <= src_y < h:
        shifted[y, :, :] = canvas[src_y, :, :]

# Place new icon with rounded corners
result_img = Image.fromarray(shifted, 'RGB').convert('RGBA')
icon_rgba = Image.open('assets/Scan Alarm Icon Final.png').convert('RGBA')

target_size = 195
icon_resized = icon_rgba.resize((target_size, target_size), Image.LANCZOS)

radius = 38
mask = Image.new('L', (target_size, target_size), 0)
ImageDraw.Draw(mask).rounded_rectangle(
    [(0, 0), (target_size - 1, target_size - 1)], radius=radius, fill=255
)

icon_with_mask = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 0))
icon_with_mask.paste(icon_resized, (0, 0), mask)

paste_x = 650
paste_y = (h - target_size) // 2
result_img.paste(icon_with_mask, (paste_x, paste_y), icon_with_mask)

# Final: resize to 1024x500
result_final = result_img.convert('RGB').resize((1024, 500), Image.LANCZOS)
result_final.save('output/feature-graphic.png', 'PNG')
print(f"Saved: output/feature-graphic.png (1024x500)")
