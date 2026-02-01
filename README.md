# 🎓 School Card Application - Gestion de Cartes Scolaires

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📝 Description

Application complète de gestion et de création de cartes scolaires pour établissements. Permet de gérer les élèves, les classes, le personnel et de générer des cartes personnalisées.

## ✨ Fonctionnalités

- 📚 **Gestion des Établissements** - Créer et gérer plusieurs établissements
- 👥 **Gestion des Élèves** - Base de données complète des élèves
- 🏫 **Gestion des Classes** - Organisation par classe et niveau
- 👨‍🏫 **Gestion du Personnel** - Enseignants, directeurs, etc.
- 🎫 **Génération de Cartes** - Créer des cartes imprimables personnalisées
- 📊 **Statistiques** - Tableaux de bord avec statistiques
- 🔐 **Sécurité** - Authentification, validation, chiffrement

## 🛠️ Stack Technique

### Frontend
- **Next.js** 16.0.10 - Framework React
- **React** 19.2.0 - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### Backend
- **Next.js API Routes** - Backend serverless
- **MongoDB** 4.17.2 - Database
- **Cloudinary** - Image storage

### DevOps
- **Vercel** - Deployment (recommandé)
- **Docker** - Containerization (optionnel)

## 🚀 Quick Start

### Installation
```bash
# Cloner le repo
git clone <repo-url>
cd school-card-application

# Installer les dépendances
npm install

# Créer le fichier .env.local
cp .env.example.secure .env.local
# Remplir les variables d'environnement

# Démarrer le serveur de développement
npm run dev
```

### Accéder à l'application
```
http://localhost:3000
```

## 📋 Configuration

### Variables d'environnement requises

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/project0
MONGODB_DB_NAME=project0

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🧪 Commandes disponibles

```bash
# Développement
npm run dev          # Démarrer le serveur dev

# Build
npm run build        # Build production
npm start           # Démarrer le serveur production

# Qualité du code
npm run lint        # Vérifier le code
npm run type-check  # Vérifier les types TypeScript

# Audit
npm audit           # Vérifier les vulnérabilités
```

## 📦 Structure du projet

```
school-card-application/
├── app/                 # Routes Next.js
│   ├── api/            # Routes API
│   ├── eleves/         # Pages élèves
│   ├── classes/        # Pages classes
│   ├── personnel/      # Pages personnel
│   └── cartes/         # Génération de cartes
├── components/          # Composants React
│   ├── ui/             # Composants shadcn/ui
│   └── forms/          # Formulaires
├── lib/                 # Utilitaires
│   ├── services/       # Services API
│   └── types.ts        # Types TypeScript
├── styles/              # Styles CSS
├── public/              # Fichiers statiques
└── PRODUCTION_ANALYSIS.md  # Analyse production
```

## 🔒 Sécurité

### ✅ Mesures de sécurité implémentées
- ✅ Variables d'environnement sécurisées
- ✅ Validation des entrées
- ✅ Headers de sécurité (CSP, X-Frame-Options, etc.)
- ✅ HTTPS en production
- ✅ TypeScript pour type safety
- ✅ Authentification base (peut être améliorée)

### ⚠️ À améliorer
- [ ] Authentification JWT
- [ ] Rate limiting
- [ ] CORS configuré correctement
- [ ] Session management amélioré

## 📚 Documentation

- [PRODUCTION_ANALYSIS.md](./PRODUCTION_ANALYSIS.md) - Analyse détaillée pré-production
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guide de déploiement (Vercel, Railway, VPS)
- [FIXES_APPLIED.md](./FIXES_APPLIED.md) - Corrections appliquées

## 🚀 Déploiement

### Déploiement sur Vercel (Recommandé)
```bash
npm i -g vercel
vercel link
vercel --prod
```

### Déploiement sur Railway
```
1. Connecter le repo GitHub
2. Railway détecte automatiquement Next.js
3. Ajouter les variables d'environnement
4. Deploy!
```

Voir [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) pour les options complètes.

## 📊 Performance

- ✅ Build Time: ~700ms
- ✅ Caching côté client
- ✅ Images optimisées
- ✅ Compression Gzip
- ✅ MongoDB indexé

## 🐛 Problèmes connus

Aucun actuellement.

## 📝 Logging & Monitoring

Configuration recommandée:
- **Erreurs:** Sentry
- **Uptime:** UptimeRobot
- **Logs:** DataDog ou LogRocket

## 🤝 Contribution

Les contributions sont bienvenues! Veuillez:
1. Fork le repo
2. Créer une branche (git checkout -b feature/amazing)
3. Commit (git commit -am 'Add feature')
4. Push (git push origin feature/amazing)
5. Ouvrir une Pull Request

## 📄 License

MIT License - voir LICENSE.md

## 📞 Support

Pour les problèmes, veuillez:
1. Vérifier la [PRODUCTION_ANALYSIS.md](./PRODUCTION_ANALYSIS.md)
2. Créer une issue GitHub
3. Contacter l'équipe de support

## 🎯 Roadmap

- [ ] Authentification multi-utilisateur
- [ ] Rôles et permissions
- [ ] Import/Export CSV
- [ ] API REST complète
- [ ] Mobile app
- [ ] Intégration d'autres systèmes

## 👨‍💻 Développeurs

**Créé par:** School Card Team  
**Dernière mise à jour:** 1 février 2026

---

**⚠️ AVANT PRODUCTION:** Lire [PRODUCTION_ANALYSIS.md](./PRODUCTION_ANALYSIS.md) et [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
