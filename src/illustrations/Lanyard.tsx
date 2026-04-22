import { Icon } from '@chakra-ui/react'
import { FC, ReactNode } from 'react'

interface Props {
  className?: string
  defs?: ReactNode
  width?: string
  height?: string
  paint?: string
}

export const ZoomPlusIcon: FC<Props> = ({
  className,
  defs,
  width = '150px',
  height = '196px',
  paint,
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
      {defs}
      <path
        d="M135.905 0L149.848 23.5635L87 158.068V193.784C87 195.007 86.0505 196 84.8809 196H65.1191C63.9496 196 63 195.007 63 193.784V158.068L0 23.5635L13.5352 0H135.905ZM74.9541 132.149L126.274 20.8818H23.2402L74.9541 132.149Z"
        fill={paint || 'currentColor'}
      />
      <g opacity="0.2" style={{ mixBlendMode: 'multiply' }}>
        <path d="M87 163H63V178H87V163Z" fill="#333333" />
      </g>
      <g opacity="0.5" style={{ mixBlendMode: 'multiply' }}>
        <path d="M135.905 0H13.5352L23.5 20.8822H126.5L135.905 0Z" fill="#777777" />
      </g>
      <g opacity="0.5" style={{ mixBlendMode: 'multiply' }}>
        <path d="M135.905 0L149.848 23.5635L86.9999 158.068H63L135.905 0Z" fill="#999999" />
      </g>
      <g opacity="0.5" style={{ mixBlendMode: 'multiply' }}>
        <path d="M13.5354 0L0 23.5635L63 158.068H87L13.5354 0Z" fill="#CCCCCC" />
      </g>
    </Icon>
  )
}
