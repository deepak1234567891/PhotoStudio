# PhotoStudio Deployment Guide

This guide shows you how to deploy your PhotoStudio application using the different deployment strategies available.

## Prerequisites

1. **Ubuntu Server** with SSH access
2. **Ansible** installed on your local machine
3. **GitHub repository** with your PhotoStudio code

## Step 1: Configure Inventory

Edit the inventory file with your server details:

```bash
cd ansible
```

Open `inventory/hosts.ini` and update:

```ini
[webservers]
webserver ansible_host=YOUR_SERVER_IP ansible_user=ubuntu
```

Replace `YOUR_SERVER_IP` with your actual server IP address.

## Step 2: Setup SSH Access

Copy your SSH key to the server:

```bash
ssh-copy-id ubuntu@YOUR_SERVER_IP
```

## Step 3: Test Connection

Test that Ansible can connect to your server:

```bash
ansible webservers -m ping
```

You should see a response like:
```
webserver | SUCCESS => {
    "ping": "pong"
}
```

## Deployment Options

### Option 1: Minimal Deployment (Fastest)

Perfect for development and testing:

```bash
cd ansible
ansible-playbook playbooks/site-minimal.yml
```

**What this includes:**
- Ubuntu server setup
- Docker installation
- Git installation
- Firewall configuration
- Application deployment
- Environment configuration
- Docker Compose startup

**Access after deployment:**
- Frontend: `http://YOUR_SERVER_IP:3000`
- Backend API: `http://YOUR_SERVER_IP:8000`
- API Docs: `http://YOUR_SERVER_IP:8000/docs`

### Option 2: Complete Production Deployment

Full deployment with all security and monitoring features:

```bash
cd ansible
DOMAIN_NAME=yourdomain.com SSL_EMAIL=admin@yourdomain.com ansible-playbook playbooks/site.yml
```

**What this includes:**
- Everything from minimal deployment PLUS:
- SSL/HTTPS with Let's Encrypt
- Automated database backups
- Monitoring with Prometheus and Grafana

**Access after deployment:**
- Frontend: `https://yourdomain.com`
- Backend API: `http://YOUR_SERVER_IP:8000`
- API Docs: `http://YOUR_SERVER_IP:8000/docs`
- Prometheus: `http://YOUR_SERVER_IP:9090`
- Grafana: `http://YOUR_SERVER_IP:3001` (admin/admin123)

### Option 3: Staging Deployment

Add monitoring and backups without SSL:

```bash
cd ansible
ansible-playbook playbooks/site-minimal.yml
ansible-playbook playbooks/09-database-backup.yml
ansible-playbook playbooks/10-monitoring.yml
```

### Option 4: Add Features to Existing Deployment

If you already have a minimal deployment running, you can add features individually:

**Add SSL/HTTPS:**
```bash
cd ansible
DOMAIN_NAME=yourdomain.com SSL_EMAIL=admin@yourdomain.com ansible-playbook playbooks/08-ssl-setup.yml
```

**Add Database Backups:**
```bash
cd ansible
ansible-playbook playbooks/09-database-backup.yml
```

**Add Monitoring:**
```bash
cd ansible
ansible-playbook playbooks/10-monitoring.yml
```

## Individual Playbook Usage

You can also run individual playbooks for specific tasks:

### Update System Packages
```bash
ansible-playbook playbooks/01-ubuntu-setup.yml
```

### Reinstall Docker
```bash
ansible-playbook playbooks/02-docker-install.yml
```

### Update Application from GitHub
```bash
ansible-playbook playbooks/05-app-deployment.yml
ansible-playbook playbooks/07-docker-compose.yml
```

## Post-Deployment Tasks

### Check Application Status

SSH into your server and check the containers:

```bash
ssh ubuntu@YOUR_SERVER_IP
docker ps
```

You should see:
- `photostudio-backend`
- `photostudio-frontend`
- (if monitoring enabled) `prometheus`, `grafana`, `node_exporter`, `cadvisor`

### View Logs

**Backend logs:**
```bash
docker logs -f photostudio-backend
```

**Frontend logs:**
```bash
docker logs -f photostudio-frontend
```

### Database Backup Operations

**Manual backup:**
```bash
ssh ubuntu@YOUR_SERVER_IP
cd /opt/photostudio
./backup_database.sh
```

**List available backups:**
```bash
ls -lh /opt/backups/photostudio/
```

**Restore from backup:**
```bash
cd /opt/photostudio
./restore_database.sh photostudio_backup_20240912_020000.db.gz
```

### Monitoring Access

**Prometheus:**
- URL: `http://YOUR_SERVER_IP:9090`
- Use the web interface to query metrics

**Grafana:**
- URL: `http://YOUR_SERVER_IP:3001`
- Username: `admin`
- Password: `admin123`
- Change the password after first login!

## Troubleshooting

### Connection Issues

If the ping test fails:
```bash
# Check SSH connection
ssh ubuntu@YOUR_SERVER_IP

# Check inventory file
cat inventory/hosts.ini

# Try with verbose output
ansible webservers -m ping -vvv
```

### Docker Issues

If containers won't start:
```bash
ssh ubuntu@YOUR_SERVER_IP
sudo systemctl status docker
docker ps -a
docker logs photostudio-backend
```

### SSL Certificate Issues

If SSL setup fails:
```bash
# Check domain DNS resolution
nslookup yourdomain.com

# Check port 80 is accessible
telnet YOUR_SERVER_IP 80

# Try manual certbot
ssh ubuntu@YOUR_SERVER_IP
sudo certbot --nginx -d yourdomain.com
```

### Firewall Issues

If you can't access the application:
```bash
ssh ubuntu@YOUR_SERVER_IP
sudo ufw status
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
```

## Environment Variables

### Custom Secret Key

Provide a custom JWT secret key:

```bash
SECRET_KEY=your-custom-secret-key ansible-playbook playbooks/site.yml
```

### Custom Domain for SSL

```bash
DOMAIN_NAME=yourdomain.com SSL_EMAIL=admin@yourdomain.com ansible-playbook playbooks/08-ssl-setup.yml
```

## Quick Reference

| Task | Command |
|------|---------|
| Minimal deployment | `ansible-playbook playbooks/site-minimal.yml` |
| Full deployment | `ansible-playbook playbooks/site.yml` |
| Add SSL | `DOMAIN_NAME=domain.com ansible-playbook playbooks/08-ssl-setup.yml` |
| Add backups | `ansible-playbook playbooks/09-database-backup.yml` |
| Add monitoring | `ansible-playbook playbooks/10-monitoring.yml` |
| Update app | `ansible-playbook playbooks/05-app-deployment.yml && ansible-playbook playbooks/07-docker-compose.yml` |
| Check status | `ssh ubuntu@SERVER_IP && docker ps` |
| View logs | `ssh ubuntu@SERVER_IP && docker logs -f photostudio-backend` |

## Default Credentials

- **Application**: admin / admin123
- **Grafana**: admin / admin123

**Important:** Change these passwords after first login!

## Next Steps

1. **Deploy using minimal deployment** for initial testing
2. **Test the application** thoroughly
3. **Add monitoring** to understand system performance
4. **Add backups** for data protection
5. **Add SSL** when ready for production use
6. **Change default passwords** for security
7. **Set up regular updates** using the update commands

## Support

For issues or questions:
- Check the detailed documentation in `ansible/README.md`
- Review individual playbook files for specific configurations
- Check container logs for error messages
