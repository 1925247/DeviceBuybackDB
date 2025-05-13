#!/bin/bash

# Script to track file changes since last snapshot

# Check if snapshot file exists
SNAPSHOT_FILE="file_snapshot.md5"
if [ ! -f "$SNAPSHOT_FILE" ]; then
  echo "No previous snapshot found. Creating initial snapshot..."
  find . -type f -not -path "*/node_modules/*" \
         -not -path "*/.git/*" \
         -not -path "*/attached_assets/*" \
         -exec md5sum {} \; > "$SNAPSHOT_FILE"
  echo "Initial snapshot created. Run this script again later to see changes."
  exit 0
fi

# Create a temporary snapshot of current files
TEMP_SNAPSHOT="temp_snapshot.md5"
find . -type f -not -path "*/node_modules/*" \
       -not -path "*/.git/*" \
       -not -path "*/attached_assets/*" \
       -exec md5sum {} \; > "$TEMP_SNAPSHOT"

# Compare the snapshots
echo "===== Files changed since last snapshot ====="
CHANGED_FILES="changed_files.txt"
diff "$SNAPSHOT_FILE" "$TEMP_SNAPSHOT" | grep "^>" | cut -d' ' -f-2 --complement > "$CHANGED_FILES"

# Display results
if [ -s "$CHANGED_FILES" ]; then
  echo "The following files have changed:"
  cat "$CHANGED_FILES"
  echo ""
  echo "Total: $(wc -l < "$CHANGED_FILES") file(s) changed"
else
  echo "No files have changed since the last snapshot."
fi

# Ask if user wants to update the snapshot
echo ""
echo "Do you want to update the snapshot with current files? (y/n)"
read -r UPDATE_SNAPSHOT

if [ "$UPDATE_SNAPSHOT" = "y" ] || [ "$UPDATE_SNAPSHOT" = "Y" ]; then
  mv "$TEMP_SNAPSHOT" "$SNAPSHOT_FILE"
  echo "Snapshot updated."
else
  rm "$TEMP_SNAPSHOT"
  echo "Snapshot not updated."
fi

# Clean up
rm -f "$CHANGED_FILES"