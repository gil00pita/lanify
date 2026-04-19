'use client'

import { useEffect, useRef, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  HStack,
  Input,
  NativeSelect,
  SegmentGroup,
  Spinner,
  Stack,
  Switch,
  Text,
} from '@chakra-ui/react'
import {
  CropperRef,
  CropperState,
  ImageRestriction,
  RectangleStencil,
} from 'react-advanced-cropper'

import { ImageEditorCanvas } from '@/components/app/ImageEditor'
import {
  Navigation,
  type EditorMode as ImageNavigationMode,
} from '@/components/app/ImageEditor/Navigation'

type EditorTool = 'crop' | 'color' | 'edge'
type RembgEdgePreset = 'off' | 'sharp' | 'balanced' | 'soft'
type RembgModel = 'birefnet-portrait' | 'u2net_human_seg' | 'u2net'

type EditorState = {
  brightness: number
  contrast: number
  flipHorizontal: boolean
  grayscale: number
  maskCleanup: boolean
  outlineEnabled: boolean
  rembgEdgePreset: RembgEdgePreset
  rembgModel: RembgModel
  rotation: number
  saturate: number
}

type HistoryEntry = {
  cropperState: CropperState | null
  editorState: EditorState
}

type ProfileImageEditorModalProps = {
  imageSrc: string
  isOpen: boolean
  onClose: () => void
  onSave: (imageSrc: string) => void
  originalImageSrc?: string | null
  transparentImageSrc?: string | null
}

const defaultState: EditorState = {
  brightness: 100,
  contrast: 100,
  flipHorizontal: false,
  grayscale: 0,
  maskCleanup: false,
  outlineEnabled: false,
  rembgEdgePreset: 'off',
  rembgModel: 'u2net_human_seg',
  rotation: 0,
  saturate: 100,
}

const HISTORY_LIMIT = 60
const OUTLINE_COLOR = '#ffffff'
const OUTLINE_WIDTH = 10

const rembgModelOptions: Array<{ label: string; value: RembgModel }> = [
  { label: 'Human Segmentation', value: 'u2net_human_seg' },
  { label: 'Portrait Pro', value: 'birefnet-portrait' },
  { label: 'General Purpose', value: 'u2net' },
]

const edgePresetOptions: Array<{ label: string; value: RembgEdgePreset }> = [
  { label: 'Off', value: 'off' },
  { label: 'Sharp', value: 'sharp' },
  { label: 'Balanced', value: 'balanced' },
  { label: 'Soft', value: 'soft' },
]

const colorControls: Array<{
  helper: string
  label: string
  max: number
  min: number
  stateKey: 'brightness' | 'contrast' | 'saturate' | 'grayscale'
  step?: number
}> = [
  {
    helper: 'Lift or darken the portrait without changing the framing.',
    label: 'Brightness',
    max: 160,
    min: 60,
    stateKey: 'brightness',
  },
  {
    helper: 'Increase separation between light and dark areas.',
    label: 'Contrast',
    max: 160,
    min: 60,
    stateKey: 'contrast',
  },
  {
    helper: 'Push color intensity up or pull it back.',
    label: 'Saturation',
    max: 180,
    min: 0,
    stateKey: 'saturate',
  },
  {
    helper: 'Fade the portrait toward monochrome.',
    label: 'Grayscale',
    max: 100,
    min: 0,
    stateKey: 'grayscale',
  },
]

function colorControlToNavigationMode(
  value: 'brightness' | 'contrast' | 'saturate' | 'grayscale'
): ImageNavigationMode {
  if (value === 'saturate') {
    return 'saturation'
  }

  return value
}

function navigationModeToColorControl(
  value: ImageNavigationMode
): 'brightness' | 'contrast' | 'saturate' | 'grayscale' {
  if (value === 'saturation') {
    return 'saturate'
  }

  if (value === 'brightness' || value === 'contrast' || value === 'grayscale') {
    return value
  }

  return 'brightness'
}

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
    signal: AbortSignal
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
    signal: options.signal,
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

