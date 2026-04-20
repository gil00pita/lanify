import { FC } from 'react'

interface Props {
  className?: string
  width?: string | number
  height?: string | number
}

export const ContrastIcon: FC<Props> = ({ className, width = '24px', height = '24px' }) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 4.4c-4.2 0-7.6 3.4-7.6 7.6s3.4 7.6 7.6 7.6 7.6-3.4 7.6-7.6-3.4-7.6-7.6-7.6zM5.9 12c0-3.3 2.7-6.1 6.1-6.1V18c-3.3.1-6.1-2.7-6.1-6z"
        fill="currentColor"
      />
    </svg>
  )
}
