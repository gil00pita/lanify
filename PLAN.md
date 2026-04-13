# Project Plan

Lanyard Card Design Generator is a production-oriented Next.js App Router web app for generating, editing, saving, and submitting premium lanyard/member card designs for print.

- App name: `Lanyard Card Design Generator`
- Stack: `Next.js 16`, `TypeScript`, `Chakra UI`, `Framer Motion`, `Zustand`
- Package manager: `yarn`
- Default branch assumption: `main`
- Node requirement: `>=20.9.0`

## Status Snapshot

- Current Phase: `Phase 1 - app architecture and screens`
- Overall Status: `in progress`
- Last Updated: `2026-04-13 01:24 UTC`
- Current Focus: `polish the first working app flow and deepen the editor/pattern experience`
- Next Action: `refine the gallery/editor interactions, improve print-flow UX, and extend the pattern/signature internals`
- Blocked On: `none`
- Branch: `main`
- Owner: `Codex + user`
- Notes for Resume: `tooling, route groups, persisted store, login, library, wizard, gallery, editor, advanced editor, profile, and print request routes now exist; resume with UI polish and deeper feature fidelity`

## Phase Tracker

### Phase 0: Repo/Tooling Stabilization

- Goal: stabilize linting, formatting, package-manager expectations, and the base Next.js starter before feature work.
- Status: `done`
- Deliverables:
  - clean `eslint.config.mjs`
  - verified `lint` and `build`
  - `PLAN.md` upgraded to restart-safe tracker
  - package-manager direction documented
- Exit Criteria:
  - ESLint no longer throws config/runtime errors
  - baseline `build` succeeds
  - next session can resume from this file alone

### Phase 1: App Architecture and Screens

- Goal: deliver the full route structure, app shell, mock auth, persistent store, and all primary screens with working business logic.
- Status: `in progress`
- Deliverables:
  - authenticated route groups and redirects
  - login, library, wizard, gallery, editor, advanced editor shell, profile, and print-request routes
  - persistent mock user/profile/card/print state
  - premium minimal design system and motion foundation
- Exit Criteria:
  - all required routes are navigable
  - first-time and returning-user flows work
  - save/edit/lock/print logic works with mock persistence

### Phase 2: Advanced Pattern Engine

- Goal: implement the production-ready SVG card background engine and smart variation generation.
- Status: `not started`
- Deliverables:
  - reusable SVG pattern renderer
  - smart variation generation from seeded settings
  - instant advanced-editor preview updates
  - variation gallery wired to current settings
- Exit Criteria:
  - pattern controls update preview deterministically
  - generated variants feel related, not random
  - advanced editor can power both gallery and saved cards

### Phase 3: Signature Tools

- Goal: add mouse/trackpad signature capture and elegant placement on the card.
- Status: `not started`
- Deliverables:
  - canvas signature pad
  - clear/confirm/re-edit flow
  - signature export and overlay in card preview
  - persistence on `CardDesign.signatureData`
- Exit Criteria:
  - signature capture works reliably
  - signature persists across save/load
  - locked cards remain viewable but non-editable

### Phase 4: Print Flow Polish and Validation

- Goal: finish the print-request experience, pricing rules, locking behavior, and acceptance-level validation.
- Status: `not started`
- Deliverables:
  - print-request wizard polish
  - first-print-free and later `£50` pricing summary
  - lock-state enforcement across all entry points
  - test coverage for core business rules
- Exit Criteria:
  - print pricing and lock behavior are consistent everywhere
  - critical route/business tests pass
  - app is ready for backend integration follow-up

## Task Board

### Backlog

- Build SVG pattern engine under `src/features/pattern-engine`
- Build signature tools under `src/features/signature`
- Add tests for routing, pricing, lock behavior, and persistence
- Refine gallery selection and zoom-to-detail polish
- Improve locked-card read-only affordances and print confirmation UX
- Add service boundaries for future auth/storage/payment integrations

