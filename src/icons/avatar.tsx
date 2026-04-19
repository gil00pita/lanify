import React, { FC } from 'react'

interface Props {
  className?: string
  width?: string
  height?: string
}

export const Avatar: FC<Props> = ({ className, width = '252px', height = '252px' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 252 252"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clip-path="url(#clip0_36_1657)">
        <path
          d="M160.5 183V157L90.5 154C90.6667 162 90.9 179.9 90.5 187.5C90.1 195.1 79 199 73.5 200L71 211.5L128 234L183.5 216C183.833 211.116 182.078 200.371 172 198C163.5 196 160.5 188 160.5 183Z"
          fill="url(#paint0_linear_36_1657)"
        />
        <path
          opacity="0.5"
          d="M160.5 157L160 164.885C146.375 182.755 127 192.5 90.5195 187.052C90.8883 179.217 90.6635 161.847 90.5 154L160.5 157Z"
          fill="#CBC3E6"
        />
        <path
          d="M84.9386 195C77.9623 195 41.4995 203.741 29.9998 212.919C18.5001 222.096 12.9995 250 13 255.5C13.0005 261 123.745 254 123.745 254C151.495 256.423 217.824 268.072 235.5 258.5C235.5 239.5 230.032 226.407 216.181 212.919C207.5 204.464 178.683 198.059 166.475 195C161.679 208.548 145.371 222.096 123.745 222.096C102.118 222.096 85.8107 203.303 84.9386 195Z"
          fill="#5236AB"
        />
        <path
          d="M71.4053 136.135C72.8535 137.593 76.4338 136.742 78.043 136.135C77.4394 120.947 75.0255 90.4499 70.1981 89.9639C64.1638 89.3564 62.3539 100.292 61.147 106.367C59.9401 112.442 69.595 134.312 71.4053 136.135Z"
          fill="url(#paint1_linear_36_1657)"
        />
        <path
          d="M180.681 136.135C179.232 137.593 175.652 136.742 174.043 136.135C174.647 120.947 177.06 90.4499 181.888 89.9639C187.922 89.3564 189.732 100.292 190.939 106.367C192.146 112.442 182.491 134.312 180.681 136.135Z"
          fill="url(#paint2_linear_36_1657)"
        />
        <path
          d="M132.633 28.951C152.993 28.4415 188.623 44.7564 180.988 112.563C174.88 166.809 142.813 182.75 127.543 183.94H125.507L125.506 183.936C110.221 182.723 78.2009 166.765 72.0978 112.563C64.5821 45.8158 98.9892 28.9644 119.487 28.9401L132.633 28.951Z"
          fill="url(#paint3_linear_36_1657)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_36_1657"
          x1="127"
          y1="229"
          x2="157.098"
          y2="178.452"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="white" />
          <stop offset="1" stop-color="#E6E3F3" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_36_1657"
          x1="73.1115"
          y1="134.312"
          x2="68.5933"
          y2="97.9731"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#E6E3F3" />
          <stop offset="1" stop-color="#CBC3E6" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_36_1657"
          x1="194.56"
          y1="120.339"
          x2="174.233"
          y2="109.651"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.216346" stop-color="white" />
          <stop offset="1" stop-color="#E6E3F3" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_36_1657"
          x1="182.267"
          y1="112.307"
          x2="70.7472"
          y2="110.017"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="white" />
          <stop offset="1" stop-color="#E6E3F3" />
        </linearGradient>
        <clipPath id="clip0_36_1657">
          <rect width="252" height="252" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
