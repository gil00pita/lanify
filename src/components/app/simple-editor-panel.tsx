'use client'

import {
  Box,
  Button,
  ColorPicker,
  HStack,
  Input,
  Stack,
  Switch,
  Text,
  parseColor,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { colors } from '@/lib/variations'
import { useAppStore } from '@/store/app-store'

const accentSwatches = [
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
  colors.commonWhite,
  colors.gray1,
  colors.gray2,
  colors.gray3,
  colors.gray4,
  colors.gray5,
  colors.gray6,
  colors.gray7,
]

export function SimpleEditorPanel() {
  const activeDraft = useAppStore((state) => state.activeDraft)
  const updateDraft = useAppStore((state) => state.updateDraft)
  const saveDraft = useAppStore((state) => state.saveDraft)
  const router = useRouter()

  if (!activeDraft) {
    return ''
  }

  return (
    <Stack gap="4">
      <Box>
        <ColorPicker.Root
          alignItems="flex-start"
          defaultValue={'#fff'}
          onValueChange={(details) =>
            updateDraft((draft) => ({
              ...draft,
              primaryColor: details.valueAsString,
            }))
          }
          value={parseColor(activeDraft.primaryColor)}
        >
          <ColorPicker.HiddenInput />
          <ColorPicker.Label fontSize="sm" fontWeight="600" mb="2">
            Accent color
          </ColorPicker.Label>
          <ColorPicker.SwatchGroup maxW={'460px'}>
            {accentSwatches.map((swatch) => (
              <ColorPicker.SwatchTrigger key={swatch} value={swatch}>
                <ColorPicker.Swatch value={swatch}>
                  <ColorPicker.SwatchIndicator
                    boxSize="3"
                    bg="white"
                    border={'1px solid {colors.border}'}
                  />
                </ColorPicker.Swatch>
              </ColorPicker.SwatchTrigger>
            ))}
          </ColorPicker.SwatchGroup>
        </ColorPicker.Root>
      </Box>

      <Box>
        <Text fontWeight="600" mb="2">
          Pattern scale
        </Text>
        <Input
          onChange={(event) =>
            updateDraft((draft) => ({
              ...draft,
              patternSettings: {
                ...draft.patternSettings,
                scale: Number(event.target.value),
              },
            }))
          }
          step="0.05"
          type="range"
          value={activeDraft.patternSettings.scale}
        />
      </Box>

      <Box>
        <Text fontWeight="600" mb="2">
          Pattern rotation
        </Text>
        <Input
          max="30"
          min="-30"
          onChange={(event) =>
            updateDraft((draft) => ({
              ...draft,
              patternSettings: {
                ...draft.patternSettings,
                rotation: Number(event.target.value),
              },
            }))
          }
          step="1"
          type="range"
          value={activeDraft.patternSettings.rotation}
        />
      </Box>

      <HStack justify="space-between">
        <Text fontWeight="600">Animate wave</Text>
        <Switch.Root
          checked={activeDraft.patternSettings.animate}
          onCheckedChange={(details) =>
            updateDraft((draft) => ({
              ...draft,
              patternSettings: {
                ...draft.patternSettings,
                animate: details.checked,
              },
            }))
          }
        >
          <Switch.HiddenInput />
          <Switch.Control />
        </Switch.Root>
      </HStack>

      <HStack gap="3">
        <Button onClick={() => saveDraft()}>Save to library</Button>
        <Button onClick={() => router.push('/editor/advanced')} variant="outline">
          Open advanced mode
        </Button>
      </HStack>
    </Stack>
  )
}
