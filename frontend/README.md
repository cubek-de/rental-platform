# WohnmobilTraum Frontend

Frontend für die WohnmobilTraum-Plattform, eine moderne Webapplikation zur Vermietung von Wohnmobilen, Wohnwagen und Kastenwagen, entwickelt mit React und Vite.

## Features

- Moderne React-Architektur mit Hooks und Context API
- Responsive Design mit Tailwind CSS
- Benutzerfreundliche UI-Komponenten mit Flowbite
- Sichere Authentifizierung und Autorisierung
- Echtzeit-Buchungssystem
- Fahrzeugsuche und Filterung
- Admin- und Agent-Dashboards
- Mobile-first Design

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Flowbite React
- **Routing**: React Router DOM v7
- **Forms**: Formik + Yup
- **HTTP Client**: Axios
- **Icons**: React Icons, Heroicons
- **Notifications**: React Hot Toast
- **Date Picker**: React DatePicker
- **Linting**: ESLint
- **Deployment**: Statische Builds für Hosting

## Getting Started

### Prerequisites

- Node.js (v18 oder höher)
- npm oder yarn
- Backend API (siehe api/README.md)

### Installation

1. Repository klonen
2. In das frontend-Verzeichnis wechseln: `cd frontend`
3. Abhängigkeiten installieren: `npm install`
4. Umgebungsvariablen kopieren: `cp .env.example .env`
5. `.env` mit Ihren tatsächlichen Werten füllen
6. Entwicklungsserver starten: `npm run dev`

### Environment Variables

Erstellen Sie eine `.env` Datei im frontend-Verzeichnis:

```
VITE_API_URL=http://localhost:5005
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Scripts

- `npm run dev`: Entwicklungsserver starten (Port 5173)
- `npm run dev:force`: Server mit Port-Bereinigung starten
- `npm run build`: Produktionsbuild erstellen
- `npm run preview`: Build lokal testen
- `npm run lint`: Code linten

## Projektstruktur

```
frontend/
├── public/              # Statische Assets
├── src/
│   ├── assets/          # Bilder, Icons
│   ├── components/      # Wiederverwendbare Komponenten
│   │   ├── admin/       # Admin-spezifische Komponenten
│   │   ├── agent/       # Agent-Komponenten
│   │   ├── auth/        # Authentifizierung
│   │   ├── booking/     # Buchungs-Komponenten
│   │   ├── layout/      # Layout (Header, Footer)
│   │   ├── user/        # Benutzer-Komponenten
│   │   └── vehicle/     # Fahrzeug-Komponenten
│   ├── context/         # React Context
│   ├── pages/           # Seitenkomponenten
│   ├── services/        # API-Services
│   ├── utils/           # Hilfsfunktionen
│   ├── App.jsx          # Haupt-App-Komponente
│   ├── index.css        # Globales CSS
│   └── main.jsx         # App-Einstiegspunkt
├── index.html           # HTML-Template
├── vite.config.js       # Vite-Konfiguration
├── tailwind.config.js   # Tailwind-Konfiguration
├── postcss.config.js    # PostCSS-Konfiguration
└── package.json
```

## API Integration

Die App kommuniziert mit der Backend-API über RESTful Endpoints. Alle API-Aufrufe sind in `src/services/` zentralisiert.

## Deployment

1. Build erstellen: `npm run build`
2. Dist-Verzeichnis auf Webserver deployen (z.B. Netlify, Vercel, Apache)
3. Environment-Variablen für Produktion setzen

## Contributing

1. Fork das Repository
2. Feature-Branch erstellen
3. Änderungen vornehmen
4. Linting prüfen: `npm run lint`
5. Commit und Push
6. Pull Request erstellen

## Browser Support

- Chrome (neueste)
- Firefox (neueste)
- Safari (neueste)
- Edge (neueste)

## Lizenz

ISC

- `src/pages`: Seitenkomponenten, die Routen zugeordnet sind
- `src/context`: React Context für globales State Management
- `src/services`: API-Services und Integrationen
- `src/utils`: Hilfsfunktionen und Utilities
- `src/assets`: Statische Assets wie Bilder und Fonts

## Funktionen

- Benutzerauthentifizierung (Registrieren, Anmelden, Passwort zurücksetzen)
- Fahrzeugsuche und -filterung
- Fahrzeugdetailansichten
- Buchungssystem
- Benutzerprofil und Dashboard
- Fahrzeugverwaltung für Vermieter
- Admin-Bereich für Plattformadministratoren

## Mitwirkende

Entwickelt von Gardian Memeti
