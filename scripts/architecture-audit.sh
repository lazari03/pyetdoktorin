#!/usr/bin/env bash
set -euo pipefail

fail=0

if command -v rg >/dev/null 2>&1; then
  SEARCH_CMD="rg -n"
  SEARCH_MODE="rg"
else
  SEARCH_CMD="grep -R -n -E"
  SEARCH_MODE="grep"
fi

if [ -t 1 ]; then
  RED="\033[0;31m"
  GREEN="\033[0;32m"
  YELLOW="\033[0;33m"
  BLUE="\033[0;34m"
  RESET="\033[0m"
else
  RED=""; GREEN=""; YELLOW=""; BLUE=""; RESET=""
fi

ok() { printf "%b\n" "${GREEN}$1${RESET}"; }
warn() { printf "%b\n" "${YELLOW}$1${RESET}"; }
failmsg() { printf "%b\n" "${RED}$1${RESET}"; }

# Domain must not import frameworks/network/browser
pattern_domain="firebase|firestore|axios|fetch\\(|window|document|localStorage|next/|stripe|supabase"
if $SEARCH_CMD "$pattern_domain" src/domain >/dev/null; then
  failmsg "[FAIL] Domain imports framework/network/browser APIs"
  $SEARCH_CMD "$pattern_domain" src/domain
  fail=1
else
  ok "[OK] Domain free of framework/network/browser imports"
fi

# Application must not import React/hooks
pattern_app="from 'react'|from \\\"react\\\"|useState|useEffect|useMemo|useCallback|useRef|useLayoutEffect"
if $SEARCH_CMD "$pattern_app" src/application >/dev/null; then
  failmsg "[FAIL] Application imports React/hooks"
  $SEARCH_CMD "$pattern_app" src/application
  fail=1
else
  ok "[OK] Application free of React imports"
fi

# Presentation must not import infrastructure directly
pattern_presentation="@/infrastructure/|config/firebaseconfig|firebase"
if $SEARCH_CMD "$pattern_presentation" src/presentation >/dev/null; then
  failmsg "[FAIL] Presentation imports infrastructure/firebase directly"
  $SEARCH_CMD "$pattern_presentation" src/presentation
  fail=1
else
  ok "[OK] Presentation free of infrastructure/firebase direct imports"
fi

# Stores should not import infrastructure directly
pattern_store="@/infrastructure/"
if $SEARCH_CMD "$pattern_store" src/store >/dev/null; then
  warn "[WARN] Store imports infrastructure directly"
  $SEARCH_CMD "$pattern_store" src/store
fi

# App pages should not import infrastructure directly (client pages)
# App pages should not import infrastructure directly (ignore server-only app/api)
pattern_app_infra="^[[:space:]]*import .*(@/infrastructure/|config/firebaseconfig|firebase)"
if [ "$SEARCH_MODE" = "rg" ]; then
  if rg -n --glob '!src/app/api/**' "$pattern_app_infra" src/app >/dev/null; then
    warn "[WARN] App imports infrastructure/firebase directly (non-API)"
    rg -n --glob '!src/app/api/**' "$pattern_app_infra" src/app
  fi
else
  if grep -R -n -E --exclude-dir=api "$pattern_app_infra" src/app >/dev/null; then
    warn "[WARN] App imports infrastructure/firebase directly (non-API)"
    grep -R -n -E --exclude-dir=api "$pattern_app_infra" src/app
  fi
fi

# API routes should not import presentation/UI or client-only modules
pattern_api_forbidden="^[[:space:]]*import .*(@/presentation/|react|next/navigation|window|document)"
if [ "$SEARCH_MODE" = "rg" ]; then
  if rg -n --glob 'src/app/api/**' "$pattern_api_forbidden" src/app >/dev/null; then
    failmsg "[FAIL] API routes import presentation/UI or client-only modules"
    rg -n --glob 'src/app/api/**' "$pattern_api_forbidden" src/app
    fail=1
  fi
else
  if grep -R -n -E --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' "$pattern_api_forbidden" src/app/api >/dev/null; then
    failmsg "[FAIL] API routes import presentation/UI or client-only modules"
    grep -R -n -E --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' "$pattern_api_forbidden" src/app/api
    fail=1
  fi
fi

# API routes allowance is intentionally flexible beyond the forbidden list above.
# Use the FAIL check for presentation/UI or client-only modules as the hard rule.

# Presentation should not import network layer directly
pattern_network="@/network/"
if $SEARCH_CMD "$pattern_network" src/presentation >/dev/null; then
  warn "[WARN] Presentation imports network directly"
  $SEARCH_CMD "$pattern_network" src/presentation
fi

# Domain should not import presentation/application/infrastructure
pattern_domain_layers="@/presentation/|@/application/|@/infrastructure/"
if $SEARCH_CMD "$pattern_domain_layers" src/domain >/dev/null; then
  failmsg "[FAIL] Domain imports outer layers"
  $SEARCH_CMD "$pattern_domain_layers" src/domain
  fail=1
fi

exit $fail
