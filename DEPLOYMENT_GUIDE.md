# 🚀 GUIDE DE DÉPLOIEMENT EN PRODUCTION

## Pré-requis

### Étape 1: Sécuriser les secrets
```bash
# 1. Vérifier que .env.local n'est pas commité
git status .env.local
# Doit retourner "nothing to commit"

# 2. Si c'est commité, nettoyer l'historique
git rm --cached .env.local
git commit -m "Remove .env.local from history"

# 3. Vérifier la présence dans .gitignore
grep ".env.local" .gitignore
```

### Étape 2: Régénérer les credentials
**MongoDB Atlas:**
1. Aller à https://cloud.mongodb.com
2. Aller à Database Access
3. Créer nouveau utilisateur
4. Générer nouvelle URI
5. Copier dans MONGODB_URI

**Cloudinary:**
1. Aller à https://cloudinary.com/console/settings/api-keys
2. Cliquer "Generate new key"
3. Copier Cloud Name, API Key, API Secret
4. Ajouter variables d'environnement

### Étape 3: Vérifier la build
```bash
# 1. Tester la build localement
npm install
npm run build

# 2. Vérifier les erreurs TypeScript
npm run type-check

# 3. Vérifier les avertissements ESLint
npm run lint

# 4. Tester le serveur de production
NODE_ENV=production npm start
```

---

## OPTION 1: Vercel (Recommandé)

### Configuration
```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Lier le projet
vercel link

# 4. Ajouter les variables d'environnement
vercel env add MONGODB_URI
vercel env add MONGODB_DB_NAME
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
vercel env add NEXT_PUBLIC_CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
```

### Déploiement
```bash
# Production
vercel --prod

# Ou depuis GitHub (recommandé)
# - Connecter le repo GitHub
# - Vercel détecte les pushes automatiquement
```

---

## OPTION 2: Railway

### Configuration
```bash
# 1. Créer un compte sur https://railway.app
# 2. Créer nouveau projet
# 3. Connecter le repo GitHub
# 4. Ajouter plugin MongoDB (ou utiliser MongoDB Atlas)
# 5. Ajouter les variables d'environnement
```

### Variables à ajouter
```
MONGODB_URI=...
MONGODB_DB_NAME=project0
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NODE_ENV=production
```

---

## OPTION 3: Self-hosted (VPS)

### Pré-requis
- VPS Linux (Ubuntu 22.04 recommandé)
- Node.js 18+ et npm
- Nginx ou Apache
- PM2 ou systemd

### Installation
```bash
# 1. SSH sur le serveur
ssh user@your-vps.com

# 2. Cloner le repo
git clone https://github.com/user/school-card-application.git
cd school-card-application

# 3. Installer les dépendances
npm install --production

# 4. Build
npm run build

# 5. Créer le fichier .env.production
nano .env.production
# Ajouter:
# MONGODB_URI=...
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
# etc.

# 6. Installer PM2
npm install -g pm2

# 7. Démarrer l'app
pm2 start npm --name school-card -- start
pm2 save
pm2 startup
```

### Configuration Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL
    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    
    # Proxy vers Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 SÉCURITÉ EN PRODUCTION

### Recommandations essentielles
```bash
# 1. Activer HTTPS
# Utiliser Let's Encrypt pour les certificats gratuits
sudo certbot certonly --nginx -d your-domain.com

# 2. Configurer les headers de sécurité
# Voir next.config.mjs pour les headers

# 3. Monitorer les logs
tail -f ~/.pm2/logs/school-card-*.log

# 4. Faire des backups
# - MongoDB Atlas: Backup automatique
# - Application: Backup quotidien du repo

# 5. Monitoring
# Configurer Sentry pour les erreurs
# Configurer alertes pour la disponibilité
```

---

## 📊 MONITORING

### Services recommandés
- **Erreurs:** Sentry (https://sentry.io)
- **Uptime:** UptimeRobot (https://uptimerobot.com)
- **Performance:** New Relic ou DataDog
- **Logs:** LogRocket ou Datadog

### Configuration Sentry
```bash
npm install @sentry/nextjs

# Initialiser
npx @sentry/wizard@latest -i nextjs

# .env.production
SENTRY_AUTH_TOKEN=...
```

---

## 🧪 CHECKLIST PRE-PRODUCTION

- [ ] Tous les secrets régénérés
- [ ] .env.local retiré du Git
- [ ] Build produite sans erreurs
- [ ] Type-check réussi
- [ ] ESLint sans erreurs critiques
- [ ] Tests manuels terminés
- [ ] Images optimisées
- [ ] HTTPS configuré
- [ ] Headers de sécurité en place
- [ ] Monitoring configuré
- [ ] Backups activés
- [ ] DNS pointé vers le serveur
- [ ] Base de données en production
- [ ] Cloudinary configuré

---

## 🚨 EN CAS D'URGENCE

### Rollback rapide
```bash
# Vercel
vercel rollback

# Autre
git revert HEAD
npm run build
npm start
```

### Redémarrage de l'app
```bash
# PM2
pm2 restart school-card

# Systemd
sudo systemctl restart school-card
```

---

**Date:** 1 février 2026  
**Auteur:** AI Assistant  
**Version:** 1.0.0
