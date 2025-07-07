#!/bin/bash

# ERC-4337 Bundler Test Results - Deployment Script
# This script helps prepare files for GitHub Pages deployment

echo "🚀 Preparing ERC-4337 Bundler Test Results for deployment..."

# Create deployment directory
mkdir -p deploy

# Copy essential files
echo "📁 Copying files..."
cp index.html deploy/
cp script.js deploy/
cp README.md deploy/

# Create a simple .gitignore for the deployment
echo "📝 Creating .gitignore..."
cat > deploy/.gitignore << EOF
# Deployment files
.DS_Store
*.log
EOF

# Create GitHub Pages configuration
echo "⚙️ Creating GitHub Pages configuration..."
cat > deploy/.github/workflows/deploy.yml << EOF
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
EOF

echo "✅ Deployment files prepared in 'deploy/' directory"
echo ""
echo "📋 Next steps:"
echo "1. Create a new GitHub repository"
echo "2. Copy files from 'deploy/' to your repository"
echo "3. Push to main/master branch"
echo "4. Go to Settings → Pages → Deploy from a branch"
echo "5. Your site will be available at https://[username].github.io/[repository-name]"
echo ""
echo "🌐 Or use GitHub Gist:"
echo "1. Create a new Gist with index.html"
echo "2. Access at https://gist.github.com/[username]/[gist-id]"
echo ""
echo "🎨 Customize the 'Back to Documentation' link in index.html before deploying!" 