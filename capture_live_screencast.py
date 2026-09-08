import asyncio
import os
import io
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio
from playwright.async_api import async_playwright

WIDTH, HEIGHT = 1920, 1080
FPS = 30
BRAIN_DIR = "/Users/0xshashank/.gemini/antigravity/brain/6528fa52-ad5c-4bed-8976-3dfec9ba9907"
OUTPUT_VIDEO = os.path.join(BRAIN_DIR, "dpsi_live_screencast.mp4")
LOCAL_OUTPUT = "/Users/0xshashank/Documents/School Project/DPSI_Website/app/dpsi_live_screencast.mp4"

def draw_cursor(img, pos, is_clicking=False):
    x, y = int(pos[0]), int(pos[1])
    draw = ImageDraw.Draw(img, 'RGBA')
    
    if is_clicking:
        draw.ellipse([(x - 20, y - 20), (x + 20, y + 20)], outline=(52, 211, 153, 220), width=3)
        draw.ellipse([(x - 12, y - 12), (x + 12, y + 12)], fill=(52, 211, 153, 90))
    
    cursor_poly = [
        (x, y),
        (x + 15, y + 15),
        (x + 9, y + 15),
        (x + 13, y + 24),
        (x + 9, y + 25),
        (x + 5, y + 17),
        (x, y + 20),
    ]
    shadow_poly = [(px + 2, py + 2) for px, py in cursor_poly]
    draw.polygon(shadow_poly, fill=(0, 0, 0, 100))
    draw.polygon(cursor_poly, fill=(255, 255, 255, 255), outline=(15, 23, 42, 255))
    return img

