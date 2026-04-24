'use client'

import { useEffect, useState } from 'react'

import { Alert, Box, Button, Grid, Heading, Stack, Text, VStack } from '@chakra-ui/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { ProfileImageEditorModal } from '@/components/app/profile-image-editor-modal'
import { ProfileReviewForm } from '@/components/app/profile-review-form'
import { frostedGlass } from '@/lib/ui-tokens'
import { useAppStore } from '@/store/app-store'
import { LongArrowIcon } from '@/icons/LongArrowIcon'

const profileImages = [
  '/profile-image-01.png',
  '/profile-image-02.png',
  '/profile-image-03.png',
  '/profile-image-04.png',
  '/profile-image-05.png',
  '/profile-image-06.png',
] as const

const sampleCardColors = [
  { accent: '#f0e6d3', foreground: '#2d241b' },
  { accent: '#54ef8c', foreground: '#173c20' },
  { accent: '#2496ca', foreground: '#eef8fe' },
  { accent: '#1f1d1d', foreground: '#fbf5e8' },
  { accent: '#dd4215', foreground: '#fff1df' },
  { accent: '#564c37', foreground: '#f1ebdf' },
  { accent: '#2c96d0', foreground: '#eaf6fc' },
  { accent: '#a7f0ef', foreground: '#2c6170' },
  { accent: '#304ce9', foreground: '#edf1ff' },
  { accent: '#8b0089', foreground: '#f8d9ff' },
  { accent: '#f06925', foreground: '#fff0df' },
  { accent: '#046f0d', foreground: '#e8fce7' },
  { accent: '#f06925', foreground: '#fff0df' },
  { accent: '#046f0d', foreground: '#e8fce7' },
  { accent: '#564c37', foreground: '#f1ebdf' },
  { accent: '#54ef8c', foreground: '#173c20' },
  { accent: '#2496ca', foreground: '#eef8fe' },
  { accent: '#1f1d1d', foreground: '#fbf5e8' },
  { accent: '#8b0089', foreground: '#f8d9ff' },
  { accent: '#dd4215', foreground: '#fff1df' },
  { accent: '#2c96d0', foreground: '#eaf6fc' },
  { accent: '#1f1d1d', foreground: '#fbf5e8' },
  { accent: '#dd4215', foreground: '#fff1df' },
  { accent: '#2c96d0', foreground: '#eaf6fc' },
  { accent: '#a7f0ef', foreground: '#2c6170' },
  { accent: '#304ce9', foreground: '#edf1ff' },
  { accent: '#8b0089', foreground: '#f8d9ff' },
  { accent: '#2c96d0', foreground: '#eaf6fc' },
  { accent: '#f06925', foreground: '#fff0df' },
  { accent: '#046f0d', foreground: '#e8fce7' },
  { accent: '#2c96d0', foreground: '#eaf6fc' },
  { accent: '#1f1d1d', foreground: '#fbf5e8' },
  { accent: '#dd4215', foreground: '#fff1df' },
  { accent: '#2c96d0', foreground: '#eaf6fc' },
  { accent: '#a7f0ef', foreground: '#2c6170' },
  { accent: '#304ce9', foreground: '#edf1ff' },
  { accent: '#8b0089', foreground: '#f8d9ff' },
  { accent: '#2c96d0', foreground: '#eaf6fc' },
  { accent: '#f06925', foreground: '#fff0df' },
  { accent: '#046f0d', foreground: '#e8fce7' },
  { accent: '#564c37', foreground: '#f1ebdf' },
]

const sampleCards = sampleCardColors.map((card, index) => ({
  ...card,
  id: `sample-card-${index + 1}`,
  loading: index < profileImages.length ? ('eager' as const) : ('lazy' as const),
  portraitImage: profileImages[index % profileImages.length] ?? profileImages[0],
}))

const backgroundPatternCells = Array.from({ length: 30 }, (_, index) => ({
  id: `pattern-cell-${index + 1}`,
  transform: index % 2 === 0 ? 'scale(0.78)' : 'scale(0.58)',
}))

