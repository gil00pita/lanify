'use client'

import { Box, Text } from '@chakra-ui/react'
import { type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent, useEffect, useRef, useState } from 'react'

interface Props {
  onChange?: (value: number) => void
  value?: number
  showValue?: boolean
}

function getPosition(event: MouseEvent | TouchEvent | ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) {
  if ('touches' in event) {
    return event.touches[0]?.clientX ?? 0
  }

  return event.clientX
}

export function Slider({ onChange, showValue = true, value = 0 }: Props) {
  const lineRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const recalculateWidth = () => {
      setWidth(lineRef.current?.clientWidth ?? 0)
    }

    recalculateWidth()
    window.addEventListener('resize', recalculateWidth)
    window.addEventListener('orientationchange', recalculateWidth)

    return () => {
      window.removeEventListener('resize', recalculateWidth)
      window.removeEventListener('orientationchange', recalculateWidth)
    }
  }, [])

  useEffect(() => {
    if (!isDragging) {
      return undefined
    }

    const handleDrag = (event: MouseEvent | TouchEvent) => {
      const line = lineRef.current
      if (!line) {
        return
      }

      const { left, width: lineWidth } = line.getBoundingClientRect()
      const position = getPosition(event)

      onChange?.(Math.max(-1, Math.min(1, (2 * (position - left - lineWidth / 2)) / lineWidth)))
      event.preventDefault?.()
    }

    const handleStop = () => {
      setIsDragging(false)
    }

    window.addEventListener('mouseup', handleStop)
    window.addEventListener('mousemove', handleDrag, { passive: false })
    window.addEventListener('touchmove', handleDrag, { passive: false })
    window.addEventListener('touchend', handleStop)

    return () => {
      window.removeEventListener('mouseup', handleStop)
      window.removeEventListener('mousemove', handleDrag)
      window.removeEventListener('touchmove', handleDrag)
      window.removeEventListener('touchend', handleStop)
    }
  }, [isDragging, onChange])

  const onStart = (event: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) => {
    const line = lineRef.current
    if (!line) {
      return
    }

    const { left, width: lineWidth } = line.getBoundingClientRect()
    const position = getPosition(event)

    setIsDragging(true)
    onChange?.(Math.max(-1, Math.min(1, (2 * (position - left - lineWidth / 2)) / lineWidth)))
    event.preventDefault()
  }

  const handleInsideDot = width ? Math.abs(value) <= 16 / width : true
  const fillWidth = `${Math.abs(value) * 50}%`
  const fillLeft = `${50 * (1 - Math.abs(Math.min(0, value)))}%`
  const thumbLeft = `${value * 50 + 50}%`
  const labelLeft = `${Math.abs(value * 50 + 50)}%`
  const formattedValue = `${value > 0 ? '+' : ''}${Math.round(100 * value)}`

  return (
    <Box
      alignItems="center"
      bg="rgba(27, 26, 33, 0.4)"
      borderRadius="full"
      cursor="pointer"
      display="flex"
      h="20px"
      maxW="380px"
      onMouseDown={onStart}
      onTouchStart={onStart}
      px="4"
      touchAction="none"
      w="full"
    >
      <Box ref={lineRef} alignItems="center" bg="whiteAlpha.500" display="flex" h="2px" position="relative" w="full">
        <Box bg="white" h="2px" left={fillLeft} position="absolute" width={fillWidth} />
        <Box bg="white" borderRadius="full" boxSize="8px" left="50%" position="absolute" top="50%" transform="translate(-50%, -50%)" />
        {showValue ? (
          <Text
            color="white"
            fontSize="10px"
            fontWeight="medium"
            left={labelLeft}
            opacity={handleInsideDot ? 0 : 1}
            pointerEvents="none"
            position="absolute"
            top="-20px"
            transform="translateX(-50%)"
            transition="opacity 0.2s ease"
          >
            {formattedValue}
          </Text>
        ) : null}
        <Box
          bg="white"
          h={handleInsideDot ? '4px' : isDragging ? '10px' : '8px'}
          left={thumbLeft}
          position="absolute"
          top="50%"
          transform="translate(-50%, -50%)"
          transition="height 0.2s ease"
          w="2px"
        />
      </Box>
    </Box>
  )
}
