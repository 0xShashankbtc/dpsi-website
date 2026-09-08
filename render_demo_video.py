import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio

WIDTH, HEIGHT = 1920, 1080
FPS = 30

BRAIN_DIR = "/Users/0xshashank/.gemini/antigravity/brain/6528fa52-ad5c-4bed-8976-3dfec9ba9907"
OUTPUT_VIDEO = os.path.join(BRAIN_DIR, "dpsi_product_showcase.mp4")
LOCAL_OUTPUT = "/Users/0xshashank/Documents/School Project/DPSI_Website/app/dpsi_product_showcase.mp4"

SCENES = [
    {
        "image": f"{BRAIN_DIR}/scene_1_portal_landing_1787901240885.jpg",
        "title": "DPS Indirapuram — Official Public Portal",
        "subtitle": "Real-time announcement ticker, modern navigation, and dynamic campus hero showcases.",
        "badge": "SCENE 01 • PUBLIC PORTAL",
        "duration_sec": 4.5,
        "zoom": (1.0, 1.08),
        "pan": (0.0, 0.02)
    },
    {
        "image": f"{BRAIN_DIR}/scene_4_coverflow_gallery_1787902315082.jpg",
        "title": "Interactive 3D Coverflow Campus Gallery",
        "subtitle": "Touch-enabled 3D perspective gallery with category filters & dynamic CMS synchronisation.",
        "badge": "SCENE 02 • 3D CAMPUS TOUR",
        "duration_sec": 4.5,
        "zoom": (1.06, 1.0),
        "pan": (-0.02, 0.0)
    },
    {
        "image": f"{BRAIN_DIR}/scene_2_ai_voice_assistant_1787901263063.jpg",
        "title": "Bilingual AI Voice & Conversational Assistant",
        "subtitle": "Real-time speech recognition, typewriter streaming, dynamic action links & cloud neural TTS.",
        "badge": "SCENE 03 • DPSI AI ASSISTANT",
        "duration_sec": 5.0,
        "zoom": (1.0, 1.09),
        "pan": (0.02, -0.01)
    },
    {
        "image": f"{BRAIN_DIR}/scene_5_tc_verification_1787902364006.jpg",
        "title": "Transfer Certificate (TC) Instant Verification",
        "subtitle": "Online student record lookup with verified seal badge and official PDF generation.",
        "badge": "SCENE 04 • TC VERIFICATION",
        "duration_sec": 4.5,
        "zoom": (1.04, 1.0),
        "pan": (0.0, 0.02)
    },
    {
        "image": f"{BRAIN_DIR}/scene_6_admin_dashboard_cms_1787902387590.jpg",
        "title": "Multi-Tenant Admin CMS & OmniSearch",
        "subtitle": "Centralised management across 24 collections with universal keyboard-driven search (⌘K).",
        "badge": "SCENE 05 • ADMIN CONTROL SUITE",
        "duration_sec": 4.5,
        "zoom": (1.0, 1.07),
        "pan": (-0.02, 0.01)
    },
    {
        "image": f"{BRAIN_DIR}/scene_7_page_builder_1787902412783.jpg",
        "title": "Dynamic Content Studio & Page Builder",
        "subtitle": "WYSIWYG rich text editor with live category routing and instant publishing.",
        "badge": "SCENE 06 • CONTENT STUDIO",
        "duration_sec": 4.5,
        "zoom": (1.05, 1.0),
        "pan": (0.01, -0.01)
    },
    {
        "image": f"{BRAIN_DIR}/scene_3_audit_ledger_cms_1787901281837.jpg",
        "title": "Cryptographic Immutable Audit Ledger",
        "subtitle": "Chained SHA-256 HMAC anti-tamper security ledger with JSON payload diff inspector.",
        "badge": "SCENE 07 • SECURITY & INTEGRITY",
        "duration_sec": 5.5,
        "zoom": (1.0, 1.08),
        "pan": (0.0, 0.02)
    }
]

