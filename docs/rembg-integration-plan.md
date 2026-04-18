# Rembg Integration Plan

## Summary
Add background removal as a manual action in the profile step, powered by a local `rembg` service running alongside the Next.js app in Docker. The setup should support both local development and production-style container images.

The intended user flow is:
- user uploads a profile photo
- app stores the original in `avatarUrl`
- user clicks `Remove Background`
- frontend sends the original image to a Next API route
- API forwards the image to the Dockerized `rembg` service
- transparent PNG result is returned and stored in `avatarTransparentUrl`
- card previews prefer `avatarTransparentUrl` when present, otherwise fall back to `avatarUrl`

## Implementation Changes
### 1. Background-removal architecture
- Add a dedicated Python `rembg` service container, exposed only to the app network.
- Add a Next.js server route such as `src/app/api/remove-background/route.ts` that accepts an uploaded image and returns a transparent PNG result.
- Keep `rembg` isolated behind the Next app so the browser never calls the Python service directly.
- Configure the Next app with an internal service URL env var, e.g. `REMBG_SERVICE_URL=http://rembg:7000`.

### 2. Profile image flow
- Keep the existing upload behavior in `ProfileReviewForm`: upload still reads the user’s image and stores it as the original `avatarUrl`.
- Change the current `Edit Current Picture` action into an explicit remove-background action, or replace it with a clearer label like `Remove Background`.
- On click:
  - require `profile.avatarUrl`
  - call the Next API route with that image
  - store the returned transparent image in `avatarTransparentUrl`
- Add transient UI state in the component for:
  - loading
  - success
  - failure
- Disable the button while processing and surface a short error message if removal fails.
- Preserve the original upload even if background removal fails.

### 3. Data and rendering behavior
- Keep the current `UserProfile` shape; no new persistent schema is required because `avatarUrl` and `avatarTransparentUrl` already exist.
- Keep preview/render precedence as:
  - `avatarTransparentUrl`
  - then `avatarUrl`
  - then silhouette/fallback
- Do not change card-generation semantics beyond ensuring the transparent version is used when present.

### 4. Docker and runtime setup
- Add a `Dockerfile` for the Next.js app.
- Add a separate `Dockerfile` for the Python `rembg` service.
- Add `docker-compose.yml` with at least:
  - `web` service for Next.js
  - `rembg` service for background removal
- For local dev:
  - mount source into the `web` container
  - run the app with the existing dev command
  - wire the `web` service to the internal `rembg` hostname
- For prod-style images:
  - multi-stage Next.js image build
  - production Python image with pinned `rembg` dependencies
  - non-root runtime where practical
- Add `.dockerignore` files or equivalent exclusions to keep images small.
- Document required ports, env vars, and startup commands in the README.

### 5. API contract and failure handling
- API route request:
  - multipart upload or image blob payload from the browser
- API route response:
  - success: image payload or base64/data URL for the transparent PNG
  - failure: structured JSON error with friendly message
- Route should validate:
  - file exists
  - supported image MIME type
  - reasonable size limit
- Route should map rembg/network failures to stable frontend-friendly errors.
- If the rembg service is down, the profile flow still works with the original photo.

## Test Plan
- Upload a profile photo and verify the original preview updates immediately.
- Click `Remove Background` and verify:
  - loading state appears
  - button is disabled during processing
  - transparent preview replaces the visible avatar output
- Verify cards use the transparent avatar once available.
- Verify app falls back to the original image when no transparent version exists.
- Verify failure cases:
  - no image uploaded
  - unsupported file type
  - rembg service unavailable
  - oversized image
- Verify Docker workflows:
  - `docker compose up` starts both services successfully in development
  - app can reach rembg by service hostname
  - production images build successfully

## Assumptions and Defaults
- Chosen processing mode: local Dockerized `rembg` service only.
- Chosen UX: manual background-removal button, not automatic on upload.
- Chosen Docker scope: support both local development and production-style images.
- No database or object storage changes are required for this phase; images remain stored the same way the current app already stores them.
- The Next app remains the only browser-facing service; `rembg` stays private behind it.
