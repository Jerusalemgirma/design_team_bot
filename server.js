const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
(async () => {
    await db.initializeDatabase();
})();

// API Routes

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await db.getCategories();
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Check voting status
app.get('/api/voting-status', async (req, res) => {
    try {
        const isOpen = await db.isVotingOpen();
        res.json({ success: true, isOpen });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit votes
app.post('/api/vote', async (req, res) => {
    try {
        const { voterName, voterEmail, votes } = req.body;

        if (!voterName || !voterEmail || !votes || votes.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Check if voting is open
        const votingOpen = await db.isVotingOpen();
        if (!votingOpen) {
            return res.status(403).json({
                success: false,
                error: 'Voting is currently closed'
            });
        }

        const results = [];
        const errors = [];

        for (const vote of votes) {
            const result = await db.submitVote(
                vote.categoryId,
                voterName,
                voterEmail,
                vote.nomineeName
            );

            if (result.success) {
                results.push({ categoryId: vote.categoryId, success: true });
            } else {
                errors.push({
                    categoryId: vote.categoryId,
                    error: result.error
                });
            }
        }

        res.json({
            success: true,
            results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: Verify password
app.post('/api/admin/verify', async (req, res) => {
    try {
        const { password } = req.body;
        const isValid = await db.verifyAdminPassword(password);
        res.json({ success: true, isValid });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: Get results
app.get('/api/admin/results', async (req, res) => {
    try {
        const results = await db.getResults();
        res.json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: Toggle voting
app.post('/api/admin/toggle-voting', async (req, res) => {
    try {
        const isOpen = await db.toggleVoting();
        res.json({ success: true, isOpen });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get voter's existing votes
app.get('/api/voter-votes/:email', async (req, res) => {
    try {
        const votes = await db.getVoterVotes(req.params.email);
        res.json({ success: true, votes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🎉 Office Awards Voting Bot running on http://localhost:${PORT}`);
    console.log(`📊 Admin panel: http://localhost:${PORT}/admin.html`);
    console.log(`🗳️  Voting page: http://localhost:${PORT}`);
    console.log(`🔑 Default admin password: admin123`);
});
