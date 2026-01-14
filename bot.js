require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const db = require('./database');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Admin user IDs from environment variable
const ADMIN_IDS = process.env.ADMIN_TELEGRAM_IDS
    ? process.env.ADMIN_TELEGRAM_IDS.split(',').map(id => parseInt(id.trim()))
    : [];

// Store user voting sessions
const userSessions = new Map();

// Category icons
const categoryIcons = ['👔', '😂', '😊', '🤝', '✨', '💻', '🍕', '🦸', '😄', '☕', '🎯'];

// Helper function to check if user is admin
function isAdmin(userId) {
    return ADMIN_IDS.includes(userId);
}

// Helper function to format categories for display
async function getCategoriesKeyboard(votedCategories = []) {
    const categories = await db.getCategories();
    const buttons = categories.map((cat, index) => {
        const voted = votedCategories.includes(cat.id) ? '✅ ' : '';
        return [Markup.button.callback(
            `${voted}${categoryIcons[index] || '🏆'} ${cat.name}`,
            `vote_${cat.id}`
        )];
    });

    buttons.push([Markup.button.callback('✓ Finish Voting', 'finish')]);

    return Markup.inlineKeyboard(buttons);
}

// Start command
bot.command('start', async (ctx) => {
    const userName = ctx.from.first_name || 'there';

    await ctx.reply(
        `🎉 *Welcome to Office Awards 2026, ${userName}!*\n\n` +
        `Vote for your amazing colleagues in 11 different award categories.\n\n` +
        `*Available Commands:*\n` +
        `/vote - Start voting\n` +
        `/mystatus - Check your voting status\n` +
        `/help - Show this message\n\n` +
        `${isAdmin(ctx.from.id) ? `*Admin Commands:*\n/admin - Admin panel\n/results - View results\n/toggle - Toggle voting\n\n` : ''}` +
        `Let's celebrate our awesome team! 🌟`,
        { parse_mode: 'Markdown' }
    );
});

// Help command
bot.command('help', async (ctx) => {
    await ctx.reply(
        `*Office Awards 2026 - Help*\n\n` +
        `*User Commands:*\n` +
        `/start - Welcome message\n` +
        `/vote - Start voting for colleagues\n` +
        `/mystatus - Check which categories you've voted in\n` +
        `/help - Show this help message\n\n` +
        `${isAdmin(ctx.from.id) ? `*Admin Commands:*\n/admin - Show admin panel\n/results - View current results\n/toggle - Toggle voting open/closed\n/stats - View voting statistics\n\n` : ''}` +
        `*How to Vote:*\n` +
        `1. Send /vote command\n` +
        `2. Select a category from the list\n` +
        `3. Enter the nominee's name\n` +
        `4. Continue voting or finish\n\n` +
        `You can vote once per category. Choose wisely! 🎯`,
        { parse_mode: 'Markdown' }
    );
});

// Vote command
bot.command('vote', async (ctx) => {
    try {
        // Check if voting is open
        const votingOpen = await db.isVotingOpen();
        if (!votingOpen) {
            return ctx.reply('❌ Voting is currently closed. Please check back later.');
        }

        const telegramId = ctx.from.id;

        // Get user's voted categories
        const userVotes = await db.getVoterVotesByTelegram(telegramId);
        const votedCategoryIds = userVotes.map(v => v.category_id);

        // Initialize session
        userSessions.set(telegramId, {
            votedCategories: votedCategoryIds,
            currentCategory: null
        });

        const keyboard = await getCategoriesKeyboard(votedCategoryIds);

        await ctx.reply(
            `🗳️ *Select a category to vote:*\n\n` +
            `✅ = Already voted\n` +
            `Tap a category to cast your vote!`,
            {
                parse_mode: 'Markdown',
                ...keyboard
            }
        );
    } catch (error) {
        console.error('Error in vote command:', error);
        ctx.reply('❌ An error occurred. Please try again.');
    }
});

