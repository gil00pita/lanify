'use client'

import { Box, Button, HStack, Input, Stack, Text } from '@chakra-ui/react'

import { useAppStore } from '@/store/app-store'

const fields = [
  ['rows', 6, 20, 1],
  ['itemsPerRow', 8, 30, 1],
  ['minOpacity', 0, 0.5, 0.01],
  ['maxOpacity', 0.2, 1, 0.01],
  ['amplitude', 0.1, 2, 0.01],
  ['frequency', 0.1, 3, 0.01],
  ['phaseOffset', -6, 6, 0.05],
  ['rowSpacing', 8, 30, 1],
  ['itemSpacing', 8, 28, 1],
  ['rotation', -30, 30, 1],
  ['scale', 0.75, 1.5, 0.01],
  ['animationSpeed', 0.4, 3, 0.1],
] as const

export function AdvancedControls() {
  const activeDraft = useAppStore((state) => state.activeDraft)
  const updateDraft = useAppStore((state) => state.updateDraft)

  if (!activeDraft) {
    return null
  }

  return (
    <Stack gap="4">
      {fields.map(([field, min, max, step]) => (
        <Box key={field}>
          <HStack justify="space-between" mb="2">
            <Text color="white" fontSize="sm" textTransform="capitalize">
              {field}
            </Text>
            <Text color="rgba(255,255,255,0.7)" fontSize="xs">
              {activeDraft.patternSettings[field]}
            </Text>
          </HStack>
          <Input
            max={max}
            min={min}
            onChange={(event) =>
              updateDraft((draft) => ({
                ...draft,
                patternSettings: {
                  ...draft.patternSettings,
                  [field]: Number(event.target.value),
                },
              }))
            }
            step={step}
            type="range"
            value={activeDraft.patternSettings[field]}
          />
        </Box>
      ))}

      <HStack>
        <Button
          onClick={() =>
            updateDraft((draft) => ({
              ...draft,
              patternSettings: {
                ...draft.patternSettings,
                seed: Math.floor(Math.random() * 1000),
              },
            }))
          }
          size="sm"
        >
          Randomize
        </Button>
        <Button
          onClick={() =>
            updateDraft((draft) => ({
              ...draft,
              patternSettings: {
                ...draft.patternSettings,
                animate: !draft.patternSettings.animate,
              },
            }))
          }
          size="sm"
          variant="outline"
        >
          Toggle animation
        </Button>
      </HStack>
    </Stack>
  )
}
