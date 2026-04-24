import { createSystem, defaultConfig, defineConfig, defineRecipe } from '@chakra-ui/react'

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

const defaultButtonRecipe = defaultConfig.theme?.recipes?.button

const buttonRecipe = defineRecipe({
  ...(defaultButtonRecipe ?? {}),
  base: {
    ...(defaultButtonRecipe?.base ?? {}),
    borderRadius: 'full',
  },
  variants: {
    ...(defaultButtonRecipe?.variants ?? {}),
    variant: {
      ...(defaultButtonRecipe?.variants?.variant ?? {}),
      solid: {
        ...(defaultButtonRecipe?.variants?.variant?.solid ?? {}),
        bg: 'primary.solid',
        color: 'primary.contrast',
        _hover: {
          bg: 'primary.600',
        },
        _expanded: {
          bg: 'primary.600',
        },
      },
    },
  },
  defaultVariants: {
    ...(defaultButtonRecipe?.defaultVariants ?? {}),
    colorPalette: 'primary' as any,
  },
})

const theme = {
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
          contrast: { value: { base: '{colors.white}', _dark: '{colors.white}' } },
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
