# 📄 DPSI Website — Overleaf Technical Documentation Package

This directory contains the production-grade, publication-ready **LaTeX Technical Documentation & Engineering Architecture Report** for the **Delhi Public School Indirapuram (DPSI)** web platform and enterprise CMS.

---

## 📦 Package Manifest

| File | Description |
| :--- | :--- |
| `main.tex` | Complete 1,250+ line master LaTeX document with all 15 chapters, 2 appendices, TikZ vector diagrams, listings, and tables. |
| `latexmkrc` | Automated Overleaf compilation directive configuring two-pass `pdfLaTeX` execution for table of contents, figures, and hyperref links. |
| `DPSI_Technical_Documentation_Overleaf.zip` | Pre-packaged ZIP archive ready for 1-click import into Overleaf. |

---

## 🚀 How to Import and Compile in Overleaf

### Method 1: Instant ZIP Upload (Recommended — 30 Seconds)
1. Log into [Overleaf](https://www.overleaf.com/).
2. Click **New Project** (top-left button) $\rightarrow$ **Upload Project**.
3. Drag and drop `overleaf/DPSI_Technical_Documentation_Overleaf.zip` (or select it from your file browser).
4. Overleaf will automatically unpack `main.tex` and `latexmkrc`.
5. Click **Recompile** (green button).

### Method 2: Manual Copy & Paste
1. On [Overleaf](https://www.overleaf.com/), click **New Project** $\rightarrow$ **Blank Project**.
2. Name the project: `DPSI Technical Documentation`.
3. Open the generated `main.tex` file in Overleaf, select all, and delete the default template.
4. Open [`overleaf/main.tex`](./main.tex) in your editor, copy the entire file content, and paste it into Overleaf.
5. Click **Recompile**.

---

## ⚙️ Recommended Overleaf Compiler Settings

Ensure your Overleaf project settings (accessible via the **Menu** button at the top-left of the Overleaf interface) are configured as follows:

- **Compiler**: `pdfLaTeX` (recommended for fastest compilation) or `XeLaTeX` / `LuaLaTeX`
- **TeX Live Version**: `2024` or `2025` / `2026`
- **Main Document**: `main.tex`
- **Spell Check**: `English`

> **Note on Cross-References & Table of Contents**: LaTeX requires **two compilation passes** to compute the page numbers for the Table of Contents, List of Figures, and List of Tables. The included `latexmkrc` triggers this automatically, or you can click **Recompile** once more if question marks (`??`) appear.

---

## 📑 Complete Document Outline (15 Chapters + 2 Appendices)

1. **Chapter 1: Executive Summary & Project Abstract**
   - High-level architectural pillars (React 19 SPA, tRPC v11, MongoDB Multi-Tenant, Gemini AI, 3D VR)
   - Core objectives & quantitative performance targets
2. **Chapter 2: Architectural Comparison: Modern Platform vs. Legacy PHP/WordPress**
   - Side-by-side comparative matrix across 15 technical dimensions
   - Visual Core Web Vitals benchmark graph (LCP: 0.7s vs 4.8s, TTFB: 80ms vs 1.8s)
3. **Chapter 3: System Architecture & Visual Diagrams**
   - Native TikZ end-to-end multi-tier architecture diagram
   - 9-step request lifecycle and security middleware pipeline
   - Dynamic database routing via Node.js `AsyncLocalStorage`
4. **Chapter 4: VR 360° Interactive Campus Tour & 3D Spatial Engine**
   - Equirectangular projection and inverted sphere geometry mapping
   - Spatial raycasting for POI hotspots and mobile gyroscope orientation
   - WebGL context loss recovery and physical materials
   - **Interactive WebGL Liquid Metal Shader Engine** with fluid wave propagation mathematics
5. **Chapter 5: Complete Technology Stack Catalogue**
   - Frontend and backend production dependencies (including React 19, Vite 7, Hono 4, tRPC 11, Three.js, Lenis, Shaders)
   - Comprehensive codebase volume breakdown (101,000+ LOC)
6. **Chapter 6: Database Architecture & Schema Catalogue**
   - Schema rigidity and pre-warming architecture
   - Complete 31 Mongoose schemas catalogue (including `ButtonStyle`)
   - Cryptographically chained SHA-256 audit trail ledger with tamper-resistant pre-hooks
7. **Chapter 7: API Architecture & Procedure Definitions**
   - End-to-end type-safe tRPC v11 router paradigm
   - 12 functional routers breakdown and procedure access levels
8. **Chapter 8: Conversational AI & Neural Voice System**
   - Admissions RAG pipeline diagram (Google Gemini 2.0 Flash + ElevenLabs TTS)
   - Anti-jailbreak filtering, character quota guards, and abort timeouts
9. **Chapter 9: Frontend Architecture, UI/UX & PWA**
   - Client-side lazy-loaded page route manifest
   - Certified Progressive Web App (PWA) with 109 precached assets
   - **Kinematic Smooth Momentum Scrolling Engine (Lenis v1.3.18)**
   - Velocity-dependent glowing scrollbar indicator
   - High-performance off-screen containment (`content-visibility: auto`)
   - Procedural footer canvas grid animation
10. **Chapter 10: Cybersecurity Audit & Hardening Report**
    - Grade A (96/100) penetration audit verification
    - OWASP Top 10 evaluation matrix
    - Remediated vulnerability register (CWE-287, CWE-307, CWE-434, CWE-770, CWE-330)
11. **Chapter 11: Automated Testing Suite & Verification**
    - Vitest execution log: 87/87 automated tests passing in 1.90s
12. **Chapter 12: Deployment Pipeline & DevOps**
    - 5-stage CI/CD visual build & edge deployment pipeline
13. **Chapter 13: Annual Total Cost of Ownership (TCO) Analysis**
    - Line-item annual infrastructure cost comparison ($12/yr minimum vs $350-$800/yr enterprise)
14. **Chapter 14: Future Scope & Institutional Expansion**
    - Multilingual i18n, Parent/Student portal, Web Push notifications, Indian payment gateway
15. **Chapter 15: Technical Glossary**
    - Formal engineering definitions for key concepts
- **Appendix A: NPM Operational Scripts Reference**
- **Appendix B: Environment Variables Specification**

---

## 🎨 Vector Visuals — Zero External Image Dependencies

All diagrams, charts, and architectural schematics in this document are authored using **native PGF/TikZ code**. There are **no external PNG, JPG, or SVG image files required**, ensuring:
- Zero broken image links upon upload to Overleaf.
- Infinite vector zoom clarity and crisp typography in the exported PDF.
- Single-file self-sufficiency.
