# AI Video Generation Prompt & Screencast Walkthrough Script

**Platform:** Delhi Public School Indirapuram Custom Web Portal, CMS & Conversational AI System  
**Target Video AI Generators:** Sora, Runway Gen-3 Alpha, Kling AI, Luma Dream Machine, Pika, Adobe Firefly Video  
**Aspect Ratio:** 16:9 (3840x2160 4K UHD / 60 FPS)  
**Total Estimated Runtime:** 1 Minute 50 Seconds (110s)

---

## 1. Master Video Generation Prompt

```text
[VIDEO PRODUCTION SPECIFICATIONS]
- Video Type: High-Fidelity Software Product Demonstration / Screencast Walkthrough
- Resolution: 4K UHD (3840 x 2160), 60 FPS
- Display Mode: Desktop Viewport (1920x1080 scaled 2x crisp vector rendering) with occasional seamless Mobile Responsive Picture-in-Picture
- Typography: Headings in 'Outfit' (Bold/Black), Body & Interface text in 'Plus Jakarta Sans' (Semibold/Medium), Monospace code in 'JetBrains Mono'
- UI Theme & Color Palette:
  * Primary Accent: Deep School Emerald (#047857, Tailwind emerald-700 / emerald-800)
  * Secondary / Highlight: Warm Amber Gold (#f59e0b / #fbbf24)
  * Neutrals: Slate White (#ffffff) / Slate Canvas (#f8fafc / #f1f5f9) / Dark Mode Deep Navy-Slate (#020617 / #0f172a)
  * AI Widget Ambient Gradient: Silk gradient blend from Indigo (#1e1b4b) through Royal Blue (#1e3a8a) to Deep Emerald (#047857)
- Motion Dynamics: Human-like cursor kinematics with cubic-bezier easing (ease-out-cubic), natural click micro-scale feedback (scale 0.96), realistic keystroke entry speeds (65-80 WPM), instant optimistic UI updates, authentic Sonner toast notifications, and Framer Motion spring physics on modals and dropdowns.

---

### SCENE-BY-SCENE TIMESTAMPTED WALKTHROUGH

[00:00 - 00:07] SCENE 1: Public Portal Landing & Real-Time Marquee Ticker
- On Screen: Full-width view of the DPS Indirapuram homepage header. At the very top, a dark emerald banner (`bg-emerald-900`) displays an animated marquee ticker with a pulsing amber beacon dot: "ADMISSIONS OPEN FOR SESSION 2026-27 • CBSE AFFILIATION NO: 2130663 | SCHOOL CODE: 60297 • CALL US: +91-0120-4660000". Below it, the frosted glass navigation bar displays the official school crest logo, title "Delhi Public School Indirapuram", navigation links ("Home", "About", "Academics", "Admissions", "Facilities", "News & Events", "Gallery", "Contact"), the British Council IDS seal, a dark mode toggle button, and quick-action buttons: "SchoolsOS Login", "Apply Now", and "Admin Panel".
- Cursor Action: Cursor glides from the top right across the navigation links; a smooth translucent pill indicator (`layoutId="navHoverPill"`) glides seamlessly under "Academics".
- Motion / Transition: The cursor hovers over "Academics", revealing a backdrop-blurred dropdown menu showing "Curriculum", "Departments", and "Results". Quick gentle pan down into the Hero Carousel. Cut transition.

[00:07 - 00:15] SCENE 2: Hero Slider & Interactive Campus Statistics
- On Screen: High-impact hero carousel banner with vibrant photography of the DPS Indirapuram campus. Overlay typography reads "Excellence in Education" with a gold accent subline and a pill-shaped button "Apply for 2026-27". Directly below, the "Quick Stats & Counters" section displays 4 interactive numerical metric cards: "25+ Years of Academic Excellence", "5000+ Active Students", "100% CBSE Board Pass Rate", and "50+ State & National Sports Trophies" with glowing icons.
- Cursor Action: Cursor moves smoothly to the dark mode toggle switch (Moon icon) in the navigation bar and clicks.
- Motion / Transition: The entire interface smoothly interpolates into deep slate dark mode (`bg-slate-950`), highlighting glowing emerald card borders and gold typography. Smooth scroll downward into the 3D Gallery section.

[00:15 - 00:23] SCENE 3: Interactive 3D Coverflow Campus Gallery
- On Screen: `/gallery` page titled "3D Campus Gallery" with the subtext "Interactive Campus Tour - Drag, swipe, and explore the futuristic infrastructure". A high-performance Coverflow 3D Carousel is rendered with depth-of-field perspective cards displaying photographs of the "AI Robotics Lab", "Half-Olympic Size Swimming Pool", "Smart Interactive Classrooms", and "Multipurpose Auditorium".
- Cursor Action: Cursor clicks on the active center slide card ("AI Robotics Lab"), drags left to rotate the carousel in 3D space, and clicks the category pill "Sports".
- Motion / Transition: The 3D cards smoothly rotate with inertia physics; upon filtering by "Sports", the grid beneath animates with staggered fade-in cards. Camera glides down to the floating AI assistant trigger in the bottom right corner.

[00:23 - 00:32] SCENE 4: Conversational AI Voice Assistant & Real-Time Synthesis
- On Screen: Bottom right floating action button with the glowing robot icon (`Bot`). Click triggers the expanding glassmorphic chat modal with silk ambient light orbs and top gradient header (`#1e1b4b` → `#1e3a8a` → `#047857`) reading "DPSI AI". The welcome message streams in: "Hello! I am DPSI AI. I can assist you with Admissions, Exam Schedules, Vacations, Academic Streams, and Campus Facilities."
- Cursor Action: Cursor clicks the 2x2 quick-suggestion chip "Admissions 2026".
- Motion / Transition: Chat shows a multi-color audio wave thinking indicator ("DPSI AI is thinking..."). The answer streams in with a real-time typewriter effect. Attached to the assistant bubble, a green action button appears: "📞 Call School Office" along with a "🔊 Listen to Voice" button showing an active pulsing waveform indicator playing synthesized speech via Google Cloud Neural2/Journey TTS. Cursor clicks the close icon (`X`). Smooth dissolve to the Transfer Certificate portal.

