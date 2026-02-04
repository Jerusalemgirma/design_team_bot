const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'voting.db'));

// Promisify database operations
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Initialize database schema
async function initializeDatabase() {
  try {
    // Create categories table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        display_order INTEGER NOT NULL
      )
    `);

    // Check if votes table exists and needs migration
    const tableInfo = await allQuery(`PRAGMA table_info(votes)`);
    const hasTelegramId = tableInfo.some(col => col.name === 'telegram_id');

    if (tableInfo.length > 0 && !hasTelegramId) {
      // Migration: Recreate votes table with new schema
      console.log('🔄 Migrating database to support Telegram...');

      // Rename old table
      await runQuery(`ALTER TABLE votes RENAME TO votes_old`);

      // Create new table with updated schema
      await runQuery(`
        CREATE TABLE votes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER NOT NULL,
          voter_name TEXT NOT NULL,
          voter_email TEXT,
          telegram_id INTEGER,
          nominee_name TEXT NOT NULL,
          voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        )
      `);

      // Copy data from old table
      await runQuery(`
        INSERT INTO votes (id, category_id, voter_name, voter_email, nominee_name, voted_at)
        SELECT id, category_id, voter_name, voter_email, nominee_name, voted_at
        FROM votes_old
      `);

      // Drop old table
      await runQuery(`DROP TABLE votes_old`);

      console.log('✅ Database migration completed - existing votes preserved');
    }

    // Create votes table (updated to support both web and Telegram)
    await runQuery(`
      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        voter_name TEXT NOT NULL,
        voter_email TEXT,
        telegram_id INTEGER,
        nominee_name TEXT NOT NULL,
        voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Create unique index for web users
    await runQuery(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_web 
      ON votes(category_id, voter_email) 
      WHERE voter_email IS NOT NULL
    `);

    // Create unique index for Telegram users
    await runQuery(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_telegram 
      ON votes(category_id, telegram_id) 
      WHERE telegram_id IS NOT NULL
    `);

    // Create settings table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Insert default categories
    const categories = [
      'Best Dresser Award',
      'Office Comedian Award',
      'Mr./Ms. Friendly Award',
      'Team Player Award',
      'Positive Energy Award',
      'Tech Guru Award',
      'Always Hungry Award',
      'Silent Hero Award',
      'Best Smile Award',
      'Coffee Lover Award',
      'Team Spirit Award',
      'Best Sketcher Award'
    ];

    for (let i = 0; i < categories.length; i++) {
      try {
        await runQuery('INSERT OR IGNORE INTO categories (name, display_order) VALUES (?, ?)',
          [categories[i], i + 1]);
      } catch (err) {
        // Ignore duplicate errors
      }
    }

    // Set default voting status (open)
    await runQuery('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      ['voting_open', 'true']);

    // Set default admin password
    await runQuery('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      ['admin_password', 'admin123']);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Get all categories
async function getCategories() {
  return await allQuery('SELECT * FROM categories ORDER BY display_order');
}

// Submit a vote
async function submitVote(categoryId, voterName, voterEmail, nomineeName) {
  try {
    await runQuery(`
      INSERT INTO votes (category_id, voter_name, voter_email, nominee_name)
      VALUES (?, ?, ?, ?)
    `, [categoryId, voterName, voterEmail, nomineeName]);
    return { success: true };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'You have already voted in this category' };
    }
    return { success: false, error: error.message };
  }
}

// Check if voting is open
async function isVotingOpen() {
  const result = await getQuery('SELECT value FROM settings WHERE key = ?', ['voting_open']);
  return result && result.value === 'true';
}

// Toggle voting status
async function toggleVoting() {
  const currentStatus = await isVotingOpen();
  const newStatus = currentStatus ? 'false' : 'true';
  await runQuery('UPDATE settings SET value = ? WHERE key = ?', [newStatus, 'voting_open']);
  return newStatus === 'true';
}

// Get results for admin
async function getResults() {
  const results = await allQuery(`
    SELECT 
      c.name as category_name,
      v.nominee_name,
      COUNT(*) as vote_count
    FROM votes v
    JOIN categories c ON v.category_id = c.id
    GROUP BY c.id, v.nominee_name
    ORDER BY c.display_order, vote_count DESC
  `);

  // Group by category
  const grouped = {};
  results.forEach(row => {
    if (!grouped[row.category_name]) {
      grouped[row.category_name] = [];
    }
    grouped[row.category_name].push({
      nominee: row.nominee_name,
      votes: row.vote_count
    });
  });

  return grouped;
}

// Verify admin password
async function verifyAdminPassword(password) {
  const result = await getQuery('SELECT value FROM settings WHERE key = ?', ['admin_password']);
  return result && result.value === password;
}

// Get voter's votes
async function getVoterVotes(voterEmail) {
  return await allQuery(`
    SELECT category_id, nominee_name
    FROM votes
    WHERE voter_email = ?
  `, [voterEmail]);
}

// Submit vote from Telegram
async function submitVoteFromTelegram(categoryId, telegramId, voterName, nomineeName) {
  try {
    await runQuery(`
      INSERT INTO votes (category_id, telegram_id, voter_name, nominee_name)
      VALUES (?, ?, ?, ?)
    `, [categoryId, telegramId, voterName, nomineeName]);
    return { success: true };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed') || error.message.includes('constraint')) {
      return { success: false, error: 'You have already voted in this category' };
    }
    return { success: false, error: error.message };
  }
}

// Get voter's votes by Telegram ID
async function getVoterVotesByTelegram(telegramId) {
  return await allQuery(`
    SELECT category_id, nominee_name
    FROM votes
    WHERE telegram_id = ?
  `, [telegramId]);
}

// Get voting statistics
async function getVotingStats() {
  const totalVotes = await getQuery('SELECT COUNT(*) as count FROM votes');
  const totalVoters = await getQuery(`
    SELECT COUNT(DISTINCT COALESCE(voter_email, CAST(telegram_id AS TEXT))) as count 
    FROM votes
  `);

  const votesByCategory = await allQuery(`
    SELECT c.name, COUNT(*) as count
    FROM votes v
    JOIN categories c ON v.category_id = c.id
    GROUP BY c.id
    ORDER BY c.display_order
  `);

  const avgVotes = totalVoters.count > 0
    ? (totalVotes.count / totalVoters.count).toFixed(1)
    : 0;

  const categoryStats = votesByCategory
    .map(row => `  ${row.name}: ${row.count}`)
    .join('\n');

  return {
    totalVotes: totalVotes.count,
    totalVoters: totalVoters.count,
    avgVotesPerPerson: avgVotes,
    votesByCategory: categoryStats || '  No votes yet'
  };
}

module.exports = {
  initializeDatabase,
  getCategories,
  submitVote,
  submitVoteFromTelegram,
  isVotingOpen,
  toggleVoting,
  getResults,
  verifyAdminPassword,
  getVoterVotes,
  getVoterVotesByTelegram,
  getVotingStats
};
