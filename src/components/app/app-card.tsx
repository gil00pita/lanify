'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

import { Box, Image, Stack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import { Avatar } from '@/illustrations/Avatar'
import { PATTERN_PRESET_MAP } from '@/lib/pattern-presets'
import { PRINT_CARD_ASPECT_RATIO } from '@/lib/ui-tokens'
import type { CardDesign, PatternSettings } from '@/types/domain'

const MotionBox = motion.create(Box)
const CARD_LAYOUT = {
  default: {
    infoPanelTop: '58%',
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
  cardInsetShadow?: string
  cardShadow?: string
  firstName?: string
  interactive?: boolean
  lastName?: string
  onClick?: () => void
  showShine?: boolean
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
  const { settings } = props
  const pattern = PATTERN_PRESET_MAP[settings.patternId] ?? PATTERN_PRESET_MAP['pattern-01']
  const resolvedSettings = {
    ...pattern.defaults,
    ...settings,
  }
  const cell = resolvedSettings.tileSize + resolvedSettings.gap
  const viewWidth = resolvedSettings.cols * cell
  const viewHeight = resolvedSettings.rows * cell
  const items = Array.from(
    { length: resolvedSettings.rows * resolvedSettings.cols },
    (_, index) => {
      const row = Math.floor(index / resolvedSettings.cols)
      const col = index % resolvedSettings.cols
      const baseX = col * cell
      const baseY = row * cell
      const x = baseX + (row % 2 === 1 ? resolvedSettings.offsetX : 0)
      const y = baseY + (col % 2 === 1 ? resolvedSettings.offsetY : 0)
      const isAlt = (row + col) % 2 === 1

      let localOpacity = resolvedSettings.opacity
      if (resolvedSettings.alternateOpacity) {
        const mod = (row + col) % 3
        localOpacity =
          mod === 0
            ? resolvedSettings.opacity
            : mod === 1
              ? resolvedSettings.opacity * 0.65
              : resolvedSettings.opacity * 0.35
      }

      return { col, isAlt, key: `${row}-${col}`, localOpacity, row, x, y }
    }
  )

  return (
    <svg
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      width="100%"
    >
      {items.map(({ col, isAlt, key, localOpacity, row, x, y }) => {
        const extraRotation = resolvedSettings.checkerFlip && isAlt ? 180 : 0
        const skew = `skewX(${resolvedSettings.skewX}) skewY(${resolvedSettings.skewY})`
        const translateX = pattern.id === 'pattern-02' ? -54.5 : -resolvedSettings.tileSize / 2
        const translateY = pattern.id === 'pattern-02' ? -73 : -resolvedSettings.tileSize / 2

        return (
          <g
            key={key}
            opacity={localOpacity}
            transform={`translate(${x + resolvedSettings.tileSize / 2} ${y + resolvedSettings.tileSize / 2}) rotate(${resolvedSettings.rotation + extraRotation}) ${skew} scale(${resolvedSettings.motifScale}) translate(${translateX} ${translateY})`}
          >
            {pattern.renderMotif(resolvedSettings, { col, isAlt, row })}
          </g>
        )
      })}
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
  showShine?: boolean
  skipAutoFit?: boolean
}) {
  const {
    card,
    color,
    compactLayout = false,
    firstName,
    foreground,
    lastName,
    showShine = false,
    skipAutoFit = false,
  } = props
  const layout = compactLayout ? CARD_LAYOUT.gallery : CARD_LAYOUT.default
  const [fallbackFirstLine, fallbackSecondLine] = splitNameLines(card.title)
  const firstLine = firstName ?? fallbackFirstLine
  const secondLine = lastName ?? fallbackSecondLine
  const nameContainerRef = useRef<HTMLDivElement | null>(null)
  const roleContainerRef = useRef<HTMLDivElement | null>(null)
  const firstLineRef = useRef<HTMLParagraphElement | null>(null)
  const secondLineRef = useRef<HTMLParagraphElement | null>(null)
  const roleRef = useRef<HTMLParagraphElement | null>(null)
  const [nameFontSize, setNameFontSize] = useState<number>(layout.maxNameFontSize)
  const [surnameFontSize, setSurnameFontSize] = useState<number>(layout.maxNameFontSize)
  const [roleFontSize, setRoleFontSize] = useState<number>(layout.maxRoleFontSize)
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
      {showShine ? (
        <Box
          aria-hidden="true"
          borderRadius="24px"
          className="card-shine"
          inset="0"
          overflow="hidden"
          pointerEvents="none"
          position="absolute"
          zIndex="4"
        >
          <Box
            bg="linear-gradient(112deg, transparent 0%, transparent 26%, rgba(255,255,255,0.18) 36%, rgba(255,255,255,0.78) 45%, rgba(255,255,255,0.22) 55%, transparent 70%, transparent 100%)"
            filter="blur(20px)"
            h="150%"
            left="24%"
            mixBlendMode="screen"
            opacity="0.9"
            position="absolute"
            top="-25%"
            transform="rotate(8deg)"
            w="72%"
          />
          <Box
            bg="linear-gradient(112deg, transparent 10%, rgba(255,255,255,0.32) 48%, transparent 82%)"
            h="120%"
            left="10%"
            mixBlendMode="screen"
            opacity="0.38"
            filter="blur(10px)"
            position="absolute"
            top="-10%"
            transform="rotate(8deg)"
            w="32%"
          />
        </Box>
      ) : null}
      <Box
        className="card-portrait"
        h="65%"
        insetX="0"
        overflow="hidden"
        position="absolute"
        top="0"
        transition={'background-color 0.6s ease'}
        bg={color}
      >
        <Box inset="0" opacity="0.28" position="absolute" top={0} bottom={0} left={0} right={0}>
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
        color="fg"
        left="0"
        position="absolute"
        pt={5}
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
  insetShadow?: string
  rotateY?: number
}) {
  const { children, foreground, insetShadow, rotateY = 0 } = props

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
      {insetShadow ? (
        <Box
          aria-hidden="true"
          borderRadius="inherit"
          boxShadow={insetShadow}
          inset="0"
          pointerEvents="none"
          position="absolute"
          zIndex="5"
        />
      ) : null}
    </Box>
  )
}

