import { Stack, Text } from '@chakra-ui/react'

import { ProfileReviewForm } from '@/components/app/profile-review-form'

export default function ProfilePage() {
  return (
    <Stack gap="6">
      <Text color="var(--lanyard-muted)" maxW="3xl">
        Update your profile defaults here. These values seed new card drafts and stay available in
        the wizard when you generate additional designs.
      </Text>
      <ProfileReviewForm />
    </Stack>
  )
}
