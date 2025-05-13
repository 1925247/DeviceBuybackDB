# GitHub Sync Instructions for GadgetSwap

This document explains how to keep your GitHub repository in sync with changes made in the Replit environment.

## Initial Setup

1. **Create the GitHub Repository**
   - Go to GitHub and create a new repository named "gadgetswap"
   - Do NOT initialize with README, license, or .gitignore

2. **Upload the Complete Project**
   - In Replit, download the `gadgetswap_project.zip` file
   - Extract this ZIP file to a local folder on your computer
   - Initialize Git in this folder: `git init`
   - Add the GitHub repository as remote: `git remote add origin https://github.com/YOUR-USERNAME/gadgetswap.git`
   - Add all files: `git add .`
   - Commit files: `git commit -m "Initial project upload"`
   - Push to GitHub: `git push -u origin main`

## Regular Updates

### Option 1: Track & Export Only Changed Files

This approach helps track which files have changed since your last update and creates a ZIP with only those files.

1. **Initial Snapshot**
   - Run `./track-changes.sh` to create an initial snapshot of your files
   - This creates a `file_snapshot.md5` file that tracks file states

2. **After Making Changes**
   - Run `./track-changes.sh` again to see which files have changed
   - Review the list of changed files

3. **Export Changed Files**
   - Run `./export-changes.sh` to create a ZIP with only changed files
   - Download the resulting `gadgetswap_changes_TIMESTAMP.zip` file

4. **Update GitHub**
   - Extract the ZIP file to your local repository
   - Commit and push only the changed files to GitHub:
     ```
     git add [changed-files]
     git commit -m "Update: describe your changes"
     git push
     ```

### Option 2: Full Project Updates

If you prefer to sync the entire project each time:

1. **Create Updated Archive**
   - Run `./update-github.sh` to create a complete project ZIP
   - Download the resulting `gadgetswap_update_TIMESTAMP.zip` file

2. **Update GitHub**
   - Replace all files in your local repository with the contents of the ZIP
   - Commit and push all changes:
     ```
     git add .
     git commit -m "Full project update: describe your changes"
     git push
     ```

## Best Practices

1. **Regular Updates**
   - Sync with GitHub after completing significant features or fixes
   - Make meaningful commit messages describing what changed

2. **Use Branches**
   - For major feature development, create a new branch in your local repo
   - Merge back to main when the feature is complete

3. **Snapshot Management**
   - Update the file snapshot (`track-changes.sh`) after each GitHub sync
   - This ensures accurate tracking of changes since the last update

4. **Documentation**
   - Update README.md and other documentation when relevant
   - Keep your GitHub repository informative for collaborators

## Troubleshooting

- If the scripts report errors, ensure you have the `zip` command installed
- If tracking seems incorrect, delete `file_snapshot.md5` and create a new snapshot
- For merge conflicts, resolve them carefully in your local repository before pushing