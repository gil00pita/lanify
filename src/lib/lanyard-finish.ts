import { colors } from '@/lib/variations'
import type { LanyardFinish } from '@/types/domain'

export function createDefaultLanyardFinish(color = colors.purple6): LanyardFinish {
  return {
    gradientDirection: 'diagonal',
    gradientFrom: color,
    gradientTo: colors.purple2,
    mode: 'solid',
    patternAccent: colors.commonWhite,
    patternBase: color,
    patternStyle: 'stripes',
    solidColor: color,
  }
}

export function normalizeLanyardFinish(
  lanyardColor?: string | null,
  lanyardFinish?: Partial<LanyardFinish> | null
): LanyardFinish {
  return {
    ...createDefaultLanyardFinish(lanyardColor || colors.purple6),
    ...lanyardFinish,
  }
}

export function getLanyardPreviewColor(finish: LanyardFinish): string {
  if (finish.mode === 'gradient') {
    return finish.gradientFrom
  }

  if (finish.mode === 'pattern') {
    return finish.patternBase
  }

  return finish.solidColor
}
