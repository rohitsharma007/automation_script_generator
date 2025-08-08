# MongoDB Setup Guide

This guide helps you set up MongoDB for the Agentforce Validator to enable database storage and analytics.

## 🚀 Quick Setup Options

### Option 1: Local MongoDB Installation (Recommended for Development)

#### macOS (using Homebrew)
```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Verify installation
mongosh --eval "db.adminCommand('ismaster')"
```

#### Windows
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Start MongoDB as a Windows Service (automatic)
4. Verify installation using MongoDB Compass or command line

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option 2: MongoDB Atlas (Cloud - Free Tier Available)

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Choose free tier (M0)
3. **Setup Database Access**: Create a database user
4. **Setup Network Access**: Add your IP address
5. **Get Connection String**: Copy the connection URI
6. **Update .env file**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   MONGODB_DATABASE=agentforce_validation
   MONGODB_COLLECTION=validation_results
   ENABLE_MONGODB=true
   ```

## 🧪 Testing Your Setup

After installation, test your MongoDB connection:

```bash
# Test MongoDB connection
npm run test-mongodb

# Expected output for successful connection:
# ✅ Connected to MongoDB successfully
# ✅ Sample validation stored with ID: ...
# ✅ Sample chat interaction stored with ID: ...
# 🎉 MongoDB Test Completed Successfully!
```

## 🔧 Configuration

### Environment Variables (.env file)

```env
# Local MongoDB (default)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=agentforce_validation
MONGODB_COLLECTION=validation_results
ENABLE_MONGODB=true
LOG_LEVEL=info

# MongoDB Atlas (cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
# MONGODB_DATABASE=agentforce_validation
# MONGODB_COLLECTION=validation_results
# ENABLE_MONGODB=true
```

### Database Structure

The validator will automatically create:
- **Database**: `agentforce_validation`
- **Collections**: 
  - `validation_results` - Main validation results
  - `chat_interactions` - Individual chat interactions

## 📊 Using MongoDB Data

### MongoDB Compass (GUI)
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017`
3. Browse `agentforce_validation` database
4. View collections and data

### Command Line (mongosh)
```bash
# Connect to MongoDB
mongosh

# Switch to validation database
use agentforce_validation

# View validation results
db.validation_results.find().pretty()

# View chat interactions
db.chat_interactions.find().pretty()

# Get validation statistics
db.validation_results.aggregate([
  {
    $group: {
      _id: null,
      totalValidations: { $sum: 1 },
      passedValidations: { $sum: { $cond: [{ $eq: ["$overallStatus", "PASS"] }, 1, 0] } },
      averageScore: { $avg: "$agentforceValidation.validationScore" }
    }
  }
])
```

## 🚨 Troubleshooting

### Common Issues

**Connection Refused Error**
```
❌ MongoDB connection failed: connect ECONNREFUSED
```
**Solution**: MongoDB service is not running
- macOS: `brew services start mongodb/brew/mongodb-community`
- Linux: `sudo systemctl start mongod`
- Windows: Start MongoDB service from Services panel

**Authentication Failed**
```
❌ MongoDB connection failed: Authentication failed
```
**Solution**: Check username/password in connection string

**Network Timeout**
```
❌ MongoDB connection failed: Server selection timed out
```
**Solution**: 
- Check if MongoDB is running
- Verify connection string
- Check firewall settings

**Atlas Connection Issues**
- Verify IP address is whitelisted
- Check username/password
- Ensure connection string is correct

### Disable MongoDB

If you don't want to use MongoDB, set in `.env`:
```env
ENABLE_MONGODB=false
```

The validator will work normally without database storage.

## 📈 Benefits of MongoDB Integration

✅ **Historical Tracking** - Track validation results over time  
✅ **Team Collaboration** - Shared database for team insights  
✅ **Performance Analytics** - Monitor chat response times  
✅ **Trend Analysis** - Identify patterns in validation scores  
✅ **Automated Reporting** - Generate reports from stored data  
✅ **Data Export** - Export data for external analysis  

## 🔗 Useful Links

- [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
- [MongoDB Atlas Free Tier](https://www.mongodb.com/atlas/database)
- [MongoDB Compass Download](https://www.mongodb.com/products/compass)
- [MongoDB University (Free Courses)](https://university.mongodb.com/)