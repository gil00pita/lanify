import type { ReactNode } from 'react'

import type { PatternSettings } from '@/types/domain'
import { Pattern02 } from '@/illustrations/Pattern-02'
import { Pattern01 } from '@/illustrations/Pattern-01'

export type PatternPresetId = 'pattern-01' | 'pattern-02'

type PatternPreset = {
  controls: {
    alternateOpacity: boolean
    background: boolean
    checkerFlip: boolean
    cols: boolean
    fill: boolean
    gap: boolean
    motifScale: boolean
    offsetX: boolean
    offsetY: boolean
    opacity: boolean
    rotation: boolean
    rows: boolean
    skewX: boolean
    skewY: boolean
    stroke: boolean
    strokeWidth: boolean
    tileSize: boolean
  }
  defaults: Pick<
    PatternSettings,
    | 'alternateOpacity'
    | 'background'
    | 'checkerFlip'
    | 'cols'
    | 'fill'
    | 'gap'
    | 'motifScale'
    | 'offsetX'
    | 'offsetY'
    | 'opacity'
    | 'rotation'
    | 'rows'
    | 'skewX'
    | 'skewY'
    | 'stroke'
    | 'strokeWidth'
    | 'tileSize'
  >
  id: PatternPresetId
  name: string
  renderMotif: (
    settings: PatternSettings,
    context?: { col: number; isAlt: boolean; row: number }
  ) => ReactNode
}

export const PATTERN_PRESETS: PatternPreset[] = [
  {
    id: 'pattern-01',
    name: 'Pattern 1',
    image: <Pattern01 />,
    defaults: {
      tileSize: 42,
      motifScale: 1,
      rotation: 0,
      fill: '#6337E1',
      stroke: '#111111',
      strokeWidth: 0,
      opacity: 1,
      gap: 0,
      rows: 8,
      cols: 8,
      background: '#FFFFFF',
      alternateOpacity: true,
      offsetX: 0,
      offsetY: 0,
      skewX: 0,
      skewY: 0,
      checkerFlip: false,
    },
    controls: {
      tileSize: true,
      motifScale: true,
      rotation: true,
      fill: true,
      stroke: true,
      strokeWidth: true,
      opacity: true,
      gap: true,
      rows: true,
      cols: true,
      background: true,
      alternateOpacity: true,
      offsetX: true,
      offsetY: false,
      skewX: false,
      skewY: false,
      checkerFlip: false,
    },
    renderMotif: (settings) => (
      <path
        d="M5 5H31V31H21V15H5Z"
        fill={settings.fill}
        stroke={settings.strokeWidth > 0 ? settings.stroke : 'none'}
        strokeWidth={settings.strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    ),
  },
  {
    id: 'pattern-02',
    name: 'Pattern 2',
    image: <Pattern02 />,
    defaults: {
      tileSize: 109,
      motifScale: 1,
      rotation: 0,
      fill: '#EFF0F3',
      stroke: '#EAEBEC',
      strokeWidth: 0,
      opacity: 1,
      gap: 0,
      rows: 3,
      cols: 4,
      background: '#FFFFFF',
      alternateOpacity: false,
      offsetX: 54.5,
      offsetY: 0,
      skewX: 0,
      skewY: 0,
      checkerFlip: false,
    },
    controls: {
      tileSize: true,
      motifScale: true,
      rotation: true,
      fill: true,
      stroke: true,
      strokeWidth: false,
      opacity: true,
      gap: true,
      rows: true,
      cols: true,
      background: true,
      alternateOpacity: false,
      offsetX: true,
      offsetY: false,
      skewX: false,
      skewY: false,
      checkerFlip: false,
    },
    renderMotif: (settings) => (
      <g>
        <path
          d="M71.9629 62.8233L107.824 41.7666L107.853 123.494L71.9687 144.515L71.9629 62.8233Z"
          fill={settings.fill}
        />
        <path
          d="M107.244 42.7913L107.263 123.16L72.5524 143.491V63.1574L107.244 42.7913ZM107.827 41.1768C107.723 41.1768 107.618 41.2042 107.525 41.2587L71.6672 62.3093C71.485 62.4164 71.373 62.6122 71.373 62.8232V144.509C71.373 144.723 71.4872 144.92 71.6727 145.026C71.7643 145.079 71.8666 145.105 71.9689 145.105C72.0731 145.105 72.1773 145.077 72.2698 145.023L108.148 124.009C108.331 123.902 108.442 123.706 108.442 123.495L108.423 41.7723C108.423 41.5587 108.308 41.3613 108.123 41.2555C108.031 41.2029 107.929 41.1768 107.827 41.1768Z"
          fill={settings.stroke}
        />
        <path
          d="M108.368 41.999C108.384 41.9604 108.399 41.9232 108.407 41.8821C108.414 41.8443 108.414 41.8081 108.414 41.7701C108.414 41.732 108.414 41.6955 108.406 41.6575C108.398 41.6168 108.383 41.5801 108.366 41.542C108.356 41.5184 108.355 41.4931 108.342 41.4704C108.336 41.4602 108.326 41.4547 108.319 41.4451C108.297 41.4122 108.269 41.3856 108.24 41.3572C108.211 41.3284 108.184 41.2999 108.151 41.2781C108.141 41.2718 108.136 41.2618 108.126 41.256L36.7516 0.0800187C36.5663 -0.027643 36.337 -0.0264681 36.1522 0.0823575L0.294182 21.1331C0.281379 21.1407 0.27177 21.1518 0.259695 21.16C0.244564 21.1704 0.231038 21.1816 0.21678 21.1935C0.163822 21.2379 0.11654 21.2878 0.0820588 21.3467C0.0814768 21.3477 0.080312 21.3483 0.0797301 21.3493C0.0798756 21.3492 0.0795846 21.3496 0.0797301 21.3493C0.0451037 21.4097 0.0250252 21.4779 0.0130951 21.5476C0.0100399 21.5652 0.00756965 21.5819 0.00626026 21.5997C0.00495086 21.6157 0 21.6308 0 21.647V62.3064C0 62.5194 0.113775 62.7162 0.298254 62.8227L35.5528 83.1611V123.968C35.5528 124.181 35.6666 124.378 35.8511 124.485L71.6722 145.15C71.7641 145.203 71.8671 145.23 71.9698 145.23C72.0728 145.23 72.1755 145.203 72.2678 145.15C72.4523 145.043 72.5657 144.847 72.5657 144.634V63.1641L108.13 42.286C108.14 42.2799 108.145 42.2697 108.155 42.2632C108.188 42.2415 108.214 42.2133 108.242 42.1851C108.271 42.156 108.3 42.1286 108.322 42.095C108.328 42.0854 108.338 42.08 108.344 42.0698C108.357 42.0473 108.358 42.0223 108.368 41.999ZM36.4566 1.28584L106.643 41.7767L71.9672 62.1333L1.78079 21.6426L36.4566 1.28584ZM36.7447 123.624V82.8169C36.7447 82.6039 36.6309 82.4072 36.4464 82.3007L1.19185 61.9622V22.6787L71.3739 63.167V143.602L36.7447 123.624Z"
          fill={settings.stroke}
        />
      </g>
    ),
  },
]

export const PATTERN_PRESET_MAP = Object.fromEntries(
  PATTERN_PRESETS.map((pattern) => [pattern.id, pattern])
) as Record<PatternPresetId, PatternPreset>

export function getDefaultPatternSettings(patternId: PatternPresetId) {
  return { patternId, ...PATTERN_PRESET_MAP[patternId].defaults }
}
