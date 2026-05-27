# MongoDB Atlas Connection Troubleshooting Guide

## ✅ Fixes Applied to Your Code

Your connection code has been updated with:
- **Better timeout settings** (10s server selection, 30s socket timeout)
- **Improved error logging** with specific troubleshooting hints
- **SSL/TLS enforcement** for secure connections
- **Connection pooling** for better performance
- **Heartbeat monitoring** for connection health

## 🔴 Common MongoDB Atlas Connection Issues & Solutions

### 1. **Authentication Failed Error**
**Symptoms:** "authentication failed" error message

**Fixes:**
- Verify username and password in your connection string
- Check if your password contains special characters that need URL encoding
- If your password has special chars like `@`, `!`, `#`, use this format:
  ```
  mongodb+srv://username:encodeURIComponent(password)@cluster...
  ```
- **IMPORTANT**: Your current credentials are exposed in the .env file. 
  1. Go to MongoDB Atlas → Database Access
  2. Change the password for user: `kashyapakshay920_db_user`
  3. Update the MONGODB_URI in .env with the new credentials

### 2. **IP Address Not Whitelisted**
**Symptoms:** Connection times out after 10 seconds

**Fixes:**
- Go to MongoDB Atlas → Network Access
- Add your IP address or use `0.0.0.0/0` to allow all IPs (development only!)
- For production, whitelist only your server's IP

### 3. **Connection String Format Issues**
**Symptoms:** "ENOTFOUND" or DNS errors

**Verify your connection string:**
- ✅ Correct format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?appName=Cluster0`
- ✅ Ensure no spaces in the connection string
- ✅ Verify cluster name matches MongoDB Atlas

### 4. **Special Characters in Password**
**Symptoms:** "authentication failed" despite correct credentials

**Solution:**
- If password contains: `@`, `!`, `#`, `$`, `%`, `^`, `&`, `*`, etc.
- **Manually URL-encode** the password when building the connection string
- Example: password `p@ss!word` becomes `p%40ss%21word`

### 5. **MongoDB Cluster Not Running**
**Symptoms:** "ECONNREFUSED" error

**Fixes:**
- Log into MongoDB Atlas console
- Check if your cluster is paused (green = running, blue = paused)
- If paused, click "Resume" to start the cluster
- Note: Free tier clusters auto-pause after 15 minutes of inactivity

## 🧪 Testing MongoDB Connection Locally

To test if MongoDB connection works before running the full server:

```bash
# 1. Install test dependencies (optional)
npm install --save-dev mongodb

# 2. Create a quick test file
# Save this as test-mongo.ts:
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function testConnection() {
  const mongoUri = process.env.MONGODB_URI;
  console.log('🔍 Testing MongoDB connection...');
  console.log('Connection string:', mongoUri?.substring(0, 50) + '...');
  
  try {
    await mongoose.connect(mongoUri || '', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Connection successful!');
    await mongoose.disconnect();
  } catch (error: any) {
    console.log('❌ MongoDB Connection failed:');
    console.log('Error:', error.message);
  }
}

testConnection();

# 3. Run the test
npx tsx test-mongo.ts
```

## 📋 Pre-flight Checklist

- [ ] MongoDB Atlas account is active
- [ ] Cluster is running (not paused) 
- [ ] Your IP is whitelisted in Network Access
- [ ] Database user has correct credentials in MONGODB_URI
- [ ] Connection string format is correct
- [ ] Special characters in password are URL-encoded
- [ ] No spaces in MONGODB_URI
- [ ] .env file is loaded (check dotenv is imported)

## 🔐 Security Recommendations

**IMPORTANT**: Your credentials are currently exposed in the .env file in this repository!

1. **Immediately rotate credentials:**
   - Go to MongoDB Atlas → Database Access
   - Change password for `kashyapakshay920_db_user`
   - Update .env file with new credentials

2. **Use environment variables properly:**
   - Never commit .env files to Git (add to .gitignore)
   - Use different credentials for dev/staging/production
   - Consider using MongoDB Atlas VPC for production

3. **For production deployment:**
   - Use managed secrets (Vercel Secrets, AWS Secrets Manager, etc.)
   - Enable IP whitelisting for specific server IPs
   - Use strong, unique passwords
   - Enable authentication roles with minimal permissions

## 📞 Still Having Issues?

1. Check the console output - the new error messages will indicate the exact problem
2. Verify each item in the checklist above
3. Check MongoDB Atlas Security settings and logs
4. Consider testing with a local MongoDB instance first:
   ```bash
   # Using Docker (if installed)
   docker run -d -p 27017:27017 mongo:latest
   
   # Update .env with:
   MONGODB_URI="mongodb://localhost:27017/pathfinder"
   ```

## 🔄 After Fixing the Connection

Once connection works:
1. Run `npm run dev` to start the development server
2. Check console for "✅ MongoDB Atlas Connection established successfully!"
3. Try registering a new user or creating a profile to test functionality
