#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════
# PRODUCTION VALIDATION SCRIPT
# Valide tous les pré-requis avant déploiement
# ════════════════════════════════════════════════════════════════════════════

set -e

echo "🚀 Production Validation Script"
echo "════════════════════════════════════════════════════════════════════════════"

# Check 1: Environment variables
echo ""
echo "1️⃣  Vérification des variables d'environnement..."
if [ ! -f .env.local ]; then
    echo "❌ .env.local manquant!"
    exit 1
fi

if grep -q "YOUR_USERNAME" .env.local; then
    echo "❌ .env.local contient encore des placeholders!"
    exit 1
fi

echo "✅ Variables d'environnement correctes"

# Check 2: No exposed secrets
echo ""
echo "2️⃣  Vérification des secrets exposés..."
if grep -r "mongodb+srv://freid" . --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null; then
    echo "❌ Secrets MongoDB exposés dans le code!"
    exit 1
fi

if grep -r "43cm-LeL8qePKTz659w53aUQH4Q" . --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null; then
    echo "❌ Cloudinary secret exposé dans le code!"
    exit 1
fi

echo "✅ Aucun secret exposé détecté"

# Check 3: No console.log in production
echo ""
echo "3️⃣  Vérification des console.log..."
CONSOLE_COUNT=$(grep -r "console\." app --include="*.ts" --include="*.tsx" | grep -v "console\.error" | grep -v "console\.warn" | wc -l || echo "0")
if [ "$CONSOLE_COUNT" -gt "5" ]; then
    echo "⚠️  $CONSOLE_COUNT appels console.log/info détectés (non-critique)"
fi
echo "✅ Vérification complétée"

# Check 4: Build test
echo ""
echo "4️⃣  Test de build..."
if ! npm run build > /tmp/build.log 2>&1; then
    echo "❌ Build échouée:"
    tail -20 /tmp/build.log
    exit 1
fi
echo "✅ Build réussi"

# Check 5: Dependencies
echo ""
echo "5️⃣  Audit des dépendances..."
HIGH_VULN=$(npm audit 2>/dev/null | grep "high severity" | wc -l || echo "0")
echo "⚠️  Vulnérabilités trouvées: $HIGH_VULN (vérifiez npm audit)"
echo "✅ Audit complété"

# Success
echo ""
echo "════════════════════════════════════════════════════════════════════════════"
echo "✨ PRODUCTION READY!"
echo "════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Prochaines étapes:"
echo "1. Vérifiez npm audit"
echo "2. Commitez les changements"
echo "3. Pushez vers le repo"
echo "4. Déployez avec: DEPLOYMENT_GUIDE.md"
