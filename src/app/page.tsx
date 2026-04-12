import { Box, Heading, Text } from "@chakra-ui/react";

export default function Home() {
  return (
    <Box minH="100vh" display="grid" placeItems="center" px="6">
      <Box textAlign="center">
        <Heading size="2xl">Chakra UI + Next.js</Heading>
        <Text mt="4" color="fg.muted">
          Your empty starter repository is ready.
        </Text>
      </Box>
    </Box>
  );
}
