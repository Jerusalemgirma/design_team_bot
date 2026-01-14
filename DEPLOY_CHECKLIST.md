# 🚀 Quick Railway Deployment Checklist

## Before You Deploy

- [ ] **Create GitHub repository** (if you haven't already)
- [ ] **Push your code to GitHub**
- [ ] **Have your Telegram Bot Token ready** (from @BotFather)
- [ ] **Know your Telegram User ID** (get from @userinfobot)

## Deployment Steps

### 1. Push to GitHub
```bash
cd "/home/jerusalem/design team bot"
git init
git add .
git commit -m "Ready for Railway deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy on Railway

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your repository
6. Railway will start building automatically

### 3. Set Environment Variables

In Railway dashboard → **Variables** tab, add:

```
TELEGRAM_BOT_TOKEN=paste_your_bot_token_here
ADMIN_TELEGRAM_IDS=paste_your_telegram_id_here
```

**Get your Telegram ID:**
1. Open Telegram
2. Search for @userinfobot
3. Start chat - it will send you your ID
4. Copy the number

### 4. Generate Domain

1. Go to **Settings** tab
2. Under **Domains**, click **"Generate Domain"**
3. Copy your URL (e.g., `your-app.up.railway.app`)

### 5. Test Your Deployment

- [ ] Visit your Railway URL in browser
- [ ] Test voting on web interface
- [ ] Send `/start` to your Telegram bot
- [ ] Try voting via Telegram
- [ ] Test admin panel (web and Telegram)

## Important Notes

⚠️ **Database Persistence**

Railway uses ephemeral storage. Your SQLite database will reset on restart!

**Quick Fix Options:**

**Option A: Add Railway Volume (Recommended)**
1. Railway Dashboard → Settings
2. Click "Add Volume"
3. Mount path: `/app/data`
4. Votes will persist across restarts

**Option B: Accept data loss**
- Good for testing
- Votes reset when app restarts
- Free and simple

**Option C: Use PostgreSQL**
- Best for production
- Railway offers free PostgreSQL
- Requires code changes

## After Deployment

- [ ] Share web URL with your team
- [ ] Share Telegram bot username
- [ ] Test all features
- [ ] Monitor Railway logs for errors
- [ ] Set up database persistence (Volume or PostgreSQL)

## Your URLs

After deployment, you'll have:
- 🌐 **Web App**: `https://your-app.up.railway.app`
- 📊 **Admin Panel**: `https://your-app.up.railway.app/admin.html`
- 🤖 **Telegram Bot**: Search by username on Telegram

## Need Help?

- 📖 Full guide: See [RAILWAY_DEPLOYMENT.md](file:///home/jerusalem/design%20team%20bot/RAILWAY_DEPLOYMENT.md)
- 🆘 Railway Docs: https://docs.railway.app
- 💬 Railway Discord: https://discord.gg/railway

---

**Estimated deployment time:** 5-10 minutes ⚡
