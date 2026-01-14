# 🤖 Telegram Bot Setup Guide

## Step 1: Create Your Telegram Bot

1. **Open Telegram** and search for [@BotFather](https://t.me/botfather)

2. **Start a chat** with BotFather and send: `/newbot`

3. **Choose a name** for your bot (e.g., "Office Awards Bot")

4. **Choose a username** for your bot (must end in 'bot', e.g., "office_awards_2026_bot")

5. **Copy the bot token** - BotFather will give you a token that looks like:
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

## Step 2: Get Your Telegram User ID

1. **Search for [@userinfobot](https://t.me/userinfobot)** on Telegram

2. **Start a chat** and it will send you your user ID (a number like `123456789`)

3. **Copy this number** - you'll need it for admin access

## Step 3: Configure the Bot

1. **Create a `.env` file** in the project directory:
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** and add your bot token and admin ID:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ADMIN_TELEGRAM_IDS=your_telegram_user_id
   PORT=3000
   ```

   Replace:
   - `your_bot_token_here` with the token from BotFather
   - `your_telegram_user_id` with your user ID from userinfobot

3. **Multiple Admins** (optional): Separate multiple admin IDs with commas:
   ```env
   ADMIN_TELEGRAM_IDS=123456789,987654321,555666777
   ```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Start the Bot

### Option A: Run Both Web and Telegram Bot
```bash
npm run start:all
```

This starts:
- ✅ Web server on http://localhost:3000
- ✅ Telegram bot

### Option B: Run Only Telegram Bot
```bash
npm run bot
```

### Option C: Run Only Web Server
```bash
npm start
```

## Step 6: Test the Bot

1. **Find your bot** on Telegram by searching for the username you created

2. **Start a chat** with your bot

3. **Send** `/start` to see the welcome message

4. **Try voting** by sending `/vote`

## Bot Commands

### User Commands
- `/start` - Welcome message and instructions
- `/vote` - Start voting process
- `/mystatus` - Check your voting status
- `/help` - Show available commands

### Admin Commands (Only for configured admin IDs)
- `/admin` - Show admin panel
- `/results` - View current voting results
- `/toggle` - Toggle voting open/closed
- `/stats` - View voting statistics

## How Voting Works

1. User sends `/vote`
2. Bot shows category list with inline buttons
3. User taps a category
4. Bot asks for nominee name
5. User types the nominee's name
6. Vote is recorded
7. User can continue voting or tap "Finish"

## Features

✅ **Inline Keyboards** - Easy category selection  
✅ **Duplicate Prevention** - One vote per category per user  
✅ **Vote Tracking** - See which categories you've voted in  
✅ **Admin Controls** - View results and toggle voting  
✅ **Shared Database** - Votes from web and Telegram combined  
✅ **Real-time** - Instant feedback and notifications

## Troubleshooting

### Bot doesn't respond
- Check that `TELEGRAM_BOT_TOKEN` is correct in `.env`
- Make sure you started the bot with `npm run start:all` or `npm run bot`
- Check the console for error messages

### Admin commands don't work
- Verify your Telegram User ID is in `ADMIN_TELEGRAM_IDS`
- Make sure there are no spaces in the `.env` file
- Restart the bot after changing `.env`

### "Voting is closed" message
- An admin needs to run `/toggle` to open voting
- Or use the web admin panel to open voting

## Security Notes

⚠️ **Never commit your `.env` file to Git!**  
⚠️ **Keep your bot token secret!**  
⚠️ **Only share admin access with trusted users**

## Next Steps

- Customize the bot messages in `bot.js`
- Add more admin features
- Set up a webhook for production deployment
- Add vote editing/deletion features

---

Need help? Check the main [README.md](file:///home/jerusalem/design%20team%20bot/README.md) for more information.
