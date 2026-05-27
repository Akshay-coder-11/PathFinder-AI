# AI Pathfinder Admin Subsystem Manual ⚙️

Welcome to the **Admin & System Architecture Subsystem**! This directory represents the central planning and configurations of our application's backend database metrics and theme customizations.

## 📂 Project Architecture Mapping

Here is how your codebase is structured with maximum visual and logical separation:

```
├── 📁 frontend/           <--- 🎨 USER INTERFACE (React, Tailwind, CSS, Recharts)
│   ├── 📄 App.tsx          - Your student portal, milestoning screens & chat UI
│   ├── 📄 index.css        - Preline themes & dark mode custom contrast stylesheets
│   └── 📁 components/      - Student chat interfaces with Gemini AI
│
├── 📁 backend/            <--- 🤖 API SERVER (Node.js, Express, Token Auth, db schemas)
│   ├── 📄 server.ts        - Exposes assessment routes & live system telemetry
│   ├── 📄 auth.ts          - Generates student JWT security credentials
│   └── 📄 db.ts            - Auto-fallback MongoDB / JSON schema tracker
│
└── 📁 admin/              <--- 🛡️ ADMINISTRATIVE HUB (Configs & metrics manual)
    ├── 📄 admin_config.json - Core settings for administrators
    └── 📄 README_ADMIN.md   - This architectural manual you are reading right now!
```

---

## 🛠️ Key Administration Panel Commands

### 📁 1. Frontend Control
- Uses **Tailwind v4** with a bespoke custom palette switch.
- Manages **Dark Contrast Choices**: `Slate Theme`, `Midnight Theme`, and `Charcoal Theme`.
- Tracks and renders custom brand accents across 4 forest-bronze-blue models.

### 🤖 2. Backend Controls
- Automatically spins up the server process on standard port `3000`.
- Secures standard REST routes via a custom JWT bearer token verified middleware.

### 💾 3. Live Database Panel
- Renders total student registration tallies with real-time names & signup times.
- Exposes uptime counters and storage modes (Atlas Server vs. File system database models).
