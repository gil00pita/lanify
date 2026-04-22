import { Icon } from '@chakra-ui/react'
import React, { FC } from 'react'

interface Props {
  className?: string
  width?: string
  height?: string
}

export const ZoomPlusIcon: FC<Props> = ({
  className,
  width = '150px',
  height = '196px',
  ...props
}) => {
  return (
    <Icon
      as="svg"
      width={width}
      height={height}
      className={className}
      viewBox="0 0 150 196"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M135.905 0L149.848 23.5635L89.834 158.068H89.7812L89.7822 193.518C89.7822 194.731 88.7966 195.717 87.583 195.717H67.0791C65.8656 195.717 64.8809 194.731 64.8809 193.518L64.8799 158.068L0 23.5635L13.5352 0H135.905ZM76.9111 131.388L126.529 20.8818H23.6074L76.9111 131.388Z"
        fill="currentColor"
      />
      <g opacity="0.2" style={{ mixBlendMode: 'multiply' }}>
        <path d="M89.7819 163.111H64.8804V177.889H89.7819V163.111Z" fill="#333333" />
      </g>
      <g opacity="0.5" style={{ mixBlendMode: 'multiply' }}>
        <path d="M135.905 0H13.5352L23.5 20.8822H126.5L135.905 0Z" fill="#777777" />
      </g>
      <g opacity="0.5" style={{ mixBlendMode: 'multiply' }}>
        <path d="M135.906 0L149.848 23.5635L89.8336 158.068H64.9321L135.906 0Z" fill="#999999" />
      </g>
      <g opacity="0.5" style={{ mixBlendMode: 'multiply' }}>
        <path d="M13.5354 0L0 23.5635L64.8802 158.068H89.7817L13.5354 0Z" fill="#CCCCCC" />
      </g>
    </Icon>
  )
}
