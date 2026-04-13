'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { canEditCard, getNextPrintPrice } from '@/lib/domain/card-rules'
import { createDraftCard, SEEDED_PROFILE, SEEDED_USER } from '@/lib/mock-data'
import type {
  AuthState,
  CardDesign,
  PrintRequest,
  Signature,
  UserProfile,
  WizardState,
} from '@/types/domain'

interface AppStore {
  activeDraft: CardDesign | null
  auth: AuthState
  cards: CardDesign[]
  printRequests: PrintRequest[]
  profile: UserProfile
  ui: {
    editorMode: 'simple' | 'advanced'
  }
  wizard: WizardState
  createNewDraft: () => void
  loadCardIntoDraft: (cardId: string) => void
  login: (email: string) => void
  logout: () => void
  saveDraft: () => string | null
  selectVariation: (card: CardDesign) => void
  setEditorMode: (mode: 'simple' | 'advanced') => void
  setWizardStep: (step: WizardState['currentStep']) => void
  submitPrintRequest: (cardId: string) => void
  updateDraft: (updater: (draft: CardDesign) => CardDesign) => void
  updateProfile: (updater: (profile: UserProfile) => UserProfile) => void
  updateSignature: (signature: Signature | null) => void
}

function cloneCard(card: CardDesign) {
  return structuredClone(card)
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      activeDraft: null,
      auth: {
        currentUser: null,
        isAuthenticated: false,
      },
      cards: [],
      printRequests: [],
      profile: SEEDED_PROFILE,
      ui: {
        editorMode: 'simple',
      },
      wizard: {
        currentStep: 'login',
        selectedVariationId: null,
      },
      createNewDraft: () => {
        const state = get()
        const userId = state.auth.currentUser?.id ?? SEEDED_USER.id
        const draft = createDraftCard(userId, state.profile)

        set({
          activeDraft: draft,
          ui: { editorMode: 'simple' },
          wizard: { currentStep: 'profile', selectedVariationId: null },
        })
      },
      loadCardIntoDraft: (cardId: string) => {
        const card = get().cards.find((entry) => entry.id === cardId)

        if (!card) {
          return
        }

        set({
          activeDraft: cloneCard(card),
          ui: { editorMode: 'simple' },
        })
      },
      login: (email: string) => {
        const user = {
          ...SEEDED_USER,
          email: email || SEEDED_USER.email,
        }

        set((state) => ({
          auth: {
            currentUser: user,
            isAuthenticated: true,
          },
          profile:
            state.profile.displayName === SEEDED_PROFILE.displayName
              ? { ...SEEDED_PROFILE }
              : state.profile,
          wizard: {
            ...state.wizard,
            currentStep: state.cards.length === 0 ? 'profile' : 'edit',
          },
        }))
      },
      logout: () => {
        set({
          activeDraft: null,
          auth: {
            currentUser: null,
            isAuthenticated: false,
          },
          ui: { editorMode: 'simple' },
          wizard: { currentStep: 'login', selectedVariationId: null },
        })
      },
      saveDraft: () => {
        const draft = get().activeDraft

        if (!draft) {
          return null
        }

        const savedDraft = {
          ...draft,
          status: draft.isLocked ? 'locked' : 'saved',
          updatedAt: new Date().toISOString(),
        } satisfies CardDesign

        set((state) => {
          const existing = state.cards.some((entry) => entry.id === savedDraft.id)
          const cards = existing
            ? state.cards.map((entry) => (entry.id === savedDraft.id ? savedDraft : entry))
            : [savedDraft, ...state.cards]

          return {
            cards,
          }
        })

        return savedDraft.id
      },
      selectVariation: (card: CardDesign) => {
        set((state) => ({
          activeDraft: cloneCard(card),
          wizard: {
            ...state.wizard,
            currentStep: 'select',
            selectedVariationId: card.id,
          },
        }))
      },
      setEditorMode: (mode) => {
        set({
          ui: { editorMode: mode },
        })
      },
      setWizardStep: (step) => {
        set((state) => ({
          wizard: {
            ...state.wizard,
            currentStep: step,
          },
        }))
      },
      submitPrintRequest: (cardId: string) => {
        const state = get()
        const userId = state.auth.currentUser?.id ?? SEEDED_USER.id
        const price = getNextPrintPrice(state.printRequests)
        const timestamp = new Date().toISOString()

        set({
          cards: state.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  hasBeenPrinted: true,
                  isLocked: true,
                  status: 'locked',
                  updatedAt: timestamp,
                }
              : card,
          ),
          printRequests: [
            {
              cardId,
              id: `print_${Math.random().toString(36).slice(2, 10)}`,
              isFirstFreePrint: price === 0,
              paymentState: price === 0 ? 'free' : 'pending',
              price,
              status: 'submitted',
              submittedAt: timestamp,
              userId,
            },
            ...state.printRequests,
          ],
        })
      },
      updateDraft: (updater) => {
        const draft = get().activeDraft

        if (!draft || !canEditCard(draft)) {
          return
        }

        set({
          activeDraft: updater(draft),
        })
      },
      updateProfile: (updater) => {
        set((state) => ({
          profile: updater(state.profile),
        }))
      },
      updateSignature: (signature) => {
        get().updateDraft((draft) => ({
          ...draft,
          signatureData: signature,
          updatedAt: new Date().toISOString(),
        }))
      },
    }),
    {
      name: 'lanyard-card-generator-store',
      partialize: (state) => ({
        auth: state.auth,
        cards: state.cards,
        printRequests: state.printRequests,
        profile: state.profile,
        ui: state.ui,
        wizard: state.wizard,
      }),
      version: 1,
    },
  ),
)
