'use client'

import { Box, IconButton, type BoxProps } from '@chakra-ui/react'
import {
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react'

import { CropperPreview, type CropperPreviewRef } from 'react-advanced-cropper'
import { Cropper, type CropperRef } from 'react-mobile-cropper'

import { Avatar } from '@/illustrations/Avatar'
import { RedoIcon } from '@/icons/Redo'
import { ResetIcon } from '@/icons/ResetIcon'
import { UndoIcon } from '@/icons/Undo'

import { AdjustableCropperBackground } from './AdjustableCropperBackground'
import { AdjustablePreviewBackground } from './AdjustablePreviewBackground'
import { Slider } from './Slider'

export type ImageEditorMode = 'background' | 'color' | 'crop'

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

type ImageEditorCanvasProps = {
  adjustments?: Partial<ImageEditorAdjustments>
  containerProps?: BoxProps
  cropperEnabled?: boolean
  cropperProps?: Omit<CropperProps, 'backgroundComponent' | 'backgroundProps' | 'ref' | 'src'>
  cropperRef: RefObject<CropperRef | null>
  children?: ReactNode
  canRedo?: boolean
  canUndo?: boolean
  onRedo?: () => void
  onReset?: () => void
  onUndo?: () => void
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
    canRedo = false,
    canUndo = false,
    children,
    containerProps,
    cropperEnabled = true,
    cropperProps,
    cropperRef,
    onRedo,
    onReset,
    onUndo,
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
      rounded={'40px'}
      position="relative"
      className="image-editor"
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
        backgroundProps={{
          ...mergedAdjustments,
        }}
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
        <Box
          display="flex"
          flexDirection="column"
          gap={3}
          position="absolute"
          right="20px"
          top="20px"
        >
          <IconButton
            aria-label="Reset adjustments"
            opacity={resetButtonVisible ? 1 : 0}
            onClick={onReset}
            pointerEvents={resetButtonVisible ? 'auto' : 'none'}
            visibility={resetButtonVisible ? 'visible' : 'hidden'}
          >
            <ResetIcon />
          </IconButton>
          {onUndo ? (
            <IconButton aria-label="Undo edit" disabled={!canUndo} onClick={onUndo}>
              <UndoIcon />
            </IconButton>
          ) : null}
          {onRedo ? (
            <IconButton aria-label="Redo edit" disabled={!canRedo} onClick={onRedo}>
              <RedoIcon />
            </IconButton>
          ) : null}
        </Box>
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
  const inputRef = useRef<HTMLInputElement>(null)
  const cropperRef = useRef<CropperRef>(null)

  const [image, setImage] = useState<string>('')

  const onUpload = () => {
    inputRef.current?.click()
  }

  const onCrop = () => {
    const cropper = cropperRef.current
    if (cropper) {
      const canvas = cropper.getCanvas()
      const newTab = window.open()
      if (newTab && canvas) {
        newTab.document.body.innerHTML = `<img src="${canvas.toDataURL()}"></img>`
      }
    }
  }

  const onLoadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0]
    if (file) {
      setImage(URL.createObjectURL(file))
    }
    event.target.value = ''
  }

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image)
      }
    }
  }, [image])

  return (
    <div className="example">
      <div className="example__cropper-wrapper">
        <Cropper
          ref={cropperRef}
          className="example__cropper"
          backgroundClassName="example__cropper-background"
          src={image}
        />
      </div>
      <div className="example__buttons-wrapper">
        <button className="example__button" onClick={onUpload}>
          <input ref={inputRef} type="file" accept="image/*" onChange={onLoadImage} />
          Upload image
        </button>
        {image && (
          <button className="example__button" onClick={onCrop}>
            Download result
          </button>
        )}
      </div>
    </div>
  )
}