function BackgroundSampleCard(props: {
  accent: string
  foreground: string
  loading: 'eager' | 'lazy'
  portraitImage: (typeof profileImages)[number]
}) {
  return (
    <Box
      bg={props.accent}
      borderRadius="24px"
      border="1px solid rgba(255,255,255,0.7)"
      boxShadow="0 28px 44px rgba(17,16,13,0.16)"
      color={props.foreground}
      h={'390px'}
      overflow="hidden"
      position="relative"
      w="240px"
    >
      <Box h="64%" insetX="0" position="absolute" top="0">
        <Box
          bg="linear-gradient(135deg, rgba(255,255,255,0.12), transparent 55%)"
          inset="0"
          opacity="0.9"
          position="absolute"
        />
        <Box inset="0" opacity="0.2" position="absolute">
          <Grid
            gap={{ base: '2', md: '3' }}
            h="100%"
            p={{ base: '3', md: '4' }}
            templateColumns="repeat(6, 1fr)"
            templateRows="repeat(5, 1fr)"
            w="100%"
          >
            {backgroundPatternCells.map((cell) => (
              <Box
                bg="rgba(255,255,255,0.34)"
                borderRadius="4px"
                key={cell.id}
                transform={cell.transform}
              />
            ))}
          </Grid>
        </Box>
        <Box
          alignItems="flex-end"
          display="flex"
          h="100%"
          justifyContent="center"
          insetX="0"
          position="absolute"
          top="0"
        >
          <Box bottom="-8px" h="100%" position="absolute" w="94%">
            <Image
              alt=""
              fill
              loading={props.loading}
              sizes="240px"
              src={props.portraitImage}
              style={{
                objectFit: 'contain',
                objectPosition: 'bottom center',
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box
        bg="rgba(250,249,246,0.98)"
        bottom="-1px"
        clipPath="polygon(0 0, 72% 0, 84% 16%, 100% 16%, 100% 100%, 0 100%)"
        color="#1b1813"
        left="0"
        pb={{ base: '4', md: '5' }}
        position="absolute"
        pt={{ base: '3', md: '4' }}
        px={{ base: '4', md: '5' }}
        right="0"
        top="58%"
      >
        <Stack gap={{ base: '2', md: '3' }} h="full" justify="space-between">
          <Stack gap="1">
            <Text
              fontSize={{ base: '2xl', md: '4xl' }}
              fontWeight="600"
              letterSpacing="-0.05em"
              lineHeight="0.92"
            >
              Jamie
            </Text>
            <Text
              fontSize={{ base: '2xl', md: '4xl' }}
              fontWeight="600"
              letterSpacing="-0.05em"
              lineHeight="0.92"
            >
              Rivera
            </Text>
          </Stack>
          <Text color="rgba(27,24,19,0.76)" fontSize={{ base: 'sm', md: 'lg' }} lineHeight="1.05">
            Product Designer
          </Text>
        </Stack>
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
  const [cancelRevertImage, setCancelRevertImage] = useState<{
    avatarTransparentUrl: string | null
    avatarUrl: string | null
  } | null>(null)
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
        templateColumns={{
          base: 'repeat(3, 240px)',
          md: 'repeat(4, 240px)',
          lg: 'repeat(6, 240px)',
          xl: 'repeat(8, 240px)',
          '2xl': 'repeat(14, 240px)',
        }}
        templateRows={{ base: 'repeat(3, 1fr)' }}
      >
        {sampleCards.map((card) => (
          <BackgroundSampleCard
            accent={card.accent}
            foreground={card.foreground}
            key={card.id}
            loading={card.loading}
            portraitImage={card.portraitImage}
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
          p={{ base: '6', md: '10' }}
        >
          <Heading fontWeight="700" size={'2xl'}>
            Customize your
            <br /> office card design.
          </Heading>

          <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="400" mt="1">
            {profile.displayName}, {profile.role}
          </Text>

          <Alert.Root status="info" inline size={'sm'} mt="4" maxW={'250px'}>
            <Alert.Indicator />
            <Alert.Title>Make sure the background is simple and with uniform color.</Alert.Title>
          </Alert.Root>

          <ProfileReviewForm
            onRequestOpenEditor={(options) => {
              setCancelRevertImage(options?.revertOnCancel ?? null)
              setIsEditorOpen(true)
            }}
          />

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
              <LongArrowIcon />
            </Button>
          </VStack>
        </Stack>
      </Box>

      {previewImage ? (
        <ProfileImageEditorModal
          imageSrc={previewImage}
          isOpen={isEditorOpen}
          onClose={() => {
            if (cancelRevertImage) {
              updateProfile((current) => ({
                ...current,
                avatarTransparentUrl: cancelRevertImage.avatarTransparentUrl,
                avatarUrl: cancelRevertImage.avatarUrl,
              }))
            }

            setCancelRevertImage(null)
            setIsEditorOpen(false)
          }}
          onSave={(editedImage) => {
            setCancelRevertImage(null)
            updateProfile((current) => ({
              ...current,
              avatarTransparentUrl: editedImage,
            }))
            setIsEditorOpen(false)
          }}
          originalImageSrc={profile.avatarUrl}
          transparentImageSrc={profile.avatarTransparentUrl}
        />
      ) : null}
    </Box>
  )
}
