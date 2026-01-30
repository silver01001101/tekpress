// Tekpress Pinterest Overlay
(function() {
  'use strict';

  let isAuthenticated = false;
  let currentUser = null;

  // Check authentication status
  async function checkAuth() {
    const response = await chrome.runtime.sendMessage({ action: 'getSession' });
    isAuthenticated = response.isAuthenticated;
    currentUser = response.user;
    return isAuthenticated;
  }

  // Create print button element
  function createPrintButton(imageUrl) {
    const button = document.createElement('button');
    button.className = 'tekpress-print-btn';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      <span>Print</span>
    `;
    button.dataset.imageUrl = imageUrl;
    button.addEventListener('click', handlePrintClick);
    return button;
  }

  // Handle print button click
  async function handlePrintClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const imageUrl = e.currentTarget.dataset.imageUrl;

    // Check if user is authenticated
    await checkAuth();
    if (!isAuthenticated) {
      showModal('login', imageUrl);
      return;
    }

    showModal('print', imageUrl);
  }

  // Create and show modal
  function showModal(type, imageUrl) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.tekpress-modal-overlay');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.className = 'tekpress-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'tekpress-modal';

    if (type === 'login') {
      modal.innerHTML = `
        <div class="tekpress-modal-header">
          <h2>Sign in to Tekpress</h2>
          <button class="tekpress-close-btn">&times;</button>
        </div>
        <div class="tekpress-modal-content">
          <p>Sign in to print this image</p>
          <button class="tekpress-google-btn">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <div class="tekpress-divider"><span>or</span></div>
          <form class="tekpress-login-form">
            <input type="email" placeholder="Email" class="tekpress-input" required />
            <input type="password" placeholder="Password" class="tekpress-input" required />
            <button type="submit" class="tekpress-submit-btn">Sign In</button>
          </form>
          <p class="tekpress-signup-link">Don't have an account? <a href="#" class="tekpress-link">Sign up</a></p>
        </div>
      `;

      // Add event listeners
      setTimeout(() => {
        const googleBtn = modal.querySelector('.tekpress-google-btn');
        googleBtn?.addEventListener('click', async () => {
          const response = await chrome.runtime.sendMessage({ action: 'signInWithGoogle' });
          if (response.success) {
            overlay.remove();
            showModal('print', imageUrl);
          }
        });

        const form = modal.querySelector('.tekpress-login-form');
        form?.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = form.querySelector('input[type="email"]').value;
          const password = form.querySelector('input[type="password"]').value;
          const response = await chrome.runtime.sendMessage({
            action: 'signIn',
            email,
            password
          });
          if (response.success) {
            overlay.remove();
            showModal('print', imageUrl);
          }
        });

        const signupLink = modal.querySelector('.tekpress-link');
        signupLink?.addEventListener('click', (e) => {
          e.preventDefault();
          showModal('signup', imageUrl);
        });
      }, 0);
    } else if (type === 'signup') {
      modal.innerHTML = `
        <div class="tekpress-modal-header">
          <h2>Create Account</h2>
          <button class="tekpress-close-btn">&times;</button>
        </div>
        <div class="tekpress-modal-content">
          <form class="tekpress-signup-form">
            <input type="email" placeholder="Email" class="tekpress-input" required />
            <input type="password" placeholder="Password" class="tekpress-input" required />
            <input type="password" placeholder="Confirm Password" class="tekpress-input" required />
            <button type="submit" class="tekpress-submit-btn">Create Account</button>
          </form>
          <p class="tekpress-signup-link">Already have an account? <a href="#" class="tekpress-link">Sign in</a></p>
        </div>
      `;

      setTimeout(() => {
        const form = modal.querySelector('.tekpress-signup-form');
        form?.addEventListener('submit', async (e) => {
          e.preventDefault();
          const inputs = form.querySelectorAll('input');
          const email = inputs[0].value;
          const password = inputs[1].value;
          const confirmPassword = inputs[2].value;

          if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
          }

          const response = await chrome.runtime.sendMessage({
            action: 'signUp',
            email,
            password
          });
          if (response.success) {
            overlay.remove();
            showModal('print', imageUrl);
          }
        });

        const signinLink = modal.querySelector('.tekpress-link');
        signinLink?.addEventListener('click', (e) => {
          e.preventDefault();
          showModal('login', imageUrl);
        });
      }, 0);
    } else if (type === 'print') {
      modal.innerHTML = `
        <div class="tekpress-modal-header">
          <h2>Print Options</h2>
          <button class="tekpress-close-btn">&times;</button>
        </div>
        <div class="tekpress-modal-content">
          <div class="tekpress-preview">
            <img src="${imageUrl}" alt="Preview" />
          </div>
          <div class="tekpress-options">
            <label>Product Type</label>
            <select class="tekpress-select" id="tekpress-product">
              <option value="poster">Poster</option>
              <option value="canvas">Canvas Print</option>
              <option value="framed">Framed Print</option>
              <option value="metal">Metal Print</option>
            </select>
            <label>Size</label>
            <select class="tekpress-select" id="tekpress-size">
              <option value="8x10">8" x 10"</option>
              <option value="11x14">11" x 14"</option>
              <option value="16x20">16" x 20"</option>
              <option value="24x36">24" x 36"</option>
            </select>
            <button class="tekpress-submit-btn tekpress-order-btn">Continue to Checkout</button>
          </div>
        </div>
      `;

      setTimeout(() => {
        const orderBtn = modal.querySelector('.tekpress-order-btn');
        orderBtn?.addEventListener('click', async () => {
          const product = modal.querySelector('#tekpress-product').value;
          const size = modal.querySelector('#tekpress-size').value;

          // Save order to database
          await chrome.runtime.sendMessage({
            action: 'savePrintOrder',
            userId: currentUser?.id,
            imageUrl: imageUrl,
            productType: `${product}-${size}`
          });

          // Show confirmation
          modal.querySelector('.tekpress-modal-content').innerHTML = `
            <div class="tekpress-success">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h3>Order Saved!</h3>
              <p>Your print order has been saved. Check your orders in the Tekpress extension popup.</p>
            </div>
          `;
        });
      }, 0);
    }

    // Close button handler
    setTimeout(() => {
      const closeBtn = modal.querySelector('.tekpress-close-btn');
      closeBtn?.addEventListener('click', () => overlay.remove());
    }, 0);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  // Add print buttons to Pinterest pins
  function addPrintButtons() {
    // Pinterest pin images
    const pins = document.querySelectorAll('[data-test-id="pin"] img, [data-test-id="pinWrapper"] img, .PinImage img, div[data-test-id="pin-visual-wrapper"] img');

    pins.forEach(img => {
      const container = img.closest('[data-test-id="pin"], [data-test-id="pinWrapper"], .PinImage, div[data-test-id="pin-visual-wrapper"]');
      if (!container || container.querySelector('.tekpress-print-btn')) return;

      // Get the highest resolution image URL
      let imageUrl = img.src;
      if (img.srcset) {
        const srcsetParts = img.srcset.split(',');
        const lastPart = srcsetParts[srcsetParts.length - 1].trim().split(' ')[0];
        if (lastPart) imageUrl = lastPart;
      }

      container.style.position = 'relative';
      const btn = createPrintButton(imageUrl);
      container.appendChild(btn);
    });
  }

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Initialize
  async function init() {
    await checkAuth();
    addPrintButtons();

    // Watch for new pins loaded via infinite scroll
    const observer = new MutationObserver(debounce(addPrintButtons, 500));
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
