# 📊 Guide des Tests de Performance

Ce guide explique comment mesurer les performances de l'application.

## 🚀 Installation des dépendances

```bash
pnpm install
```

## 📈 Tests disponibles

### 1️⃣ Tests Playwright (Recommandé)

Les tests Playwright mesurent:
- ⏱️ Temps de chargement de chaque page
- 📡 Temps de récupération des données (API GET)
- 📤 Temps d'envoi des données (API POST)
- 🔗 Analyse détaillée du réseau
- ⚡ Requêtes concurrentes

#### Lancer les tests Playwright:

```bash
# Lancer les tests de performance
pnpm test performance.spec.ts

# Voir les résultats détaillés
pnpm test:ui

# Ou exécuter une seule fois
pnpm test:run
```

### 2️⃣ Script Node.js autonome

```bash
# Démarrer le serveur d'abord (dans un autre terminal)
pnpm dev

# Puis lancer le script de performance dans un nouveau terminal
node scripts/performance-test.mjs
```

**Output example:**
```
📊 Test des performances des pages...

✅ Accueil              - 245ms    | FCP: 120ms   | LCP: 234ms
✅ Cartes              - 512ms    | FCP: 145ms   | LCP: 478ms
✅ Classes             - 389ms    | FCP: 132ms   | LCP: 367ms
✅ Élèves              - 445ms    | FCP: 156ms   | LCP: 421ms
✅ Établissements      - 523ms    | FCP: 168ms   | LCP: 501ms
✅ Personnel           - 478ms    | FCP: 151ms   | LCP: 455ms

🔌 Test des performances des APIs...

✅ GET /api/classes              - 124.56ms | Status: 200 | Size: 45.23KB
✅ GET /api/eleves              - 156.78ms | Status: 200 | Size: 78.92KB
✅ GET /api/etablissements      - 98.34ms  | Status: 200 | Size: 23.45KB
✅ GET /api/personnel           - 134.67ms | Status: 200 | Size: 56.78KB
✅ GET /api/statistiques        - 45.23ms  | Status: 200 | Size: 12.34KB

⚡ Test des requêtes concurrentes...

✅ 4 requêtes parallèles en 189.45ms
   - Classes: 124.56ms (200)
   - Élèves: 156.78ms (200)
   - Établissements: 98.34ms (200)
   - Personnel: 134.67ms (200)
```

## 📊 Métriques mesurées

### Pages
- **Load Time**: Temps total de chargement de la page
- **FCP** (First Contentful Paint): Temps avant l'affichage du premier contenu
- **LCP** (Largest Contentful Paint): Temps avant l'affichage du plus grand élément
- **TTI** (Time To Interactive): Temps avant interaction possible
- **Resource Timing**: Temps de chaque requête réseau

### APIs
- **Fetch Time**: Temps de récupération des données
- **Status**: Code de statut HTTP
- **Data Size**: Taille des données reçues/envoyées

### Réseau
- **Total Requests**: Nombre total de requêtes
- **Total Data**: Volume total de données transférées
- **Avg Response Time**: Temps moyen de réponse

## 📁 Rapport détaillé

Un rapport JSON détaillé est généré après chaque test:

```bash
# Après les tests, consultant:
cat performance-report.json
```

**Structure du rapport:**
```json
{
  "pagePerformance": [
    {
      "pageName": "Accueil",
      "path": "/",
      "metrics": {
        "loadTime": 245,
        "fcp": 120,
        "lcp": 234,
        "tti": 156,
        "resourceTiming": [50, 120, 45, 30]
      }
    }
  ],
  "apiPerformance": [
    {
      "endpoint": "/api/classes",
      "method": "GET",
      "fetchTime": 124.56,
      "status": 200,
      "dataSize": 45230
    }
  ],
  "networkAnalysis": {
    "totalRequests": 48,
    "totalData": 1234567,
    "avgResponseTime": 145.23
  },
  "timestamp": "2024-02-08T10:30:00.000Z"
}
```

## 🎯 Bonnes pratiques

### Avant les tests
- ✅ Fermer les autres applications
- ✅ Arrêter les extensions du navigateur
- ✅ Vider le cache: `Ctrl+Shift+Delete`
- ✅ Utiliser une connexion internet stable

### Interprétation des résultats

| Métrique | Cible | Acceptable | Problématique |
|----------|-------|-----------|----------------|
| Load Time | < 2s | < 3s | > 4s |
| FCP | < 1s | < 1.5s | > 2.5s |
| LCP | < 2.5s | < 4s | > 4s |
| API Fetch | < 200ms | < 500ms | > 1s |

## 🔍 Commandes utiles

```bash
# Exécuter les tests avec rapport coverage
pnpm test:coverage

# Afficher les résultats dans une UI
pnpm test:ui

# Générer le rapport de performance
node scripts/performance-test.mjs > performance.log

# Nettoyer les résultats
rm performance-report.json performance.log
```

## 🐛 Dépannage

### Les tests ne démarrent pas
```bash
# Assurez-vous que le serveur localexécute
pnpm dev &

# Attendez quelques secondes
sleep 5

# Lancez les tests
node scripts/performance-test.mjs
```

### Résultats incorrects
- Clearls le cache du navigateur
- Redémarrez le serveur
- Vérifiez votre connexion réseau
- Exécutez les tests plusieurs fois (les résultats peuvent varier)

## 📈 Améliorer les performances

Si les résultats ne sont pas satisfaisants:

1. **Optimiser les pages**
   - Réduire les ressources JavaScript
   - Optimiser les images
   - Implémenter le lazy loading

2. **Optimiser les APIs**
   - Ajouter de la pagination
   - Implémenter du cache
   - Compresser les données

3. **Améliorer le réseau**
   - Utiliser un CDN
   - Implémenter la compression gzip
   - Minifier les ressources

## 📞 Support

Pour plus d'informations, consultez:
- [Playwright Test Documentation](https://playwright.dev/docs/intro)
- [Web Core Vitals](https://web.dev/vitals/)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
