'use client'

import { AppCard } from '@/components/app/app-card'

import type { CardDesign } from '@/types/domain'

export function CardPreview(props: { card: CardDesign; emphasis?: 'focused' | 'normal' }) {
  const { card, emphasis = 'normal' } = props

  return (
    <AppCard
      card={card}
      skipAutoFit
      state={emphasis === 'focused' ? 'customizing' : 'default'}
      width="240px"
      {...props}
    />
  )
}
