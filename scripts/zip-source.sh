#!/usr/bin/env bash
# Zip the GEO Loan project source code (excluding heavy/derived artifacts)
set -e

SRC=/home/z/my-project
OUT=/home/z/my-project/download/quickloan-pk-source.zip

# Make sure download dir exists
mkdir -p "$(dirname "$OUT")"

# Remove old zip
rm -f "$OUT"

# Build exclusion list
EXCLUDES=(
  "node_modules"
  ".next"
  ".git"
  ".zscripts"
  "dev.log"
  "server.log"
  "tool-results"
  "skills"
  "examples"
  "mini-services"
  "upload"
  "db/custom.db"
  "db/custom.db-journal"
  "public/uploads/kyc/*"
  "public/uploads/payments/*"
  "Caddyfile"
  ".z-ai-config"
)

# Build find prune expression
PRUNE_ARGS=()
for ex in "${EXCLUDES[@]}"; do
  PRUNE_ARGS+=(-path "./$ex" -prune -o)
done

cd "$SRC"

# Create zip
zip -r "$OUT" . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x ".git/*" \
  -x ".zscripts/*" \
  -x "dev.log" \
  -x "server.log" \
  -x "tool-results/*" \
  -x "skills/*" \
  -x "examples/*" \
  -x "mini-services/*" \
  -x "upload/*" \
  -x "db/custom.db" \
  -x "db/custom.db-journal" \
  -x "public/uploads/kyc/*" \
  -x "public/uploads/payments/*" \
  -x "Caddyfile" \
  -x ".z-ai-config/*" \
  -x ".claude/*" \
  -x "local-*" \
  > /tmp/zip.log 2>&1

echo "✅ Created: $OUT"
echo "📦 Size: $(du -h "$OUT" | cut -f1)"
echo "📄 Files: $(unzip -l "$OUT" | tail -1 | awk '{print $2}')"
echo ""
echo "Top-level entries:"
unzip -l "$OUT" | head -30