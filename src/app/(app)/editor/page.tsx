'use client'

import { Box, Button, Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { CardPreview } from '@/components/app/card-preview'
import { SimpleEditorPanel } from '@/components/app/simple-editor-panel'
import { frostedGlass } from '@/lib/ui-tokens'
import { useAppStore } from '@/store/app-store'
import { BackChev } from '@/icons/BackChev'
import { LongArrowIcon } from '@/icons/LongArrowIcon'
import { Palette } from '@/icons/Palette'

const MotionBox = motion.create(Box)

export default function EditorPage() {
  const router = useRouter()
  const activeDraft = useAppStore((state) => state.activeDraft)

  return (
    <Stack
      gap="0"
      position={'relative'}
      height="100dvh"
      align="center"
      justifyContent={'flex-start'}
    >
      <HStack gap="3" position="absolute" top="24px" left="24px" zIndex={'docked'}>
        <Button
          onClick={() => router.push('/gallery')}
          variant="solid"
          rounded={'full'}
          gap={'4px'}
          colorPalette={'primary'}
        >
          <BackChev width="14px" height="14px" />
          Back
        </Button>
        <HStack py="2" px="4" gap={2} zIndex={'docked'} rounded={'full'} {...frostedGlass}>
          <Palette width="14px" height="14px" />
          <Text fontSize="sm">Customize your card</Text>
        </HStack>
      </HStack>
      <VStack
        flex="1"
        justifyContent="flex-start"
        minH="0"
        position="relative"
        pt={{ base: '88px', md: '96px' }}
        px={{ base: '4', md: '6' }}
        pb={{ base: '4', md: '6' }}
        w="full"
      >
        <HStack
          align={{ base: 'stretch', xl: 'center' }}
          flex="1"
          justifyContent={'center'}
          flexDirection={{ base: 'column', xl: 'row' }}
          gap="8"
          h="full"
          minH="0"
          w="full"
        >
          {activeDraft ? (
            <MotionBox
              animate={{ opacity: 1, scale: 1, x: 0 }}
              initial={{ opacity: 0, scale: 0.92, x: -48 }}
              transition={{ duration: 0.36, ease: 'easeOut' }}
              flexShrink={0}
            >
              <CardPreview card={activeDraft} emphasis="focused" />
              <Box height="40px" mt={3} />
            </MotionBox>
          ) : null}

          <MotionBox
            animate={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: 44 }}
            transition={{ duration: 0.34, ease: 'easeOut', delay: 0.08 }}
            minW="0"
            minH="0"
            w={{ base: 'full', xl: 'auto' }}
          >
            <Stack
              {...frostedGlass}
              border="1px solid rgba(255,255,255,0.72)"
              borderRadius="32px"
              gap="6"
              maxH="calc(100dvh - 120px)"
              minH="0"
              p={{ base: '5', md: '7' }}
              w={{ base: 'full', md: 'min(560px, 100%)' }}
            >
              {activeDraft ? (
                <Stack flexShrink={0} gap="4">
                  <Stack gap="2">
                    <Heading color={'primary.950'} fontWeight={700}>
                      Customize your card
                    </Heading>
                  </Stack>
                </Stack>
              ) : null}

              <Box flex="1" minH="0" overflowY="auto" pe={{ base: '2', xl: '0' }}>
                <SimpleEditorPanel />
              </Box>
            </Stack>
            <HStack gap="3" mt={3} w={'full'} justifyContent="flex-end">
              <Button onClick={() => router.push('/accessories')}>
                Save & continue
                <LongArrowIcon />
              </Button>
            </HStack>
          </MotionBox>
        </HStack>
      </VStack>
    </Stack>
  )
}
