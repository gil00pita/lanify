'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { Box, Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'

import { useAppStore } from '@/store/app-store'

const MotionBox = motion.create(Box)

const navItems = [
  { href: '/library', label: 'Library' },
  { href: '/wizard', label: 'Wizard' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/editor', label: 'Editor' },
  { href: '/editor/advanced', label: 'Advanced' },
  { href: '/profile', label: 'Profile' },
  { href: '/print-request', label: 'Print Request' },
]

export function AppShell(props: { children: React.ReactNode; title: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const auth = useAppStore((state) => state.auth)
  const logout = useAppStore((state) => state.logout)

  return (
    <Stack gap="6" minH="100vh" px={{ base: '4', lg: '8' }} py={{ base: '4', lg: '6' }}>
      <Flex
        align={{ base: 'stretch', lg: 'center' }}
        direction={{ base: 'column', lg: 'row' }}
        gap="4"
        justify="space-between"
      >
        <Stack gap="1">
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.22em" textTransform="uppercase">
            Lanyard Card Design Generator
          </Text>
          <Text fontSize={{ base: '2xl', lg: '4xl' }} fontWeight="700">
            {props.title}
          </Text>
        </Stack>

        <HStack flexWrap="wrap" gap="2">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              <Box
                border="1px solid rgba(17,16,13,0.08)"
                borderRadius="full"
                px="4"
                py="2"
                style={{
                  background:
                    pathname === item.href ? 'rgba(17, 16, 13, 0.95)' : 'rgba(255,255,255,0.58)',
                  color: pathname === item.href ? 'white' : 'inherit',
                }}
              >
                {item.label}
              </Box>
            </Link>
          ))}
          {auth.isAuthenticated ? (
            <Button
              borderRadius="full"
              onClick={() => {
                logout()
                router.push('/login')
              }}
              variant="outline"
            >
              Sign out
            </Button>
          ) : null}
        </HStack>
      </Flex>

      <AnimatePresence mode="wait">
        <MotionBox
          animate={{ opacity: 1, y: 0 }}
          bg="rgba(255,255,255,0.68)"
          border="1px solid rgba(255,255,255,0.65)"
          borderRadius="32px"
          boxShadow="0 32px 90px rgba(74, 59, 34, 0.14)"
          initial={{ opacity: 0, y: 18 }}
          key={pathname}
          p={{ base: '4', lg: '8' }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          {props.children}
        </MotionBox>
      </AnimatePresence>
    </Stack>
  )
}
