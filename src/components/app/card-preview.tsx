'use client'

import { AppCard } from '@/components/app/app-card'

import type { CardDesign } from '@/types/domain'

export function CardPreview(props: {
  card: CardDesign
  cardInsetShadow?: string
  cardShadow?: string
  emphasis?: 'focused' | 'normal'
  showShine?: boolean
}) {
  const { card, cardInsetShadow, cardShadow, emphasis = 'normal', showShine = false } = props

  return (
    <AppCard
      card={card}
      cardInsetShadow={cardInsetShadow}
      cardShadow={cardShadow}
      showShine={showShine}
      skipAutoFit
      state={emphasis === 'focused' ? 'customizing' : 'default'}
      width="240px"
    />
  )
}
