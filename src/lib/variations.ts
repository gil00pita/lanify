import { getDefaultPatternSettings, type PatternPresetId } from '@/lib/pattern-presets'
import { createDraftCard } from '@/lib/mock-data'
import type { CardDesign, GeneratedVariation, PatternSettings, UserProfile } from '@/types/domain'

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

type VariationRecipe = {
  pattern: Partial<PatternSettings>
  patternId: PatternPresetId
  primaryColor: string
}

const variationRecipes: VariationRecipe[] = [
  {
    patternId: 'pattern-01',
    primaryColor: colors.purple7,
    pattern: { fill: colors.purple4, opacity: 0.72, rows: 8, cols: 8, tileSize: 42 },
  },
  {
    patternId: 'pattern-02',
    primaryColor: colors.purple1,
    pattern: { fill: colors.commonWhite, stroke: colors.purple3, opacity: 0.88, rows: 3, cols: 4 },
  },
  {
    patternId: 'pattern-01',
    primaryColor: colors.red5,
    pattern: { fill: colors.red2, stroke: colors.commonWhite, strokeWidth: 0.8, opacity: 0.78 },
  },
  {
    patternId: 'pattern-02',
    primaryColor: colors.magenta3,
    pattern: { fill: colors.red1, stroke: colors.commonWhite, opacity: 0.82, rotation: 90 },
  },
  {
    patternId: 'pattern-01',
    primaryColor: colors.red3,
    pattern: { fill: colors.commonWhite, opacity: 0.68, gap: 6, motifScale: 0.92, rotation: 180 },
  },
  {
    patternId: 'pattern-02',
    primaryColor: colors.gray7,
    pattern: { fill: colors.gray2, stroke: colors.gray1, opacity: 0.76, rotation: 180 },
  },
  {
    patternId: 'pattern-01',
    primaryColor: colors.red4,
    pattern: {
      fill: colors.red7,
      opacity: 0.7,
      alternateOpacity: false,
      tileSize: 48,
      rotation: 270,
    },
  },
  {
    patternId: 'pattern-02',
    primaryColor: colors.purple6,
    pattern: { fill: colors.purple2, stroke: colors.commonWhite, opacity: 0.8, rows: 4, cols: 4 },
  },
  {
    patternId: 'pattern-01',
    primaryColor: colors.gray1,
    pattern: { fill: colors.gray6, stroke: colors.gray7, strokeWidth: 0.6, opacity: 0.62, gap: 10 },
  },
  {
    patternId: 'pattern-02',
    primaryColor: colors.purple4,
    pattern: { fill: colors.commonWhite, stroke: colors.red4, opacity: 0.74, rotation: 270 },
  },
  {
    patternId: 'pattern-01',
    primaryColor: colors.magenta1,
    pattern: { fill: colors.magenta3, opacity: 0.8, tileSize: 38, motifScale: 1.1, gap: 4 },
  },
  {
    patternId: 'pattern-02',
    primaryColor: colors.red7,
    pattern: { fill: colors.red2, stroke: colors.red1, opacity: 0.84, rows: 3, cols: 5 },
  },
]

function buildPatternVariation(
  baseSettings: PatternSettings,
  recipe: VariationRecipe
): PatternSettings {
  const presetDefaults = getDefaultPatternSettings(recipe.patternId)

  return {
    ...baseSettings,
    ...presetDefaults,
    ...recipe.pattern,
    background: recipe.primaryColor,
    patternId: recipe.patternId,
  }
}

export function generateSmartVariations(
  base: CardDesign,
  profile: UserProfile
): GeneratedVariation[] {
  return variationRecipes.map((recipe, index) => {
    const seededFromProfile = createDraftCard(base.userId, profile)

    return {
      design: {
        ...seededFromProfile,
        ...base,
        id: `${base.id}_variation_${index + 1}`,
        patternSettings: buildPatternVariation(base.patternSettings, recipe),
        portraitImage: seededFromProfile.portraitImage,
        primaryColor: recipe.primaryColor,
        subtitle: profile.role,
        title: profile.displayName,
      },
      id: `${base.id}_variation_${index + 1}`,
      label: `Variation ${index + 1}`,
    }
  })
}
