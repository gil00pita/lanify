import { FC } from 'react'

interface Props {
  className?: string
  width?: string
  height?: string
}

export const BackgroundIcon: FC<Props> = ({ className, width = '24px', height = '24px' }) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      x="0"
      y="0"
      viewBox="0 0 24 24"
      xmlSpace="preserve"
      fillRule="evenodd"
    >
      <path
        d="M22.75 10A2.75 2.75 0 0 0 20 7.25H10A2.75 2.75 0 0 0 7.25 10v10A2.75 2.75 0 0 0 10 22.75h10A2.75 2.75 0 0 0 22.75 20zm-1.5 0v10c0 .69-.56 1.25-1.25 1.25H10c-.69 0-1.25-.56-1.25-1.25V10c0-.69.56-1.25 1.25-1.25h10c.69 0 1.25.56 1.25 1.25zM6.25 13.811 3.381 16.68c.199.046.406.07.619.07h2.25zm.313-5.313L1.25 13.811V14c0 .744.295 1.419.775 1.914l4.225-4.225V10c0-.534.112-1.043.313-1.502zm5.126-7.248L1.25 11.689V8.811L8.811 1.25zm-5 0H4A2.75 2.75 0 0 0 1.25 4v2.689zm1.809 5.313A3.739 3.739 0 0 1 10 6.25h1.689l4.225-4.225A2.74 2.74 0 0 0 14 1.25h-.189zm5.313-.313h2.939V4c0-.213-.024-.42-.07-.619z"
        fill="currentColor"
        opacity="1"
      ></path>
    </svg>
  )
}
