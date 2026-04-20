'use client'

import { Box, Flex, IconButton, Input, SegmentGroup, Text } from '@chakra-ui/react'
import { type ChangeEvent, type FC, useRef } from 'react'

import { BrightnessIcon } from '@/icons/BrightnessIcon'
import { ContrastIcon } from '@/icons/ContrastIcon'
import { CropIcon } from '@/icons/CropIcon'
import { DownloadIcon } from '@/icons/DownloadIcon'
import { HueIcon } from '@/icons/HueIcon'
import { SaturationIcon } from '@/icons/SaturationIcon'
import { UploadIcon } from '@/icons/UploadIcon'

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
    <Flex align="center" justify="center" className="segment-container" w={'full'}>
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
        ''
      )}
      <SegmentGroup.Root
        flex="1"
        justifySelf="center"
        onValueChange={(details) => onChange?.(details.value as EditorMode)}
        size={{ base: 'sm', sm: 'md' }}
        value={mode}
        minW={'0'}
      >
        <SegmentGroup.Indicator />
        {modes.map((nextMode) => {
          const button = getModeButton(nextMode)

          return (
            <SegmentGroup.Item
              key={nextMode}
              aria-label={button.ariaLabel}
              value={nextMode}
              _checked={{
                color: 'primary.300',
              }}
              _hover={{
                color: 'white',
              }}
            >
              <SegmentGroup.ItemText display="flex" justifyContent="center">
                {button.content}
              </SegmentGroup.ItemText>
              <SegmentGroup.ItemHiddenInput />
            </SegmentGroup.Item>
          )
        })}
      </SegmentGroup.Root>
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