function createOutlinedCanvas(
  sourceCanvas: HTMLCanvasElement,
  options: {
    strokeColor: string
    strokeWidth: number
  }
) {
  const { strokeColor, strokeWidth } = options
  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = sourceCanvas.width
  outputCanvas.height = sourceCanvas.height

  const outputContext = outputCanvas.getContext('2d')

  if (!outputContext) {
    return sourceCanvas
  }

  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = sourceCanvas.width
  maskCanvas.height = sourceCanvas.height

  const maskContext = maskCanvas.getContext('2d')

  if (!maskContext) {
    return sourceCanvas
  }

  maskContext.drawImage(sourceCanvas, 0, 0)
  maskContext.globalCompositeOperation = 'source-in'
  maskContext.fillStyle = strokeColor
  maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height)
  maskContext.globalCompositeOperation = 'source-over'

  for (let offsetX = -strokeWidth; offsetX <= strokeWidth; offsetX += 1) {
    for (let offsetY = -strokeWidth; offsetY <= strokeWidth; offsetY += 1) {
      if (offsetX === 0 && offsetY === 0) {
        continue
      }

      if (Math.hypot(offsetX, offsetY) > strokeWidth) {
        continue
      }

      outputContext.drawImage(maskCanvas, offsetX, offsetY)
    }
  }

  outputContext.drawImage(sourceCanvas, 0, 0)

  return outputCanvas
}

function cloneEditorState(state: EditorState): EditorState {
  return { ...state }
}

function cloneCropperState(state: CropperState | null): CropperState | null {
  return state ? structuredClone(state) : null
}

function createHistorySignature(entry: HistoryEntry) {
  return JSON.stringify(entry)
}

