# FoundIt AI — Smart Campus Lost & Found (100% Google Stack)

> **"Lost something? Let's bring it back."**  
> *Smart lost-and-found for your campus powered by Google Tools & AI.*

FoundIt AI is a full-stack, responsive web application engineered for college hackathons. It enables students and campus personnel to report lost items, log recovered items, search existing reports, and correlate candidate matches using an intelligent, transparent matching engine.

---

## 🌐 100% Google Stack Architecture

FoundIt AI runs entirely on Google technologies:

1. **Google Cloud Firestore (`firebase/firestore`)**:
   - High-performance, real-time NoSQL document database.
   - Collections for `item_reports`, `item_matches`, and `profiles`.
   - Comprehensive access control with `firestore.rules`.
2. **Google Firebase Storage (`firebase/storage`)**:
   - Google Cloud Storage bucket for optional item photos.
   - Upload restrictions: images only, max 5MB, whitelisted MIME types.
3. **Google Firebase Authentication (`firebase/auth`)**:
   - User identity, Google Sign-in, and student accounts.
4. **Google Gemini 2.5 Flash (`@google/genai`)**:
   - Semantic description analysis comparing lost and found reports.
   - Transparently falls back to deterministic rule-based matching when API keys are not supplied.
5. **Deterministic Heuristic Engine**:
   - Normalizes text, matches campus spatial zones, detects color contradictions, checks chronological proximity, and applies transparent weighted scoring (0–100 pts).

---

## 🚀 Key Features

1. **Intelligent Heuristic & Gemini AI Matching Engine**
   - Correlates lost and found reports using transparent attribute scoring.
   - Weights: Name & Category (30%), Description & Distinguishing details (25%), Location proximity (20%), Color consistency (15%), Date timeline proximity (10%).
   - Explicitly penalizes meaningful contradictions (e.g. black vs red color conflicts, retroactive timeline anomalies).
   - Strict integrity: Never matches lost-to-lost or found-to-found, excludes self-matches, and ignores resolved reports.
   - Highlights shared, conflicting, and uncertain attributes with a mandatory disclaimer: *"Possible match — verify the item before claiming it."*

2. **Real-time Campus Dashboard (`/`)**
   - Dynamic summary statistics derived from real records (Active reports, Lost items, Found items, Correlated matches).
   - Hero search bar with instant keyword routing.
   - Top possible matches preview highlighting highest-scoring pairs.
   - Recent lost-and-found activity feed with quick category/status filters.

3. **Single Reusable Report Form (`/create`)**
   - One unified form for both Lost and Found reports.
   - Powered by **React Hook Form** and **Zod** schema validation.
   - Prevents duplicate submissions while saving.
   - Validates required fields, non-future dates, and image restrictions (max 5MB, JPG/PNG/WEBP).
   - Resets only upon verified backend success.

4. **Browse & Filter Directory (`/browse`)**
   - Multi-attribute filtering (Lost vs Found, category, campus location, date, newest/oldest).
   - Real-time search by keyword, item name, location, or color.

5. **Report Details (`/reports/:id`)**
   - Complete item details and metadata.
   - Shows candidate matches specifically correlated to this report.
   - Reporter identity privacy preservation (never leaks student personal contact information).

6. **Candidate Matches Directory (`/matches`)**
   - Full list of correlated lost/found pairs.
   - Filter by match score confidence (All Plausible ≥30%, Moderate+ ≥50%, High Probability ≥70%).
   - Detailed attribute overlap cards and mathematical score breakdown.

7. **My Reports & Ownership Protection (`/my-reports`)**
   - View, edit, resolve, and delete reports created by the current user.
   - Prevents unauthorized edits and deletes of reports created by other users.
   - Interactive Development Demo Mode persona switcher (Alice, Bob, Carol) to immediately test ownership policies during evaluation.

8. **Google Tools Setup Inspector (`/setup`)**
   - Real-time Google Firebase & Firestore connection diagnostics.
   - One-click copy for `.env`, `firestore.rules`, and `storage.rules`.
   - One-click hackathon test fixture seeder (6 canonical campus items).

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS, React Router v7, Lucide Icons
- **Form Management:** React Hook Form + Zod
- **Backend / Database:** Google Cloud Firestore (`firebase/firestore`)
- **Storage:** Google Cloud Storage / Firebase Storage (`firebase/storage`)
- **Authentication:** Google Firebase Auth (`firebase/auth`)
- **Artificial Intelligence:** Google Gemini 2.5 Flash via official `@google/genai` SDK
- **Security:** `firestore.rules` and `storage.rules`
- **Testing:** Vitest automated test suite (12 tests)

---

## 📁 Project Structure

```
foundit-ai/
├── src/
│   ├── config/
│   │   └── firebase.ts            # Google Firebase app, Firestore, Storage, Auth
│   ├── context/
│   │   ├── AuthContext.tsx        # Firebase Auth & Demo persona switcher
│   │   └── ToastContext.tsx       # Global toast notification provider
│   ├── types/
│   │   └── index.ts               # Complete TypeScript data contracts
│   ├── services/
│   │   ├── matchingEngine.ts      # Transparent matching engine & heuristics
│   │   ├── geminiService.ts       # Google Gemini 2.5 Flash AI integration
│   │   ├── reportsService.ts      # Unified Firestore & in-memory data service
│   │   ├── storageService.ts      # Firebase Storage & validation service
│   │   └── seedData.ts            # 6 canonical hackathon demo reports
│   ├── components/
│   │   ├── common/                # Button, Badge, Card, Modal, Toast, Skeleton, etc.
│   │   ├── layout/                # Navbar, Footer, Layout wrapper
│   │   ├── dashboard/             # StatsOverview, HeroBanner, TopMatchesPreview
│   │   └── reports/               # ReportCard, ReportForm, ReportFilters, MatchExplanationCard
│   ├── pages/
│   │   ├── HomePage.tsx           # Main dashboard
│   │   ├── BrowsePage.tsx         # Search & filter directory
│   │   ├── CreateReportPage.tsx   # Report creation
│   │   ├── ReportDetailsPage.tsx  # Item details + matched candidates
│   │   ├── MatchesPage.tsx        # All candidate matches
│   │   ├── MyReportsPage.tsx      # User report management & ownership
│   │   └── SetupGuidePage.tsx     # Google Cloud & Firebase Setup guide
│   ├── tests/
│   │   ├── matchingEngine.test.ts # Vitest matching engine unit tests
│   │   └── validation.test.ts     # Vitest Zod schema & file upload tests
│   ├── App.tsx                    # Routes configuration
│   ├── main.tsx                   # Application entrypoint
│   └── index.css                  # Tailwind styles
├── firestore.rules                # Google Cloud Firestore security rules
├── storage.rules                  # Firebase Storage security rules
├── .env.example                   # Google environment variable template
└── package.json
```

---

## ⚡ Quick Start

### 1. Installation

```bash
cd foundit-ai
npm install
```

### 2. Run Automated Unit Tests

```bash
npm test
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🔧 Connecting to Google Cloud / Firebase (Optional Live Mode)

The application works immediately in **Interactive Demo Mode** with real in-memory state and the 6 canonical hackathon test reports. To connect to live Google Cloud services:

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Cloud Firestore** and **Firebase Storage**.
3. Deploy security rules:
   ```bash
   # Deploy Firestore and Storage rules
   firebase deploy --only firestore:rules,storage
   ```
4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Enter your Firebase project credentials from Project Settings:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_GEMINI_API_KEY=your-gemini-key
   ```
6. Restart the dev server (`npm run dev`). The top banner immediately updates to **"Google Firebase Connected"**.
