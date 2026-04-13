'use client'

import { Badge } from '@chakra-ui/react'

import { getCardStatusLabel } from '@/lib/domain/card-rules'
import type { CardDesign } from '@/types/domain'

export function StatusPill(props: { card: CardDesign }) {
  const label = getCardStatusLabel(props.card)

  const palette =
    label === 'Locked'
      ? 'red'
      : label === 'Submitted for print'
        ? 'purple'
        : label === 'Draft'
          ? 'orange'
          : 'green'

  return (
    <Badge
      borderRadius="full"
      colorPalette={palette}
      px="3"
      py="1"
      textTransform="none"
      variant="solid"
    >
      {label}
    </Badge>
  )
}