export function ProfileImageEditorModal(props: ProfileImageEditorModalProps) {
  const { imageSrc, isOpen, onClose, onSave, originalImageSrc, transparentImageSrc } = props
  const [activeTool, setActiveTool] = useState<EditorTool>('crop')
  const [activeColorControl, setActiveColorControl] = useState<
    'brightness' | 'contrast' | 'saturate' | 'grayscale'
  >('brightness')
  const [backgroundError, setBackgroundError] = useState<string | null>(null)
  const [editorState, setEditorState] = useState<EditorState>(cloneEditorState(defaultState))
  const [historyState, setHistoryState] = useState<{ entries: HistoryEntry[]; index: number }>({
    entries: [],
    index: -1,
  })
  const [isRemovingBackground, setIsRemovingBackground] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [processedTransparentSrc, setProcessedTransparentSrc] = useState<string | null>(
    transparentImageSrc ?? null
  )
  const wasOpenRef = useRef(false)
  const removeBackgroundRequestIdRef = useRef(0)
  const historyCommitTimeoutRef = useRef<number | null>(null)
  const isRestoringHistoryRef = useRef(false)
  const editorStateRef = useRef(editorState)
  const sessionSourceRef = useRef<string | null>(null)
  const cropperRef = useRef<CropperRef>(null)
  const processingSourceImage = originalImageSrc ?? imageSrc
  const canUndo = historyState.index > 0
  const canRedo = historyState.index >= 0 && historyState.index < historyState.entries.length - 1
  const brightness = editorState.brightness
  const contrast = editorState.contrast
  const flipHorizontal = editorState.flipHorizontal
  const grayscale = editorState.grayscale
  const maskCleanup = editorState.maskCleanup
  const outlineEnabled = editorState.outlineEnabled
  const rembgEdgePreset = editorState.rembgEdgePreset
  const rembgModel = editorState.rembgModel
  const rotation = editorState.rotation
  const saturate = editorState.saturate
  const hasManualBackgroundSettings =
    maskCleanup !== defaultState.maskCleanup ||
    rembgEdgePreset !== defaultState.rembgEdgePreset ||
    rembgModel !== defaultState.rembgModel

  function clearHistoryCommitTimer() {
    if (historyCommitTimeoutRef.current !== null) {
      window.clearTimeout(historyCommitTimeoutRef.current)
      historyCommitTimeoutRef.current = null
    }
  }

  function commitHistoryEntry(entry: HistoryEntry) {
    if (isRestoringHistoryRef.current) {
      return
    }

    setHistoryState((current) => {
      const nextEntries = current.entries.slice(0, current.index + 1)
      const previousEntry = nextEntries.at(-1)

      if (
        previousEntry &&
        createHistorySignature(previousEntry) === createHistorySignature(entry)
      ) {
        return current
      }

      nextEntries.push(entry)

      if (nextEntries.length > HISTORY_LIMIT) {
        nextEntries.shift()
      }

      return {
        entries: nextEntries,
        index: nextEntries.length - 1,
      }
    })
  }

  function scheduleHistoryCommit(nextEditorState?: EditorState) {
    if (isRestoringHistoryRef.current) {
      return
    }

    clearHistoryCommitTimer()
    historyCommitTimeoutRef.current = window.setTimeout(() => {
      historyCommitTimeoutRef.current = null
      commitHistoryEntry({
        cropperState: cloneCropperState(cropperRef.current?.getState() ?? null),
        editorState: cloneEditorState(nextEditorState ?? editorStateRef.current),
      })
    }, 180)
  }

  function updateEditorState(updater: EditorState | ((current: EditorState) => EditorState)) {
    setEditorState((current) => {
      const nextState =
        typeof updater === 'function'
          ? (updater as (current: EditorState) => EditorState)(current)
          : updater

      scheduleHistoryCommit(nextState)
      return nextState
    })
  }

  function restoreHistoryEntry(entry: HistoryEntry) {
    isRestoringHistoryRef.current = true
    clearHistoryCommitTimer()
    setBackgroundError(null)
    setEditorState(cloneEditorState(entry.editorState))

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (entry.cropperState) {
          cropperRef.current?.setState(cloneCropperState(entry.cropperState), {
            immediately: true,
            transitions: false,
          })
        } else {
          cropperRef.current?.reset()
        }

        isRestoringHistoryRef.current = false
      })
    })
  }

  function applyRotation(nextRotation: number) {
    cropperRef.current?.rotateImage(nextRotation, {
      immediately: true,
      normalize: true,
      transitions: false,
    })
    updateEditorState((current) => ({
      ...current,
      rotation: nextRotation,
    }))
  }

  function zoomImage(factor: number) {
    cropperRef.current?.zoomImage(factor, {
      immediately: true,
      normalize: true,
      transitions: false,
    })
    scheduleHistoryCommit()
  }

  function handleUndo() {
    if (!canUndo) {
      return
    }

    const nextIndex = historyState.index - 1
    const nextEntry = historyState.entries[nextIndex]

    if (!nextEntry) {
      return
    }

    setHistoryState((current) => ({
      ...current,
      index: nextIndex,
    }))
    restoreHistoryEntry(nextEntry)
  }

  function handleRedo() {
    if (!canRedo) {
      return
    }

    const nextIndex = historyState.index + 1
    const nextEntry = historyState.entries[nextIndex]

    if (!nextEntry) {
      return
    }

    setHistoryState((current) => ({
      ...current,
      index: nextIndex,
    }))
    restoreHistoryEntry(nextEntry)
  }

  useEffect(() => {
    editorStateRef.current = editorState
  }, [editorState])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      const isModifierPressed = event.metaKey || event.ctrlKey

      if (!isModifierPressed || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== 'z') {
        return
      }

      event.preventDefault()

      if (event.shiftKey) {
        handleRedo()
      } else {
        handleUndo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [canRedo, canUndo, historyState.entries, historyState.index, isOpen])

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false
      removeBackgroundRequestIdRef.current += 1
      clearHistoryCommitTimer()
      setIsRemovingBackground(false)
      return
    }

    if (wasOpenRef.current) {
      return
    }

    const currentSessionSource = processingSourceImage

    const initialState = cloneEditorState(defaultState)
    const shouldResetSession =
      historyState.entries.length === 0 || sessionSourceRef.current !== currentSessionSource

    wasOpenRef.current = true
    setBackgroundError(null)
    sessionSourceRef.current = currentSessionSource

    if (!shouldResetSession) {
      return
    }

    setActiveTool('crop')
    setActiveColorControl('brightness')
    setEditorState(initialState)
    setProcessedTransparentSrc(transparentImageSrc ?? null)
    setHistoryState({
      entries: [
        {
          cropperState: null,
          editorState: initialState,
        },
      ],
      index: 0,
    })

    window.requestAnimationFrame(() => {
      scheduleHistoryCommit(initialState)
    })
  }, [historyState.entries.length, isOpen, processingSourceImage, transparentImageSrc])

  useEffect(() => {
    if (!isOpen || !processingSourceImage) {
      setIsRemovingBackground(false)
      return
    }

    if (transparentImageSrc && !hasManualBackgroundSettings) {
      setProcessedTransparentSrc(transparentImageSrc)
      setIsRemovingBackground(false)
      setBackgroundError(null)
      return
    }

    const abortController = new AbortController()
    const requestId = removeBackgroundRequestIdRef.current + 1
    removeBackgroundRequestIdRef.current = requestId
    setIsRemovingBackground(true)
    setBackgroundError(null)

    void removeBackground(processingSourceImage, {
      edgePreset: rembgEdgePreset,
      model: rembgModel,
      postProcessMask: maskCleanup,
      signal: abortController.signal,
    })
      .then((transparentImage) => {
        if (removeBackgroundRequestIdRef.current !== requestId) {
          return
        }

        setProcessedTransparentSrc(transparentImage)
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return
        }

        if (removeBackgroundRequestIdRef.current !== requestId) {
          return
        }

        const message =
          error instanceof Error ? error.message : 'Background removal failed. Please try again.'
        setBackgroundError(message)
      })
      .finally(() => {
        if (abortController.signal.aborted) {
          return
        }

        if (removeBackgroundRequestIdRef.current !== requestId) {
          return
        }

        setIsRemovingBackground(false)
      })

    return () => {
      abortController.abort()
    }
  }, [
    hasManualBackgroundSettings,
    isOpen,
    maskCleanup,
    processingSourceImage,
    rembgEdgePreset,
    rembgModel,
    transparentImageSrc,
  ])

  useEffect(() => () => clearHistoryCommitTimer(), [])

  const transparentPreviewSrc = processedTransparentSrc ?? transparentImageSrc
  const currentImageSrc = transparentPreviewSrc ?? processingSourceImage
  const cropperEnabled = activeTool === 'crop'
  const isColorTool = activeTool === 'color'
  const navigationMode =
    activeTool === 'crop'
      ? 'crop'
      : activeTool === 'color'
        ? colorControlToNavigationMode(activeColorControl)
        : undefined
  const currentColorControl =
    colorControls.find((control) => control.stateKey === activeColorControl) ?? colorControls[0]

  if (!isOpen) {
    return null
  }

  return (
    <Box
      alignItems="center"
      backdropFilter="blur(10px)"
      display="flex"
      inset="0"
      justifyContent="center"
      p={{ base: '4', md: '8' }}
      position="fixed"
      zIndex="modal"
    >
      <Stack
        bg="bg"
        border="1px solid rgba(255,255,255,0.12)"
        borderRadius="28px"
        boxShadow="0 30px 90px rgba(0,0,0,0.45)"
        color="fg"
        gap="6"
        maxW="1200px"
        onClick={(event) => event.stopPropagation()}
        p={{ base: '5', md: '7' }}
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
          <HStack gap="2">
            <Button
              aria-label="Undo last edit"
              disabled={!canUndo}
              onClick={handleUndo}
              rounded="full"
              size="sm"
              variant="ghost"
            >
              Undo
            </Button>
            <Button
              aria-label="Redo last undone edit"
              disabled={!canRedo}
              onClick={handleRedo}
              rounded="full"
              size="sm"
              variant="ghost"
            >
              Redo
            </Button>
          </HStack>
        </HStack>

        <Stack gap="4">
          <ImageEditorCanvas
            adjustments={{
              brightness: (brightness - 100) / 100,
              contrast: (contrast - 100) / 100,
              grayscale,
              hue: 0,
              outlineColor: outlineEnabled ? OUTLINE_COLOR : undefined,
              outlineWidth: outlineEnabled ? OUTLINE_WIDTH : 0,
              saturation: (saturate - 100) / 100,
            }}
            containerProps={{
              aspectRatio: 1,
              backgroundColor: 'var(--lanify-colors-bg)',
              backgroundPosition: '0 0, 10px 10px',
              backgroundSize: '20px 20px',
              bgImage: [
                'repeating-linear-gradient(45deg, var(--lanify-colors-bg-emphasized) 25%, transparent 25%, transparent 75%, var(--lanify-colors-bg-emphasized) 75%, var(--lanify-colors-bg-emphasized))',
                'repeating-linear-gradient(45deg, var(--lanify-colors-bg-emphasized) 25%, var(--lanify-colors-bg) 25%, var(--lanify-colors-bg) 75%, var(--lanify-colors-bg-emphasized) 75%, var(--lanify-colors-bg-emphasized))',
              ].join(', '),
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              flexShrink: 0,
              maxW: '540px',
              mx: 'auto',
              overflow: 'hidden',
              w: { base: 'min(100%, 420px)', md: '540px' },
            }}
            cropperEnabled={cropperEnabled}
            cropperProps={{
              className: 'lanify-profile-cropper',
              imageRestriction: ImageRestriction.none,
              onChange: () => scheduleHistoryCommit(),
              stencilComponent: RectangleStencil,
              stencilProps: {
                aspectRatio: 1,
                overlayClassName: 'lanify-profile-cropper-overlay',
              },
              transitions: false,
            }}
            cropperRef={cropperRef}
            onReset={() => {
              clearHistoryCommitTimer()
              setBackgroundError(null)
              setEditorState(cloneEditorState(defaultState))
              setActiveColorControl('brightness')
              cropperRef.current?.reset()
              setHistoryState({
                entries: [
                  {
                    cropperState: null,
                    editorState: cloneEditorState(defaultState),
                  },
                ],
                index: 0,
              })

              window.requestAnimationFrame(() => {
                scheduleHistoryCommit(cloneEditorState(defaultState))
              })
            }}
            resetButtonVisible
            showPreview={false}
            src={currentImageSrc}
          >
            {isRemovingBackground ? (
              <Box
                alignItems="center"
                backdropFilter="blur(2px)"
                bg="rgba(17,16,13,0.36)"
                display="flex"
                inset="0"
                justifyContent="center"
                pointerEvents="none"
                position="absolute"
                zIndex="1"
              >
                <Stack align="center" gap="3">
                  <Spinner borderWidth="3px" color="white" size="xl" />
                  <Text color="white" fontSize="sm" fontWeight="600">
                    Updating cutout...
                  </Text>
                </Stack>
              </Box>
            ) : null}
          </ImageEditorCanvas>

          <Stack
            bg="bg"
            border="1px solid {colors.border}"
            borderRadius="24px"
            gap="3"
            overflow="hidden"
            p={{ base: '3', md: '4' }}
            className="image-controls"
          >
            <Navigation
              mode={navigationMode}
              modes={['crop', 'saturation', 'brightness', 'contrast', 'grayscale']}
              onChange={(nextMode) => {
                if (nextMode === 'crop') {
                  setActiveTool('crop')
                  return
                }

                setActiveTool('color')
                setActiveColorControl(navigationModeToColorControl(nextMode))
              }}
            />
            <HStack justify="space-between" px="2">
              <Text color="fg.muted" fontSize="xs" letterSpacing="0.12em" textTransform="uppercase">
                {activeTool === 'edge'
                  ? 'Edge Refinement'
                  : activeTool === 'crop'
                    ? 'Crop'
                    : currentColorControl.label}
              </Text>
              <Button
                minW="0"
                onClick={() => setActiveTool((current) => (current === 'edge' ? 'crop' : 'edge'))}
                px="3"
                rounded="full"
                size="sm"
                variant={activeTool === 'edge' ? 'solid' : 'ghost'}
              >
                Edge
              </Button>
            </HStack>

            {activeTool === 'crop' ? (
              <Stack gap="3">
                <HStack flexWrap="wrap" gap="2" justify="center">
                  <Button onClick={() => zoomImage(0.9)} rounded="full" size="sm" variant="ghost">
                    -
                  </Button>
                  <Button onClick={() => zoomImage(1.1)} rounded="full" size="sm" variant="ghost">
                    +
                  </Button>
                  <Button
                    onClick={() => {
                      cropperRef.current?.reset()
                      scheduleHistoryCommit()
                    }}
                    rounded="full"
                    size="sm"
                    variant="ghost"
                  >
                    Frame
                  </Button>
                  <Button
                    onClick={() => applyRotation(rotation - 90)}
                    rounded="full"
                    size="sm"
                    variant="ghost"
                  >
                    L
                  </Button>
                  <Button
                    onClick={() => applyRotation(rotation + 90)}
                    rounded="full"
                    size="sm"
                    variant="ghost"
                  >
                    R
                  </Button>
                  <Button
                    onClick={() => {
                      cropperRef.current?.flipImage(true, false, {
                        immediately: true,
                        normalize: true,
                        transitions: false,
                      })
                      updateEditorState((current) => ({
                        ...current,
                        flipHorizontal: !current.flipHorizontal,
                      }))
                    }}
                    rounded="full"
                    size="sm"
                    variant={flipHorizontal ? 'solid' : 'ghost'}
                  >
                    Flip
                  </Button>
                </HStack>
                <Stack gap="3">
                  <Text color="fg.muted" fontSize="xs" textAlign="center">
                    Fine rotation
                  </Text>
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

            {isColorTool ? (
              <Stack gap="3">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="600">
                    {currentColorControl.label}
                  </Text>
                  <Text color="fg.muted" fontSize="xs">
                    {currentColorControl.stateKey === 'brightness'
                      ? brightness
                      : currentColorControl.stateKey === 'contrast'
                        ? contrast
                        : currentColorControl.stateKey === 'saturate'
                          ? saturate
                          : grayscale}
                  </Text>
                </HStack>
                <Input
                  max={currentColorControl.max}
                  min={currentColorControl.min}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value)

                    if (currentColorControl.stateKey === 'brightness') {
                      updateEditorState((current) => ({
                        ...current,
                        brightness: nextValue,
                      }))
                    } else if (currentColorControl.stateKey === 'contrast') {
                      updateEditorState((current) => ({
                        ...current,
                        contrast: nextValue,
                      }))
                    } else if (currentColorControl.stateKey === 'saturate') {
                      updateEditorState((current) => ({
                        ...current,
                        saturate: nextValue,
                      }))
                    } else {
                      updateEditorState((current) => ({
                        ...current,
                        grayscale: nextValue,
                      }))
                    }
                  }}
                  step={currentColorControl.step}
                  type="range"
                  value={
                    currentColorControl.stateKey === 'brightness'
                      ? brightness
                      : currentColorControl.stateKey === 'contrast'
                        ? contrast
                        : currentColorControl.stateKey === 'saturate'
                          ? saturate
                          : grayscale
                  }
                />
                <Text color="fg.muted" fontSize="xs" textAlign="center">
                  {currentColorControl.helper}
                </Text>
              </Stack>
            ) : null}

            {activeTool === 'edge' ? (
              <Stack gap="3">
                <Stack gap="3">
                  <Stack display="none" gap="2">
                    <Text fontSize="sm" fontWeight="600">
                      Model
                    </Text>
                    <NativeSelect.Root disabled={isRemovingBackground} size="sm" variant="subtle">
                      <NativeSelect.Field
                        onChange={(event) =>
                          updateEditorState((current) => ({
                            ...current,
                            rembgModel: event.currentTarget.value as RembgModel,
                          }))
                        }
                        value={rembgModel}
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
                      disabled={isRemovingBackground}
                      onValueChange={({ value }) =>
                        updateEditorState((current) => ({
                          ...current,
                          rembgEdgePreset: value as RembgEdgePreset,
                        }))
                      }
                      size="sm"
                      value={rembgEdgePreset}
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
                      `Off` keeps the model&apos;s raw mask. `Sharp` cuts tighter edges. `Soft`
                      keeps more feathering around hair and natural contours.
                    </Text>
                  </Stack>

                  <Switch.Root
                    checked={maskCleanup}
                    colorPalette="primary"
                    disabled={isRemovingBackground}
                    onCheckedChange={(event) =>
                      updateEditorState((current) => ({
                        ...current,
                        maskCleanup: event.checked,
                      }))
                    }
                  >
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label>Mask cleanup</Switch.Label>
                  </Switch.Root>

                  <Switch.Root
                    checked={outlineEnabled}
                    colorPalette="primary"
                    onCheckedChange={(event) =>
                      updateEditorState((current) => ({
                        ...current,
                        outlineEnabled: event.checked,
                      }))
                    }
                  >
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label>White outline</Switch.Label>
                  </Switch.Root>
                </Stack>
                <Text color="fg.muted" fontSize="xs">
                  Background removal runs automatically when the editor opens and whenever these
                  settings change. The white outline is applied when you save the PNG.
                </Text>
                {backgroundError ? (
                  <Alert.Root status="error">
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
          </Stack>
        </Stack>

        <HStack justify="space-between">
          <HStack gap="3">
            <Button disabled={!canUndo} onClick={handleUndo} variant="ghost">
              Undo
            </Button>
            <Button disabled={!canRedo} onClick={handleRedo} variant="ghost">
              Redo
            </Button>
            <Button
              onClick={() => {
                const initialState = cloneEditorState(defaultState)

                clearHistoryCommitTimer()
                setBackgroundError(null)
                setEditorState(initialState)
                cropperRef.current?.reset()
                setHistoryState({
                  entries: [
                    {
                      cropperState: null,
                      editorState: initialState,
                    },
                  ],
                  index: 0,
                })

                window.requestAnimationFrame(() => {
                  scheduleHistoryCommit(initialState)
                })
              }}
              variant="ghost"
            >
              Reset
            </Button>
          </HStack>
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

                  const finalCanvas = outlineEnabled
                    ? createOutlinedCanvas(croppedCanvas, {
                        strokeColor: OUTLINE_COLOR,
                        strokeWidth: OUTLINE_WIDTH,
                      })
                    : croppedCanvas

                  onSave(finalCanvas.toDataURL('image/png'))
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
