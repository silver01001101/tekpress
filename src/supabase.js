import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

class SupabaseClient {
  constructor() {
    this.url = SUPABASE_URL;
    this.key = SUPABASE_ANON_KEY;
    this.session = null;
  }

  async init() {
    const stored = await chrome.storage.local.get(['supabase_session']);
    if (stored.supabase_session) {
      this.session = stored.supabase_session;
    }
    return this.session;
  }

  async fetch(endpoint, options = {}) {
    const headers = {
      'apikey': this.key,
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.session?.access_token) {
      headers['Authorization'] = `Bearer ${this.session.access_token}`;
    }

    const response = await fetch(`${this.url}${endpoint}`, {
      ...options,
      headers
    });

    return response.json();
  }

  // Email/Password Sign Up
  async signUp(email, password) {
    const response = await this.fetch('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.access_token) {
      this.session = response;
      await chrome.storage.local.set({ supabase_session: response });
    }

    return response;
  }

  // Email/Password Sign In
  async signIn(email, password) {
    const response = await this.fetch('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.access_token) {
      this.session = response;
      await chrome.storage.local.set({ supabase_session: response });
    }

    return response;
  }

  // OAuth Sign In (Google)
  async signInWithOAuth(provider = 'google') {
    const redirectUrl = chrome.identity.getRedirectURL();
    const authUrl = `${this.url}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectUrl)}`;

    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        { url: authUrl, interactive: true },
        async (responseUrl) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }

          const url = new URL(responseUrl);
          const hashParams = new URLSearchParams(url.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken) {
            this.session = {
              access_token: accessToken,
              refresh_token: refreshToken
            };
            await chrome.storage.local.set({ supabase_session: this.session });

            // Get user data
            const user = await this.getUser();
            resolve({ session: this.session, user });
          } else {
            reject(new Error('No access token received'));
          }
        }
      );
    });
  }

  // Get current user
  async getUser() {
    if (!this.session?.access_token) return null;

    const response = await this.fetch('/auth/v1/user', {
      method: 'GET'
    });

    return response;
  }

  // Sign out
  async signOut() {
    if (this.session?.access_token) {
      await this.fetch('/auth/v1/logout', {
        method: 'POST'
      });
    }

    this.session = null;
    await chrome.storage.local.remove(['supabase_session']);
  }

  // Database operations
  async from(table) {
    return {
      select: async (columns = '*') => {
        return this.fetch(`/rest/v1/${table}?select=${columns}`);
      },
      insert: async (data) => {
        return this.fetch(`/rest/v1/${table}`, {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(data)
        });
      },
      update: async (data, match) => {
        const params = new URLSearchParams(match).toString();
        return this.fetch(`/rest/v1/${table}?${params}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(data)
        });
      },
      delete: async (match) => {
        const params = new URLSearchParams(match).toString();
        return this.fetch(`/rest/v1/${table}?${params}`, {
          method: 'DELETE'
        });
      }
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.session?.access_token;
  }
}

export const supabase = new SupabaseClient();
