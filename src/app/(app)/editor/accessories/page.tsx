'use client'

import { Box, Button, ColorPicker, HStack, Icon, Stack, Text, parseColor } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { CardAccessoriesPreview } from '@/components/app/card-accessories-preview'
import { frostedGlass } from '@/lib/ui-tokens'
import { colors } from '@/lib/variations'
import { useAppStore } from '@/store/app-store'
import { BackChev } from '@/icons/BackChev'

const MotionBox = motion.create(Box)

const accessorySwatches = Array.from(
  new Set([
    colors.magenta1,
    colors.magenta2,
    colors.magenta3,
    colors.purple1,
    colors.purple2,
    colors.purple3,
    colors.purple4,
    colors.purple5,
    colors.purple6,
    colors.purple7,
    colors.red1,
    colors.red2,
    colors.red3,
    colors.red4,
    colors.red5,
    colors.red6,
    colors.red7,
    colors.dataShadesGreen,
    colors.dataShadesRed,
    colors.dataShadesYellow,
    colors.commonWhite,
    colors.gray1,
    colors.gray2,
    colors.gray3,
    colors.gray4,
    colors.gray5,
    colors.gray6,
    colors.gray7,
  ])
)

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
      defaultValue="#FFFFFF"
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
              <ColorPicker.SwatchIndicator boxSize="3" bg="white" border="1px solid {colors.border}" />
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

  const cardHolderColor = activeDraft.cardHolderColor || colors.gray6
  const lanyardColor = activeDraft.lanyardColor || colors.purple6

  return (
    <Stack align="center" gap="0" height="100dvh" justifyContent="flex-start" position="relative">
      <HStack gap="3" left="24px" position="absolute" top="24px" zIndex="docked">
        <Button onClick={() => router.push('/editor')} rounded="full" variant="outline" {...frostedGlass}>
          <BackChev height="14px" width="14px" />
          Back
        </Button>
        <HStack gap={2} px="4" py="2" rounded="2xl" zIndex="docked" {...frostedGlass}>
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
          <Text color="var(--lanyard-muted)" fontSize="sm">
            Pick the holder and lanyard finish.
          </Text>
        </HStack>
      </HStack>

      <Stack height="100%" justifyContent="center">
        <HStack align="center" flexDirection={{ base: 'column', xl: 'row' }} gap="8" justifyContent="flex-start">
          <MotionBox
            animate={{ opacity: 1, scale: 1, x: 0 }}
            initial={{ opacity: 0, scale: 0.92, x: -48 }}
            transition={{ duration: 0.36, ease: 'easeOut' }}
          >
            <CardAccessoriesPreview card={activeDraft} />
          </MotionBox>

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
                <Text color="fg.muted">
                  Finish the look with a holder and lanyard color pairing.
                </Text>
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

              <SwatchPicker
                label="Lanyard color"
                onValueChange={(value) =>
                  updateDraft((draft) => ({
                    ...draft,
                    lanyardColor: value,
                  }))
                }
                value={lanyardColor}
              />

              <HStack gap="3">
                <Button
                  onClick={() => {
                    saveDraft()
                    router.push('/library')
                  }}
                >
                  Save to library
                </Button>
              </HStack>
            </Stack>
          </MotionBox>
        </HStack>
      </Stack>
    </Stack>
  )
}
