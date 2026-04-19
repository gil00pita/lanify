'use client'

import { CSSProperties, forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  HStack,
  Input,
  NativeSelect,
  SegmentGroup,
  Stack,
  Switch,
  Text,
} from '@chakra-ui/react'
import {
  Cropper,
  CropperImage,
  CropperRef,
  CropperState,
  CropperTransitions,
  ImageRestriction,
  RectangleStencil,
  getBackgroundStyle,
  mergeRefs,
} from 'react-advanced-cropper'

type EditorTool = 'background' | 'crop' | 'filter' | 'rotate'
type RembgEdgePreset = 'off' | 'sharp' | 'balanced' | 'soft'
type RembgModel = 'birefnet-portrait' | 'u2net_human_seg' | 'u2net'

type ProfileImageEditorModalProps = {
  imageSrc: string
  isOpen: boolean
  onClose: () => void
  onSave: (imageSrc: string) => void
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
  rembgEdgePreset: 'balanced' as RembgEdgePreset,
  rembgModel: 'birefnet-portrait' as RembgModel,
  rotation: 0,
  saturate: 100,
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

type AdjustmentProps = {
  brightness?: number
  contrast?: number
  grayscale?: number
  saturate?: number
}

type AdjustableImageProps = AdjustmentProps & {
  className?: string
  crossOrigin?: 'anonymous' | 'use-credentials' | boolean
  src?: string
  style?: CSSProperties
}

const AdjustableImage = forwardRef<HTMLCanvasElement, AdjustableImageProps>(function AdjustableImage(
  props,
  ref
) {
  const {
    brightness = 100,
    className,
    contrast = 100,
    crossOrigin,
    grayscale = 0,
    saturate = 100,
    src,
    style,
  } = props
  const imageRef = useRef<HTMLImageElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  function drawImage() {
    const image = imageRef.current
    const canvas = canvasRef.current

    if (!canvas || !image || !image.complete) {
      return
    }

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${grayscale}%)`
    context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight)
  }

  useLayoutEffect(() => {
    drawImage()
  }, [brightness, contrast, grayscale, saturate, src])

  return (
    <>
      <canvas
        className={className}
        key={`${src ?? 'empty'}-canvas`}
        ref={mergeRefs([ref, canvasRef])}
        style={style}
      />
      {src ? (
        <img
          alt=""
          className="lanify-adjustable-image-source"
          crossOrigin={crossOrigin === true ? 'anonymous' : crossOrigin || undefined}
          key={`${src}-image`}
          onLoad={drawImage}
          ref={imageRef}
          src={src}
        />
      ) : null}
    </>
  )
})

type AdjustableCropperBackgroundProps = AdjustmentProps & {
  className?: string
  cropper: {
    getImage: () => CropperImage | null
    getState: () => CropperState | null
    getTransitions: () => CropperTransitions | null
  }
  crossOrigin?: 'anonymous' | 'use-credentials' | boolean
}

const AdjustableCropperBackground = forwardRef<HTMLCanvasElement, AdjustableCropperBackgroundProps>(
  function AdjustableCropperBackground(props, ref) {
    const {
      brightness = 100,
      className,
      contrast = 100,
      cropper,
      crossOrigin,
      grayscale = 0,
      saturate = 100,
    } = props
    const image = cropper.getImage()
    const state = cropper.getState()
    const transitions = cropper.getTransitions()
    const style = image && state ? getBackgroundStyle(image, state, transitions) : {}

    return (
      <AdjustableImage
        brightness={brightness}
        className={className}
        contrast={contrast}
        crossOrigin={crossOrigin}
        grayscale={grayscale}
        ref={ref}
        saturate={saturate}
        src={image?.src}
        style={style}
      />
    )
  }
)

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

export function ProfileImageEditorModal(props: ProfileImageEditorModalProps) {
  const { imageSrc, isOpen, onClose, onSave, originalImageSrc, transparentImageSrc } = props
  const [activeTool, setActiveTool] = useState<EditorTool>('background')
  const [backgroundError, setBackgroundError] = useState<string | null>(null)
  const [brightness, setBrightness] = useState(defaultState.brightness)
  const [contrast, setContrast] = useState(defaultState.contrast)
  const [flipHorizontal, setFlipHorizontal] = useState(defaultState.flipHorizontal)
  const [grayscale, setGrayscale] = useState(defaultState.grayscale)
  const [isRemovingBackground, setIsRemovingBackground] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [maskCleanup, setMaskCleanup] = useState(defaultState.maskCleanup)
  const [rembgEdgePreset, setRembgEdgePreset] = useState(defaultState.rembgEdgePreset)
  const [rembgModel, setRembgModel] = useState(defaultState.rembgModel)
  const [rotation, setRotation] = useState(defaultState.rotation)
  const [saturate, setSaturate] = useState(defaultState.saturate)
  const [processedTransparentSrc, setProcessedTransparentSrc] = useState<string | null>(
    transparentImageSrc ?? null
  )
  const wasOpenRef = useRef(false)
  const removeBackgroundRequestIdRef = useRef(0)
  const cropperRef = useRef<CropperRef>(null)
  const processingSourceImage = originalImageSrc ?? imageSrc

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
    setBrightness(defaultState.brightness)
    setContrast(defaultState.contrast)
    setFlipHorizontal(defaultState.flipHorizontal)
    setGrayscale(defaultState.grayscale)
    setMaskCleanup(defaultState.maskCleanup)
    setRembgEdgePreset(defaultState.rembgEdgePreset)
    setRembgModel(defaultState.rembgModel)
    setRotation(defaultState.rotation)
    setSaturate(defaultState.saturate)
    setProcessedTransparentSrc(transparentImageSrc ?? null)
  }, [isOpen, transparentImageSrc])

  useEffect(() => {
    if (!isOpen || !processingSourceImage) {
      return
    }

    const requestId = removeBackgroundRequestIdRef.current + 1
    removeBackgroundRequestIdRef.current = requestId
    setIsRemovingBackground(true)
    setBackgroundError(null)

    void removeBackground(processingSourceImage, {
      edgePreset: rembgEdgePreset,
      model: rembgModel,
      postProcessMask: maskCleanup,
    })
      .then((transparentImage) => {
        if (removeBackgroundRequestIdRef.current !== requestId) {
          return
        }

        setProcessedTransparentSrc(transparentImage)
      })
      .catch((error: unknown) => {
        if (removeBackgroundRequestIdRef.current !== requestId) {
          return
        }

        const message =
          error instanceof Error
            ? error.message
            : 'Background removal failed. Please try again.'
        setBackgroundError(message)
      })
      .finally(() => {
        if (removeBackgroundRequestIdRef.current !== requestId) {
          return
        }

        setIsRemovingBackground(false)
      })
  }, [isOpen, maskCleanup, processingSourceImage, rembgEdgePreset, rembgModel])

  const transparentPreviewSrc = processedTransparentSrc ?? transparentImageSrc
  const currentImageSrc = transparentPreviewSrc ?? processingSourceImage
  const cropperEnabled = activeTool === 'crop'

  function applyRotation(nextRotation: number) {
    cropperRef.current?.rotateImage(nextRotation, {
      immediately: true,
      normalize: true,
      transitions: false,
    })
    setRotation(nextRotation)
  }

  function zoomImage(factor: number) {
    cropperRef.current?.zoomImage(factor, {
      immediately: true,
      normalize: true,
      transitions: false,
    })
  }

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
              <Cropper
                backgroundComponent={AdjustableCropperBackground}
                backgroundProps={{
                  brightness,
                  contrast,
                  grayscale,
                  saturate,
                }}
                backgroundWrapperProps={{
                  moveImage: cropperEnabled,
                  scaleImage: cropperEnabled,
                }}
                ref={cropperRef}
                className="lanify-profile-cropper"
                imageRestriction={ImageRestriction.stencil}
                src={currentImageSrc}
                stencilComponent={RectangleStencil}
                stencilProps={{
                  aspectRatio: 1,
                  handlers: cropperEnabled,
                  lines: cropperEnabled,
                  movable: cropperEnabled,
                  overlayClassName: 'lanify-profile-cropper-overlay',
                  resizable: cropperEnabled,
                }}
                transitions={false}
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
                      `Off` keeps the model's raw mask. `Sharp` cuts tighter edges. `Soft` keeps
                      more feathering around hair and natural contours.
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
                <Text color="fg.muted" fontSize="sm">
                  Background removal runs automatically when the editor opens and whenever these
                  settings change.
                </Text>
                {isRemovingBackground ? (
                  <Alert.Root status="info">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>Updating cutout...</Alert.Title>
                      <Alert.Description>
                        Re-processing the original image with your latest settings.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                ) : null}
                {backgroundError ? (
                  <Alert.Root status={'error'}>
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>Error!</Alert.Title>
                      <Alert.Description>{backgroundError}</Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                ) : null}
                {!transparentPreviewSrc && !isRemovingBackground ? (
                  <Text color="fg.muted" fontSize="sm">
                    Upload an image first to generate the cutout.
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
                  <Text color="fg.muted" fontSize="sm">
                    Drag the image to reposition it and pull the frame handles to crop and resize.
                  </Text>
                  <HStack gap="3">
                    <Button onClick={() => zoomImage(0.9)} rounded="16px" variant="outline">
                      Zoom Out
                    </Button>
                    <Button onClick={() => zoomImage(1.1)} rounded="16px" variant="outline">
                      Zoom In
                    </Button>
                  </HStack>
                  <Button
                    onClick={() => cropperRef.current?.reset()}
                    rounded="16px"
                    variant="outline"
                  >
                    Reset Framing
                  </Button>
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
                    onClick={() => applyRotation(rotation - 90)}
                    rounded="16px"
                    variant="outline"
                  >
                    Rotate Left
                  </Button>
                  <Button
                    onClick={() => applyRotation(rotation + 90)}
                    rounded="16px"
                    variant="outline"
                  >
                    Rotate Right
                  </Button>
                </HStack>
                <Button
                  onClick={() => {
                    cropperRef.current?.flipImage(true, false, {
                      immediately: true,
                      normalize: true,
                      transitions: false,
                    })
                    setFlipHorizontal((current) => !current)
                  }}
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
                    onChange={(event) => applyRotation(Number(event.target.value))}
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
              setRembgEdgePreset(defaultState.rembgEdgePreset)
              setRembgModel(defaultState.rembgModel)
              applyRotation(defaultState.rotation)
              if (flipHorizontal) {
                cropperRef.current?.flipImage(true, false, {
                  immediately: true,
                  normalize: true,
                  transitions: false,
                })
              }
              setSaturate(defaultState.saturate)
              cropperRef.current?.reset()
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
              disabled={!transparentPreviewSrc || isRemovingBackground}
              loading={isSaving}
              onClick={async () => {
                if (!transparentPreviewSrc) {
                  return
                }

                setIsSaving(true)
                try {
                  const croppedCanvas = cropperRef.current?.getCanvas({
                    height: 1024,
                    imageSmoothingQuality: 'high',
                    width: 1024,
                  })

                  if (!croppedCanvas) {
                    throw new Error('Could not prepare the cropped image.')
                  }
                  onSave(croppedCanvas.toDataURL('image/png'))
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
