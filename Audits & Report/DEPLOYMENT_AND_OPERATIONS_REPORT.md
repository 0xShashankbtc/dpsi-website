# 🚀 DPS Indirapuram Web Portal — Deployment & Operations Guide

**Platform Status**: 🟢 Production Active  
**Live Production URL**: `https://dpsindirapuram.vercel.app`  
**Hosting Architecture**: Vercel Edge Serverless Functions (Node.js 20 runtime)  
**Database Cluster**: MongoDB Atlas (Multi-Tenant High Availability)  
**Media Delivery**: Cloudinary CDN (Automated WebP/AVIF Transcoding)

---

## 1. Production Architecture Overview

```
[ Global Users (Web / Mobile PWA) ]
                │
                ▼ (Anycast DNS / SSL)
       [ Vercel Edge Network ]
                │
       ┌────────┴──────────────────────────┐
       │                                   │
       ▼ (Static Assets & PWA Cache)       ▼ (Serverless API Dispatch)
[ CDN Edge Cache (dist/public) ]      [ /api/trpc/* Serverless Handler ]
                                                   │
                                                   ├──► Groq LPUs (Llama-3.3-70B)
                                                   ├──► Google Cloud Text-to-Speech
                                                   └──► MongoDB Atlas Cluster
```

---

## 2. Environment Variables & Secret Configuration

The platform securely consumes the following production environment variables:

| Variable Name | Role | Source / Provider |
| :--- | :--- | :--- |
| `MONGODB_URI` | Multi-Tenant Atlas Connection URI | MongoDB Atlas |
| `JWT_SECRET` | HS256 Secret Key for Admin Authentication | Doppler / Vercel Secret |
| `GROQ_API_KEY` | Fast LPU Inference for AI Assistant | Groq Cloud |
| `GOOGLE_TTS_API_KEY` | Google Cloud Journey & Neural2 Speech Engine | Google Cloud Console |
| `ELEVENLABS_API_KEY` | Optional Fallback Voice Synthesis Key | ElevenLabs API |
| `CLOUDINARY_URL` | Media Storage & Automatic WebP Transformation | Cloudinary |
| `ADMIN_USERNAME` | Master Admin Recovery Identifier | Doppler / Vercel Secret |
| `ADMIN_PASSWORD` | Initial Admin Password (Requires Reset) | Doppler / Vercel Secret |

---

## 3. Deployment & CI/CD Procedures

### Standard Production Deployment
```bash
# 1. Verify TypeScript compilation and run test suite
npm run check
npm test

# 2. Build production assets
npm run build

# 3. Commit and push to GitHub repository
git add .
git commit -m "feat: your update description"
git push origin main

# 4. Deploy directly to Vercel production
npx vercel --prod --yes
```

---

## 4. Routine Maintenance & Disaster Recovery

### 4.1 Database Backups & Point-In-Time Recovery
* MongoDB Atlas automatically creates automated snapshots every 6 hours with 7-day retention.
* Point-In-Time Recovery (PITR) allows database restoration to any exact second within the last 7 days.

### 4.2 Admin Credential Recovery
If the admin password is lost or forgotten:
1. Update `ADMIN_PASSWORD` in the environment configuration (`.env` or Vercel Environment Variables).
2. The platform's startup routine detects the environment override, re-hashes the password via Bcrypt (12 rounds), updates the admin record, and sets `isDefaultPassword: true` (mandating a fresh password change on login).

### 4.3 PWA Service Worker Cache Updates
When deploying new frontend updates, the `vite-plugin-pwa` build process automatically regenerates cache revision hashes (`workbox-*.js`). The client service worker detects the new build within 60 seconds and updates seamlessly in the background without breaking active user sessions.
