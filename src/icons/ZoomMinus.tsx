import React, { FC } from 'react'

interface Props {
  className?: string
  width?: string
  height?: string
}

export const ZoomMinusIcon: FC<Props> = ({ className, width = '24px', height = '24px' }) => {
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
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
      <line x1="8" x2="14" y1="11" y2="11"></line>
    </svg>
  )
}
