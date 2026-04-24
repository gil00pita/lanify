'use client'

import { type ComponentProps, useEffect, useRef, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  ColorPicker,
  HStack,
  IconButton,
  parseColor,
  Slider,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { CropperState, type CropperRef, RectangleStencil } from 'react-advanced-cropper'
import { Cropper as MobileCropper } from 'react-mobile-cropper'

import { ImageEditorCanvas } from '@/components/app/ImageEditor'
import {
  Navigation,
  type EditorMode as ImageNavigationMode,
} from '@/components/app/ImageEditor/Navigation'
import { colors } from '@/lib/variations'
import { BlackAndWhiteIcon } from '@/icons/BlackAndWhite'
import { BrightnessIcon } from '@/icons/BrightnessIcon'
import { ContrastIcon } from '@/icons/ContrastIcon'
import { SaturationIcon } from '@/icons/SaturationIcon'
import { ZoomPlusIcon } from '@/icons/ZoomPlus'
import { ZoomMinusIcon } from '@/icons/ZoomMinus'

type EditorTool = 'background' | 'color'
type RembgEdgePreset = 'off' | 'sharp' | 'balanced' | 'soft'
type RembgModel = 'birefnet-portrait' | 'u2net_human_seg' | 'u2net'
type MobileCropperProps = ComponentProps<typeof MobileCropper>

type EditorState = {
  brightness: number
  contrast: number
  flipHorizontal: boolean
  grayscale: number
  maskCleanup: boolean
  outlineColor: string
  outlineWidth: number
  rembgEdgePreset: RembgEdgePreset
  rembgShiftEdge: number
  rembgModel: RembgModel
  rotation: number
  saturate: number
}

type HistoryEntry = {
  cropperState: CropperState | null
  editedImageSrc: string | null
  rawImageSrc: string | null
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
  outlineColor: colors.commonWhite,
  outlineWidth: 5,
  rembgEdgePreset: 'off',
  rembgShiftEdge: 0,
  rembgModel: 'u2net_human_seg',
  rotation: 0,
  saturate: 100,
}

const HISTORY_LIMIT = 60
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
const outlineSwatches = [
  colors.commonWhite,
  colors.gray1,
  colors.gray2,
  colors.gray3,
  colors.gray4,
  colors.gray5,
  colors.gray6,
  colors.gray7,
]

function getColorControlIcon(control: (typeof colorControls)[number]['stateKey']) {
  if (control === 'brightness') {
    return <BrightnessIcon />
  }

  if (control === 'contrast') {
    return <ContrastIcon />
  }

  if (control === 'saturate') {
    return <SaturationIcon />
  }

  return <BlackAndWhiteIcon />
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
    shiftEdge: number
    signal: AbortSignal
  }
) {
  const file = await dataUrlToFile(imageSrc, 'profile-image')
  const formData = new FormData()
  formData.append('image', file)
  formData.append('edgePreset', options.edgePreset)
  formData.append('model', options.model)
  formData.append('postProcessMask', String(options.postProcessMask))
  formData.append('shiftEdge', String(options.shiftEdge))

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
  return structuredClone(state)
}

function cloneCropperState(state: CropperState | null): CropperState | null {
  return state ? structuredClone(state) : null
}

function createHistorySignature(entry: HistoryEntry) {
  return JSON.stringify(entry)
}

// ---------------------------------------------------------------------------
// Client-side shift-edge: erode or dilate the alpha channel of a transparent
// PNG without any server round-trip, giving the slider instant feedback.
// ---------------------------------------------------------------------------

async function loadImageIntoCanvas(
  src: string
): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context unavailable'))
        return
      }
      ctx.drawImage(img, 0, 0)
      resolve({ canvas, ctx })
    }
    img.onerror = () => reject(new Error('Failed to load image for edge processing'))
    img.src = src
  })
}

/**
 * Separable 2-pass morphology (max-filter = dilate, min-filter = erode).
 * Matches the approach used by the Python service's shift_alpha_mask helper.
 */
function separableMorphology(
  alpha: Uint8Array,
  width: number,
  height: number,
  radius: number,
  expand: boolean
): Uint8Array {
  const temp = new Uint8Array(width * height)
  const result = new Uint8Array(width * height)

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    const row = y * width
    for (let x = 0; x < width; x++) {
      let val = expand ? 0 : 255
      const x0 = x - radius < 0 ? 0 : x - radius
      const x1 = x + radius >= width ? width - 1 : x + radius
      for (let xi = x0; xi <= x1; xi++) {
        const a = alpha[row + xi]
        if (expand ? a > val : a < val) val = a
      }
      temp[row + x] = val
    }
  }

  // Vertical pass
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let val = expand ? 0 : 255
      const y0 = y - radius < 0 ? 0 : y - radius
      const y1 = y + radius >= height ? height - 1 : y + radius
      for (let yi = y0; yi <= y1; yi++) {
        const a = temp[yi * width + x]
        if (expand ? a > val : a < val) val = a
      }
      result[y * width + x] = val
    }
  }

  return result
}

