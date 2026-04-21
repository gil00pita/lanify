import { Icon } from '@chakra-ui/react'
import React, { FC } from 'react'

interface Props {
  className?: string
  width?: string
  height?: string
}

export const ZoomPlusIcon: FC<Props> = ({
  className,
  width = '138px',
  height = '24px',
  ...props
}) => {
  return (
    <Icon
      as="svg"
      width={width}
      height={height}
      className={className}
      viewBox="0 0 138 214"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M129.942 0.762939C133.926 0.763203 137.156 3.99351 137.156 7.97778V206.785C137.156 210.77 133.926 214 129.942 214H7.83081C3.84633 214 0.616 210.77 0.615967 206.785V7.97778C0.616156 3.99334 3.84643 0.762939 7.83081 0.762939H129.942ZM12.4187 30.8586C11.0884 30.8586 10.0097 31.9366 10.0095 33.2668V202.031C10.0095 203.361 11.0883 204.44 12.4187 204.44H125.354C126.685 204.44 127.763 203.361 127.763 202.031V33.2668C127.763 31.9366 126.685 30.8586 125.354 30.8586H12.4187ZM58.3308 9.74731C55.4808 9.74731 53.1698 12.0574 53.1697 14.9075C53.1697 17.7576 55.4807 20.0686 58.3308 20.0686H79.4421C82.2921 20.0684 84.6023 17.7574 84.6023 14.9075C84.6022 12.0576 82.292 9.74752 79.4421 9.74731H58.3308Z"
        fill="currentColor"
      />
    </Icon>
  )
}
