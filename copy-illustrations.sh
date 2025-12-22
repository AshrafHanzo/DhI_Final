#!/bin/bash

# DHI Creative Services - Illustrations Image Copy Script
# Run this script after placing your images in the correct source folder

echo "🎨 DHI Illustrations Image Copy Script"
echo "======================================"
echo ""

# Ask for source directory
read -p "Enter the full path to your 'For Website' folder: " SOURCE_DIR

if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Directory not found: $SOURCE_DIR"
    exit 1
fi

echo "✅ Found directory: $SOURCE_DIR"
echo ""

# Define target directories
TARGET_BASE="public/illustrations"

# Create target directories if they don't exist
mkdir -p "$TARGET_BASE/character-mascot"
mkdir -p "$TARGET_BASE/emblem"
mkdir -p "$TARGET_BASE/high-detailed"
mkdir -p "$TARGET_BASE/line-art"
mkdir -p "$TARGET_BASE/photo-to-vector"
mkdir -p "$TARGET_BASE/raster-to-vector"
mkdir -p "$TARGET_BASE/sketch-to-vector"
mkdir -p "$TARGET_BASE/vector-artwork"

echo "📁 Created target directories"
echo ""

# Copy Character & Mascot Design
if [ -d "$SOURCE_DIR/Character & Mascot Design" ]; then
    cp "$SOURCE_DIR/Character & Mascot Design"/*.png "$TARGET_BASE/character-mascot/" 2>/dev/null
    COUNT=$(ls "$TARGET_BASE/character-mascot"/*.png 2>/dev/null | wc -l)
    echo "✓ Character & Mascot Design: $COUNT files copied"
fi

# Copy Emblem Illustration
if [ -d "$SOURCE_DIR/Emblem - Illustration" ]; then
    cp "$SOURCE_DIR/Emblem - Illustration"/*.png "$TARGET_BASE/emblem/" 2>/dev/null
    COUNT=$(ls "$TARGET_BASE/emblem"/*.png 2>/dev/null | wc -l)
    echo "✓ Emblem Illustration: $COUNT files copied"
fi

# Copy High Detailed Vector
if [ -d "$SOURCE_DIR/High detailed vector" ]; then
    cp "$SOURCE_DIR/High detailed vector"/*.png "$TARGET_BASE/high-detailed/" 2>/dev/null
    COUNT=$(ls "$TARGET_BASE/high-detailed"/*.png 2>/dev/null | wc -l)
    echo "✓ High Detailed Vector: $COUNT files copied"
fi

# Copy Line Art
if [ -d "$SOURCE_DIR/Line Art" ]; then
    cp "$SOURCE_DIR/Line Art"/*.png "$TARGET_BASE/line-art/" 2>/dev/null
    COUNT=$(ls "$TARGET_BASE/line-art"/*.png 2>/dev/null | wc -l)
    echo "✓ Line Art: $COUNT files copied"
fi

# Copy Photo to Vector
if [ -d "$SOURCE_DIR/Photo to Vector Illustration" ]; then
    cp "$SOURCE_DIR/Photo to Vector Illustration"/*.png "$TARGET_BASE/photo-to-vector/" 2>/dev/null
    COUNT=$(ls "$TARGET_BASE/photo-to-vector"/*.png 2>/dev/null | wc -l)
    echo "✓ Photo to Vector: $COUNT files copied"
fi

# Copy Raster to Vector
if [ -d "$SOURCE_DIR/Raster to Vector Conversion" ]; then
    cp "$SOURCE_DIR/Raster to Vector Conversion"/*.png "$TARGET_BASE/raster-to-vector/" 2>/dev/null
    COUNT=$(ls "$TARGET_BASE/raster-to-vector"/*.png 2>/dev/null | wc -l)
    echo "✓ Raster to Vector: $COUNT files copied"
fi

# Copy Sketch to Vector
if [ -d "$SOURCE_DIR/Sketch-to-Vector Artwork" ]; then
    cp "$SOURCE_DIR/Sketch-to-Vector Artwork"/*.png "$TARGET_BASE/sketch-to-vector/" 2>/dev/null
    COUNT=$(ls "$TARGET_BASE/sketch-to-vector"/*.png 2>/dev/null | wc -l)
    echo "✓ Sketch to Vector: $COUNT files copied"
fi

# Copy Vector Artwork
if [ -d "$SOURCE_DIR/Vector Artwork" ]; then
    cp "$SOURCE_DIR/Vector Artwork"/*.png "$TARGET_BASE/vector-artwork/" 2>/dev/null
    COUNT=$(ls "$TARGET_BASE/vector-artwork"/*.png 2>/dev/null | wc -l)
    echo "✓ Vector Artwork: $COUNT files copied"
fi

echo ""
echo "✅ All images copied successfully!"
echo "🚀 Refresh your browser to see the images"
echo ""
