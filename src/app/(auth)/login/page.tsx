'use client'

import { useEffect, useState } from 'react'

import { Box, Button, Input, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { useHydrated } from '@/components/app/use-hydrated'
import { useAppStore } from '@/store/app-store'

export default function LoginPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const login = useAppStore((state) => state.login)
  const auth = useAppStore((state) => state.auth)
  const [email, setEmail] = useState('member@lanyard.app')
  const [password, setPassword] = useState('password')

  useEffect(() => {
    if (hydrated && auth.isAuthenticated) {
      router.replace('/wizard')
    }
  }, [auth.isAuthenticated, hydrated, router])

  return (
    <Box display="grid" minH="100vh" placeItems="center" px="4">
      <Stack
        bg="rgba(255,255,255,0.76)"
        border="1px solid rgba(255,255,255,0.72)"
        borderRadius="32px"
        boxShadow="0 28px 80px rgba(74, 59, 34, 0.18)"
        maxW="520px"
        p={{ base: '6', lg: '10' }}
        w="full"
      >
        <Text fontSize="xs" fontWeight="700" letterSpacing="0.22em" textTransform="uppercase">
          Welcome back
        </Text>
        <Text fontSize={{ base: '3xl', lg: '5xl' }} fontWeight="700" lineHeight="1">
          Design premium lanyard cards in minutes
        </Text>
        <Text color="var(--lanyard-muted)">
          Mock auth is active for now. Any valid-looking login will take you straight into the
          card creation wizard.
        </Text>
        <Box>
          <Text fontWeight="600" mb="2">
            Email
          </Text>
          <Input onChange={(event) => setEmail(event.target.value)} value={email} />
        </Box>
        <Box>
          <Text fontWeight="600" mb="2">
            Password
          </Text>
          <Input
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </Box>
        <Button
          onClick={() => {
            login(email)
            router.push('/wizard')
          }}
          size="lg"
        >
          Continue
        </Button>
      </Stack>
    </Box>
  )
}
