'use client'

import { Flex, IconButton, Input, SegmentGroup } from '@chakra-ui/react'
import { type ChangeEvent, type FC, useRef } from 'react'

import { BackgroundIcon } from '@/icons/BackgroundIcon'
import { ColorIcon } from '@/icons/ColorIcon'
import { DownloadIcon } from '@/icons/DownloadIcon'
import { UploadIcon } from '@/icons/UploadIcon'

export type EditorMode = 'background' | 'color'

interface Props {
  mode?: EditorMode
  modes?: EditorMode[]
  onChange?: (mode: EditorMode) => void
  onDownload?: () => void
  onUpload?: (blob: string) => void
}

const defaultModes: EditorMode[] = ['color', 'background']

function getModeButton(mode: EditorMode) {
  if (mode === 'color') {
    return {
      ariaLabel: 'Color adjustment mode',
      content: <ColorIcon />,
    }
  }

  return {
    ariaLabel: 'Background adjustment mode',
    content: <BackgroundIcon />,
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
    <Flex align="center" justify="center" className="segment-container">
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
        justifySelf="center"
        onValueChange={(details) => onChange?.(details.value as EditorMode)}
        size={{ base: 'sm', sm: 'md' }}
        value={mode}
        minW={'0'}
        maxW="full"
        css={{
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { height: '4px' },
        }}
      >
        <SegmentGroup.Indicator bg={'bg'} />
        {modes.map((nextMode) => {
          const button = getModeButton(nextMode)

          return (
            <SegmentGroup.Item key={nextMode} aria-label={button.ariaLabel} value={nextMode}>
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
        ''
      )}
    </Flex>
  )
}
