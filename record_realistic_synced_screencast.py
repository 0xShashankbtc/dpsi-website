import asyncio
import os
import io
import math
import subprocess
import numpy as np
from PIL import Image, ImageDraw
import imageio
from playwright.async_api import async_playwright

WIDTH, HEIGHT = 1920, 1080
FPS = 30
BRAIN_DIR = "/Users/0xshashank/.gemini/antigravity/brain/6528fa52-ad5c-4bed-8976-3dfec9ba9907"
OUTPUT_VIDEO = os.path.join(BRAIN_DIR, "dpsi_live_screencast.mp4")
LOCAL_OUTPUT = "/Users/0xshashank/Documents/School Project/DPSI_Website/app/dpsi_live_screencast.mp4"
TEMP_RAW_VIDEO = os.path.join(BRAIN_DIR, "temp_raw_screencast.mp4")
FINAL_AUDIO_WAV = os.path.join(BRAIN_DIR, "combined_narration.wav")
FFMPEG_BIN = "/Users/0xshashank/Documents/School Project/DPSI_Website/app/.venv/lib/python3.14/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"

def draw_cursor(img, pos, is_clicking=False, click_progress=0.0):
    x, y = int(pos[0]), int(pos[1])
    draw = ImageDraw.Draw(img, 'RGBA')
    
    if is_clicking:
        radius = int(14 + 20 * click_progress)
        alpha = int(230 * (1.0 - click_progress))
        draw.ellipse([(x - radius, y - radius), (x + radius, y + radius)], outline=(16, 185, 129, alpha), width=3)
        draw.ellipse([(x - 8, y - 8), (x + 8, y + 8)], fill=(16, 185, 129, int(130 * (1.0 - click_progress))))
    
    cursor_poly = [
        (x, y),
        (x + 13, y + 13),
        (x + 8, y + 13),
        (x + 11, y + 21),
        (x + 8, y + 22),
        (x + 5, y + 14),
        (x, y + 17),
    ]
    shadow_poly = [(px + 2, py + 2) for px, py in cursor_poly]
    draw.polygon(shadow_poly, fill=(0, 0, 0, 90))
    draw.polygon(cursor_poly, fill=(255, 255, 255, 255), outline=(15, 23, 42, 255))
    return img

def render_lower_third_pill(img, badge_text, caption_text):
    draw = ImageDraw.Draw(img, 'RGBA')
    x0, y0 = 40, HEIGHT - 85
    x1, y1 = WIDTH - 40, HEIGHT - 30
    draw.rounded_rectangle([(x0, y0), (x1, y1)], radius=14, fill=(15, 23, 42, 230), outline=(52, 211, 153, 170), width=1)
    draw.rounded_rectangle([(x0 + 16, y0 + 12), (x0 + 220, y1 - 12)], radius=6, fill=(4, 120, 87, 240))
    draw.text((x0 + 26, y0 + 18), badge_text, fill=(255, 255, 255))
    draw.text((x0 + 235, y0 + 18), caption_text, fill=(241, 245, 249))
    return img

