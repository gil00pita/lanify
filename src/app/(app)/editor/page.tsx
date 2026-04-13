'use client'

import { Button, HStack, Stack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { CardPreview } from '@/components/app/card-preview'
import { SignaturePad } from '@/components/app/signature-pad'
import { SimpleEditorPanel } from '@/components/app/simple-editor-panel'
import { useAppStore } from '@/store/app-store'

export default function EditorPage() {
  const router = useRouter()
  const activeDraft = useAppStore((state) => state.activeDraft)
  const setWizardStep = useAppStore((state) => state.setWizardStep)
  const updateSignature = useAppStore((state) => state.updateSignature)

  return (
    <Stack gap="6">
      <HStack gap="3">
        <Button onClick={() => router.push('/gallery')} variant="outline">
          Back to gallery
        </Button>
        <Button
          onClick={() => {
            setWizardStep('print')
            router.push('/print-request')
          }}
        >
          Print request
        </Button>
      </HStack>

      <HStack align="start" flexDirection={{ base: 'column', xl: 'row' }} gap="8">
        {activeDraft ? <CardPreview card={activeDraft} emphasis="focused" /> : null}
        <Stack flex="1" gap="6">
          <SimpleEditorPanel />
          <SignaturePad
            onConfirm={({ dataUrl, strokes }) =>
              updateSignature({
                confirmedAt: new Date().toISOString(),
                dataUrl,
                strokes,
              })
            }
          />
        </Stack>
      </HStack>
    </Stack>
  )
}
