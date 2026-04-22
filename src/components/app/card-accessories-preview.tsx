'use client'

import { Box } from '@chakra-ui/react'

import { CardPreview } from '@/components/app/card-preview'
import { colors } from '@/lib/variations'
import type { CardDesign } from '@/types/domain'
import { ZoomPlusIcon as CardHolderIllustration } from '@/illustrations/CardHolder'
import { ZoomPlusIcon as LanyardIllustration } from '@/illustrations/Lanyard'

export function CardAccessoriesPreview(props: { card: CardDesign }) {
  const { card } = props
  const cardHolderColor = card.cardHolderColor || colors.gray6
  const lanyardColor = card.lanyardColor || colors.purple6

  return (
    <Box mx="auto" position="relative" className="card-container">
      <Box
        color={lanyardColor}
        left="50%"
        pointerEvents="none"
        position="absolute"
        top="-354px"
        transform="translateX(-50%)"
        zIndex="2"
        className="lanyard-illustration-container"
        filter={'drop-shadow(2px 2px 12px {colors.gray.800/50})'}
      >
        <LanyardIllustration height="328px" width="336px" />
      </Box>
      <Box insetX={0} p={0} position="relative" zIndex="1">
        <CardPreview card={card} emphasis="focused" boxShadow="none" />
      </Box>
      <Box
        height="464px"
        width="286px"
        top="50px"
        color={cardHolderColor}
        pointerEvents="none"
        position="absolute"
        zIndex="0"
        top="-15%"
        left="50%"
        transform="translateX(-50%)"
        className="illustration-container"
      >
        <CardHolderIllustration height="100%" width="100%" />
      </Box>
    </Box>
  )
}
