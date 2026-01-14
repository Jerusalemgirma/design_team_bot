# 🚂 Railway Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Telegram Bot Token**: Already created with @BotFather

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub:

```bash
git init
git add .
git commit -m "Initial commit - Office Awards Voting Bot"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will automatically detect it's a Node.js app

### 3. Configure Environment Variables

In your Railway project dashboard:

1. Go to **"Variables"** tab
2. Add the following environment variables:

```
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
ADMIN_TELEGRAM_IDS=your_telegram_user_id
PORT=3000
NODE_ENV=production
```

**Important:** 
- Get your Telegram User ID from [@userinfobot](https://t.me/userinfobot)
- For multiple admins, separate IDs with commas: `123456,789012,345678`

### 4. Deploy

Railway will automatically deploy your app. You can watch the build logs in real-time.

### 5. Get Your App URL

1. Go to **"Settings"** tab
2. Under **"Domains"**, click **"Generate Domain"**
3. Railway will give you a URL like: `your-app.up.railway.app`

### 6. Update Telegram Bot Webhook (Optional)

For production, you can use webhooks instead of polling:

1. Add this to your `.env` or Railway variables:
   ```
   WEBHOOK_URL=https://your-app.up.railway.app
   ```

2. The bot will automatically use webhooks in production

### 7. Test Your Deployment

1. **Test Web Interface**: Visit `https://your-app.up.railway.app`
2. **Test Telegram Bot**: Send `/start` to your bot
3. **Test Voting**: Try voting via both platforms
4. **Test Admin**: Access admin panel and Telegram admin commands

## Important Notes

### Database Persistence

⚠️ **Railway uses ephemeral storage** - the SQLite database will be reset when the app restarts!

**Solutions:**

**Option 1: Use Railway's Volume (Recommended)**
1. In Railway dashboard, go to **"Settings"**
2. Add a **Volume**
3. Mount path: `/app/data`
4. Update `database.js` to use `/app/data/voting.db`

**Option 2: Use PostgreSQL (Better for production)**
1. Add PostgreSQL service in Railway
2. Update code to use PostgreSQL instead of SQLite
3. Railway provides free PostgreSQL database

**Option 3: Accept data loss (OK for testing)**
- Votes will be lost on restart
- Good for testing/demo purposes

### Environment Variables

Make sure these are set in Railway:
- ✅ `TELEGRAM_BOT_TOKEN` - Your bot token
- ✅ `ADMIN_TELEGRAM_IDS` - Comma-separated admin IDs
- ✅ `PORT` - Set to 3000 (Railway will override if needed)

### Monitoring

- **Logs**: View in Railway dashboard under "Deployments"
- **Metrics**: Check CPU/Memory usage in "Metrics" tab
- **Health**: Railway automatically monitors your app

## Troubleshooting

### Bot not responding
- Check Railway logs for errors
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Make sure the app is running (check deployment status)

### Web interface not loading
- Check if the domain is active
- Verify PORT environment variable
- Check deployment logs for errors

### Votes not saving
- Check if database file exists
- Consider using Railway Volume or PostgreSQL
- Check logs for database errors

### Admin commands not working
- Verify your Telegram ID is in `ADMIN_TELEGRAM_IDS`
- Make sure there are no spaces in the ID list
- Restart the app after changing environment variables

## Updating Your App

1. **Push changes to GitHub:**
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```

2. **Railway auto-deploys** - It will automatically rebuild and redeploy

## Cost

- **Free Tier**: $5 worth of usage per month
- **Hobby Plan**: $5/month for more resources
- Your app should easily fit in the free tier!

## Alternative: Manual Deployment

If you prefer not to use GitHub:

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Initialize project:
   ```bash
   railway init
   ```

4. Deploy:
   ```bash
   railway up
   ```

5. Set environment variables:
   ```bash
   railway variables set TELEGRAM_BOT_TOKEN=your_token
   railway variables set ADMIN_TELEGRAM_IDS=your_id
   ```

## Next Steps After Deployment

1. ✅ Test all features on production
2. ✅ Share the web URL with your team
3. ✅ Share the Telegram bot username
4. ✅ Set up database persistence (Volume or PostgreSQL)
5. ✅ Monitor logs for any issues

---

**Need help?** Check Railway's [documentation](https://docs.railway.app/) or their Discord community.

**Your app URLs:**
- 🌐 Web: `https://your-app.up.railway.app`
- 🤖 Telegram: Search for your bot by username
- 📊 Admin: `https://your-app.up.railway.app/admin.html`
