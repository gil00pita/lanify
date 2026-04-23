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
      transition="fill 0.2s ease-in-out"
      {...props}
    >
      <path
        d="M625 0C676.362 0 718 41.6375 718 93V1107C718 1158.36 676.362 1200 625 1200H93C41.6375 1200 3.86606e-07 1158.36 0 1107V93C0 41.6375 41.6375 1.4496e-06 93 0H625ZM297 70C292.029 70 288 74.0294 288 79C288 83.9706 292.029 88 297 88H421C425.971 88 430 83.9706 430 79C430 74.0294 425.971 70 421 70H297Z"
        fill="currentColor"
      />
    </Icon>
  )
}
