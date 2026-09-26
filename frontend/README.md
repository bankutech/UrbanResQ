# UrbanResQ — Frontend Operations Cockpit

Tactical Emergency Operations Center (EOC) user interface engineered with React 18, TypeScript, Three.js 3D WebGL, and Tailwind CSS.

## Architecture

- **Core**: React 18, TypeScript, Vite
- **3D Tactical Engine**: Three.js WebGL canvas featuring interactive relief medkit, telemetry radar rings, and dynamic topography
- **Mapping**: Leaflet and React-Leaflet with custom high-contrast dark GIS theme
- **Telemetry**: Recharts with tabular numeral alignment
- **Styling**: Tailwind CSS with strict 90-degree tactical corners (`rounded-none`) and zero-scroll cockpit viewports

## Directory Structure

```
frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── maps/
│   ├── pages/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Setup & Running

Install dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

Run TypeScript verification and production build:
```bash
npx tsc -b
npx vite build
```