[00:32 - 00:40] SCENE 5: Online Transfer Certificate (TC) Instant Verification
- On Screen: `/transfer-certificate` page displaying "Transfer Certificate (TC) Search - Official Verification Portal". A clean card contains a search field with placeholder "e.g. DPSI-1082 or Student Name".
- Cursor Action: Cursor clicks into the input field; human-speed typing inputs "DPSI-1082" and clicks the emerald button "Search TC".
- Motion / Transition: A subtle loader spins for 200ms, then renders an official verification result card featuring a verified shield badge, student name "Aarav Sharma", father's name "Rajesh Sharma", class "Class X (Passed 2025-26)", issue date "14 March 2026", and a green button "Download Official TC (PDF)". Cursor moves to top right and clicks "Admin Panel". Wipe transition to Admin Authentication.

[00:40 - 00:48] SCENE 6: Secure Multi-Tenant Admin Authentication
- On Screen: `/admin` login screen in a clean slate container (`bg-slate-50`). Card header shows a glowing emerald lock icon, title "DPSI Admin Portal", and subtitle "Delhi Public School Indirapuram CMS". Input fields for "School / Client Code (DPSI-60297)", "Username", and "Password".
- Cursor Action: Cursor clicks "Username", types "Admin", clicks "Password", types "••••••••••••", and clicks "Sign In to CMS".
- Motion / Transition: The submit button shows a brief spinner (`animate-spin`), then transitions with an affirmative Sonner toast: "Authentication Successful - Welcome to DPSI CMS". The view expands directly into the authenticated Admin Dashboard.

