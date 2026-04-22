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
  const cardHolderColor = card.cardHolderColor || colors.gray6
  const lanyardFinish = normalizeLanyardFinish(card.lanyardColor, card.lanyardFinish)
  const lanyardColor = getLanyardPreviewColor(lanyardFinish)
  const paintId = useId().replace(/:/g, '')

  const lanyardPaint =
    lanyardFinish.mode === 'gradient'
      ? {
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
                <stop offset="0%" stopColor={lanyardFinish.gradientFrom} />
                <stop offset="100%" stopColor={lanyardFinish.gradientTo} />
              </linearGradient>
            </defs>
          ),
          paint: `url(#${paintId}-gradient)`,
        }
      : lanyardFinish.mode === 'pattern'
        ? {
            defs: (
              <defs>
                <pattern
                  height="18"
                  id={`${paintId}-pattern`}
                  patternUnits="userSpaceOnUse"
                  width="18"
                >
                  <rect fill={lanyardFinish.patternBase} height="18" width="18" />
                  {lanyardFinish.patternStyle === 'stripes' ? (
                    <>
                      <path
                        d="M-4 18L18 -4"
                        stroke={lanyardFinish.patternAccent}
                        strokeWidth="4"
                      />
                      <path
                        d="M4 22L22 4"
                        stroke={lanyardFinish.patternAccent}
                        strokeWidth="4"
                      />
                    </>
                  ) : null}
                  {lanyardFinish.patternStyle === 'dots' ? (
                    <>
                      <circle cx="4.5" cy="4.5" fill={lanyardFinish.patternAccent} r="2.2" />
                      <circle cx="13.5" cy="13.5" fill={lanyardFinish.patternAccent} r="2.2" />
                    </>
                  ) : null}
                  {lanyardFinish.patternStyle === 'checker' ? (
                    <>
                      <rect fill={lanyardFinish.patternAccent} height="9" width="9" x="0" y="0" />
                      <rect fill={lanyardFinish.patternAccent} height="9" width="9" x="9" y="9" />
                    </>
                  ) : null}
                </pattern>
              </defs>
            ),
            paint: `url(#${paintId}-pattern)`,
          }
        : {
            defs: undefined,
            paint: lanyardFinish.solidColor,
          }

  return (
    <Box mx="auto" position="relative" className="card-container">
      <Box
        color={lanyardColor}
        left="50%"
        pointerEvents="none"
        position="absolute"
        top="-354px"
        transform="translateX(-50%)"
        zIndex="2"
        className="lanyard-illustration-container"
        filter={'drop-shadow(2px 2px 12px {colors.gray.800/50})'}
      >
        <LanyardIllustration
          defs={lanyardPaint.defs}
          height="328px"
          paint={lanyardPaint.paint}
          width="336px"
        />
      </Box>
      <Box insetX={0} p={0} position="relative" zIndex="1">
        <CardPreview card={card} emphasis="focused" boxShadow="none" />
      </Box>
      <Box
        height="464px"
        width="286px"
        top="50px"
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
