'use client'

import {
  Box,
  Button,
  ColorPicker,
  HStack,
  Heading,
  Icon,
  RadioCard,
  Stack,
  Text,
  VStack,
  parseColor,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { CardAccessoriesPreview } from '@/components/app/card-accessories-preview'
import { getLanyardPreviewColor, normalizeLanyardFinish } from '@/lib/lanyard-finish'
import { frostedGlass } from '@/lib/ui-tokens'
import { colors } from '@/lib/variations'
import { useAppStore } from '@/store/app-store'
import type { LanyardFinish } from '@/types/domain'
import { BackChev } from '@/icons/BackChev'
import { Send } from '@/icons/Send'

const MotionBox = motion.create(Box)

const accessorySwatches = Array.from(
  new Set([
    colors.magenta2,
    colors.purple5,
    colors.red5,
    colors.dataShadesGreen,
    colors.dataShadesRed,
    colors.dataShadesYellow,
    colors.commonWhite,
  ])
)

const lanyardGradientPresets = [
  {
    end: colors.red6,
    id: 'yellow-red',
    label: 'Yellow to red',
    middleStops: [
      { color: colors.red1, offset: '0%' },
      { color: colors.red4, offset: '33%' },
      { color: colors.red5, offset: '66%' },
    ],
    start: colors.red1,
  },
  {
    end: colors.purple6,
    id: 'red-purple',
    label: 'Red to purple',
    middleStops: [
      { color: colors.red5, offset: '0%' },
      { color: colors.magenta2, offset: '60%' },
    ],
    start: colors.red5,
  },
] as const

function getSelectedGradientPresetId(finish: LanyardFinish) {
  const exactMatch = lanyardGradientPresets.find(
    (preset) =>
      preset.start === finish.gradientFrom &&
      preset.end === finish.gradientTo &&
      JSON.stringify(preset.middleStops) ===
        JSON.stringify(
          (finish.gradientStops ?? []).slice(1, -1).map((stop) => ({
            color: stop.color,
            offset: stop.offset,
          }))
        ) &&
      finish.gradientDirection === 'horizontal'
  )

  return exactMatch?.id ?? lanyardGradientPresets[0].id
}

function normalizeColorValue(value: string) {
  return value.trim().startsWith('#') ? value.trim().toUpperCase() : value.trim()
}

function SwatchPicker(props: {
  label: string
  onValueChange: (value: string) => void
  value: string
}) {
  const { label, onValueChange, value } = props

  return (
    <ColorPicker.Root
      alignItems="flex-start"
      size={'lg'}
      defaultValue={parseColor('#FFFFFF')}
      onValueChange={(details) => onValueChange(normalizeColorValue(details.valueAsString))}
      value={parseColor(normalizeColorValue(value))}
    >
      <ColorPicker.HiddenInput />
      <ColorPicker.Label fontSize="sm" fontWeight="600" mb="2">
        {label}
      </ColorPicker.Label>
      <ColorPicker.SwatchGroup maxW="460px">
        {accessorySwatches.map((swatch) => (
          <ColorPicker.SwatchTrigger key={`${label}-${swatch}`} value={swatch}>
            <ColorPicker.Swatch value={swatch}>
              <ColorPicker.SwatchIndicator
                boxSize="3"
                bg="white"
                border="1px solid {colors.border}"
              />
            </ColorPicker.Swatch>
          </ColorPicker.SwatchTrigger>
        ))}
      </ColorPicker.SwatchGroup>
    </ColorPicker.Root>
  )
}

export default function EditorAccessoriesPage() {
  const router = useRouter()
  const activeDraft = useAppStore((state) => state.activeDraft)
  const saveDraft = useAppStore((state) => state.saveDraft)
  const updateDraft = useAppStore((state) => state.updateDraft)

  if (!activeDraft) {
    return null
  }

  const cardHolderColor = activeDraft.cardHolderColor || accessorySwatches[0]
  const lanyardFinish = normalizeLanyardFinish(activeDraft.lanyardColor, activeDraft.lanyardFinish)
  const selectedGradientPresetId = getSelectedGradientPresetId(lanyardFinish)

  const updateLanyardFinish = (updater: (finish: LanyardFinish) => LanyardFinish) => {
    updateDraft((draft) => {
      const nextFinish = updater(normalizeLanyardFinish(draft.lanyardColor, draft.lanyardFinish))

      return {
        ...draft,
        lanyardColor: getLanyardPreviewColor(nextFinish),
        lanyardFinish: nextFinish,
      }
    })
  }

  return (
    <Stack align="center" gap="0" height="100dvh" justifyContent="flex-start" position="relative">
      <HStack gap="3" left="24px" position="absolute" top="24px" zIndex="docked">
        <Button
          onClick={() => router.push('/editor')}
          variant="solid"
          rounded={'full'}
          gap={'4px'}
          colorPalette={'primary'}
        >
          <BackChev height="14px" width="14px" />
          Back
        </Button>
        <HStack gap={2} px="4" py="2" rounded="full" zIndex="docked" {...frostedGlass}>
          <Icon
            as="svg"
            boxSize="20px"
            color="fg.muted"
            fill="none"
            height="16px"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="16px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </Icon>
          <Text fontSize="sm">Choose the card holder and lanyard finish.</Text>
        </HStack>
      </HStack>

      <Stack height="100%" justifyContent="center">
        <HStack
          align="center"
          flexDirection={{ base: 'column', xl: 'row' }}
          gap="8"
          justifyContent="flex-end"
        >
          <VStack
            asChild
            w="full"
            height="full"
            justifyContent="flex-end"
            p={0}
            className="card-preview-container"
          >
            <MotionBox
              animate={{ opacity: 1, scale: 1, x: 0 }}
              initial={{ opacity: 0, scale: 0.92, x: -48 }}
              transition={{ duration: 0.36, ease: 'easeOut' }}
            >
              <CardAccessoriesPreview card={activeDraft} />
            </MotionBox>
          </VStack>
          <VStack asChild w="full" height="full" p={0}>
            <MotionBox
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: 44 }}
              transition={{ delay: 0.08, duration: 0.34, ease: 'easeOut' }}
            >
              <Stack
                {...frostedGlass}
                border="1px solid rgba(255,255,255,0.72)"
                borderRadius="32px"
                gap="6"
                p={{ base: '5', md: '7' }}
              >
                <Stack gap="2">
                  <Heading color={'primary.950'} fontWeight={700}>
                    Finish by customizing the card holder & lanyard.
                  </Heading>
                </Stack>

                <Stack gap="4">
                  <RadioCard.Root
                    colorPalette="primary"
                    align="center"
                    onValueChange={(details) => {
                      const preset = lanyardGradientPresets.find(
                        (entry) => entry.id === details.value
                      )

                      if (!preset) {
                        return
                      }

                      updateLanyardFinish((finish) => ({
                        ...finish,
                        gradientDirection: 'horizontal',
                        gradientFrom: preset.start,
                        gradientStops: [
                          { color: preset.start, offset: '0%' },
                          ...preset.middleStops,
                          { color: preset.end, offset: '100%' },
                        ],
                        gradientTo: preset.end,
                      }))
                    }}
                    orientation="vertical"
                    value={selectedGradientPresetId}
                    variant="outline"
                  >
                    <RadioCard.Label fontSize="sm" fontWeight="600">
                      Lanyard color
                    </RadioCard.Label>
                    <Stack gap="3">
                      {lanyardGradientPresets.map((preset) => (
                        <RadioCard.Item key={preset.id} value={preset.id} width="full">
                          <RadioCard.ItemHiddenInput />
                          <RadioCard.ItemControl
                            alignItems="center"
                            display="flex"
                            gap="4"
                            justifyContent="space-between"
                            minH="88px"
                            px="4"
                            py="3"
                          >
                            <HStack flex="1" gap="4" width="full">
                              <RadioCard.ItemIndicator />
                              <RadioCard.ItemContent flex="1" width="full">
                                <Box
                                  borderRadius="md"
                                  h="44px"
                                  overflow="hidden"
                                  position="relative"
                                  w="full"
                                  bgGradient={(() => {
                                    const stops = [
                                      ...preset.middleStops.map(
                                        (stop) => `${stop.color} ${stop.offset}`
                                      ),
                                      `${preset.end} 100%`,
                                    ]

                                    return `linear-gradient(to right, ${stops.join(', ')})`
                                  })()}
                                />
                              </RadioCard.ItemContent>
                            </HStack>
                          </RadioCard.ItemControl>
                        </RadioCard.Item>
                      ))}
                    </Stack>
                  </RadioCard.Root>
                </Stack>

                <SwatchPicker
                  label="Card holder color"
                  onValueChange={(value) =>
                    updateDraft((draft) => ({
                      ...draft,
                      cardHolderColor: value,
                    }))
                  }
                  value={cardHolderColor}
                />
              </Stack>
              <HStack gap="3" mt={3} w={'full'} justifyContent="flex-end">
                <Button
                  onClick={() => {
                    saveDraft()
                    router.push('/submitted')
                  }}
                >
                  Save & Submit for approval
                  <Send width="18px" height="18px" />
                </Button>
              </HStack>
            </MotionBox>
          </VStack>
        </HStack>
      </Stack>
    </Stack>
  )
}
