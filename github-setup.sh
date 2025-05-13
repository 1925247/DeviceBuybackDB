#!/bin/bash

# Script to setup GitHub repository for GadgetSwap project

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install git first."
    exit 1
fi

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    git init
    echo "Git repository initialized."
else
    echo "Git repository already exists."
fi

# Add all files to git
git add .

# Initial commit
git commit -m "Initial commit: GadgetSwap platform"

# Instructions for connecting to GitHub
echo "===================================================="
echo "Your local repository has been initialized."
echo "To connect to GitHub, follow these steps:"
echo ""
echo "1. Create a new repository on GitHub (without README, LICENSE, or .gitignore)"
echo "   at https://github.com/new"
echo ""
echo "2. Connect your local repository to GitHub with these commands:"
echo "   git remote add origin https://github.com/YOUR-USERNAME/gadgetswap.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Replace 'YOUR-USERNAME' with your actual GitHub username"
echo "===================================================="