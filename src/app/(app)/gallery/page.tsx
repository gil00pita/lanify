'use client'

import { Button, HStack, Stack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { VariationGallery } from '@/components/app/variation-gallery'
import { useAppStore } from '@/store/app-store'

export default function GalleryPage() {
  const router = useRouter()
  const setWizardStep = useAppStore((state) => state.setWizardStep)

  return (
    <Stack gap="6">
      <HStack gap="3">
        <Button onClick={() => router.push('/wizard')} variant="outline">
          Back to profile
        </Button>
        <Button
          onClick={() => {
            setWizardStep('edit')
            router.push('/editor')
          }}
        >
          Continue to editor
        </Button>
      </HStack>
      <VariationGallery />
    </Stack>
  )
}
