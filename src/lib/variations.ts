import { createDraftCard } from '@/lib/mock-data'
import type { CardDesign, GeneratedVariation, PatternSettings, UserProfile } from '@/types/domain'

const variationDeltas = [
  { amplitude: -0.15, frequency: -0.1, itemsPerRow: -2, rows: -1, seed: 3 },
  { amplitude: 0.1, frequency: 0.18, itemsPerRow: 2, rows: 1, seed: 7 },
  { maxOpacity: -0.1, minOpacity: 0.02, phaseOffset: 0.4, seed: 13 },
  { rotation: -12, rowSpacing: 4, scale: 1.05, seed: 17 },
  { amplitude: 0.2, frequency: -0.2, itemSpacing: 6, seed: 19 },
  { maxOpacity: 0.03, minOpacity: -0.03, rotation: 8, rows: 2, seed: 29 },
  { amplitude: -0.22, frequency: 0.22, itemSpacing: 5, seed: 31 },
  { maxOpacity: -0.08, minOpacity: 0.04, phaseOffset: -0.7, seed: 37 },
  { frequency: 0.32, itemSpacing: -2, itemsPerRow: 3, seed: 41 },
  { amplitude: 0.12, rotation: -14, rows: 3, seed: 47 },
  { maxOpacity: 0.02, minOpacity: -0.02, rowSpacing: -2, seed: 53 },
  { amplitude: -0.05, frequency: -0.28, scale: 0.92, seed: 59 },
]

export const colors = {
  magenta1: '#CB7CA3',
  magenta2: '#A82465',
  magenta3: '#7E1B4C',
  purple1: '#E6E3F3',
  purple2: '#CBC3E6',
  purple3: '#BFB5F9',
  purple4: '#9E83F5',
  purple5: '#6E3FED',
  purple6: '#5236AB',
  purple7: '#200A58',
  red1: '#FFCDD2',
  red2: '#FF978A',
  red3: '#FF7362',
  red4: '#FF6A00',
  red5: '#E31937',
  red6: '#991F3D',
  red7: '#650A21',
  dataShadesGreen: '#128354',
  dataShadesRed: '#B00020',
  dataShadesYellow: '#F1A425',
  gray1: '#EEEEEE',
  gray2: '#CCCCCC',
  gray3: '#999999',
  gray4: '#777777',
  gray5: '#555555',
  gray6: '#333333',
  gray7: '#000000',
  commonWhite: '#FFFFFF',
}

export const variationColors = [
  colors.brandPurple,
  colors.purple3,
  colors.dataShadesGreen,
  colors.magenta3,
  colors.purple1,
  colors.red1,
  colors.purple7,
  colors.red5,
  colors.gray3,
  colors.brandRed,
  colors.gray7,
  colors.magenta1,
  colors.red2,
  colors.dataShadesYellow,
  colors.purple6,
  colors.gray4,
  colors.red3,
  colors.purple2,
  colors.gray2,
  colors.magenta2,
  colors.purple4,
  colors.gray5,
  colors.dataShadesRed,
  colors.purple5,
  colors.gray1,
  colors.red4,
  colors.gray6,
  colors.red6,
  colors.red7,
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function mutateSettings(base: PatternSettings, delta: Partial<PatternSettings>) {
  return {
    ...base,
    ...delta,
    amplitude: clamp((base.amplitude ?? 1) + (delta.amplitude ?? 0), 0.1, 2),
    frequency: clamp((base.frequency ?? 1) + (delta.frequency ?? 0), 0.1, 3),
    itemSpacing: clamp((base.itemSpacing ?? 12) + (delta.itemSpacing ?? 0), 8, 28),
    itemsPerRow: clamp((base.itemsPerRow ?? 14) + (delta.itemsPerRow ?? 0), 8, 30),
    maxOpacity: clamp((base.maxOpacity ?? 0.9) + (delta.maxOpacity ?? 0), 0.2, 1),
    minOpacity: clamp((base.minOpacity ?? 0.1) + (delta.minOpacity ?? 0), 0, 0.5),
    phaseOffset: clamp((base.phaseOffset ?? 0) + (delta.phaseOffset ?? 0), -6, 6),
    rotation: clamp((base.rotation ?? 0) + (delta.rotation ?? 0), -30, 30),
    rowSpacing: clamp((base.rowSpacing ?? 16) + (delta.rowSpacing ?? 0), 8, 30),
    rows: clamp((base.rows ?? 10) + (delta.rows ?? 0), 6, 20),
    scale: clamp((base.scale ?? 1) + ((delta.scale ?? 1) - 1), 0.75, 1.5),
    seed: (base.seed + (delta.seed ?? 0)) % 997,
  }
}

export function generateSmartVariations(
  base: CardDesign,
  profile: UserProfile
): GeneratedVariation[] {
  return variationDeltas.map((delta, index) => {
    const seededFromProfile = createDraftCard(base.userId, profile)

    return {
      design: {
        ...seededFromProfile,
        ...base,
        id: `${base.id}_variation_${index + 1}`,
        patternSettings: mutateSettings(base.patternSettings, delta),
        portraitImage: seededFromProfile.portraitImage,
        primaryColor: variationColors[index % variationColors.length],
        subtitle: profile.role,
        title: profile.displayName,
      },
      id: `${base.id}_variation_${index + 1}`,
      label: `Variation ${index + 1}`,
    }
  })
}
