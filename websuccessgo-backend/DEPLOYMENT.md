# Deployment Guide - WebSuccessGo Backend

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong JWT_SECRET (min 32 characters)
- [ ] Configure production MongoDB URL (MongoDB Atlas recommended)
- [ ] Set production Razorpay keys
- [ ] Configure Cloudinary credentials
- [ ] Set correct FRONTEND_URL with production domain

### 2. Security
- [ ] Review CORS origins - should be restricted to your frontend domain
- [ ] Enable HTTPS/SSL certificate
- [ ] Set up firewall rules
- [ ] Change default rate limits if needed
- [ ] Review all environment variables

### 3. Database
- [ ] Create production MongoDB database
- [ ] Set up database backup strategy
- [ ] Configure database indexes
- [ ] Test database connection

### 4. File Storage
- [ ] Create Cloudinary account and get credentials
- [ ] Configure folder structure in Cloudinary
- [ ] Test file uploads

### 5. Payment Gateway
- [ ] Get Razorpay production keys
- [ ] Set up webhook URL in Razorpay dashboard
- [ ] Test payment flow in test mode first
- [ ] Configure webhook secret

## Deployment Options

### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 or higher)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB (if running locally)
# Or use MongoDB Atlas (recommended)

# Install PM2 process manager
sudo npm install -g pm2

# Install Nginx (for reverse proxy)
sudo apt install -y nginx
```

#### Step 2: Deploy Application
```bash
# Clone repository
git clone <your-repo-url>
cd websuccessgo-backend

# Install dependencies
npm install --production

# Create required directories
mkdir -p uploads invoices

# Copy and configure .env
cp .env.example .env
nano .env  # Edit with production values
```

#### Step 3: Configure PM2
```bash
# Start application with PM2
pm2 start server.js --name websuccessgo-api

# Set up PM2 to start on boot
pm2 startup
pm2 save

# Monitor application
pm2 monit
```

#### Step 4: Configure Nginx
Create `/etc/nginx/sites-available/websuccessgo-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    location / {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for file uploads
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/websuccessgo-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Set Up SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Option 2: Heroku Deployment

#### Step 1: Prepare Application
Create `Procfile` in root:
```
web: node server.js
```

#### Step 2: Deploy
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create websuccessgo-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGO_URL=your_mongodb_url
heroku config:set FRONTEND_URL=https://yourdomain.com
# ... set all other environment variables

# Deploy
git push heroku main

# Scale dynos
heroku ps:scale web=1

# View logs
heroku logs --tail
```

### Option 3: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Create required directories
RUN mkdir -p uploads invoices

EXPOSE 5000

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./uploads:/app/uploads
      - ./invoices:/app/invoices
    restart: unless-stopped
    depends_on:
      - mongodb

  mongodb:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

Deploy:
```bash
docker-compose up -d
```

## Post-Deployment

### 1. Verify Deployment
```bash
# Test health endpoint
curl https://api.yourdomain.com/

# Test authentication
curl -X POST https://api.yourdomain.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@123"}'
```

### 2. Set Up Monitoring
```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View logs
pm2 logs websuccessgo-api
```

### 3. Configure Razorpay Webhook
1. Go to Razorpay Dashboard
2. Settings → Webhooks
3. Add webhook URL: `https://api.yourdomain.com/api/payments/webhook`
4. Select events: `payment.captured`, `payment.failed`
5. Save webhook secret to environment variables

### 4. Set Up Backups
```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="your_mongodb_url" --out=/backups/backup_$DATE
find /backups -type d -mtime +7 -exec rm -rf {} +
```

Add to crontab for daily backups:
```bash
0 2 * * * /path/to/backup-script.sh
```

### 5. Configure Log Rotation
Create `/etc/logrotate.d/websuccessgo`:
```
/home/your-user/websuccessgo-backend/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 your-user your-user
    sharedscripts
}
```

## Monitoring & Maintenance

### Health Checks
- Monitor server uptime
- Check API response times
- Monitor database connections
- Check disk space for uploads/invoices
- Monitor error logs

### Regular Maintenance
- Update dependencies monthly
- Review and rotate logs
- Check SSL certificate expiry
- Backup database regularly
- Monitor payment gateway status

### Troubleshooting Commands
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs websuccessgo-api --lines 100

# Restart application
pm2 restart websuccessgo-api

# Check Nginx status
sudo systemctl status nginx

# Test Nginx config
sudo nginx -t

# View system resources
htop
df -h
```

## Rollback Strategy

### Quick Rollback with PM2
```bash
# If using PM2 with Git
pm2 deploy production revert 1

# Manual rollback
cd websuccessgo-backend
git checkout <previous-commit>
npm install
pm2 restart websuccessgo-api
```

### Database Rollback
```bash
# Restore from backup
mongorestore --uri="your_mongodb_url" /backups/backup_YYYYMMDD_HHMMSS
```

## Performance Optimization

### 1. Enable Gzip in Nginx
```nginx
gzip on;
gzip_vary on;
gzip_types text/plain application/json application/javascript text/css;
```

### 2. Set Up Caching
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Database Optimization
- Create indexes on frequently queried fields
- Use MongoDB connection pooling
- Monitor slow queries

### 4. PM2 Cluster Mode
```bash
pm2 start server.js -i max --name websuccessgo-api
```

## Support & Updates

### Updating Production
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install --production

# Run migrations if needed
# npm run migrate

# Restart application
pm2 restart websuccessgo-api
```

## Security Best Practices
1. Never commit .env file
2. Use strong passwords for MongoDB
3. Regularly update dependencies
4. Monitor security advisories
5. Keep server OS updated
6. Use fail2ban for SSH protection
7. Regular security audits
8. Implement rate limiting
9. Monitor unusual activity
10. Keep backups encrypted
