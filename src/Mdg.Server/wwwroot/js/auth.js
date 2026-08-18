/**
 * MDG: Aethelis - Google Authentication & Cloud Account Module
 * Supports Google Identity Services (GSI) OAuth 2.0 & Fast Dev Mock Profiles (English)
 */

import { AudioEngine } from './audio.js';

const STORAGE_KEY = 'mdg_auth_user';

let currentUser = null;

// Initialize user from local storage
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    currentUser = JSON.parse(saved);
  }
} catch (e) {
  currentUser = null;
}

export function getCurrentUser() {
  return currentUser || {
    id: 'guest',
    email: 'guest@aethelis.realm',
    name: 'Guest Player',
    picture: ''
  };
}

export function isUserLoggedIn() {
  return !!(currentUser && currentUser.id && currentUser.id !== 'guest');
}

/**
 * Handle Google Token / Backend Auth Exchange
 */
export async function authenticateWithBackend(payload) {
  try {
    const res = await fetch('/api/v1/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        currentUser = data.user;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
        window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: { user: currentUser, characters: data.characters } }));
        AudioEngine.playTone(523, 'sine', 0.25, 0.2);
        return { success: true, user: currentUser, characters: data.characters };
      }
    }
  } catch (err) {
    console.error('[GoogleAuth] Backend error:', err);
  }
  return { success: false };
}

/**
 * Google Sign In Callback handler (GSI Client)
 */
export async function handleGoogleCredential(credential) {
  return await authenticateWithBackend({ credential });
}

/**
 * Fast Dev / Test Profile Logins (For offline / 1-click test without Client ID setup)
 */
export async function loginWithDevProfile(profileType = 'kaelen') {
  const mockProfiles = {
    kaelen: {
      id: 'gg_kaelen_01',
      email: 'kaelen.champion@gmail.com',
      name: 'Kaelen Vanguard (Google)',
      picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kaelen'
    },
    aria: {
      id: 'gg_aria_02',
      email: 'aria.arcanist@gmail.com',
      name: 'Aria The Seeker (Google)',
      picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aria'
    },
    shadow: {
      id: 'gg_shadow_03',
      email: 'shadow.syndicate@gmail.com',
      name: 'Shadow Rogue (Google)',
      picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shadow'
    }
  };

  const devUser = mockProfiles[profileType] || mockProfiles.kaelen;
  return await authenticateWithBackend({ devUser });
}

/**
 * Logout
 */
export function logout() {
  currentUser = null;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: { user: getCurrentUser(), characters: [] } }));
  AudioEngine.playTone(330, 'sawtooth', 0.2, 0.2);
}

/**
 * Render Auth Panel in Roster / Settings Modal
 */
export function renderAuthHeaderWidget(containerId = 'authHeaderWidget') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const user = getCurrentUser();
  const loggedIn = isUserLoggedIn();

  container.innerHTML = `
    <div class="auth-user-bar ${loggedIn ? 'user-logged-in' : 'user-guest'}">
      <div class="auth-user-info">
        <div class="auth-avatar-box">
          ${user.picture ? `<img src="${user.picture}" class="auth-user-pic" alt="Avatar"/>` : `<span class="auth-default-icon">${loggedIn ? '👤' : '🎮'}</span>`}
        </div>
        <div class="auth-user-meta">
          <div class="auth-name-row">
            <span class="auth-user-name">${user.name}</span>
            <span class="auth-status-badge ${loggedIn ? 'badge-google' : 'badge-guest'}">
              ${loggedIn ? '🟢 Google ID' : '⚪ Guest Account'}
            </span>
          </div>
          <div class="auth-user-email">${user.email || 'Local Storage'}</div>
        </div>
      </div>

      <div class="auth-actions">
        ${loggedIn ? `
          <button class="forge-btn btn-craft" id="btnGoogleSwitch" style="padding:4px 10px; font-size:10px;">Switch Account</button>
          <button class="forge-btn btn-lock" id="btnGoogleLogout" style="padding:4px 10px; font-size:10px;">Sign Out</button>
        ` : `
          <button class="forge-btn btn-craft" id="btnGoogleLoginPrompt" style="padding:5px 12px; font-size:11px; background:linear-gradient(90deg, #4285F4, #34A853);">
            🔑 Sign in with Google
          </button>
        `}
      </div>
    </div>
  `;

  document.getElementById('btnGoogleLogout')?.addEventListener('click', () => {
    logout();
    renderAuthHeaderWidget(containerId);
  });

  document.getElementById('btnGoogleLoginPrompt')?.addEventListener('click', () => {
    openGoogleAuthModal();
  });

  document.getElementById('btnGoogleSwitch')?.addEventListener('click', () => {
    openGoogleAuthModal();
  });
}

/**
 * Modal Google Sign In Selection (GSI + Dev Accounts)
 */
export function openGoogleAuthModal() {
  let modal = document.getElementById('googleAuthModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'googleAuthModal';
    modal.className = 'game-modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="auth-modal-card">
      <div class="modal-header">
        <h2>🔑 Google Account Authentication</h2>
        <button class="close-btn" id="closeGoogleAuthBtn">✕</button>
      </div>

      <div class="auth-modal-body">
        <p class="auth-desc">Sign in with Google to synchronize character progress, levels, and cloud Shared Stash inventory across devices.</p>

        <!-- Dev Quick Profiles (1-Click Google Test) -->
        <div class="auth-dev-section">
          <h3>⚡ 1-Click Fast Profiles (Google Test):</h3>
          <div class="dev-profiles-grid">
            <button class="dev-profile-btn" data-profile="kaelen">
              <span class="profile-avatar">🛡️</span>
              <div class="profile-info">
                <strong>Kaelen Vanguard</strong>
                <span>kaelen.champion@gmail.com</span>
              </div>
            </button>

            <button class="dev-profile-btn" data-profile="aria">
              <span class="profile-avatar">🔮</span>
              <div class="profile-info">
                <strong>Aria The Seeker</strong>
                <span>aria.arcanist@gmail.com</span>
              </div>
            </button>

            <button class="dev-profile-btn" data-profile="shadow">
              <span class="profile-avatar">🗡️</span>
              <div class="profile-info">
                <strong>Shadow Rogue</strong>
                <span>shadow.syndicate@gmail.com</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Real GSI Token Box (Optional Client ID Input) -->
        <div class="auth-custom-token-box">
          <input type="text" id="customGoogleTokenInput" placeholder="Paste Google Credential JWT Token (optional)..." class="form-input" />
          <button class="forge-btn btn-craft" id="btnSubmitCustomToken">Verify Token</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('closeGoogleAuthBtn').onclick = () => {
    modal.style.display = 'none';
  };

  modal.querySelectorAll('.dev-profile-btn').forEach(btn => {
    btn.onclick = async () => {
      const p = btn.getAttribute('data-profile');
      const res = await loginWithDevProfile(p);
      if (res && res.success) {
        modal.style.display = 'none';
        renderAuthHeaderWidget();
      }
    };
  });

  document.getElementById('btnSubmitCustomToken').onclick = async () => {
    const cred = document.getElementById('customGoogleTokenInput').value.trim();
    if (!cred) return alert('Please enter token string');
    const res = await handleGoogleCredential(cred);
    if (res && res.success) {
      modal.style.display = 'none';
      renderAuthHeaderWidget();
    } else {
      alert('Unable to authenticate Google token.');
    }
  };

  modal.style.display = 'flex';
}
