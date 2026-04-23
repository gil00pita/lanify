import type { LanyardFinish } from '@/types/domain'

export function createDefaultLanyardFinish(): LanyardFinish {
  return {
    gradientDirection: 'horizontal',
    gradientFrom: '#FFCDD2',
    gradientStops: [
      { color: '#FFCDD2', offset: '0%' },
      { color: '#FF6A00', offset: '33%' },
      { color: '#E31937', offset: '66%' },
      { color: '#991F3D', offset: '100%' },
    ],
    gradientTo: '#991F3D',
  }
}

export function normalizeLanyardFinish(
  _lanyardColor?: string | null,
  lanyardFinish?: Partial<LanyardFinish> | null
): LanyardFinish {
  return {
    ...createDefaultLanyardFinish(),
    ...lanyardFinish,
  }
}

export function getLanyardPreviewColor(finish: LanyardFinish): string {
  return finish.gradientFrom
}
