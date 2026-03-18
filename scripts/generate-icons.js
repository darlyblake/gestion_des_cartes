/**
 * Script pour générer les icônes PWA à partir d'une icône source
 * Utilise sharp pour le traitement d'images
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [
  { name: 'icon-16x16.png', size: 16 },
  { name: 'icon-32x32.png', size: 32 },
  { name: 'icon-70x70.png', size: 70 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-150x150.png', size: 150 },
  { name: 'icon-152x152.png', size: 152 },
  { name: 'icon-167x167.png', size: 167 },
  { name: 'icon-180x180.png', size: 180 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-310x310.png', size: 310 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
]

const appleSizes = [
  { name: 'apple-icon-152x152.png', size: 152 },
  { name: 'apple-icon-167x167.png', size: 167 },
  { name: 'apple-icon-180x180.png', size: 180 },
]

async function generateIcons() {
  const sourceIcon = path.join(__dirname, '../public/icon.png')
  const iconsDir = path.join(__dirname, '../public/icons')
  
  // Créer le répertoire des icônes s'il n'existe pas
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }

  // Vérifier si l'icône source existe
  if (!fs.existsSync(sourceIcon)) {
    console.log('⚠️  icône source non trouvée: public/icon.png')
    console.log('📝 Veuillez ajouter une icône 512x512px nommée "icon.png" dans le dossier public/')
    return
  }

  try {
    // Générer les icônes standards
    console.log('🎨 Génération des icônes PWA...')
    
    for (const { name, size } of sizes) {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 90 })
        .toFile(path.join(iconsDir, name))
      
      console.log(`✅ ${name} (${size}x${size})`)
    }

    // Générer les icônes Apple
    console.log('\n🍎 Génération des icônes Apple...')
    
    for (const { name, size } of appleSizes) {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 90 })
        .toFile(path.join(iconsDir, name))
      
      console.log(`✅ ${name} (${size}x${size})`)
    }

    // Générer le favicon.ico
    console.log('\n🔧 Génération du favicon.ico...')
    await sharp(sourceIcon)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(path.join(__dirname, '../public/favicon.ico'))

    console.log('✅ favicon.ico généré')
    
    console.log('\n🎉 Toutes les icônes PWA ont été générées avec succès!')
    console.log('📁 Répertoire: public/icons/')
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération des icônes:', error)
    process.exit(1)
  }
}

// Exécuter le script
generateIcons()
