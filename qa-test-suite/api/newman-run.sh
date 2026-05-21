#!/usr/bin/env bash
set -euo pipefail
newman run qa-test-suite/api/postman-collection.json \
  -e qa-test-suite/api/postman-environment.json \
  --reporters cli,json \
  --reporter-json-export qa-test-suite/reports/newman-results.json
