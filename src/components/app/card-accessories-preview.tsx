'use client'

import { Box } from '@chakra-ui/react'
import { useId } from 'react'

import { getLanyardPreviewColor, normalizeLanyardFinish } from '@/lib/lanyard-finish'
import { CardPreview } from '@/components/app/card-preview'
import { colors } from '@/lib/variations'
import type { CardDesign } from '@/types/domain'
import { ZoomPlusIcon as CardHolderIllustration } from '@/illustrations/CardHolder'
import { ZoomPlusIcon as LanyardIllustration } from '@/illustrations/Lanyard'

export function CardAccessoriesPreview(props: { card: CardDesign }) {
  const { card } = props
  const cardHolderColor = card.cardHolderColor || colors.magenta2
  const lanyardFinish = normalizeLanyardFinish(card.lanyardColor, card.lanyardFinish)
  const lanyardColor = getLanyardPreviewColor(lanyardFinish)
  const paintId = useId().replace(/:/g, '')
  const gradientStops = lanyardFinish.gradientStops?.length
    ? lanyardFinish.gradientStops
    : [
        { color: lanyardFinish.gradientFrom, offset: '0%' },
        { color: lanyardFinish.gradientTo, offset: '100%' },
      ]

  const lanyardPaint = {
    defs: (
      <defs>
        <linearGradient
          id={`${paintId}-gradient`}
          x1={lanyardFinish.gradientDirection === 'horizontal' ? '0%' : '50%'}
          x2={
            lanyardFinish.gradientDirection === 'vertical'
              ? '50%'
              : lanyardFinish.gradientDirection === 'horizontal'
                ? '100%'
                : '100%'
          }
          y1={lanyardFinish.gradientDirection === 'vertical' ? '0%' : '50%'}
          y2={
            lanyardFinish.gradientDirection === 'horizontal'
              ? '50%'
              : lanyardFinish.gradientDirection === 'vertical'
                ? '100%'
                : '100%'
          }
        >
          {gradientStops.map((stop, index) => (
            <stop
              key={`${stop.offset}-stop-${stop.color}-${index}`}
              offset={stop.offset}
              stopColor={stop.color}
            />
          ))}
        </linearGradient>
      </defs>
    ),
    paint: `url(#${paintId}-gradient)`,
  }

  return (
    <Box
      mx="auto"
      position="relative"
      className="card-container"
      filter={'drop-shadow(2px 2px 12px {colors.primary.800/40})'}
    >
      <Box
        color={lanyardColor}
        left="50%"
        pointerEvents="none"
        position="absolute"
        top="-654px"
        transform="translateX(-50%)"
        zIndex="2"
        className="lanyard-illustration-container"
      >
        <LanyardIllustration
          defs={lanyardPaint.defs}
          height="628px"
          paint={lanyardPaint.paint}
          width="336px"
        />
      </Box>
      <Box insetX={0} p={0} position="relative" zIndex="1" mb={'58px'}>
        <CardPreview
          card={card}
          cardInsetShadow="inset 0px 1px 13px 0px rgba(0,0,0,0.21)"
          cardShadow="none"
          emphasis="focused"
          showShine
        />
      </Box>
      <Box
        height="464px"
        width="286px"
        color={cardHolderColor}
        pointerEvents="none"
        position="absolute"
        zIndex="0"
        top="-15%"
        left="50%"
        transform="translateX(-50%)"
        className="illustration-container"
      >
        <CardHolderIllustration height="100%" width="100%" />
      </Box>
    </Box>
  )
}
