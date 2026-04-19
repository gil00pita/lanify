'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import {
  Box,
  Button,
  HStack,
  Image,
  Input,
  NativeSelect,
  SegmentGroup,
  Stack,
  Switch,
  Text,
} from '@chakra-ui/react'

type EditorTool = 'background' | 'crop' | 'filter' | 'rotate'
type EditorSource = 'original' | 'transparent'
type RembgEdgePreset = 'off' | 'sharp' | 'balanced' | 'soft'
type RembgModel = 'birefnet-portrait' | 'u2net_human_seg' | 'u2net'

type ProfileImageEditorModalProps = {
  imageSrc: string
  isOpen: boolean
  onClose: () => void
  onTransparentImageReady: (imageSrc: string) => void
  onSave: (imageSrc: string, source: EditorSource) => void
  originalImageSrc?: string | null
  transparentImageSrc?: string | null
}

const editorTools: Array<{ id: EditorTool; label: string }> = [
  { id: 'background', label: 'Background' },
  { id: 'filter', label: 'Filter' },
  { id: 'crop', label: 'Crop' },
  { id: 'rotate', label: 'Rotate' },
]

const defaultState = {
  brightness: 100,
  contrast: 100,
  flipHorizontal: false,
  grayscale: 0,
  maskCleanup: true,
  offsetX: 0,
  offsetY: 0,
  rembgEdgePreset: 'balanced' as RembgEdgePreset,
  rembgModel: 'birefnet-portrait' as RembgModel,
  rotation: 0,
  saturate: 100,
  zoom: 1,
}

const rembgModelOptions: Array<{ label: string; value: RembgModel }> = [
  { label: 'Portrait Pro', value: 'birefnet-portrait' },
  { label: 'Human Segmentation', value: 'u2net_human_seg' },
  { label: 'General Purpose', value: 'u2net' },
]

const edgePresetOptions: Array<{ label: string; value: RembgEdgePreset }> = [
  { label: 'Off', value: 'off' },
  { label: 'Sharp', value: 'sharp' },
  { label: 'Balanced', value: 'balanced' },
  { label: 'Soft', value: 'soft' },
]

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the processed image.'))
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : null

      if (!result) {
        reject(new Error('Could not read the processed image.'))
        return
      }

      resolve(result)
    }
    reader.readAsDataURL(blob)
  })
}

async function dataUrlToFile(dataUrl: string, filename: string) {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  const extension = blob.type.split('/')[1] ?? 'png'

  return new File([blob], `${filename}.${extension}`, { type: blob.type || 'image/png' })
}

async function removeBackground(
  imageSrc: string,
  options: {
    edgePreset: RembgEdgePreset
    model: RembgModel
    postProcessMask: boolean
  }
) {
  const file = await dataUrlToFile(imageSrc, 'profile-image')
  const formData = new FormData()
  formData.append('image', file)
  formData.append('edgePreset', options.edgePreset)
  formData.append('model', options.model)
  formData.append('postProcessMask', String(options.postProcessMask))

  const response = await fetch('/api/remove-background', {
    body: formData,
    method: 'POST',
  })

  if (!response.ok) {
    let message = 'Background removal failed. Please try again.'

    try {
      const payload = (await response.json()) as { error?: string }
      message = payload.error ?? message
    } catch {
      // Fall back to the default message when the response is not JSON.
    }

    throw new Error(message)
  }

  const blob = await response.blob()

  return blobToDataUrl(blob)
}

