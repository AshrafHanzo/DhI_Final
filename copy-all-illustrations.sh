#!/bin/bash

# Base directories
DOWNLOADS_BASE="$HOME/Downloads/For Website"
PROJECT_BASE="public/illustrations"

# Function to copy images from a folder
copy_category() {
    local source_folder="$1"
    local dest_folder="$2"
    local source_path="$DOWNLOADS_BASE/$source_folder"
    local dest_path="$PROJECT_BASE/$dest_folder"
    
    mkdir -p "$dest_path"
    
    if [ -d "$source_path" ]; then
        echo "Copying from: $source_folder"
        cp "$source_path"/*.{png,PNG,jpg,JPG,jpeg,JPEG} "$dest_path/" 2>/dev/null
        local count=$(ls -1 "$dest_path"/*.{png,PNG,jpg,JPG,jpeg,JPEG} 2>/dev/null | wc -l)
        echo "  -> Copied $count files to $dest_folder"
        ls -1 "$dest_path"
        echo ""
    else
        echo "Warning: Folder not found: $source_path"
        echo ""
    fi
}

echo "Starting illustration copy process..."
echo "===================================="
echo ""

# Copy all categories
copy_category "High Detailed Vector" "high-detailed"
copy_category "Line Art" "line-art"
copy_category "Photo to Vector" "photo-to-vector"
copy_category "Raster to Vector" "raster-to-vector"
copy_category "Sketch to Vector" "sketch-to-vector"
copy_category "Vector Artwork" "vector-artwork"

echo "===================================="
echo "Copy process complete!"
