import { useState } from 'react'

const PRIMARY_LOGO = '/logo-lawfirm.png'
const FALLBACK_LOGO = '/favicon.svg'

export default function BrandLogo({ className = '', alt = 'Logo Wil Law Firm' }) {
  const [src, setSrc] = useState(PRIMARY_LOGO)

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
      onError={() => {
        if (src !== FALLBACK_LOGO) setSrc(FALLBACK_LOGO)
      }}
    />
  )
}