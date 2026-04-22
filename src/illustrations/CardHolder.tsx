import { Icon } from '@chakra-ui/react'
import { FC } from 'react'

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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M677.404 0.000213623C699.824 0.000338378 718 18.1775 718 40.6008V1159.4C718 1181.82 699.824 1200 677.404 1200H40.5957C18.1757 1200 0 1181.82 0 1159.4V40.6008C0.000177866 18.1775 18.1758 0.000302054 40.5957 0.000213623H677.404ZM297 70.0002C292.029 70.0002 288 74.0297 288 79.0002C288 83.9707 292.03 88.0002 297 88.0002H421C425.97 88.0002 430 83.9707 430 79.0002C430 74.0297 425.971 70.0002 421 70.0002H297Z"
        fill="currentColor"
      />
    </Icon>
  )
}
