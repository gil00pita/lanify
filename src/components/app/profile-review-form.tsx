'use client'

import { ChangeEvent } from 'react'
import { useRef } from 'react'

import { Box, Button, HStack, Image, Input, Stack, Text } from '@chakra-ui/react'

import { useAppStore } from '@/store/app-store'

export function ProfileReviewForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const profile = useAppStore((state) => state.profile)
  const updateProfile = useAppStore((state) => state.updateProfile)

  function updateField<K extends keyof typeof profile>(key: K, value: (typeof profile)[K]) {
    updateProfile((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      updateProfile((current) => ({
        ...current,
        avatarTransparentUrl: current.avatarTransparentUrl ?? result,
        avatarUrl: result,
      }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <HStack align="start" flexDirection={{ base: 'column', lg: 'row' }} gap="8">
      <Stack flex="1" gap="5">
        <Text color="rgba(27,24,19,0.72)" fontSize="sm" maxW="560px">
          Please confirm your profile picture, name, and role before generating your first set of
          premium card directions.
        </Text>

        <Stack flex="1" gap="4">
          <Box>
            <Text fontSize="sm" fontWeight="600" mb="2">
              First Name *
            </Text>
            <Input
              bg="rgba(255,255,255,0.84)"
              border="1px solid rgba(27,24,19,0.12)"
              borderRadius="18px"
              h="56px"
              onChange={(event) => updateField('firstName', event.target.value)}
              placeholder="Olivia"
              value={profile.firstName}
            />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="600" mb="2">
              Surname *
            </Text>
            <Input
              bg="rgba(255,255,255,0.84)"
              border="1px solid rgba(27,24,19,0.12)"
              borderRadius="18px"
              h="56px"
              onChange={(event) => updateField('lastName', event.target.value)}
              placeholder="Hart"
              value={profile.lastName}
            />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="600" mb="2">
              Role *
            </Text>
            <Input
              bg="rgba(255,255,255,0.84)"
              border="1px solid rgba(27,24,19,0.12)"
              borderRadius="18px"
              h="56px"
              onChange={(event) => updateField('role', event.target.value)}
              placeholder="Member Experience Director"
              value={profile.role}
            />
          </Box>
        </Stack>
      </Stack>

      <Stack align="center" flexShrink={0} gap="4" minW={{ lg: '250px' }}>
        <Box
          alignItems="center"
          bg="rgba(255,255,255,0.42)"
          border="1px solid rgba(255,255,255,0.8)"
          borderRadius="full"
          display="grid"
          h="172px"
          overflow="hidden"
          placeItems="center"
          shadow="0 18px 40px rgba(17,16,13,0.10)"
          w="172px"
        >
          {profile.avatarUrl ? (
            <Image alt={profile.displayName} h="172px" objectFit="cover" src={profile.avatarUrl} w="172px" />
          ) : (
            <Box
              alignItems="center"
              bg="linear-gradient(135deg, #e0ddd6 0%, #b8b2a6 100%)"
              color="rgba(27,24,19,0.76)"
              display="grid"
              fontSize="4xl"
              fontWeight="700"
              h="172px"
              placeItems="center"
              w="172px"
            >
              {profile.firstName[0]}
              {profile.lastName[0]}
            </Box>
          )}
        </Box>

        <Input
          accept="image/*"
          display="none"
          onChange={handleUpload}
          ref={fileInputRef}
          type="file"
        />
        <Stack gap="3" w="full">
          <Button
            bg="white"
            border="1px solid rgba(27,24,19,0.12)"
            borderRadius="16px"
            color="var(--lanyard-text)"
            fontWeight="700"
            onClick={() => fileInputRef.current?.click()}
            variant="surface"
          >
            Upload New Picture
          </Button>
          <Button
            bg="white"
            border="1px solid rgba(27,24,19,0.12)"
            borderRadius="16px"
            color="var(--lanyard-text)"
            fontWeight="700"
            onClick={() =>
              updateProfile((current) => ({
                ...current,
                avatarTransparentUrl: current.avatarUrl,
              }))
            }
            variant="surface"
          >
            Edit Current Picture
          </Button>
        </Stack>
      </Stack>
    </HStack>
  )
}
