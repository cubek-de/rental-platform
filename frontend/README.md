# WohnmobilTraum Frontend

Dies ist das Frontend für die WohnmobilTraum-Plattform, eine Webapplikation zur Vermietung von Wohnmobilen, Wohnwagen und Kastenwagen.

## Technologien

- React 18 mit Vite
- React Router v6 für das Routing
- Tailwind CSS für das Styling
- Flowbite React für UI-Komponenten
- Axios für API-Anfragen
- Formik und Yup für Formularvalidierung

## Einrichtung

### Voraussetzungen

- Node.js (Version 16.x oder höher)
- npm oder yarn

### Installation

1. Abhängigkeiten installieren:

   ```bash
   npm install
   ```

2. Lokale Entwicklungsumgebung starten:

   ```bash
   npm run dev
   ```

3. Build für die Produktion erstellen:
   ```bash
   npm run build
   ```

## Umgebungsvariablen

Erstellen Sie eine `.env`-Datei im Root-Verzeichnis mit folgenden Variablen:

```
VITE_API_URL=http://localhost:5000
```

## Projektstruktur

- `src/components`: Wiederverwendbare React-Komponenten
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
