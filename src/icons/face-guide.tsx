import React, { FC } from 'react'

interface Props {
  className?: string
  width?: string
  height?: string
}

export const FaceGuide: FC<Props> = ({ className, width = '132px', height = '157px' }) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 132 157"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#face-guide-a)">
        <path
          stroke="#e6e6e6"
          stroke-linejoin="round"
          stroke-width="2"
          d="M72.632.951c17.874-.447 47.512 12.07 49.322 61.007 5.981-.521 7.783 10.355 8.985 16.408 1.207 6.075-8.449 27.946-10.259 29.769-1.008 1.015-3.049.909-4.739.548-11.322 35.046-35.683 46.266-48.398 47.257h-2.037v-.004c-12.754-1.012-37.158-12.29-48.437-47.484-1.793.512-4.463.892-5.664-.317C9.595 106.312-.06 84.441 1.147 78.366s3.017-17.01 9.05-16.402c.317.032.622.193.917.469C12.719 13.978 41.474.962 59.487.94z"
        />
      </g>
      <defs>
        <clipPath id="face-guide-a">
          <path fill="#fff" d="M0 0h132v157H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}
