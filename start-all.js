require('dotenv').config();
const express = require('express');
const bot = require('./bot');
const db = require('./database');

// Initialize database
(async () => {
    await db.initializeDatabase();

    // Start web server
    const server = require('./server');

    // Start Telegram bot
    if (process.env.TELEGRAM_BOT_TOKEN) {
        bot.launch();
        console.log('✅ Telegram bot is running!');

        const adminIds = process.env.ADMIN_TELEGRAM_IDS
            ? process.env.ADMIN_TELEGRAM_IDS.split(',').map(id => id.trim())
            : [];
        console.log(`👥 Admin Telegram IDs: ${adminIds.join(', ') || 'None configured'}`);
    } else {
        console.log('⚠️  TELEGRAM_BOT_TOKEN not found. Telegram bot will not start.');
        console.log('   Add your bot token to .env file to enable Telegram functionality.');
    }

    // Enable graceful stop
    process.once('SIGINT', () => {
        bot.stop('SIGINT');
        process.exit(0);
    });
    process.once('SIGTERM', () => {
        bot.stop('SIGTERM');
        process.exit(0);
    });
})();
