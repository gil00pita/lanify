'use client'

import { useMemo, useState } from 'react'

import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react'

import { CardPreview } from '@/components/app/card-preview'
import { getNextPrintPrice } from '@/lib/domain/card-rules'
import { useAppStore } from '@/store/app-store'

export function PrintRequestPanel() {
  const cards = useAppStore((state) => state.cards)
  const printRequests = useAppStore((state) => state.printRequests)
  const submitPrintRequest = useAppStore((state) => state.submitPrintRequest)
  const [cardId, setCardId] = useState(cards[0]?.id ?? '')

  const printableCards = cards.filter((card) => !card.isLocked)
  const selectedCard = cards.find((card) => card.id === cardId) ?? printableCards[0]
  const price = useMemo(() => getNextPrintPrice(printRequests), [printRequests])

  if (printableCards.length === 0) {
    return (
      <Box bg="rgba(17,16,13,0.05)" borderRadius="24px" p="6">
        Every existing card is locked. Create a new card in the wizard to submit another print
        request.
      </Box>
    )
  }

  return (
    <Stack gap="6">
      <Box>
        <Text fontWeight="700" mb="3">
          Select card to print
        </Text>
        <Stack gap="3">
          {printableCards.map((card) => (
            <label key={card.id}>
              <HStack
                bg={cardId === card.id ? 'rgba(17,16,13,0.08)' : 'transparent'}
                border="1px solid rgba(17,16,13,0.12)"
                borderRadius="18px"
                p="3"
              >
                <input
                  checked={cardId === card.id}
                  name="print-card"
                  onChange={() => setCardId(card.id)}
                  type="radio"
                />
                <Text>{card.title}</Text>
              </HStack>
            </label>
          ))}
        </Stack>
      </Box>

      {selectedCard ? (
        <HStack align="start" flexDirection={{ base: 'column', lg: 'row' }} gap="6">
          <CardPreview card={selectedCard} />
          <Stack bg="rgba(17,16,13,0.96)" borderRadius="28px" color="white" flex="1" p="6">
            <Text fontSize="2xl" fontWeight="700">
              Pricing Summary
            </Text>
            <Text>
              {price === 0
                ? 'This is the first print request for your account, so it is free.'
                : 'Your first print has already been used. This request will cost £50.'}
            </Text>
            <Text color="rgba(255,255,255,0.72)">
              Once you confirm, this card becomes locked and can no longer be edited.
            </Text>
            <Button
              onClick={() => submitPrintRequest(selectedCard.id)}
              w="fit-content"
            >
              Confirm print request {price === 0 ? '(Free)' : '(£50)'}
            </Button>
          </Stack>
        </HStack>
      ) : null}
    </Stack>
  )
}
