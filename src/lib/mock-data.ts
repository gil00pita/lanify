import type { CardDesign, PatternSettings, User, UserProfile } from '@/types/domain'

export const SEEDED_USER: User = {
  email: 'member@lanyard.app',
  id: 'user_seeded_lanyard',
}

export const DEFAULT_PATTERN_SETTINGS: PatternSettings = {
  amplitude: 0.9,
  animate: false,
  animationSpeed: 1.2,
  frequency: 0.8,
  itemSpacing: 18,
  itemsPerRow: 18,
  maxOpacity: 0.95,
  minOpacity: 0.08,
  phaseOffset: 0.35,
  rotation: -6,
  rowSpacing: 18,
  rows: 12,
  scale: 1,
  seed: 11,
}

export const SEEDED_PROFILE: UserProfile = {
  avatarTransparentUrl: null,
  avatarUrl: null,
  displayName: 'Amelia Hart',
  firstName: 'Amelia',
  id: 'profile_seeded_lanyard',
  lastName: 'Hart',
  role: 'Member Experience Director',
}

export function createDraftCard(userId: string, profile: UserProfile): CardDesign {
  const timestamp = new Date().toISOString()

  return {
    createdAt: timestamp,
    hasBeenPrinted: false,
    id: `card_${Math.random().toString(36).slice(2, 10)}`,
    isLocked: false,
    patternSettings: DEFAULT_PATTERN_SETTINGS,
    patternType: 'sine-wave',
    portraitImage: profile.avatarTransparentUrl ?? profile.avatarUrl,
    primaryColor: '#E7C676',
    signatureData: null,
    status: 'draft',
    subtitle: profile.role,
    title: profile.displayName,
    updatedAt: timestamp,
    userId,
  }
}
