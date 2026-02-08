# TODO - Optimisation de la Récupération et Transmission des Données

## Phase 1: PAGINATION (Priorité Critique) - ✅ TERMINÉE

### 1.1 Créer un schéma de validation Zod ✅
- [x] Créer `lib/services/validation.ts` avec schémas de validation
- [x] Schémas pour: eleves, classes, etablissements, personnel

### 1.2 Implémenter pagination API `/api/eleves` ✅
- [x] Modifier `app/api/eleves/route.ts` pour supporter pagination
- [x] Ajouter paramètres `page`, `limit`, `search`, `sortBy`, `sortOrder`
- [x] Retourner meta avec `total`, `page`, `limit`, `totalPages`, `hasNextPage`, `hasPrevPage`

### 1.3 Implémenter pagination API `/api/classes` ✅
- [x] Modifier `app/api/classes/route.ts` pour supporter pagination
- [x] Ajouter paramètres `page`, `limit`, `search`, `sortBy`, `sortOrder`
- [x] Retourner meta avec `total`, `page`, `limit`, `totalPages`

### 1.4 Implémenter pagination API `/api/etablissements` ✅
- [x] Modifier `app/api/etablissements/route.ts` pour supporter pagination
- [x] Ajouter paramètres `page`, `limit`, `search`, `projection`, `sortBy`, `sortOrder`
- [x] Retourner meta avec `total`, `page`, `limit`, `totalPages`

### 1.5 Implémenter pagination API `/api/personnel` ✅
- [x] Modifier `app/api/personnel/route.ts` pour supporter pagination
- [x] Ajouter paramètres `page`, `limit`, `search`, `sortBy`, `sortOrder`
- [x] Retourner meta avec `total`, `page`, `limit`, `totalPages`

### 1.6 Mettre à jour le service API frontend ✅
- [x] Créer types `PaginationMeta` et `ReponsePaginated`
- [x] Ajouter fonction `requeteFetchPaginee`
- [x] Mettre à jour `recupererEtablissements` avec options
- [x] Mettre à jour `recupererClasses` avec options
- [x] Mettre à jour `recupererEleves` avec options
- [x] Mettre à jour `recupererPersonnel` avec options

---

## Phase 2: SÉCURITÉ (Semaine 2) - ✅ TERMINÉE

### 2.1 Validation des paramètres ✅
- [x] Schémas Zod créés pour validation des query params
- [x] Validation implémentée dans toutes les routes GET

### 2.2 Rate Limiting ✅
- [x] Créer `lib/services/rate-limiter.ts` avec rate limiter personnalisé
- [x] Rate limiting par IP (100 requêtes/minute pour GET)
- [x] Rate limiting stricte (3 requêtes/15min pour POST)
- [x] Appliquer à toutes les routes API (eleves, classes, etablissements, personnel)
- [x] Headers X-RateLimit-* ajoutés aux réponses

---

## Phase 3: PERFORMANCE - ✅ TERMINÉE

### 3.1 Index MongoDB composés ✅
- [x] Mettre à jour `lib/services/mongodb-indexes.ts`
- [x] Créer index composés pour requêtes fréquentes
- [x] Ajouter index text pour recherche en texte intégral (français)
- [x] Créer script `scripts/create-indexes.ts` pour déployer les index

### 3.2 Optimisation des requêtes ✅
- [x] Remplacer `$regex` par `$text` search dans toutes les routes API
- [x] Utiliser les index text pour les recherches (plus performant)

---

## Phase 4: OPÉRATIONS AVANCÉES - ✅ TERMINÉE

### 4.1 Bulk Operations ✅
- [x] Créer endpoint `/api/eleves/bulk` pour imports massifs (max 1000)
- [x] Créer endpoint `/api/personnel/bulk` pour imports massifs (max 500)
- [x] Validation Zod individuelle par enregistrement
- [x] Rate limiting strict (5 req/min)
- [x] Rapport détaillé avec taux de réussite

### 4.2 Cache Distribué (Optionnel) ⏸️
- [ ] Intégrer Redis avec Upstash
- [ ] Remplacer MemoryCache par RedisCache

---

## Résumé des Phases 1-4

