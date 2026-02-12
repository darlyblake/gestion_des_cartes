# 🚀 Guide Complet des Tests de Performance

Bienvenue! Ce guide vous explique comment tester les performances de votre application - temps de chargement des pages, récupération de données et envoi de données.

## 📋 Fichiers créés

| Fichier | Description |
|---------|-------------|
| `tests/e2e/performance.spec.ts` | Tests Playwright complets (pages, APIs, réseau) |
| `scripts/performance-test.mjs` | Script Node.js autonome (plus simple) |
| `scripts/run-performance-tests.sh` | Script interactif pour choisir le type de test |
| `public/performance-dashboard.html` | Dashboard HTML pour visualiser les résultats |
| `PERFORMANCE_TEST_GUIDE.md` | Guide détaillé des tests |

## 🎯 Quick Start (5 minutes)

### Option 1: Script rapide (Recommandé pour commencer)

```bash
# Terminal 1 - Démarrer le serveur
pnpm dev

# Terminal 2 - Lancer les tests
pnpm perf
```

**Résultat attendu:**
```
📊 Test des performances des pages...

✅ Accueil              - 245ms    | FCP: 120ms   | LCP: 234ms
✅ Cartes              - 512ms    | FCP: 145ms   | LCP: 478ms
✅ Classes             - 389ms    | FCP: 132ms   | LCP: 367ms
...
```

### Option 2: Script interactif avec menu

```bash
./scripts/run-performance-tests.sh
```

Cela vous propose:
1. Tests Playwright
2. Tests Playwright avec UI
3. Script Node.js
4. Tous les tests

### Option 3: Tests Playwright directs

```bash
pnpm test:perf              # Lancer les tests
pnpm test:perf:ui           # Avec interface UI
pnpm test:run               # Une seule fois
```

## 📊 Que testons-nous?

### 1. **Pages Web** ⏱️
- **Load Time**: Temps total de chargement
- **FCP** (First Contentful Paint): Première chose affichée
- **LCP** (Largest Contentful Paint): Élément principal affiché
- **TTI** (Time To Interactive): Quand la page devient interactive

Pages testées:
- ✅ Accueil (`/`)
- ✅ Cartes (`/cartes`)
- ✅ Classes (`/classes`)
- ✅ Élèves (`/eleves`)
- ✅ Établissements (`/etablissements`)
- ✅ Personnel (`/personnel`)

### 2. **APIs - Récupération de données** 🔌

```
GET /api/classes            ← Récupération des classes
GET /api/eleves             ← Récupération des élèves
GET /api/etablissements     ← Récupération des établissements
GET /api/personnel          ← Récupération du personnel
GET /api/statistiques       ← Récupération des stats
```

**Métriques:**
- Temps de réponse (ms)
- Taille des données (KB)
- Code de statut HTTP

### 3. **APIs - Envoi de données** 📤

```
POST /api/classes           ← Créer une classe
POST /api/eleves            ← Créer un élève
POST /api/etablissements    ← Créer un établissement
POST /api/personnel         ← Créer un personnel
```

### 4. **Réseau global** 📡
- Nombre total de requêtes
- Volume total de données
- Temps moyen de réponse
- Requêtes parallèles

## 📈 Visualiser les résultats

### 1. Fichier JSON brut
```bash
cat performance-report.json | jq
```

### 2. Dashboard HTML (Recommandé)
```bash
# Démarrer le serveur
pnpm dev

# Ouvrir dans le navigateur
http://localhost:3000/performance-dashboard.html
```

Le dashboard affiche:
- 📊 Graphiques interactifs
- 📋 Tableaux détaillés
- 🎯 Statuts visuels (Bon/Acceptable/Lent)
- 📱 Responsive pour mobile

### 3. Résumé en console
```
╔════════════════════════════════════════════════════════════════╗
║                    📈 RÉSUMÉ DES PERFORMANCES                 ║
╚════════════════════════════════════════════════════════════════╝

📄 PAGES - TEMPS DE CHARGEMENT
─────────────────────────────────
Accueil              245ms
Cartes               512ms
Classes              389ms
...
Moyenne: 442.33ms | Max: 523ms | Min: 245ms

🔌 API - TEMPS DE RÉCUPÉRATION DE DONNÉES
──────────────────────────────────────────
GET /api/classes              124.56ms | 45.23KB
GET /api/eleves               156.78ms | 78.92KB
...
```

