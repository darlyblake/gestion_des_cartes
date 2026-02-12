# Plan de Correction des Problèmes Vercel

## Problèmes Identifiés

### 1. **ERR_BLOCKED_BY_CLIENT** - Scripts bloqués par les extensions navigateur
- **Cause**: Extensions comme uBlock, AdBlock bloquent les scripts analytiques
- **Impact**: Non critique - l'application fonctionne mais les analytics sont bloqués

### 2. **Vercel Web Analytics - Échec de chargement**
- **Cause**: Le composant utilise une version obsolète ou mal configurée
- **Solution**: Mettre à jour vers `@vercel/analytics/react`

### 3. **TypeError: Cannot read properties of undefined (reading 'split')**
- **Cause probable**: `donnees` undefined dans `genererQRCodeDataURL` ou `formaterDonneesCarteQR`
- **Solution**: Ajouter des vérifications null/undefined

### 4. **Zustand Deprecation Warning**
- **Cause**: Bibliothèque avec dépréciation du default export
- **Solution**: Vérifier les dépendances et mettre à jour si nécessaire

## Fichiers à Modifier

### 1. `components/analytics-client.tsx`
- Utiliser le package `@vercel/analytics/react` au lieu de `@vercel/analytics/next`

### 2. `lib/qrcode.tsx`
- Ajouter des vérifications null/undefined dans `formaterDonneesCarteQR`
- Ajouter des vérifications dans `genererQRCodeDataURL`

### 3. `components/cartes/carte-recto-verso.tsx`
- Vérifier que `etablissement.anneeScolaire` existe avant le split

## Commandes de Déploiement

```bash
# 1. Installer les mises à jour
npm install @vercel/analytics@latest

# 2. Rebuild et déployer
npm run build
vercel --prod
```

## Vérification Post-Déploiement

1. Ouvrir la console navigateur en mode incognito (sans extensions)
2. Vérifier que les erreurs sont résolues
3. Tester les pages principales (élèves, classes, cartes)

