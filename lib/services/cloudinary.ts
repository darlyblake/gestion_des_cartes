/**
 * Service Cloudinary
 * Gère les uploads d'images vers Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary'

/**
 * Configure Cloudinary avec les variables d'environnement
 */
function configureCloudinary() {
  const cloudName = process.env.NOM_CLOUDINAIRE_CLOUD
  const apiKey = process.env.CLÉ_API_CLOUDINAIRE
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  console.warn('Configuration Cloudinary:', {
    cloudName: !!cloudName ? '✓' : '✗',
    apiKey: !!apiKey ? '✓' : '✗',
    apiSecret: !!apiSecret ? '✓' : '✗',
  })

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Configuration Cloudinary manquante. Vérifiez les variables d\'environnement: NOM_CLOUDINAIRE_CLOUD, CLÉ_API_CLOUDINAIRE, CLOUDINARY_API_SECRET'
    )
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })

  console.warn('✓ Cloudinary configuré')
}

/**
 * Upload une image vers Cloudinary
 * @param buffer - Buffer du fichier
 * @param filename - Nom du fichier
 * @param folder - Dossier Cloudinary où stocker l'image
 */
async function uploadImage(
  buffer: Buffer,
  filename: string,
  folder: string = 'school-card'
): Promise<string> {
  try {
    configureCloudinary()

    // Créer un stream depuis le buffer avec timeout plus long
    const result = await new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Upload Cloudinary timeout après 30 secondes'))
      }, 30000) // 30 secondes de timeout

      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename.split('.')[0],
          resource_type: 'auto',
          timeout: 30000, // Augmenter le timeout à 30s
        },
        (error, result) => {
          clearTimeout(timeoutId)
          if (error) reject(error)
          else resolve(result as { public_id: string; secure_url: string })
        }
      )

      stream.on('error', (error) => {
        clearTimeout(timeoutId)
        reject(error)
      })

      stream.end(buffer)
    })

    console.warn('✓ Image uploadée sur Cloudinary:', result.secure_url)
    return result.secure_url
  } catch (error) {
    console.error('✗ Erreur lors de l\'upload Cloudinary:', error)
    throw error
  }
}

/**
 * Supprime une image de Cloudinary
 * @param publicId - ID public de l'image dans Cloudinary
 */
async function deleteImage(publicId: string): Promise<void> {
  try {
    configureCloudinary()

    await cloudinary.uploader.destroy(publicId)
    console.warn('✓ Image supprimée de Cloudinary:', publicId)
  } catch (error) {
    console.error('✗ Erreur lors de la suppression Cloudinary:', error)
    throw error
  }
}

export { uploadImage, deleteImage, configureCloudinary }
