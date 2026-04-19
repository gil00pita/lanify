'use client'

import { useEffect, useState } from 'react'

import { Alert, Box, Button, Grid, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { ProfileImageEditorModal } from '@/components/app/profile-image-editor-modal'
import { ProfileReviewForm } from '@/components/app/profile-review-form'
import { frostedGlass } from '@/lib/ui-tokens'
import { useAppStore } from '@/store/app-store'

const sampleCards = [
  { accent: '#f0e6d3', foreground: '#2d241b' },
  { accent: '#54ef8c', foreground: '#173c20' },
  { accent: '#2496ca', foreground: '#eef8fe' },
  { accent: '#1f1d1d', foreground: '#fbf5e8' },
  { accent: '#dd4215', foreground: '#fff1df' },
  { accent: '#2c96d0', foreground: '#eaf6fc' },
  { accent: '#a7f0ef', foreground: '#2c6170' },
  { accent: '#304ce9', foreground: '#edf1ff' },
  { accent: '#8b0089', foreground: '#f8d9ff' },
  { accent: '#f06925', foreground: '#fff0df' },
  { accent: '#046f0d', foreground: '#e8fce7' },
  { accent: '#564c37', foreground: '#f1ebdf' },
]

function BackgroundSampleCard(props: { accent: string; foreground: string }) {
  return (
    <Box
      bg={props.accent}
      borderRadius="24px"
      boxShadow="0 12px 26px rgba(17,16,13,0.14)"
      color={props.foreground}
      h={{ base: '180px', md: '250px' }}
      p={{ base: '4', md: '5' }}
      position="relative"
      w="100%"
    >
      <Stack gap="2">
        <Text
          fontFamily="Georgia, serif"
          fontSize={{ base: 'lg', md: '2xl' }}
          fontWeight="500"
          lineHeight="1"
        >
          Interface Craft
        </Text>
        <Text
          fontFamily="Georgia, serif"
          fontSize={{ base: '2xl', md: '4xl' }}
          fontWeight="500"
          lineHeight="0.95"
        >
          Example Card
        </Text>
      </Stack>
      <Box bottom="20px" left="20px" position="absolute" right="20px">
        <HStack justify="space-between">
          <Stack gap="1">
            <Text
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.18em"
              opacity="0.65"
              textTransform="uppercase"
            >
              Member
            </Text>
            <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="700">
              New Member
            </Text>
          </Stack>
          <Stack gap="1" textAlign="right">
            <Text
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.18em"
              opacity="0.65"
              textTransform="uppercase"
            >
              Issued On
            </Text>
            <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="700">
              02/25/26
            </Text>
          </Stack>
        </HStack>
      </Box>
    </Box>
  )
}

export default function WizardPage() {
  const router = useRouter()
  const createNewDraft = useAppStore((state) => state.createNewDraft)
  const profile = useAppStore((state) => state.profile)
  const activeDraft = useAppStore((state) => state.activeDraft)
  const setWizardStep = useAppStore((state) => state.setWizardStep)
  const updateProfile = useAppStore((state) => state.updateProfile)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const hasProfilePicture = Boolean(profile.avatarTransparentUrl ?? profile.avatarUrl)
  const previewImage = profile.avatarTransparentUrl ?? profile.avatarUrl

  useEffect(() => {
    if (!activeDraft) {
      createNewDraft()
    }
  }, [activeDraft, createNewDraft])

  return (
    <Box minH="100vh" overflow="hidden" position="relative" width="100vw">
      <Grid
        height={'100vh'}
        filter="blur(2px)"
        gap={{ base: '4', md: '8' }}
        opacity="0.92"
        p={{ base: '6', md: '10' }}
        templateColumns={{ base: 'repeat(4, 1fr)', lg: 'repeat(10, 1fr)' }}
        templateRows={{ base: 'repeat(3, 1fr)' }}
      >
        {sampleCards.map((card, index) => (
          <BackgroundSampleCard
            accent={card.accent}
            foreground={card.foreground}
            key={`${card.accent}-${index}`}
          />
        ))}
      </Grid>

      <Box backdropFilter="blur(14px)" bg="rgba(255,255,255,0.34)" inset="0" position="absolute" />

      <Box
        display="grid"
        inset="0"
        placeItems="center"
        position="absolute"
        px={{ base: '4', md: '10' }}
        py={{ base: '8', md: '14' }}
      >
        <Stack
          {...frostedGlass}
          border="1px solid rgba(255,255,255,0.82)"
          borderRadius="34px"
          // maxW="980px"
          p={{ base: '6', md: '10' }}
          // w="full"
        >
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="500" lineHeight="0.95">
            Welcome, {profile.displayName}
          </Text>

          <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="400" mt="1">
            {profile.role}
          </Text>

          <Alert.Root status="info" inline size={'sm'} mt="4" maxW={"250px"}>
            <Alert.Indicator />
            <Alert.Title>Make sure the background is simple and with uniform color.</Alert.Title>
          </Alert.Root>

          <ProfileReviewForm onRequestOpenEditor={() => setIsEditorOpen(true)} />

          <VStack justify="space-between" mt="4">
            <Text color="fg.muted" fontSize="sm">
              {hasProfilePicture ? 'Profile picture ready.' : 'Upload a profile picture to Start.'}
            </Text>

            <Button
              variant={'solid'}
              rounded={'full'}
              colorPalette="primary"
              disabled={!hasProfilePicture}
              w={'full'}
              onClick={() => {
                updateProfile((current) => ({
                  ...current,
                  displayName: `${current.firstName} ${current.lastName}`.trim(),
                }))
                setWizardStep('gallery')
                router.push('/gallery')
              }}
              px="10"
              size="lg"
            >
              Start
            </Button>
          </VStack>
        </Stack>
      </Box>

      {previewImage ? (
        <ProfileImageEditorModal
          imageSrc={previewImage}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={(editedImage) =>
            updateProfile((current) => ({
              ...current,
              avatarTransparentUrl: editedImage,
            }))
          }
          originalImageSrc={profile.avatarUrl}
          transparentImageSrc={profile.avatarTransparentUrl}
        />
      ) : null}
    </Box>
  )
}
