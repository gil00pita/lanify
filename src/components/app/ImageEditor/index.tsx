'use client'

import { Box, IconButton, type BoxProps } from '@chakra-ui/react'
import { type ComponentProps, type ReactNode, type RefObject, useRef, useState } from 'react'

import { Cropper, CropperRef, CropperPreview, CropperPreviewRef } from 'react-advanced-cropper'

import { Avatar } from '@/icons/Avatar'
import { ResetIcon } from '@/icons/ResetIcon'

import { AdjustableCropperBackground } from './AdjustableCropperBackground'
import { AdjustablePreviewBackground } from './AdjustablePreviewBackground'
import { Navigation } from './Navigation'
import { Slider } from './Slider'

export type ImageEditorMode =
  | 'brightness'
  | 'contrast'
  | 'crop'
  | 'grayscale'
  | 'hue'
  | 'saturation'

export type ImageEditorAdjustments = {
  brightness: number
  contrast: number
  grayscale?: number
  hue: number
  outlineColor?: string
  outlineWidth?: number
  saturation: number
}

type CropperProps = ComponentProps<typeof Cropper>
type CropperPreviewProps = ComponentProps<typeof CropperPreview>

const defaultAdjustments: ImageEditorAdjustments = {
  brightness: 0,
  contrast: 0,
  grayscale: 0,
  hue: 0,
  outlineColor: undefined,
  outlineWidth: 0,
  saturation: 0,
}

const adjustmentKeys: Array<
  keyof Pick<
    ImageEditorAdjustments,
    'brightness' | 'contrast' | 'grayscale' | 'hue' | 'outlineWidth' | 'saturation'
  >
> = ['brightness', 'contrast', 'grayscale', 'hue', 'outlineWidth', 'saturation']

type ImageEditorCanvasProps = {
  adjustments?: Partial<ImageEditorAdjustments>
  containerProps?: BoxProps
  cropperEnabled?: boolean
  cropperProps?: Omit<CropperProps, 'backgroundComponent' | 'backgroundProps' | 'ref' | 'src'>
  cropperRef: RefObject<CropperRef | null>
  children?: ReactNode
  onReset?: () => void
  previewProps?: Omit<
    CropperPreviewProps,
    'backgroundComponent' | 'backgroundProps' | 'cropper' | 'ref'
  >
  previewRef?: RefObject<CropperPreviewRef | null>
  resetButtonVisible?: boolean
  showPreview?: boolean
  sliderValue?: number | null
  src?: string
  onSliderChange?: (value: number) => void
}

