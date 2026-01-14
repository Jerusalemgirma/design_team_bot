# 🏆 Office Awards Voting Bot

A beautiful, modern voting system for office awards with **both web interface and Telegram bot** support. Employees can vote for colleagues in 11 different categories through their preferred platform.

## Features

✨ **Dual Platform** - Vote via web browser OR Telegram  
✨ **Modern Design** - Stunning dark mode interface with glassmorphism and vibrant gradients  
🗳️ **Easy Voting** - Simple, intuitive voting process on both platforms  
🔒 **Duplicate Prevention** - One vote per category per user (email or Telegram ID)  
📊 **Admin Dashboard** - View real-time results on web or Telegram  
⚡ **Real-time Updates** - Instant vote counting and result display  
📱 **Responsive** - Works perfectly on all devices  
🤖 **Telegram Bot** - Full voting functionality in Telegram with inline keyboards  

## Award Categories

1. Best Dresser Award – for the most stylish colleague
2. Office Comedian Award – funniest person
3. Mr./Ms. Friendly Award – most approachable and kind
4. Team Player Award – best collaborator
5. Positive Energy Award – the most cheerful spirit
6. Tech Guru Award – the go-to person for IT issues
7. Always Hungry Award – snack lover
8. Silent Hero Award
9. Best Smile Award – person who brightens the room
10. Coffee Lover Award
11. Team Spirit Award

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Telegram Bot** (Optional but recommended)
   
   See [TELEGRAM_SETUP.md](file:///home/jerusalem/design%20team%20bot/TELEGRAM_SETUP.md) for detailed instructions.
   
   Quick setup:
   - Create a bot with [@BotFather](https://t.me/botfather)
   - Get your Telegram User ID from [@userinfobot](https://t.me/userinfobot)
   - Copy `.env.example` to `.env` and add your bot token and admin ID

3. **Start the Application**

   **Option A: Web + Telegram (Recommended)**
   ```bash
   npm run start:all
   ```

   **Option B: Web Only**
   ```bash
   npm start
   ```

   **Option C: Telegram Bot Only**
   ```bash
   npm run bot
   ```

4. **Access the Application**
   - Voting Page: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin.html
   - Telegram Bot: Search for your bot on Telegram

## Usage

### For Voters

1. Open http://localhost:3000
2. Enter your name and email
3. Vote for your colleagues in any categories you wish
4. Submit your votes

**Note:** You can only vote once per category. Your email is used to prevent duplicate votes.

### For Admins

1. Open http://localhost:3000/admin.html
2. Enter the admin password (default: `admin123`)
3. View voting results in real-time
4. Toggle voting open/closed as needed

## Admin Access

- **Default Password:** `admin123`
- To change the password, modify it in the database after first run

## Technology Stack

- **Backend:** Node.js with Express
- **Database:** SQLite (file-based, no external database needed)
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Design:** Custom CSS with modern aesthetics

## Project Structure

```
design team bot/
├── public/
│   ├── index.html      # Main voting page
│   ├── admin.html      # Admin dashboard
│   ├── styles.css      # All styles
│   ├── app.js          # Voting page logic
│   └── admin.js        # Admin panel logic
├── server.js           # Express server
├── database.js         # Database operations
├── package.json        # Dependencies
└── voting.db           # SQLite database (created automatically)
```

## API Endpoints

- `GET /api/categories` - Get all award categories
- `GET /api/voting-status` - Check if voting is open
- `POST /api/vote` - Submit votes
- `POST /api/admin/verify` - Verify admin password
- `GET /api/admin/results` - Get voting results
- `POST /api/admin/toggle-voting` - Open/close voting

## Notes

- The database is created automatically on first run
- All votes are stored securely in SQLite
- The system prevents duplicate votes using email addresses
- Admin can close voting at any time to prevent new votes

## Support

For issues or questions, please contact your system administrator.

---

Made with ❤️ for Office Awards 2026
