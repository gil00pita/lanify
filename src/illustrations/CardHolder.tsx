import { Icon } from '@chakra-ui/react'
import React, { FC } from 'react'

interface Props {
  className?: string
  width?: string
  height?: string
}

export const ZoomPlusIcon: FC<Props> = ({
  className,
  width = '718px',
  height = '1200px',
  ...props
}) => {
  return (
    <Icon
      as="svg"
      width={width}
      height={height}
      className={className}
      viewBox="0 0 718 1200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M676.966 0.000213623C699.371 0.000213623 717.536 18.1731 717.536 40.591V1159.11C717.536 1181.53 699.371 1199.7 676.966 1199.7H40.5693C18.1639 1199.7 0 1181.53 0 1159.11V40.591C3.70949e-05 18.1732 18.1639 0.00036214 40.5693 0.000213623H676.966ZM287 69.0002C282.029 69.0002 278 73.0297 278 78.0002C278 82.9707 282.03 87.0002 287 87.0002H431C435.97 87.0002 440 82.9707 440 78.0002C440 73.0297 435.971 69.0002 431 69.0002H287Z"
        fill="currentColor"
      />
    </Icon>
  )
}
