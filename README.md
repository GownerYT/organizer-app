# Organizer

Organizer is an offline-first desktop task manager built with React and Electron. Tasks are stored in a local SQLite database and are available again after the app is closed and reopened.

## Development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
```

## Data location

During development, `organizer.db` is created in the project root. In a packaged build, it is created beside `Organizer.exe`. This keeps the release portable: moving a writable distribution folder also moves the task data. The folder must be writable by the current user.

The database is initialized automatically on first launch and is never overwritten when the app is rebuilt or updated.

## Packaging

Build a Windows folder distribution with:

```bash
npm run package
```

The output is written to `release/win-unpacked/`. It contains the executable and `icon.ico`; the database will be created beside the executable on first launch.

The renderer cannot access Node.js, the filesystem, or SQL directly. Task operations cross the preload bridge through a small, explicit API, with validation repeated in the Electron main process.
