#!/bin/bash
DEST_DIR="public/illustrations/high-detailed"
mkdir -p "$DEST_DIR"

# Try different possible folder names
declare -a POSSIBLE_NAMES=(
    "High Detailed Vector"
    "High-Detailed-Vector"
    "High_Detailed_Vector"
    "HighDetailedVector"
    "high detailed vector"
)

for dir_name in "${POSSIBLE_NAMES[@]}"; do
    SOURCE_DIR="$HOME/Downloads/For Website/$dir_name"
    if [ -d "$SOURCE_DIR" ]; then
        echo "Found directory: $SOURCE_DIR"
        cp "$SOURCE_DIR"/*.{png,PNG,jpg,JPG} "$DEST_DIR/" 2>/dev/null
        echo "Files copied!"
        ls -lh "$DEST_DIR"
        exit 0
    fi
done

echo "Could not find High Detailed Vector folder. Please manually copy the files:"
echo "cp ~/Downloads/For\ Website/[folder-name]/*.png public/illustrations/high-detailed/"