async function renderEditedImage(params: {
  brightness: number
  contrast: number
  flipHorizontal: boolean
  grayscale: number
  imageSrc: string
  offsetX: number
  offsetY: number
  rotation: number
  saturate: number
  zoom: number
}) {
  const {
    brightness,
    contrast,
    flipHorizontal,
    grayscale,
    imageSrc,
    offsetX,
    offsetY,
    rotation,
    saturate,
    zoom,
  } = params
  const image = new window.Image()
  image.crossOrigin = 'anonymous'
  image.src = imageSrc
  await image.decode()

  const outputSize = 1024
  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Could not create canvas context')
  }

  const baseScale = Math.max(outputSize / image.naturalWidth, outputSize / image.naturalHeight)
  const renderWidth = image.naturalWidth * baseScale
  const renderHeight = image.naturalHeight * baseScale

  context.clearRect(0, 0, outputSize, outputSize)
  context.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${grayscale}%)`
  context.translate(
    outputSize / 2 + (outputSize * offsetX) / 100,
    outputSize / 2 + (outputSize * offsetY) / 100
  )
  context.rotate((rotation * Math.PI) / 180)
  context.scale(flipHorizontal ? -zoom : zoom, zoom)
  context.drawImage(image, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight)

  return canvas.toDataURL('image/png')
}

export function ProfileImageEditorModal(props: ProfileImageEditorModalProps) {
  const {
    imageSrc,
    isOpen,
    onClose,
    onSave,
    onTransparentImageReady,
    originalImageSrc,
    transparentImageSrc,
  } = props
  const [activeTool, setActiveTool] = useState<EditorTool>('background')
  const [backgroundError, setBackgroundError] = useState<string | null>(null)
  const [backgroundSuccess, setBackgroundSuccess] = useState<string | null>(null)
  const [brightness, setBrightness] = useState(defaultState.brightness)
  const [contrast, setContrast] = useState(defaultState.contrast)
  const [flipHorizontal, setFlipHorizontal] = useState(defaultState.flipHorizontal)
  const [grayscale, setGrayscale] = useState(defaultState.grayscale)
  const [isRemovingBackground, setIsRemovingBackground] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [maskCleanup, setMaskCleanup] = useState(defaultState.maskCleanup)
  const [offsetX, setOffsetX] = useState(defaultState.offsetX)
  const [offsetY, setOffsetY] = useState(defaultState.offsetY)
  const [rembgEdgePreset, setRembgEdgePreset] = useState(defaultState.rembgEdgePreset)
  const [rembgModel, setRembgModel] = useState(defaultState.rembgModel)
  const [rotation, setRotation] = useState(defaultState.rotation)
  const [saturate, setSaturate] = useState(defaultState.saturate)
  const [source, setSource] = useState<EditorSource>('original')
  const [zoom, setZoom] = useState(defaultState.zoom)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false
      return
    }

    if (wasOpenRef.current) {
      return
    }

    wasOpenRef.current = true
    setActiveTool('background')
    setBackgroundError(null)
    setBackgroundSuccess(null)
    setBrightness(defaultState.brightness)
    setContrast(defaultState.contrast)
    setFlipHorizontal(defaultState.flipHorizontal)
    setGrayscale(defaultState.grayscale)
    setMaskCleanup(defaultState.maskCleanup)
    setOffsetX(defaultState.offsetX)
    setOffsetY(defaultState.offsetY)
    setRembgEdgePreset(defaultState.rembgEdgePreset)
    setRembgModel(defaultState.rembgModel)
    setRotation(defaultState.rotation)
    setSaturate(defaultState.saturate)
    setZoom(defaultState.zoom)
    setSource(transparentImageSrc ? 'transparent' : 'original')
  }, [isOpen, transparentImageSrc])

  const currentImageSrc = useMemo(() => {
    if (source === 'transparent' && transparentImageSrc) {
      return transparentImageSrc
    }

    return originalImageSrc ?? imageSrc
  }, [imageSrc, originalImageSrc, source, transparentImageSrc])

  const previewFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${grayscale}%)`
  const previewTransform = `translate(${offsetX}%, ${offsetY}%) rotate(${rotation}deg) scale(${flipHorizontal ? -zoom : zoom}, ${zoom})`

  if (!isOpen) {
    return null
  }

  return (
    <Box
      alignItems="center"
      backdropFilter="blur(10px)"
      // bg="rgba(9,9,11,0.72)"
      display="flex"
      inset="0"
      justifyContent="center"
      p={{ base: '4', md: '8' }}
      position="fixed"
      zIndex="modal"
      right="-220px"
      left="-220px"
    >
      <Stack
        bg="bg"
        border="1px solid rgba(255,255,255,0.12)"
        borderRadius="28px"
        boxShadow="0 30px 90px rgba(0,0,0,0.45)"
        color="fg"
        gap="6"
        maxW="960px"
        onClick={(event) => event.stopPropagation()}
        p={{ base: '5', md: '7' }}
        w="full"
      >
        <HStack justify="space-between">
          <Stack gap="1">
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="600">
              Edit Current Picture
            </Text>
            <Text color="fg.muted" fontSize="sm">
              Tune the portrait before saving it back into your profile.
            </Text>
          </Stack>
        </HStack>

        <HStack align="stretch" flexDirection={{ base: 'column', lg: 'row' }} gap="6">
          <Stack flex="1" gap="4">
            <SegmentGroup.Root
              bg="rgba(255,255,255,0.06)"
              border="1px solid rgba(255,255,255,0.12)"
              borderRadius="20px"
              color="white"
              onValueChange={({ value }) => setActiveTool(value as EditorTool)}
              p="1"
              value={activeTool}
            >
              <SegmentGroup.Indicator borderRadius="16px" />
              <SegmentGroup.Items
                items={editorTools.map((tool) => ({
                  label: tool.label,
                  value: tool.id,
                }))}
              />
            </SegmentGroup.Root>

            <Box
              aspectRatio={1}
              bg="bg.subtle"
              backgroundColor="var(--lanify-colors-bg)"
              backgroundPosition="0 0, 10px 10px"
              backgroundSize="20px 20px"
              bgImage={[
                'repeating-linear-gradient(45deg, var(--lanify-colors-bg-emphasized) 25%, transparent 25%, transparent 75%, var(--lanify-colors-bg-emphasized) 75%, var(--lanify-colors-bg-emphasized))',
                'repeating-linear-gradient(45deg, var(--lanify-colors-bg-emphasized) 25%, var(--lanify-colors-bg) 25%, var(--lanify-colors-bg) 75%, var(--lanify-colors-bg-emphasized) 75%, var(--lanify-colors-bg-emphasized))',
              ].join(', ')}
              border="1px solid rgba(255,255,255,0.12)"
              borderRadius="28px"
              overflow="hidden"
              position="relative"
              w="full"
            >
              <Image
                alt="Current profile picture"
                h="100%"
                inset="0"
                objectFit="cover"
                position="absolute"
                src={currentImageSrc}
                style={{
                  filter: previewFilter,
                  transform: previewTransform,
                  transformOrigin: 'center center',
                }}
                w="100%"
              />
            </Box>
          </Stack>

          <Stack
            bg="rgba(255,255,255,0.05)"
            border="1px solid rgba(255,255,255,0.10)"
            borderRadius="24px"
            flexShrink={0}
            gap="4"
            p="5"
            w={{ base: 'full', lg: '320px' }}
          >
            {activeTool === 'background' ? (
              <Stack gap="4">
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  letterSpacing="0.12em"
                  textTransform="uppercase"
                >
                  Background
                </Text>
                <Text color="fg.muted" fontSize="sm">
                  Tune the background removal options.
                </Text>
                <Stack gap="3">
                  <Stack gap="2" display={'none'}>
                    <Text fontSize="sm" fontWeight="600">
                      Model
                    </Text>
                    <NativeSelect.Root size="sm" variant="subtle">
                      <NativeSelect.Field
                        value={rembgModel}
                        onChange={(event) => setRembgModel(event.currentTarget.value as RembgModel)}
                      >
                        {rembgModelOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Stack>

                  <Stack gap="2">
                    <Text fontSize="sm" fontWeight="600">
                      Edge Refinement
                    </Text>
                    <SegmentGroup.Root
                      size="sm"
                      value={rembgEdgePreset}
                      onValueChange={({ value }) => setRembgEdgePreset(value as RembgEdgePreset)}
                    >
                      <SegmentGroup.Indicator />
                      <SegmentGroup.Items
                        items={edgePresetOptions.map((option) => ({
                          label: option.label,
                          value: option.value,
                        }))}
                      />
                    </SegmentGroup.Root>
                    <Text color="fg.muted" fontSize="xs">
                      `Sharp` keeps harder edges. `Soft` uses stronger alpha matting for hair and
                      natural portraits.
                    </Text>
                  </Stack>

                  <Switch.Root
                    checked={maskCleanup}
                    colorPalette="primary"
                    onCheckedChange={(event) => setMaskCleanup(event.checked)}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label>Mask cleanup</Switch.Label>
                  </Switch.Root>
                </Stack>
                <Button
                  disabled={!originalImageSrc || isRemovingBackground}
                  loading={isRemovingBackground}
                  onClick={async () => {
                    if (!originalImageSrc) {
                      setBackgroundError('Upload an image first before removing the background.')
                      setBackgroundSuccess(null)
                      return
                    }

                    setIsRemovingBackground(true)
                    setBackgroundError(null)
                    setBackgroundSuccess(null)

                    try {
                      const transparentImage = await removeBackground(originalImageSrc, {
                        edgePreset: rembgEdgePreset,
                        model: rembgModel,
                        postProcessMask: maskCleanup,
                      })
                      onTransparentImageReady(transparentImage)
                      setSource('transparent')
                      setBackgroundSuccess(
                        'Background removed. You can keep editing before saving.'
                      )
                    } catch (error) {
                      const message =
                        error instanceof Error
                          ? error.message
                          : 'Background removal failed. Please try again.'
                      setBackgroundError(message)
                    } finally {
                      setIsRemovingBackground(false)
                    }
                  }}
                >
                  Remove Background
                </Button>
                <Button
                  disabled={!transparentImageSrc}
                  onClick={() => setSource('transparent')}
                  variant={source === 'transparent' ? 'solid' : 'outline'}
                >
                  Use Transparent
                </Button>
                <Button
                  disabled={!originalImageSrc}
                  onClick={() => setSource('original')}
                  variant={source === 'original' ? 'solid' : 'outline'}
                >
                  Use Original
                </Button>
                {backgroundSuccess ? (
                  <Text color="green.300" fontSize="sm">
                    {backgroundSuccess}
                  </Text>
                ) : null}
                {backgroundError ? (
                  <Text color="red.300" fontSize="sm">
                    {backgroundError}
                  </Text>
                ) : null}
                {!transparentImageSrc ? (
                  <Text color="fg.muted" fontSize="sm">
                    No transparent version exists yet.
                  </Text>
                ) : null}
              </Stack>
            ) : null}

            {activeTool === 'filter' ? (
              <Stack gap="4">
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  letterSpacing="0.12em"
                  textTransform="uppercase"
                >
                  Filter
                </Text>
                <Stack gap="3">
                  <Text fontSize="sm">Brightness</Text>
                  <Input
                    max="160"
                    min="60"
                    onChange={(event) => setBrightness(Number(event.target.value))}
                    type="range"
                    value={brightness}
                  />
                  <Text fontSize="sm">Contrast</Text>
                  <Input
                    max="160"
                    min="60"
                    onChange={(event) => setContrast(Number(event.target.value))}
                    type="range"
                    value={contrast}
                  />
                  <Text fontSize="sm">Saturation</Text>
                  <Input
                    max="180"
                    min="0"
                    onChange={(event) => setSaturate(Number(event.target.value))}
                    type="range"
                    value={saturate}
                  />
                  <Text fontSize="sm">Grayscale</Text>
                  <Input
                    max="100"
                    min="0"
                    onChange={(event) => setGrayscale(Number(event.target.value))}
                    type="range"
                    value={grayscale}
                  />
                </Stack>
              </Stack>
            ) : null}

            {activeTool === 'crop' ? (
              <Stack gap="4">
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  letterSpacing="0.12em"
                  textTransform="uppercase"
                >
                  Crop
                </Text>
                <Stack gap="3">
                  <Text fontSize="sm">Zoom</Text>
                  <Input
                    max="2.4"
                    min="1"
                    onChange={(event) => setZoom(Number(event.target.value))}
                    step="0.01"
                    type="range"
                    value={zoom}
                  />
                  <Text fontSize="sm">Horizontal</Text>
                  <Input
                    max="35"
                    min="-35"
                    onChange={(event) => setOffsetX(Number(event.target.value))}
                    type="range"
                    value={offsetX}
                  />
                  <Text fontSize="sm">Vertical</Text>
                  <Input
                    max="35"
                    min="-35"
                    onChange={(event) => setOffsetY(Number(event.target.value))}
                    type="range"
                    value={offsetY}
                  />
                </Stack>
              </Stack>
            ) : null}

            {activeTool === 'rotate' ? (
              <Stack gap="4">
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  letterSpacing="0.12em"
                  textTransform="uppercase"
                >
                  Rotate
                </Text>
                <HStack gap="3">
                  <Button
                    onClick={() => setRotation((current) => current - 90)}
                    rounded="16px"
                    variant="outline"
                  >
                    Rotate Left
                  </Button>
                  <Button
                    onClick={() => setRotation((current) => current + 90)}
                    rounded="16px"
                    variant="outline"
                  >
                    Rotate Right
                  </Button>
                </HStack>
                <Button
                  onClick={() => setFlipHorizontal((current) => !current)}
                  rounded="16px"
                  variant={flipHorizontal ? 'solid' : 'outline'}
                >
                  Flip Horizontally
                </Button>
                <Stack gap="3">
                  <Text fontSize="sm">Fine rotation</Text>
                  <Input
                    max="45"
                    min="-45"
                    onChange={(event) => setRotation(Number(event.target.value))}
                    type="range"
                    value={rotation}
                  />
                </Stack>
              </Stack>
            ) : null}
          </Stack>
        </HStack>

        <HStack justify="space-between">
          <Button
            onClick={() => {
              setBrightness(defaultState.brightness)
              setContrast(defaultState.contrast)
              setFlipHorizontal(defaultState.flipHorizontal)
              setGrayscale(defaultState.grayscale)
              setMaskCleanup(defaultState.maskCleanup)
              setOffsetX(defaultState.offsetX)
              setOffsetY(defaultState.offsetY)
              setRembgEdgePreset(defaultState.rembgEdgePreset)
              setRembgModel(defaultState.rembgModel)
              setRotation(defaultState.rotation)
              setSaturate(defaultState.saturate)
              setZoom(defaultState.zoom)
            }}
            variant="ghost"
          >
            Reset
          </Button>
          <HStack gap="3">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              loading={isSaving}
              onClick={async () => {
                setIsSaving(true)
                try {
                  const editedImage = await renderEditedImage({
                    brightness,
                    contrast,
                    flipHorizontal,
                    grayscale,
                    imageSrc: currentImageSrc,
                    offsetX,
                    offsetY,
                    rotation,
                    saturate,
                    zoom,
                  })
                  onSave(editedImage, source)
                  onClose()
                } finally {
                  setIsSaving(false)
                }
              }}
            >
              Save Image
            </Button>
          </HStack>
        </HStack>
      </Stack>
    </Box>
  )
}
