import logoImage from '../../assets/images/Estimativa_logo_final.png'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showSubtitle?: boolean
}

const sizes = {
  sm: 'w-24',
  md: 'w-36',
  lg: 'w-48',
  xl: 'w-64',
}

export default function Logo({ size = 'lg', className = '', showSubtitle = false }: LogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src={logoImage}
        alt="Estimativa"
        className={`${sizes[size]} h-auto drop-shadow-lg`}
      />
      {showSubtitle && (
        <p className="text-white/60 text-sm mt-2">Placar Digital</p>
      )}
    </div>
  )
}
