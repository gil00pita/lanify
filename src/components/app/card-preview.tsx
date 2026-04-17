'use client'

import { AppCard } from '@/components/app/app-card'

import type { CardDesign } from '@/types/domain'

export function CardPreview(props: {
  card: CardDesign
  emphasis?: 'focused' | 'normal'
  showSignature?: boolean
}) {
  const { card, emphasis = 'normal', showSignature = true } = props

  return (
    <AppCard
      card={card}
      showSignature={showSignature}
      state={emphasis === 'focused' ? 'customizing' : 'default'}
      width="240px"
    />
  )
}
