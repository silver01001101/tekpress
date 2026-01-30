# Tekpress - Pinterest Print Extension

A Chrome extension that lets you print any image from Pinterest using on-demand printing services.

## Features

- **One-click printing**: Hover over any Pinterest image and click "Print"
- **Multiple product types**: Posters, canvas, framed prints, metal prints
- **Various sizes**: From 8x10 to 24x36
- **User authentication**: Sign in with Google or email/password
- **Order tracking**: View your print orders in the extension popup

## Setup

### 1. Install the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `tekpress` folder

### 2. Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Open the SQL Editor
3. Run the contents of `supabase-schema.sql` to create the required tables

#### Enable Google OAuth (optional)

1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials
4. Add the Chrome extension redirect URL to allowed redirects:
   - Format: `https://<extension-id>.chromiumapp.org/`
   - Find your extension ID in `chrome://extensions/`

### 3. Configure Prodigi API

1. Sign up at [Prodigi](https://www.prodigi.com/)
2. Get your API key from the dashboard
3. Add your API key to `src/config.js`:

```javascript
export const PRODIGI_API_KEY = 'your-api-key-here';
```

### 4. Create Icons

Replace the placeholder icons in the `icons/` folder with proper PNG icons:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## Project Structure

```
tekpress/
├── manifest.json          # Chrome extension manifest
├── public/
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── src/
│   ├── config.js          # API configuration
│   ├── supabase.js        # Supabase client
│   ├── prodigi.js         # Prodigi API client
│   ├── background.js      # Service worker
│   ├── content.js         # Pinterest overlay script
│   └── content.css        # Overlay styles
├── icons/                 # Extension icons
└── supabase-schema.sql    # Database schema
```

## Usage

1. Install and configure the extension
2. Sign in using the extension popup
3. Browse Pinterest
4. Hover over any image to see the "Print" button
5. Click "Print", select options, and checkout

## Development

### Testing locally

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Tekpress extension
4. Reload any Pinterest tabs

### API Endpoints Used

**Supabase:**
- `/auth/v1/signup` - Email signup
- `/auth/v1/token` - Email login
- `/auth/v1/authorize` - OAuth flow
- `/rest/v1/print_orders` - Order management

**Prodigi:**
- `/v4.0/orders` - Create orders
- `/v4.0/quotes` - Get pricing
- `/v4.0/products` - Product catalog

## License

MIT