[00:48 - 00:57] SCENE 7: Admin Dashboard, OmniSearch & Quick Metrics
- On Screen: Authenticated CMS workspace (`bg-slate-100`) with a white sticky top header showing "Delhi Public School Indirapuram CMS", badge "Admin: SuperAdmin", Universal OmniSearch bar ("Search across all CMS collections... ⌘K"), and the 24-tab sidebar with real-time numeric badges (Pages: 14, Sliders: 6, Gallery: 48, Tickers: 3, Audit Logs: 128). The main dashboard area shows analytics stat cards and quick action buttons ("New Page", "Upload Image", "New Slider", "Add Ticker").
- Cursor Action: Cursor clicks into the OmniSearch input and types "Marquee".
- Motion / Transition: A command palette modal pops open instantly highlighting the "Marquee Ticker" module. Cursor hits Enter, navigating directly to the Marquee tab.

[00:57 - 01:06] SCENE 8: Live Notification Marquee Ticker Customizer
- On Screen: "Marquee Ticker Manager" table showing active announcement ribbons. An "Add New Ticker" modal is open with fields: "Ticker Text", "Badge Text (e.g. URGENT)", "Link URL", "Pill Shape (Rectangle / Soft Curve / Large Curve / Pill Box)", and color theme swatches ("Emerald", "Amber", "Navy", "Crimson", "Purple", "Slate").
- Cursor Action: Cursor clicks "Amber" color preset, selects "Pill Box" shape, toggles "Active Status" to On, and clicks "Save & Publish Ticker".
- Motion / Transition: The modal closes with a spring animation; a green toast appears: "Marquee ticker created and synchronized to live header". Cursor clicks on the "Manage Pages" sidebar tab.

[01:06 - 01:15] SCENE 9: Dynamic Page Builder & Rich Text Content Studio
- On Screen: "Manage Pages" tab showing a filterable table of custom pages with columns: Title, URL Slug, Category, Updated Date, Status (Published badge), and Actions. Above it, the "Create Dynamic Page" modal is open with fields for Page Title, Slug (`/page/ai-robotics-curriculum`), Category Dropdown ("Academics"), and the embedded `RichTextEditor` toolbar (Bold, Italic, H1, H2, Bullet Lists, Blockquotes, Media Embed).
- Cursor Action: Cursor selects text inside the rich editor, clicks the bold icon, toggles "Publish Immediately", and clicks "Save Page".
- Motion / Transition: Table updates immediately with a new row showing the green "Published" badge. Cursor navigates to the "Image Gallery" tab.

[01:15 - 01:23] SCENE 10: Batch Media Gallery & 3D Coverflow Featured Toggles
- On Screen: "Image Gallery Management" displaying a drag-and-drop file dropzone ("Drag & drop campus photos here or browse files") and a grid of existing images with category badges ("Sports", "Campus", "Events"). Each card features a star icon toggle: "Feature in 3D Coverflow".
- Cursor Action: Cursor toggles the "Feature in 3D Coverflow" star on two recent laboratory photos and clicks "Update Gallery".
- Motion / Transition: The star glows gold with a micro-scale bounce; toast notification: "CoverFlow display items updated". Cursor clicks the "AI Configuration" sidebar tab.

[01:23 - 01:32] SCENE 11: Conversational AI Engine & Voice Parameter Tuning
- On Screen: "AI Configuration & Speech Engine" panel. Sections include: "System Instruction / Persona Prompt", "Initial Welcome Greeting", "LLM Model Selection" dropdown (`llama-3.3-70b-versatile`), "Speech Synthesizer Voice Engines" (Google Cloud Journey en-IN, Google Cloud Neural2 hi-IN, ElevenLabs Voice ID), "Temperature Slider (0.7)", and "Max Tokens (1024)".
- Cursor Action: Cursor clicks the "Voice Preview" test button next to "Google Cloud Neural2 (hi-IN)".
- Motion / Transition: A crisp voice waveform plays bilingual sample audio through the browser console. A green badge confirms "Voice Pipeline Active". Cursor clicks the "Site Settings" tab.

