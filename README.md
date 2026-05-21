# Build A Booking

Vite + React app for the Build A Booking builder and booking-page experience.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run mobile:sync
npm run mobile:android
```

## Mobile App Prep

Capacitor is configured so the same React app can be wrapped for Android and iOS later.

- Android can be generated and tested on Windows with Android Studio.
- iOS is configured, but final iOS builds require macOS/Xcode.
- Store subscriptions should stay on the website; the mobile apps can focus on sign in and workspace management.

See `docs/mobile-app.md` for the free setup path and month-end publishing checklist.

## Firebase Setup

Copy `.env.example` to `.env.local` and replace `VITE_FIREBASE_CONFIG` with the Firebase web app config JSON string.

```bash
VITE_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"..."}
VITE_APP_ID=build-a-booking-v2
```

The Firebase boundary lives in `src/services/firebase.js`, so production wiring can happen there without touching the UI components.

### Firebase Services To Enable

1. Authentication: enable Email/Password sign-in for business owners and Anonymous sign-in for public booking-page submissions.
2. Firestore Database: create in production mode, then publish `firestore.rules`.
3. Storage: enable Firebase Storage, then publish `storage.rules`.
4. Hosting: `firebase.json` is already configured for Vite's `dist` output and SPA rewrites.

### Deploy

```bash
npm run build
firebase deploy
```

### Public Booking Pages

After publishing from the Editor, the live booking page is available at:

```txt
/book/your-slug
```

Public submissions write to the owner booking queue and also create a locked public submission record for audit/debugging.

## Email Setup

Email delivery uses EmailJS from the browser so the first production version can send emails without a custom backend.

In the app:

1. Open `Email Studio`.
2. Add your EmailJS Public Key.
3. Add your EmailJS Service ID.
4. Add one Universal Template ID.
5. Save Delivery Setup.

Recommended EmailJS template variables:

```txt
{{to_email}}
{{to_name}}
{{subject}}
{{message}}
{{business_name}}
{{business_logo}}
{{business_banner}}
{{booking_date}}
{{booking_time}}
{{running_late_minutes}}
```

The app sends confirmation, waitlist, running-late, review, and test emails through that template. Optional per-email template IDs can be added later if you upgrade beyond the free EmailJS template limit.

## Structure

- `src/App.jsx` - main workspace state and page orchestration
- `src/components/` - extracted reusable app components
- `src/data/` - theme and font libraries
- `src/utils/` - dates and theme/color helpers
- `src/services/` - Firebase setup and exports
- `legacy/index.single-file.html` - preserved pre-migration single-file version
