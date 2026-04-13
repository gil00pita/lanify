'use client'

import { Box, Image, Text, VStack } from '@chakra-ui/react'

import { PatternRenderer } from '@/components/app/pattern-renderer'
import type { CardDesign } from '@/types/domain'

function PortraitFallback() {
  return (
    <svg fill="none" height="170" viewBox="0 0 110 170" width="110">
      <path
        d="M55 17c19 0 34 15 34 34 0 19-15 34-34 34S21 70 21 51C21 32 36 17 55 17Z"
        fill="rgba(255,255,255,0.88)"
      />
      <path
        d="M12 161c4-34 24-53 43-53s39 19 43 53"
        fill="rgba(255,255,255,0.88)"
      />
    </svg>
  )
}

export function CardPreview(props: {
  card: CardDesign
  emphasis?: 'focused' | 'normal'
  showSignature?: boolean
}) {
  const { card, emphasis = 'normal', showSignature = true } = props

  return (
    <Box
      bg="rgba(17, 16, 13, 0.98)"
      border="1px solid rgba(255,255,255,0.08)"
      borderRadius="28px"
      boxShadow={
        emphasis === 'focused'
          ? '0 30px 70px rgba(17, 16, 13, 0.35)'
          : '0 18px 40px rgba(17, 16, 13, 0.18)'
      }
      color="white"
      h="360px"
      overflow="hidden"
      position="relative"
      w="240px"
    >
      <PatternRenderer settings={card.patternSettings} />
      <VStack align="stretch" h="full" justify="space-between" p="5" position="relative" zIndex="1">
        <Box alignSelf="center" mt="1" position="relative">
          {card.portraitImage ? (
            <Image
              alt={card.title}
              h="176px"
              objectFit="contain"
              src={card.portraitImage}
              w="124px"
            />
          ) : (
            <PortraitFallback />
          )}
        </Box>

        <Box>
          {showSignature && card.signatureData ? (
            <Image
              alt="Signature"
              h="36px"
              mb="2"
              objectFit="contain"
              src={card.signatureData.dataUrl}
              w="96px"
            />
          ) : null}
          <Text fontSize="xl" fontWeight="700" lineHeight="1.1">
            {card.title}
          </Text>
          <Text color="rgba(255,255,255,0.72)" fontSize="sm" mt="1">
            {card.subtitle}
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}
