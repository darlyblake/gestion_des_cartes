#!/bin/bash
# audit-production.sh - Script d'audit de sécurité pré-production

set -e

echo "🔍 AUDIT DE SÉCURITÉ - PRODUCTION READINESS"
echo "==========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES=0

# 1. Vérifier les secrets exposés
echo "1️⃣  Vérification des secrets exposés..."
if grep -r "mongodb+srv://" . --include="*.js" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules 2>/dev/null; then
    echo -e "${RED}❌ Secrets MongoDB trouvés dans le code${NC}"
    ((ISSUES++))
else
    echo -e "${GREEN}✅ Pas de secrets MongoDB exposés${NC}"
fi

if grep -r "CLOUDINARY_API_SECRET" .env* 2>/dev/null | grep -v ".env.example" 2>/dev/null; then
    echo -e "${RED}❌ Clés Cloudinary exposées${NC}"
    ((ISSUES++))
else
    echo -e "${GREEN}✅ Pas de clés Cloudinary exposées${NC}"
fi

echo ""
echo "2️⃣  Vérification des fichiers .env..."

if [ -f ".env.local" ] && git ls-files --error-unmatch .env.local >/dev/null 2>&1; then
    echo -e "${RED}❌ .env.local est commité dans Git${NC}"
    ((ISSUES++))
else
    echo -e "${GREEN}✅ .env.local n'est pas commité${NC}"
fi

if grep -q ".env.local" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✅ .env.local est dans .gitignore${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local n'est pas dans .gitignore${NC}"
    ((ISSUES++))
fi

echo ""
echo "3️⃣  Vérification de la configuration TypeScript..."

if grep -q "ignoreBuildErrors" next.config.mjs; then
    echo -e "${RED}❌ TypeScript errors sont ignorées${NC}"
    ((ISSUES++))
else
    echo -e "${GREEN}✅ TypeScript errors ne sont pas ignorées${NC}"
fi

echo ""
echo "4️⃣  Vérification ESLint..."

if ! command -v eslint &> /dev/null; then
    echo -e "${YELLOW}⚠️  ESLint n'est pas installé${NC}"
    echo "    Installer: npm install --save-dev eslint eslint-config-next"
    ((ISSUES++))
else
    echo -e "${GREEN}✅ ESLint est installé${NC}"
fi

echo ""
echo "5️⃣  Vérification des console.log..."

if grep -r "console\.log" app lib components --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "// console" | head -5; then
    echo -e "${RED}❌ console.log trouvés dans le code${NC}"
    ((ISSUES++))
else
    echo -e "${GREEN}✅ Pas de console.log en production${NC}"
fi

echo ""
echo "6️⃣  Audit npm..."

if npm audit --audit-level=high 2>&1 | grep -q "vulnerabilities"; then
    echo -e "${YELLOW}⚠️  Vulnérabilités détectées${NC}"
    npm audit
    ((ISSUES++))
else
    echo -e "${GREEN}✅ Pas de vulnérabilités évidentes${NC}"
fi

echo ""
echo "7️⃣  Vérification de la build..."

if npm run build 2>&1 | grep -q "error"; then
    echo -e "${RED}❌ Build échouée${NC}"
    ((ISSUES++))
else
    echo -e "${GREEN}✅ Build réussie${NC}"
fi

echo ""
echo "==========================================="
echo "RÉSUMÉ:"
echo ""

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ TOUS LES TESTS RÉUSSIS!${NC}"
    echo "L'application est prête pour la production."
    exit 0
else
    echo -e "${RED}❌ $ISSUES problèmes trouvés${NC}"
    echo "Veuillez corriger tous les problèmes avant de déployer."
    exit 1
fi
