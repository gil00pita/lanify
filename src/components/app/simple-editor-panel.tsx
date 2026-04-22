'use client'

import {
  Box,
  Button,
  ColorPicker,
  HStack,
  Input,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Text,
  VStack,
  parseColor,
} from '@chakra-ui/react'

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

function SliderField(props: {
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step?: number
  value: number
}) {
  const { label, max, min, onChange, step, value } = props

  return (
    <Box>
      <Text fontWeight="600" mb="2">
        {label}
      </Text>
      <Slider.Root
        max={max}
        min={min}
        onValueChange={(details) => onChange(details.value[0] ?? value)}
        size="sm"
        step={step}
        value={[value]}
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb index={0} />
        </Slider.Control>
      </Slider.Root>
    </Box>
  )
}

export function SimpleEditorPanel() {
  const activeDraft = useAppStore((state) => state.activeDraft)
  const updateDraft = useAppStore((state) => state.updateDraft)
  const saveDraft = useAppStore((state) => state.saveDraft)

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
            <SliderField
              label={`Tile size: ${resolvedPatternSettings.tileSize}`}
              max={120}
              min={20}
              onChange={(value) =>
                updateDraft((draft) => ({
                  ...draft,
                  patternSettings: {
                    ...draft.patternSettings,
                    tileSize: value,
                  },
                }))
              }
              value={resolvedPatternSettings.tileSize}
            />
          ) : null}

          {activePattern.controls.motifScale ? (
            <SliderField
              label={`Motif scale: ${resolvedPatternSettings.motifScale.toFixed(2)}`}
              max={2}
              min={0.25}
              onChange={(value) =>
                updateDraft((draft) => ({
                  ...draft,
                  patternSettings: {
                    ...draft.patternSettings,
                    motifScale: value,
                  },
                }))
              }
              step={0.05}
              value={resolvedPatternSettings.motifScale}
            />
          ) : null}
        </Stack>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        <Box>
          <Text fontWeight="600" mb="2">
            Rotation: {resolvedPatternSettings.rotation} deg
          </Text>
          <Slider.Root
            max={rotationStops.length - 1}
            min={0}
            onValueChange={(details) =>
              updateDraft((draft) => ({
                ...draft,
                patternSettings: {
                  ...draft.patternSettings,
                  rotation:
                    rotationStops[details.value[0] ?? 0] ?? rotationStops[0],
                },
              }))
            }
            size="sm"
            step={1}
            value={[
              Math.max(
                0,
                rotationStops.indexOf(
                  resolvedPatternSettings.rotation as (typeof rotationStops)[number]
                )
              ),
            ]}
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb index={0} />
            </Slider.Control>
          </Slider.Root>
          <HStack justify="space-between" mt="2">
            {rotationStops.map((rotation) => (
              <Text color="fg.muted" fontSize="xs" key={rotation}>
                {rotation}
              </Text>
            ))}
          </HStack>
        </Box>

        <SliderField
          label={`Opacity: ${resolvedPatternSettings.opacity.toFixed(2)}`}
          max={1}
          min={0.1}
          onChange={(value) =>
            updateDraft((draft) => ({
              ...draft,
              patternSettings: {
                ...draft.patternSettings,
                opacity: value,
              },
            }))
          }
          step={0.05}
          value={resolvedPatternSettings.opacity}
        />

        <SliderField
          label={`Gap: ${resolvedPatternSettings.gap}`}
          max={40}
          min={0}
          onChange={(value) =>
            updateDraft((draft) => ({
              ...draft,
              patternSettings: {
                ...draft.patternSettings,
                gap: value,
              },
            }))
          }
          value={resolvedPatternSettings.gap}
        />

        {activePattern.controls.offsetX ? (
          <SliderField
            label={`Horizontal offset: ${resolvedPatternSettings.offsetX}`}
            max={30}
            min={-30}
            onChange={(value) =>
              updateDraft((draft) => ({
                ...draft,
                patternSettings: {
                  ...draft.patternSettings,
                  offsetX: value,
                },
              }))
            }
            value={resolvedPatternSettings.offsetX}
          />
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
        <SliderField
          label={`Stroke width: ${resolvedPatternSettings.strokeWidth}`}
          max={8}
          min={0}
          onChange={(value) =>
            updateDraft((draft) => ({
              ...draft,
              patternSettings: {
                ...draft.patternSettings,
                strokeWidth: value,
              },
            }))
          }
          step={0.25}
          value={resolvedPatternSettings.strokeWidth}
        />
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
      </HStack>
    </Stack>
  )
}