async def main():
    print("Launching Chromium for high-fidelity live screencast recording...")
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
        
        async def snap_frames(duration_sec, start_pos=None, end_pos=None, clicking=False, scroll_delta=0):
            nonlocal cur_pos
            num_frames = max(1, int(duration_sec * FPS))
            s_pos = start_pos if start_pos else cur_pos
            e_pos = end_pos if end_pos else s_pos
            
            for f in range(num_frames):
                t = f / num_frames
                ease = 0.5 - 0.5 * math.cos(t * math.pi)
                x = s_pos[0] + (e_pos[0] - s_pos[0]) * ease
                y = s_pos[1] + (e_pos[1] - s_pos[1]) * ease
                cur_pos = [x, y]
                
                if scroll_delta != 0:
                    await page.evaluate(f"window.scrollBy(0, {scroll_delta / num_frames});")
                
                png_bytes = await page.screenshot(type="jpeg", quality=92)
                img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
                img_with_cursor = draw_cursor(img, cur_pos, is_clicking=(clicking and f < num_frames // 2))
                frames.append(np.array(img_with_cursor))
                await asyncio.sleep(0.01)
        
        # 1. Open Homepage
        print("1. Recording Homepage Landing...")
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await asyncio.sleep(0.8)
        
        # Dismiss popup modal if open
        try:
            close_btn = await page.query_selector('button[title="Close Notice"], div.fixed.inset-0 button')
            if close_btn:
                box = await close_btn.bounding_box()
                if box:
                    await snap_frames(1.0, start_pos=[960, 540], end_pos=[box['x'] + box['width']/2, box['y'] + box['height']/2])
                    await close_btn.click()
                    await snap_frames(0.5, clicking=True)
        except Exception:
            pass
        
        # 2. Hover navigation
        print("2. Recording Navigation Menu...")
        await snap_frames(1.5, start_pos=cur_pos, end_pos=[550, 95])
        await snap_frames(1.2, start_pos=[550, 95], end_pos=[640, 95]) # Academics
        
        # 3. Dark Mode Toggle
        print("3. Recording Dark Mode Switch...")
        theme_btn = await page.query_selector('button[aria-label="Toggle dark mode"]')
        if theme_btn:
            box = await theme_btn.bounding_box()
            if box:
                btn_center = [box['x'] + box['width']/2, box['y'] + box['height']/2]
                await snap_frames(1.2, start_pos=[640, 95], end_pos=btn_center)
                await theme_btn.click()
                await snap_frames(1.2, start_pos=btn_center, end_pos=btn_center, clicking=True)
        
        # 4. Smooth Scrolling through hero & stats
        print("4. Recording Page Scroll & Metrics...")
        await snap_frames(2.5, start_pos=cur_pos, end_pos=[960, 600], scroll_delta=650)
        await snap_frames(1.5, start_pos=[960, 600], end_pos=[960, 600])
        
        # 5. Open AI Conversational Assistant
        print("5. Recording Conversational AI Voice Assistant...")
        ai_trigger = await page.query_selector('button:has-text("AI"), div.fixed.bottom-\\[max button, button[title*="AI"], div.fixed.bottom-\\[max\\(12px\\,env\\(safe-area-inset-bottom\\)\\)\\] button')
        if not ai_trigger:
            ai_trigger = await page.query_selector('div.fixed button')
        
        if ai_trigger:
            box = await ai_trigger.bounding_box()
            if box:
                trigger_pos = [box['x'] + box['width']/2, box['y'] + box['height']/2]
                await snap_frames(1.2, start_pos=[960, 600], end_pos=trigger_pos)
                await ai_trigger.click()
                await snap_frames(1.0, start_pos=trigger_pos, end_pos=trigger_pos, clicking=True)
                await asyncio.sleep(0.5)
                
                # Click chip Admissions in AI window
                chip = await page.query_selector('button:has-text("Admissions 2026")')
                if chip:
                    cbox = await chip.bounding_box()
                    if cbox:
                        chip_pos = [cbox['x'] + cbox['width']/2, cbox['y'] + cbox['height']/2]
                        await snap_frames(1.0, start_pos=trigger_pos, end_pos=chip_pos)
                        await chip.click()
                        await snap_frames(3.5, start_pos=chip_pos, end_pos=chip_pos, clicking=True)
                
                # Close AI modal
                close_ai = await page.query_selector('button[title="Close Assistant"]')
                if close_ai:
                    cbox = await close_ai.bounding_box()
                    if cbox:
                        cpos = [cbox['x'] + cbox['width']/2, cbox['y'] + cbox['height']/2]
                        await snap_frames(0.8, start_pos=cur_pos, end_pos=cpos)
                        await close_ai.click()
                        await snap_frames(0.5, start_pos=cpos, end_pos=cpos, clicking=True)

        # 6. Navigate to 3D Campus Gallery
        print("6. Recording 3D Campus Gallery...")
        await page.goto("http://localhost:5173/gallery", wait_until="networkidle")
        await snap_frames(1.5, start_pos=cur_pos, end_pos=[960, 480])
        # Interact with coverflow by dragging
        await snap_frames(1.5, start_pos=[960, 480], end_pos=[650, 480])
        await snap_frames(1.2, start_pos=[650, 480], end_pos=[960, 480])
        
        # 7. Navigate to Transfer Certificate Search
        print("7. Recording Transfer Certificate Search...")
        await page.goto("http://localhost:5173/tc", wait_until="networkidle")
        tc_input = await page.query_selector('input[placeholder*="DPSI-1082"]')
        if tc_input:
            box = await tc_input.bounding_box()
            if box:
                in_pos = [box['x'] + 100, box['y'] + box['height']/2]
                await snap_frames(1.0, start_pos=cur_pos, end_pos=in_pos)
                await tc_input.click()
                await snap_frames(0.4, start_pos=in_pos, end_pos=in_pos, clicking=True)
                await tc_input.type("DPSI-1082", delay=75)
                
                search_btn = await page.query_selector('button:has-text("Search TC")')
                if search_btn:
                    sbox = await search_btn.bounding_box()
                    if sbox:
                        s_pos = [sbox['x'] + sbox['width']/2, sbox['y'] + sbox['height']/2]
                        await snap_frames(0.8, start_pos=in_pos, end_pos=s_pos)
                        await search_btn.click()
                        await snap_frames(2.5, start_pos=s_pos, end_pos=s_pos, clicking=True)

        # 8. Navigate to Admin CMS Dashboard & Audit Logs
        print("8. Recording Admin CMS & Audit Ledger...")
        await page.evaluate("localStorage.setItem('dpsi_admin_auth', 'true'); localStorage.setItem('dpsi_admin_token', 'admin-session-active'); localStorage.setItem('dpsi_admin_user', 'SuperAdmin');")
        await page.goto("http://localhost:5173/admin", wait_until="networkidle")
        await snap_frames(2.0, start_pos=cur_pos, end_pos=[960, 400])
        
        # Click on Audit Logs tab in sidebar
        audit_tab = await page.query_selector('button:has-text("Audit Logs"), div:has-text("Immutable Audit Logs")')
        if audit_tab:
            abox = await audit_tab.bounding_box()
            if abox:
                a_pos = [abox['x'] + abox['width']/2, abox['y'] + abox['height']/2]
                await snap_frames(1.0, start_pos=cur_pos, end_pos=a_pos)
                await audit_tab.click()
                await snap_frames(3.0, start_pos=a_pos, end_pos=[960, 450], clicking=True)
        else:
            await snap_frames(2.5, start_pos=cur_pos, end_pos=[960, 450])
            
        await browser.close()
        
        print(f"Total live frames captured: {len(frames)}. Encoding into MP4...")
        writer = imageio.get_writer(OUTPUT_VIDEO, fps=FPS, codec='libx264', quality=8, pixelformat='yuv420p')
        for f in frames:
            writer.append_data(f)
        writer.close()
        
        import shutil
        shutil.copyfile(OUTPUT_VIDEO, LOCAL_OUTPUT)
        print(f"Real live screencast video successfully generated at: {LOCAL_OUTPUT}")

if __name__ == "__main__":
    asyncio.run(main())
