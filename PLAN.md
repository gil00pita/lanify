# Lanyard Card Design Generator: Architecture and Screen-First Plan

## Summary
Build the app in two implementation waves on the current Next.js App Router + TypeScript + Chakra UI starter.

Wave 1 delivers the full product shell and all primary screens with working business logic, persistent mock auth/data, polished motion, and editable card workflows: `/login`, `/library`, `/wizard`, `/gallery`, `/editor`, `/editor/advanced`, `/profile`, `/print-request`, plus a bootstrap `/` route that redirects based on persisted user/card state. Use Yarn tool.

Wave 2 adds the advanced SVG pattern engine and signature toolchain as production-ready subsystems, wired into the already-functional editor, gallery, save flow, and print request logic.

## Architecture and Screen System
Use App Router route groups so URLs stay exactly as requested while layouts stay clean:
- `app/(auth)/login/page.tsx` for the login experience.
- `app/(app)/layout.tsx` for the authenticated shell shared by library, profile, editor, gallery, and print flow.
- `app/page.tsx` as a client bootstrap gate that reads persisted mock state, then routes to `/login`, `/wizard`, or `/library`.

Adopt a client-heavy mock architecture because persistence is browser `localStorage`:
- `src/providers/app-store-provider.tsx` to initialize persisted Zustand state.
- `src/store` with slices for auth, profile, card designs, wizard session, print requests, and UI/view state.
- `src/lib/mock-repository` for storage adapters and seeded data so future backend swaps are isolated from UI.
- `src/lib/domain` for pure business rules such as first-time-user routing, first-print pricing, lock state transitions, and editability checks.
- `src/theme` for a premium minimal design system with light app surfaces, elevated gallery/library cards, and a dedicated dark advanced-editor palette.

Define the primary navigation and flow behavior as follows:
- `/login` accepts any valid-looking email/password and signs into one seeded mock user.
- After login, if the user has no saved cards, route to `/wizard`; otherwise route to `/library`.
- `/library` is the post-onboarding home and shows a first tile for “Create New Card” followed by saved designs with status badges and edit/open/print actions.
- `/wizard` owns the guided flow shell, stepper, and profile review/save checkpoints.
- `/gallery` is the smart variation browsing screen fed by the current profile plus current pattern settings.
- `/editor` is the simple editor for selected designs with lightweight customization.
- `/editor/advanced` is the dark design-tool workspace with left controls, large preview, panel toggles, and instant updates.
- `/profile` lets the user revise account/profile defaults separately from any single design.
- `/print-request` is a dedicated multi-step confirmation flow that selects one saved card, shows pricing, warns about lock behavior, and submits a mock print request.

Use these reusable screen-level components from the start:
- `AppShell`, `TopNav`, `StatusPill`, `EmptyState`, `SectionHeader`, `StickySummaryPanel`.
- `AuthCard`, `MockLoginForm`, `RedirectGate`.
- `WizardStepper`, `WizardFooterActions`, `ProfileReviewForm`, `PortraitUploader`, `BackgroundRemovalPanel`.
- `VariationGallery`, `VariationRail`, `VariationCard`, `ZoomToCardPreview`.
- `CardPreview`, `CardFrame`, `PortraitStage`, `CardMetaText`.
- `SimpleEditorPanel`, `AdvancedEditorLayout`, `PatternControlPanel`, `PreviewToggleBar`.
- `LibraryGrid`, `CreateNewCardTile`, `CardLibraryItem`, `LockedStateOverlay`.
- `PrintRequestWizard`, `PricingSummary`, `ConfirmationNotice`.
- `SignaturePad`, `SignatureToolbar`, `SignaturePlacementOverlay`.

## State Model and Public Interfaces
Use Zustand with `persist` middleware and one app store composed from domain slices. Persist only mock-business data and lightweight UI checkpoints needed to preserve the user flow across refreshes.

Core types to define under `src/types`:
- `User`, `UserProfile`, `CardDesign`, `PatternSettings`, `Signature`, `PrintRequest`, `GeneratedVariation`, `PaymentState`.
- `CardStatus = "draft" | "saved" | "submittedForPrint" | "locked"`.
- `PrintRequestStatus = "draft" | "confirmed" | "submitted"`.
- `WizardStep = "login" | "profile" | "gallery" | "select" | "edit" | "signature" | "save" | "print"`.

Important interfaces and boundaries:
- `AuthRepository` with `login`, `logout`, `getCurrentUser`.
- `ProfileRepository` with `getProfile`, `saveProfile`, `setTransparentPortrait`.
- `CardRepository` with `listByUser`, `createDraft`, `saveDesign`, `updateDesign`, `lockDesign`.
- `PrintRepository` with `listByUser`, `submitRequest`, `getNextPrintPrice`.
- `VariationService` with `generateFromSeed(profile, baseSettings) => GeneratedVariation[]`.
- `PatternEngine` with `buildPatternScene(settings, viewport) => PatternScene`.
- `SignatureService` with `capture`, `clear`, `confirm`, `exportDataUrl`.
- `CardRules` pure helpers for `isFirstTimeUser`, `canEditCard`, `getCardStatus`, `computePrintPrice`, `submitPrintAndLockCard`.

