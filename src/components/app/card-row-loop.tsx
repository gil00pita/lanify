'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Box, Image, Link, chakra } from '@chakra-ui/react'

export type CardItem =
  | {
      node: React.ReactNode
      href?: string
      title?: string
      ariaLabel?: string
    }
  | {
      src: string
      alt?: string
      href?: string
      title?: string
      srcSet?: string
      sizes?: string
      width?: number
      height?: number
    }

export interface CardRowLoopProps {
  items: CardItem[]
  speed?: number
  direction?: 'left' | 'right' | 'up' | 'down'
  width?: number | string
  logoHeight?: number
  gap?: number
  edgePadding?: number
  freeze?: boolean
  freezeDurationMs?: number
  pauseOnHover?: boolean
  hoverSpeed?: number
  fadeOut?: boolean
  fadeOutColor?: string
  preserveHoverSpacing?: boolean
  scaleOnHover?: boolean
  renderItem?: (item: CardItem, key: React.Key) => React.ReactNode
  ariaLabel?: string
  className?: string
  onMotionReady?: () => void
  style?: React.CSSProperties
}

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  FREEZE_EASING_DIVISOR: 4.6,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
  VELOCITY_EPSILON: 0.5,
} as const

const toCssLength = (value?: number | string): string | undefined =>
  typeof value === 'number' ? `${value}px` : (value ?? undefined)

const useResizeObserver = (
  callback: () => void,
  elements: Array<React.RefObject<Element | null>>,
  dependencies: React.DependencyList
) => {
  useEffect(() => {
    if (!window.ResizeObserver) {
      const handleResize = () => callback()
      window.addEventListener('resize', handleResize)
      callback()
      return () => window.removeEventListener('resize', handleResize)
    }

    const observers = elements.map((ref) => {
      if (!ref.current) return null
      const observer = new ResizeObserver(callback)
      observer.observe(ref.current)
      return observer
    })

    callback()

    return () => {
      observers.forEach((observer) => observer?.disconnect())
    }
  }, dependencies)
}

const useImageLoader = (
  seqRef: React.RefObject<HTMLUListElement | null>,
  onLoad: () => void,
  dependencies: React.DependencyList
) => {
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll('img') ?? []

    if (images.length === 0) {
      onLoad()
      return
    }

    let remainingImages = images.length
    const handleImageLoad = () => {
      remainingImages -= 1
      if (remainingImages === 0) {
        onLoad()
      }
    }

    images.forEach((img) => {
      const htmlImg = img as HTMLImageElement
      if (htmlImg.complete) {
        handleImageLoad()
      } else {
        htmlImg.addEventListener('load', handleImageLoad, { once: true })
        htmlImg.addEventListener('error', handleImageLoad, { once: true })
      }
    })

    return () => {
      images.forEach((img) => {
        img.removeEventListener('load', handleImageLoad)
        img.removeEventListener('error', handleImageLoad)
      })
    }
  }, dependencies)
}

const useAnimationActivity = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const [isInViewport, setIsInViewport] = useState(true)
  const [isDocumentVisible, setIsDocumentVisible] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') return undefined

    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === 'visible')
    }

    handleVisibilityChange()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }

    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)

    return () => {
      mediaQuery.removeEventListener('change', updatePreference)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    if (!window.IntersectionObserver) {
      setIsInViewport(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry?.isIntersecting ?? false)
      },
      {
        root: null,
        rootMargin: '200px 0px',
      }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [containerRef])

  return isInViewport && isDocumentVisible && !prefersReducedMotion
}

