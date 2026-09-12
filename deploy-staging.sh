#!/bin/bash

# PhotoStudio Staging Deployment Script
# This script helps you prepare and trigger staging deployment

set -e

echo "=========================================="
echo "PhotoStudio Staging Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
echo "Checking prerequisites..."

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed"
    exit 1
fi
print_success "Git is available"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi
print_success "Git repository detected"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "You're not on the main branch"
    read -p "Do you want to switch to main branch? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
        print_success "Switched to main branch"
    else
        print_error "Deployment should be done from main branch"
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes"
    git status --short
    read -p "Do you want to commit and push these changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        print_success "Changes committed"
    else
        print_error "Please commit or stash changes before deployment"
        exit 1
    fi
fi

# GitHub Secrets Check
echo ""
echo "Checking GitHub Secrets configuration..."
echo "Please ensure the following secrets are configured in your GitHub repository:"
echo "  - SSH_PRIVATE_KEY"
echo "  - SERVER_USER"
echo "  - STAGING_SERVER_IP"
echo "  - DOCKER_USERNAME (optional)"
echo "  - DOCKER_PASSWORD (optional)"
echo ""
read -p "Have you configured these secrets? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Please configure GitHub secrets first"
    echo "Go to: https://github.com/deepak1234567891/PhotoStudio/settings/secrets/actions"
    exit 1
fi

# Staging Server Check
echo ""
echo "Staging Server Configuration"
read -p "Enter your staging server IP: " server_ip
echo "Testing SSH connection to $server_ip..."

if ssh -o ConnectTimeout=5 ubuntu@$server_ip exit &> /dev/null; then
    print_success "SSH connection successful"
else
    print_error "Cannot connect to staging server"
    echo "Please ensure:"
    echo "  - Server IP is correct"
    echo "  - SSH key is copied to server: ssh-copy-id ubuntu@$server_ip"
    echo "  - Server is accessible"
    exit 1
fi

# Final confirmation
echo ""
echo "=========================================="
echo "Ready to deploy to staging"
echo "=========================================="
echo "Server: $server_ip"
echo "Branch: main"
echo ""
read -p "Do you want to proceed with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled"
    exit 0
fi

# Push to trigger CI/CD
echo ""
echo "Pushing to main branch to trigger CI/CD deployment..."
git push origin main

if [ $? -eq 0 ]; then
    print_success "Code pushed successfully"
    echo ""
    echo "=========================================="
    echo "Deployment Triggered"
    echo "=========================================="
    echo "Monitor the deployment at:"
    echo "https://github.com/deepak1234567891/PhotoStudio/actions"
    echo ""
    echo "After successful deployment, access the application at:"
    echo "  Frontend: http://$server_ip:3000"
    echo "  Backend: http://$server_ip:8000"
    echo "  API Docs: http://$server_ip:8000/docs"
    echo ""
    echo "Default credentials: admin / admin123"
    echo "=========================================="
else
    print_error "Failed to push to GitHub"
    exit 1
fi
