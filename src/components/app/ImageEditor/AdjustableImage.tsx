import { type CSSProperties, forwardRef, useLayoutEffect, useRef } from 'react'

import { mergeRefs } from 'react-advanced-cropper'

interface Props {
  src?: string
  crossOrigin?: 'anonymous' | 'use-credentials' | boolean
  brightness?: number
  saturation?: number
  hue?: number
  grayscale?: number
  contrast?: number
  outlineColor?: string
  outlineWidth?: number
  style?: CSSProperties
}

function drawOutline(
  context: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  options: {
    color: string
    width: number
  }
) {
  const { color, width } = options

  if (width <= 0) {
    return
  }

  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = sourceCanvas.width
  maskCanvas.height = sourceCanvas.height

  const maskContext = maskCanvas.getContext('2d')

  if (!maskContext) {
    return
  }

  maskContext.drawImage(sourceCanvas, 0, 0)
  maskContext.globalCompositeOperation = 'source-in'
  maskContext.fillStyle = color
  maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height)
  maskContext.globalCompositeOperation = 'source-over'

  for (let offsetX = -width; offsetX <= width; offsetX += 1) {
    for (let offsetY = -width; offsetY <= width; offsetY += 1) {
      if (offsetX === 0 && offsetY === 0) {
        continue
      }

      if (Math.hypot(offsetX, offsetY) > width) {
        continue
      }

      context.drawImage(maskCanvas, offsetX, offsetY)
    }
  }
}

export const AdjustableImage = forwardRef<HTMLCanvasElement, Props>(
  (
    {
      src,
      crossOrigin,
      brightness = 0,
      saturation = 0,
      hue = 0,
      grayscale = 0,
      contrast = 0,
      outlineColor,
      outlineWidth = 0,
      style,
    }: Props,
    ref
  ) => {
    const imageRef = useRef<HTMLImageElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const drawImage = () => {
      const image = imageRef.current
      const canvas = canvasRef.current

      if (canvas && image && image.complete) {
        const ctx = canvas.getContext('2d')

        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight

        if (ctx) {
          const filteredCanvas = document.createElement('canvas')
          filteredCanvas.width = image.naturalWidth
          filteredCanvas.height = image.naturalHeight

          const filteredContext = filteredCanvas.getContext('2d')

          if (!filteredContext) {
            return
          }

          filteredContext.filter = [
            `brightness(${100 + brightness * 100}%)`,
            `contrast(${100 + contrast * 100}%)`,
            `saturate(${100 + saturation * 100}%)`,
            `hue-rotate(${hue * 360}deg)`,
            `grayscale(${grayscale}%)`,
          ].join(' ')
          filteredContext.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight)

          ctx.clearRect(0, 0, canvas.width, canvas.height)

          if (outlineColor && outlineWidth > 0) {
            drawOutline(ctx, filteredCanvas, {
              color: outlineColor,
              width: outlineWidth,
            })
          }

          ctx.drawImage(filteredCanvas, 0, 0, image.naturalWidth, image.naturalHeight)
        }
      }
    }

    useLayoutEffect(() => {
      drawImage()
    }, [src, brightness, saturation, hue, grayscale, contrast, outlineColor, outlineWidth])

    return (
      <>
        <canvas key={`${src}-canvas`} ref={mergeRefs([ref, canvasRef])} style={style} />
        {src ? (
          <img
            key={`${src}-img`}
            ref={imageRef}
            alt=""
            crossOrigin={crossOrigin === true ? 'anonymous' : crossOrigin || undefined}
            onLoad={drawImage}
            src={src}
            style={{ display: 'none' }}
          />
        ) : null}
      </>
    )
  },
)

AdjustableImage.displayName = 'AdjustableImage'
