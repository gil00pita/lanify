"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

export function Provider(props: { children: React.ReactNode }) {
  const { children } = props;

  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
}
