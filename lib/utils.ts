import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Normalise une couleur CSS vers un format supporté
 * Convertit les formats non standard (lab, lch, etc.) en hex
 * @param color - La couleur à normaliser
 * @returns Une couleur CSS valide au format hex ou rgb
 */
export function normaliserCouleur(color: string | undefined | null): string {
  if (!color) return '#000000'

  // Si c'est déjà un hex, rgb, ou rgba, retourner tel quel
  if (color.match(/^#[0-9A-Fa-f]{3,8}$/) || color.match(/^rgb/) || color.match(/^hsl/)) {
    return color
  }

  // Gestion des formats non supportés (lab, lch, hwb, etc.)
  if (color.match(/^lab\(/) || color.match(/^lch\(/) || color.match(/^hwb\(/)) {
    // Convertir en couleur par défaut ou tenter une extraction
    return '#3b82f6' // bleu par défaut
  }

  // Si c'est un nom de couleur CSS supporté, retourner tel quel
  const cssColors = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
    'gray', 'black', 'white', 'cyan', 'magenta', 'lime', 'navy', 'teal',
    'maroon', 'olive', 'coral', 'salmon', 'gold', 'silver', 'indigo', 'violet'
  ]
  if (cssColors.includes(color.toLowerCase())) {
    return color
  }

  // Fallback
  return '#3b82f6'
}