[01:32 - 01:40] SCENE 12: School Identity, Logo Customizer & Global Settings
- On Screen: "Global Site Settings & Branding" interface. Form sections for "School Information" (Name, CBSE Affiliation 2130663, School Code 60297, Phone, Email, Address) and the "Interactive Logo Customizer" with a real-time Logo Height Slider (32px to 75px), Shape Selector ("Clean", "Square", "Curve", "Circle"), and "Show Text Next to Logo" switch.
- Cursor Action: Cursor drags the Logo Height slider from 52px to 58px; the live logo preview next to it resizes smoothly in real-time. Cursor clicks "Save Settings".
- Motion / Transition: Button flashes a checkmark with toast "Branding settings saved". Cursor moves to the final critical tab: "Immutable Audit Logs".

[01:40 - 01:50] SCENE 13: Cryptographic Tamper-Evident Audit Ledger & Outro
- On Screen: "Cryptographic Immutable Audit Ledger" interface. A verification header displays a green shield icon: "Cryptographic Chain Verified ✓ - 0 Tamper Anomalies Detected". The ledger table displays sequentially chained entries with columns: Timestamp (IST), Admin User ("SuperAdmin"), IP Address ("103.21.x.x"), Action Type ("UPDATE_SITE_SETTINGS", "CREATE_PAGE", "UPDATE_AI_CONFIG"), SHA-256 Chained HMAC Hash (`hmac_sha256(prevHash + payload)`), and a "View Payload Diff" button.
- Cursor Action: Cursor clicks "View Payload Diff" on the latest entry, opening an interactive JSON diff modal showing exact before/after field changes, then hovers over the green cryptographic chain verification badge.
- Motion / Transition: The badge pulses with a subtle emerald glow. The camera slowly zooms out from the dual screen showing the live public school portal on the left and the secure administrative control suite on the right. Smooth cinematic fade to dark slate finish.
```

---

## 2. Accompanying Voiceover / Narration Script

| Timestamp | Visual Cue | Narration Audio Script |
|---|---|---|
| **00:00 - 00:07** | Scene 1 (Header & Ticker) | *"Welcome to the next generation of institutional web infrastructure for Delhi Public School Indirapuram — powered by a multi-tenant CMS, live announcement synchronizer, and bilingual AI assistance."* |
| **00:07 - 00:15** | Scene 2 (Hero & Dark Mode) | *"Designed with modern typography and effortless theme switching, the portal delivers real-time statistical metrics and dynamic banner showcases."* |
| **00:15 - 00:23** | Scene 3 (3D Coverflow) | *"Experience the campus in interactive 3D Coverflow, allowing prospective parents and students to explore state-of-the-art facilities with dynamic category filtering."* |
| **00:23 - 00:32** | Scene 4 (DPSI AI Voice) | *"Integrated at the core is DPSI AI — a low-latency conversational assistant with real-time speech recognition, typewriter responses, dynamic phone links, and neural cloud voice synthesis."* |
| **00:32 - 00:40** | Scene 5 (TC Verification) | *"Parents and alumni can instantly verify and download official Transfer Certificates with secure, database-backed record lookups."* |
| **00:40 - 00:57** | Scenes 6-7 (Admin & OmniSearch) | *"Behind the portal lies a powerful 24-collection administrative engine equipped with Universal OmniSearch for lightning-fast control over every school asset."* |
| **00:57 - 01:23** | Scenes 8-10 (Content & Media Studio) | *"Manage real-time tickers, draft rich-text pages with instantaneous publishing, and curate high-resolution media galleries in seconds."* |
| **01:23 - 01:40** | Scenes 11-12 (AI Tuning & Branding) | *"Fine-tune LLM personas, test Google Cloud neural voices, and customize institutional branding with live visual feedback."* |
| **01:40 - 01:50** | Scene 13 (Cryptographic Ledger) | *"Every administrative operation is permanently verified through a cryptographically chained SHA-256 HMAC ledger — ensuring absolute transparency, integrity, and tamper resistance."* |
