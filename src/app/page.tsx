import { Box, Heading, Text } from '@chakra-ui/react'

export default function Home() {
  return (
    <Box display="grid" minH="100vh" placeItems="center" px="6">
      <Box textAlign="center">
        <Heading size="2xl">Chakra UI + Next.js</Heading>
        <Text color="fg.muted" mt="4">
          Your empty starter repository is ready.
        </Text>
      </Box>
    </Box>
  )
}
