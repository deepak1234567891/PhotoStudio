# PhotoStudio Deployment Architecture

## Architecture Overview

```
Developer
   │
   │ git push
   ▼
 GitHub (CI/CD Pipeline)
   │
   │ GitHub Actions Workflow
   ▼
Ansible (Infrastructure as Code)
   │
   │ Automated Configuration
   ▼
Ubuntu Server
   │
   │ Docker Compose Orchestration
   ▼
Docker Containers
   │
   ├── React Frontend (Port 3000)
   ├── FastAPI Backend (Port 8000)
   ├── SQLite Database (File-based)
   └── Nginx (SSL/HTTPS Proxy)
   │
   ▼
https://PhotoStudio.com
```

## Detailed Architecture Flow

### 1. Developer Workflow
```
Developer (Local Machine)
├── Code Changes
├── Testing (pytest, Jest)
├── Git Commit
└── git push origin main
```

### 2. GitHub CI/CD Pipeline
```
GitHub Repository
├── CI Pipeline (Automated Testing)
│   ├── Backend Tests (pytest)
│   ├── Frontend Tests (Jest)
│   ├── Security Scanning (Trivy)
│   ├── Code Quality Checks
│   └── Docker Build Validation
│
└── CD Pipeline (Automated Deployment)
    ├── Staging (Automatic on main branch)
    │   ├── Ansible Playbooks Execution
    │   ├── Server Configuration
    │   ├── Docker Deployment
    │   └── Health Checks
    │
    └── Production (Manual Trigger)
        ├── Complete Deployment
        ├── SSL Certificate Setup
        ├── Database Backup Configuration
        ├── Monitoring Setup
        └── Rollback Capability
```

### 3. Ansible Infrastructure Automation
```
Ansible Playbooks
├── 01-ubuntu-setup.yml
│   ├── System Updates
│   ├── Package Installation
│   ├── Directory Creation
│   └── Docker SDK Setup
│
├── 02-docker-install.yml
│   ├── Docker CE Installation
│   ├── Docker Compose Setup
│   ├── User Configuration
│   └── Service Configuration
│
├── 03-git-install.yml
│   ├── Git Installation
│   ├── GitHub Configuration
│   └── SSH Key Setup
│
├── 04-firewall-config.yml
│   ├── UFW Installation
│   ├── Port Configuration
│   └── Security Rules
│
├── 05-app-deployment.yml
│   ├── Repository Cloning
│   ├── Directory Setup
│   └── Permission Configuration
│
├── 06-environment-config.yml
│   ├── Environment Variables
│   ├── Secret Key Generation
│   └── Database Configuration
│
├── 07-docker-compose.yml
│   ├── Docker Image Building
│   ├── Container Startup
│   └── Health Checks
│
├── 08-ssl-setup.yml (Optional)
│   ├── Let's Encrypt Setup
│   ├── Nginx Configuration
│   └── SSL Certificate Management
│
├── 09-database-backup.yml (Optional)
│   ├── Backup Script Creation
│   ├── Automated Scheduling
│   └── Backup Monitoring
│
└── 10-monitoring.yml (Optional)
    ├── Prometheus Setup
    ├── Grafana Configuration
    ├── Node Exporter
    └── cAdvisor Setup
```

### 4. Docker Compose Architecture
```
Docker Compose Stack
├── photostudio-backend
│   ├── Base: python:3.11-slim
│   ├── Port: 8000
│   ├── Framework: FastAPI
│   ├── Database: SQLite
│   └── Health Check: / endpoint
│
├── photostudio-frontend
│   ├── Base: nginx:alpine
│   ├── Port: 3000 (80 in container)
│   ├── Framework: React + Vite
│   ├── Reverse Proxy: nginx
│   └── Health Check: / endpoint
│
└── Volumes
    └── backend_data
        └── SQLite Database File
```

### 5. Network Flow
```
User Request
    │
    ▼
Nginx (SSL Termination)
    │
    ├── https://PhotoStudio.com → React Frontend
    └── https://PhotoStudio.com/api/* → FastAPI Backend
        │
        ▼
    SQLite Database
```

## Technology Stack Details

### Frontend (React)
- **Framework**: React 19.2.8
- **Build Tool**: Vite 8.2.0
- **Styling**: Tailwind CSS 4.3.3
- **State Management**: React hooks
- **Routing**: React Router 7.18.2
- **Charts**: Recharts 3.10.1
- **API Client**: Axios 1.19.0

### Backend (FastAPI)
- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn 0.24.0
- **Database**: SQLite (via SQLAlchemy 2.0.23)
- **Authentication**: JWT (python-jose 3.3.0)
- **Validation**: Pydantic 2.5.0
- **Password Hashing**: Passlib 1.7.4

