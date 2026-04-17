'use client'

import { AppCard } from '@/components/app/app-card'
import type { GeneratedVariation } from '@/types/domain'

export function SelectorCard(props: {
  interactive?: boolean
  isSelected?: boolean
  onSelect?: () => void
  variation: GeneratedVariation
  width?: string | number
}) {
  return (
    <AppCard
      card={props.variation.design}
      interactive={props.interactive}
      onClick={props.onSelect}
      showSignature={false}
      state={props.isSelected ? 'selected' : 'default'}
      variationId={props.variation.id}
      width={props.width}
    />
  )
}
