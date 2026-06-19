# Lanify

Minimal Next.js App Router starter wired up with Chakra UI.

## Demo

<img width="1280" height="720" alt="lanify" src="https://github.com/user-attachments/assets/ad4e4560-24a6-44f5-8634-0956e0686ef7" />

## Requirements

- Node.js 20.9.0 or newer
- Yarn

## Development

```bash
yarn install
yarn dev
```

## Background Removal

Lanify now supports manual background removal for uploaded profile photos.

The current flow is:

- upload a profile photo
- the image editor opens automatically
- click `Remove Background`
- the app posts the original image to `POST /api/remove-background`
- the Next.js route forwards the image to the internal `rembg` service
- the transparent PNG is stored in `avatarTransparentUrl`

The original upload remains in `avatarUrl`, so the app can always fall back safely if background removal fails.

## Environment Variables

Create a local env file from the example and point it at the `rembg` service you want the Next.js server to use:

```bash
cp .env.example .env.local
```

Default:

```bash
REMBG_SERVICE_URL=http://localhost:7000
```

When running inside Docker Compose, the `web` container uses `http://rembg:7000`.

## Docker

The repo includes:

- `Dockerfile` for the Next.js app
- `rembg-service/Dockerfile` for the Python `rembg` API
- `docker-compose.yml` for local multi-container development

Build and start both services with:

```bash
docker compose up --build
```

For day-to-day development, the `web` service mounts only `src` and a few Next.js config files. The rest of the app, including `node_modules`, stays inside the container image, which avoids the slow full-repo bind mount and the expensive `node_modules` volume population step.

If you change `package.json` or `yarn.lock`, rebuild the image:

```bash
docker compose up --build
```

Ports:

- `3000` for the Next.js app
- `7000` is only exposed on the internal Compose network for `rembg`

The `rembg` service is intentionally private behind the Next.js route so the browser never talks to it directly.
