import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'transparent' | 'white'
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
}

export function Logo({ 
  className, 
  size = 'md',
  variant = 'transparent'
}: LogoProps) {
  const dimensions = sizeMap[size]
  const src = `/branding/logo-${variant}.png`
  
  return (
    <div className={cn('relative', className)}>
      <Image
        src={src}
        alt="TonIQ Logo"
        width={dimensions}
        height={dimensions}
        className="object-contain"
        priority
      />
    </div>
  )
} 