'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

import { Box, Image, Stack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import { Avatar } from '@/icons/Avatar'
import { PRINT_CARD_ASPECT_RATIO } from '@/lib/ui-tokens'
import type { CardDesign, PatternSettings } from '@/types/domain'

const MotionBox = motion.create(Box)
const CARD_LAYOUT = {
  default: {
    infoPanelTop: '56%',
    maxNameFontSize: 42,
    maxNameWidth: 154,
    maxRoleFontSize: 18,
    minNameFontSize: 12,
    minRoleFontSize: 10,
  },
  gallery: {
    infoPanelTop: '58%',
    maxNameFontSize: 36,
    maxNameWidth: 128,
    maxRoleFontSize: 14,
    minNameFontSize: 24,
    minRoleFontSize: 10,
  },
} as const

type AppCardState = 'default' | 'selected' | 'customizing'

type AppCardProps = {
  card: CardDesign
  firstName?: string
  interactive?: boolean
  lastName?: string
  onClick?: () => void
  skipAutoFit?: boolean
  staticPreview?: boolean
  state?: AppCardState
  width?: string | number
}

function getForeground(color: string) {
  return ['#1f1d1d', '#59503b', '#8e018a', '#2f4fe9'].includes(color) ? '#f7f0e4' : '#1f1d1d'
}

function splitNameLines(title: string) {
  const parts = title.trim().split(/\s+/).filter(Boolean)

  if (parts.length <= 1) {
    return [title, null] as const
  }

  return [parts[0], parts.slice(1).join(' ')] as const
}

function fitTextToWidth(params: {
  availableWidth: number
  currentFontSize: number
  maxFontSize: number
  minFontSize: number
  textWidth: number
}) {
  const { availableWidth, currentFontSize, maxFontSize, minFontSize, textWidth } = params

  if (!availableWidth || !textWidth) {
    return currentFontSize
  }

  return Math.max(
    minFontSize,
    Math.min(maxFontSize, (currentFontSize * availableWidth) / textWidth)
  )
}

function SelectorPattern(props: { color: string; settings: PatternSettings }) {
  const { color, settings } = props
  const foreground = getForeground(color)
  const cols = Math.min(22, Math.max(12, settings.itemsPerRow))
  const rows = Math.min(10, Math.max(6, settings.rows))

  const marks = Array.from({ length: rows * cols }, (_, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols
    const normalized = col / Math.max(cols - 1, 1)
    const sine =
      Math.sin(normalized * Math.PI * 2 * settings.frequency + row * 0.45 + settings.phaseOffset) *
      settings.amplitude
    const opacity =
      settings.minOpacity + ((sine + 1) / 2) * (settings.maxOpacity - settings.minOpacity)

    return {
      key: `${row}-${col}`,
      opacity: Math.max(0.12, Math.min(1, opacity)),
      x: 8 + col * 12,
      y: 8 + row * 12,
    }
  })

  return (
    <svg height="118" viewBox="0 0 290 118" width="100%">
      {marks.map((mark) => (
        <rect
          fill={foreground}
          height="9"
          key={mark.key}
          opacity={mark.opacity}
          rx="1.5"
          width="9"
          x={mark.x}
          y={mark.y}
        />
      ))}
    </svg>
  )
}

function AppCardFront(props: {
  card: CardDesign
  color: string
  compactLayout?: boolean
  firstName?: string
  foreground: string
  lastName?: string
  skipAutoFit?: boolean
}) {
  const { card, color, compactLayout = false, firstName, foreground, lastName, skipAutoFit = false } = props
  const layout = compactLayout ? CARD_LAYOUT.gallery : CARD_LAYOUT.default
  const [fallbackFirstLine, fallbackSecondLine] = splitNameLines(card.title)
  const firstLine = firstName ?? fallbackFirstLine
  const secondLine = lastName ?? fallbackSecondLine
  const nameContainerRef = useRef<HTMLDivElement | null>(null)
  const roleContainerRef = useRef<HTMLDivElement | null>(null)
  const firstLineRef = useRef<HTMLParagraphElement | null>(null)
  const secondLineRef = useRef<HTMLParagraphElement | null>(null)
  const roleRef = useRef<HTMLParagraphElement | null>(null)
  const [nameFontSize, setNameFontSize] = useState(layout.maxNameFontSize)
  const [surnameFontSize, setSurnameFontSize] = useState(layout.maxNameFontSize)
  const [roleFontSize, setRoleFontSize] = useState(layout.maxRoleFontSize)
  const shouldEllipsizeName = nameFontSize <= layout.minNameFontSize + 0.5
  const shouldEllipsizeSurname = surnameFontSize <= layout.minNameFontSize + 0.5
  const shouldEllipsizeRole = roleFontSize <= layout.minRoleFontSize + 0.5

  useEffect(() => {
    setNameFontSize(layout.maxNameFontSize)
    setSurnameFontSize(layout.maxNameFontSize)
    setRoleFontSize(layout.maxRoleFontSize)
  }, [layout.maxNameFontSize, layout.maxRoleFontSize])

  useEffect(() => {
    if (skipAutoFit) {
      return
    }

    const fitName = () => {
      const container = nameContainerRef.current
      const firstNameNode = firstLineRef.current
      const availableWidth = Math.min(container?.clientWidth ?? 0, layout.maxNameWidth)

      if (!container || !firstNameNode) {
        return
      }

      const nextNameFontSize = fitTextToWidth({
        availableWidth,
        currentFontSize: nameFontSize,
        maxFontSize: layout.maxNameFontSize,
        minFontSize: layout.minNameFontSize,
        textWidth: firstNameNode.scrollWidth,
      })

      setNameFontSize((currentFontSize) =>
        Math.abs(currentFontSize - nextNameFontSize) < 0.5 ? currentFontSize : nextNameFontSize
      )

      const lastNameNode = secondLineRef.current
      if (!lastNameNode) {
        return
      }

      const nextSurnameFontSize = fitTextToWidth({
        availableWidth,
        currentFontSize: surnameFontSize,
        maxFontSize: layout.maxNameFontSize,
        minFontSize: layout.minNameFontSize,
        textWidth: lastNameNode.scrollWidth,
      })

      setSurnameFontSize((currentFontSize) =>
        Math.abs(currentFontSize - nextSurnameFontSize) < 0.5
          ? currentFontSize
          : nextSurnameFontSize
      )
    }

    fitName()

    const container = nameContainerRef.current
    if (!container || typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(() => {
      fitName()
    })

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [
    firstLine,
    layout.maxNameFontSize,
    layout.maxNameWidth,
    layout.minNameFontSize,
    nameFontSize,
    secondLine,
    skipAutoFit,
    surnameFontSize,
  ])

  useEffect(() => {
    if (skipAutoFit) {
      return
    }

    const fitRole = () => {
      const container = roleContainerRef.current
      const roleNode = roleRef.current

      if (!container || !roleNode) {
        return
      }

      const nextRoleFontSize = fitTextToWidth({
        availableWidth: container.clientWidth,
        currentFontSize: roleFontSize,
        maxFontSize: layout.maxRoleFontSize,
        minFontSize: layout.minRoleFontSize,
        textWidth: roleNode.scrollWidth,
      })

      setRoleFontSize((currentFontSize) =>
        Math.abs(currentFontSize - nextRoleFontSize) < 0.5 ? currentFontSize : nextRoleFontSize
      )
    }

    fitRole()

    const container = roleContainerRef.current
    if (!container || typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(() => {
      fitRole()
    })

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [card.subtitle, layout.maxRoleFontSize, layout.minRoleFontSize, roleFontSize, skipAutoFit])

  return (
    <Box h="full" overflow="hidden" position="relative">
      <Box inset="0" position="absolute" />

      <Box
        className="card-portrait"
        h="64%"
        insetX="0"
        overflow="hidden"
        position="absolute"
        top="0"
        transition={'background-color 0.6s ease'}
        bg={color}
      >
        <Box inset="0" opacity="0.28" position="absolute">
          <SelectorPattern color={color} settings={card.patternSettings} />
        </Box>

        <Box insetX="14%" position="absolute" top={0} bottom={0} left={0} right={0}>
          {card.portraitImage ? (
            <Image
              alt={card.title}
              h="100%"
              maxH="646px"
              mx="auto"
              objectFit="cover"
              src={card.portraitImage}
              w="100%"
            />
          ) : (
            <Box
              alignItems="center"
              color={foreground}
              display="flex"
              h="100%"
              justifyContent="center"
              opacity="0.96"
            >
              <Avatar height="240px" width="240px" />
            </Box>
          )}
        </Box>
      </Box>

      <Box
        className="card-info"
        bgColor="rgba(250,249,246,1)"
        bottom="-1px"
        clipPath="polygon(0 0, 72% 0, 84% 16%, 100% 16%, 100% 100%, 0 100%)"
        color="fb"
        left="0"
        position="absolute"
        pt={3}
        px={6}
        pb={7}
        right="0"
        top={layout.infoPanelTop}
      >
        <Stack gap={{ base: '2', md: '3' }} h="full" justify="space-between">
          <Stack gap="2" ref={nameContainerRef} w="full">
            <Text
              fontSize={`${nameFontSize}px`}
              fontWeight="600"
              letterSpacing="-0.05em"
              lineHeight="0.92"
              overflow={shouldEllipsizeName ? 'hidden' : 'visible'}
              ref={firstLineRef}
              textOverflow={shouldEllipsizeName ? 'ellipsis' : 'clip'}
              w="full"
              whiteSpace="nowrap"
              maxW={`${layout.maxNameWidth}px`}
            >
              {firstLine}
            </Text>
            {secondLine ? (
              <Text
                fontSize={`${surnameFontSize}px`}
                fontWeight="600"
                letterSpacing="-0.05em"
                lineHeight="0.92"
                overflow={shouldEllipsizeSurname ? 'hidden' : 'visible'}
                ref={secondLineRef}
                textOverflow={shouldEllipsizeSurname ? 'ellipsis' : 'clip'}
                w="full"
                whiteSpace="nowrap"
              >
                {secondLine}
              </Text>
            ) : null}
          </Stack>
          <Box ref={roleContainerRef} w="full">
            <Text
              color="fg"
              fontSize={`${roleFontSize}px`}
              lineHeight="1.05"
              overflow={shouldEllipsizeRole ? 'hidden' : 'visible'}
              ref={roleRef}
              textOverflow={shouldEllipsizeRole ? 'ellipsis' : 'clip'}
              w="full"
              whiteSpace="nowrap"
            >
              {card.subtitle}
            </Text>
          </Box>
        </Stack>

      </Box>
    </Box>
  )
}

function AppCardBack(props: { card: CardDesign; color: string; foreground: string }) {
  const { card, color, foreground } = props

  return (
    <Stack gap="4" h="full" justify="space-between">
      <AppCardFront card={card} color={color} foreground={foreground} />
    </Stack>
  )
}

function AppCardFace(props: {
  children: ReactNode
  color: string
  foreground: string
  rotateY?: number
}) {
  const { children, foreground, rotateY = 0 } = props

  return (
    <Box
      className="card-face"
      border="inherit"
      borderRadius="24px"
      boxShadow="inherit"
      color={foreground}
      inset="0"
      p={0}
      position="absolute"
      overflow={'hidden'}
      _empty={{ display: 'none' }}
      style={{
        backfaceVisibility: 'hidden',
        transform: `rotateY(${rotateY}deg)`,
      }}
    >
      {children}
    </Box>
  )
}

export function AppCard(props: AppCardProps) {
  const {
    card,
    firstName,
    interactive,
    lastName,
    onClick,
    skipAutoFit = false,
    state = 'default',
    staticPreview = false,
    width = '100%',
  } = props
  const color = card.primaryColor
  const foreground = getForeground(color)
  const isInteractive = interactive ?? Boolean(onClick)
  const isSelected = state === 'selected'
  const isCustomizing = state === 'customizing'

  if (staticPreview) {
    return (
      <Box
        cursor={isInteractive ? 'pointer' : 'default'}
        onClick={isInteractive ? onClick : undefined}
        position="relative"
        w={width}
      >
        <Box
          aspectRatio={PRINT_CARD_ASPECT_RATIO}
          borderRadius="24px"
          boxShadow="0 12px 28px rgba(17,16,13,0.16)"
          overflow="hidden"
          position="relative"
          w="100%"
        >
          <AppCardFront
            card={card}
            color={color}
            compactLayout={skipAutoFit}
            firstName={firstName}
            foreground={foreground}
            lastName={lastName}
            skipAutoFit={skipAutoFit}
          />
        </Box>
      </Box>
    )
  }

  return (
    <Box
      cursor={isInteractive ? 'pointer' : 'default'}
      onClick={isInteractive ? onClick : undefined}
      position="relative"
      style={{ perspective: '1200px' }}
      w={width}
    >
      <MotionBox
        animate={{
          rotateY: isSelected ? 180 : 0,
          scale: isSelected ? 1.08 : isCustomizing ? 1.03 : 1,
          y: isSelected ? -10 : isCustomizing ? -4 : 0,
        }}
        aspectRatio={PRINT_CARD_ASPECT_RATIO}
        // border={
        //   isSelected || isCustomizing
        //     ? '3px solid rgba(255,255,255,0.96)'
        //     : '1px solid rgba(255,255,255,0.55)'
        // }
        borderRadius="24px"
        boxShadow={
          isSelected
            ? '0 30px 80px rgba(17,16,13,0.32)'
            : isCustomizing
              ? '0 24px 60px rgba(17,16,13,0.24)'
              : '0 12px 28px rgba(17,16,13,0.16)'
        }
        position="relative"
        style={{ transformStyle: 'preserve-3d' }}
        transition={{
          duration: isSelected ? 0.65 : 0.35,
          ease: isSelected ? [0.2, 0.8, 0.2, 1] : 'easeOut',
        }}
        whileHover={isInteractive ? { scale: 1.02, y: -4 } : undefined}
        whileTap={isInteractive ? { scale: 0.99 } : undefined}
        w="100%"
      >
        <AppCardFace color={color} foreground={foreground}>
          <AppCardFront
            card={card}
            color={color}
            firstName={firstName}
            foreground={foreground}
            lastName={lastName}
            skipAutoFit={skipAutoFit}
          />
        </AppCardFace>
        <AppCardFace color={color} foreground={foreground} rotateY={180}>
          <AppCardBack card={card} color={color} foreground={foreground} />
        </AppCardFace>
      </MotionBox>
    </Box>
  )
}
