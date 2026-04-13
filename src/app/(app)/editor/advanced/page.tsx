'use client'

import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { AdvancedControls } from '@/components/app/advanced-controls'
import { CardPreview } from '@/components/app/card-preview'
import { useAppStore } from '@/store/app-store'

export default function AdvancedEditorPage() {
  const router = useRouter()
  const activeDraft = useAppStore((state) => state.activeDraft)

  return (
    <Box
      bg="var(--lanyard-dark)"
      borderRadius="32px"
      color="white"
      minH="72vh"
      p={{ base: '4', lg: '6' }}
    >
      <Stack gap="6">
        <HStack gap="3" justify="space-between">
          <Stack gap="1">
            <Text fontSize="xs" letterSpacing="0.2em" textTransform="uppercase">
              Advanced Visual Editing
            </Text>
            <Text fontSize="3xl" fontWeight="700">
              Tune the portrait pattern with design-tool precision
            </Text>
          </Stack>
          <Button onClick={() => router.push('/editor')} variant="outline">
            Back to simple mode
          </Button>
        </HStack>

        <HStack align="start" flexDirection={{ base: 'column', xl: 'row' }} gap="6">
          <Box
            bg="rgba(255,255,255,0.05)"
            borderRadius="28px"
            minW={{ xl: '360px' }}
            p="5"
            w={{ base: 'full', xl: '380px' }}
          >
            <AdvancedControls />
          </Box>
          <Box
            alignItems="center"
            bg="rgba(255,255,255,0.04)"
            borderRadius="28px"
            display="grid"
            flex="1"
            minH="560px"
            placeItems="center"
          >
            {activeDraft ? <CardPreview card={activeDraft} emphasis="focused" /> : null}
          </Box>
        </HStack>
      </Stack>
    </Box>
  )
}
