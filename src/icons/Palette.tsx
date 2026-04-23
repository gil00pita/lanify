import { Icon } from '@chakra-ui/react'
import React, { FC } from 'react'

interface Props {
  className?: string
  width?: string
  height?: string
}

export const Palette: FC<Props> = ({ className, width = '24px', height = '24px', ...props }) => {
  return (
    <Icon
      as="svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      height={height}
      width={width}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        stroke="currentColor"
      ></path>
    </Icon>
  )
}
