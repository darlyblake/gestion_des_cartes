# Configuration MongoDB Atlas et Cloudinary

## 📋 Prérequis

- Node.js 18+
- npm ou pnpm
- Compte MongoDB Atlas
- Compte Cloudinary

## 🚀 Configuration

### 1. MongoDB Atlas

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Créez un utilisateur de base de données
4. Récupérez votre URI de connexion (format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`)

### 2. Cloudinary

1. Créez un compte sur [Cloudinary](https://cloudinary.com/)
2. Récupérez vos identifiants depuis le Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 3. Variables d'environnement

Modifiez le fichier `.env.local` à la racine du projet:

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school-card?retryWrites=true&w=majority
MONGODB_DB_NAME=school-card

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📁 Structure des données MongoDB

L'application utilise 3 collections:

### **etablissements**
```javascript
{
  _id: ObjectId,
  nom: String,
  logo: String (URL Cloudinary ou null),
  adresse: String,
  telephone: String,
  anneeScolaire: String,
  couleur: String,
  police: String,
  creeLe: Date,
  modifieLe: Date
}
```

### **classes**
```javascript
{
  _id: ObjectId,
  nom: String,
  niveau: String,
  etablissementId: String (ObjectId),
  creeLe: Date,
  modifieLe: Date
}
```

### **eleves**
```javascript
{
  _id: ObjectId,
  nom: String,
  prenom: String,
  dateNaissance: Date,
  lieuNaissance: String,
  sexe: String (M ou F),
  photo: String (URL Cloudinary ou null),
  matricule: String,
  classeId: String (ObjectId),
  creeLe: Date,
  modifieLe: Date
}
```

## 🖼️ Stockage des images

Les images sont organisées dans Cloudinary:
- **Logos**: `/school-card/logos/`
- **Photos d'élèves**: `/school-card/photos/`

## 🔗 Routes API

### Établissements
- `GET /api/etablissements` - Récupère tous les établissements
- `GET /api/etablissements/[id]` - Récupère un établissement
- `POST /api/etablissements` - Crée un établissement
- `PUT /api/etablissements/[id]` - Modifie un établissement
- `DELETE /api/etablissements/[id]` - Supprime un établissement

### Classes
- `GET /api/classes` - Récupère toutes les classes
- `GET /api/classes?etablissementId=xxx` - Filtre par établissement
- `GET /api/classes/[id]` - Récupère une classe
- `POST /api/classes` - Crée une classe
- `PUT /api/classes/[id]` - Modifie une classe
- `DELETE /api/classes/[id]` - Supprime une classe

### Élèves
- `GET /api/eleves` - Récupère tous les élèves
- `GET /api/eleves?classeId=xxx` - Filtre par classe
- `GET /api/eleves?etablissementId=xxx` - Filtre par établissement
- `GET /api/eleves/[id]` - Récupère un élève
- `POST /api/eleves` - Crée un élève
- `PUT /api/eleves/[id]` - Modifie un élève
- `DELETE /api/eleves/[id]` - Supprime un élève

### Upload
- `POST /api/upload` - Upload une image vers Cloudinary
  - Paramètres: `image` (File), `type` (logo ou autre)

## 🔧 Services

### MongoDB Service (`lib/services/mongodb.ts`)
- `connectToDatabase()` - Établit la connexion à MongoDB
- `closeDatabase()` - Ferme la connexion
- `getCollection(collectionName)` - Récupère une collection

### Cloudinary Service (`lib/services/cloudinary.ts`)
- `uploadImage(buffer, filename, folder)` - Upload une image
- `deleteImage(publicId)` - Supprime une image
- `configureCloudinary()` - Configure Cloudinary

## 📝 Notes importantes

- Les images ne sont pas stockées localement, elles vont directement sur Cloudinary
- MongoDB Atlas nécessite que votre IP soit whitelistée (configuré automatiquement pour "Accès depuis n'importe où" en développement)
- Les fichiers `.env.local` ne sont jamais commités (dans `.gitignore`)
- Les connexions MongoDB sont cachées pour optimiser les performances

## 🧪 Tester l'application

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Accéder à l'application
# http://localhost:3000
```

## ⚠️ Limitations et considérations

1. **Plan gratuit MongoDB**: 512 MB de stockage
2. **Plan gratuit Cloudinary**: 25 crédits/mois
3. **Authentification**: À implémenter selon vos besoins
4. **Sécurité**: Les API secrets ne doivent jamais être exposés au frontend (côté serveur uniquement)

## 🔐 Sécurité

- `CLOUDINARY_API_SECRET` ne doit être utilisé que côté serveur
- `NEXT_PUBLIC_*` variables sont accessibles au frontend (sans sensibilité)
- Ne commitez jamais votre `.env.local`
