'use client'

import { useMemo } from 'react'

import { Box, Button, Grid, HStack, Stack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { generateSmartVariations } from '@/lib/variations'
import type { GeneratedVariation, PatternSettings } from '@/types/domain'
import { useAppStore } from '@/store/app-store'

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

function SelectorCard(props: {
  isSelected: boolean
  onSelect: () => void
  variation: GeneratedVariation
}) {
  const color = props.variation.design.primaryColor
  const foreground = getForeground(color)

  return (
    <MotionBox
      bg={color}
      border={props.isSelected ? '3px solid rgba(255,255,255,0.96)' : '1px solid rgba(255,255,255,0.55)'}
      borderRadius="24px"
      boxShadow={
        props.isSelected
          ? '0 26px 60px rgba(17,16,13,0.28)'
          : '0 12px 28px rgba(17,16,13,0.16)'
      }
      color={foreground}
      cursor="pointer"
      h={{ base: '230px', md: '320px' }}
      onClick={props.onSelect}
      overflow="hidden"
      p={{ base: '4', md: '5' }}
      position="relative"
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.99 }}
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
          <Text
            fontFamily="Georgia, serif"
            fontSize={{ base: '2xl', md: '4xl' }}
            lineHeight="0.88"
          >
            Library Card
          </Text>
        </Stack>

        <HStack align="end" justify="space-between">
          <Stack gap="1">
            <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" opacity="0.56" textTransform="uppercase">
              Member
            </Text>
            <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="700" opacity="0.9">
              New Member
            </Text>
          </Stack>
          <Stack gap="1" textAlign="right">
            <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" opacity="0.56" textTransform="uppercase">
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
  const profile = useAppStore((state) => state.profile)
  const selectVariation = useAppStore((state) => state.selectVariation)
  const selectedVariationId = useAppStore((state) => state.wizard.selectedVariationId)
  const router = useRouter()

  const variations = useMemo(() => {
    if (!activeDraft) {
      return []
    }

    return generateSmartVariations(activeDraft, profile)
  }, [activeDraft, profile])

  if (!activeDraft) {
    return (
      <Stack gap="4">
        <Text color="var(--lanyard-muted)">Start a new card in the wizard to generate variations.</Text>
        <Button onClick={() => router.push('/wizard')} w="fit-content">
          Back to wizard
        </Button>
      </Stack>
    )
  }

  return (
    <Stack gap="6">
      <Text color="var(--lanyard-muted)" maxW="3xl">
        Pick from a field of related library-card directions. Each option stays close to your
        current settings while shifting density, rhythm, spacing, and tone so the selector feels
        curated instead of random.
      </Text>
      <Stack gap="6" overflow="hidden">
        {[0, 1, 2].map((rowIndex) => {
          const rowVariations = variations.slice(rowIndex * 4, rowIndex * 4 + 4)

          return (
            <Box key={rowIndex} overflow="hidden">
              <MotionBox
                animate={{
                  x: rowIndex % 2 === 0 ? ['0%', '-16%'] : ['-12%', '0%'],
                }}
                display="flex"
                gap="6"
                transition={{
                  duration: rowIndex % 2 === 0 ? 24 : 28,
                  ease: 'linear',
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: 'mirror',
                }}
                width="max-content"
              >
                {[...rowVariations, ...rowVariations].map((variation, index) => (
                  <Box key={`${variation.id}-${index}`} minW={{ base: '240px', md: '320px' }} w={{ base: '240px', md: '320px' }}>
                    <SelectorCard
                      isSelected={selectedVariationId === variation.id}
                      onSelect={() => selectVariation(variation.design)}
                      variation={variation}
                    />
                  </Box>
                ))}
              </MotionBox>
            </Box>
          )
        })}
      </Stack>
      <Grid gap="4" templateColumns={{ base: '1fr', md: '1fr auto' }}>
        <Box bg="rgba(255,255,255,0.62)" borderRadius="24px" p="4">
          <Text fontWeight="700">
            {selectedVariationId
              ? `Selected: ${selectedVariationId.replace(`${activeDraft.id}_`, '').replaceAll('_', ' ')}`
              : 'Select a card direction to continue'}
          </Text>
          <Text color="var(--lanyard-muted)" mt="1">
            You can still refine colors, pattern parameters, portrait, and signature after choosing
            a direction.
          </Text>
        </Box>
        <Button
          alignSelf="stretch"
          onClick={() => router.push('/editor')}
          px="8"
        >
          Continue with selected card
        </Button>
      </Grid>
    </Stack>
  )
}
