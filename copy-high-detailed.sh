#!/bin/bash
# Copy high detailed vector images
SOURCE_DIR="$HOME/Downloads/For Website/High Detailed Vector"
DEST_DIR="public/illustrations/high-detailed"

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Copy all PNG files from the source directory
if [ -d "$SOURCE_DIR" ]; then
    cp "$SOURCE_DIR"/*.png "$DEST_DIR/" 2>/dev/null || cp "$SOURCE_DIR"/*.PNG "$DEST_DIR/" 2>/dev/null
    echo "Images copied successfully!"
    echo "Files in destination:"
    ls -lh "$DEST_DIR"
else
    echo "Error: Source directory not found: $SOURCE_DIR"
    echo "Please check the directory name and try again"
fi
