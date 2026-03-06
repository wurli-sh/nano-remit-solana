#!/bin/bash
# Converts PNG → WebP and re-compresses existing WebP files
# Usage: ./scripts/optimize-images.sh [dry-run]

set -e

DRY_RUN=false
if [ "$1" = "dry-run" ]; then
  DRY_RUN=true
  echo "🔍 DRY RUN MODE - No files will be modified"
fi

# Check ImageMagick
if ! command -v magick &> /dev/null; then
  echo "❌ ImageMagick not found. Install:"
  echo "   macOS:  brew install imagemagick"
  echo "   Linux:  sudo apt install imagemagick"
  exit 1
fi

echo "🖼️  Image Optimization"
echo "═══════════════════════════════════════"

TOTAL_SAVED=0

# Convert PNG → WebP
echo "📂 Converting PNG → WebP..."
find src/assets public -type f -name "*.png" 2>/dev/null | while read -r file; do
  dir=$(dirname "$file")
  base=$(basename "$file" .png)
  output="${dir}/${base}.webp"

  original_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
  original_kb=$((original_size / 1024))

  if [ "$DRY_RUN" = true ]; then
    echo "   [DRY] $file (${original_kb}KB) → $output"
  else
    magick "$file" -quality 85 -define webp:method=6 "$output"
    new_size=$(stat -c%s "$output" 2>/dev/null || stat -f%z "$output")
    new_kb=$((new_size / 1024))
    saved=$(( (original_size - new_size) * 100 / original_size ))
    echo "   ✓ $file (${original_kb}KB) → $output (${new_kb}KB) [${saved}% saved]"
  fi
done

# Re-compress existing WebP
echo ""
echo "🔄 Re-compressing existing WebP files..."
find src/assets -type f -name "*.webp" 2>/dev/null | while read -r file; do
  original_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
  original_kb=$((original_size / 1024))

  # Skip small files (< 100KB)
  if [ "$original_size" -lt 102400 ]; then
    continue
  fi

  base=$(basename "$file")
  temp_file="${file}.tmp"

  if [ "$DRY_RUN" = true ]; then
    echo "   [DRY] $file (${original_kb}KB)"
  else
    magick "$file" -quality 85 -define webp:method=6 "$temp_file"
    new_size=$(stat -c%s "$temp_file" 2>/dev/null || stat -f%z "$temp_file")
    new_kb=$((new_size / 1024))

    if [ "$new_size" -lt "$original_size" ]; then
      mv "$temp_file" "$file"
      saved=$(( (original_size - new_size) * 100 / original_size ))
      echo "   ✓ $base: ${original_kb}KB → ${new_kb}KB (${saved}% saved)"
    else
      rm "$temp_file"
      echo "   ⚠️  $base: Already optimized (${original_kb}KB)"
    fi
  fi
done

echo ""
if [ "$DRY_RUN" = true ]; then
  echo "🔍 Dry run complete. Run without 'dry-run' to apply."
else
  echo "✅ Image optimization complete!"
  echo ""
  echo "💡 Next steps:"
  echo "   1. Update imports to use .webp extensions"
  echo "   2. Delete old .png files"
  echo "   3. Test the app"
fi
