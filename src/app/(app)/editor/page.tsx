'use client'

import { Badge, Box, Button, HStack, Icon, Separator, Stack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { CardPreview } from '@/components/app/card-preview'
import { SignaturePad } from '@/components/app/signature-pad'
import { SimpleEditorPanel } from '@/components/app/simple-editor-panel'
import { frostedGlass } from '@/lib/ui-tokens'
import { useAppStore } from '@/store/app-store'

const MotionBox = motion.create(Box)

export default function EditorPage() {
  const router = useRouter()
  const activeDraft = useAppStore((state) => state.activeDraft)
  const updateSignature = useAppStore((state) => state.updateSignature)

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
          variant="outline"
          rounded={'full'}
          {...frostedGlass}
        >
          Back
        </Button>
        <HStack py="2" px="4" gap={2} zIndex={'docked'} rounded={'2xl'} {...frostedGlass}>
          <Icon
            as="svg"
            viewBox="0 0 24 24"
            boxSize="20px"
            color="fg.muted"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            height="16px"
            width="16px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            ></path>
          </Icon>
          <Text fontSize="sm" color="var(--lanyard-muted)">
            Customize your card.
          </Text>
        </HStack>
      </HStack>
      <Box overflow="hidden" position="relative" height={'100%'}>
        <HStack
          align="center"
          justifyContent={'flex-start'}
          flexDirection={{ base: 'column', xl: 'row' }}
          gap="8"
        >
          {activeDraft ? (
            <MotionBox
              animate={{ opacity: 1, scale: 1, x: 0 }}
              initial={{ opacity: 0, scale: 0.92, x: -48 }}
              transition={{ duration: 0.36, ease: 'easeOut' }}
            >
              <CardPreview card={activeDraft} emphasis="focused" />
            </MotionBox>
          ) : null}

          <MotionBox
            animate={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: 44 }}
            transition={{ duration: 0.34, ease: 'easeOut', delay: 0.08 }}
          >
            <Stack
              {...frostedGlass}
              border="1px solid rgba(255,255,255,0.72)"
              borderRadius="32px"
              gap="6"
              p={{ base: '5', md: '7' }}
            >
              {activeDraft ? (
                <Stack gap="4">
                  <Stack gap="2">
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      letterSpacing="0.18em"
                      textTransform="uppercase"
                    >
                      Card customizer
                    </Text>
                    <Text
                      fontFamily="Georgia, serif"
                      fontSize={{ base: '2xl', md: '4xl' }}
                      lineHeight="0.92"
                    >
                      {activeDraft.title}
                    </Text>
                    <Text color="fg.muted">
                      Tune the selected variation, then save it or move into advanced editing.
                    </Text>
                  </Stack>

                  <HStack flexWrap="wrap" gap="3">
                    <Badge rounded="full" px="3" py="1.5">
                      Selected variation
                    </Badge>
                    <Badge rounded="full" px="3" py="1.5" variant="outline">
                      {activeDraft.patternSettings.itemsPerRow} columns
                    </Badge>
                    <Badge rounded="full" px="3" py="1.5" variant="outline">
                      {activeDraft.patternSettings.rows} rows
                    </Badge>
                  </HStack>
                </Stack>
              ) : null}

              <Separator />

              <SimpleEditorPanel />

              <SignaturePad
                onConfirm={({ dataUrl, strokes }) =>
                  updateSignature({
                    confirmedAt: new Date().toISOString(),
                    dataUrl,
                    strokes,
                  })
                }
              />
            </Stack>
          </MotionBox>
        </HStack>
      </Box>
    </Stack>
  )
}
