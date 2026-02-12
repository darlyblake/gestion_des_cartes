#!/bin/bash

# Script de tests de performance rapide

echo "🚀 Démarrage des tests de performance..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier si pnpm est installé
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm n'est pas installé"
    echo "Installez pnpm avec: npm install -g pnpm"
    exit 1
fi

# Menu
echo "Quel type de test voulez-vous lancer?"
echo ""
echo "1️⃣  Tests Playwright complets"
echo "2️⃣  Tests Playwright avec UI"
echo "3️⃣  Script Node.js (recommandé)"
echo "4️⃣  Tous les tests"
echo ""
read -p "Votre choix (1-4): " choice

case $choice in
    1)
        echo "▶️  Lançage des tests Playwright..."
        pnpm test:perf
        ;;
    2)
        echo "▶️  Lançage des tests Playwright avec UI..."
        pnpm test:perf:ui
        ;;
    3)
        echo "▶️  Vérification du serveur de développement..."
        
        # Vérifier si le serveur est déjà en cours d'exécution
        if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "ℹ️  Le serveur n'est pas en cours d'exécution"
            echo "👉 Démarrage du serveur en arrière-plan..."
            pnpm dev > /dev/null 2>&1 &
            SERVER_PID=$!
            echo "⏳ Attente du démarrage du serveur (5 secondes)..."
            sleep 5
        else
            echo "✅ Serveur déjà actif"
            SERVER_PID=""
        fi
        
        echo "▶️  Lançage du script de performance..."
        node scripts/performance-test.mjs
        
        # Arrêter le serveur si nous l'avons démarré
        if [ -n "$SERVER_PID" ]; then
            echo ""
            echo "🛑 Arrêt du serveur..."
            kill $SERVER_PID 2>/dev/null || true
        fi
        ;;
    4)
        echo "▶️  Lançage de tous les tests..."
        echo ""
        echo "─ Tests Playwright..."
        pnpm test:perf
        echo ""
        echo "─ Script Node.js..."
        
        # Vérifier si le serveur est en cours d'exécution
        if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "ℹ️  Démarrage du serveur..."
            pnpm dev > /dev/null 2>&1 &
            SERVER_PID=$!
            sleep 5
        else
            SERVER_PID=""
        fi
        
        node scripts/performance-test.mjs
        
        if [ -n "$SERVER_PID" ]; then
            kill $SERVER_PID 2>/dev/null || true
        fi
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Fichiers générés:"
echo "  • performance-report.json - Rapport JSON détaillé"
echo "  • public/performance-dashboard.html - Dashboard interactif"
echo ""
echo "💡 Astuces:"
echo "  • Ouvrir le dashboard: http://localhost:3000/performance-dashboard.html"
echo "  • Voir le rapport JSON: cat performance-report.json"
echo "  • Lancer sans menu: pnpm perf"
echo ""
echo "✅ Tests complétés!"