const useAnimationLoop = (
  trackRef: React.RefObject<HTMLDivElement | null>,
  targetVelocity: number,
  seqWidth: number,
  seqHeight: number,
  isHovered: boolean,
  hoverSpeed: number | undefined,
  isVertical: boolean,
  shouldAnimate: boolean,
  freeze: boolean,
  freezeDurationMs: number
) => {
  const rafRef = useRef<number | null>(null)
  const lastTimestampRef = useRef<number | null>(null)
  const offsetRef = useRef(0)
  const velocityRef = useRef(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const seqSize = isVertical ? seqHeight : seqWidth

    if (seqSize > 0) {
      offsetRef.current = ((offsetRef.current % seqSize) + seqSize) % seqSize
      const transformValue = isVertical
        ? `translate3d(0, ${-offsetRef.current}px, 0)`
        : `translate3d(${-offsetRef.current}px, 0, 0)`
      track.style.transform = transformValue
    }

    if (!shouldAnimate || seqSize <= 0) {
      return () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }
        lastTimestampRef.current = null
      }
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp
      }

      const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000
      lastTimestampRef.current = timestamp

      const target = freeze ? 0 : isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVelocity
      const smoothTau =
        freeze && freezeDurationMs > 0
          ? freezeDurationMs / 1000 / ANIMATION_CONFIG.FREEZE_EASING_DIVISOR
          : ANIMATION_CONFIG.SMOOTH_TAU
      const easingFactor = 1 - Math.exp(-deltaTime / smoothTau)
      velocityRef.current += (target - velocityRef.current) * easingFactor

      if (seqSize > 0) {
        let nextOffset = offsetRef.current + velocityRef.current * deltaTime
        nextOffset = ((nextOffset % seqSize) + seqSize) % seqSize
        offsetRef.current = nextOffset

        const transformValue = isVertical
          ? `translate3d(0, ${-offsetRef.current}px, 0)`
          : `translate3d(${-offsetRef.current}px, 0, 0)`
        track.style.transform = transformValue
      }

      if (
        Math.abs(target) < ANIMATION_CONFIG.VELOCITY_EPSILON &&
        Math.abs(velocityRef.current) < ANIMATION_CONFIG.VELOCITY_EPSILON
      ) {
        velocityRef.current = 0
        rafRef.current = null
        lastTimestampRef.current = null
        return
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      lastTimestampRef.current = null
    }
  }, [targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical, shouldAnimate, freeze, freezeDurationMs])
}

