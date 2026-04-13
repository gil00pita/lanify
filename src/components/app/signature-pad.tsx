'use client'

import { useRef, useState } from 'react'

import { Box, Button, HStack, Text } from '@chakra-ui/react'

import type { SignatureStroke } from '@/types/domain'

interface SignaturePadProps {
  onConfirm: (payload: { dataUrl: string; strokes: SignatureStroke[] }) => void
}

export function SignaturePad(props: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [strokes, setStrokes] = useState<SignatureStroke[]>([])

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current

    if (!canvas) {
      return null
    }

    const rect = canvas.getBoundingClientRect()

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  function redraw(nextStrokes: SignatureStroke[]) {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.lineWidth = 2.5
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#17130f'

    nextStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) {
        return
      }

      context.beginPath()
      context.moveTo(stroke.points[0].x, stroke.points[0].y)
      stroke.points.slice(1).forEach((point) => {
        context.lineTo(point.x, point.y)
      })
      context.stroke()
    })
  }

  function clear() {
    setStrokes([])
    redraw([])
  }

  return (
    <Box bg="rgba(255,255,255,0.82)" borderRadius="24px" p="5">
      <Text fontWeight="700" mb="3">
        Signature
      </Text>
      <Box border="1px dashed rgba(17,16,13,0.18)" borderRadius="20px" overflow="hidden">
        <canvas
          height={180}
          onPointerDown={(event) => {
            const point = getPoint(event)

            if (!point) {
              return
            }

            setDrawing(true)
            setStrokes((current) => [...current, { points: [point] }])
          }}
          onPointerMove={(event) => {
            if (!drawing) {
              return
            }

            const point = getPoint(event)

            if (!point) {
              return
            }

            setStrokes((current) => {
              const next = [...current]
              const lastStroke = next[next.length - 1]
              next[next.length - 1] = {
                ...lastStroke,
                points: [...lastStroke.points, point],
              }
              queueMicrotask(() => redraw(next))
              return next
            })
          }}
          onPointerUp={() => setDrawing(false)}
          ref={canvasRef}
          style={{ background: '#fffdf9', display: 'block', width: '100%' }}
          width={520}
        />
      </Box>

      <HStack justify="space-between" mt="4">
        <Button onClick={clear} variant="outline">
          Clear signature
        </Button>
        <Button
          onClick={() => {
            const canvas = canvasRef.current

            if (!canvas) {
              return
            }

            props.onConfirm({
              dataUrl: canvas.toDataURL('image/png'),
              strokes,
            })
          }}
        >
          Confirm signature
        </Button>
      </HStack>
    </Box>
  )
}
