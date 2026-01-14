#!/bin/bash
# Script to copy Rebond Grotesque fonts from CNDS repository
# Usage: ./copy-fonts-from-cnds.sh

set -e

CNDS_REPO="https://github.com/vkogmail/CNDS.git"
TEMP_DIR="/tmp/cnds-fonts-copy"
FONT_SOURCE_DIR="packages/playground/public/fonts"
FONT_DEST_DIR="public/fonts/Rebond-Woff2"

# Fonts to copy
FONTS=(
  "RebondGrotesque-Regular.woff2"
  "RebondGrotesque-Medium.woff2"
  "RebondGrotesque-Semibold.woff2"
  "RebondGrotesque-Bold.woff2"
  "RebondGrotesque-Extrabold.woff2"
)

echo "📦 Cloning CNDS repository..."
rm -rf "$TEMP_DIR"
git clone --depth 1 "$CNDS_REPO" "$TEMP_DIR" 2>/dev/null || {
  echo "❌ Failed to clone CNDS repo. Please ensure you have access."
  echo "   Alternative: Manually copy fonts from CNDS repo to $FONT_DEST_DIR/"
  exit 1
}

echo "📋 Copying font files..."
for font in "${FONTS[@]}"; do
  source="$TEMP_DIR/$FONT_SOURCE_DIR/$font"
  dest="$FONT_DEST_DIR/$font"
  
  if [ -f "$source" ]; then
    cp "$source" "$dest"
    size=$(ls -lh "$dest" | awk '{print $5}')
    echo "  ✓ $font ($size)"
  else
    echo "  ✗ $font (not found in CNDS)"
  fi
done

echo "🧹 Cleaning up..."
rm -rf "$TEMP_DIR"

echo "✅ Done! Fonts copied to $FONT_DEST_DIR/"
echo ""
echo "Next steps:"
echo "1. Restart your dev server"
echo "2. Hard refresh Safari (Cmd+Shift+R)"
echo "3. Check if Rebond Grotesque is rendering"
