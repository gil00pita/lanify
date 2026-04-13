'use client'

import { HStack, Text, VStack } from '@chakra-ui/react'

import type { WizardStep } from '@/types/domain'

const orderedSteps: WizardStep[] = ['profile', 'gallery', 'edit', 'signature', 'save', 'print']

export function WizardStepper(props: { step: WizardStep }) {
  const activeIndex = Math.max(orderedSteps.indexOf(props.step), 0)

  return (
    <HStack align="stretch" gap="4" overflowX="auto">
      {orderedSteps.map((step, index) => (
        <VStack
          align="start"
          bg={index <= activeIndex ? 'rgba(17,16,13,0.98)' : 'rgba(17,16,13,0.08)'}
          borderRadius="20px"
          color={index <= activeIndex ? 'white' : 'var(--lanyard-text)'}
          key={step}
          minW="145px"
          p="4"
        >
          <Text fontSize="xs" letterSpacing="0.16em" textTransform="uppercase">
            Step {index + 1}
          </Text>
          <Text fontWeight="700" textTransform="capitalize">
            {step}
          </Text>
        </VStack>
      ))}
    </HStack>
  )
}
