import React, { FC } from 'react'

interface Props {
  className?: string
  width?: string
  height?: string
}

export const FlipHorizontallyIcon: FC<Props> = ({ className, width = '24px', height = '24px' }) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3"></path>
      <path d="M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3"></path>
      <line x1="12" x2="12" y1="4" y2="20"></line>
    </svg>
  )
}
