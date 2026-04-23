/** Reusable style objects for Chakra UI components */

export const PRINT_CARD_WIDTH_MM = 52
export const PRINT_CARD_HEIGHT_MM = 84
export const PRINT_CARD_ASPECT_RATIO = PRINT_CARD_WIDTH_MM / PRINT_CARD_HEIGHT_MM

export const frostedGlass = {
  backdropFilter: 'blur(24px)',
  bg: 'linear-gradient(135deg, rgb(229 220 247 / 86%) 0%, rgba(255, 255, 255, 0.78) 38%, rgba(255, 255, 255, 0.72) 100%)',
  boxShadow: '0 30px 90px rgba(30,27,22,0.16)',
} as const
