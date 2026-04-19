import { createSystem, defaultConfig, defineConfig, defineRecipe } from '@chakra-ui/react'

export const CGIcolors = {
  brandPurple: '#5236AB',
  brandRed: '#E31937',
  commonBlack: '#000000',
  commonWhite: '#FFFFFF',
  dataShadesGreen: '#128354',
  dataShadesRed: '#B00020',
  dataShadesYellow: '#F1A425',
  gray1: '#EEEEEE',
  gray2: '#CCCCCC',
  gray3: '#999999',
  gray4: '#777777',
  gray5: '#555555',
  gray6: '#333333',
  gray7: '#000000',
  magenta1: '#CB7CA3',
  magenta2: '#A82465',
  magenta3: '#7E1B4C',
  purple1: '#E6E3F3',
  purple2: '#CBC3E6',
  purple3: '#BFB5F9',
  purple4: '#9E83F5',
  purple5: '#6E3FED',
  purple6: '#5236AB',
  purple7: '#200A58',
  red1: '#FFCDD2',
  red2: '#FF978A',
  red3: '#FF7362',
  red4: '#FF6A00',
  red5: '#E31937',
  red6: '#991F3D',
  red7: '#650A21',
}

const colors = {
  primary: {
    50: { value: '#e3ddf7' },
    100: { value: '#c7baee' },
    200: { value: '#ae9ee4' },
    300: { value: '#8f75db' },
    400: { value: '#6040c3' },
    500: { value: '#5236ab' },
    600: { value: '#483096' },
    700: { value: '#3b277b' },
    800: { value: '#2e1e60' },
    900: { value: '#211644' },
    950: { value: '#140d2a' },
  },
}

const buttonRecipe = defineRecipe({
  defaultVariants: {
    colorPalette: 'primary',
    rounded: 'full',
  },
})

export const theme = {
  preflight: true,
  cssVarsPrefix: 'lanify', // changes --chakra-* to --lanify-*
  globalCss: {
    body: {
      bg: 'bg',
      color: 'fg',
    },
  },
  theme: {
    tokens: {
      colors: {
        ...colors,
      },
    },
    semanticTokens: {
      colors: {
        primary: {
          solid: { value: { base: '{colors.primary.500}', _dark: '{colors.primary.500}' } },
          contrast: { value: { base: '{colors.primary.50}', _dark: '{colors.primary.50}' } },
          fg: { value: { base: '{colors.primary.700}', _dark: '{colors.primary.300}' } },
          muted: { value: { base: '{colors.primary.100}', _dark: '{colors.primary.900}' } },
          subtle: { value: { base: '{colors.primary.200}', _dark: '{colors.primary.800}' } },
          emphasized: { value: { base: '{colors.primary.300}', _dark: '{colors.primary.700}' } },
          focusRing: { value: { base: '{colors.primary.500}', _dark: '{colors.primary.600}' } },
        },
      },
    },
    recipes: {
      button: buttonRecipe,
    },
  },
}

const themeConfig = defineConfig(theme)

export const themeSystem = createSystem(defaultConfig, themeConfig)
