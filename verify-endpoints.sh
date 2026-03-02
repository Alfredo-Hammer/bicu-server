#!/bin/bash

# Script de verificación de endpoints del backend en Render
# Uso: bash verify-endpoints.sh <url-del-backend>
# Ejemplo: bash verify-endpoints.sh https://bicu-server.onrender.com

BACKEND_URL="${1:-https://bicu-server.onrender.com}"

echo "════════════════════════════════════════════"
echo "🔍 VERIFICACIÓN DE ENDPOINTS - BICU SERVER"
echo "════════════════════════════════════════════"
echo "URL: $BACKEND_URL"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar endpoint
check_endpoint() {
  local method=$1
  local path=$2
  local description=$3
  local data=$4

  echo -n "Testing $method $path ... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL$path")
  else
    response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BACKEND_URL$path")
  fi

  if [ "$response" = "200" ] || [ "$response" = "201" ]; then
    echo -e "${GREEN}✓ OK ($response)${NC}"
  elif [ "$response" = "401" ] || [ "$response" = "400" ]; then
    echo -e "${YELLOW}⚠ Expected error ($response)${NC}"
  else
    echo -e "${RED}✗ ERROR ($response)${NC}"
  fi
}

# 1. Health Check
echo "─────────────────────────────────────────────"
echo "1. HEALTH CHECK"
echo "─────────────────────────────────────────────"
check_endpoint "GET" "/api/health" "Health endpoint"
echo ""

# 2. Organizations
echo "─────────────────────────────────────────────"
echo "2. ORGANIZATIONS"
echo "─────────────────────────────────────────────"
check_endpoint "GET" "/api/organizations/registered-codes" "Get registered codes"
check_endpoint "POST" "/api/organizations/register" "Register organization (should fail with 400)" \
  '{"organization":{"name":"Test"},"admin":{"adminEmail":"test@test.com"}}'
echo ""

# 3. Auth
echo "─────────────────────────────────────────────"
echo "3. AUTHENTICATION"
echo "─────────────────────────────────────────────"
check_endpoint "POST" "/api/auth/login" "Login (should fail with 400/401)" \
  '{"email":"test@test.com","password":"wrong"}'
echo ""

# 4. Categories
echo "─────────────────────────────────────────────"
echo "4. CATEGORIES"
echo "─────────────────────────────────────────────"
check_endpoint "GET" "/api/categories" "Get categories (should fail with 401)"
echo ""

# 5. Spare Parts
echo "─────────────────────────────────────────────"
echo "5. SPARE PARTS"
echo "─────────────────────────────────────────────"
check_endpoint "GET" "/api/spare-parts" "Get spare parts (should fail with 401)"
echo ""

# 6. Suppliers
echo "─────────────────────────────────────────────"
echo "6. SUPPLIERS"
echo "─────────────────────────────────────────────"
check_endpoint "GET" "/api/suppliers" "Get suppliers (should fail with 401)"
echo ""

# 7. Equipments
echo "─────────────────────────────────────────────"
echo "7. EQUIPMENTS"
echo "─────────────────────────────────────────────"
check_endpoint "GET" "/api/equipments" "Get equipments (should fail with 401)"
echo ""

# 8. Entries
echo "─────────────────────────────────────────────"
echo "8. ENTRIES"
echo "─────────────────────────────────────────────"
check_endpoint "GET" "/api/entries" "Get entries (should fail with 401)"
echo ""

# 9. Outputs
echo "─────────────────────────────────────────────"
echo "9. OUTPUTS"
echo "─────────────────────────────────────────────"
check_endpoint "GET" "/api/outputs" "Get outputs (should fail with 401)"
echo ""

# 10. Users
echo "─────────────────────────────────────────────"
echo "10. USERS"
echo "─────────────────────────────────────────────"
check_endpoint "GET" "/api/users" "Get users (should fail with 401)"
echo ""

# 11. Settings
echo "─────────────────────────────────────────────"
echo "11. SETTINGS"
echo "─────────────────────────────────────────────"
check_endpoint "GET" "/api/settings" "Get settings (should fail with 401)"
echo ""

# 12. Audit
echo "─────────────────────────────────────────────"
echo "12. AUDIT"
echo "─────────────────────────────────────────────"
check_endpoint "GET" "/api/audit" "Get audit logs (should fail with 401)"
echo ""

echo "════════════════════════════════════════════"
echo "✓ VERIFICACIÓN COMPLETADA"
echo "════════════════════════════════════════════"
echo ""
echo "Notas:"
echo "- OK (200/201): Endpoint funciona"
echo "- Expected error (400/401): Endpoint existe pero requiere auth o datos válidos"
echo "- ERROR (404): Endpoint no encontrado - PROBLEMA"
echo "- ERROR (500): Error del servidor - PROBLEMA"
echo ""
