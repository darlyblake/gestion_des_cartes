#!/bin/bash

# Script simple de test de performance avec curl
# Plus rapide et pas besoin de Playwright

BASE_URL="${1:-http://localhost:3001}"
OUTPUT_FILE="performance-report.json"

echo "🚀 Démarrage des tests de performance..."
echo "Base URL: $BASE_URL"
echo ""

# Vérifier si curl est disponible
if ! command -v curl &> /dev/null; then
    echo "❌ curl n'est pas installé"
    exit 1
fi

# Vérifier la connectivité
if ! curl -s -m 5 "$BASE_URL" > /dev/null 2>&1; then
    echo "❌ Impossible de se connecter à $BASE_URL"
    exit 1
fi

echo "✅ Serveur actif sur $BASE_URL"
echo ""

# Résultats
declare -A pageResults
declare -A apiResults

# Test des pages
echo "📄 Test des pages web..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

pages=("/" "/cartes" "/classes" "/eleves" "/etablissements" "/personnel")
page_names=("Accueil" "Cartes" "Classes" "Élèves" "Établissements" "Personnel")

for i in "${!pages[@]}"; do
    page="${pages[$i]}"
    name="${page_names[$i]}"
    
    start=$(date +%s%N)
    response=$(curl -s -w "\n%{http_code}" -m 10 "$BASE_URL$page")
    end=$(date +%s%N)
    
    http_code=$(echo "$response" | tail -n1)
    load_time=$(( (end - start) / 1000000 ))
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ $name - ${load_time}ms (HTTP $http_code)"
        pageResults["$name"]="$load_time"
    else
        echo "⚠️  $name - ${load_time}ms (HTTP $http_code)"
    fi
done

echo ""

# Test des APIs - GET
echo "🔌 Test des APIs - Récupération (GET)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

apis=("/api/classes" "/api/eleves" "/api/etablissements" "/api/personnel")

for api in "${apis[@]}"; do
    endpoint_name=$(echo "$api" | cut -d'/' -f3)
    
    start=$(date +%s%N)
    response=$(curl -s -w "\n%{http_code}" -m 10 "$BASE_URL$api")
    end=$(date +%s%N)
    
    http_code=$(echo "$response" | tail -n1)
    fetch_time=$(( (end - start) / 1000000 ))
    
    # Calculer la taille
    body=$(echo "$response" | head -n -1)
    size=$(echo -n "$body" | wc -c)
    size_kb=$(echo "scale=2; $size / 1024" | bc)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ GET $api - ${fetch_time}ms | ${size_kb}KB (HTTP $http_code)"
        apiResults["GET:$endpoint_name"]="$fetch_time:$size_kb"
    else
        echo "⚠️  GET $api - ${fetch_time}ms (HTTP $http_code)"
    fi
done

echo ""

# Test des requêtes parallèles
echo "⚡ Test des requêtes parallèles (4 APIs simultanément)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

start=$(date +%s%N)

# Lancer les requêtes en parallèle
curl -s "$BASE_URL/api/classes" > /dev/null &
PID1=$!
curl -s "$BASE_URL/api/eleves" > /dev/null &
PID2=$!  
curl -s "$BASE_URL/api/etablissements" > /dev/null &
PID3=$!
curl -s "$BASE_URL/api/personnel" > /dev/null &
PID4=$!

# Attendre que toutes les requêtes se terminent
wait $PID1 $PID2 $PID3 $PID4

end=$(date +%s%N)
concurrent_time=$(( (end - start) / 1000000 ))

echo "✅ 4 requêtes parallèles: ${concurrent_time}ms"

echo ""

# Résumé
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    📊 RÉSUMÉ DES PERFORMANCES                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Moyenne des pages
if [ ${#pageResults[@]} -gt 0 ]; then
    total=0
    for time in "${pageResults[@]}"; do
        total=$((total + time))
    done
    avg=$((total / ${#pageResults[@]}))
    max=$(echo "${pageResults[@]}" | tr ' ' '\n' | sort -n | tail -1)
    min=$(echo "${pageResults[@]}" | tr ' ' '\n' | sort -n | head -1)
    
    echo "📄 Pages Web:"
    echo "   Moyenne: ${avg}ms | Max: ${max}ms | Min: ${min}ms"
    echo ""
fi

# Moyenne des APIs
if [ ${#apiResults[@]} -gt 0 ]; then
    total=0
    count=0
    for entry in "${apiResults[@]}"; do
        time=$(echo "$entry" | cut -d':' -f1)
        total=$((total + time))
        count=$((count + 1))
    done
    if [ $count -gt 0 ]; then
        avg=$((total / count))
        echo "🔌 APIs (GET):"
        echo "   Moyenne: ${avg}ms"
        echo ""
    fi
fi

echo "⚡ Requêtes Parallèles: ${concurrent_time}ms"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "✅ Tests complétés!"
echo ""

# Générer un rapport JSON simple
cat > "$OUTPUT_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "baseUrl": "$BASE_URL",
  "pagePerformance": [
EOF

first=true
for name in "${!pageResults[@]}"; do
    if [ "$first" = true ]; then
        first=false
    else
        echo "," >> "$OUTPUT_FILE"
    fi
    echo -n "    {\"name\": \"$name\", \"loadTime\": ${pageResults[$name]}}" >> "$OUTPUT_FILE"
done

cat >> "$OUTPUT_FILE" << EOF
  ],
  "networks": {
    "concurrentRequests": $concurrent_time,
    "testTime": "$(date)"
  }
}
EOF

echo "📁 Rapport sauvegardé: $OUTPUT_FILE"
echo ""
