import React, { FC } from 'react'

interface Props {
  className?: string
  width?: string
  height?: string
}

export const SwitchCamera: FC<Props> = ({ className, width = '24px', height = '24px' }) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      stroke="currentColor"
      fill="none"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke-linecap="round"
      stroke-linejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"></path>
      <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5"></path>
      <circle cx="12" cy="12" r="3"></circle>
      <path d="m18 22-3-3 3-3"></path>
      <path d="m6 2 3 3-3 3"></path>
    </svg>
  )
}
