# QR Reverse Engineering Sandbox

A production-quality React application for parsing, generating, and experimenting with QR payloads.

## Features

- **Payload Parser** - Parse and validate QR payloads with `#`-delimited format
- **QR Generator** - Generate QR codes from parsed payloads
- **Live Refresh** - Automatically refresh QR every N seconds with new timestamps
- **Countdown Timer** - Visual countdown to next refresh
- **Developer Tools** - Edit individual payload fields in real-time
- **History** - Track last 100 payloads with copy and export
- **Settings** - Customize refresh interval, dark mode, and more
- **Logging** - Console log of all operations
- **Statistics** - Track refresh count, elapsed time, and more
- **PWA** - Installable progressive web app with offline support

## Technology Stack

- React 19 + TypeScript
- Vite
- qrcode.react
- CSS Modules (plain CSS)
- Material Design 3 inspired theming

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Push to `main` branch to trigger automatic deployment to GitHub Pages.

## License

MIT
