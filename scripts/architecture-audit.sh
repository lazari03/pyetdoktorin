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

exit $fail
