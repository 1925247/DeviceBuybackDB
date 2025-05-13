#!/bin/bash

# Script to create a fresh export of the project for GitHub updates
echo "===== Creating GitHub update package ====="

# Create a timestamp for the filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="gadgetswap_update_${TIMESTAMP}.zip"

# Create a temporary directory for the export
mkdir -p temp_export

# Copy all files except node_modules, .git, and temporary directories
echo "Copying project files..."
find . -type f -not -path "*/node_modules/*" \
       -not -path "*/.git/*" \
       -not -path "*/temp_export/*" \
       -not -path "*/attached_assets/*" \
       | xargs -I{} cp --parents {} temp_export/

# Create the ZIP archive
echo "Creating ZIP archive..."
cd temp_export && zip -r "../$FILENAME" . && cd ..

# Clean up temporary directory
rm -rf temp_export

echo "===== Update package created: $FILENAME ====="
echo "Download this file and upload it to your GitHub repository"
echo "For incremental updates, extract only the files you've changed"