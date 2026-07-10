# 🍃 MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - FREE) ☁️ [RECOMMENDED]

### Why MongoDB Atlas?
- ✅ **Completely FREE** (512MB storage)
- ✅ No installation required
- ✅ Works from anywhere
- ✅ Automatic backups
- ✅ Secure and reliable
- ✅ Easy to use

### Step-by-Step Setup:

#### 1. Create Account
1. Visit: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with email or Google
3. Confirm your email

#### 2. Create Free Cluster
1. Click **Build a Database**
2. Choose **M0 FREE** tier (512MB - Forever Free)
3. Select **Cloud Provider**: AWS
4. Select **Region**: 
   - For India: Mumbai (ap-south-1)
   - For USA: N. Virginia (us-east-1)
   - For Europe: Frankfurt (eu-central-1)
5. Cluster Name: `websuccessgo`
6. Click **Create Cluster** (takes 3-5 minutes)

#### 3. Create Database User
1. **Security Quickstart** screen will appear
2. **Authentication Method**: Username and Password
3. **Username**: `websuccessgo_user`
4. **Password**: Click "Autogenerate Secure Password" 
   - **IMPORTANT: Copy and save this password!**
5. Click **Create User**

#### 4. Network Access (IP Whitelist)
1. **Where would you like to connect from?**: My Local Environment
2. Click **Add My Current IP Address**
3. **OR for easier development**: Add IP `0.0.0.0/0` (Allow from anywhere)
4. Click **Add Entry**
5. Click **Finish and Close**

#### 5. Get Connection String
1. Go to **Database** → **Clusters**
2. Click **Connect** on your cluster
3. Choose **Drivers**
4. Select: **Node.js** and latest version
5. Copy the connection string:

```
mongodb+srv://websuccessgo_user:<password>@cluster0.xxxxx.mongodb.net/websuccessgo?retryWrites=true&w=majority
```

#### 6. Update .env File
Replace `<password>` with your actual password:

```env
MONGO_URL=mongodb+srv://websuccessgo_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/websuccessgo?retryWrites=true&w=majority
```

**Example:**
```env
MONGO_URL=mongodb+srv://websuccessgo_user:MySecurePass123@cluster0.ab1cd.mongodb.net/websuccessgo?retryWrites=true&w=majority
```

#### 7. Restart Server
Server will automatically reconnect to MongoDB Atlas!

---

## Option 2: Local MongoDB (Windows) 💻

### Installation Steps:

#### 1. Download MongoDB
1. Visit: **https://www.mongodb.com/try/download/community**
2. Select:
   - Version: Latest (7.0+)
   - Platform: Windows
   - Package: MSI
3. Click **Download**

#### 2. Install MongoDB
1. Run the downloaded `.msi` file
2. Choose **Complete** installation
3. **Install MongoDB as a Service**: ✅ Check this
4. **Run service as Network Service user**: Keep default
5. **Install MongoDB Compass**: ✅ Check this (GUI tool)
6. Complete installation

#### 3. Verify Installation
Open Command Prompt and run:
```cmd
mongod --version
```

You should see MongoDB version info.

#### 4. Start MongoDB Service
```cmd
net start MongoDB
```

Or through Services:
1. Press `Win + R`
2. Type `services.msc`
3. Find "MongoDB Server"
4. Right-click → Start

#### 5. Keep Current .env
No changes needed! Your .env already has:
```env
MONGO_URL=mongodb://127.0.0.1:27017/websuccessgo
```

#### 6. Restart Backend Server
MongoDB will connect automatically!

---

## Option 3: Local MongoDB (Linux/Mac) 🐧🍎

### Ubuntu/Debian:
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update packages
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable on boot
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

### macOS (with Homebrew):
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0

# Check status
brew services list
```

---

## Verification & Testing

### Test Connection with Compass (GUI)

#### If Using MongoDB Atlas:
1. Open MongoDB Compass
2. Click **New Connection**
3. Paste your connection string
4. Click **Connect**
5. You should see `websuccessgo` database

#### If Using Local MongoDB:
1. Open MongoDB Compass
2. Connection string: `mongodb://localhost:27017`
3. Click **Connect**

### Test from Backend

#### 1. Check Server Logs
After restart, you should see:
```
info: Database connected successfully
```

Instead of:
```
error: Database connection failed
```

#### 2. Test with API
```bash
# Register a user (this will create database entry)
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

If successful, user is saved in MongoDB!

#### 3. Verify in Compass
1. Refresh MongoDB Compass
2. Open `websuccessgo` database
3. Check `users` collection
4. You should see your test user

---

## Troubleshooting

### MongoDB Atlas Issues

**Problem: Can't connect**
- Check if IP is whitelisted (use 0.0.0.0/0 for development)
- Verify password in connection string (no < > brackets)
- Check internet connection

**Problem: Authentication failed**
- Verify username and password
- Recreate database user if needed

**Problem: Timeout**
- Check firewall settings
- Try different network (mobile hotspot)

### Local MongoDB Issues

**Problem: Service won't start**
```cmd
# Windows - Check if port 27017 is in use
netstat -ano | findstr :27017

# If in use, kill the process
taskkill /PID <process_id> /F

# Start again
net start MongoDB
```

**Problem: mongod command not found**
- Add MongoDB to PATH:
  - Default location: `C:\Program Files\MongoDB\Server\7.0\bin`
  - Add to System Environment Variables

**Problem: Permission denied (Linux)**
```bash
# Fix data directory permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo systemctl restart mongod
```

---

## Recommended: MongoDB Atlas (FREE)

**Why I recommend Atlas for this project:**

✅ **No Installation** - Works immediately
✅ **FREE Forever** - 512MB is enough for development
✅ **Reliable** - 99.95% uptime
✅ **Accessible** - From any computer
✅ **Backups** - Automatic daily backups
✅ **Secure** - Built-in security
✅ **Scalable** - Upgrade when needed

**Perfect for:**
- Development
- Testing
- Small production apps
- Learning
- Portfolio projects

---

## Connection String Examples

### MongoDB Atlas:
```env
MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/websuccessgo?retryWrites=true&w=majority
```

### Local MongoDB:
```env
MONGO_URL=mongodb://localhost:27017/websuccessgo
```

### Local with Authentication:
```env
MONGO_URL=mongodb://username:password@localhost:27017/websuccessgo
```

---

## Quick Setup Comparison

| Feature | Atlas (Cloud) | Local Install |
|---------|--------------|---------------|
| Setup Time | 5 minutes | 15-30 minutes |
| Installation | None | Required |
| Internet | Required | Not required |
| Storage | 512MB free | Unlimited |
| Maintenance | Automatic | Manual |
| Backups | Automatic | Manual |
| Access | Anywhere | Local only |
| Cost | FREE | FREE |

---

## Next Steps After Setup

1. ✅ MongoDB connected
2. Start server: `npm run dev`
3. Test registration: See TESTING.md
4. Create templates
5. Test complete flow

---

## MongoDB Compass (GUI Tool)

### Download:
https://www.mongodb.com/try/download/compass

### Features:
- Visual database browser
- Query builder
- Index management
- Performance monitoring
- Data import/export

### Quick Tips:
```bash
# View all databases
# View collections
# Run queries visually
# Export data to JSON/CSV
```

---

**Need help? Check server logs for connection status!**

```bash
tail -f server.log
```

Look for:
```
info: Database connected successfully
```

**Happy coding! 🚀**
