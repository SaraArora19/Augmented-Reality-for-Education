"""
Marker Pattern Generator for Augmented Reality Tracking
Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)

Generates 512x512 high-contrast, feature-rich fiducial marker PNGs
for Vuforia, AR Foundation, MindAR, and AR.js optical tracking.
"""

import os
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_DIRS = [
    os.path.join(BASE_DIR, "ar_app", "markers"),
    os.path.join(BASE_DIR, "printable_markers", "images")
]

for d in OUTPUT_DIRS:
    os.makedirs(d, exist_ok=True)

MARKERS = [
    {"id": "marker_heart", "name": "Human Heart", "symbol": "HEART", "color": (185, 28, 28)},
    {"id": "marker_brain", "name": "Human Brain", "symbol": "BRAIN", "color": (99, 102, 241)},
    {"id": "marker_eye", "name": "Human Eye", "symbol": "EYE", "color": (14, 165, 233)},
    {"id": "marker_engine", "name": "4-Stroke Engine", "symbol": "ENGINE", "color": (217, 119, 6)},
    {"id": "marker_motor", "name": "DC Motor", "symbol": "MOTOR", "color": (239, 68, 68)},
    {"id": "marker_gears", "name": "Planetary Gears", "symbol": "GEARS", "color": (202, 138, 4)},
    {"id": "marker_plantcell", "name": "Plant Cell", "symbol": "CELL", "color": (21, 128, 61)},
    {"id": "marker_photosynthesis", "name": "Photosynthesis", "symbol": "CHLORO", "color": (16, 185, 129)},
    {"id": "marker_flower", "name": "Flower Anatomy", "symbol": "FLOWER", "color": (236, 72, 153)},
    {"id": "marker_polyhedra", "name": "Platonic Solids", "symbol": "POLY", "color": (67, 56, 202)},
    {"id": "marker_prism", "name": "Triangular Prism", "symbol": "PRISM", "color": (79, 70, 229)},
    {"id": "marker_dna", "name": "DNA Double Helix", "symbol": "DNA", "color": (126, 34, 206)},
    {"id": "marker_water", "name": "Water Molecule", "symbol": "H2O", "color": (56, 189, 248)}
]

def generate_marker_image(marker):
    size = 512
    img = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    # 1. Thick solid black outer border (essential for optical corner detection)
    border_w = 40
    draw.rectangle([0, 0, size, size], fill=(0, 0, 0, 255))
    draw.rectangle([border_w, border_w, size - border_w, size - border_w], fill=(255, 255, 255, 255))

    # 2. Asymmetric optical corner anchors for orientation disambiguation
    anchor_size = 70
    # Top-Left: Solid square
    draw.rectangle([border_w + 15, border_w + 15, border_w + 15 + anchor_size, border_w + 15 + anchor_size], fill=(0, 0, 0, 255))
    # Top-Right: Hollow square
    draw.rectangle([size - border_w - 15 - anchor_size, border_w + 15, size - border_w - 15, border_w + 15 + anchor_size], fill=(0, 0, 0, 255))
    draw.rectangle([size - border_w - 15 - anchor_size + 15, border_w + 15 + 15, size - border_w - 15 - 15, border_w + 15 + anchor_size - 15], fill=(255, 255, 255, 255))
    # Bottom-Left: Nested circles
    cx, cy = border_w + 15 + anchor_size // 2, size - border_w - 15 - anchor_size // 2
    draw.ellipse([cx - anchor_size//2, cy - anchor_size//2, cx + anchor_size//2, cy + anchor_size//2], fill=(0, 0, 0, 255))
    draw.ellipse([cx - anchor_size//4, cy - anchor_size//4, cx + anchor_size//4, cy + anchor_size//4], fill=(255, 255, 255, 255))
    # Bottom-Right: Solid circle
    bx, by = size - border_w - 15 - anchor_size // 2, size - border_w - 15 - anchor_size // 2
    draw.ellipse([bx - anchor_size//2, by - anchor_size//2, bx + anchor_size//2, by + anchor_size//2], fill=(0, 0, 0, 255))

    # 3. Inner geometric pattern specific to subject
    center_x, center_y = size // 2, size // 2
    inner_box = 180
    draw.rectangle([center_x - inner_box//2, center_y - inner_box//2, center_x + inner_box//2, center_y + inner_box//2], outline=(0, 0, 0, 255), width=6)
    
    # Fill inner center with distinct icon/shape
    draw.ellipse([center_x - 60, center_y - 60, center_x + 60, center_y + 60], fill=marker["color"])
    draw.ellipse([center_x - 30, center_y - 30, center_x + 30, center_y + 30], fill=(255, 255, 255, 255))
    draw.ellipse([center_x - 12, center_y - 12, center_x + 12, center_y + 12], fill=(0, 0, 0, 255))

    # Crosshairs / alignment notches
    draw.line([center_x, center_y - inner_box//2, center_x, center_y - inner_box//2 - 25], fill=(0, 0, 0, 255), width=6)
    draw.line([center_x, center_y + inner_box//2, center_x, center_y + inner_box//2 + 25], fill=(0, 0, 0, 255), width=6)
    draw.line([center_x - inner_box//2, center_y, center_x - inner_box//2 - 25, center_y], fill=(0, 0, 0, 255), width=6)
    draw.line([center_x + inner_box//2, center_y, center_x + inner_box//2 + 25, center_y], fill=(0, 0, 0, 255), width=6)

    # Save to all target directories
    for d in OUTPUT_DIRS:
        out_file = os.path.join(d, f"{marker['id']}.png")
        img.save(out_file, "PNG")
        print(f"Generated: {out_file}")

if __name__ == "__main__":
    print(f"Generating {len(MARKERS)} high-contrast AR tracking markers...")
    for m in MARKERS:
        generate_marker_image(m)
    print("All AR image markers generated successfully!")
