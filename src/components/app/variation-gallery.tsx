'use client'

import { memo, startTransition, useCallback, useEffect, useMemo, useState } from 'react'

import { Box, Button, IconButton, Stack, Text } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { CardRowLoop } from '@/components/app/card-row-loop'
import { SelectorCard } from '@/components/app/selector-card'
import { generateSmartVariations } from '@/lib/variations'
import type { GeneratedVariation } from '@/types/domain'
import { useAppStore } from '@/store/app-store'
import { CloseIcon } from '@/icons/Close'

const MotionBox = motion.create(Box)

const GalleryRows = memo(function GalleryRows(props: {
  onRowMotionReady: (rowIndex: number) => void
  onSelectVariation: (variation: GeneratedVariation) => void
  phase: 'browsing' | 'focused'
  rowsInMotion: Record<number, boolean>
  variations: GeneratedVariation[]
}) {
  const { onRowMotionReady, onSelectVariation, phase, rowsInMotion, variations } = props

  return (
    <Stack gap="0">
      {[0, 1, 2].map((rowIndex) => {
        const rowVariations = variations.slice(rowIndex * 4, rowIndex * 4 + 4)
        const rowIsInMotion = rowsInMotion[rowIndex] ?? false

        if (rowVariations.length === 0) {
          return null
        }

        const rowItems = rowVariations.map((variation, itemIndex) => {
          const targetOpacity = rowIsInMotion ? 1 : 0

          return {
            ariaLabel: `Select ${variation.id} variation`,
            node: (
              <Box
                minW={{ base: '198px', md: '240px' }}
                opacity={targetOpacity}
                transition={
                  rowIsInMotion
                    ? `opacity 0.5s ease-out ${rowIndex * 0.12 + itemIndex * 0.08}s`
                    : undefined
                }
                w={{ base: '198px', md: '240px' }}
              >
                <SelectorCard
                  onSelect={() => onSelectVariation(variation)}
                  performanceMode="gallery"
                  variation={variation}
                />
              </Box>
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
              freezeDurationMs={2000}
              gap={24}
              items={rowItems}
              onMotionReady={() => onRowMotionReady(rowIndex)}
              pauseOnHover
              preserveHoverSpacing
              scaleOnHover={phase === 'browsing'}
              speed={rowIndex % 2 === 0 ? 40 : 30}
              direction={rowIndex % 2 === 0 ? 'left' : 'right'}
            />
          </Box>
        )
      })}
    </Stack>
  )
})

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

  const handleSelectVariation = useCallback((variation: GeneratedVariation) => {
    setFocusedVariation(variation)
    startTransition(() => {
      setPhase('focused')
    })
  }, [])

  const handleRowMotionReady = useCallback((rowIndex: number) => {
    setRowsInMotion((currentRows) =>
      currentRows[rowIndex] ? currentRows : { ...currentRows, [rowIndex]: true }
    )
  }, [])

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
      <MotionBox
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
      >
        <GalleryRows
          onRowMotionReady={handleRowMotionReady}
          onSelectVariation={handleSelectVariation}
          phase={phase}
          rowsInMotion={rowsInMotion}
          variations={variations}
        />
      </MotionBox>

      <AnimatePresence>
        {focusedVariation ? (
          <MotionBox
            animate={{ opacity: 1 }}
            backdropFilter="blur(8px)"
            bg="rgba(246,242,236,0.72)"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            inset="0"
            onClick={handleCloseFocused}
            position="absolute"
            zIndex="overlay"
          >
            <Box
              display="grid"
              inset="0"
              placeItems="center"
              position="absolute"
              px={{ base: '6', md: '10' }}
            >
              <Stack
                align="center"
                gap="5"
                onClick={(event) => event.stopPropagation()}
                position="relative"
              >
                <IconButton
                  aria-label="Close selected card"
                  onClick={handleCloseFocused}
                  position="absolute"
                  right={{ base: '-22px' }}
                  rounded="full"
                  size="sm"
                  top={{ base: '-36px' }}
                  variant="solid"
                  colorPalette={'gray'}
                  zIndex={1}
                >
                  <CloseIcon />
                </IconButton>

                <MotionBox
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  initial={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  transformOrigin="center center"
                  w={{ base: '198px', md: '240px' }}
                >
                  <SelectorCard
                    isSelected
                    interactive={false}
                    variation={focusedVariation}
                    width="100%"
                  />
                </MotionBox>

                <Button
                  onClick={handleContinue}
                  rounded="full"
                  size="lg"
                  w={{ base: 'full', md: '220px' }}
                >
                  Customize this card
                </Button>
              </Stack>
            </Box>
          </MotionBox>
        ) : null}
      </AnimatePresence>
    </Box>
  )
}
