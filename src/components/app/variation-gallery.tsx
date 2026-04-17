'use client'

import { useEffect, useMemo, useState } from 'react'

import { Box, Button, IconButton, Stack, Text } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { CardRowLoop } from '@/components/app/card-row-loop'
import { SelectorCard } from '@/components/app/selector-card'
import { generateSmartVariations } from '@/lib/variations'
import type { GeneratedVariation } from '@/types/domain'
import { useAppStore } from '@/store/app-store'

const MotionBox = motion.create(Box)

export function VariationGallery() {
  const activeDraft = useAppStore((state) => state.activeDraft)
  const clearSelectedVariation = useAppStore((state) => state.clearSelectedVariation)
  const profile = useAppStore((state) => state.profile)
  const selectVariation = useAppStore((state) => state.selectVariation)
  const setWizardStep = useAppStore((state) => state.setWizardStep)
  const router = useRouter()
  const [focusedVariation, setFocusedVariation] = useState<GeneratedVariation | null>(null)
  const [phase, setPhase] = useState<'browsing' | 'focused'>('browsing')
  const [rowsInMotion, setRowsInMotion] = useState<Record<number, boolean>>({})

  const variations = useMemo(() => {
    if (!activeDraft) {
      return []
    }

    return generateSmartVariations(activeDraft, profile)
  }, [activeDraft, profile])

  const handleSelectVariation = (variation: GeneratedVariation) => {
    setFocusedVariation(variation)
    setPhase('focused')
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

  const focusedVariationId = focusedVariation?.id

  useEffect(() => {
    setRowsInMotion({})
  }, [variations])

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
            const rowIsInMotion = rowsInMotion[rowIndex] ?? false

            if (rowVariations.length === 0) {
              return null
            }

            const rowItems = rowVariations.map((variation, itemIndex) => {
              const targetOpacity =
                phase === 'browsing'
                  ? rowIsInMotion
                    ? 1
                    : 0
                  : variation.id === focusedVariationId
                    ? 0
                    : 0.05

              return {
                ariaLabel: `Select ${variation.id} variation`,
                node: (
                  <MotionBox
                    animate={{ opacity: targetOpacity }}
                    initial={{ opacity: 0 }}
                    minW={{ base: '198px', md: '240px' }}
                    pointerEvents={phase === 'browsing' ? 'auto' : 'none'}
                    transition={{
                      delay:
                        phase === 'browsing' && rowIsInMotion
                          ? rowIndex * 0.12 + itemIndex * 0.08
                          : 0,
                      duration: phase === 'browsing' ? 0.5 : 0.28,
                      ease: 'easeOut',
                    }}
                    w={{ base: '198px', md: '240px' }}
                  >
                    <SelectorCard
                      interactive={phase === 'browsing'}
                      onSelect={() => handleSelectVariation(variation)}
                      variation={variation}
                    />
                  </MotionBox>
                ),
              }
            })

            return (
              <Box key={rowIndex}>
                <CardRowLoop
                  ariaLabel={`Variation row ${rowIndex + 1}`}
                  edgePadding={36}
                  fadeOut
                  freeze={phase !== 'browsing'}
                  gap={24}
                  items={rowItems}
                  onMotionReady={() =>
                    setRowsInMotion((currentRows) =>
                      currentRows[rowIndex] ? currentRows : { ...currentRows, [rowIndex]: true }
                    )
                  }
                  pauseOnHover
                  scaleOnHover={phase === 'browsing'}
                  speed={rowIndex % 2 === 0 ? 40 : 30}
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
            backdropFilter="blur(12px)"
            bg="rgba(255,255,255,0.24)"
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
                  initial={{ opacity: 1, scale: 1, y: 0 }}
                  maxW={{ base: '240px', md: '320px' }}
                  transition={{
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  w="full"
                >
                  <SelectorCard interactive={false} isSelected variation={focusedVariation} />
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
