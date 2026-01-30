// Popup script for Tekpress Chrome Extension

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const googleSigninBtn = document.getElementById('google-signin');
const showSignupLink = document.getElementById('show-signup');
const showSigninLink = document.getElementById('show-signin');
const showSigninText = document.getElementById('show-signin-text');
const signoutLink = document.getElementById('signout');
const authError = document.getElementById('auth-error');
const userEmail = document.getElementById('user-email');
const userAvatar = document.getElementById('user-avatar');
const orderCount = document.getElementById('order-count');
const ordersList = document.getElementById('orders-list');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await checkSession();
  setupEventListeners();
});

// Check if user is logged in
async function checkSession() {
  const response = await chrome.runtime.sendMessage({ action: 'getSession' });

  if (response.isAuthenticated && response.user) {
    showDashboard(response.user);
    loadOrders();
  } else {
    showAuth();
  }
}

// Show auth section
function showAuth() {
  authSection.classList.remove('hidden');
  dashboardSection.classList.add('hidden');
}

// Show dashboard section
function showDashboard(user) {
  authSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');

  // Update user info
  const email = user.email || 'User';
  userEmail.textContent = email;
  userAvatar.textContent = email.charAt(0).toUpperCase();
}

// Load user's orders
async function loadOrders() {
  const response = await chrome.runtime.sendMessage({ action: 'getPrintOrders' });

  if (response.success && response.data && response.data.length > 0) {
    orderCount.textContent = response.data.length;
    renderOrders(response.data);
  } else {
    orderCount.textContent = '0';
    ordersList.innerHTML = '<p class="empty-state">No orders yet. Start by printing an image from Pinterest!</p>';
  }
}

// Render orders list
function renderOrders(orders) {
  ordersList.innerHTML = orders.map(order => `
    <div class="order-item">
      <img src="${order.image_url}" alt="Print" class="order-thumb" />
      <div class="order-details">
        <div class="order-type">${formatProductType(order.product_type)}</div>
        <div class="order-date">${formatDate(order.created_at)}</div>
      </div>
      <span class="order-status ${order.status}">${order.status}</span>
    </div>
  `).join('');
}

// Format product type for display
function formatProductType(type) {
  if (!type) return 'Print';
  const parts = type.split('-');
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Show error message
function showError(message) {
  authError.textContent = message;
  authError.classList.remove('hidden');
  setTimeout(() => {
    authError.classList.add('hidden');
  }, 5000);
}

// Setup event listeners
function setupEventListeners() {
  // Google Sign In
  googleSigninBtn.addEventListener('click', async () => {
    const response = await chrome.runtime.sendMessage({ action: 'signInWithGoogle' });

    if (response.success) {
      showDashboard(response.data.user);
      loadOrders();
    } else {
      showError(response.error || 'Google sign in failed');
    }
  });

  // Email/Password Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await chrome.runtime.sendMessage({
      action: 'signIn',
      email,
      password
    });

    if (response.success && response.data.access_token) {
      const userResponse = await chrome.runtime.sendMessage({ action: 'getSession' });
      showDashboard(userResponse.user);
      loadOrders();
    } else {
      showError(response.data?.error_description || response.error || 'Sign in failed');
    }
  });

  // Email/Password Signup
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    if (password !== confirm) {
      showError('Passwords do not match');
      return;
    }

    const response = await chrome.runtime.sendMessage({
      action: 'signUp',
      email,
      password
    });

    if (response.success && response.data.access_token) {
      const userResponse = await chrome.runtime.sendMessage({ action: 'getSession' });
      showDashboard(userResponse.user);
      loadOrders();
    } else {
      showError(response.data?.error_description || response.error || 'Sign up failed');
    }
  });

  // Toggle between login and signup
  showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    showSignupLink.parentElement.classList.add('hidden');
    showSigninText.classList.remove('hidden');
  });

  showSigninLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    showSigninText.classList.add('hidden');
    showSignupLink.parentElement.classList.remove('hidden');
  });

  // Sign out
  signoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    await chrome.runtime.sendMessage({ action: 'signOut' });
    showAuth();
  });
}