### In Progress

- Keep `PLAN.md` updated as the canonical restart-safe tracker
- Polish the screen system and shared editor interactions
- Expand pattern and signature fidelity beyond the current working baseline

### Done

- Created initial Next.js + Chakra UI starter repository
- Added baseline project plan for the Lanyard Card Design Generator
- Converted plan direction into a restart-safe tracker structure
- Stabilized ESLint and verified the app with lint and production build under a Node 24 runtime
- Added route groups, redirect gate, authenticated app shell, and all requested top-level routes
- Added persisted Zustand state for auth, profile, cards, wizard state, and print requests
- Implemented working login, library, wizard, gallery, simple editor, advanced editor, profile, and print request screens
- Added reusable card preview, SVG pattern rendering baseline, and canvas signature capture baseline

### Blocked

- None currently

## Architecture Decisions

- Use App Router with route groups to keep URL structure stable while separating auth and app layouts.
- Use Chakra UI for the component system and theme foundation.
- Use Zustand with `localStorage` persistence for mock app state.
- Use SVG for card pattern rendering.
- Use canvas for signature capture.
- Use a single seeded mock user for the initial implementation.
- After first saved card creation, the library becomes the default home page.
- First print is free; every print request after that costs `£50`.
- Keep the visual direction premium minimal, with a dark advanced editor and refined motion.
- Keep phase delivery in two major waves:
  - Wave 1: screens, routing, persistence, and business logic
  - Wave 2: advanced pattern engine and signature internals

## Routes and Screens

### `/`

- Purpose: bootstrap gate that routes to login, wizard, or library based on persisted state
- Auth Expectation: public entry, client-side redirect logic
- Core UI Modules: `RedirectGate`, loading/splash shell
- State Dependencies: auth state, saved-card count, onboarding status

### `/login`

- Purpose: mock authentication entry point
- Auth Expectation: public
- Core UI Modules: `AuthCard`, `MockLoginForm`
- State Dependencies: auth slice, seeded user bootstrap

### `/library`

- Purpose: returning-user home with saved cards and create-new entry
- Auth Expectation: authenticated
- Core UI Modules: `AppShell`, `LibraryGrid`, `CreateNewCardTile`, `CardLibraryItem`, `StatusPill`
- State Dependencies: auth, cards, print state

### `/wizard`

- Purpose: guided first-time and new-card flow
- Auth Expectation: authenticated
- Core UI Modules: `WizardStepper`, `ProfileReviewForm`, `WizardFooterActions`
- State Dependencies: auth, profile, wizard, cards

### `/gallery`

- Purpose: browse smart card variations derived from current configuration
- Auth Expectation: authenticated
- Core UI Modules: `VariationGallery`, `VariationRail`, `VariationCard`, `ZoomToCardPreview`
- State Dependencies: wizard selection, profile, active pattern settings

### `/editor`

- Purpose: simple editing mode for the selected design
- Auth Expectation: authenticated
- Core UI Modules: `CardPreview`, `SimpleEditorPanel`, save actions
- State Dependencies: active card, profile, signature, pattern settings

### `/editor/advanced`

- Purpose: professional dark editor for deep pattern and preview control
- Auth Expectation: authenticated, read-only if locked
- Core UI Modules: `AdvancedEditorLayout`, `PatternControlPanel`, `PreviewToggleBar`, `CardPreview`
- State Dependencies: active card, lock state, pattern settings, UI panel state

### `/profile`

- Purpose: user profile and portrait defaults management
- Auth Expectation: authenticated
- Core UI Modules: `ProfileReviewForm`, `PortraitUploader`, `BackgroundRemovalPanel`
- State Dependencies: auth, profile

### `/print-request`

- Purpose: select a saved card, review print rules, and confirm submission
- Auth Expectation: authenticated
- Core UI Modules: `PrintRequestWizard`, `PricingSummary`, `ConfirmationNotice`
- State Dependencies: cards, print requests, first-print-used state