def get_font(size, bold=False):
    # Try system fonts
    font_paths = [
        "/System/Library/Fonts/SFProText-Bold.otf" if bold else "/System/Library/Fonts/SFProText-Regular.otf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf"
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

title_font = get_font(34, bold=True)
subtitle_font = get_font(20, bold=False)
badge_font = get_font(14, bold=True)
header_font = get_font(42, bold=True)

def render_overlay(frame_img, scene, progress):
    draw = ImageDraw.Draw(frame_img, 'RGBA')
    
    # Sleek top branding pill
    draw.rounded_rectangle([(40, 36), (360, 80)], radius=12, fill=(15, 23, 42, 210), outline=(255, 255, 255, 60), width=1)
    draw.text((60, 48), "DPS INDIRAPURAM", font=badge_font, fill=(52, 211, 153, 255))
    draw.text((220, 48), "• ENTERPRISE CMS", font=badge_font, fill=(248, 250, 252, 200))
    
    # Sleek glassmorphic Lower Third Card
    card_x0, card_y0 = 60, HEIGHT - 180
    card_x1, card_y1 = WIDTH - 60, HEIGHT - 40
    
    # Background glass panel
    draw.rounded_rectangle([(card_x0, card_y0), (card_x1, card_y1)], radius=18, fill=(15, 23, 42, 225), outline=(52, 211, 153, 160), width=2)
    
    # Emerald accent indicator bar
    draw.rounded_rectangle([(card_x0 + 20, card_y0 + 22), (card_x0 + 26, card_y1 - 22)], radius=3, fill=(52, 211, 153, 255))
    
    # Badge
    draw.rounded_rectangle([(card_x0 + 44, card_y0 + 20), (card_x0 + 280, card_y0 + 46)], radius=6, fill=(4, 120, 87, 230))
    draw.text((card_x0 + 54, card_y0 + 26), scene["badge"], font=badge_font, fill=(255, 255, 255, 255))
    
    # Title & Subtitle
    draw.text((card_x0 + 44, card_y0 + 54), scene["title"], font=title_font, fill=(255, 255, 255, 255))
    draw.text((card_x0 + 44, card_y0 + 98), scene["subtitle"], font=subtitle_font, fill=(203, 213, 225, 240))
    
    # Progress timeline bar inside lower third
    timeline_y = card_y1 - 10
    draw.line([(card_x0 + 44, timeline_y), (card_x1 - 44, timeline_y)], fill=(51, 65, 85, 200), width=3)
    bar_width = (card_x1 - card_x0 - 88) * progress
    draw.line([(card_x0 + 44, timeline_y), (card_x0 + 44 + bar_width, timeline_y)], fill=(52, 211, 153, 255), width=3)
    
    return frame_img

def create_title_card(text_title, text_sub, duration_sec=3.0):
    total_frames = int(duration_sec * FPS)
    frames = []
    
    base_img = Image.new('RGB', (WIDTH, HEIGHT), color=(10, 15, 30))
    draw = ImageDraw.Draw(base_img)
    
    # Geometric decorative accents
    draw.ellipse([(WIDTH//2 - 400, HEIGHT//2 - 400), (WIDTH//2 + 400, HEIGHT//2 + 400)], outline=(4, 120, 87, 50), width=2)
    draw.ellipse([(WIDTH//2 - 250, HEIGHT//2 - 250), (WIDTH//2 + 250, HEIGHT//2 + 250)], outline=(52, 211, 153, 70), width=1)
    
    # Logo text
    draw.text((WIDTH//2 - 220, HEIGHT//2 - 90), text_title, font=header_font, fill=(255, 255, 255))
    draw.text((WIDTH//2 - 320, HEIGHT//2 - 20), text_sub, font=title_font, fill=(52, 211, 153))
    draw.text((WIDTH//2 - 240, HEIGHT//2 + 50), "Multi-Tenant Architecture • AI Conversational Agent • Cryptographic Ledger", font=subtitle_font, fill=(148, 163, 184))
    
    arr = np.array(base_img)
    for i in range(total_frames):
        alpha = min(1.0, i / (FPS * 0.8)) if i < FPS else (max(0.0, (total_frames - i) / (FPS * 0.5)) if i > total_frames - FPS * 0.5 else 1.0)
        frame_arr = (arr * alpha).astype(np.uint8)
        frames.append(frame_arr)
    return frames

print("Rendering video scenes with pan-and-zoom and smooth crossfades...")
writer = imageio.get_writer(OUTPUT_VIDEO, fps=FPS, codec='libx264', quality=8, pixelformat='yuv420p')

# Intro card
for f in create_title_card("DPS INDIRAPURAM", "Next-Gen Web Platform & AI Suite", duration_sec=2.5):
    writer.append_data(f)

# Scene clips
for s_idx, scene in enumerate(SCENES):
    print(f"Processing Scene {s_idx + 1}/{len(SCENES)}: {scene['title']}")
    img = Image.open(scene["image"]).convert('RGB')
    orig_w, orig_h = img.size
    
    total_frames = int(scene["duration_sec"] * FPS)
    z_start, z_end = scene["zoom"]
    pan_x, pan_y = scene["pan"]
    
    for f_idx in range(total_frames):
        t = f_idx / total_frames
        # Smooth cosine interpolation
        ease_t = 0.5 - 0.5 * math.cos(t * math.pi)
        
        cur_zoom = z_start + (z_end - z_start) * ease_t
        cur_pan_x = pan_x * ease_t * orig_w
        cur_pan_y = pan_y * ease_t * orig_h
        
        crop_w = int(orig_w / cur_zoom)
        crop_h = int(orig_h / cur_zoom)
        
        center_x = (orig_w / 2) + cur_pan_x
        center_y = (orig_h / 2) + cur_pan_y
        
        x0 = max(0, min(orig_w - crop_w, int(center_x - crop_w / 2)))
        y0 = max(0, min(orig_h - crop_h, int(center_y - crop_h / 2)))
        x1 = x0 + crop_w
        y1 = y0 + crop_h
        
        cropped = img.crop((x0, y0, x1, y1)).resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
        frame_with_overlay = render_overlay(cropped, scene, t)
        
        frame_arr = np.array(frame_with_overlay)
        writer.append_data(frame_arr)

# Outro card
for f in create_title_card("DELHI PUBLIC SCHOOL", "Excellence • Integrity • Innovation", duration_sec=3.0):
    writer.append_data(f)

writer.close()
print(f"Video successfully rendered at: {OUTPUT_VIDEO}")

# Copy to local app folder
import shutil
shutil.copyfile(OUTPUT_VIDEO, LOCAL_OUTPUT)
print(f"Video copied to project directory at: {LOCAL_OUTPUT}")
