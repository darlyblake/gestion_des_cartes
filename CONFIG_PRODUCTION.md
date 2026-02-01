# 🔒 Configuration des Secrets pour Production

## ⚠️ URGENT - À FAIRE MAINTENANT

Votre `.env.local` contient actuellement des **placeholders**. Vous DEVEZ les remplacer par vos vraies credentials.

## 📋 Instructions étape-par-étape

### 1️⃣ Régénérer MongoDB Credentials

**Pourquoi?** Les credentials actuelles étaient **exposées publiquement** (voir historique Git)

**Comment:**
1. Allez sur: https://cloud.mongodb.com/v2/
2. Menu **Database Access**
3. Cliquez **"+ Create New Database User"**
4. Remplissez:
   - Username: `school-card-prod` (nouveau)
   - Password: Générez une nouvelle (→ copier)
5. Cliquez **Create User**

**Récupérer l'URI:**
1. Menu **Databases** → Cluster
2. Bouton **"Connect"**
3. Sélectionnez **"Drivers"** → **Node.js**
4. Copiez la connection string
5. Remplacez `<username>` et `<password>` par vos nouvelles credentials

Résultat:
```
mongodb+srv://school-card-prod:YOUR_NEW_PASSWORD@cluster0.ngjradv.mongodb.net/school-card?retryWrites=true&w=majority
```

### 2️⃣ Régénérer Cloudinary Keys

**Pourquoi?** Les keys actuelles étaient **exposées publiquement**

**Comment:**
1. Allez sur: https://cloudinary.com/console/
2. Settings → **API Keys**
3. Bouton **"Generate New Key"** (ou créer un nouveau token)
4. Copiez:
   - Cloud Name
   - API Key
   - API Secret

### 3️⃣ Mettre à jour .env.local

Éditez `/home/freid-blake/Documents/school-card-application/.env.local`:

```env
# MongoDB - REMPLIR AVEC VOS NOUVELLES CREDENTIALS
MONGODB_URI="mongodb+srv://school-card-prod:YOUR_PASSWORD@cluster0.ngjradv.mongodb.net/school-card?retryWrites=true&w=majority"
MONGODB_DB_NAME="school-card"

# Cloudinary - REMPLIR AVEC VOS NOUVELLES KEYS
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dypxzqb90"  ← Remplacez
NEXT_PUBLIC_CLOUDINARY_API_KEY="333121591735332"  ← Remplacez
CLOUDINARY_API_SECRET="votre_nouvelle_secret"  ← Remplacez
```

### 4️⃣ Valider la configuration

```bash
npm run validate:prod
```

✅ Si c'est vert, vous êtes prêt pour la production!

## 🚨 Sécurité - Checklist avant deployment

- [ ] ✅ MongoDB credentials régénérées
- [ ] ✅ Cloudinary keys régénérées
- [ ] ✅ .env.local mis à jour
- [ ] ✅ Pas de placeholders dans .env.local
- [ ] ✅ npm audit fix exécuté
- [ ] ✅ npm run build réussi
- [ ] ✅ Pas de console.log en production (optionnel)

## ⏱️ Temps estimé: 15-20 minutes

Une fois ces étapes terminées, vous pouvez déployer! 🚀

Voir: [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
