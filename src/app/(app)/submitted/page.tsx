'use client'

import { Box, Button, Heading, HStack, Icon, Stack, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { CardAccessoriesPreview } from '@/components/app/card-accessories-preview'
import { frostedGlass } from '@/lib/ui-tokens'
import { useAppStore } from '@/store/app-store'
import { ResetIcon } from '@/icons/ResetIcon'

const MotionBox = motion.create(Box)

export default function SubmittedAccessoriesPage() {
  const router = useRouter()
  const activeDraft = useAppStore((state) => state.activeDraft)

  if (!activeDraft) {
    return null
  }

  return (
    <Stack align="center" gap="0" height="100dvh" justifyContent="flex-start" position="relative">
      <HStack gap="3" left="24px" position="absolute" top="24px" zIndex="docked">
        <Button
          colorPalette="primary"
          gap="4px"
          onClick={() => router.push('/wizard')}
          rounded="full"
          variant="solid"
        >
          <ResetIcon height="14px" width="14px" />
          Restart
        </Button>
        <HStack gap={2} px="4" py="2" rounded="full" zIndex="docked" {...frostedGlass}>
          <Icon
            as="svg"
            color={'fg.success'}
            boxSize="20px"
            fill="none"
            height="16px"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="16px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </Icon>
          <Text fontSize="sm">Card submitted for approval.</Text>
        </HStack>
      </HStack>

      <Stack height="100%" justifyContent="center">
        <HStack
          align="center"
          flexDirection={{ base: 'column', xl: 'row' }}
          gap="8"
          justifyContent="flex-end"
        >
          <VStack
            asChild
            className="card-preview-container"
            height="full"
            justifyContent="flex-end"
            p={0}
            w="full"
          >
            <MotionBox
              animate={{ opacity: 1, scale: 1, x: 0 }}
              initial={{ opacity: 0, scale: 0.92, x: -48 }}
              transition={{ duration: 0.36, ease: 'easeOut' }}
            >
              <CardAccessoriesPreview card={activeDraft} />
            </MotionBox>
          </VStack>

          <VStack asChild height="full" p={0} w="full" justifyContent="center">
            <MotionBox
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: 44 }}
              transition={{ delay: 0.08, duration: 0.34, ease: 'easeOut' }}
            >
              <Stack
                {...frostedGlass}
                border="1px solid rgba(255,255,255,0.72)"
                borderRadius="32px"
                gap="6"
                maxW="560px"
                p={{ base: '6', md: '8' }}
              >
                <Stack gap="3">
                  <Heading color="fg.success" fontWeight="700">
                    Card successfully submitted.
                  </Heading>
                </Stack>

                <Stack gap="4">
                  <Text fontSize="md" lineHeight="1.6">
                    Confirmation will be sent to your email shortly.
                  </Text>
                  <Text fontSize="md" lineHeight="1.6">
                    The approval process usually takes around 5 working days.
                  </Text>
                </Stack>
              </Stack>
            </MotionBox>
          </VStack>
        </HStack>
      </Stack>
    </Stack>
  )
}
