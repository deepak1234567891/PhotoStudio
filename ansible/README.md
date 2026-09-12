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

### Complete Deployment

Run the complete deployment pipeline:

```bash
cd ansible
ansible-playbook playbooks/site.yml
```

### With Custom Secret Key

To provide a custom secret key for JWT authentication:

```bash
cd ansible
SECRET_KEY=your-custom-secret-key ansible-playbook playbooks/site.yml
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

## Post-Deployment

After successful deployment:

1. **Access the Application**
   - Frontend: `http://YOUR_SERVER_IP:3000`
   - Backend API: `http://YOUR_SERVER_IP:8000`
   - API Documentation: `http://YOUR_SERVER_IP:8000/docs`

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