export function ImageEditorCanvas(props: ImageEditorCanvasProps) {
  const {
    adjustments,
    children,
    containerProps,
    cropperEnabled = true,
    cropperProps,
    cropperRef,
    onReset,
    previewProps,
    previewRef,
    resetButtonVisible = false,
    showPreview = true,
    sliderValue = null,
    src,
    onSliderChange,
  } = props
  const mergedAdjustments = {
    ...defaultAdjustments,
    ...adjustments,
  }
  const defaultOverlayClassName = `lanify-image-editor__cropper-overlay${!cropperEnabled ? ' lanify-image-editor__cropper-overlay--faded' : ''}`
  const cropperStencilProps = cropperProps?.stencilProps
  const previewClassName = previewProps?.className
    ? `lanify-image-editor__preview ${previewProps.className}`
    : 'lanify-image-editor__preview'

  return (
    <Box
      bgImage={[
        'repeating-linear-gradient(45deg, var(--lanify-colors-bg-emphasized) 25%, transparent 25%, transparent 75%, var(--lanify-colors-bg-emphasized) 75%, var(--lanify-colors-bg-emphasized))',
        'repeating-linear-gradient(45deg, var(--lanify-colors-bg-emphasized) 25%, var(--lanify-colors-bg) 25%, var(--lanify-colors-bg) 75%, var(--lanify-colors-bg-emphasized) 75%, var(--lanify-colors-bg-emphasized))',
      ].join(', ')}
      backgroundColor="var(--lanify-colors-bg)"
      backgroundPosition="0 0, 10px 10px"
      backgroundSize="20px 20px"
      css={{
        '& .lanify-image-editor__cropper-overlay': {
          transition: 'color 0.5s ease',
        },
        '& .lanify-image-editor__cropper-overlay--faded': {
          color: 'rgba(0, 0, 0, 0.9)',
        },
        '& .lanify-image-editor__preview': {
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '9999px',
          height: '45px',
          left: '20px',
          overflow: 'hidden',
          position: 'absolute',
          top: '20px',
          width: '45px',
        },
      }}
      h="400px"
      maxH="full"
      position="relative"
      {...containerProps}
    >
      {!src ? (
        <Box
          alignItems="center"
          display="flex"
          inset="0"
          justifyContent="center"
          pointerEvents="none"
          position="absolute"
          zIndex="0"
        >
          <Avatar height="168px" width="168px" />
        </Box>
      ) : null}
      <Cropper
        ref={cropperRef}
        src={src}
        backgroundComponent={AdjustableCropperBackground}
        backgroundProps={mergedAdjustments}
        backgroundWrapperProps={{
          moveImage: cropperEnabled,
          scaleImage: cropperEnabled,
          ...cropperProps?.backgroundWrapperProps,
        }}
        {...cropperProps}
        stencilProps={{
          ...cropperStencilProps,
          handlers: cropperStencilProps?.handlers ?? cropperEnabled,
          lines: cropperStencilProps?.lines ?? cropperEnabled,
          movable: cropperStencilProps?.movable ?? cropperEnabled,
          overlayClassName: cropperStencilProps?.overlayClassName ?? defaultOverlayClassName,
          resizable: cropperStencilProps?.resizable ?? cropperEnabled,
        }}
      />
      {showPreview && previewRef ? (
        <CropperPreview
          ref={previewRef}
          cropper={cropperRef}
          backgroundComponent={AdjustablePreviewBackground}
          backgroundProps={mergedAdjustments}
          className={previewClassName}
          {...previewProps}
        />
      ) : null}
      {onReset ? (
        <IconButton
          aria-label="Reset adjustments"
          bg="whiteAlpha.100"
          color="white"
          opacity={resetButtonVisible ? 1 : 0}
          onClick={onReset}
          pointerEvents={resetButtonVisible ? 'auto' : 'none'}
          position="absolute"
          right="20px"
          top="20px"
          visibility={resetButtonVisible ? 'visible' : 'hidden'}
          _hover={{
            bg: 'whiteAlpha.200',
            color: 'primary.300',
          }}
        >
          <ResetIcon />
        </IconButton>
      ) : null}
      {sliderValue !== null && onSliderChange ? (
        <Box bottom="20px" left="50%" position="absolute" transform="translateX(-50%)" w="full">
          <Slider onChange={onSliderChange} value={sliderValue} />
        </Box>
      ) : null}
      {children}
    </Box>
  )
}

export function ImageEditor() {
  const cropperRef = useRef<CropperRef>(null)
  const previewRef = useRef<CropperPreviewRef>(null)

  const [src, setSrc] = useState<string | undefined>()
  const [mode, setMode] = useState<ImageEditorMode>('crop')
  const [adjustments, setAdjustments] = useState<ImageEditorAdjustments>(defaultAdjustments)

  const onChangeValue = (value: number) => {
    if (mode === 'crop') {
      return
    }

    setAdjustments((previousValue) => ({
      ...previousValue,
      [mode]: value,
    }))
  }

  const onReset = () => {
    setMode('crop')
    setAdjustments(defaultAdjustments)
  }

  const onUpload = (blob: string) => {
    onReset()
    setSrc(blob)
  }

  const onDownload = () => {
    if (cropperRef.current) {
      const newTab = window.open()
      if (newTab) {
        newTab.document.body.innerHTML = `<img src="${cropperRef.current
          .getCanvas()
          ?.toDataURL()}"/>`
      }
    }
  }

  const onUpdate = () => {
    previewRef.current?.refresh()
  }

  const changed = adjustmentKeys.some((key) => Math.floor((adjustments[key] ?? 0) * 100))
  const cropperEnabled = mode === 'crop'
  const sliderValue = mode === 'crop' ? 0 : adjustments[mode]

  return (
    <Box border="1px solid" borderColor="whiteAlpha.200" color="primary.300" maxH="full">
      <ImageEditorCanvas
        adjustments={adjustments}
        cropperEnabled={cropperEnabled}
        cropperProps={{ onUpdate }}
        cropperRef={cropperRef}
        onReset={onReset}
        onSliderChange={mode !== 'crop' ? onChangeValue : undefined}
        previewRef={previewRef}
        resetButtonVisible={changed}
        showPreview
        sliderValue={mode !== 'crop' ? sliderValue : null}
        src={src}
      />
      <Navigation mode={mode} onChange={setMode} onUpload={onUpload} onDownload={onDownload} />
    </Box>
  )
}
