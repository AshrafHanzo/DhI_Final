#!/bin/bash
SOURCE_BASE="$HOME/Downloads/For Website"
DEST_DIR="public/illustrations/high-detailed"

mkdir -p "$DEST_DIR"

# Try different folder name variations
for folder in "High Detailed Vector" "High-Detailed-Vector" "HighDetailedVector" "high detailed vector"; do
    SOURCE_DIR="$SOURCE_BASE/$folder"
    if [ -d "$SOURCE_DIR" ]; then
        echo "Found folder: $SOURCE_DIR"
        echo "Copying files..."
        
        # Copy all image files
        for file in "$SOURCE_DIR"/*; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                cp "$file" "$DEST_DIR/" 2>/dev/null && echo "  ✓ Copied: $filename"
            fi
        done
        
        echo ""
        echo "Files in destination:"
        ls -lh "$DEST_DIR"
        exit 0
    fi
done

echo "Folder not found. Trying direct Downloads folder..."
# Try direct downloads folder
for file in "$HOME/Downloads"/*; do
    if [ -f "$file" ]; then
        case "$file" in
            *[Hh]igh*[Dd]etail*|*[Vv]ector*|*[Vv]enom*)
                filename=$(basename "$file")
                echo "Found potential file: $filename"
                ;;
        esac
    fi
done
