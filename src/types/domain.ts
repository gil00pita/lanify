export type CardStatus = 'draft' | 'saved' | 'submittedForPrint' | 'locked'

export type PrintRequestStatus = 'draft' | 'confirmed' | 'submitted'

export type WizardStep =
  | 'login'
  | 'profile'
  | 'gallery'
  | 'select'
  | 'edit'
  | 'signature'
  | 'save'
  | 'print'

export type PaymentState = 'free' | 'pending' | 'paid'

export interface User {
  email: string
  id: string
}

export interface UserProfile {
  avatarTransparentUrl: string | null
  avatarUrl: string | null
  displayName: string
  firstName: string
  id: string
  lastName: string
  role: string
}

export interface PatternSettings {
  amplitude: number
  animate: boolean
  animationSpeed: number
  frequency: number
  itemSpacing: number
  itemsPerRow: number
  maxOpacity: number
  minOpacity: number
  phaseOffset: number
  rotation: number
  rowSpacing: number
  rows: number
  scale: number
  seed: number
}

export interface SignaturePoint {
  x: number
  y: number
}

export interface SignatureStroke {
  points: SignaturePoint[]
}

export interface Signature {
  confirmedAt: string
  dataUrl: string
  strokes: SignatureStroke[]
}

export interface CardDesign {
  createdAt: string
  hasBeenPrinted: boolean
  id: string
  isLocked: boolean
  patternSettings: PatternSettings
  patternType: 'sine-wave'
  portraitImage: string | null
  primaryColor: string
  signatureData: Signature | null
  status: CardStatus
  subtitle: string
  title: string
  updatedAt: string
  userId: string
}

export interface GeneratedVariation {
  design: CardDesign
  id: string
  label: string
}

export interface PrintRequest {
  cardId: string
  id: string
  isFirstFreePrint: boolean
  paymentState: PaymentState
  price: number
  status: PrintRequestStatus
  submittedAt: string
  userId: string
}

export interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
}

export interface WizardState {
  currentStep: WizardStep
  selectedVariationId: string | null
}
