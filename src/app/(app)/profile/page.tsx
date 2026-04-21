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
  const [cancelRevertImage, setCancelRevertImage] = useState<{
    avatarTransparentUrl: string | null
    avatarUrl: string | null
  } | null>(null)
  const previewImage = profile.avatarTransparentUrl ?? profile.avatarUrl

  return (
    <>
      <Stack gap="6">
        <Text color="var(--lanyard-muted)" maxW="3xl">
          Update your profile defaults here. These values seed new card drafts and stay available in
          the wizard when you generate additional designs.
        </Text>
        <ProfileReviewForm
          onRequestOpenEditor={(options) => {
            setCancelRevertImage(options?.revertOnCancel ?? null)
            setIsEditorOpen(true)
          }}
        />
      </Stack>

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
    </>
  )
}
