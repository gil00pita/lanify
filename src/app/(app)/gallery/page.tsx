'use client'

import { Button, HStack, Text, Stack, Icon } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { VariationGallery } from '@/components/app/variation-gallery'
import { frostedGlass } from '@/lib/ui-tokens'

export default function GalleryPage() {
  const router = useRouter()

  return (
    <Stack gap="0" position={'relative'}>
      <HStack gap="3" position="absolute" top="24px" left="24px" zIndex={'docked'}>
        <Button
          onClick={() => router.push('/wizard')}
          variant="outline"
          rounded={'full'}
          {...frostedGlass}
        >
          Back
        </Button>
        <HStack py="2" px="4" gap={2} zIndex={'docked'} rounded={'2xl'} {...frostedGlass}>
          <Icon
            as="svg"
            viewBox="0 0 24 24"
            boxSize="20px"
            color="fg.muted"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            height="16px"
            width="16px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M14 4.1 12 6"></path>
            <path d="m5.1 8-2.9-.8"></path>
            <path d="m6 12-1.9 2"></path>
            <path d="M7.2 2.2 8 5.1"></path>
            <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"></path>
          </Icon>
          <Text fontSize="sm" color="var(--lanyard-muted)">
            Select the variation you want to customize.
          </Text>
        </HStack>
      </HStack>
      <VariationGallery />
    </Stack>
  )
}
