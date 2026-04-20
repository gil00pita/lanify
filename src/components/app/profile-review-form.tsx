'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Dialog,
  HStack,
  IconButton,
  Image,
  Input,
  Portal,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'

import { Avatar } from '@/icons/Avatar'
import { Camera } from '@/icons/Camera'
import { CloseIcon } from '@/icons/Close'
import { FaceGuide } from '@/icons/FaceGuide'
import { SwitchCamera } from '@/icons/SwtichCamera'
import { UploadIcon } from '@/icons/UploadIcon'
import { useAppStore } from '@/store/app-store'
import { EditIcon } from '@/icons/Edit'
import { DeleteIcon } from '@/icons/Delete'

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
const SUPPORTED_IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp'

function isCompatibleImageFile(file: File) {
  const normalizedName = file.name.toLowerCase()
  const hasSupportedExtension = SUPPORTED_IMAGE_EXTENSIONS.some((extension) =>
    normalizedName.endsWith(extension)
  )
  const hasSupportedType = file.type ? SUPPORTED_IMAGE_TYPES.has(file.type) : hasSupportedExtension

  return hasSupportedExtension && hasSupportedType
}

type ProfileReviewFormProps = {
  onRequestOpenEditor: () => void
}

export function ProfileReviewForm(props: ProfileReviewFormProps) {
  const { onRequestOpenEditor } = props
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const profile = useAppStore((state) => state.profile)
  const updateProfile = useAppStore((state) => state.updateProfile)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('user')
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const hasProfilePicture = Boolean(profile.avatarTransparentUrl ?? profile.avatarUrl)
  const previewImage = profile.avatarTransparentUrl ?? profile.avatarUrl

  function stopCameraStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => {
    async function startCameraStream() {
      if (!isCameraOpen) {
        stopCameraStream()
        setCameraError(null)
        setIsCameraLoading(false)
        return
      }

      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError('Camera access is not supported in this browser.')
        setIsCameraLoading(false)
        return
      }

      setCameraError(null)
      setIsCameraLoading(true)
      stopCameraStream()

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: cameraFacingMode },
          },
        })

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => undefined)
        }
      } catch (error) {
        const message =
          error instanceof Error && error.name === 'NotAllowedError'
            ? 'Camera permission was denied. Please allow access and try again.'
            : 'We could not start the camera. Please try again.'

        setCameraError(message)
      } finally {
        setIsCameraLoading(false)
      }
    }

    void startCameraStream()

    return () => {
      stopCameraStream()
    }
  }, [cameraFacingMode, isCameraOpen])

  function applySelectedImage(imageSrc: string) {
    updateProfile((current) => ({
      ...current,
      avatarTransparentUrl: null,
      avatarUrl: imageSrc,
    }))
    onRequestOpenEditor()
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!isCompatibleImageFile(file)) {
      setUploadError('Use a JPG, PNG, or WebP image.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError('Use an image smaller than 10MB.')
      event.target.value = ''
      return
    }

    setUploadError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null

      if (!result) {
        return
      }

      applySelectedImage(result)
      event.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  function openCamera() {
    setCameraFacingMode('user')
    setCameraError(null)
    setIsCameraOpen(true)
  }

  function closeCamera() {
    setIsCameraOpen(false)
    setIsCapturing(false)
    setCameraError(null)
  }

  function toggleCameraFacingMode() {
    setCameraFacingMode((current) => (current === 'user' ? 'environment' : 'user'))
  }

  function capturePhoto() {
    const video = videoRef.current

    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('Wait for the camera preview to load before taking a photo.')
      return
    }

    setIsCapturing(true)
    setCameraError(null)

    try {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error('Canvas is unavailable.')
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageSrc = canvas.toDataURL('image/jpeg', 0.92)
      closeCamera()
      applySelectedImage(imageSrc)
    } catch {
      setCameraError('We could not capture a photo. Please try again.')
    } finally {
      setIsCapturing(false)
    }
  }

  return (
    <>
      <HStack align="start" flexDirection={{ base: 'column', lg: 'row' }} gap="8">
        <Stack align="center" flexShrink={0} gap="4" minW={{ lg: '250px' }} w="full">
          <Box
            alignItems="center"
            bg="bg.subtle"
            backgroundColor="var(--lanify-colors-bg)"
            backgroundPosition="0 0, 10px 10px"
            backgroundSize="20px 20px"
            bgImage={[
              'repeating-linear-gradient(45deg, var(--lanify-colors-bg-emphasized) 25%, transparent 25%, transparent 75%, var(--lanify-colors-bg-emphasized) 75%, var(--lanify-colors-bg-emphasized))',
              'repeating-linear-gradient(45deg, var(--lanify-colors-bg-emphasized) 25%, var(--lanify-colors-bg) 25%, var(--lanify-colors-bg) 75%, var(--lanify-colors-bg-emphasized) 75%, var(--lanify-colors-bg-emphasized))',
            ].join(', ')}
            border="1px solid rgba(255,255,255,0.8)"
            display="grid"
            h="250px"
            my={4}
            overflow="hidden"
            placeItems="center"
            rounded="lg"
            shadow="0 18px 40px rgba(17,16,13,0.10)"
            w="250px"
          >
            {previewImage ? (
              <Image
                alt={profile.displayName}
                h="100%"
                maxH="100%"
                w="100%"
                maxW="100%"
                objectFit="contain"
                src={previewImage}
              />
            ) : (
              <Box
                alignItems="center"
                bgColor={'primary.50'}
                color="rgba(27,24,19,0.76)"
                display="grid"
                h="250px"
                placeItems="center"
                w="250px"
              >
                <Avatar height="100%" width="100%" />
              </Box>
            )}
          </Box>

          <Input
            accept={SUPPORTED_IMAGE_ACCEPT}
            display="none"
            onChange={handleUpload}
            ref={fileInputRef}
            type="file"
          />
          <Stack gap="3" w="full">
            {uploadError ? (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>{uploadError}</Alert.Description>
                </Alert.Content>
              </Alert.Root>
            ) : null}
            {hasProfilePicture ? (
              <>
                <Button rounded="full" w="full" onClick={onRequestOpenEditor} variant="surface">
                  <EditIcon />
                  Edit Current Picture
                </Button>
                <Button
                  rounded="full"
                  onClick={() =>
                    updateProfile((current) => ({
                      ...current,
                      avatarUrl: null,
                      avatarTransparentUrl: null,
                    }))
                  }
                  variant="surface"
                  w="full"
                >
                  <DeleteIcon />
                  Remove Picture
                </Button>
              </>
            ) : (
              <>
                <Button
                  rounded="full"
                  onClick={() => fileInputRef.current?.click()}
                  variant="surface"
                  w="full"
                >
                  <UploadIcon />
                  Upload new picture
                </Button>
                <Button rounded="full" w="full" onClick={openCamera} variant="surface">
                  <Camera />
                  Take a photo
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </HStack>

      <Dialog.Root
        lazyMount
        motionPreset="slide-in-bottom"
        open={isCameraOpen}
        placement="center"
        size={{ base: 'full', md: 'lg' }}
        onOpenChange={(details) => {
          if (!details.open) {
            closeCamera()
          }
        }}
      >
        <Portal>
          <Dialog.Backdrop backdropBlur="sm" backdropFilter="auto" bg="blackAlpha.700" />
          <Dialog.Positioner px={{ base: '0', md: '4' }}>
            <Dialog.Content borderRadius={{ base: 'none', md: '3xl' }} overflow="hidden" minH={'0'}>
              {/* <Dialog.Header pb="2">
                <Dialog.Title>Take a profile photo</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header> */}
              <Dialog.Body p="0">
                <Stack gap="4">
                  <Box
                    aspectRatio={3 / 4}
                    bg="black"
                    borderRadius="2xl"
                    overflow="hidden"
                    position="relative"
                  >
                    <video
                      autoPlay
                      muted
                      playsInline
                      ref={videoRef}
                      style={{
                        height: '100%',
                        inset: 0,
                        objectFit: 'contain',
                        position: 'absolute',
                        width: '100%',
                      }}
                    />
                    {cameraError ? (
                      <Box
                        alignItems="center"
                        display="flex"
                        inset="0"
                        justifyContent="center"
                        pointerEvents="none"
                        position="absolute"
                        maxW={'320px'}
                        left="50%"
                        top={'50%'}
                        transform="translate(-50%, -50%)"
                        opacity={0.6}
                      >
                        <Alert.Root status="error">
                          <Alert.Indicator />
                          <Alert.Content>
                            <Alert.Description>{cameraError}</Alert.Description>
                          </Alert.Content>
                        </Alert.Root>
                      </Box>
                    ) : null}
                    <Box
                      alignItems="center"
                      display={isCameraLoading ? 'none' : 'flex'}
                      inset="0"
                      justifyContent="center"
                      pointerEvents="none"
                      position="absolute"
                      maxW={'320px'}
                      left="50%"
                      top={'50%'}
                      transform="translate(-50%, -50%)"
                      opacity={0.6}
                    >
                      <FaceGuide height="72%" width="72%" />
                    </Box>
                    {isCameraLoading ? (
                      <Stack
                        align="center"
                        bg="blackAlpha.700"
                        color="white"
                        gap="3"
                        inset="0"
                        justify="center"
                        position="absolute"
                      >
                        <Spinner size="lg" />
                        <Text fontSize="sm">Starting camera...</Text>
                      </Stack>
                    ) : null}
                  </Box>

                  <HStack
                    position={'absolute'}
                    bottom={'64px'}
                    left={'50%'}
                    transform="translateX(-50%)"
                    flexWrap="wrap"
                    gap="3"
                    justify="space-between"
                  >
                    <Button
                      colorPalette="primary"
                      loading={isCapturing}
                      onClick={capturePhoto}
                      rounded="full"
                      size={'xl'}
                    >
                      <Camera />
                      Capture Photo
                    </Button>
                  </HStack>
                  <HStack
                    position={'absolute'}
                    bottom={'24px'}
                    right={'24px'}
                    flexWrap="wrap"
                    gap="3"
                    justify="space-between"
                  >
                    <Button onClick={closeCamera} rounded="full" variant="surface">
                      <CloseIcon />
                      Cancel
                    </Button>
                  </HStack>
                  <HStack
                    position={'absolute'}
                    bottom={'24px'}
                    left={'24px'}
                    justify="space-between"
                  >
                    {/* <Button onClick={toggleCameraFacingMode} rounded="full" variant="surface">
                      Use {cameraFacingMode === 'user' ? 'Back Camera' : 'Selfie Camera'}
                    </Button> */}
                    <IconButton onClick={toggleCameraFacingMode} variant="surface">
                      <SwitchCamera />
                    </IconButton>
                  </HStack>
                </Stack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}
