'use client'

import {
  Box,
  Button,
  ColorPicker,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  VStack,
  parseColor,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { colors } from '@/lib/variations'
import {
  PATTERN_PRESET_MAP,
  PATTERN_PRESETS,
  getDefaultPatternSettings,
} from '@/lib/pattern-presets'
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
const rotationStops = [0, 90, 180, 270] as const

function normalizeColorValue(value: string) {
  const trimmedValue = value.trim()

  if (trimmedValue.startsWith('#')) {
    return trimmedValue.toUpperCase()
  }

  const rgbaMatch = trimmedValue.match(/^rgba?\(([^)]+)\)$/i)

  if (!rgbaMatch) {
    return trimmedValue
  }

  const [red = '0', green = '0', blue = '0'] = rgbaMatch[1]
    .split(',')
    .slice(0, 3)
    .map((channel) => channel.trim())

  const toHex = (channel: string) =>
    Math.max(0, Math.min(255, Number.parseInt(channel, 10) || 0))
      .toString(16)
      .padStart(2, '0')
      .toUpperCase()

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
}

function SwatchColorField(props: {
  label: string
  onValueChange: (value: string) => void
  value: string
}) {
  const { label, onValueChange, value } = props

  return (
    <ColorPicker.Root
      alignItems="flex-start"
      defaultValue="#fff"
      onValueChange={(details) => onValueChange(normalizeColorValue(details.valueAsString))}
      value={parseColor(normalizeColorValue(value))}
    >
      <ColorPicker.HiddenInput />
      <ColorPicker.Label fontSize="sm" fontWeight="600" mb="2">
        {label}
      </ColorPicker.Label>
      <ColorPicker.SwatchGroup maxW="460px">
        {accentSwatches.map((swatch) => (
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

export function SimpleEditorPanel() {
  const activeDraft = useAppStore((state) => state.activeDraft)
  const updateDraft = useAppStore((state) => state.updateDraft)
  const saveDraft = useAppStore((state) => state.saveDraft)
  const router = useRouter()

  if (!activeDraft) {
    return ''
  }

  const activePattern =
    PATTERN_PRESET_MAP[activeDraft.patternSettings.patternId] ?? PATTERN_PRESET_MAP['pattern-01']
  const resolvedPatternSettings = {
    ...activePattern.defaults,
    ...activeDraft.patternSettings,
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
              primaryColor: normalizeColorValue(details.valueAsString),
            }))
          }
          value={parseColor(normalizeColorValue(activeDraft.primaryColor))}
        >
          <ColorPicker.HiddenInput />
          <ColorPicker.Label fontSize="sm" fontWeight="600" mb="2">
            Card background color
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
        <HStack align="flex-start" justify="space-between" mb="3">
          <Box>
            <Text fontWeight="600">Pattern</Text>
            <Text color="fg.muted" fontSize="sm">
              Pick a supplied SVG pattern and tune its layout.
            </Text>
          </Box>
          <Button
            onClick={() =>
              updateDraft((draft) => ({
                ...draft,
                patternSettings: {
                  ...draft.patternSettings,
                  ...getDefaultPatternSettings(draft.patternSettings.patternId),
                },
              }))
            }
            size="sm"
            variant="outline"
          >
            Reset pattern
          </Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3" mb="4">
          {PATTERN_PRESETS.map((pattern) => {
            const active = resolvedPatternSettings.patternId === pattern.id

            return (
              <Button
                key={pattern.id}
                justifyContent="flex-start"
                onClick={() =>
                  updateDraft((draft) => ({
                    ...draft,
                    patternSettings: {
                      ...draft.patternSettings,
                      ...getDefaultPatternSettings(pattern.id),
                    },
                  }))
                }
                size="sm"
                variant={active ? 'solid' : 'outline'}
              >
                {pattern.name}
              </Button>
            )
          })}
        </SimpleGrid>

        <Stack gap="4">
          {activePattern.controls.tileSize ? (
            <Box>
              <Text fontWeight="600" mb="2">
                Tile size: {resolvedPatternSettings.tileSize}
              </Text>
              <Input
                max="120"
                min="20"
                onChange={(event) =>
                  updateDraft((draft) => ({
                    ...draft,
                    patternSettings: {
                      ...draft.patternSettings,
                      tileSize: Number(event.target.value),
                    },
                  }))
                }
                type="range"
                value={resolvedPatternSettings.tileSize}
              />
            </Box>
          ) : null}

          {activePattern.controls.motifScale ? (
            <Box>
              <Text fontWeight="600" mb="2">
                Motif scale: {resolvedPatternSettings.motifScale.toFixed(2)}
              </Text>
              <Input
                max="2"
                min="0.25"
                onChange={(event) =>
                  updateDraft((draft) => ({
                    ...draft,
                    patternSettings: {
                      ...draft.patternSettings,
                      motifScale: Number(event.target.value),
                    },
                  }))
                }
                step="0.05"
                type="range"
                value={resolvedPatternSettings.motifScale}
              />
            </Box>
          ) : null}
        </Stack>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        <Box>
          <Text fontWeight="600" mb="2">
            Rotation: {resolvedPatternSettings.rotation} deg
          </Text>
          <Input
            max={rotationStops.length - 1}
            min="0"
            onChange={(event) =>
              updateDraft((draft) => ({
                ...draft,
                patternSettings: {
                  ...draft.patternSettings,
                  rotation: rotationStops[Number(event.target.value)] ?? rotationStops[0],
                },
              }))
            }
            step="1"
            type="range"
            value={rotationStops.indexOf(resolvedPatternSettings.rotation as (typeof rotationStops)[number])}
          />
          <HStack justify="space-between" mt="2">
            {rotationStops.map((rotation) => (
              <Text color="fg.muted" fontSize="xs" key={rotation}>
                {rotation}
              </Text>
            ))}
          </HStack>
        </Box>

        <Box>
          <Text fontWeight="600" mb="2">
            Opacity: {resolvedPatternSettings.opacity.toFixed(2)}
          </Text>
          <Input
            max="1"
            min="0.1"
            onChange={(event) =>
              updateDraft((draft) => ({
                ...draft,
                patternSettings: {
                  ...draft.patternSettings,
                  opacity: Number(event.target.value),
                },
              }))
            }
            step="0.05"
            type="range"
            value={resolvedPatternSettings.opacity}
          />
        </Box>

        <Box>
          <Text fontWeight="600" mb="2">
            Gap: {resolvedPatternSettings.gap}
          </Text>
          <Input
            max="40"
            min="0"
            onChange={(event) =>
              updateDraft((draft) => ({
                ...draft,
                patternSettings: {
                  ...draft.patternSettings,
                  gap: Number(event.target.value),
                },
              }))
            }
            type="range"
            value={resolvedPatternSettings.gap}
          />
        </Box>

        {activePattern.controls.offsetX ? (
          <Box>
            <Text fontWeight="600" mb="2">
              Horizontal offset: {resolvedPatternSettings.offsetX}
            </Text>
            <Input
              max="30"
              min="-30"
              onChange={(event) =>
                updateDraft((draft) => ({
                  ...draft,
                  patternSettings: {
                    ...draft.patternSettings,
                    offsetX: Number(event.target.value),
                  },
                }))
              }
              type="range"
              value={resolvedPatternSettings.offsetX}
            />
          </Box>
        ) : null}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        <Box>
          <Text fontWeight="600" mb="2">
            Rows
          </Text>
          <Input
            max="30"
            min="1"
            onChange={(event) =>
              updateDraft((draft) => ({
                ...draft,
                patternSettings: {
                  ...draft.patternSettings,
                  rows: Number(event.target.value),
                },
              }))
            }
            type="number"
            value={resolvedPatternSettings.rows}
          />
        </Box>

        <Box>
          <Text fontWeight="600" mb="2">
            Columns
          </Text>
          <Input
            max="30"
            min="1"
            onChange={(event) =>
              updateDraft((draft) => ({
                ...draft,
                patternSettings: {
                  ...draft.patternSettings,
                  cols: Number(event.target.value),
                },
              }))
            }
            type="number"
            value={resolvedPatternSettings.cols}
          />
        </Box>
      </SimpleGrid>

      <VStack gap="4">
        <SwatchColorField
          label="Fill"
          onValueChange={(value) =>
            updateDraft((draft) => ({
              ...draft,
              patternSettings: {
                ...draft.patternSettings,
                fill: value,
              },
            }))
          }
          value={resolvedPatternSettings.fill}
        />

        <SwatchColorField
          label="Stroke"
          onValueChange={(value) =>
            updateDraft((draft) => ({
              ...draft,
              patternSettings: {
                ...draft.patternSettings,
                stroke: value,
              },
            }))
          }
          value={resolvedPatternSettings.stroke}
        />

      </VStack>

      {activePattern.controls.strokeWidth ? (
        <Box>
          <Text fontWeight="600" mb="2">
            Stroke width: {resolvedPatternSettings.strokeWidth}
          </Text>
          <Input
            max="8"
            min="0"
            onChange={(event) =>
              updateDraft((draft) => ({
                ...draft,
                patternSettings: {
                  ...draft.patternSettings,
                  strokeWidth: Number(event.target.value),
                },
              }))
            }
            step="0.25"
            type="range"
            value={resolvedPatternSettings.strokeWidth}
          />
        </Box>
      ) : null}

      {activePattern.controls.alternateOpacity ? (
        <HStack justify="space-between">
          <Text fontWeight="600">Alternate opacity pattern</Text>
          <Switch.Root
            checked={resolvedPatternSettings.alternateOpacity}
            onCheckedChange={(details) =>
              updateDraft((draft) => ({
                ...draft,
                patternSettings: {
                  ...draft.patternSettings,
                  alternateOpacity: details.checked,
                },
              }))
            }
          >
            <Switch.HiddenInput />
            <Switch.Control />
          </Switch.Root>
        </HStack>
      ) : null}

      <HStack gap="3">
        <Button onClick={() => saveDraft()}>Save to library</Button>
        <Button onClick={() => router.push('/editor/advanced')} variant="outline">
          Open advanced mode
        </Button>
      </HStack>
    </Stack>
  )
}
