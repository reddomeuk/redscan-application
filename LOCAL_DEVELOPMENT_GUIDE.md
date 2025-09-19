# Local Development Workflow Guide

## Overview
This guide sets up efficient local development that integrates with your production GitHub repositories while avoiding file duplication.

## 🏗️ Local Development Strategy

### Option 1: Workspace Integration (Recommended)
Keep your local workspace as the primary development environment and sync specific changes to GitHub repos.

### Option 2: Direct Repository Development
Work directly in cloned GitHub repositories for feature development.

## 🔧 Setup Option 1: Workspace Integration

### 1. Local Development Environment
```bash
# Your current workspace structure
/Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-project/
├── src/                    # Frontend development
├── modules/               # Backend modules  
├── docker-compose.yml     # Local Docker setup
├── terraform/            # Infrastructure (sync to platform repo)
└── docs/                 # Documentation (sync to docs repo)
```

### 2. Repository Sync Scripts
Create selective sync scripts to push changes to appropriate repositories:

#### Frontend/Backend Sync Script
```bash
#!/bin/bash
# sync-application.sh - Sync app changes to redscan-application repo

LOCAL_WORKSPACE="/Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-project"
APP_REPO="/Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-application"

echo "🔄 Syncing application changes..."

# Sync specific directories
rsync -av --delete "$LOCAL_WORKSPACE/src/" "$APP_REPO/src/"
rsync -av --delete "$LOCAL_WORKSPACE/modules/" "$APP_REPO/modules/"
rsync -av --delete "$LOCAL_WORKSPACE/shared/" "$APP_REPO/shared/"
rsync -av "$LOCAL_WORKSPACE/package.json" "$APP_REPO/"
rsync -av "$LOCAL_WORKSPACE/docker-compose.yml" "$APP_REPO/"

echo "✅ Application sync complete"
```

#### Infrastructure Sync Script  
```bash
#!/bin/bash
# sync-platform.sh - Sync infrastructure changes to redscan-platform repo

LOCAL_WORKSPACE="/Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-project"
PLATFORM_REPO="/Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-platform"

echo "🔄 Syncing platform changes..."

# Sync terraform and infrastructure
rsync -av --delete "$LOCAL_WORKSPACE/terraform/" "$PLATFORM_REPO/terraform/"
rsync -av --delete "$LOCAL_WORKSPACE/infrastructure/" "$PLATFORM_REPO/infrastructure/"
rsync -av "$LOCAL_WORKSPACE/"*.md "$PLATFORM_REPO/" 2>/dev/null || true

echo "✅ Platform sync complete"
```

### 3. Local Docker Development
```bash
# In your local workspace, use Docker for development
cd /Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-project

# Start local development environment
docker-compose -f docker-compose.dev.yml up -d

# Or use the modular setup
docker-compose -f docker-compose.modular.yml up -d
```

## 🔧 Setup Option 2: Direct Repository Development

### 1. Clone Repositories for Direct Development
```bash
# Create a development directory
mkdir -p /Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Development
cd /Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Development

# Clone repositories
git clone https://github.com/reddomeuk/redscan-application.git
git clone https://github.com/reddomeuk/redscan-platform.git  
git clone https://github.com/reddomeuk/redscan-documentation.git
```

### 2. Development Workflow
```bash
# Work on features in application repo
cd redscan-application
git checkout development
git checkout -b feature/new-feature

# Make changes, test locally with Docker
docker-compose up -d

# Commit and push to development branch
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create PR to development branch
# After merge, changes auto-deploy to development environment
```

## 🐳 Docker Development Setup

### Local Docker Configuration
```yaml
# docker-compose.local.yml
version: '3.8'

services:
  # Frontend development with hot reload
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    environment:
      - NODE_ENV=development
      - CHOKIDAR_USEPOLLING=true

  # Backend API
  api:
    build:
      context: ./modules/core-dashboard
    ports:
      - "8080:8080"
    volumes:
      - ./modules:/app/modules
    environment:
      - NODE_ENV=development

  # Database for local development
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: redscan_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 📋 Development Workflow Recommendations

### Daily Development Process

#### Option 1: Workspace-Based
1. **Develop locally** in your workspace with Docker
2. **Test changes** using local Docker environment
3. **Sync specific changes** using sync scripts
4. **Push to appropriate repository branches**
5. **Deploy through GitHub → Terraform Cloud pipeline**

#### Option 2: Repository-Based  
1. **Work directly** in cloned repositories
2. **Create feature branches** for new work
3. **Test locally** with Docker in repository
4. **Push to development branch** for auto-deployment
5. **Promote through staging → production**

## 🛠️ Recommended Tools

### Git Configuration
```bash
# Set up git aliases for easier workflow
git config --global alias.sync-dev '!f() { 
    git add . && 
    git commit -m "dev: local changes" && 
    git push origin development; 
}; f'

git config --global alias.new-feature '!f() { 
    git checkout development && 
    git pull origin development && 
    git checkout -b feature/$1; 
}; f'
```

### VS Code Workspace
```json
{
    "folders": [
        {
            "name": "Local Workspace",
            "path": "/Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-project"
        },
        {
            "name": "Application Repo", 
            "path": "/Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-application"
        },
        {
            "name": "Platform Repo",
            "path": "/Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-platform"
        }
    ],
    "settings": {
        "docker.dockerPath": "docker",
        "docker.enableDockerComposeLanguageService": true
    }
}
```

## 🎯 Avoiding File Duplication

### Best Practices
1. **Use .gitignore** properly in each repository
2. **Sync only necessary files** between workspace and repos
3. **Use symbolic links** for shared configuration
4. **Maintain single source of truth** for each component

### .gitignore Template
```gitignore
# Local development
.env.local
.env.development.local
docker-compose.override.yml
*.log

# Terraform
*.tfstate
*.tfstate.*
.terraform/
terraform.tfvars

# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.next/

# IDE
.vscode/settings.json
.idea/
```

## 🚀 Deployment Integration

Your development changes will flow through:
```
Local Development (Docker) 
    ↓
Development Branch Push
    ↓  
Development Environment (auto-deploy)
    ↓
Staging Branch (manual approval)
    ↓
Production Branch (manual approval)
```

This workflow gives you:
- ✅ Fast local development with Docker
- ✅ Clean separation of concerns
- ✅ No file duplication issues
- ✅ Integration with production pipeline
- ✅ Flexibility to work in workspace or repositories