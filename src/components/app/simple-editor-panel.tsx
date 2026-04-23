'use client'

import {
  Accordion,
  Box,
  Button,
  ColorPicker,
  HStack,
  Input,
  RadioCard,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Text,
  parseColor,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import {
  VISIBLE_PATTERN_CONTRAST_RATIO,
  getContrastRatio,
  getContrastingPatternColor,
} from '@/lib/color-contrast'
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

function getPatternDefaultsForCard(
  patternId: (typeof PATTERN_PRESETS)[number]['id'],
  primaryColor: string
) {
  const patternColor = getContrastingPatternColor(primaryColor, accentSwatches)

  return {
    ...getDefaultPatternSettings(patternId),
    fill: patternColor,
    stroke: patternColor,
  }
}

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
  hiddenSwatches?: string[]
  label: string
  onValueChange: (value: string) => void
  value: string
}) {
  const { hiddenSwatches = [], label, onValueChange, value } = props
  const hiddenSwatchSet = new Set(hiddenSwatches.map(normalizeColorValue))

  return (
    <ColorPicker.Root
      alignItems="flex-start"
      defaultValue={parseColor('#fff')}
      onValueChange={(details) => onValueChange(normalizeColorValue(details.valueAsString))}
      value={parseColor(normalizeColorValue(value))}
    >
      <ColorPicker.HiddenInput />
      <ColorPicker.Label fontSize="sm" fontWeight="600" mb="2">
        {label}
      </ColorPicker.Label>
      <ColorPicker.SwatchGroup maxW="460px">
        {accentSwatches
          .filter((swatch) => !hiddenSwatchSet.has(normalizeColorValue(swatch)))
          .map((swatch) => (
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
  const router = useRouter()
  const updateDraft = useAppStore((state) => state.updateDraft)

  if (!activeDraft) {
    return ''
  }

  const activePattern =
    PATTERN_PRESET_MAP[activeDraft.patternSettings.patternId] ?? PATTERN_PRESET_MAP['pattern-01']
  const resolvedPatternSettings = {
    ...activePattern.defaults,
    ...activeDraft.patternSettings,
  }
  const hiddenPatternFillSwatches = accentSwatches.filter(
    (swatch) => getContrastRatio(activeDraft.primaryColor, swatch) < VISIBLE_PATTERN_CONTRAST_RATIO
  )

  return (
    <Stack gap="4">
      {/* Always visible: background color */}
      <Box>
        <ColorPicker.Root
          alignItems="flex-start"
          defaultValue={parseColor('#fff')}
          onValueChange={(details) => {
            const primaryColor = normalizeColorValue(details.valueAsString)

            updateDraft((draft) => {
              const patternColor = getContrastingPatternColor(primaryColor, accentSwatches)

              return {
                ...draft,
                primaryColor,
                patternSettings: {
                  ...draft.patternSettings,
                  fill: patternColor,
                  stroke: patternColor,
                },
              }
            })
          }}
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

      {/* Always visible: pattern picker */}
      <Box>
        <HStack align="flex-start" justify="space-between" mb="3">
          <Box>
            <Text fontWeight="600">Pattern</Text>
            <Text color="fg.muted" fontSize="sm">
              Pick a supplied SVG pattern and tune its layout.
            </Text>
          </Box>
        </HStack>

        <RadioCard.Root
          colorPalette="primary"
          onValueChange={(details) => {
            const pattern = PATTERN_PRESETS.find((entry) => entry.id === details.value)

            if (!pattern) {
              return
            }

            updateDraft((draft) => ({
              ...draft,
              patternSettings: {
                ...draft.patternSettings,
                ...getPatternDefaultsForCard(pattern.id, draft.primaryColor),
              },
            }))
          }}
          orientation="horizontal"
          value={resolvedPatternSettings.patternId}
          variant="outline"
        >
          <HStack align="stretch" gap="3" flexWrap="wrap">
            {PATTERN_PRESETS.map((pattern) => {
              const isSelected = resolvedPatternSettings.patternId === pattern.id

              return (
                <RadioCard.Item key={pattern.id} value={pattern.id} flex={0}>
                  <RadioCard.ItemHiddenInput />
                  <RadioCard.ItemControl
                    alignItems="center"
                    display="flex"
                    flexDirection="column"
                    gap="2"
                    h="auto"
                    p="1"
                    rounded="2xl"
                  >
                    <Box
                      bgColor="bg.primary"
                      border="1px solid {colors.border/50}"
                      color={activeDraft.primaryColor}
                      filter={isSelected ? 'none' : 'grayscale(1)'}
                      opacity={isSelected ? 1 : 0.62}
                      overflow="hidden"
                      rounded="md"
                      transition="filter 160ms ease, opacity 160ms ease"
                    >
                      {pattern.image}
                    </Box>
                    <RadioCard.ItemText srOnly>{pattern.name}</RadioCard.ItemText>
                  </RadioCard.ItemControl>
                </RadioCard.Item>
              )
            })}
          </HStack>
        </RadioCard.Root>
      </Box>

      <SwatchColorField
        hiddenSwatches={hiddenPatternFillSwatches}
        label="Pattern color"
        onValueChange={(value) =>
          updateDraft((draft) => {
            const patternColor = getContrastingPatternColor(
              draft.primaryColor,
              accentSwatches,
              value
            )

            return {
              ...draft,
              patternSettings: {
                ...draft.patternSettings,
                fill: patternColor,
                ...(draft.patternSettings.patternId === 'pattern-02'
                  ? { stroke: patternColor }
                  : {}),
              },
            }
          })
        }
        value={resolvedPatternSettings.fill}
      />

      {/* Advanced accordion */}
      <Accordion.Root collapsible variant="enclosed">
        <Accordion.Item value="advanced">
          <Accordion.ItemTrigger>
            <Text fontWeight="600">Advanced</Text>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Stack gap="4" pt="3">
              <Stack gap="4">
                <Button
                  onClick={() =>
                    updateDraft((draft) => ({
                      ...draft,
                      patternSettings: {
                        ...draft.patternSettings,
                        ...getPatternDefaultsForCard(
                          draft.patternSettings.patternId,
                          draft.primaryColor
                        ),
                      },
                    }))
                  }
                  size="sm"
                  variant="outline"
                >
                  Reset pattern
                </Button>
              </Stack>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
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
                          rotation: rotationStops[details.value[0] ?? 0] ?? rotationStops[0],
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
            </Stack>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>

      <HStack gap="3">
        <Button onClick={() => router.push('/editor/accessories')}>Choose holder & lanyard</Button>
      </HStack>
    </Stack>
  )
}
