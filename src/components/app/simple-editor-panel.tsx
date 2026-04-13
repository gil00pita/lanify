'use client'

import { Box, Button, HStack, Input, Stack, Switch, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { useAppStore } from '@/store/app-store'

export function SimpleEditorPanel() {
  const activeDraft = useAppStore((state) => state.activeDraft)
  const updateDraft = useAppStore((state) => state.updateDraft)
  const saveDraft = useAppStore((state) => state.saveDraft)
  const router = useRouter()

  if (!activeDraft) {
    return (
      <Box bg="rgba(17,16,13,0.05)" borderRadius="24px" p="6">
        Create or select a card to start editing.
      </Box>
    )
  }

  return (
    <Stack gap="4">
      <Box>
        <Text fontWeight="600" mb="2">
          Accent color
        </Text>
        <Input
          onChange={(event) =>
            updateDraft((draft) => ({
              ...draft,
              primaryColor: event.target.value,
            }))
          }
          value={activeDraft.primaryColor}
        />
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
