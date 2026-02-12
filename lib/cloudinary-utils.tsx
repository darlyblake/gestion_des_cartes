/**
 * Utilitaires pour optimiser les images avec Cloudinary
 * Offre lazy loading, compression, et formats modernes
 */
import Image from 'next/image'


/**
 * Options d'optimisation d'image Cloudinary
 */
interface CloudinaryOptimisationOptions {
  /** Largeur en pixels */
  width?: number
  /** Hauteur en pixels */
  height?: number
  /** Format: auto, webp, jpg, png */
  format?: 'auto' | 'webp' | 'jpg' | 'png'
  /** Qualité (1-100, auto pour auto-detect) */
  qualite?: number | 'auto'
  /** Mode crop: fill, thumb, scale, fit, crop */
  crop?: 'fill' | 'thumb' | 'scale' | 'fit' | 'crop'
  /** Comprimer le tout */
  compresser?: boolean
  /** Appliquer transformations supplémentaires */
  transformations?: string
}

/**
 * Optimise une URL Cloudinary avec les paramètres de transformation
 * @param url - URL originale (doit contenir /upload/)
 * @param options - Options d'optimisation
 * @returns URL optimisée
 */
export function optimiserUrlCloudinary(
  url: string,
  options: CloudinaryOptimisationOptions = {}
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }

  const {
    width,
    height,
    format = 'auto',
    qualite = 'auto',
    crop = 'fill',
    compresser = true,
    transformations,
  } = options

  // Construire les transformations
  const transforms: string[] = []

  // Format et qualité (base64 pour cache buster)
  if (format === 'auto') {
    transforms.push('q_auto')
    transforms.push('f_auto')
  } else {
    transforms.push(`f_${format}`)
    if (typeof qualite === 'number') {
      transforms.push(`q_${qualite}`)
    } else {
      transforms.push('q_auto')
    }
  }

  // Dimensions
  if (width || height) {
    const w = width ? `w_${width}` : ''
    const h = height ? `h_${height}` : ''
    const c = `c_${crop}`

    if (w && h) {
      transforms.push(`${w},${h},${c}`)
    } else if (w) {
      transforms.push(`${w},c_scale`)
    } else if (h) {
      transforms.push(`${h},c_scale`)
    }
  }

  // Compression
  if (compresser && format !== 'png') {
    transforms.push('fl_progressive')
  }

  // Transformations additionnelles
  if (transformations) {
    transforms.push(transformations)
  }

  // Remplacer /upload/ par /upload/[transformations]/
  const transformationString = transforms.join(',')
  const optimisedUrl = url.replace('/upload/', `/upload/${transformationString}/`)

  return optimisedUrl
}

/**
 * Génère des URLs srcset pour responsive images
 * @param url - URL Cloudinary
 * @param tailles - Largeurs souhaitées
 * @param format - Format d'image
 * @returns String srcset
 */
export function genererSrcset(
  url: string,
  tailles: number[] = [320, 640, 1024],
  format: 'auto' | 'webp' | 'jpg' = 'auto'
): string {
  return tailles
    .map(width => {
      const optimisedUrl = optimiserUrlCloudinary(url, {
        width,
        format,
        qualite: 'auto',
      })
      return `${optimisedUrl} ${width}w`
    })
    .join(', ')
}

/**
 * Props pour le composant OptimisedImage
 */
interface OptimisedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** URL Cloudinary */
  src: string
  /** Alt text requis */
  alt: string
  /** Largeur souhaitée */
  width?: number
  /** Hauteur souhaitée */
  height?: number
  /** Afficher le placeholder pendant le chargement */
  avecPlaceholder?: boolean
  /** Format image (auto détecte webp si supporté) */
  format?: 'auto' | 'webp' | 'jpg'
  /** Enabling lazy loading strategy */
  lazyLoading?: 'lazy' | 'eager'
  /** Classe CSS additionnelle */
  className?: string
}

/**
 * Composant Image optimisée pour Cloudinary
 * Gère lazy loading, compression, et formats modernes
 */
export function OptimisedImage({
  src,
  alt,
  width,
  height,
  avecPlaceholder = true,
  format = 'auto',
  lazyLoading = 'lazy',
  className = '',
  ...props
}: OptimisedImageProps) {
  // Optimiser l'URL
  const optimisedSrc = optimiserUrlCloudinary(src, {
    width,
    height,
    format,
    qualite: 'auto',
  })

  // Générer srcset si dimensions disponibles
  const srcSet =
    width || height
      ? genererSrcset(
          src,
          width ? [width * 0.5, width, width * 1.5] : [320, 640, 1024],
          format === 'auto' ? 'auto' : format
        )
      : undefined

  return (
    <Image
      {...props}
      src={optimisedSrc}
      alt={alt}
      loading={lazyLoading === 'lazy' ? 'lazy' : 'eager'}
      className={`${avecPlaceholder ? 'bg-gray-200' : ''} ${className}`.trim()}
      fill
      sizes="(max-width: 768px) 100vw, 1280px"
    />
  )
}

/**
 * Précharge une image (pour hero images, etc.)
 */
export function préchargerImage(url: string): void {
  if (!url || !url.includes('cloudinary.com')) return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = optimiserUrlCloudinary(url, {
    width: 1200,
    format: 'auto',
    qualite: 'auto',
  })
  document.head.appendChild(link)
}

/**
 * Détecte si le navigateur supporte WebP
 */
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 5
}

/**
 * Crée une balise picture optimisée
 */
export function creerPicture(
  url: string,
  alt: string,
  options?: CloudinaryOptimisationOptions
): string {
  const urlWebP = optimiserUrlCloudinary(url, {
    ...options,
    format: 'webp',
  })

  const urlFallback = optimiserUrlCloudinary(url, {
    ...options,
    format: 'jpg',
  })

  return `
    <picture>
      <source srcset="${urlWebP}" type="image/webp" />
      <img src="${urlFallback}" alt="${alt}" loading="lazy" />
    </picture>
  `
}

export { OptimisedImage as CloudinaryImage }
