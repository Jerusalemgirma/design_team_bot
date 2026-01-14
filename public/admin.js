// API Base URL
const API_BASE = '';

// DOM Elements
const adminLoginSection = document.getElementById('adminLoginSection');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const toggleVotingBtn = document.getElementById('toggleVotingBtn');
const toggleBtnText = document.getElementById('toggleBtnText');
const adminStatusDot = document.getElementById('adminStatusDot');
const adminStatusText = document.getElementById('adminStatusText');
const resultsContainer = document.getElementById('resultsContainer');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// State
let isAuthenticated = false;
let votingOpen = true;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    adminLoginForm.addEventListener('submit', handleAdminLogin);
    toggleVotingBtn.addEventListener('click', handleToggleVoting);
});

// Handle admin login
async function handleAdminLogin(e) {
    e.preventDefault();

    const formData = new FormData(adminLoginForm);
    const password = formData.get('adminPassword');

    try {
        const response = await fetch(`${API_BASE}/api/admin/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (data.success && data.isValid) {
            isAuthenticated = true;
            adminLoginSection.classList.add('hidden');
            adminDashboard.classList.remove('hidden');

            // Load dashboard data
            await loadDashboardData();
        } else {
            showToast('Invalid password', 'error');
        }
    } catch (error) {
        console.error('Error verifying admin:', error);
        showToast('Login failed. Please try again.', 'error');
    }
}

// Load dashboard data
async function loadDashboardData() {
    await checkVotingStatus();
    await loadResults();
}

// Check voting status
async function checkVotingStatus() {
    try {
        const response = await fetch(`${API_BASE}/api/voting-status`);
        const data = await response.json();

        if (data.success) {
            votingOpen = data.isOpen;
            updateVotingStatusUI();
        }
    } catch (error) {
        console.error('Error checking voting status:', error);
    }
}

// Update voting status UI
function updateVotingStatusUI() {
    if (votingOpen) {
        adminStatusDot.style.background = '#4caf50';
        adminStatusText.textContent = 'Voting is Open';
        toggleBtnText.textContent = 'Close Voting';
        toggleVotingBtn.querySelector('.toggle-icon').textContent = '🔒';
    } else {
        adminStatusDot.style.background = '#f44336';
        adminStatusText.textContent = 'Voting is Closed';
        toggleBtnText.textContent = 'Open Voting';
        toggleVotingBtn.querySelector('.toggle-icon').textContent = '🔓';
    }
}

// Load results
async function loadResults() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/results`);
        const data = await response.json();

        if (data.success) {
            renderResults(data.results);
        }
    } catch (error) {
        console.error('Error loading results:', error);
        showToast('Failed to load results', 'error');
    }
}

// Render results
function renderResults(results) {
    const icons = ['👔', '😂', '😊', '🤝', '✨', '💻', '🍕', '🦸', '😄', '☕', '🎯'];
    const categoryNames = [
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
        'Team Spirit Award'
    ];

    if (Object.keys(results).length === 0) {
        resultsContainer.innerHTML = `
            <div class="card">
                <p class="no-votes">No votes have been cast yet.</p>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = categoryNames.map((categoryName, index) => {
        const categoryResults = results[categoryName] || [];

        return `
            <div class="result-card">
                <h3>
                    <span class="category-icon">${icons[index] || '🏆'}</span>
                    ${categoryName}
                </h3>
                ${categoryResults.length > 0 ? `
                    <ul class="result-list">
                        ${categoryResults.map((result, idx) => `
                            <li class="result-item">
                                <span class="nominee-name">
                                    ${idx === 0 ? '🥇 ' : ''}${result.nominee}
                                </span>
                                <span class="vote-count">
                                    ${result.votes} ${result.votes === 1 ? 'vote' : 'votes'}
                                </span>
                            </li>
                        `).join('')}
                    </ul>
                ` : `
                    <p class="no-votes">No votes yet</p>
                `}
            </div>
        `;
    }).join('');
}

// Handle toggle voting
async function handleToggleVoting() {
    try {
        toggleVotingBtn.disabled = true;

        const response = await fetch(`${API_BASE}/api/admin/toggle-voting`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            votingOpen = data.isOpen;
            updateVotingStatusUI();
            showToast(
                votingOpen ? 'Voting is now open' : 'Voting is now closed',
                'success'
            );
        }
    } catch (error) {
        console.error('Error toggling voting:', error);
        showToast('Failed to toggle voting status', 'error');
    } finally {
        toggleVotingBtn.disabled = false;
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}