### Infrastructure
- **OS**: Ubuntu 20.04+
- **Containerization**: Docker & Docker Compose
- **Automation**: Ansible
- **CI/CD**: GitHub Actions
- **SSL**: Let's Encrypt (Certbot)
- **Monitoring**: Prometheus + Grafana
- **Reverse Proxy**: Nginx

## Deployment Environments

### Staging Environment
```
Developer → GitHub → Staging Server
    │          │            │
    │          │            ├── Minimal Deployment
    │          │            ├── HTTP Only
    │          │            ├── Basic Monitoring
    │          │            └── Automated Testing
    │          │
    │          └── Automatic on push to main
    │
    └── Manual trigger
```

### Production Environment
```
Developer → GitHub → Production Server
    │          │            │
    │          │            ├── Complete Deployment
    │          │            ├── HTTPS with SSL
    │          │            ├── Full Monitoring
    │          │            ├── Database Backups
    │          │            └── Security Hardening
    │          │
    │          └── Manual trigger only
    │
    └── Manual trigger
```

## Key Differences from Original Diagram

### Database
- **Original**: MySQL
- **Implementation**: SQLite
- **Reason**: Simpler setup, no separate database server needed
- **Migration**: Can be upgraded to MySQL if needed

### SSL/HTTPS
- **Original**: Always enabled
- **Implementation**: Optional (via Ansible playbook)
- **Reason**: Flexibility for staging/production environments

### Monitoring
- **Original**: Not specified
- **Implementation**: Optional (Prometheus + Grafana)
- **Reason**: Production-grade monitoring when needed

## Security Layers

```
User Request
    │
    ▼
1. SSL/TLS Encryption (Let's Encrypt)
    │
    ▼
2. Nginx Security Headers
    │
    ▼
3. UFW Firewall (Ubuntu)
    │
    ▼
4. Docker Container Isolation
    │
    ▼
5. FastAPI JWT Authentication
    │
    ▼
6. Application-Level Validation
```

## Scalability Considerations

### Current Architecture
- Single server deployment
- SQLite database (file-based)
- Suitable for small to medium applications

### Future Scaling Options
1. **Database**: Migrate to PostgreSQL/MySQL
2. **Load Balancing**: Add Nginx load balancer
3. **Container Orchestration**: Move to Kubernetes
4. **Horizontal Scaling**: Multiple application servers
5. **CDN**: Add Content Delivery Network
6. **Caching**: Implement Redis caching

## Monitoring & Observability

### Current Monitoring
- Container health checks
- Application logs
- Basic server metrics (optional)

### Enhanced Monitoring (Optional)
- Prometheus metrics collection
- Grafana dashboards
- Node Exporter (system metrics)
- cAdvisor (container metrics)
- Log aggregation (ELK stack)
- Error tracking (Sentry)

## Backup & Disaster Recovery

### Current Backup Strategy
- Automated daily database backups
- 7-day retention policy
- Manual backup/restore scripts

### Enhanced Backup Strategy
- Database snapshots
- Container image backups
- Configuration backups
- Off-site backup storage
- Disaster recovery procedures

## Deployment Timeline

### Initial Setup (One-time)
1. Server provisioning: 15-30 minutes
2. GitHub secrets configuration: 10 minutes
3. Initial deployment: 20-30 minutes
4. SSL configuration: 10-15 minutes
5. **Total**: ~1-2 hours

### Ongoing Deployments
- CI pipeline: 5-10 minutes
- CD deployment: 10-15 minutes
- Health checks: 2-5 minutes
- **Total**: ~15-30 minutes

## Cost Considerations

### Infrastructure Costs
- Server: $5-50/month (depending on size)
- Domain: $10-15/year
- SSL: Free (Let's Encrypt)
- Monitoring: Free (self-hosted)

### Development Costs
- Time savings from automation
- Reduced deployment errors
- Faster development cycles
- Better code quality

## Maintenance Requirements

### Regular Tasks
- Monitor server health
- Review logs for errors
- Update dependencies
- Security patches
- Backup verification

### Occasional Tasks
- Server upgrades
- Scaling adjustments
- Performance optimization
- Security audits

## Architecture Benefits

✅ **Automation**: Reduced manual intervention
✅ **Consistency**: Same deployment every time
✅ **Scalability**: Easy to add features/environments
✅ **Security**: Multiple security layers
✅ **Monitoring**: Built-in observability
✅ **Recovery**: Backup and rollback capabilities
✅ **Documentation**: Comprehensive guides
✅ **Testing**: Automated quality checks

## Next Steps for Enhancement

1. **Database Migration**: SQLite → PostgreSQL
2. **Load Balancing**: Add Nginx load balancer
3. **CDN Integration**: Add Cloudflare/CloudFront
4. **Enhanced Monitoring**: APM integration
5. **Advanced Security**: WAF, rate limiting
6. **Performance Optimization**: Caching strategies
7. **High Availability**: Multi-region deployment

This architecture provides a solid foundation for your PhotoStudio application with room for growth and enhancement as needed.
