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
    <Box
      mx="auto"
      position="relative"
      pt={{ base: '28', md: '32' }}
      w={{ base: '280px', md: '340px' }}
    >
      <Box
        color={lanyardColor}
        left="50%"
        pointerEvents="none"
        position="absolute"
        top="0"
        transform="translateX(-50%)"
        zIndex="0"
      >
        <LanyardIllustration height="196px" width="150px" />
      </Box>

      <Box position="relative">
        <Box
          insetX={{ base: '20px', md: '24px' }}
          pb={{ base: '4px', md: '6px' }}
          position="relative"
          zIndex="1"
        >
          <CardPreview card={card} emphasis="focused" boxShadow="none" />
        </Box>

        <Box
          height="464px"
          width="286px"
          top="-60px"
          color={cardHolderColor}
          pointerEvents="none"
          position="absolute"
          zIndex="0"
        >
          <CardHolderIllustration height="100%" width="100%" />
        </Box>
      </Box>
    </Box>
  )
}
