// API Base URL
const API_BASE = '';

// DOM Elements
const voterInfoSection = document.getElementById('voterInfoSection');
const votingSection = document.getElementById('votingSection');
const successSection = document.getElementById('successSection');
const voterInfoForm = document.getElementById('voterInfoForm');
const categoriesGrid = document.getElementById('categoriesGrid');
const submitVotesBtn = document.getElementById('submitVotesBtn');
const displayVoterName = document.getElementById('displayVoterName');
const votingStatus = document.getElementById('votingStatus');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// State
let voterName = '';
let voterEmail = '';
let categories = [];
let votes = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkVotingStatus();
    loadCategories();

    voterInfoForm.addEventListener('submit', handleVoterInfoSubmit);
    submitVotesBtn.addEventListener('submit', handleSubmitVotes);
});

// Check if voting is open
async function checkVotingStatus() {
    try {
        const response = await fetch(`${API_BASE}/api/voting-status`);
        const data = await response.json();

        if (data.success) {
            updateVotingStatusUI(data.isOpen);
        }
    } catch (error) {
        console.error('Error checking voting status:', error);
    }
}

// Update voting status UI
function updateVotingStatusUI(isOpen) {
    const statusText = votingStatus.querySelector('.status-text');

    if (isOpen) {
        votingStatus.classList.remove('closed');
        statusText.textContent = 'Voting Open';
    } else {
        votingStatus.classList.add('closed');
        statusText.textContent = 'Voting Closed';
        showToast('Voting is currently closed', 'error');

        // Disable form
        voterInfoForm.querySelectorAll('input, button').forEach(el => {
            el.disabled = true;
        });
    }
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/api/categories`);
        const data = await response.json();

        if (data.success) {
            categories = data.categories;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Failed to load categories', 'error');
    }
}

// Handle voter info form submission
function handleVoterInfoSubmit(e) {
    e.preventDefault();

    const formData = new FormData(voterInfoForm);
    voterName = formData.get('voterName').trim();
    voterEmail = formData.get('voterEmail').trim().toLowerCase();

    if (!voterName || !voterEmail) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Show voting section
    displayVoterName.textContent = voterName;
    voterInfoSection.classList.add('hidden');
    votingSection.classList.remove('hidden');

    // Render categories
    renderCategories();
}

// Render categories
function renderCategories() {
    const icons = ['👔', '😂', '😊', '🤝', '✨', '💻', '🍕', '🦸', '😄', '☕', '🎯'];

    categoriesGrid.innerHTML = categories.map((category, index) => `
        <div class="card category-card">
            <h3>
                <span class="category-icon">${icons[index] || '🏆'}</span>
                ${category.name}
            </h3>
            <div class="form-group">
                <label for="nominee-${category.id}">Nominee Name</label>
                <input 
                    type="text" 
                    id="nominee-${category.id}" 
                    placeholder="Enter colleague's name"
                    data-category-id="${category.id}"
                    class="nominee-input"
                >
            </div>
        </div>
    `).join('');
}

// Handle submit votes
async function handleSubmitVotes() {
    // Collect votes from inputs
    const nomineeInputs = document.querySelectorAll('.nominee-input');
    const votesToSubmit = [];

    nomineeInputs.forEach(input => {
        const nomineeName = input.value.trim();
        if (nomineeName) {
            votesToSubmit.push({
                categoryId: parseInt(input.dataset.categoryId),
                nomineeName: nomineeName
            });
        }
    });

    if (votesToSubmit.length === 0) {
        showToast('Please vote for at least one category', 'error');
        return;
    }

    // Disable button
    submitVotesBtn.disabled = true;
    submitVotesBtn.innerHTML = '<span>Submitting...</span>';

    try {
        const response = await fetch(`${API_BASE}/api/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                voterName,
                voterEmail,
                votes: votesToSubmit
            })
        });

        const data = await response.json();

        if (data.success) {
            // Show success message
            votingSection.classList.add('hidden');
            successSection.classList.remove('hidden');

            if (data.errors && data.errors.length > 0) {
                showToast(`Some votes were already submitted for certain categories`, 'error');
            } else {
                showToast('All votes submitted successfully!', 'success');
            }
        } else {
            showToast(data.error || 'Failed to submit votes', 'error');
            submitVotesBtn.disabled = false;
            submitVotesBtn.innerHTML = '<span>Submit All Votes</span><span class="btn-arrow">✓</span>';
        }
    } catch (error) {
        console.error('Error submitting votes:', error);
        showToast('Failed to submit votes. Please try again.', 'error');
        submitVotesBtn.disabled = false;
        submitVotesBtn.innerHTML = '<span>Submit All Votes</span><span class="btn-arrow">✓</span>';
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

// Add click event to submit button
submitVotesBtn.addEventListener('click', handleSubmitVotes);