## Implementation Checklist

### App Shell and Routing

- [ ] Create route groups for auth and authenticated app screens
- [ ] Add root bootstrap redirect logic
- [ ] Add authenticated app shell with navigation and page transitions

### Auth and Bootstrapping

- [ ] Implement seeded mock user login flow
- [ ] Persist auth state across refreshes
- [ ] Route first-time users to wizard and returning users to library

### Profile and Portrait Workflow

- [ ] Implement profile review form
- [ ] Add portrait upload and preview
- [ ] Add mocked background-removal action and transparent fallback handling

### Library

- [ ] Build library grid with create-new tile first
- [ ] Show card status badges for editable, submitted, and locked states
- [ ] Support opening saved cards in editable or read-only mode

### Wizard

- [ ] Build guided stepper shell
- [ ] Preserve wizard progress in persisted state
- [ ] Support save flow and jump into advanced mode before save

### Gallery

- [ ] Build horizontally moving smart variation gallery
- [ ] Add scroll acceleration and zoom-to-selection interaction
- [ ] Support returning to gallery without losing edits

### Simple Editor

- [ ] Build simple controls for non-pattern and basic pattern adjustments
- [ ] Keep preview updates instant and shared with advanced mode

### Advanced Editor Shell

- [ ] Build dark editor layout with control sidebar and large live preview
- [ ] Add panel toggles and read-only locked state behavior

### Pattern Engine

- [ ] Implement reusable SVG pattern renderer
- [ ] Implement seeded smart variation generator
- [ ] Add randomize, reset, and animate-wave controls

### Signature Tools

- [ ] Implement canvas signature pad
- [ ] Add clear, confirm, and re-edit workflow
- [ ] Persist signature as overlay-ready data

### Print Requests

- [ ] Build print request wizard
- [ ] Enforce first print free and subsequent `£50` pricing
- [ ] Lock the selected card after print submission

### Persistence

- [ ] Persist user, profile, cards, wizard state, and print requests via `localStorage`
- [ ] Add repository wrappers to ease future backend replacement

### Testing

- [ ] Add tests for routing rules and first-time-user logic
- [ ] Add tests for print pricing and lock behavior
- [ ] Add tests for persistence and draft continuity

## Data Model

### UserProfile

- `id`
- `firstName`
- `lastName`
- `displayName`
- `role`
- `avatarUrl`
- `avatarTransparentUrl`

### CardDesign

- `id`
- `userId`
- `status`
- `isLocked`
- `hasBeenPrinted`
- `primaryColor`
- `patternType`
- `patternSettings`
- `signatureData`
- `portraitImage`
- `createdAt`
- `updatedAt`

### PatternSettings

- `rows`
- `itemsPerRow`
- `minOpacity`
- `maxOpacity`
- `amplitude`
- `frequency`
- `phaseOffset`
- `rowSpacing`
- `itemSpacing`
- `rotation`
- `scale`
- `animate`
- `animationSpeed`
- `seed`

### PrintRequest

- `id`
- `userId`
- `cardId`
- `price`
- `isFirstFreePrint`
- `submittedAt`
- `status`

### Supporting Types

- `User`
- `Signature`
- `GeneratedVariation`
- `PaymentState`
- `CardStatus = "draft" | "saved" | "submittedForPrint" | "locked"`
- `PrintRequestStatus = "draft" | "confirmed" | "submitted"`
- `WizardStep = "login" | "profile" | "gallery" | "select" | "edit" | "signature" | "save" | "print"`

## Resume Instructions

1. Read `Status Snapshot` first.
2. Continue the top item in `In Progress`.
3. If `In Progress` is empty, take the first unchecked item in `Implementation Checklist`.
4. After each major step:
   - update `Last Updated`
   - update `Current Focus`
   - update `Next Action`
   - move items between `Backlog`, `In Progress`, `Done`, and `Blocked`
5. If the session resets, treat this file as the canonical source of current status and next work.
