#!/bin/bash

# Script to export only changed files since last snapshot

# Check if snapshot file exists
SNAPSHOT_FILE="file_snapshot.md5"
if [ ! -f "$SNAPSHOT_FILE" ]; then
  echo "No previous snapshot found. Run track-changes.sh first to create a snapshot."
  exit 1
fi

# Create a temporary snapshot of current files
TEMP_SNAPSHOT="temp_snapshot.md5"
find . -type f -not -path "*/node_modules/*" \
       -not -path "*/.git/*" \
       -not -path "*/attached_assets/*" \
       -exec md5sum {} \; > "$TEMP_SNAPSHOT"

# Compare the snapshots and get changed files
CHANGED_FILES="changed_files.txt"
diff "$SNAPSHOT_FILE" "$TEMP_SNAPSHOT" | grep "^>" | cut -d' ' -f-2 --complement > "$CHANGED_FILES"

# Check if there are any changed files
if [ ! -s "$CHANGED_FILES" ]; then
  echo "No files have changed since the last snapshot."
  rm "$TEMP_SNAPSHOT" "$CHANGED_FILES"
  exit 0
fi

# Create timestamp for the zip file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CHANGES_ZIP="gadgetswap_changes_${TIMESTAMP}.zip"

# Create a temporary directory for the export
mkdir -p changes_export

# Copy only changed files with their directory structure
echo "Copying changed files..."
while IFS= read -r file; do
  # Create the directory structure
  dir=$(dirname "$file")
  mkdir -p "changes_export/$dir"
  
  # Copy the file
  cp "$file" "changes_export/$file"
done < "$CHANGED_FILES"

# Create the ZIP archive
echo "Creating ZIP archive of changed files..."
(cd changes_export && zip -r "../$CHANGES_ZIP" .)

# Clean up
rm -rf changes_export "$TEMP_SNAPSHOT" "$CHANGED_FILES"

echo "===== Changes exported to $CHANGES_ZIP ====="
echo "This file contains only files that have changed since your last snapshot."
echo "Download this file and selectively update your GitHub repository."
echo ""
echo "Would you like to update the snapshot with current files? (y/n)"
read -r UPDATE_SNAPSHOT

if [ "$UPDATE_SNAPSHOT" = "y" ] || [ "$UPDATE_SNAPSHOT" = "Y" ]; then
  find . -type f -not -path "*/node_modules/*" \
         -not -path "*/.git/*" \
         -not -path "*/attached_assets/*" \
         -exec md5sum {} \; > "$SNAPSHOT_FILE"
  echo "Snapshot updated."
else
  echo "Snapshot not updated."
fi