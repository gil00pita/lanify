import React, { FC } from 'react'

interface Props {
  className?: string
  width?: string
  height?: string
}

export const BackChev: FC<Props> = ({ className, width = '24px', height = '24px' }) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="48"
        stroke="currentColor"
        d="M328 112 184 256l144 144"
      ></path>
    </svg>
  )
}
