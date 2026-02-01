# 🔐 Guide de Régénération des Secrets

## ⚠️ CRITIQUE - À faire en PREMIER

Vos secrets actuels sont compromis et exposés en clair. Il FAUT les régénérer.

---

## 1️⃣ Régénérer MongoDB Credentials

### Étape 1: Aller sur MongoDB Atlas
1. Ouvrez: https://cloud.mongodb.com/v2/
2. Connectez-vous avec votre compte
3. Allez dans **Database Access** (menu gauche)

### Étape 2: Créer un nouvel utilisateur
1. Cliquez sur **"+ Add new database user"**
2. Choisissez: **Authentication Method: Password**
3. Username: `school-card-user` (ou un autre nom)
4. Password: **Générez une password sécurisée** (utilisez le générateur)
5. Cliquez **"Add User"**

### Étape 3: Récupérer la nouvelle URI
1. Allez à **Network Access** (menu gauche)
2. Vérifiez que votre IP est autorisée (ajoutez 0.0.0.0/0 si nécessaire)
3. Retour à **Database**
4. Cliquez sur **"Connect"** de votre cluster
5. Sélectionnez **"Drivers"** puis **"Node.js"**
6. Copiez la connection string (exemple):
   ```
   mongodb+srv://school-card-user:<PASSWORD>@cluster0.ngjradv.mongodb.net/school-card?retryWrites=true&w=majority
   ```
7. Remplacez `<PASSWORD>` par votre mot de passe généré

### Résultat
```
MONGODB_URI=mongodb+srv://school-card-user:YOUR_NEW_PASSWORD@cluster0.ngjradv.mongodb.net/school-card?retryWrites=true&w=majority
```

---

## 2️⃣ Régénérer Cloudinary API Keys

### Étape 1: Aller sur Cloudinary
1. Ouvrez: https://cloudinary.com/console/settings/api-keys
2. Connectez-vous avec votre compte

### Étape 2: Récupérer les clés
À la page des API keys, vous verrez:
- **Cloud Name**: (exemple: `dxyz1234`)
- **API Key**: (clé publique, ~20 caractères)
- **API Secret**: (clé secrète, générée automatiquement)

### Résultat
```
CLOUDINARY_CLOUD_NAME=dxyz1234
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your_new_secret_key
```

---

## 3️⃣ Mettre à jour .env.local

Une fois les secrets régénérés, créez/mettez à jour le fichier `.env.local`:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://school-card-user:YOUR_NEW_PASSWORD@cluster0.ngjradv.mongodb.net/school-card?retryWrites=true&w=majority

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

⚠️ **IMPORTANT**: 
- Ne commitez JAMAIS `.env.local` dans Git
- Ce fichier doit rester local uniquement

---

## 4️⃣ Vérifier dans le projet

Testez que les secrets fonctionnent:

```bash
npm run dev
# Allez sur http://localhost:3000/eleves/nouveau
# Essayez de créer un élève
# Téléchargez une photo (teste Cloudinary)
```

✅ Si ça marche → Secrets sont corrects

---

## ⏱️ Temps estimé: 15-20 minutes

🔒 Une fois fait, votre application est sécurisée!
