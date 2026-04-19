'use client'

import { themeSystem } from '@/theme'
import { ChakraProvider } from '@chakra-ui/react'

export function Provider(props: { children: React.ReactNode }) {
  return <ChakraProvider value={themeSystem}>{props.children}</ChakraProvider>
}
