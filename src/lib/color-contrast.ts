export const VISIBLE_PATTERN_CONTRAST_RATIO = 3

function hexToRgb(color: string) {
  const normalized = color.trim().replace('#', '')
  const hex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((channel) => `${channel}${channel}`)
          .join('')
      : normalized

  if (!/^[\da-f]{6}$/i.test(hex)) {
    return null
  }

  return {
    blue: Number.parseInt(hex.slice(4, 6), 16),
    green: Number.parseInt(hex.slice(2, 4), 16),
    red: Number.parseInt(hex.slice(0, 2), 16),
  }
}

function getRelativeLuminance(color: string) {
  const rgb = hexToRgb(color)

  if (!rgb) {
    return null
  }

  const channels = [rgb.red, rgb.green, rgb.blue].map((channel) => {
    const value = channel / 255

    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

export function getContrastRatio(firstColor: string, secondColor: string) {
  const firstLuminance = getRelativeLuminance(firstColor)
  const secondLuminance = getRelativeLuminance(secondColor)

  if (firstLuminance === null || secondLuminance === null) {
    return 1
  }

  const lighter = Math.max(firstLuminance, secondLuminance)
  const darker = Math.min(firstLuminance, secondLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

export function getContrastingPatternColor(
  backgroundColor: string,
  candidateColors: string[],
  preferredColor?: string
) {
  if (
    preferredColor &&
    getContrastRatio(backgroundColor, preferredColor) >= VISIBLE_PATTERN_CONTRAST_RATIO
  ) {
    return preferredColor
  }

  return candidateColors.reduce((bestColor, candidateColor) =>
    getContrastRatio(backgroundColor, candidateColor) > getContrastRatio(backgroundColor, bestColor)
      ? candidateColor
      : bestColor
  )
}
