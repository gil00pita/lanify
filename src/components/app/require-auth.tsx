'use client'

import { useEffect } from 'react'

import { Box, Spinner } from '@chakra-ui/react'
import { usePathname, useRouter } from 'next/navigation'

import { useHydrated } from '@/components/app/use-hydrated'
import { useAppStore } from '@/store/app-store'

export function RequireAuth(props: { children: React.ReactNode }) {
  const hydrated = useHydrated()
  const auth = useAppStore((state) => state.auth)
  const profile = useAppStore((state) => state.profile)
  const pathname = usePathname()
  const router = useRouter()
  const hasProfileImage = Boolean(profile.avatarTransparentUrl ?? profile.avatarUrl)

  useEffect(() => {
    if (!hydrated) {
      return
    }

    if (!auth.isAuthenticated) {
      router.replace('/login')
      return
    }

    if (!hasProfileImage && pathname !== '/wizard') {
      router.replace('/wizard')
    }
  }, [auth.isAuthenticated, hasProfileImage, hydrated, pathname, router])

  if (!hydrated || !auth.isAuthenticated) {
    return (
      <Box display="grid" minH="100vh" placeItems="center">
        <Spinner />
      </Box>
    )
  }

  if (!hasProfileImage && pathname !== '/wizard') {
    return (
      <Box display="grid" minH="100vh" placeItems="center">
        <Spinner />
      </Box>
    )
  }

  return <>{props.children}</>
}
