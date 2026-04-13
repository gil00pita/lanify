'use client'

import { useMemo } from 'react'

import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import type { PatternSettings } from '@/types/domain'

const MotionGroup = motion.g

function range(count: number) {
  return Array.from({ length: count }, (_, index) => index)
}

export function PatternRenderer(props: {
  height?: number
  settings: PatternSettings
  width?: number
}) {
  const { height = 360, settings, width = 240 } = props

  const marks = useMemo(() => {
    return range(settings.rows).flatMap((rowIndex) =>
      range(settings.itemsPerRow).map((itemIndex) => {
        const normalized = itemIndex / Math.max(settings.itemsPerRow - 1, 1)
        const sine =
          Math.sin(normalized * Math.PI * 2 * settings.frequency + rowIndex * 0.45 + settings.phaseOffset) *
          settings.amplitude
        const opacity =
          settings.minOpacity +
          ((sine + 1) / 2) * (settings.maxOpacity - settings.minOpacity)

        return {
          key: `${rowIndex}-${itemIndex}`,
          opacity: Math.max(settings.minOpacity, Math.min(settings.maxOpacity, opacity)),
          x: 18 + itemIndex * settings.itemSpacing,
          y: 26 + rowIndex * settings.rowSpacing,
        }
      }),
    )
  }, [settings])

  return (
    <Box h={`${height}px`} inset="0" pointerEvents="none" position="absolute" w={`${width}px`}>
      <svg height={height} viewBox={`0 0 ${width} ${height}`} width={width}>
        <rect fill="#0d0d0d" height={height} rx="28" width={width} />
        <MotionGroup
          animate={
            settings.animate
              ? { rotate: [settings.rotation - 2, settings.rotation + 2, settings.rotation - 2] }
              : { rotate: settings.rotation }
          }
          style={{ originX: 0.5, originY: 0.5 }}
          transition={
            settings.animate
              ? {
                  duration: Math.max(2, 8 / settings.animationSpeed),
                  ease: 'easeInOut',
                  repeat: Number.POSITIVE_INFINITY,
                }
              : undefined
          }
        >
          {marks.map((mark) => (
            <rect
              fill="white"
              height={6 * settings.scale}
              key={mark.key}
              opacity={mark.opacity}
              rx={3}
              width={10 * settings.scale}
              x={mark.x}
              y={mark.y}
            />
          ))}
        </MotionGroup>
      </svg>
    </Box>
  )
}
