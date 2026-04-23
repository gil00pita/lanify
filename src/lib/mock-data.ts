import type { CardDesign, PatternSettings, User, UserProfile } from '@/types/domain'
import { getContrastingPatternColor } from '@/lib/color-contrast'
import { createDefaultLanyardFinish } from '@/lib/lanyard-finish'
import { getDefaultPatternSettings } from '@/lib/pattern-presets'

const DEFAULT_PATTERN_COLOR_CANDIDATES = ['#FFFFFF', '#000000', '#333333', '#5236AB', '#991F3D']

export const SEEDED_USER: User = {
  email: 'member@lanyard.app',
  id: 'user_seeded_lanyard',
}

export const DEFAULT_PATTERN_SETTINGS: PatternSettings = {
  amplitude: 0.9,
  alternateOpacity: true,
  animate: false,
  animationSpeed: 1.2,
  background: getDefaultPatternSettings('pattern-01').background,
  checkerFlip: false,
  cols: getDefaultPatternSettings('pattern-01').cols,
  fill: getDefaultPatternSettings('pattern-01').fill,
  frequency: 0.8,
  gap: getDefaultPatternSettings('pattern-01').gap,
  itemSpacing: 18,
  itemsPerRow: 18,
  maxOpacity: 0.95,
  minOpacity: 0.08,
  motifScale: getDefaultPatternSettings('pattern-01').motifScale,
  offsetX: getDefaultPatternSettings('pattern-01').offsetX,
  offsetY: getDefaultPatternSettings('pattern-01').offsetY,
  opacity: getDefaultPatternSettings('pattern-01').opacity,
  patternId: 'pattern-01',
  phaseOffset: 0.35,
  rotation: -6,
  rowSpacing: 18,
  rows: 12,
  scale: 1,
  seed: 11,
  skewX: getDefaultPatternSettings('pattern-01').skewX,
  skewY: getDefaultPatternSettings('pattern-01').skewY,
  stroke: getDefaultPatternSettings('pattern-01').stroke,
  strokeWidth: getDefaultPatternSettings('pattern-01').strokeWidth,
  tileSize: getDefaultPatternSettings('pattern-01').tileSize,
}

export const SEEDED_PROFILE: UserProfile = {
  avatarTransparentUrl: null,
  avatarUrl: null,
  displayName: 'John Doe',
  firstName: 'John',
  id: 'profile_seeded_lanyard',
  lastName: 'Doe',
  role: 'Product Designer',
}

export function createDraftCard(userId: string, profile: UserProfile): CardDesign {
  const timestamp = new Date().toISOString()
  const lanyardColor = '#5236AB'
  const primaryColor = '#E7C676'
  const patternColor = getContrastingPatternColor(primaryColor, DEFAULT_PATTERN_COLOR_CANDIDATES)

  return {
    cardHolderColor: '#333333',
    createdAt: timestamp,
    hasBeenPrinted: false,
    id: `card_${Math.random().toString(36).slice(2, 10)}`,
    isLocked: false,
    lanyardColor,
    lanyardFinish: createDefaultLanyardFinish(),
    patternSettings: {
      ...DEFAULT_PATTERN_SETTINGS,
      fill: patternColor,
      stroke: patternColor,
    },
    patternType: 'sine-wave',
    portraitImage: profile.avatarTransparentUrl ?? profile.avatarUrl,
    primaryColor,
    signatureData: null,
    status: 'draft',
    subtitle: profile.role,
    title: profile.displayName,
    updatedAt: timestamp,
    userId,
  }
}
