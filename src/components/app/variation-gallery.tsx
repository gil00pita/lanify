'use client'

import { useEffect, useMemo, useState } from 'react'

import { Box, Button, HStack, IconButton, Stack, Text } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { CardRowLoop } from '@/components/app/card-row-loop'
import { PRINT_CARD_ASPECT_RATIO } from '@/lib/ui-tokens'
import { generateSmartVariations } from '@/lib/variations'
import type { GeneratedVariation, PatternSettings } from '@/types/domain'
import { useAppStore } from '@/store/app-store'

const MotionBox = motion.create(Box)
const FADE_DURATION_MS = 260

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

function SelectorCard(props: {
  isSelected?: boolean
  onSelect?: () => void
  variation: GeneratedVariation
}) {
  const color = props.variation.design.primaryColor
  const foreground = getForeground(color)

  return (
    <MotionBox
      aspectRatio={PRINT_CARD_ASPECT_RATIO}
      bg={color}
      border={
        props.isSelected ? '3px solid rgba(255,255,255,0.96)' : '1px solid rgba(255,255,255,0.55)'
      }
      borderRadius="24px"
      boxShadow={
        props.isSelected ? '0 26px 60px rgba(17,16,13,0.28)' : '0 12px 28px rgba(17,16,13,0.16)'
      }
      color={foreground}
      cursor={props.onSelect ? 'pointer' : 'default'}
      onClick={props.onSelect}
      p={{ base: '4', md: '5' }}
      position="relative"
      whileHover={props.onSelect ? { scale: 1.02, y: -4 } : undefined}
      whileTap={props.onSelect ? { scale: 0.99 } : undefined}
      w="100%"
    >
      <Stack gap="3" h="full" justify="space-between">
        <Box opacity="0.92">
          <SelectorPattern color={color} settings={props.variation.design.patternSettings} />
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
    </MotionBox>
  )
}

export function VariationGallery() {
  const activeDraft = useAppStore((state) => state.activeDraft)
  const clearSelectedVariation = useAppStore((state) => state.clearSelectedVariation)
  const profile = useAppStore((state) => state.profile)
  const selectVariation = useAppStore((state) => state.selectVariation)
  const setWizardStep = useAppStore((state) => state.setWizardStep)
  const router = useRouter()
  const [focusedVariation, setFocusedVariation] = useState<GeneratedVariation | null>(null)
  const [phase, setPhase] = useState<'browsing' | 'fading' | 'focused'>('browsing')

  const variations = useMemo(() => {
    if (!activeDraft) {
      return []
    }

    return generateSmartVariations(activeDraft, profile)
  }, [activeDraft, profile])

  useEffect(() => {
    if (phase !== 'fading') {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setPhase('focused')
    }, FADE_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [phase])

  const handleSelectVariation = (variation: GeneratedVariation) => {
    setFocusedVariation(variation)
    setPhase('fading')
  }

  const handleCloseFocused = () => {
    clearSelectedVariation()
    setFocusedVariation(null)
    setPhase('browsing')
  }

  const handleContinue = () => {
    if (!focusedVariation) {
      return
    }

    selectVariation(focusedVariation.design)
    setWizardStep('edit')
    router.push('/editor')
  }

  if (!activeDraft) {
    return (
      <Stack gap="4">
        <Text color="var(--lanyard-muted)">
          Start a new card in the wizard to generate variations.
        </Text>
        <Button onClick={() => router.push('/wizard')} w="fit-content">
          Back to wizard
        </Button>
      </Stack>
    )
  }

  return (
    <Box minH="100vh" overflow="hidden" position="relative">
      <MotionBox animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.24, ease: 'easeOut' }}>
        <Stack gap="0">
          {[0, 1, 2].map((rowIndex) => {
            const rowVariations = variations.slice(rowIndex * 4, rowIndex * 4 + 4)

            if (rowVariations.length === 0) {
              return null
            }

            const rowItems = rowVariations.map((variation) => ({
              ariaLabel: `Select ${variation.id} variation`,
              node: (
                <Box
                  minW={{ base: '198px', md: '240px' }}
                  opacity={phase === 'browsing' ? 1 : 0.08}
                  pointerEvents={phase === 'browsing' ? 'auto' : 'none'}
                  transition="opacity 0.26s ease"
                  w={{ base: '198px', md: '240px' }}
                >
                  <SelectorCard
                    onSelect={() => handleSelectVariation(variation)}
                    variation={variation}
                  />
                </Box>
              ),
            }))

            return (
              <Box key={rowIndex}>
                <CardRowLoop
                  ariaLabel={`Variation row ${rowIndex + 1}`}
                  edgePadding={36}
                  fadeOut
                  gap={24}
                  items={rowItems}
                  pauseOnHover
                  scaleOnHover={phase === 'browsing'}
                  speed={phase === 'browsing' ? (rowIndex % 2 === 0 ? 40 : 30) : 0}
                  direction={rowIndex % 2 === 0 ? 'left' : 'right'}
                />
              </Box>
            )
          })}
        </Stack>
      </MotionBox>

      <AnimatePresence>
        {focusedVariation && phase === 'focused' ? (
          <MotionBox
            animate={{ opacity: 1 }}
            backdropFilter="blur(10px)"
            bg="rgba(255,255,255,0.42)"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            inset="0"
            position="absolute"
            zIndex="overlay"
          >
            <Box display="grid" inset="0" placeItems="center" position="absolute" px={{ base: '6', md: '10' }}>
              <Stack align="center" gap="5" position="relative">
                <IconButton
                  aria-label="Close selected card"
                  onClick={handleCloseFocused}
                  position="absolute"
                  right={{ base: '-8px', md: '-12px' }}
                  rounded="full"
                  size="sm"
                  top={{ base: '-12px', md: '-16px' }}
                  variant="solid"
                  zIndex={1}
                >
                  ×
                </IconButton>

                <MotionBox
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  initial={{ opacity: 0, scale: 0.86, y: 24 }}
                  maxW={{ base: '240px', md: '320px' }}
                  transition={{ duration: 0.34, ease: 'easeOut' }}
                  w="full"
                >
                  <SelectorCard isSelected variation={focusedVariation} />
                </MotionBox>

                <Button onClick={handleContinue} rounded="full" size="lg" w={{ base: 'full', md: '220px' }}>
                  Continue
                </Button>
              </Stack>
            </Box>
          </MotionBox>
        ) : null}
      </AnimatePresence>
    </Box>
  )
}
