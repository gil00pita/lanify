'use client'

import { useEffect, useMemo, useState } from 'react'

import { Box, Button, HStack, Image, Input, SegmentGroup, Stack, Text } from '@chakra-ui/react'

type EditorTool = 'background' | 'crop' | 'filter' | 'rotate'
type EditorSource = 'original' | 'transparent'

type ProfileImageEditorModalProps = {
  imageSrc: string
  isOpen: boolean
  onClose: () => void
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
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  saturate: 100,
  zoom: 1,
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
  const { imageSrc, isOpen, onClose, onSave, originalImageSrc, transparentImageSrc } = props
  const [activeTool, setActiveTool] = useState<EditorTool>('background')
  const [brightness, setBrightness] = useState(defaultState.brightness)
  const [contrast, setContrast] = useState(defaultState.contrast)
  const [flipHorizontal, setFlipHorizontal] = useState(defaultState.flipHorizontal)
  const [grayscale, setGrayscale] = useState(defaultState.grayscale)
  const [isSaving, setIsSaving] = useState(false)
  const [offsetX, setOffsetX] = useState(defaultState.offsetX)
  const [offsetY, setOffsetY] = useState(defaultState.offsetY)
  const [rotation, setRotation] = useState(defaultState.rotation)
  const [saturate, setSaturate] = useState(defaultState.saturate)
  const [source, setSource] = useState<EditorSource>('original')
  const [zoom, setZoom] = useState(defaultState.zoom)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setActiveTool('background')
    setBrightness(defaultState.brightness)
    setContrast(defaultState.contrast)
    setFlipHorizontal(defaultState.flipHorizontal)
    setGrayscale(defaultState.grayscale)
    setOffsetX(defaultState.offsetX)
    setOffsetY(defaultState.offsetY)
    setRotation(defaultState.rotation)
    setSaturate(defaultState.saturate)
    setZoom(defaultState.zoom)
    setSource(transparentImageSrc ? 'transparent' : 'original')
  }, [isOpen, transparentImageSrc, imageSrc])

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
              bg="rgba(255,255,255,0.04)"
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
                  Use the transparent cutout when it is available. This keeps the editor aligned
                  with future rembg integration.
                </Text>
                <Button
                  disabled={!transparentImageSrc}
                  onClick={() => setSource('transparent')}
                  rounded="16px"
                >
                  Remove Background
                </Button>
                <Button
                  disabled={!originalImageSrc}
                  onClick={() => setSource('original')}
                  rounded="16px"
                  variant="outline"
                >
                  Use Original
                </Button>
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
              setOffsetX(defaultState.offsetX)
              setOffsetY(defaultState.offsetY)
              setRotation(defaultState.rotation)
              setSaturate(defaultState.saturate)
              setZoom(defaultState.zoom)
            }}
            rounded="16px"
            variant="ghost"
          >
            Reset
          </Button>
          <HStack gap="3">
            <Button onClick={onClose} rounded="16px" variant="outline">
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
              rounded="16px"
            >
              Save Image
            </Button>
          </HStack>
        </HStack>
      </Stack>
    </Box>
  )
}