export const CardRowLoop = React.memo<CardRowLoopProps>(
  ({
    items,
    speed = 120,
    direction = 'left',
    width = '100%',
    logoHeight = 28,
    gap = 32,
    edgePadding = 0,
    freeze = false,
    freezeDurationMs = 0,
    pauseOnHover,
    hoverSpeed,
    fadeOut = false,
    fadeOutColor,
    preserveHoverSpacing = false,
    scaleOnHover = false,
    renderItem,
    ariaLabel = 'Card items',
    className,
    onMotionReady,
    style,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    const seqRef = useRef<HTMLUListElement>(null)

    const [seqWidth, setSeqWidth] = useState<number>(0)
    const [seqHeight, setSeqHeight] = useState<number>(0)
    const [copyCount, setCopyCount] = useState<number>(ANIMATION_CONFIG.MIN_COPIES)
    const [isHovered, setIsHovered] = useState<boolean>(false)
    const hasReportedMotionReadyRef = useRef(false)

    const effectiveHoverSpeed = useMemo(() => {
      if (hoverSpeed !== undefined) return hoverSpeed
      if (pauseOnHover === true) return 0
      if (pauseOnHover === false) return undefined
      return 0
    }, [hoverSpeed, pauseOnHover])

    const isVertical = direction === 'up' || direction === 'down'

    const targetVelocity = useMemo(() => {
      const magnitude = Math.abs(speed)
      let directionMultiplier: number
      if (isVertical) {
        directionMultiplier = direction === 'up' ? 1 : -1
      } else {
        directionMultiplier = direction === 'left' ? 1 : -1
      }
      const speedMultiplier = speed < 0 ? -1 : 1
      return magnitude * directionMultiplier * speedMultiplier
    }, [speed, direction, isVertical])

    const shouldAnimate = useAnimationActivity(containerRef)

    const updateDimensions = useCallback(() => {
      const containerWidth = containerRef.current?.clientWidth ?? 0
      const sequenceRect = seqRef.current?.getBoundingClientRect?.()
      const sequenceWidth = sequenceRect?.width ?? 0
      const sequenceHeight = sequenceRect?.height ?? 0

      if (isVertical) {
        const parentHeight = containerRef.current?.parentElement?.clientHeight ?? 0
        if (containerRef.current && parentHeight > 0) {
          const targetHeight = Math.ceil(parentHeight)
          if (containerRef.current.style.height !== `${targetHeight}px`) {
            containerRef.current.style.height = `${targetHeight}px`
          }
        }

        if (sequenceHeight > 0) {
          setSeqHeight(Math.ceil(sequenceHeight))
          const viewport = containerRef.current?.clientHeight ?? parentHeight ?? sequenceHeight
          const copiesNeeded = Math.ceil(viewport / sequenceHeight) + ANIMATION_CONFIG.COPY_HEADROOM
          setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded))
        }
      } else if (sequenceWidth > 0) {
        setSeqWidth(Math.ceil(sequenceWidth))
        const copiesNeeded =
          Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM
        setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded))
      }
    }, [isVertical])

    useResizeObserver(
      updateDimensions,
      [containerRef, seqRef],
      [items, gap, logoHeight, isVertical]
    )

    useImageLoader(seqRef, updateDimensions, [items, gap, logoHeight, isVertical])

    useAnimationLoop(
      trackRef,
      targetVelocity,
      seqWidth,
      seqHeight,
      isHovered,
      effectiveHoverSpeed,
      isVertical,
      shouldAnimate,
      freeze,
      freezeDurationMs
    )

    useEffect(() => {
      const sequenceSize = isVertical ? seqHeight : seqWidth

      if (freeze) {
        hasReportedMotionReadyRef.current = false
        return
      }

      if (!shouldAnimate || sequenceSize <= 0 || hasReportedMotionReadyRef.current) {
        return
      }

      hasReportedMotionReadyRef.current = true
      onMotionReady?.()
    }, [freeze, isVertical, onMotionReady, seqHeight, seqWidth, shouldAnimate])

    const fadeStyles = useMemo(() => {
      if (!fadeOut) return undefined

      const fadeColorLight = fadeOutColor ?? '#ffffff'
      const fadeColorDark = fadeOutColor ?? '#0b0b0b'

      if (isVertical) {
        return {
          _before: {
            bgGradient: `linear(to-b, ${fadeColorLight} 0%, rgba(0, 0, 0, 0) 100%)`,
            bottom: 'auto',
            content: '""',
            h: 'clamp(24px, 8%, 120px)',
            insetInline: 0,
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
            zIndex: 10,
            _osDark: {
              bgGradient: `linear(to-b, ${fadeColorDark} 0%, rgba(0, 0, 0, 0) 100%)`,
            },
          },
          _after: {
            bgGradient: `linear(to-t, ${fadeColorLight} 0%, rgba(0, 0, 0, 0) 100%)`,
            bottom: 0,
            content: '""',
            h: 'clamp(24px, 8%, 120px)',
            insetInline: 0,
            pointerEvents: 'none',
            position: 'absolute',
            top: 'auto',
            zIndex: 10,
            _osDark: {
              bgGradient: `linear(to-t, ${fadeColorDark} 0%, rgba(0, 0, 0, 0) 100%)`,
            },
          },
        } as const
      }

      return {
        _before: {
          bgGradient: `linear(to-r, ${fadeColorLight} 0%, rgba(0, 0, 0, 0) 100%)`,
          bottom: 0,
          content: '""',
          left: 0,
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          w: 'clamp(24px, 8%, 120px)',
          zIndex: 10,
          _osDark: {
            bgGradient: `linear(to-r, ${fadeColorDark} 0%, rgba(0, 0, 0, 0) 100%)`,
          },
        },
        _after: {
          bgGradient: `linear(to-l, ${fadeColorLight} 0%, rgba(0, 0, 0, 0) 100%)`,
          bottom: 0,
          content: '""',
          pointerEvents: 'none',
          position: 'absolute',
          right: 0,
          top: 0,
          w: 'clamp(24px, 8%, 120px)',
          zIndex: 10,
          _osDark: {
            bgGradient: `linear(to-l, ${fadeColorDark} 0%, rgba(0, 0, 0, 0) 100%)`,
          },
        },
      } as const
    }, [fadeOut, fadeOutColor, isVertical])

    const handleMouseEnter = useCallback(() => {
      if (effectiveHoverSpeed !== undefined) setIsHovered(true)
    }, [effectiveHoverSpeed])

    const handleMouseLeave = useCallback(() => {
      if (effectiveHoverSpeed !== undefined) setIsHovered(false)
    }, [effectiveHoverSpeed])

    const renderLoopItem = useCallback(
      (item: CardItem, key: React.Key) => {
        if (renderItem) {
          return (
            <Box
              as="li"
              key={key}
              flex="0 0 auto"
              fontSize={`${logoHeight}px`}
              lineHeight="1"
              mb={isVertical ? `${gap}px` : 0}
              mr={isVertical ? 0 : `${gap}px`}
              overflow={scaleOnHover ? 'visible' : 'hidden'}
              role="listitem"
            >
              {renderItem(item, key)}
            </Box>
          )
        }

        const isNodeItem = 'node' in item
        const nodeContent = isNodeItem ? (
          <chakra.span
            alignItems="center"
            aria-hidden={!!item.href && !item.ariaLabel}
            className="card-row-loop__node"
            display="inline-flex"
            transition={scaleOnHover ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : undefined}
          >
            {item.node}
          </chakra.span>
        ) : (
          <Image
            alt={item.alt ?? ''}
            className="card-row-loop__image"
            decoding="async"
            display="block"
            draggable={false}
            h={`${logoHeight}px`}
            htmlHeight={item.height}
            htmlWidth={item.width}
            imageRendering="-webkit-optimize-contrast"
            loading="lazy"
            objectFit="contain"
            pointerEvents="none"
            src={item.src}
            srcSet={item.srcSet}
            sizes={item.sizes}
            title={item.title}
            transition={scaleOnHover ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : undefined}
            userSelect="none"
            w="auto"
            css={{
              WebkitUserDrag: 'none',
            }}
          />
        )

        const itemAriaLabel = isNodeItem ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title)

        const itemContent = item.href ? (
          <Link
            alignItems="center"
            aria-label={itemAriaLabel || 'logo link'}
            borderRadius="4px"
            display="inline-flex"
            href={item.href}
            rel="noreferrer noopener"
            target="_blank"
            textDecoration="none"
            transition="opacity 0.2s ease"
            _hover={{ opacity: 0.8 }}
            _focusVisible={{
              outline: '2px solid currentColor',
              outlineOffset: '2px',
            }}
          >
            {nodeContent}
          </Link>
        ) : (
          nodeContent
        )

        return (
          <Box
            as="li"
            key={key}
            flex="0 0 auto"
            fontSize={`${logoHeight}px`}
            lineHeight="1"
            mb={isVertical ? `${gap}px` : 0}
            mr={isVertical ? 0 : `${gap}px`}
            overflow={scaleOnHover ? 'visible' : 'hidden'}
            role="listitem"
            css={
              scaleOnHover
                ? {
                    '&:hover .card-row-loop__image, &:hover .card-row-loop__node': {
                      transform: 'scale(1.05)',
                      transformOrigin: 'center center',
                    },
                  }
                : undefined
            }
          >
            {itemContent}
          </Box>
        )
      },
      [renderItem, logoHeight, isVertical, gap, scaleOnHover]
    )

    const logoLists = useMemo(
      () =>
        Array.from({ length: copyCount }, (_, copyIndex) => (
          <Box
            as="ul"
            alignItems="center"
            aria-hidden={copyIndex > 0}
            display="flex"
            flexDirection={isVertical ? 'column' : 'row'}
            key={`copy-${copyIndex}`}
            listStyle="none"
            m="0"
            p="0"
            pointerEvents="auto"
            ref={copyIndex === 0 ? seqRef : undefined}
            role="list"
          >
            {items.map((item, itemIndex) => renderLoopItem(item, `${copyIndex}-${itemIndex}`))}
          </Box>
        )),
      [copyCount, isVertical, items, renderLoopItem]
    )

    const containerStyle = useMemo(
      (): React.CSSProperties => ({
        width: isVertical
          ? toCssLength(width) === '100%'
            ? undefined
            : toCssLength(width)
          : (toCssLength(width) ?? '100%'),
        ...style,
      }),
      [width, style, isVertical]
    )

    const viewportPadding = `${edgePadding}px`
    const shouldReserveHoverSpacing = scaleOnHover || preserveHoverSpacing

    return (
      <Box
        ref={containerRef}
        aria-label={ariaLabel}
        className={className}
        boxSizing="border-box"
        display={isVertical ? 'inline-block' : 'block'}
        overflowX="clip"
        overflowY="visible"
        px={isVertical ? 0 : viewportPadding}
        pb={shouldReserveHoverSpacing ? `calc(${logoHeight}px * 0.1 + 40px)` : 0}
        position="relative"
        pt={shouldReserveHoverSpacing ? `calc(${logoHeight}px * 0.1 + 10px)` : 0}
        role="region"
        style={containerStyle}
        {...fadeStyles}
      >
        <Box
          ref={trackRef}
          display="flex"
          flexDirection={isVertical ? 'column' : 'row'}
          h={isVertical ? 'max-content' : undefined}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          position="relative"
          userSelect="none"
          w={isVertical ? '100%' : 'max-content'}
          willChange="transform"
          zIndex={0}
          css={{
            '@media (prefers-reduced-motion: reduce)': {
              ...(scaleOnHover
                ? {
                    '& .card-row-loop__image, & .card-row-loop__node': {
                      transition: 'none !important',
                    },
                  }
                : {}),
              transform: 'translate3d(0, 0, 0) !important',
            },
          }}
        >
          {logoLists}
        </Box>
      </Box>
    )
  }
)

CardRowLoop.displayName = 'CardRowLoop'

export default CardRowLoop
