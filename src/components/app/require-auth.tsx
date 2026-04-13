'use client'

import { useEffect } from 'react'

import { Box, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { useHydrated } from '@/components/app/use-hydrated'
import { useAppStore } from '@/store/app-store'

export function RequireAuth(props: { children: React.ReactNode }) {
  const hydrated = useHydrated()
  const auth = useAppStore((state) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (hydrated && !auth.isAuthenticated) {
      router.replace('/login')
    }
  }, [auth.isAuthenticated, hydrated, router])

  if (!hydrated || !auth.isAuthenticated) {
    return (
      <Box display="grid" minH="100vh" placeItems="center">
        <Spinner />
      </Box>
    )
  }

  return <>{props.children}</>
}
