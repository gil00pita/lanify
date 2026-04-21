import React, { forwardRef } from 'react'
import { CropperTransitions, CropperImage, CropperState } from 'react-advanced-cropper'
import { getBackgroundStyle } from 'advanced-cropper'
import { AdjustableImage } from './AdjustableImage'

interface DesiredCropperRef {
  getState: () => CropperState
  getTransitions: () => CropperTransitions
  getImage: () => CropperImage
}

interface Props {
  cropper: DesiredCropperRef
  crossOrigin?: 'anonymous' | 'use-credentials' | boolean
  brightness?: number
  saturation?: number
  hue?: number
  grayscale?: number
  contrast?: number
  outlineColor?: string
  outlineWidth?: number
}

export const AdjustableCropperBackground = forwardRef<HTMLCanvasElement, Props>(
  (
    {
      cropper,
      crossOrigin,
      brightness = 0,
      saturation = 0,
      hue = 0,
      grayscale = 0,
      contrast = 0,
      outlineColor,
      outlineWidth = 0,
    }: Props,
    ref
  ) => {
    const state = cropper.getState()
    const transitions = cropper.getTransitions()
    const image = cropper.getImage()

    const style = image && state ? getBackgroundStyle(image, state, transitions) : {}

    return (
      <AdjustableImage
        src={image?.src}
        crossOrigin={crossOrigin}
        brightness={brightness}
        saturation={saturation}
        hue={hue}
        grayscale={grayscale}
        contrast={contrast}
        outlineColor={outlineColor}
        outlineWidth={outlineWidth}
        ref={ref}
        style={style}
      />
    )
  }
)
