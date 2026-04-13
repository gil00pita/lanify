import { Stack, Text } from '@chakra-ui/react'

import { PrintRequestPanel } from '@/components/app/print-request-panel'

export default function PrintRequestPage() {
  return (
    <Stack gap="6">
      <Text color="var(--lanyard-muted)" maxW="3xl">
        Review the print rules carefully. The first printed card is free. Every print request after
        that costs £50, and the chosen card becomes locked once submitted.
      </Text>
      <PrintRequestPanel />
    </Stack>
  )
}
