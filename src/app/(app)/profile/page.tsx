'use client'

import { useState } from 'react'

import { Stack, Text } from '@chakra-ui/react'

import { ProfileImageEditorModal } from '@/components/app/profile-image-editor-modal'
import { ProfileReviewForm } from '@/components/app/profile-review-form'
import { useAppStore } from '@/store/app-store'

export default function ProfilePage() {
  const profile = useAppStore((state) => state.profile)
  const updateProfile = useAppStore((state) => state.updateProfile)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const previewImage = profile.avatarTransparentUrl ?? profile.avatarUrl

  return (
    <>
      <Stack gap="6">
        <Text color="var(--lanyard-muted)" maxW="3xl">
          Update your profile defaults here. These values seed new card drafts and stay available in
          the wizard when you generate additional designs.
        </Text>
        <ProfileReviewForm onRequestOpenEditor={() => setIsEditorOpen(true)} />
      </Stack>

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
    </>
  )
}