/** Box blur on the alpha channel (separable, O(w*h*r)). */
function boxBlurAlpha(
  alpha: Uint8Array,
  width: number,
  height: number,
  radius: number
): Uint8Array {
  if (radius < 1) return alpha
  const temp = new Uint8Array(width * height)
  const result = new Uint8Array(width * height)

  for (let y = 0; y < height; y++) {
    const row = y * width
    for (let x = 0; x < width; x++) {
      let sum = 0
      const x0 = x - radius < 0 ? 0 : x - radius
      const x1 = x + radius >= width ? width - 1 : x + radius
      for (let xi = x0; xi <= x1; xi++) sum += alpha[row + xi]
      temp[row + x] = Math.round(sum / (x1 - x0 + 1))
    }
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let sum = 0
      const y0 = y - radius < 0 ? 0 : y - radius
      const y1 = y + radius >= height ? height - 1 : y + radius
      for (let yi = y0; yi <= y1; yi++) sum += temp[yi * width + x]
      result[y * width + x] = Math.round(sum / (y1 - y0 + 1))
    }
  }

  return result
}

/**
 * Applies the shift-edge transform to a transparent PNG data-URL in the
 * browser.  Mirrors the Python service's shift_alpha_mask / refine_edges
 * logic so the result is visually identical without a server round-trip.
 *
 * Positive shiftEdge → expands the cutout (recovers hair / fine edges).
 * Negative shiftEdge → contracts the cutout (removes fringe pixels).
 */
