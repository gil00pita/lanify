'use client'

import { useEffect } from 'react'

import { Box, Spinner, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { useHydrated } from '@/components/app/use-hydrated'
import { useAppStore } from '@/store/app-store'

export function RedirectGate() {
  const hydrated = useHydrated()
  const router = useRouter()
  const auth = useAppStore((state) => state.auth)

  useEffect(() => {
    if (!hydrated) {
      return
    }

    if (!auth.isAuthenticated) {
      router.replace('/login')
      return
    }

    router.replace('/wizard')
  }, [auth.isAuthenticated, hydrated, router])

  return (
    <Box display="grid" minH="100vh" placeItems="center">
      <VStack bg="rgba(255,255,255,0.72)" borderRadius="24px" p="8">
        <Spinner color="var(--lanyard-accent)" size="xl" />
        <Text fontWeight="600">Preparing your card workspace…</Text>
      </VStack>
    </Box>
  )
}