## 🎯 Commandes npm

```bash
# Tests de performance
pnpm test:perf              # Tests Playwright
pnpm test:perf:ui           # Tests avec interface
pnpm perf                   # Script Node.js
pnpm perf:dev               # Démarrer serveur + tests

# Autres tests
pnpm test                   # Vitest
pnpm test:coverage          # Coverage
pnpm test:run               # Run une fois
```

## 📊 Interprétation des résultats

### Pages - Objectifs Web Core Vitals

| Métrique | Cible | Acceptable | Problématique |
|----------|-------|-----------|----------------|
| **Load Time** | < 2s | < 3s | > 4s |
| **FCP** | < 1s | < 1.5s | > 2.5s |
| **LCP** | < 2.5s | < 4s | > 4s |
| **TTI** | < 3.5s | < 5s | > 5s |

### APIs - Temps de réponse

| Cas | Temps | Priorité |
|-----|-------|----------|
| Bon | < 200ms | ✅ Excellent |
| Acceptable | 200-500ms | ⚠️ Acceptable |
| À améliorer | > 500ms | 🔴 Trop lent |

## 🔍 Exemple d'analyse

**Scénario:** Le dashboard des statistiques prend 1.2s à charger

```
Temps: 1200ms
├─ Serveur réagit: 150ms ✅
├─ Chargement HTML/CSS/JS: 450ms ✅
├─ Appel API /api/statistiques: 300ms ⚠️
├─ Rendu React: 200ms ✅
└─ Graphiques (Chart.js): 100ms ✅
```

**Actions correctives:**
1. Optimiser l'API (cache, pagination)
2. Splitter le chargement (lazy loading)
3. Réduire la taille des dépendances

## 🛠️ Dépannage

### "Le serveur ne démarre pas"
```bash
# Vérifier les ports
lsof -i :3000

# Tuer le processus existant
kill -9 <PID>

# Réessayer
pnpm dev
```

### "Les tests Playwright échouent"
```bash
# Réinstaller Playwright
pnpm install @playwright/test

# Essayer avec le script Node.js
pnpm perf
```

### "Aucune donnée dans le dashboard"
```bash
# Assurez-vous que le rapport est généré
ls -la performance-report.json

# Rafraîchir la page (F5)
# Attendre 5 secondes

# Ou générer manuellement
pnpm perf
```

## 🚨 Différences clés

### Playwright vs Script Node.js

| Aspect | Playwright | Node.js |
|--------|-----------|---------|
| **Interface** | UI graphique | Console |
| **Facilité** | Moyen | Très simple |
| **Détails** | Très détaillés | Suffisants |
| **Temps** | 2-5 min | 1-2 min |
| **Langage** | TypeScript | JavaScript |

**Recommandation:** Commencer par Node.js, puis Playwright pour analyse approfondie.

## 📚 Ressources

- [Web Core Vitals](https://web.dev/vitals/)
- [Playwright Documentation](https://playwright.dev/)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

## 💡 Bonnes pratiques

### Avant chaque test
- ✅ Fermer navigateurs/onglets inutiles
- ✅ Arrêter les extensions du navigateur  
- ✅ Vider le cache (Ctrl+Shift+Del)
- ✅ Vérifier connexion internet stable
- ✅ Redémarrer le serveur (pnpm dev)

### Après les résultats
- 📋 Comparer avec les tests précédents
- 🔄 Tester plusieurs fois (résultats peuvent varier)
- 📊 Vérifier les graphiques du dashboard
- 💾 Sauvegarder les rapports importants

## 📞 Besoin d'aide?

1. **Consulter le guide détaillé:**
   ```bash
   cat PERFORMANCE_TEST_GUIDE.md
   ```

2. **Voir les tests en détail:**
   ```bash
   code tests/e2e/performance.spec.ts
   code scripts/performance-test.mjs
   ```

3. **Analyser le rapport JSON:**
   ```bash
   cat performance-report.json | jq .pagePerformance
   cat performance-report.json | jq .apiPerformance
   ```

---

**Dernière mise à jour:** 8 février 2026
**Version:** 1.0
**Statut:** ✅ Prêt pour production

N'hésitez pas à adapter ces tests selon vos besoins spécifiques! 🚀
