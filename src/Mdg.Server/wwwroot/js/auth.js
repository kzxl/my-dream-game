/**
 * MDG: Aethelis - Authentication & Multi-Account Cloud System
 * Supports Google OAuth 2.0 Direct Redirect, Google Identity Services (GSI), Custom Accounts & Dev Profiles (English)
 */

import { AudioEngine } from './audio.js';

const STORAGE_KEY = 'mdg_auth_user';
const GOOGLE_CLIENT_ID_KEY = 'mdg_google_client_id';
const DEFAULT_GOOGLE_CLIENT_ID = '358742841643-d9d15024227n4j772a6h20m28g2e1t5g.apps.googleusercontent.com';

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

export function getGoogleClientId() {
  return localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || DEFAULT_GOOGLE_CLIENT_ID;
}

export function setGoogleClientId(id) {
  if (id && id.trim()) {
    localStorage.setItem(GOOGLE_CLIENT_ID_KEY, id.trim());
  }
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
 * Handle Custom Username / Password Account Login & Register
 */
export async function loginWithCustomAccount(username, password = '', email = '') {
  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password,
        email: email
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        currentUser = data.user;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
        window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: { user: currentUser, characters: data.characters } }));
        AudioEngine.playTone(587, 'sine', 0.25, 0.2);
        return { success: true, user: currentUser, characters: data.characters };
      }
    }
  } catch (err) {
    console.error('[CustomAuth] Login error:', err);
  }
  return { success: false };
}

/**
 * Google Sign In Callback handler (GSI Client or URL token)
 */
export async function handleGoogleCredential(credential) {
  return await authenticateWithBackend({ credential });
}

/**
 * Direct Redirect to Google's Official OAuth 2.0 Authentication Page
 */
export function redirectToGoogleOAuth(customClientId = null) {
  const clientId = customClientId || getGoogleClientId();
  const redirectUri = window.location.origin + window.location.pathname;
  const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token%20id_token&scope=openid%20profile%20email&nonce=${nonce}&prompt=select_account`;

  AudioEngine.playTone(520, 'sine', 0.2, 0.15);
  window.location.href = googleAuthUrl;
}

/**
 * Check if the browser returned from Google OAuth redirect with tokens in hash
 */
export async function checkGoogleOAuthRedirectResult() {
  const hash = window.location.hash;
  if (!hash || (!hash.includes('id_token=') && !hash.includes('access_token='))) {
    return false;
  }

  const params = new URLSearchParams(hash.substring(1));
  const idToken = params.get('id_token');
  const accessToken = params.get('access_token');

  // Clear hash from URL cleanly
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, null, window.location.pathname + window.location.search);
  } else {
    window.location.hash = '';
  }

  if (idToken) {
    console.log('[GoogleAuth] Successfully caught id_token from Google OAuth Redirect!');
    const res = await handleGoogleCredential(idToken);
    return res && res.success;
  } else if (accessToken) {
    // If access token received, fetch user info directly from Google API
    try {
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (userInfoRes.ok) {
        const userInfo = await userInfoRes.json();
        return await authenticateWithBackend({
          devUser: {
            id: 'gg_' + userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture
          }
        });
      }
    } catch (e) {
      console.warn('[GoogleAuth] Error fetching userinfo from access token:', e);
    }
  }
  return false;
}

/**
 * Fast Dev / Test Profile Logins (For 1-click test)
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
  localStorage.setItem('mdg_active_char_id', 'hero_default');
  window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: { user: getCurrentUser(), characters: [] } }));
  AudioEngine.playTone(330, 'sawtooth', 0.2, 0.2);
  setTimeout(() => window.location.reload(), 300);
}

/**
 * Render Auth Panel in Roster / HUD
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
            <span class="auth-status-badge ${loggedIn ? (user.id.startsWith('gg_') ? 'badge-google' : 'badge-account') : 'badge-guest'}">
              ${loggedIn ? (user.id.startsWith('gg_') ? '🟢 Google ID' : '🟢 Account') : '⚪ Guest'}
            </span>
          </div>
          <span class="auth-user-email">${user.email || user.id}</span>
        </div>
      </div>

      <div class="auth-actions">
        ${loggedIn ? `
          <button class="forge-btn btn-craft" id="btnGoogleSwitch" style="padding:4px 10px; font-size:10px;">Switch Account</button>
          <button class="forge-btn btn-lock" id="btnGoogleLogout" style="padding:4px 10px; font-size:10px;">Sign Out</button>
        ` : `
          <button class="forge-btn btn-craft" id="btnGoogleLoginPrompt" style="padding:5px 12px; font-size:11px; background:linear-gradient(90deg, #4285F4, #34A853);">
            🔑 Sign In / Register
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

export async function quickPlayAsGuest(guestName = 'Adventurer') {
  const cleanName = (guestName || 'Adventurer').trim();
  const guestId = 'guest_' + Math.random().toString(36).substring(2, 8);
  const user = {
    id: guestId,
    email: `${guestId}@aethelis.realm`,
    name: cleanName,
    picture: ''
  };
  currentUser = user;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: { user: currentUser, characters: [] } }));
  return { success: true, user: currentUser };
}