// My status command
bot.command('mystatus', async (ctx) => {
    try {
        const telegramId = ctx.from.id;
        const userVotes = await db.getVoterVotesByTelegram(telegramId);
        const categories = await db.getCategories();

        if (userVotes.length === 0) {
            return ctx.reply(
                `📊 *Your Voting Status*\n\n` +
                `You haven't voted in any categories yet.\n\n` +
                `Use /vote to start voting! 🗳️`,
                { parse_mode: 'Markdown' }
            );
        }

        const votedCategories = userVotes.map(v => {
            const category = categories.find(c => c.id === v.category_id);
            const icon = categoryIcons[category.display_order - 1] || '🏆';
            return `✅ ${icon} ${category.name}: *${v.nominee_name}*`;
        }).join('\n');

        const totalCategories = categories.length;
        const votedCount = userVotes.length;
        const progress = Math.round((votedCount / totalCategories) * 100);

        await ctx.reply(
            `📊 *Your Voting Status*\n\n` +
            `${votedCategories}\n\n` +
            `Progress: ${votedCount}/${totalCategories} categories (${progress}%)\n\n` +
            `${votedCount < totalCategories ? 'Use /vote to continue voting! 🗳️' : 'You\'ve voted in all categories! 🎉'}`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Error in mystatus command:', error);
        ctx.reply('❌ An error occurred. Please try again.');
    }
});

// Admin command
bot.command('admin', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
        return ctx.reply('❌ You do not have admin access.');
    }

    const votingOpen = await db.isVotingOpen();
    const statusEmoji = votingOpen ? '🟢' : '🔴';
    const statusText = votingOpen ? 'Open' : 'Closed';

    await ctx.reply(
        `🔐 *Admin Panel*\n\n` +
        `${statusEmoji} Voting Status: *${statusText}*\n\n` +
        `*Available Commands:*\n` +
        `/results - View current results\n` +
        `/toggle - Toggle voting open/closed\n` +
        `/stats - View voting statistics`,
        { parse_mode: 'Markdown' }
    );
});

// Results command (admin only)
bot.command('results', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
        return ctx.reply('❌ You do not have admin access.');
    }

    try {
        const results = await db.getResults();
        const categories = await db.getCategories();

        if (Object.keys(results).length === 0) {
            return ctx.reply('📊 No votes have been cast yet.');
        }

        let message = '📊 *Current Results*\n\n';

        categories.forEach((category, index) => {
            const icon = categoryIcons[index] || '🏆';
            const categoryResults = results[category.name] || [];

            message += `${icon} *${category.name}*\n`;

            if (categoryResults.length > 0) {
                categoryResults.slice(0, 5).forEach((result, idx) => {
                    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
                    message += `${medal} ${result.nominee}: ${result.votes} vote${result.votes > 1 ? 's' : ''}\n`;
                });
            } else {
                message += `  No votes yet\n`;
            }

            message += '\n';
        });

        // Split message if too long
        if (message.length > 4000) {
            const chunks = message.match(/[\s\S]{1,4000}/g) || [];
            for (const chunk of chunks) {
                await ctx.reply(chunk, { parse_mode: 'Markdown' });
            }
        } else {
            await ctx.reply(message, { parse_mode: 'Markdown' });
        }
    } catch (error) {
        console.error('Error in results command:', error);
        ctx.reply('❌ An error occurred. Please try again.');
    }
});

// Toggle voting command (admin only)
bot.command('toggle', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
        return ctx.reply('❌ You do not have admin access.');
    }

    try {
        const isOpen = await db.toggleVoting();
        const statusEmoji = isOpen ? '🟢' : '🔴';
        const statusText = isOpen ? 'OPEN' : 'CLOSED';

        await ctx.reply(
            `${statusEmoji} Voting is now *${statusText}*`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Error in toggle command:', error);
        ctx.reply('❌ An error occurred. Please try again.');
    }
});

// Stats command (admin only)
bot.command('stats', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
        return ctx.reply('❌ You do not have admin access.');
    }

    try {
        const stats = await db.getVotingStats();
        const votingOpen = await db.isVotingOpen();
        const statusEmoji = votingOpen ? '🟢' : '🔴';

        await ctx.reply(
            `📈 *Voting Statistics*\n\n` +
            `${statusEmoji} Status: ${votingOpen ? 'Open' : 'Closed'}\n` +
            `👥 Total Voters: ${stats.totalVoters}\n` +
            `🗳️ Total Votes: ${stats.totalVotes}\n` +
            `📊 Average Votes per Person: ${stats.avgVotesPerPerson}\n\n` +
            `*Votes by Category:*\n${stats.votesByCategory}`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Error in stats command:', error);
        ctx.reply('❌ An error occurred. Please try again.');
    }
});

