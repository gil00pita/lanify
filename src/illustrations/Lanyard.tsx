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
      viewBox="0 0 150 329"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      transition="fill 0.2s ease-in-out"
      {...props}
    >
      {defs}

      <path
        d="M136.076 0.283203L150.076 24.2832L87 291.068V326.784C87 328.007 86.0505 329 84.8809 329H65.1191C63.9496 329 63 328.007 63 326.784V291.068L0.0761719 24.2832L14.0762 0.283203H136.076ZM75.0117 243.268L130.828 21.166H19.3135L75.0117 243.268Z"
        fill={paint || 'currentColor'}
      />
      <g opacity="0.2" style={{ mixBlendMode: 'multiply' }}>
        <path d="M87 296H63V311H87V296Z" fill="#333333" />
      </g>
      <g opacity="0.5" style={{ mixBlendMode: 'multiply' }}>
        <path
          d="M136.076 0.283447H14.0759L19.3254 21.1656H130.826L136.076 0.283447Z"
          fill="#777777"
        />
      </g>
      <g opacity="0.5" style={{ mixBlendMode: 'multiply' }}>
        <path
          d="M136.076 0.283447L150.076 24.2834L87.0001 291.068H63.0002L136.076 0.283447Z"
          fill="#999999"
        />
      </g>
      <g opacity="0.5" style={{ mixBlendMode: 'multiply' }}>
        <path
          d="M14.0759 0.283447L0.0759277 24.2834L63 291.068H87L14.0759 0.283447Z"
          fill="#CCCCCC"
        />
      </g>
    </Icon>
  )
}