export function AppCard(props: AppCardProps) {
  const {
    card,
    cardInsetShadow,
    cardShadow,
    firstName,
    interactive,
    lastName,
    onClick,
    showShine = false,
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
          boxShadow={cardShadow ?? '0 12px 28px rgba(17,16,13,0.16)'}
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
            showShine={showShine}
            skipAutoFit={skipAutoFit}
          />
          {cardInsetShadow ? (
            <Box
              aria-hidden="true"
              borderRadius="inherit"
              boxShadow={cardInsetShadow}
              inset="0"
              pointerEvents="none"
              position="absolute"
              zIndex="5"
            />
          ) : null}
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
          cardShadow ??
          (isSelected
            ? '0 30px 80px rgba(17,16,13,0.32)'
            : isCustomizing
              ? '0 24px 60px rgba(17,16,13,0.24)'
              : '0 12px 28px rgba(17,16,13,0.16)')
        }
        border="1px solid #0000003b"
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
        <AppCardFace color={color} foreground={foreground} insetShadow={cardInsetShadow}>
          <AppCardFront
            card={card}
            color={color}
            firstName={firstName}
            foreground={foreground}
            lastName={lastName}
            showShine={showShine}
            skipAutoFit={skipAutoFit}
          />
        </AppCardFace>
        <AppCardFace
          color={color}
          foreground={foreground}
          insetShadow={cardInsetShadow}
          rotateY={180}
        >
          <AppCardBack card={card} color={color} foreground={foreground} />
        </AppCardFace>
      </MotionBox>
    </Box>
  )
}
