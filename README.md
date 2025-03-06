# Weekly Tracker PWA

A Progressive Web App (PWA) for tracking weekly foods and activities with automatic reset functionality.

## Features

- Track completed items in two categories: Foods and Activities
- Automatic weekly reset every Saturday at 11:59 PM
- Preserve historical data of completed tasks
- Dark/light theme toggle
- Filtering capabilities for tasks
- Counters for Foods, Activities, and Total completions
- Mobile-friendly design with touch optimizations
- Installable on Android devices as a standalone app

## How to Use

### Web Version
1. Open the `index.html` file in your browser
2. Add new items using the input field and category selector
3. Click on items to mark them as completed
4. Use filters to view specific categories or completion status
5. Toggle between light and dark themes with the theme button

### Android Installation
1. Visit the hosted version of the app in Chrome on your Android device
2. Tap the menu button (three dots)
3. Select "Add to Home Screen" or "Install App"
4. The app will be installed on your device like a native app

## Mobile Features

- Vibration feedback when toggling items
- Android back button handling
- Toast notifications
- Responsive design optimized for mobile screens
- Larger touch targets for better usability

## Project Structure

- `index.html` - The main HTML file
- `styles.css` - CSS styles for the application
- `app.js` - JavaScript code that provides the functionality
- `manifest.json` - PWA configuration for installation
- `service-worker.js` - Enables offline functionality
- `icons/` - App icons for various screen sizes

## Technical Details

- Uses localStorage for data persistence
- No server-side components required
- Works offline after initial installation
- Automatic weekly reset mechanism
- Responsive design for all screen sizes
