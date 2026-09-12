# PhotoStudio Ansible Deployment

This directory contains Ansible playbooks for deploying the PhotoStudio application to an Ubuntu server.

## Prerequisites

- Ansible installed on your local machine
- SSH access to your Ubuntu server
- Ubuntu server with sudo privileges
- GitHub repository with PhotoStudio code

## Setup

1. **Configure Inventory File**

   Edit `ansible/inventory/hosts.ini` and replace `YOUR_SERVER_IP` with your actual server IP:

   ```ini
   [webservers]
   webserver ansible_host=YOUR_SERVER_IP ansible_user=ubuntu
   ```

2. **Configure SSH Access**

   Make sure you have SSH key access to your server:
   ```bash
   ssh-copy-id ubuntu@YOUR_SERVER_IP
   ```

3. **Test Connection**

   Test the Ansible connection:
   ```bash
   cd ansible
   ansible webservers -m ping
   ```

## Deployment Playbooks

### Individual Playbooks

You can run individual playbooks for specific tasks:

- `01-ubuntu-setup.yml` - Ubuntu server setup and system updates
- `02-docker-install.yml` - Docker and Docker Compose installation
- `03-git-install.yml` - Git installation and configuration
- `04-firewall-config.yml` - UFW firewall configuration
- `05-app-deployment.yml` - Application deployment from GitHub
- `06-environment-config.yml` - Environment variables configuration
- `07-docker-compose.yml` - Docker Compose startup/update
- `08-ssl-setup.yml` - SSL/HTTPS setup with Let's Encrypt
- `09-database-backup.yml` - Automated database backup setup
- `10-monitoring.yml` - Monitoring setup with Prometheus and Grafana

### Complete Deployment

Run the complete deployment pipeline with all features:

```bash
cd ansible
ansible-playbook playbooks/site.yml
```

### Minimal Deployment

Run the minimal deployment without SSL, backups, or monitoring:

```bash
cd ansible
ansible-playbook playbooks/site-minimal.yml
```

### With Custom Secret Key

To provide a custom secret key for JWT authentication:

```bash
cd ansible
SECRET_KEY=your-custom-secret-key ansible-playbook playbooks/site.yml
```

### With SSL/HTTPS

To enable SSL/HTTPS with Let's Encrypt:

```bash
cd ansible
DOMAIN_NAME=yourdomain.com SSL_EMAIL=admin@yourdomain.com ansible-playbook playbooks/08-ssl-setup.yml
```

## Deployment Steps

The deployment process performs the following steps:

1. **Ubuntu Server Setup**
   - Update system packages
   - Install essential dependencies
   - Configure timezone
   - Create application directories
   - Disable swap (Docker requirement)

2. **Docker Installation**
   - Add Docker repository
   - Install Docker CE, CLI, and Compose
   - Configure Docker daemon
   - Add user to docker group

3. **Git Installation**
   - Install Git
   - Configure Git user
   - Add GitHub to known hosts

4. **Firewall Configuration**
   - Install UFW firewall
   - Configure allowed ports (SSH, HTTP, HTTPS, 3000, 8000)
   - Enable firewall

5. **Application Deployment**
   - Clone repository from GitHub
   - Set directory permissions
   - Create necessary directories
   - Copy environment files

6. **Environment Configuration**
   - Configure .env files with secret keys
   - Set database paths
   - Configure API URLs

7. **Docker Compose Startup**
   - Build Docker images
   - Start containers
   - Health checks
   - Display container status

8. **SSL/HTTPS Setup** (Optional)
   - Install Certbot and Nginx
   - Configure SSL certificates
   - Setup automatic renewal
   - Configure HTTPS redirect

9. **Database Backup Setup** (Optional)
   - Create backup scripts
   - Setup automated daily backups
   - Configure backup monitoring
   - Set retention policy

10. **Monitoring Setup** (Optional)
    - Install Prometheus
    - Install Grafana
    - Setup Node Exporter
    - Configure cAdvisor for Docker metrics

## Post-Deployment

After successful deployment:

1. **Access the Application**
   - Frontend: `http://YOUR_SERVER_IP:3000` (or `https://yourdomain.com` with SSL)
   - Backend API: `http://YOUR_SERVER_IP:8000`
   - API Documentation: `http://YOUR_SERVER_IP:8000/docs`
   - Prometheus: `http://YOUR_SERVER_IP:9090` (if monitoring enabled)
   - Grafana: `http://YOUR_SERVER_IP:3001` (if monitoring enabled, admin/admin123)

2. **Default Credentials**
   - Username: `admin`
   - Password: `admin123`

3. **Monitor Containers**
   ```bash
   ssh ubuntu@YOUR_SERVER_IP
   docker ps
   docker logs photostudio-backend
   docker logs photostudio-frontend
   ```

4. **Update Deployment**
   To update the application, simply run the deployment again:
   ```bash
   ansible-playbook playbooks/site.yml
   ```

## Troubleshooting

### Connection Issues
- Ensure SSH key is properly configured
- Check firewall rules on server
- Verify server IP in inventory file

### Docker Issues
- Check Docker service status: `sudo systemctl status docker`
- Verify user is in docker group
- Check Docker logs: `sudo journalctl -u docker`

### Application Issues
- Check container logs: `docker logs photostudio-backend`
- Verify environment variables in .env files
- Check database initialization in backend container

### Firewall Issues
- Check UFW status: `sudo ufw status`
- Verify required ports are allowed
- Check server security groups (if using cloud provider)

## Security Notes

