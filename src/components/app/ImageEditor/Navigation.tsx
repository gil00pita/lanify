'use client'

import { Box, Flex, HStack, IconButton, Input, Text } from '@chakra-ui/react'
import { type ChangeEvent, type FC, useRef } from 'react'

import { BrightnessIcon } from '@/icons/BrightnessIcon'
import { ContrastIcon } from '@/icons/ContrastIcon'
import { CropIcon } from '@/icons/CropIcon'
import { DownloadIcon } from '@/icons/DownloadIcon'
import { HueIcon } from '@/icons/HueIcon'
import { SaturationIcon } from '@/icons/SaturationIcon'
import { UploadIcon } from '@/icons/UploadIcon'

import { Button } from '@chakra-ui/react'

export type EditorMode = 'brightness' | 'contrast' | 'crop' | 'grayscale' | 'hue' | 'saturation'

interface Props {
  mode?: EditorMode
  modes?: EditorMode[]
  onChange?: (mode: EditorMode) => void
  onDownload?: () => void
  onUpload?: (blob: string) => void
}

const defaultModes: EditorMode[] = ['crop', 'saturation', 'brightness', 'contrast', 'hue']

function getModeButton(mode: EditorMode) {
  if (mode === 'crop') {
    return {
      ariaLabel: 'Crop mode',
      content: <CropIcon />,
    }
  }

  if (mode === 'saturation') {
    return {
      ariaLabel: 'Saturation adjustment mode',
      content: <SaturationIcon />,
    }
  }

  if (mode === 'brightness') {
    return {
      ariaLabel: 'Brightness adjustment mode',
      content: <BrightnessIcon />,
    }
  }

  if (mode === 'contrast') {
    return {
      ariaLabel: 'Contrast adjustment mode',
      content: <ContrastIcon />,
    }
  }

  if (mode === 'grayscale') {
    return {
      ariaLabel: 'Grayscale adjustment mode',
      content: (
        <Text fontSize={{ base: '9px', sm: '11px' }} fontWeight="700" letterSpacing="0.08em">
          B/W
        </Text>
      ),
    }
  }

  return {
    ariaLabel: 'Hue adjustment mode',
    content: <HueIcon />,
  }
}

export const Navigation: FC<Props> = ({
  modes = defaultModes,
  onChange,
  onUpload,
  onDownload,
  mode,
}) => {
  const setMode = (nextMode: EditorMode) => () => {
    onChange?.(nextMode)
  }

  const inputRef = useRef<HTMLInputElement>(null)

  const onUploadButtonClick = () => {
    inputRef.current?.click()
  }

  const onLoadImage = (event: ChangeEvent<HTMLInputElement>) => {
    // Reference to the DOM input element
    const { files } = event.target

    // Ensure that you have a file before attempting to read it
    if (files && files[0]) {
      if (onUpload) {
        onUpload(URL.createObjectURL(files[0]))
      }
    }
    // Clear the event target value to give the possibility to upload the same image:
    event.target.value = ''
  }

  return (
    <Flex
      align="center"
      bg="bg.subtle"
      borderTop="1px solid"
      borderColor="whiteAlpha.200"
      gap={{ base: '2', sm: '3' }}
      h={{ base: '64px', sm: '84px' }}
      justify="center"
      px={{ base: '2', sm: '4' }}
    >
      {onUpload ? (
        <IconButton aria-label="Upload image" onClick={onUploadButtonClick}>
          <UploadIcon />
          <Input
            display="none"
            ref={inputRef}
            accept="image/*"
            onChange={onLoadImage}
            type="file"
          />
        </IconButton>
      ) : (
        <Box flexShrink={0} w={{ base: '32px', sm: '46px' }} />
      )}
      <HStack flex="1" gap={{ base: '1', sm: '2' }} justify="center">
        {modes.map((nextMode) => {
          const button = getModeButton(nextMode)

          return (
            <Button
              key={nextMode}
              aria-label={button.ariaLabel}
              bg={mode === nextMode ? 'whiteAlpha.100' : 'transparent'}
              color={mode === nextMode ? 'primary.300' : 'whiteAlpha.700'}
              onClick={setMode(nextMode)}
              _hover={{
                bg: 'whiteAlpha.100',
                color: mode === nextMode ? 'primary.200' : 'white',
              }}
            >
              {button.content}
            </Button>
          )
        })}
      </HStack>
      {onDownload ? (
        <IconButton aria-label="Download image" onClick={onDownload}>
          <DownloadIcon />
        </IconButton>
      ) : (
        <Box flexShrink={0} w={{ base: '32px', sm: '46px' }} />
      )}
    </Flex>
  )
}