Persisted store shape:
- `auth`: `isAuthenticated`, `currentUserId`.
- `profile`: current profile fields plus portrait and transparent portrait references.
- `cards`: saved designs, active draft id, selected card id.
- `wizard`: current step, gallery source config, selected variation id, unsaved edits.
- `print`: print requests, `firstPrintConsumed`.
- `ui`: editor mode, gallery scroll speed, zoom target, panel open states.

## Wave 1: Functional Screens and Product Logic
Implement the screens and flows first with real app logic but placeholder internals where needed:
- Build the login screen, redirect gate, and library-first routing behavior.
- Build the library grid with create tile, saved cards, status badges, edit/open actions, and locked-card affordances.
- Build the wizard flow with profile review, portrait upload UI, mocked background-removal action, variation generation trigger, simple edit step, signature entry step shell, save action, and optional jump into advanced mode before save.
- Build the print-request flow with card selection, pricing summary, first-free rule, subsequent `£50` pricing, lock warning, and final confirmation that changes card status to locked.
- Build motion architecture with Framer Motion for page transitions, gallery drift, scroll acceleration, zoom-to-selected-card, and editor/detail transitions.
- Make the portrait background-removal UX explicit even before real image segmentation exists: upload an image, offer “Remove Background”, show a processing state, and swap to a mocked transparent asset or silhouette treatment.

Structure the card preview system now so later rendering work plugs in cleanly:
- `CardPreview` always composes background layer, pattern layer, portrait layer, signature layer, and text layer in a fixed front-card layout.
- The portrait area is always the primary stage for the pattern system.
- If there is no uploaded portrait, use a stylized transparent silhouette placeholder.
- Locked cards remain viewable but all edit entry points resolve to read-only preview states.

## Wave 2: Advanced Pattern Engine and Signature Tools
Implement the pattern engine as a pure SVG subsystem under `src/features/pattern-engine`:
- Deterministic, config-driven mark generation based on `rows`, `itemsPerRow`, `minOpacity`, `maxOpacity`, `amplitude`, `frequency`, `phaseOffset`, `rowSpacing`, `itemSpacing`, `rotation`, `scale`, `animate`, `animationSpeed`, and `seed`.
- Pattern marks render in white over black and sit behind the transparent portrait image.
- Variation generation starts from the active profile and base pattern settings, then produces related, not random, variants by perturbing only bounded settings around the current design.
- Gallery variants share a family resemblance through a seeded variation algorithm and bounded deltas instead of unrestricted randomization.
- Advanced editor updates preview instantly from control changes and supports `randomize`, `reset`, `animate wave`, and `generate variations from current settings`.

Implement signature capture as a separate tool under `src/features/signature`:
- Use a canvas-based drawing pad for pointer/mouse/trackpad capture.
- Export confirmed signature strokes to a transparent data URL so the saved signature overlays the SVG card preview cleanly.
- Support draw, clear, confirm, and re-edit.
- Store signature metadata and exported image data on `CardDesign.signatureData`.
- Signature placement is fixed and elegant on the card front, not freeform drag-and-drop in v1.

## Test Plan and Acceptance Criteria
Add tests around business rules and route behavior first:
- Login redirects to `/wizard` for users with zero saved cards.
- Login redirects to `/library` for returning users.
- Creating and saving the first card makes `/library` the default post-login home.
- Locked cards cannot enter editable simple or advanced editor states.
- First print request is `£0`; every later request is `£50`.
- Submitting a print request locks only the selected card and does not block new card creation.

Add component and interaction coverage for critical UX:
- Wizard step persistence across refresh.
- Gallery selection keeps edits when returning from editor back to gallery.
- Simple editor and advanced editor both update the same active draft.
- Background-removal mock toggles portrait source without breaking preview composition.
- Signature clear/confirm behaviors update the preview and saved design.
- Status badges and locked overlays reflect store state correctly.

Acceptance criteria for the two-wave delivery:
- Wave 1 ends with all screens navigable and fully wired to persistent mock data, including save and print flows.
- Wave 2 ends with production-quality SVG pattern rendering, deterministic smart variations, and signature capture integrated into save/edit/print workflows.

## Assumptions and Defaults
- One seeded mock user is used for all login attempts in this phase.
- Browser `localStorage` is the only persistence layer for now.
- The visual direction is premium minimal, with a restrained luxury feel rather than a loud experimental UI.
- The app is fully functional in phase one; only the advanced pattern math/rendering subsystem and signature capture internals are deferred to phase two.
- SVG is the primary card/pattern renderer; canvas is used only for signature input.
- Because auth and persistence are browser-local in v1, root routing and guards are client-side rather than true server-auth redirects.
- Payment, cloud storage, print fulfillment, and real background removal remain mocked behind service interfaces designed for future replacement.
