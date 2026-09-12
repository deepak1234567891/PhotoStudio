# Staging Deployment Guide

This guide will help you deploy the PhotoStudio application to a staging environment using the CI/CD pipeline.

## Prerequisites

### 1. Staging Server Requirements
- Ubuntu 20.04+ server
- At least 2GB RAM, 2 CPU cores
- 20GB disk space
- SSH access with sudo privileges
- Public IP address or domain name

### 2. Local Requirements
- Ansible installed on your local machine
- SSH key access to the staging server
- GitHub repository access

## Step-by-Step Deployment

### Step 1: Prepare Your Staging Server

1. **Get your server IP address**
   ```bash
   # If using cloud provider, note the public IP
   # Example: 192.168.1.100 or your cloud provider IP
   ```

2. **Create SSH key (if you don't have one)**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   # Press Enter to accept default location
   # Set a passphrase or leave empty for no passphrase
   ```

3. **Copy SSH key to server**
   ```bash
   ssh-copy-id ubuntu@YOUR_STAGING_SERVER_IP
   # Enter your server password when prompted
   ```

4. **Test SSH connection**
   ```bash
   ssh ubuntu@YOUR_STAGING_SERVER_IP
   # You should be able to login without password
   exit
   ```

### Step 2: Configure GitHub Secrets

1. **Go to your GitHub repository**
   - Navigate to: https://github.com/deepak1234567891/PhotoStudio
   - Go to: Settings → Secrets and variables → Actions

2. **Add the following secrets:**

   **SSH_PRIVATE_KEY**
   - Get your private key: `cat ~/.ssh/id_rsa`
   - Copy the entire content (including BEGIN/END lines)
   - Paste as the secret value

   **SERVER_USER**
   - Value: `ubuntu` (or your SSH username)

   **STAGING_SERVER_IP**
   - Value: Your staging server IP address
   - Example: `192.168.1.100`

   **DOCKER_USERNAME** (Optional - for Docker Hub)
   - Your Docker Hub username
   - Get from: https://hub.docker.com/

   **DOCKER_PASSWORD** (Optional - for Docker Hub)
   - Your Docker Hub password or access token
   - Generate token at: https://hub.docker.com/settings/security

3. **Verify secrets are added**
   - Check that all secrets appear in the list
   - Ensure no typos in the values

### Step 3: Configure Staging Deployment

#### Option A: Automated CI/CD Deployment (Recommended)

1. **Push to main branch**
   ```bash
   git add .
   git commit -m "Prepare for staging deployment"
   git push origin main
   ```

2. **Monitor the deployment**
   - Go to Actions tab in GitHub
   - Click on the "CD Pipeline" workflow
   - Watch the deployment progress
   - Check for any errors

3. **Access the staging application**
   - Frontend: `http://YOUR_STAGING_SERVER_IP:3000`
   - Backend API: `http://YOUR_STAGING_SERVER_IP:8000`
   - API Docs: `http://YOUR_STAGING_SERVER_IP:8000/docs`

#### Option B: Manual Ansible Deployment

If you prefer manual deployment or want to test before CI/CD:

1. **Update inventory file**
   ```bash
   cd ansible
   # Edit inventory/hosts.ini
   ```

   ```ini
   [webservers]
   webserver ansible_host=YOUR_STAGING_SERVER_IP ansible_user=ubuntu
   ```

2. **Test connection**
   ```bash
   ansible webservers -m ping
   ```

3. **Run minimal deployment**
   ```bash
   ansible-playbook playbooks/site-minimal.yml
   ```

4. **Verify deployment**
   ```bash
   ssh ubuntu@YOUR_STAGING_SERVER_IP
   docker ps
   # You should see photostudio-backend and photostudio-frontend containers
   ```

### Step 4: Verify Staging Deployment

1. **Check container status**
   ```bash
   ssh ubuntu@YOUR_STAGING_SERVER_IP
   docker ps
   ```

2. **Check application logs**
   ```bash
   docker logs photostudio-backend
   docker logs photostudio-frontend
   ```

3. **Test the application**
   - Open browser: `http://YOUR_STAGING_SERVER_IP:3000`
   - Login with: admin / admin123
   - Test basic functionality (create item, create sale)

4. **Check API endpoints**
   ```bash
   curl http://YOUR_STAGING_SERVER_IP:8000/
   curl http://YOUR_STAGING_SERVER_IP:8000/docs
   ```

### Step 5: Staging Testing Checklist

- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Login functionality works
- [ ] Can create inventory items
- [ ] Can create sales invoices
- [ ] Reports generate correctly
- [ ] Dashboard displays data
- [ ] No console errors in browser
- [ ] Docker containers are running
- [ ] No errors in container logs

## Troubleshooting

### CI/CD Deployment Fails

**Secret Issues:**
- Verify all secrets are correctly configured
- Check SSH_PRIVATE_KEY format (should include BEGIN/END lines)
- Ensure server IP is correct

**Connection Issues:**
```bash
# Test SSH connection manually
ssh ubuntu@YOUR_STAGING_SERVER_IP

# Check if Ansible can connect
cd ansible
ansible webservers -m ping -vvv
```

**Deployment Issues:**
```bash
# Check server logs
ssh ubuntu@YOUR_STAGING_SERVER_IP
sudo journalctl -u docker
docker logs photostudio-backend
```

### Manual Deployment Issues

**Ansible Connection:**
```bash
# Test with verbose output
ansible webservers -m ping -vvv

# Check inventory file
cat inventory/hosts.ini
```

**Docker Issues:**
```bash
# Check Docker is running
ssh ubuntu@YOUR_STAGING_SERVER_IP
sudo systemctl status docker

# Check for Docker errors
sudo journalctl -u docker -n 50
```

**Application Issues:**
```bash
# Check container logs
docker logs photostudio-backend
docker logs photostudio-frontend

# Restart containers
docker restart photostudio-backend
docker restart photostudio-frontend
```

## Staging Environment Features

The staging deployment includes:
- ✅ Ubuntu server setup
- ✅ Docker and Docker Compose
- ✅ Git installation
- ✅ Firewall configuration
- ✅ Application deployment
- ✅ Environment configuration
- ✅ Docker containers startup
- ❌ SSL/HTTPS (not included in minimal deployment)
- ❌ Database backups (can be added separately)
- ❌ Monitoring (can be added separately)

## Adding Optional Features to Staging

### Add Database Backups
```bash
cd ansible
ansible-playbook playbooks/09-database-backup.yml
```

### Add Monitoring
```bash
cd ansible
ansible-playbook playbooks/10-monitoring.yml
```

### Add SSL/HTTPS (requires domain)
```bash
cd ansible
DOMAIN_NAME=staging.yourdomain.com SSL_EMAIL=admin@yourdomain.com \
ansible-playbook playbooks/08-ssl-setup.yml
```

## Staging vs Production

| Feature | Staging | Production |
|---------|---------|------------|
| Deployment | Automatic on push | Manual trigger |
| SSL/HTTPS | Optional | Required |
| Monitoring | Optional | Recommended |
| Backups | Optional | Required |
| Testing | Extensive | Smoke tests |
| Updates | Frequent | Controlled |

## Next Steps After Staging

1. **Test thoroughly** in staging environment
2. **Get stakeholder approval** for production deployment
3. **Configure production secrets** in GitHub
4. **Run production deployment** manually via GitHub Actions
5. **Monitor production** after deployment

## Quick Reference

**CI/CD Staging Deployment:**
```bash
git push origin main
# Monitor in GitHub Actions
```

**Manual Staging Deployment:**
```bash
cd ansible
ansible-playbook playbooks/site-minimal.yml
```

**Check Staging Status:**
```bash
ssh ubuntu@STAGING_SERVER_IP
docker ps
docker logs photostudio-backend
```

**Access Staging:**
- Frontend: `http://STAGING_SERVER_IP:3000`
- Backend: `http://STAGING_SERVER_IP:8000`
- API Docs: `http://STAGING_SERVER_IP:8000/docs`

## Support

If you encounter issues:
1. Check the detailed logs in GitHub Actions
2. Review the troubleshooting section above
3. Consult the main [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
4. Check [CI_CD_SETUP.md](CI_CD_SETUP.md) for CI/CD specific issues
