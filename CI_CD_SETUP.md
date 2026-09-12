# CI/CD Setup Guide

This guide explains how to set up the CI/CD pipeline for the PhotoStudio project using GitHub Actions.

## GitHub Secrets Configuration

To enable the CI/CD pipeline, you need to configure the following secrets in your GitHub repository:

### Required Secrets

1. **SSH_PRIVATE_KEY**
   - Your SSH private key for server access
   - Generate with: `ssh-keygen -t rsa -b 4096`
   - Copy the private key content to GitHub secrets

2. **SERVER_USER**
   - SSH username for your servers
   - Example: `ubuntu`

3. **STAGING_SERVER_IP**
   - IP address of your staging server
   - Example: `192.168.1.100`

4. **PRODUCTION_SERVER_IP**
   - IP address of your production server
   - Example: `192.168.1.200`

5. **DOMAIN_NAME**
   - Your domain name for production SSL
   - Example: `photostudio.yourdomain.com`

6. **SSL_EMAIL**
   - Email for Let's Encrypt SSL certificates
   - Example: `admin@yourdomain.com`

7. **DOCKER_USERNAME**
   - Your Docker Hub username
   - Example: `yourusername`

8. **DOCKER_PASSWORD**
   - Your Docker Hub password or access token
   - Generate at: https://hub.docker.com/settings/security

### How to Add Secrets

1. Go to your GitHub repository
2. Navigate to: Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with its corresponding value

## CI Pipeline (Automated Testing)

The CI pipeline runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### CI Workflow Steps

1. **Backend Tests**
   - Python linting (flake8)
   - Code formatting (black)
   - Import sorting (isort)
   - Type checking (mypy)
   - Unit tests with coverage (pytest)

2. **Frontend Tests**
   - ESLint linting
   - TypeScript type checking
   - Build verification
   - Unit tests (Jest)

3. **Security Scanning**
   - Trivy vulnerability scanner
   - Results uploaded to GitHub Security

4. **Docker Build Test**
   - Builds Docker images
   - Validates Dockerfiles
   - Tests multi-stage builds

5. **Ansible Validation**
   - Ansible lint
   - YAML lint
   - Playbook syntax validation

## CD Pipeline (Automated Deployment)

The CD pipeline runs on:
- Push to `main` branch (staging deployment)
- Manual trigger (production deployment)

### CD Workflow Steps

1. **Staging Deployment**
   - Runs minimal deployment automatically
   - Health checks after deployment
   - No SSL configuration

2. **Production Deployment**
   - Manual trigger required
   - Complete deployment with SSL
   - Health checks after deployment
   - Creates deployment tags

3. **Docker Image Push**
   - Builds and pushes to Docker Hub
   - Multi-tag support (branch, SHA, latest)
   - Layer caching for faster builds

4. **Rollback Capability**
   - Automatic rollback on failure
   - Reverts to previous commit
   - Notifies on rollback

## Manual Deployment Trigger

To manually trigger a production deployment:

1. Go to Actions tab in GitHub
2. Select "CD Pipeline" workflow
3. Click "Run workflow"
4. Select environment (staging/production)
5. Click "Run workflow"

## Testing Locally

### Backend Tests

```bash
cd backend
pip install -r requirements.txt
pytest
```

### Frontend Tests

```bash
cd frontend
npm install
npm test
```

### Docker Build

```bash
docker build -t photostudio-backend:test ./backend
docker build -t photostudio-frontend:test ./frontend
```

## Environment-Specific Configurations

### Staging
- Minimal deployment
- HTTP only
- Basic monitoring
- Database backups enabled

### Production
- Complete deployment
- HTTPS with SSL
- Full monitoring stack
- Database backups enabled
- Security headers

## Troubleshooting

### CI Pipeline Failures

**Backend tests fail:**
```bash
# Run tests locally to debug
cd backend
pytest -v
```

**Frontend tests fail:**
```bash
# Run tests locally to debug
cd frontend
npm test -- --verbose
```

**Docker build fails:**
```bash
# Test Docker build locally
docker build -t test ./backend
```

### CD Pipeline Failures

**SSH connection fails:**
- Verify SSH_PRIVATE_KEY is correct
- Check server IP addresses
- Ensure SSH key is added to server's authorized_keys

**Deployment fails:**
- Check server logs: `ssh user@server 'docker logs photostudio-backend'`
- Verify Ansible playbooks run locally
- Check firewall rules

**SSL certificate fails:**
- Ensure domain DNS is configured
- Verify port 80 is accessible
- Check domain name is correct in secrets

## Best Practices

1. **Branch Strategy**
   - Use `develop` for feature development
   - Use `main` for production-ready code
   - Create pull requests for review

2. **Testing**
   - Write tests for new features
   - Maintain high test coverage
   - Run tests locally before pushing

3. **Secrets Management**
   - Never commit secrets to repository
   - Rotate secrets regularly
   - Use different keys for staging/production

4. **Monitoring**
   - Check CI/CD pipeline status regularly
   - Review deployment logs
   - Monitor server health after deployments

5. **Rollback Strategy**
   - Keep previous versions tagged
   - Test rollback procedure
   - Document rollback steps

## Pipeline Optimization

### Speed Up CI Pipeline

1. **Use caching** (already configured)
2. **Run tests in parallel** (already configured)
3. **Optimize test suite**
4. **Use selective testing on PRs**

### Reduce Deployment Time

1. **Use Docker layer caching**
2. **Optimize Ansible playbooks**
3. **Use incremental updates**
4. **Parallelize where possible**

## Security Considerations

1. **Secrets Management**
   - Use GitHub Secrets for sensitive data
   - Never log secrets in actions
   - Rotate credentials regularly

2. **Dependency Scanning**
   - Regular dependency updates
   - Monitor security advisories
   - Use Dependabot for automated updates

3. **Access Control**
   - Limit who can trigger deployments
   - Use branch protection rules
   - Require reviews for main branch

## Monitoring and Alerts

Set up notifications for:
- CI pipeline failures
- Deployment failures
- Security vulnerabilities
- Test coverage drops

## Next Steps

1. Configure GitHub Secrets
2. Test CI pipeline with a sample commit
3. Test CD pipeline to staging
4. Configure production deployment
5. Set up monitoring and alerts
6. Document any custom configurations
