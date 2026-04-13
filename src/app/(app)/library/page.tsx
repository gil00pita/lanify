import { Stack, Text } from '@chakra-ui/react'

import { LibraryGrid } from '@/components/app/library-grid'

export default function LibraryPage() {
  return (
    <Stack gap="6">
      <Text color="var(--lanyard-muted)" maxW="3xl">
        Your library is the default home once you have at least one saved card. Cards that have
        been submitted for print remain visible here and lock automatically after submission.
      </Text>
      <LibraryGrid />
    </Stack>
  )
}