async def main():
    print("Launching Chromium for full 72-second live screencast recording with narration...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': WIDTH, 'height': HEIGHT},
            device_scale_factor=1.0,
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = await context.new_page()
        
        frames = []
        cur_pos = [WIDTH // 2, HEIGHT // 2]
        
        async def move_and_snap(duration_sec, end_pos=None, clicking=False, scroll_delta=0, badge="LIVE DEMO", caption=""):
            nonlocal cur_pos
            num_frames = max(1, int(duration_sec * FPS))
            s_pos = list(cur_pos)
            e_pos = list(end_pos) if end_pos else s_pos
            
            # Fast natural human cursor motion (moves decisively in first 400ms)
            move_portion = min(1.0, 0.45 / duration_sec) if end_pos and end_pos != s_pos else 1.0
            
            for f in range(num_frames):
                t = f / num_frames
                if t < move_portion:
                    mt = t / move_portion
                    ease = 1.0 - math.pow(1.0 - mt, 3.2)
                    jitter_x = math.sin(f * 0.9) * 0.4
                    jitter_y = math.cos(f * 0.9) * 0.4
                    x = s_pos[0] + (e_pos[0] - s_pos[0]) * ease + jitter_x
                    y = s_pos[1] + (e_pos[1] - s_pos[1]) * ease + jitter_y
                else:
                    x, y = e_pos[0], e_pos[1]
                    
                cur_pos = [x, y]
                
                if scroll_delta != 0:
                    await page.evaluate(f"window.scrollBy(0, {scroll_delta / num_frames});")
                
                png_bytes = await page.screenshot(type="jpeg", quality=92)
                img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
                click_p = min(1.0, (f / (num_frames * 0.4))) if clicking else 0.0
                img = draw_cursor(img, cur_pos, is_clicking=clicking, click_progress=click_p)
                img = render_lower_third_pill(img, badge, caption)
                frames.append(np.array(img))
                await asyncio.sleep(0.002)
        
        # Disable popup from blocking clicks by presetting sessionStorage
        await page.add_init_script("sessionStorage.setItem('dpsi_popup_dismissed', 'all');")

        # =========================================================================
        # 1. SCENE 1 (0:00 - 0:07.1): Public Portal Landing & Marquee
        # =========================================================================
        print("1. [Clip 1] Recording Homepage Landing & Marquee Ticker...")
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await asyncio.sleep(0.3)
        await move_and_snap(2.5, end_pos=[960, 45], badge="PUBLIC PORTAL", caption="DPS Indirapuram — Official Custom Web Platform")
        await move_and_snap(4.6, end_pos=[960, 220], badge="PUBLIC PORTAL", caption="Live animated marquee ticker & CBSE institutional header")

        # =========================================================================
        # 2. SCENE 2 (0:07.1 - 0:13.9): Navigation & Dark Mode Switch
        # =========================================================================
        print("2. [Clip 2] Recording Navigation & Dark Mode Switch...")
        await move_and_snap(0.8, end_pos=[480, 95], badge="NAVIGATION", caption="Gliding active pill navigation & multi-level menus")
        await move_and_snap(0.8, end_pos=[560, 95], badge="NAVIGATION", caption="Gliding active pill navigation & multi-level menus")
        await move_and_snap(1.2, end_pos=[650, 95], badge="NAVIGATION", caption="Academics curriculum & departments dropdown")
        
        # Toggle Dark Mode directly
        btn_pos = [1775, 95]
        await move_and_snap(0.7, end_pos=btn_pos, badge="THEME ENGINE", caption="Instantaneous dark mode switching")
        await page.evaluate("document.querySelector('button[aria-label=\"Toggle dark mode\"]')?.click()")
        await move_and_snap(0.5, clicking=True, badge="THEME ENGINE", caption="Smooth deep slate dark mode active")
        await move_and_snap(2.8, scroll_delta=550, badge="THEME ENGINE", caption="Real-time CSS variables & dark mode styling")

        # =========================================================================
        # 3. SCENE 3 (0:13.9 - 0:22.6): Interactive 3D Coverflow Gallery
        # =========================================================================
        print("3. [Clip 3] Recording 3D Campus Tour...")
        await page.goto("http://localhost:5173/gallery", wait_until="networkidle")
        await move_and_snap(1.5, end_pos=[960, 480], badge="3D CAMPUS TOUR", caption="Interactive 3D Coverflow campus infrastructure gallery")
        await move_and_snap(2.0, end_pos=[600, 480], badge="3D CAMPUS TOUR", caption="Touch-enabled 3D perspective exploration (AI Robotics, Sports, Classrooms)")
        await move_and_snap(2.5, end_pos=[1200, 480], badge="3D CAMPUS TOUR", caption="Dynamic Category filtering synchronized with CMS gallery collections")
        await move_and_snap(2.7, end_pos=[960, 480], badge="3D CAMPUS TOUR", caption="Dynamic Category filtering synchronized with CMS gallery collections")

        # =========================================================================
        # 4. SCENE 4 (0:22.6 - 0:32.7): Conversational AI Voice Assistant
        # =========================================================================
        print("4. [Clip 4] Recording Conversational AI Voice Assistant...")
        trig_pos = [1870, 1030]
        await move_and_snap(0.8, end_pos=trig_pos, badge="DPSI AI VOICE", caption="Launching low-latency conversational assistant")
        await page.evaluate("""
            const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('AI') || x.title?.includes('AI')) || document.querySelector('div.fixed button');
            if (b) b.click();
        """)
        await move_and_snap(0.5, clicking=True, badge="DPSI AI VOICE", caption="Launching low-latency conversational assistant")
        await asyncio.sleep(0.4)
        
        chip_pos = [1650, 840]
        await move_and_snap(0.7, end_pos=chip_pos, badge="AI CONVERSATION", caption="One-click inquiry for Admissions 2026")
        await page.evaluate("""
            const chip = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('Admissions 2026'));
            if (chip) chip.click();
        """)
        await move_and_snap(0.4, clicking=True, badge="AI CONVERSATION", caption="Real-time typewriter streaming & cloud neural voice synthesis")
        await move_and_snap(6.0, badge="AI CONVERSATION", caption="Real-time typewriter streaming & cloud neural voice synthesis")
        
        # Close AI assistant
        close_pos = [1870, 600]
        await page.evaluate("""
            const c = Array.from(document.querySelectorAll('button')).find(x => x.title?.includes('Close Assistant')) || document.querySelector('button[title="Close Assistant"]');
            if (c) c.click();
        """)
        await move_and_snap(1.7, end_pos=close_pos, badge="AI ASSISTANT", caption="Direct Action: Call School Office / Email Desk")

        # =========================================================================
        # 5. SCENE 5 (0:32.7 - 0:40.4): Transfer Certificate Verification
        # =========================================================================
        print("5. [Clip 5] Recording Transfer Certificate Search...")
        await page.goto("http://localhost:5173/tc", wait_until="networkidle")
        in_pos = [750, 320]
        await move_and_snap(0.8, end_pos=in_pos, badge="TC VERIFICATION", caption="Official online Transfer Certificate search portal")
        await page.evaluate("document.querySelector('input[placeholder*=\"DPSI-1082\"]')?.focus()")
        await move_and_snap(0.3, clicking=True, badge="TC VERIFICATION", caption="Querying official student database: DPSI-1082")
        
        tc_in = await page.query_selector('input[placeholder*="DPSI-1082"]')
        if tc_in:
            await tc_in.type("DPSI-1082", delay=60)
            
        s_pos = [1100, 320]
        await move_and_snap(0.6, end_pos=s_pos, badge="TC VERIFICATION", caption="Executing search query")
        await page.evaluate("""
            const s = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('Search TC'));
            if (s) s.click();
        """)
        await move_and_snap(0.4, clicking=True, badge="TC VERIFICATION", caption="Official record verified • Aarav Sharma (Class X)")
        await move_and_snap(5.0, end_pos=[960, 560], badge="TC VERIFICATION", caption="Official record verified • Aarav Sharma (Class X) • Download PDF")

        # =========================================================================
        # 6. SCENE 6 (0:40.4 - 0:50.1): Admin CMS Login & Dashboard
        # =========================================================================
        print("6. [Clip 6] Recording Admin CMS Login & Dashboard...")
        await page.evaluate("localStorage.setItem('dpsi_admin_auth', 'true'); localStorage.setItem('dpsi_admin_token', 'admin-session-active'); localStorage.setItem('dpsi_admin_user', 'SuperAdmin');")
        await page.goto("http://localhost:5173/admin", wait_until="networkidle")
        await move_and_snap(2.5, end_pos=[960, 450], badge="ADMIN CMS", caption="Centralized management suite across 24 dynamic collections")
        await move_and_snap(3.5, end_pos=[960, 550], badge="ADMIN CMS", caption="Universal OmniSearch (⌘K) & real-time collection metrics")
        await move_and_snap(3.7, end_pos=[140, 320], badge="ADMIN CMS", caption="Full multi-tenant data segregation across isolated databases")

        # =========================================================================
        # 7. SCENE 7 (0:50.1 - 1:01.2): Live Content Edit & Public Synchronisation Proof
        # =========================================================================
        print("7. [Clip 7] Recording Live Content Edit & Synchronization Proof...")
        await page.evaluate("""
            const t = Array.from(document.querySelectorAll('button, div')).find(x => x.textContent.includes('Marquee Ticker') || x.textContent.trim() === 'Marquee');
            if (t) t.click();
        """)
        await move_and_snap(1.2, end_pos=[120, 400], badge="CMS LIVE EDIT", caption="Opening Marquee Ticker live editor")
        await asyncio.sleep(0.4)
        
        tipos = [450, 400]
        await move_and_snap(0.8, end_pos=tipos, badge="CMS LIVE EDIT", caption="Updating marquee announcement in real time")
        await page.evaluate("""
            const el = document.querySelector('input[placeholder*=\"ADMISSIONS\"], input[placeholder*=\"ticker\"], table input, input.bg-slate-50');
            if (el) { el.value = '★ SPECIAL ADMISSIONS NOTICE: EXTENDED MERIT SCHOLARSHIP 2026-27 ★'; el.dispatchEvent(new Event('input', { bubbles: true })); }
        """)
        await move_and_snap(1.5, badge="CMS LIVE EDIT", caption="New announcement text entered")
        
        spos = [750, 400]
        await move_and_snap(0.6, end_pos=spos, badge="CMS LIVE EDIT", caption="Publishing update to live database")
        await page.evaluate("""
            const sb = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('Save') || x.textContent.includes('Publish') || x.textContent.includes('Update'));
            if (sb) sb.click();
        """)
        await move_and_snap(0.4, clicking=True, badge="CMS LIVE EDIT", caption="Saved & synchronized to MongoDB Atlas")
        await move_and_snap(1.0, badge="CMS LIVE EDIT", caption="Saved & synchronized to MongoDB Atlas")

        # Now switch to public homepage to prove the synchronization!
        print("7b. Demonstrating Real-time Synchronisation on Public Portal...")
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await move_and_snap(1.5, end_pos=[960, 45], badge="REAL-TIME SYNC", caption="★ INSTANT SYNCHRONIZATION: CMS announcement running live on public site! ★")
        await move_and_snap(4.1, end_pos=[550, 45], badge="REAL-TIME SYNC", caption="★ Instant reflection across all connected visitors without rebuild or downtime ★")

        # =========================================================================
        # 8. SCENE 8 (1:01.2 - 1:11.6): Cryptographic Immutable Audit Ledger
        # =========================================================================
        print("8. [Clip 8] Recording Cryptographic Immutable Audit Ledger...")
        await page.goto("http://localhost:5173/admin", wait_until="networkidle")
        await page.evaluate("""
            const at = Array.from(document.querySelectorAll('button, div')).find(x => x.textContent.includes('Audit Logs') || x.textContent.includes('Immutable Audit Logs'));
            if (at) at.click();
        """)
        await move_and_snap(1.2, end_pos=[120, 600], badge="SECURITY & AUDIT", caption="Navigating to Cryptographic Immutable Audit Ledger")
        await move_and_snap(3.8, end_pos=[960, 350], badge="SECURITY & AUDIT", caption="Chained SHA-256 HMAC anti-tamper ledger • Cryptographic Chain Verified ✓")
        await move_and_snap(5.4, end_pos=[960, 500], badge="SECURITY & AUDIT", caption="Every action cryptographically chained to previous hash with payload diff")

        await browser.close()
        
        total_duration_sec = len(frames) / FPS
        print(f"Total live frames captured: {len(frames)} ({total_duration_sec:.1f}s runtime). Encoding raw video...")
        
        writer = imageio.get_writer(TEMP_RAW_VIDEO, fps=FPS, codec='libx264', quality=8, pixelformat='yuv420p')
        for f in frames:
            writer.append_data(f)
        writer.close()
        print(f"Raw video written to {TEMP_RAW_VIDEO}")
        
        # Stitch continuous narration audio
        print("Merging multi-clip voiceover audio track...")
        subprocess.run([
            FFMPEG_BIN, "-y",
            "-i", "audio_clips/clip_01_intro.wav",
            "-i", "audio_clips/clip_02_navigation.wav",
            "-i", "audio_clips/clip_03_coverflow.wav",
            "-i", "audio_clips/clip_04_ai_assistant.wav",
            "-i", "audio_clips/clip_05_tc_search.wav",
            "-i", "audio_clips/clip_06_admin_cms.wav",
            "-i", "audio_clips/clip_07_live_sync.wav",
            "-i", "audio_clips/clip_08_audit_ledger.wav",
            "-filter_complex",
            "[0:0][1:0][2:0][3:0][4:0][5:0][6:0][7:0]concat=n=8:v=0:a=1[outa]",
            "-map", "[outa]",
            FINAL_AUDIO_WAV
        ], check=True)
        
        print("Muxing video and synchronized narration audio into master MP4...")
        subprocess.run([
            FFMPEG_BIN, "-y",
            "-i", TEMP_RAW_VIDEO,
            "-i", FINAL_AUDIO_WAV,
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            OUTPUT_VIDEO
        ], check=True)
        
        import shutil
        shutil.copyfile(OUTPUT_VIDEO, LOCAL_OUTPUT)
        print(f"Master synced video with narration created at: {LOCAL_OUTPUT}")
        
        if os.path.exists(TEMP_RAW_VIDEO): os.remove(TEMP_RAW_VIDEO)

if __name__ == "__main__":
    asyncio.run(main())
