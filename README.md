# 📝 TypeSpace (Working Title)

A minimal **local-first note-taking app** built with Next.js, starting small with typewriter-style notes and scaling into a full SaaS product with collaboration, subscriptions, and mobile apps.

---

## 🚀 Project Roadmap

### ✅ Phase 1 (MVP)

* [x] Local storage with a single note
* [x] Typewriter-style font for distraction-free writing

### ✅ Phase 2

* [ ] Multiple notes/pages (IndexedDB or Dexie.js)
* [ ] Markdown editor or Rich Text editor (TipTap / Slate.js)

### ✅ Phase 3

* [ ] Database (Postgres via Supabase + Prisma)
* [ ] User authentication (Google login with NextAuth.js)

### ✅ Phase 4

* [ ] Real-time collaboration (WebSockets or Firestore)
* [ ] Upload & resize images inside notes

### ✅ Phase 5

* [ ] Mobile app (React Native, reusing backend APIs)
* [ ] Subscription plans (Stripe integration, paywall for >1 page)

---

## 📂 Folder Structure (Next.js 14 App Router)

```
my-notes-app/
│── app/                     # Next.js app router
│   ├── layout.tsx
│   ├── page.tsx             # Home (note editor MVP)
│   ├── notes/               # Multiple notes (Phase 2+)
│   └── api/                 # API routes (Phase 3+)
│
│── components/              # Reusable UI components
│── lib/                     # Utilities (db, auth helpers, etc.)
│── styles/                  # Tailwind/global styles
│── public/                  # Static assets (icons, logos)
│── package.json
│── next.config.js
```

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 14 (App Router) + Tailwind CSS
* **State & Local Storage**: React hooks + localStorage / IndexedDB
* **Database (Phase 3)**: Postgres + Prisma (Supabase hosting)
* **Auth (Phase 3)**: NextAuth.js (Google provider)
* **Collaboration (Phase 4)**: WebSockets / Firestore
* **Payments (Phase 5)**: Stripe subscriptions
* **Mobile App (Phase 5)**: React Native (reusing backend)

---

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/ali01129
cd typespace

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✨ Features (Current vs Future)

* **Current**

  * Typewriter font
  * Auto-saving notes in browser

* **Future**

  * Multiple pages
  * Rich text / Markdown support
  * Google login & cloud sync
  * Real-time collaboration
  * Image upload & resizing
  * Mobile app support
  * Subscription paywall

---

## 📌 License

MIT License © 2025 \[Your Name]

---

## 🌟 Contributing

Contributions are welcome!
Feel free to fork this project and submit a pull request.