| Phase | Status | Fichiers Modifiés |
|-------|--------|-------------------|
| **1. Pagination** | ✅ 100% | 4 routes API + lib/validation |
| **2. Sécurité** | ✅ 100% | lib/rate-limiter.ts + 4 routes |
| **3. Performance** | ✅ 100% | lib/mongodb-indexes.ts + 4 routes |
| **4. Bulk Ops** | ✅ 100% | 2 nouvelles routes API |

---

## 📊 Progression Globale

```
Phase 1 (Pagination): ██████████ 100% ✅
Phase 2 (Sécurité):   ██████████ 100% ✅
Phase 3 (Performance): ██████████ 100% ✅
Phase 4 (Bulk Ops):   ██████████ 100% ✅
─────────────────────────────────────────
TOTAL:                ██████████ 100% ✅
```

---

## 📚 NOUVEAUX ENDPOINTS AVEC PAGINATION

### GET /api/eleves
```typescript
// Paramètres
?page=1&limit=50&search=dupont&classeId=xxx&sortBy=nom&sortOrder=asc

// Réponse
{
  "succes": true,
  "donnees": [...],
  "meta": {
    "total": 1250,
    "page": 1,
    "limit": 50,
    "totalPages": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### GET /api/classes
```typescript
// Paramètres
?page=1&limit=25&search=6ème&etablissementId=xxx
```

### GET /api/etablissements
```typescript
// Paramètres
?page=1&limit=50&search=lycée&projection=light
```

### GET /api/personnel
```typescript
// Paramètres
?page=1&limit=50&role=enseignant&search=martin
```

---

## 🚀 UTILISATION DES ENDPOINTS BULK

### Import d'élèves (max 1000)
```bash
curl -X POST https://api.../api/eleves/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "eleves": [
      { "nom": "DUPONT", "prenom": "Jean", "dateNaissance": "2010-05-15", "classeId": "..." },
      { "nom": "MARTIN", "prenom": "Marie", "dateNaissance": "2010-08-20", "classeId": "..." }
    ]
  }'
```

**Réponse:**
```json
{
  "succes": true,
  "donnees": {
    "totalRecu": 2,
    "importes": 2,
    "erreurs": 0,
    "tauxReussite": 100
  },
  "message": "Import terminé: 2/2 élèves importés"
}
```

### Import de personnel (max 500)
```bash
curl -X POST https://api.../api/personnel/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "personnel": [
      { "nom": "DUPONT", "prenom": "Jean", "role": "enseignant", "etablissementId": "..." },
      ...
    ]
  }'
```

---

## 📁 FICHIERS CRÉÉS

| Fichier | Description |
|---------|-------------|
| `lib/services/validation.ts` | Schémas Zod pour validation |
| `lib/services/rate-limiter.ts` | Rate limiter personnalisé anti-abus |
| `lib/services/mongodb-indexes.ts` | Index MongoDB optimisés |
| `scripts/create-indexes.ts` | Script de déploiement des index |
| `app/api/eleves/bulk/route.ts` | Import massif d'élèves |
| `app/api/personnel/bulk/route.ts` | Import massif de personnel |

---

## 🔧 MODIFICATIONS API

| Route | Pagination | Validation | Rate Limit |
|-------|------------|------------|------------|
| `/api/eleves` | ✅ | ✅ Zod | ✅ GET + POST |
| `/api/classes` | ✅ | ✅ Zod | ✅ GET + POST |
| `/api/etablissements` | ✅ | ✅ Zod | ✅ GET + POST |
| `/api/personnel` | ✅ | ✅ Zod | ✅ GET + POST |
| `/api/eleves/bulk` | N/A | ✅ Zod | ✅ POST (5/min) |
| `/api/personnel/bulk` | N/A | ✅ Zod | ✅ POST (5/min) |

---

## 🚀 DÉPLOIEMENT

### 1. Créer les index MongoDB
```bash
npx tsx scripts/create-indexes.ts
```

### 2. Déployer sur Vercel
```bash
git add .
git commit -m "feat: pagination, rate limiting, bulk operations"
git push origin main
```

---

## Dernière mise à jour: 6 février 2026

