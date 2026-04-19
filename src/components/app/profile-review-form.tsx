'use client'

import { ChangeEvent, useRef, useState } from 'react'

import { Alert, Box, Button, HStack, Image, Input, Stack } from '@chakra-ui/react'

import { useAppStore } from '@/store/app-store'

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
const SUPPORTED_IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp'

function isCompatibleImageFile(file: File) {
  const normalizedName = file.name.toLowerCase()
  const hasSupportedExtension = SUPPORTED_IMAGE_EXTENSIONS.some((extension) =>
    normalizedName.endsWith(extension)
  )
  const hasSupportedType = file.type ? SUPPORTED_IMAGE_TYPES.has(file.type) : hasSupportedExtension

  return hasSupportedExtension && hasSupportedType
}

type ProfileReviewFormProps = {
  onRequestOpenEditor: () => void
}

export function ProfileReviewForm(props: ProfileReviewFormProps) {
  const { onRequestOpenEditor } = props
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const profile = useAppStore((state) => state.profile)
  const updateProfile = useAppStore((state) => state.updateProfile)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const hasProfilePicture = Boolean(profile.avatarTransparentUrl ?? profile.avatarUrl)
  const previewImage = profile.avatarTransparentUrl ?? profile.avatarUrl

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!isCompatibleImageFile(file)) {
      setUploadError('Use a JPG, PNG, or WebP image.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError('Use an image smaller than 10MB.')
      event.target.value = ''
      return
    }

    setUploadError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null

      if (!result) {
        return
      }

      updateProfile((current) => ({
        ...current,
        avatarTransparentUrl: null,
        avatarUrl: result,
      }))
      onRequestOpenEditor()
      event.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  return (
    <HStack align="start" flexDirection={{ base: 'column', lg: 'row' }} gap="8">
      <Stack align="center" flexShrink={0} gap="4" minW={{ lg: '250px' }} w="full">
        <Box
          alignItems="center"
          bg="bg.subtle"
          backgroundColor="var(--lanify-colors-bg)"
          backgroundPosition="0 0, 10px 10px"
          backgroundSize="20px 20px"
          bgImage={[
            'repeating-linear-gradient(45deg, var(--lanify-colors-bg-emphasized) 25%, transparent 25%, transparent 75%, var(--lanify-colors-bg-emphasized) 75%, var(--lanify-colors-bg-emphasized))',
            'repeating-linear-gradient(45deg, var(--lanify-colors-bg-emphasized) 25%, var(--lanify-colors-bg) 25%, var(--lanify-colors-bg) 75%, var(--lanify-colors-bg-emphasized) 75%, var(--lanify-colors-bg-emphasized))',
          ].join(', ')}
          border="1px solid rgba(255,255,255,0.8)"
          display="grid"
          h="250px"
          w="250px"
          my={4}
          overflow="hidden"
          placeItems="center"
          shadow="0 18px 40px rgba(17,16,13,0.10)"
          rounded={'lg'}
        >
          {previewImage ? (
            <Image
              alt={profile.displayName}
              h="100%"
              maxH="100%"
              maxW="100%"
              objectFit="contain"
              src={previewImage}
              w="100%"
            />
          ) : (
            <Box
              alignItems="center"
              bg="linear-gradient(135deg, #e0ddd6 0%, #b8b2a6 100%)"
              color="rgba(27,24,19,0.76)"
              display="grid"
              fontSize="4xl"
              fontWeight="700"
              placeItems="center"
              h="250px"
              w="250px"
            >
              {profile.firstName[0]}
              {profile.lastName[0]}
            </Box>
          )}
        </Box>

        <Input
          accept={SUPPORTED_IMAGE_ACCEPT}
          display="none"
          onChange={handleUpload}
          ref={fileInputRef}
          type="file"
        />
        <Stack gap="3" w="full">
          {uploadError ? (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{uploadError}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          ) : null}
          <HStack gap="3" w="full">
            <Button
              rounded="full"
              onClick={() => fileInputRef.current?.click()}
              variant="surface"
              w={hasProfilePicture ? undefined : 'full'}
            >
              Upload New Picture
            </Button>
            {hasProfilePicture ? (
              <Button
                rounded="full"
                onClick={() =>
                  updateProfile((current) => ({
                    ...current,
                    avatarUrl: null,
                    avatarTransparentUrl: null,
                  }))
                }
                variant="surface"
              >
                Remove Picture
              </Button>
            ) : null}
          </HStack>
          {hasProfilePicture ? (
            <Button
              rounded="full"
              w={'full'}
              onClick={onRequestOpenEditor}
              variant="surface"
            >
              Edit Current Picture
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </HStack>
  )
}
