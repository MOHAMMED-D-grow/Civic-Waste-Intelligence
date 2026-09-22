# CleanWatch AI 🌿

> **AI-Powered Open-Area Waste Detection & Smart Civic Reporting Platform**  
> Tailored for urban municipal jurisdiction with OpenStreetMap integration and verified Indian environmental regulations.

---

## 🚀 Key Features

### 1. 🔍 AI Vision Waste Analysis
- **Automatic Waste Categorization**: Leverages multimodal Gemini AI to identify municipal solid waste types (plastics, construction debris, organic garbage, industrial/electronic hazard).
- **Severity & Impact Evaluation**: Analyzes waste volume, drainage blockage risks, and public health impact scores.
- **Estimated Weight & Clearance Equipment**: Suggests appropriate municipal dispatch vehicles (tipper trucks, compactor, manual squad).

### 2. 🗺️ Location Picker & OpenStreetMap Nominatim Auto-Complete
- **Street Address Auto-Complete**: Real-time address suggestion service powered by the OpenStreetMap **Nominatim API**, allowing citizens to search street names, landmarks, and roads.
- **Draggable Interactive Leaflet Pin**: Fine-tune the exact coordinates on an interactive map.
- **Bi-Directional Reverse Geocoding**: Automatically resolves pinned coordinates into human-readable street names and ward details.
- **Quick-Select Civic Hotspots**: One-tap locality selection for major municipal zones (Gandhipuram, RS Puram, Race Course, Peelamedu, Town Hall, Saibaba Colony, etc.).
- **Device GPS Geolocation**: Instant high-accuracy coordinate acquisition via browser geolocation.

### 3. 📜 Official Acts & Waste Rules Section
Dedicated civic education section with direct links to verified Government of India portals:
- **Solid Waste Management Rules, 2016** (`https://cpcb.gov.in/waste-management-rules/`)
- **Ministry of Environment, Forest and Climate Change (MoEFCC)** (`https://moef.gov.in/`)
- **Central Pollution Control Board (CPCB)** (`https://cpcb.gov.in/`)
- **Swachh Bharat Mission – Urban** (`https://swachhbharaturban.gov.in/`)
- **Coimbatore City Municipal Corporation (CCMC)** (`https://www.ccmc.gov.in/`)
- **Citizen Segregation Guide**: Plain-language breakdown of Wet (Biodegradable), Dry (Recyclable), and Domestic Hazardous waste streams.

### 4. 📋 Public Civic Reports Ledger & Status Dashboard
- **Lifecycle Tracking**: Monitor reports across `Reported`, `In Review`, `Dispatched`, and `Resolved` stages.
- **Verification & Filtering**: Filter by urgency, municipal zone, date, and resolution status.
- **Civic Detail View**: Detailed report pages with photo evidence, detected waste profile, coordinates, and municipal escalation stamps.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Lucide Icons
- **Mapping & Geocoding**: Leaflet, OpenStreetMap, Nominatim API
- **Backend**: Express.js with TypeScript (`tsx`), in-memory TTL caching
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Build Tool**: Vite (with relative asset path configuration `base: './'`)

---

## 💻 Getting Started (Run Locally)

### Prerequisites
- Node.js 18+ installed on your computer
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone or Download Repository
```bash
git clone <your-repository-url>
cd cleanwatch-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🌐 GitHub Pages Deployment (Fixing "Link Not Opening")

If your GitHub link was not opening or showing a blank page / 404, this has been resolved through three coordinated solutions:

### Option 1: Automatic Deployment via GitHub Actions (Recommended)
This repository includes `.github/workflows/deploy.yml`. To enable zero-configuration automated deployments:
1. Open your repository on GitHub.
2. Go to **Settings** > **Pages** (in the left sidebar).
3. Under **Build and deployment** > **Source**, select **"GitHub Actions"**.
4. That's it! GitHub will automatically run the build workflow and deploy the compiled site. Your site link will be active at `https://<username>.github.io/<repository-name>/`.

### Option 2: Deploy Directly from the `/docs` Folder
If you prefer standard branch deployment without GitHub Actions:
1. Go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **"Deploy from a branch"**.
3. Under **Branch**, select `main` and set the folder dropdown to **`/docs`**.
4. Click **Save**. The pre-compiled production build in `/docs` will be served immediately.

### What Was Fixed:
1. **Relative Asset URLs (`base: './'`)**: Prevents 404 errors when assets are hosted under a repository subpath (`/<repo-name>/assets/...`).
2. **`.nojekyll`**: Disables Jekyll processing on GitHub Pages so asset directories are never ignored.
3. **`404.html` SPA Redirection**: Prevents blank 404 screens when refreshing deep routes on GitHub Pages.
4. **Static AI Fallback Engine**: If hosted statically without a Node.js Express server, the civic reporting workflow automatically falls back to client-side verification rather than failing with network errors.
5. **Uncompiled Source Redirection**: If GitHub Pages is accidentally pointed to the repository root `/` (which contains uncompiled `.tsx` files), it automatically redirects visitors to the compiled `/docs/` bundle.

---

## 📦 Production Build

```bash
npm run build
```
Compiled static assets are generated in `dist/` and mirrored to `docs/` with relative pathing (`./`).

