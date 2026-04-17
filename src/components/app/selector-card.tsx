'use client'

import type { ReactNode } from 'react'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import { PRINT_CARD_ASPECT_RATIO } from '@/lib/ui-tokens'
import type { GeneratedVariation, PatternSettings } from '@/types/domain'

const MotionBox = motion.create(Box)

function getForeground(color: string) {
  return ['#1f1d1d', '#59503b', '#8e018a', '#2f4fe9'].includes(color) ? '#f7f0e4' : '#1f1d1d'
}

function SelectorPattern(props: { color: string; settings: PatternSettings }) {
  const { color, settings } = props
  const foreground = getForeground(color)
  const cols = Math.min(22, Math.max(12, settings.itemsPerRow))
  const rows = Math.min(10, Math.max(6, settings.rows))

  const marks = Array.from({ length: rows * cols }, (_, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols
    const normalized = col / Math.max(cols - 1, 1)
    const sine =
      Math.sin(normalized * Math.PI * 2 * settings.frequency + row * 0.45 + settings.phaseOffset) *
      settings.amplitude
    const opacity =
      settings.minOpacity + ((sine + 1) / 2) * (settings.maxOpacity - settings.minOpacity)

    return {
      key: `${row}-${col}`,
      opacity: Math.max(0.12, Math.min(1, opacity)),
      x: 8 + col * 12,
      y: 8 + row * 12,
    }
  })

  return (
    <svg height="118" viewBox="0 0 290 118" width="100%">
      {marks.map((mark) => (
        <rect
          fill={foreground}
          height="9"
          key={mark.key}
          opacity={mark.opacity}
          rx="1.5"
          width="9"
          x={mark.x}
          y={mark.y}
        />
      ))}
    </svg>
  )
}

type SelectorCardFaceProps = {
  color: string
  foreground: string
  variation: GeneratedVariation
}

function SelectorCardFront(props: SelectorCardFaceProps) {
  const { color, foreground, variation } = props

  return (
    <Stack gap="3" h="full" justify="space-between">
      <Box opacity="0.92">
        <SelectorPattern color={color} settings={variation.design.patternSettings} />
      </Box>

      <Stack gap="1">
        <Text
          fontFamily="Georgia, serif"
          fontSize={{ base: 'lg', md: '2xl' }}
          lineHeight="0.95"
          opacity="0.88"
        >
          Interface Craft
        </Text>
        <Text fontFamily="Georgia, serif" fontSize={{ base: '2xl', md: '4xl' }} lineHeight="0.88">
          Library Card
        </Text>
      </Stack>

      <HStack align="end" justify="space-between">
        <Stack gap="1">
          <Text
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.18em"
            opacity="0.56"
            textTransform="uppercase"
          >
            Member
          </Text>
          <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="700" opacity="0.9">
            New Member
          </Text>
        </Stack>
        <Stack gap="1" textAlign="right">
          <Text
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.18em"
            opacity="0.56"
            textTransform="uppercase"
          >
            Issued On
          </Text>
          <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="700" opacity="0.9">
            02/25/26
          </Text>
        </Stack>
      </HStack>

      <Box
        bg={foreground}
        borderRadius="full"
        bottom="18px"
        h="4px"
        left="20px"
        opacity="0.1"
        position="absolute"
        right="20px"
      />
    </Stack>
  )
}

function SelectorCardBack(props: SelectorCardFaceProps) {
  const { color, foreground, variation } = props

  return (
    <Stack gap="4" h="full" justify="space-between">
      <Stack gap="3">
        <Text
          fontSize="xs"
          fontWeight="700"
          letterSpacing="0.24em"
          opacity="0.58"
          textTransform="uppercase"
        >
          Selected Variation
        </Text>
        <Stack gap="1">
          <Text fontFamily="Georgia, serif" fontSize={{ base: '2xl', md: '4xl' }} lineHeight="0.9">
            Ready to Edit
          </Text>
          <Text maxW="24ch" opacity="0.78">
            This palette and pattern are now in focus. Continue to refine the card in the editor.
          </Text>
        </Stack>
      </Stack>

      <Box bg="rgba(255,255,255,0.18)" borderRadius="20px" p="4">
        <Stack gap="3">
          <HStack justify="space-between">
            <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" opacity="0.56" textTransform="uppercase">
              Variation
            </Text>
            <Text fontSize="sm" fontWeight="700" opacity="0.92">
              {variation.id}
            </Text>
          </HStack>
          <Box opacity="0.85">
            <SelectorPattern color={color} settings={variation.design.patternSettings} />
          </Box>
        </Stack>
      </Box>

      <Box bg={foreground} borderRadius="full" h="4px" opacity="0.14" />
    </Stack>
  )
}

function SelectorCardFace(props: {
  children: ReactNode
  color: string
  foreground: string
  rotateY?: number
}) {
  const { children, color, foreground, rotateY = 0 } = props

  return (
    <Box
      bg={color}
      border="inherit"
      borderRadius="24px"
      boxShadow="inherit"
      color={foreground}
      inset="0"
      p={{ base: '4', md: '5' }}
      position="absolute"
      style={{
        backfaceVisibility: 'hidden',
        transform: `rotateY(${rotateY}deg)`,
      }}
    >
      {children}
    </Box>
  )
}

export function SelectorCard(props: {
  interactive?: boolean
  isSelected?: boolean
  onSelect?: () => void
  variation: GeneratedVariation
}) {
  const color = props.variation.design.primaryColor
  const foreground = getForeground(color)
  const isInteractive = props.interactive ?? Boolean(props.onSelect)

  return (
    <Box
      cursor={isInteractive ? 'pointer' : 'default'}
      onClick={isInteractive ? props.onSelect : undefined}
      position="relative"
      style={{ perspective: '1200px' }}
      w="100%"
    >
      <MotionBox
        animate={{
          rotateY: props.isSelected ? 180 : 0,
          scale: props.isSelected ? 1.08 : 1,
          y: props.isSelected ? -10 : 0,
        }}
        aspectRatio={PRINT_CARD_ASPECT_RATIO}
        border={
          props.isSelected ? '3px solid rgba(255,255,255,0.96)' : '1px solid rgba(255,255,255,0.55)'
        }
        borderRadius="24px"
        boxShadow={
          props.isSelected ? '0 30px 80px rgba(17,16,13,0.32)' : '0 12px 28px rgba(17,16,13,0.16)'
        }
        position="relative"
        style={{ transformStyle: 'preserve-3d' }}
        transition={{
          duration: props.isSelected ? 0.65 : 0.35,
          ease: props.isSelected ? [0.2, 0.8, 0.2, 1] : 'easeOut',
        }}
        whileHover={isInteractive ? { scale: 1.02, y: -4 } : undefined}
        whileTap={isInteractive ? { scale: 0.99 } : undefined}
        w="100%"
      >
        <SelectorCardFace color={color} foreground={foreground}>
          <SelectorCardFront color={color} foreground={foreground} variation={props.variation} />
        </SelectorCardFace>

        <SelectorCardFace color={color} foreground={foreground} rotateY={180}>
          <SelectorCardBack color={color} foreground={foreground} variation={props.variation} />
        </SelectorCardFace>
      </MotionBox>
    </Box>
  )
}
