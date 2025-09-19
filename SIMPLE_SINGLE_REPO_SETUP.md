# 🚀 Simple Single Repository Development Setup

## Overview
You're switching to a simplified workflow using only the `redscan-application` repository for all development.

## 🎯 Your New Simple Workflow

### Step 1: Make redscan-application your primary workspace
```bash
cd /Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-application
```

### Step 2: Daily Development Process
```bash
# 1. Start local development
docker-compose up -d

# 2. Make your changes
# ... edit files in VS Code ...

# 3. Test locally
# ... test your changes ...

# 4. Deploy to development (auto-deploy)
git add .
git commit -m "feat: describe your changes"
git push origin development

# 5. Deploy to staging (when ready)
git checkout staging
git merge development
git push origin staging

# 6. Deploy to production (when approved)
git checkout main  
git merge staging
git push origin main
```

## 🏗️ Repository Structure

Your `redscan-application` repository now contains everything:
- Frontend code (`src/`)
- Backend modules (`modules/`)
- Shared components (`shared/`)
- Docker configuration
- Infrastructure references

## 🐳 Local Development with Docker

### Development Environment
```bash
# Start all services for development
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Available Services
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **AI Assistant**: http://localhost:8081
- **Dashboard**: http://localhost:8082

## 🌿 Branch Strategy (Simple)

```
development → Development environment (auto-deploy)
     ↓
  staging → Staging environment (manual approval)
     ↓
    main → Production environment (manual approval)
```

## 📱 VS Code Setup

Open the application repository as your primary workspace:
```bash
code /Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-application
```

## 🔧 Quick Commands

Add these aliases to your shell for even faster development:

```bash
# Add to ~/.zshrc
alias rs-dev="cd /Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-application"
alias rs-start="docker-compose up -d"
alias rs-stop="docker-compose down"
alias rs-logs="docker-compose logs -f"
alias rs-deploy="git add . && git commit -m 'dev: quick deploy' && git push origin development"
```

Then use:
```bash
rs-dev      # Go to development directory
rs-start    # Start development environment
rs-deploy   # Quick deploy to development
```

## 🎉 Benefits of This Approach

- ✅ **Single place to work** - no file duplication
- ✅ **Direct deployment** - push and deploy immediately
- ✅ **Simple Docker** - just `docker-compose up`
- ✅ **Clean workflow** - no sync scripts needed
- ✅ **Production pipeline** - still uses Terraform Cloud
- ✅ **Team collaboration** - everyone uses same repo

## 🚀 Migration from Old Workspace

If you have changes in your old workspace (`redscan-project`), copy them once:

```bash
# Copy any new changes from old workspace (one-time)
rsync -av /Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-project/src/ /Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-application/src/

# Then delete the old workspace (optional)
# rm -rf /Users/bazamchekrian/Desktop/RedDome/RedDome-Projects/Reddome-PRD/Redscan/redscan-project
```

## 📋 Your New Daily Routine

1. **Open**: `redscan-application` in VS Code
2. **Start**: `docker-compose up -d`
3. **Develop**: Make changes directly in the repository
4. **Test**: Use local Docker environment
5. **Deploy**: `git push origin development`
6. **Done**: Terraform Cloud handles the rest!

This is now your primary development environment - simple, clean, and efficient! 🎯