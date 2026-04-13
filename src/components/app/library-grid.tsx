'use client'
import { useRouter } from 'next/navigation'

import { Box, Button, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react'

import { CardPreview } from '@/components/app/card-preview'
import { StatusPill } from '@/components/app/status-pill'
import { useAppStore } from '@/store/app-store'

export function LibraryGrid() {
  const cards = useAppStore((state) => state.cards)
  const createNewDraft = useAppStore((state) => state.createNewDraft)
  const loadCardIntoDraft = useAppStore((state) => state.loadCardIntoDraft)
  const router = useRouter()

  return (
    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="6">
      <Button
        alignItems="start"
        bg="rgba(17,16,13,0.94)"
        borderRadius="28px"
        color="white"
        flexDirection="column"
        h="420px"
        justifyContent="space-between"
        onClick={() => {
          createNewDraft()
          router.push('/wizard')
        }}
        p="6"
      >
        <Text fontSize="5xl" lineHeight="1">
          +
        </Text>
        <Stack align="start">
          <Text fontSize="2xl" fontWeight="700">
            Create New Card
          </Text>
          <Text color="rgba(255,255,255,0.72)">
            Start a fresh wizard and generate a new premium card direction.
          </Text>
        </Stack>
      </Button>

      {cards.map((card) => (
        <Box
          bg="rgba(255,255,255,0.74)"
          border="1px solid rgba(17,16,13,0.08)"
          borderRadius="28px"
          key={card.id}
          p="5"
        >
          <Stack gap="4">
            <CardPreview card={card} />
            <HStack justify="space-between">
              <StatusPill card={card} />
              <Text color="var(--lanyard-muted)" fontSize="sm">
                {new Date(card.updatedAt).toLocaleDateString()}
              </Text>
            </HStack>
            <Text fontWeight="700">{card.title}</Text>
            <HStack gap="3">
              <Button
                onClick={() => {
                  loadCardIntoDraft(card.id)
                  router.push('/editor')
                }}
                size="sm"
              >
                {card.isLocked ? 'View' : 'Edit'}
              </Button>
              <Button
                onClick={() => {
                  loadCardIntoDraft(card.id)
                  router.push('/print-request')
                }}
                size="sm"
                variant="outline"
              >
                Print
              </Button>
            </HStack>
          </Stack>
        </Box>
      ))}
    </SimpleGrid>
  )
}
