'use client'

import { AppCard } from '@/components/app/app-card'
import type { GeneratedVariation } from '@/types/domain'

export function SelectorCard(props: {
  interactive?: boolean
  isSelected?: boolean
  onSelect?: () => void
  performanceMode?: 'full' | 'gallery'
  variation: GeneratedVariation
  width?: string | number
}) {
  return (
    <AppCard
      card={props.variation.design}
      interactive={props.interactive}
      onClick={props.onSelect}
      skipAutoFit={props.performanceMode === 'gallery'}
      state={props.isSelected ? 'selected' : 'default'}
      staticPreview={props.performanceMode === 'gallery'}
      width={props.width}
    />
  )
}