- Change the default admin password after first login
- Use HTTPS in production (configure SSL/TLS)
- Keep the SECRET_KEY secure and unique
- Regularly update system packages
- Monitor logs for suspicious activity
- Use firewall to restrict access as needed

## Customization

You can customize the deployment by modifying:

- **Server variables** in inventory file
- **Application ports** in docker-compose.yml
- **Environment variables** in environment configuration playbook
- **Firewall rules** in firewall configuration playbook
- **Docker configurations** in Dockerfiles

## Maintenance

### Regular Updates
```bash
# Update system packages
ansible-playbook playbooks/01-ubuntu-setup.yml

# Update application
ansible-playbook playbooks/05-app-deployment.yml
ansible-playbook playbooks/07-docker-compose.yml
```

### Backup
```bash
# Backup database
ssh ubuntu@YOUR_SERVER_IP
docker exec photostudio-backend cp /app/data/inventory.db /backup/
```

### Logs
```bash
# View application logs
ssh ubuntu@YOUR_SERVER_IP
docker logs -f photostudio-backend
docker logs -f photostudio-frontend
```

## Advanced Features

### SSL/HTTPS Setup

The SSL setup playbook configures Let's Encrypt certificates for HTTPS:

```bash
DOMAIN_NAME=yourdomain.com SSL_EMAIL=admin@yourdomain.com ansible-playbook playbooks/08-ssl-setup.yml
```

Features:
- Automatic SSL certificate issuance
- Nginx reverse proxy configuration
- HTTP to HTTPS redirect
- Automatic certificate renewal (daily at 3 AM)
- Security headers configuration

**Note:** This requires a valid domain name pointing to your server.

### Database Backups

The backup playbook sets up automated database backups:

```bash
ansible-playbook playbooks/09-database-backup.yml
```

Features:
- Automated daily backups at 2 AM
- 7-day retention policy
- Backup monitoring at 8:30 AM
- Manual backup script: `/opt/photostudio/backup_database.sh`
- Manual restore script: `/opt/photostudio/restore_database.sh`

To manually restore a backup:
```bash
ssh ubuntu@YOUR_SERVER_IP
cd /opt/photostudio
./restore_database.sh photostudio_backup_20240912_020000.db.gz
```

### Monitoring Setup

The monitoring playbook installs Prometheus and Grafana:

```bash
ansible-playbook playbooks/10-monitoring.yml
```

Features:
- Prometheus for metrics collection
- Grafana for visualization
- Node Exporter for system metrics
- cAdvisor for Docker container metrics
- Pre-configured dashboards

Access points:
- Prometheus: `http://YOUR_SERVER_IP:9090`
- Grafana: `http://YOUR_SERVER_IP:3001` (admin/admin123)

## Deployment Strategies

### Development/Testing
Use the minimal deployment for faster setup and testing:
```bash
ansible-playbook playbooks/site-minimal.yml
```

### Production
Use the complete deployment with all security and monitoring features:
```bash
DOMAIN_NAME=yourdomain.com SSL_EMAIL=admin@yourdomain.com ansible-playbook playbooks/site.yml
```

### Staging
Deploy with monitoring but without SSL:
```bash
ansible-playbook playbooks/site-minimal.yml
ansible-playbook playbooks/09-database-backup.yml
ansible-playbook playbooks/10-monitoring.yml
```

## Advanced Features

### SSL/HTTPS Setup

The SSL setup playbook configures Let's Encrypt certificates for HTTPS:

```bash
DOMAIN_NAME=yourdomain.com SSL_EMAIL=admin@yourdomain.com ansible-playbook playbooks/08-ssl-setup.yml
```

Features:
- Automatic SSL certificate issuance
- Nginx reverse proxy configuration
- HTTP to HTTPS redirect
- Automatic certificate renewal (daily at 3 AM)
- Security headers configuration

**Note:** This requires a valid domain name pointing to your server.

### Database Backups

The backup playbook sets up automated database backups:

```bash
ansible-playbook playbooks/09-database-backup.yml
```

Features:
- Automated daily backups at 2 AM
- 7-day retention policy
- Backup monitoring at 8:30 AM
- Manual backup script: `/opt/photostudio/backup_database.sh`
- Manual restore script: `/opt/photostudio/restore_database.sh`

To manually restore a backup:
```bash
ssh ubuntu@YOUR_SERVER_IP
cd /opt/photostudio
./restore_database.sh photostudio_backup_20240912_020000.db.gz
```

### Monitoring Setup

The monitoring playbook installs Prometheus and Grafana:

```bash
ansible-playbook playbooks/10-monitoring.yml
```

Features:
- Prometheus for metrics collection
- Grafana for visualization
- Node Exporter for system metrics
- cAdvisor for Docker container metrics
- Pre-configured dashboards

Access points:
- Prometheus: `http://YOUR_SERVER_IP:9090`
- Grafana: `http://YOUR_SERVER_IP:3001` (admin/admin123)

## Deployment Strategies

### Development/Testing
Use the minimal deployment for faster setup and testing:
```bash
ansible-playbook playbooks/site-minimal.yml
```

### Production
Use the complete deployment with all security and monitoring features:
```bash
DOMAIN_NAME=yourdomain.com SSL_EMAIL=admin@yourdomain.com ansible-playbook playbooks/site.yml
```

### Staging
Deploy with monitoring but without SSL:
```bash
ansible-playbook playbooks/site-minimal.yml
ansible-playbook playbooks/09-database-backup.yml
ansible-playbook playbooks/10-monitoring.yml
```