async function applyShiftEdgeLocally(src: string, shiftEdge: number): Promise<string> {
  if (shiftEdge === 0) return src

  const { canvas, ctx } = await loadImageIntoCanvas(src)
  const { width, height } = canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const { data } = imageData

  // Extract alpha channel
  const alpha = new Uint8Array(width * height)
  for (let i = 0; i < width * height; i++) {
    alpha[i] = data[i * 4 + 3]
  }

  // Scale radius the same way the Python service does
  const minDim = Math.min(width, height)
  const scale = Math.max(1.5, minDim / 512)
  const radius = Math.max(1, Math.min(160, Math.round(Math.abs(shiftEdge) * scale)))

  // Morphology (dilate for positive, erode for negative)
  const morphed = separableMorphology(alpha, width, height, radius, shiftEdge > 0)

  // Feather / smooth the edge
  const featherRadius = Math.max(1, Math.round(Math.abs(shiftEdge) / 8))
  const feathered = boxBlurAlpha(morphed, width, height, featherRadius)

  // Autocontrast (normalize to full 0-255 range)
  let minVal = 255
  let maxVal = 0
  for (const v of feathered) {
    if (v < minVal) minVal = v
    if (v > maxVal) maxVal = v
  }
  const range = maxVal - minVal

  for (let i = 0; i < width * height; i++) {
    data[i * 4 + 3] = range > 1 ? Math.round(((feathered[i] - minVal) / range) * 255) : feathered[i]
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

export function ProfileImageEditorModal(props: ProfileImageEditorModalProps) {
  const { imageSrc, isOpen, onClose, onSave, originalImageSrc, transparentImageSrc } = props
  const [activeTool, setActiveTool] = useState<EditorTool>('color')
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
  const hasOriginalSource = Boolean(originalImageSrc)
  const [processedTransparentSrc, setProcessedTransparentSrc] = useState<string | null>(
    hasOriginalSource ? null : (transparentImageSrc ?? null)
  )
  // The raw background-removed image from the API (never shift-edge-modified).
  // Shift edge is applied client-side from this base to avoid API round-trips.
  const [rawTransparentSrc, setRawTransparentSrc] = useState<string | null>(
    hasOriginalSource ? null : (transparentImageSrc ?? null)
  )
  const wasOpenRef = useRef(false)
  const removeBackgroundRequestIdRef = useRef(0)
  const historyCommitTimeoutRef = useRef<number | null>(null)
  const isRestoringHistoryRef = useRef(false)
  const editorStateRef = useRef(editorState)
  const sessionSourceRef = useRef<string | null>(null)
  const processingSourceImageRef = useRef<string | null>(null)
  const cropperRef = useRef<CropperRef>(null)
  const rawTransparentSrcRef = useRef(rawTransparentSrc)
  const processedTransparentSrcRef = useRef(processedTransparentSrc)
  const processingSourceImage =
    processingSourceImageRef.current ?? originalImageSrc ?? imageSrc ?? null
  const canUndo = historyState.index > 0
  const canRedo = historyState.index >= 0 && historyState.index < historyState.entries.length - 1
  const brightness = editorState.brightness
  const contrast = editorState.contrast
  const grayscale = editorState.grayscale
  const maskCleanup = editorState.maskCleanup
  const outlineColor = editorState.outlineColor
  const outlineWidth = editorState.outlineWidth
  const rembgEdgePreset = editorState.rembgEdgePreset
  const rembgShiftEdge = editorState.rembgShiftEdge
  const rembgModel = editorState.rembgModel
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
        editedImageSrc: processedTransparentSrcRef.current,
        rawImageSrc: rawTransparentSrcRef.current,
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
    setRawTransparentSrc(entry.rawImageSrc)
    setProcessedTransparentSrc(entry.editedImageSrc)

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

  function zoomImage(factor: number) {
    cropperRef.current?.zoomImage(factor, {
      immediately: true,
      normalize: true,
      transitions: false,
    })

    if (activeTool === 'background') {
      cropperRef.current?.setCoordinates(
        ({ coordinates }) => {
          if (!coordinates) {
            return {}
          }

          const nextWidth = coordinates.width * factor
          const nextHeight = coordinates.height * factor

          return {
            height: nextHeight,
            left: coordinates.left - (nextWidth - coordinates.width) / 2,
            top: coordinates.top - (nextHeight - coordinates.height) / 2,
            width: nextWidth,
          }
        },
        {
          immediately: true,
          transitions: false,
        }
      )
    }

    if (activeTool !== 'background') {
      scheduleHistoryCommit()
    }
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
    rawTransparentSrcRef.current = rawTransparentSrc
  }, [rawTransparentSrc])

  useEffect(() => {
    processedTransparentSrcRef.current = processedTransparentSrc
  }, [processedTransparentSrc])

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
      processingSourceImageRef.current = null
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
    processingSourceImageRef.current = originalImageSrc ?? imageSrc ?? null

    if (!shouldResetSession) {
      return
    }

    setActiveTool('color')
    setActiveColorControl('brightness')
    setEditorState(initialState)
    setRawTransparentSrc(hasOriginalSource ? null : (transparentImageSrc ?? null))
    setProcessedTransparentSrc(hasOriginalSource ? null : (transparentImageSrc ?? null))
    setHistoryState({
      entries: [
        {
          cropperState: null,
          editedImageSrc: hasOriginalSource ? null : (transparentImageSrc ?? null),
          rawImageSrc: hasOriginalSource ? null : (transparentImageSrc ?? null),
          editorState: initialState,
        },
      ],
      index: 0,
    })

    window.requestAnimationFrame(() => {
      scheduleHistoryCommit(initialState)
    })
  }, [
    hasOriginalSource,
    historyState.entries.length,
    isOpen,
    processingSourceImage,
    transparentImageSrc,
  ])

  useEffect(() => {
    if (!isOpen || !processingSourceImage) {
      setIsRemovingBackground(false)
      return
    }

    if (transparentImageSrc && !hasOriginalSource && !hasManualBackgroundSettings) {
      setRawTransparentSrc(transparentImageSrc)
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
      shiftEdge: 0,
      signal: abortController.signal,
    })
      .then((transparentImage) => {
        if (removeBackgroundRequestIdRef.current !== requestId) {
          return
        }

        setRawTransparentSrc(transparentImage)
        setEditorState((current) =>
          current.outlineColor === colors.commonWhite
            ? current
            : {
                ...current,
                outlineColor: colors.commonWhite,
              }
        )
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
    hasOriginalSource,
    isOpen,
    maskCleanup,
    processingSourceImage,
    rembgEdgePreset,
    rembgModel,
    transparentImageSrc,
  ])

  useEffect(() => () => clearHistoryCommitTimer(), [])

  // Apply shift-edge client-side whenever the raw transparent image or the
  // shift value changes.  This replaces the old server round-trip so the
  // slider gives instant, smooth visual feedback.
  useEffect(() => {
    if (isRestoringHistoryRef.current) return

    if (!rawTransparentSrc) {
      setProcessedTransparentSrc(null)
      return
    }

    if (rembgShiftEdge === 0) {
      setProcessedTransparentSrc(rawTransparentSrc)
      return
    }

    let cancelled = false

    void applyShiftEdgeLocally(rawTransparentSrc, rembgShiftEdge)
      .then((shifted) => {
        if (!cancelled) setProcessedTransparentSrc(shifted)
      })
      .catch(() => {
        if (!cancelled) setProcessedTransparentSrc(rawTransparentSrc)
      })

    return () => {
      cancelled = true
    }
  }, [rawTransparentSrc, rembgShiftEdge])

  const transparentPreviewSrc =
    processedTransparentSrc ?? (hasOriginalSource ? null : transparentImageSrc)
  const currentImageSrc = transparentPreviewSrc ?? processingSourceImage
  const cropperEnabled = true
  const isColorTool = activeTool === 'color'
  const isBackgroundTool = activeTool === 'background'
  const navigationMode: ImageNavigationMode = activeTool
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
        </HStack>

        <Stack gap="4">
          <ImageEditorCanvas
            adjustments={{
              brightness: (brightness - 100) / 100,
              contrast: (contrast - 100) / 100,
              grayscale,
              hue: 0,
              outlineColor: outlineWidth > 0 ? outlineColor : undefined,
              outlineWidth,
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
              borderRadius: '40px',
              css: {
                '--lanify-cropper-guide-color': outlineWidth > 0 ? outlineColor : 'transparent',
              },
              flexShrink: 0,
              maxW: '540px',
              mx: 'auto',
              overflow: 'hidden',
              w: { base: 'min(100%, 420px)', md: '540px' },
            }}
            cropperEnabled={cropperEnabled}
            cropperProps={{
              className: 'lanify-profile-cropper',
              imageRestriction: 'none' as MobileCropperProps['imageRestriction'],
              onChange: () => {
                if (activeTool !== 'background') {
                  scheduleHistoryCommit()
                }
              },
              stencilComponent: RectangleStencil,
              stencilProps: {
                aspectRatio: 1,
                overlayClassName: 'lanify-profile-cropper-overlay',
              },
            }}
            cropperRef={cropperRef}
            canRedo={canRedo}
            canUndo={canUndo}
            onRedo={handleRedo}
            onReset={() => {
              const resetTransparentSrc =
                rawTransparentSrcRef.current ??
                processedTransparentSrcRef.current ??
                (hasOriginalSource ? null : (transparentImageSrc ?? null))
              const resetEditorState = cloneEditorState(defaultState)

              clearHistoryCommitTimer()
              setBackgroundError(null)
              setActiveTool('color')
              setActiveColorControl('brightness')
              editorStateRef.current = resetEditorState
              rawTransparentSrcRef.current = resetTransparentSrc
              processedTransparentSrcRef.current = resetTransparentSrc
              setEditorState(resetEditorState)
              setRawTransparentSrc(resetTransparentSrc)
              setProcessedTransparentSrc(resetTransparentSrc)
              isRestoringHistoryRef.current = true
              cropperRef.current?.reset()
              setHistoryState({
                entries: [
                  {
                    cropperState: null,
                    editedImageSrc: resetTransparentSrc,
                    rawImageSrc: resetTransparentSrc,
                    editorState: resetEditorState,
                  },
                ],
                index: 0,
              })
              window.requestAnimationFrame(() => {
                isRestoringHistoryRef.current = false
              })
            }}
            onUndo={handleUndo}
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
                    Removing background...
                  </Text>
                </Stack>
              </Box>
            ) : null}
          </ImageEditorCanvas>

          <Stack gap="3" overflow="hidden" className="image-controls">
            <Navigation
              mode={navigationMode}
              modes={['color', 'background']}
              onChange={(nextMode) => setActiveTool(nextMode)}
            />

            {isColorTool ? (
              <Stack gap="3">
                <HStack flexWrap="wrap" gap="2" justify="center" color="fg">
                  {colorControls.map((control) => (
                    <IconButton
                      key={control.stateKey}
                      aria-label={control.label}
                      onClick={() => setActiveColorControl(control.stateKey)}
                      rounded="full"
                      variant={activeColorControl === control.stateKey ? 'solid' : 'ghost'}
                    >
                      {getColorControlIcon(control.stateKey)}
                    </IconButton>
                  ))}
                </HStack>
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
                <Slider.Root
                  aria-label={[currentColorControl.label]}
                  colorPalette="primary"
                  max={currentColorControl.max}
                  min={currentColorControl.min}
                  onValueChange={(details) => {
                    const nextValue = details.value[0] ?? currentColorControl.min

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
                  size="sm"
                  step={currentColorControl.step}
                  value={[
                    currentColorControl.stateKey === 'brightness'
                      ? brightness
                      : currentColorControl.stateKey === 'contrast'
                        ? contrast
                        : currentColorControl.stateKey === 'saturate'
                          ? saturate
                          : grayscale,
                  ]}
                >
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumb index={0} />
                  </Slider.Control>
                </Slider.Root>
                <Text color="fg.muted" fontSize="xs" textAlign="center">
                  {currentColorControl.helper}
                </Text>
              </Stack>
            ) : null}

            {isBackgroundTool ? (
              <Stack gap="3">
                <HStack flexWrap="wrap" gap="2" justify="center" color="fg">
                  <IconButton
                    aria-label="Zoom out for background cleanup"
                    onClick={() => zoomImage(0.9)}
                    rounded="full"
                    size="sm"
                    variant="ghost"
                  >
                    <ZoomMinusIcon />
                  </IconButton>
                  <IconButton
                    aria-label="Zoom in for background cleanup"
                    onClick={() => zoomImage(1.1)}
                    rounded="full"
                    size="sm"
                    variant="ghost"
                  >
                    <ZoomPlusIcon />
                  </IconButton>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="600">
                    Shift edge
                  </Text>
                  <Text color="fg.muted" fontSize="xs">
                    {rembgShiftEdge > 0 ? `+${rembgShiftEdge}` : rembgShiftEdge}
                  </Text>
                </HStack>
                <Slider.Root
                  aria-label={['Shift edge']}
                  colorPalette="primary"
                  max={20}
                  min={-20}
                  onValueChange={(details) =>
                    updateEditorState((current) => ({
                      ...current,
                      rembgShiftEdge: details.value[0] ?? 0,
                    }))
                  }
                  origin="center"
                  size="sm"
                  step={1}
                  value={[rembgShiftEdge]}
                >
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumb index={0} />
                  </Slider.Control>
                </Slider.Root>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="600">
                    Portrait outline
                  </Text>
                  <HStack gap="2">
                    <Text color="fg.muted" fontSize="xs">
                      {outlineWidth}
                    </Text>
                    <Box
                      bg={outlineColor}
                      border="1px solid rgba(255,255,255,0.2)"
                      borderRadius="full"
                      boxSize="4"
                    />
                  </HStack>
                </HStack>
                <Slider.Root
                  aria-label={['Outline thickness']}
                  colorPalette="primary"
                  max={8}
                  min={0}
                  onValueChange={(details) =>
                    updateEditorState((current) => ({
                      ...current,
                      outlineWidth: details.value[0] ?? 0,
                    }))
                  }
                  size="sm"
                  step={1}
                  value={[outlineWidth]}
                >
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumb index={0} />
                  </Slider.Control>
                </Slider.Root>
                <ColorPicker.Root
                  alignItems="flex-start"
                  defaultValue={parseColor('#fff')}
                  onValueChange={(details) =>
                    updateEditorState((current) => ({
                      ...current,
                      outlineColor: details.valueAsString,
                    }))
                  }
                  value={parseColor(outlineColor)}
                >
                  <ColorPicker.HiddenInput />
                  <ColorPicker.Label fontSize="sm" fontWeight="600">
                    Outline color
                  </ColorPicker.Label>
                  <ColorPicker.SwatchGroup>
                    {outlineSwatches.map((swatch) => (
                      <ColorPicker.SwatchTrigger key={swatch} value={swatch}>
                        <ColorPicker.Swatch value={swatch}>
                          <ColorPicker.SwatchIndicator
                            boxSize="3"
                            bg="primary"
                            border={'1px solid {colors.border}'}
                          />
                        </ColorPicker.Swatch>
                      </ColorPicker.SwatchTrigger>
                    ))}
                  </ColorPicker.SwatchGroup>
                </ColorPicker.Root>
                <Text color="fg.muted" fontSize="xs">
                  Shift edge nudges the cutout inward or outward before the outline is applied.
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

        <HStack justify="flex-end">
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

                  const finalCanvas =
                    outlineWidth > 0
                      ? createOutlinedCanvas(croppedCanvas, {
                          strokeColor: outlineColor,
                          strokeWidth: outlineWidth,
                        })
                      : croppedCanvas

                  onSave(finalCanvas.toDataURL('image/png'))
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