export function ensureAccountLogin() {
  return new Promise((resolve) => {
    if (isUserLoggedIn()) {
      resolve(getCurrentUser());
      return;
    }
    openGoogleAuthModal({
      isGate: true,
      onSuccess: (user) => resolve(user)
    });
  });
}

/**
 * Modal Account Login & Google Authentication Portal
 */
export function openGoogleAuthModal(options = {}) {
  const { isGate = false, onSuccess = null } = options;
  let modal = document.getElementById('googleAuthModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'googleAuthModal';
    modal.className = 'game-modal-backdrop';
    document.body.appendChild(modal);
  }

  const currentClientId = getGoogleClientId();

  modal.innerHTML = `
    <div class="auth-modal-card">
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:20px;">🛡️</span>
          <div>
            <h2 style="margin:0; font-size:18px; color:#ffd700;">AETHELIS REALM GATEWAY</h2>
            <span style="font-size:11px; color:#888;">Đăng nhập hoặc chọn danh tính để kết nối thế giới Multiplayer</span>
          </div>
        </div>
        ${!isGate ? '<button class="close-btn" id="closeGoogleAuthBtn">✕</button>' : ''}
      </div>

      <!-- Auth Navigation Tabs -->
      <div class="auth-tabs-row">
        <button class="auth-tab-btn active" data-tab="accountTab">🎮 Tài Khoản / Đăng Ký</button>
        <button class="auth-tab-btn" data-tab="fastTab">⚡ 1-Click Fast Profile</button>
        <button class="auth-tab-btn" data-tab="guestTab">👤 Chơi Khách (Guest)</button>
        <button class="auth-tab-btn" data-tab="googleTab">🌐 Google OAuth</button>
      </div>

      <div class="auth-modal-body">
        <!-- TAB 1: Custom Account Login / Register -->
        <div id="accountTab" class="auth-tab-content active">
          <p class="auth-desc">Nhập tên tài khoản để đăng nhập hoặc tự động tạo mới tài khoản trên máy chủ:</p>
          
          <div class="auth-form-group">
            <label>Tên Tài Khoản (Username / Account Handle)</label>
            <input type="text" id="customUsernameInput" placeholder="Ví dụ: ShadowHunter99, HeroVietNam..." class="form-input" maxlength="30" />
          </div>

          <div class="auth-form-group">
            <label>Mật Khẩu (Tùy chọn cho chơi nhanh)</label>
            <input type="password" id="customPasswordInput" placeholder="Nhập mật khẩu..." class="form-input" maxlength="30" />
          </div>

          <div class="auth-form-actions">
            <button class="forge-btn btn-craft" id="btnSubmitCustomLogin" style="width:100%; padding:12px; font-size:13px; font-weight:bold; background: linear-gradient(90deg, #00f2fe, #4facfe);">
              ⚔️ ĐĂNG NHẬP / TẠO TÀI KHOẢN
            </button>
          </div>
        </div>

        <!-- TAB 2: 1-Click Fast Profiles -->
        <div id="fastTab" class="auth-tab-content">
          <p class="auth-desc">Chọn nhanh hồ sơ mẫu để test Multiplayer 2 hoặc nhiều máy:</p>

          <div class="auth-dev-section">
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
        </div>

        <!-- TAB 3: Guest Mode -->
        <div id="guestTab" class="auth-tab-content">
          <p class="auth-desc">Chơi nhanh không cần đăng ký mật khẩu. Máy chủ sẽ cấp ID riêng biệt:</p>
          <div class="auth-form-group">
            <label>Biệt Danh Của Bạn (Nickname)</label>
            <input type="text" id="guestNicknameInput" placeholder="Ví dụ: Chiến Binh Rồng, Player1..." class="form-input" maxlength="20" />
          </div>
          <div class="auth-form-actions">
            <button class="forge-btn btn-craft" id="btnSubmitGuestPlay" style="width:100%; padding:12px; font-size:13px; font-weight:bold; background: linear-gradient(90deg, #10b981, #059669);">
              🎮 VÀO CHƠI NHANH VỚI BIỆT DANH NÀY
            </button>
          </div>
        </div>

        <!-- TAB 4: Official Google OAuth 2.0 Redirect & GSI -->
        <div id="googleTab" class="auth-tab-content">
          <p class="auth-desc">Đăng nhập trực tiếp bằng Tài khoản Google để đồng bộ nhân vật và vật phẩm lên đám mây.</p>

          <div style="margin: 10px 0;">
            <button id="btnDirectGoogleOAuth" class="forge-btn btn-craft" style="width:100%; padding:12px; font-size:13px; font-weight:800; background:linear-gradient(90deg, #4285f4, #34a853, #fbbc05, #ea4335); color:#fff; text-shadow: 0 1px 2px rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; gap:10px;">
              <span style="font-size:18px;">🌐</span> XÁC THỰC GOOGLE OAUTH
            </button>
          </div>

          <div class="auth-custom-token-box" style="margin-top:8px;">
            <input type="text" id="customGoogleTokenInput" placeholder="Hoặc dán Google Credential Token..." class="form-input" />
            <button class="forge-btn btn-craft" id="btnSubmitCustomToken">Xác Thực</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const btnClose = document.getElementById('closeGoogleAuthBtn');
  if (btnClose) {
    btnClose.onclick = () => {
      modal.style.display = 'none';
    };
  }

  // Tab Switching
  modal.querySelectorAll('.auth-tab-btn').forEach(tabBtn => {
    tabBtn.onclick = () => {
      modal.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
      modal.querySelectorAll('.auth-tab-content').forEach(c => c.classList.remove('active'));
      tabBtn.classList.add('active');
      const targetId = tabBtn.getAttribute('data-tab');
      document.getElementById(targetId)?.classList.add('active');
      AudioEngine.playTone(440, 'triangle', 0.08, 0.08);
    };
  });

  const finishLogin = (user) => {
    modal.style.display = 'none';
    renderAuthHeaderWidget();
    if (onSuccess) onSuccess(user);
  };

  // Direct Google OAuth Button
  document.getElementById('btnDirectGoogleOAuth').onclick = () => {
    const customId = document.getElementById('googleClientIdInput')?.value?.trim();
    if (customId) setGoogleClientId(customId);
    redirectToGoogleOAuth(customId);
  };

  // Custom Account Login Handler
  document.getElementById('btnSubmitCustomLogin').onclick = async () => {
    const username = document.getElementById('customUsernameInput').value.trim();
    const password = document.getElementById('customPasswordInput').value.trim();
    if (!username) {
      alert('Vui lòng nhập tên tài khoản.');
      return;
    }

    const res = await loginWithCustomAccount(username, password);
    if (res && res.success) {
      finishLogin(res.user);
    } else {
      alert('Không thể đăng nhập tài khoản.');
    }
  };

  // Guest Play Handler
  document.getElementById('btnSubmitGuestPlay').onclick = async () => {
    const nick = document.getElementById('guestNicknameInput').value.trim() || 'Hero_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const res = await quickPlayAsGuest(nick);
    if (res && res.success) {
      finishLogin(res.user);
    }
  };

  // 1-Click Profile Handlers
  modal.querySelectorAll('.dev-profile-btn').forEach(btn => {
    btn.onclick = async () => {
      const p = btn.getAttribute('data-profile');
      const res = await loginWithDevProfile(p);
      if (res && res.success) {
        finishLogin(res.user);
      }
    };
  });

  // Custom JWT Token Handler
  document.getElementById('btnSubmitCustomToken').onclick = async () => {
    const cred = document.getElementById('customGoogleTokenInput').value.trim();
    if (!cred) return alert('Vui lòng nhập mã token');
    const res = await handleGoogleCredential(cred);
    if (res && res.success) {
      finishLogin(res.user);
    } else {
      alert('Mã token không hợp lệ.');
    }
  };

  modal.style.display = 'flex';
}
