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

## 📦 Production Build

```bash
npm run build
```
Compiled static assets are placed in the `dist/` folder with relative pathing (`./`), preventing blank-screen issues on GitHub Pages and custom subpaths.
