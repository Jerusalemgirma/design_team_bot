# 🚀 Quick Start Guide - Office Awards Voting Bot

## Current Status
✅ **Both platforms are running!**
- 🌐 Web: http://localhost:3000
- 🤖 Telegram: Bot is active and ready

## For Users

### Vote via Web Browser
1. Go to http://localhost:3000
2. Enter your name and email
3. Select categories and enter nominee names
4. Click "Submit All Votes"

### Vote via Telegram
1. Find your bot on Telegram
2. Send `/start` to begin
3. Send `/vote` to start voting
4. Tap category buttons
5. Type nominee names when prompted
6. Tap "Finish" when done

### Check Your Status
- **Web:** Your votes are shown after submission
- **Telegram:** Send `/mystatus` to see your votes

## For Admins

### Web Admin Panel
1. Go to http://localhost:3000/admin.html
2. Password: `admin123`
3. View results and toggle voting

### Telegram Admin Commands
(Only works if your Telegram ID is in `.env`)
- `/admin` - Show admin panel
- `/results` - View all results
- `/toggle` - Open/close voting
- `/stats` - View statistics

## Telegram Bot Commands

### Everyone Can Use:
- `/start` - Welcome message
- `/vote` - Start voting
- `/mystatus` - Check your votes
- `/help` - Show help

### Admins Only:
- `/admin` - Admin panel
- `/results` - View results
- `/toggle` - Toggle voting
- `/stats` - Statistics

## Important Notes

✅ **Votes are combined** - Web and Telegram votes count together  
✅ **One vote per category** - Per email (web) or Telegram ID (bot)  
✅ **Real-time** - Results update instantly on both platforms  
✅ **Admin controls** - Work from either web or Telegram

## Troubleshooting

**Telegram bot not responding?**
- Check that you added `TELEGRAM_BOT_TOKEN` to `.env`
- Make sure you started with `npm run start:all`
- Verify the bot is running in the terminal

**Admin commands not working on Telegram?**
- Add your Telegram User ID to `ADMIN_TELEGRAM_IDS` in `.env`
- Get your ID from @userinfobot on Telegram
- Restart the bot after changing `.env`

**Can't vote again?**
- This is by design! One vote per category per user
- Use a different email (web) or Telegram account to test

## Next Steps

1. **Share the bot** - Give colleagues your bot's username
2. **Customize** - Edit categories in `database.js`
3. **Change admin password** - Update in database or `.env`
4. **Monitor** - Watch results in real-time!

---

Need detailed setup? See [TELEGRAM_SETUP.md](file:///home/jerusalem/design%20team%20bot/TELEGRAM_SETUP.md)  
Full documentation: [README.md](file:///home/jerusalem/design%20team%20bot/README.md)