// Handle category selection
bot.action(/^vote_(\d+)$/, async (ctx) => {
    try {
        const categoryId = parseInt(ctx.match[1]);
        const telegramId = ctx.from.id;

        // Check if already voted in this category (check database directly)
        const userVotes = await db.getVoterVotesByTelegram(telegramId);
        const hasVotedInCategory = userVotes.some(v => v.category_id === categoryId);

        if (hasVotedInCategory) {
            return ctx.answerCbQuery('You have already voted in this category!');
        }

        // Get or create session
        let session = userSessions.get(telegramId);
        if (!session) {
            const votedCategoryIds = userVotes.map(v => v.category_id);
            session = {
                votedCategories: votedCategoryIds,
                currentCategory: null
            };
            userSessions.set(telegramId, session);
        }

        // Store current category in session
        session.currentCategory = categoryId;

        const categories = await db.getCategories();
        const category = categories.find(c => c.id === categoryId);
        const icon = categoryIcons[category.display_order - 1] || '🏆';

        await ctx.answerCbQuery();
        await ctx.reply(
            `${icon} *${category.name}*\n\n` +
            `Please enter the name of the person you want to nominate:`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Error in category selection:', error);
        ctx.answerCbQuery('An error occurred. Please try again.');
    }
});

// Handle finish voting
bot.action('finish', async (ctx) => {
    const telegramId = ctx.from.id;
    userSessions.delete(telegramId);

    await ctx.answerCbQuery();
    await ctx.editMessageText(
        `✅ *Voting Complete!*\n\n` +
        `Thank you for participating in the Office Awards 2026!\n\n` +
        `Use /mystatus to see your votes.`,
        { parse_mode: 'Markdown' }
    );
});

// Handle text messages (nominee names)
bot.on('text', async (ctx) => {
    const telegramId = ctx.from.id;
    const session = userSessions.get(telegramId);

    // Ignore if no active voting session
    if (!session || !session.currentCategory) {
        return;
    }

    try {
        const nomineeName = ctx.message.text.trim();

        if (!nomineeName) {
            return ctx.reply('❌ Please enter a valid name.');
        }

        // Submit vote
        const voterName = `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim() || 'Anonymous';
        const result = await db.submitVoteFromTelegram(
            session.currentCategory,
            telegramId,
            voterName,
            nomineeName
        );

        if (result.success) {
            // Store the category ID before clearing it
            const votedCategoryId = session.currentCategory;

            // Update session
            session.votedCategories.push(votedCategoryId);
            session.currentCategory = null;

            await ctx.reply(
                `✅ Vote recorded for *${nomineeName}*!\\n\\n` +
                `Continue voting or tap Finish when done.`,
                { parse_mode: 'Markdown' }
            );

            // Show categories again
            const keyboard = await getCategoriesKeyboard(session.votedCategories);
            await ctx.reply(
                `🗳️ *Select another category:*\\n\\n✅ = Already voted`,
                {
                    parse_mode: 'Markdown',
                    ...keyboard
                }
            );
        } else {
            session.currentCategory = null;
            await ctx.reply(`❌ ${result.error}`);
        }
    } catch (error) {
        console.error('Error submitting vote:', error);
        ctx.reply('❌ An error occurred. Please try /vote to start again.');
    }
});

// Error handling
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('❌ An unexpected error occurred. Please try again later.');
});

// Export bot instance
module.exports = bot;

// Start bot if run directly
if (require.main === module) {
    (async () => {
        await db.initializeDatabase();
        console.log('🤖 Telegram bot starting...');

        if (!process.env.TELEGRAM_BOT_TOKEN) {
            console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables!');
            console.log('Please create a .env file with your bot token.');
            process.exit(1);
        }

        bot.launch();
        console.log('✅ Telegram bot is running!');
        console.log(`👥 Admin IDs: ${ADMIN_IDS.join(', ') || 'None configured'}`);

        // Enable graceful stop
        process.once('SIGINT', () => bot.stop('SIGINT'));
        process.once('SIGTERM', () => bot.stop('SIGTERM'));
    })();
}
