# ERC-4337 Bundler Test Results

A standalone, modern web page displaying ERC-4337 bundler test results. This is a simplified version of the original bundlers page, designed to be hosted on GitHub Pages.

## Features

- **Modern Design**: Clean, responsive interface using Tailwind CSS
- **Dark/Light Theme**: Toggle between dark and light modes with persistent preference
- **Mobile Responsive**: Optimized for all screen sizes with horizontal scrolling for tables
- **Version Selection**: Switch between bundler versions (0.6, 0.7, 0.8)
- **Real-time Data**: Fetches test results from the official ERC-4337 test results API
- **No Dependencies**: Pure HTML, CSS, and JavaScript - no build process required

## Files

- `index.html` - Main HTML file with the page structure and styling
- `script.js` - JavaScript logic for data fetching, processing, and rendering
- `README.md` - This file

## Hosting on GitHub Pages

### Option 1: Direct Repository Hosting

1. Create a new GitHub repository
2. Upload the `index.html` and `script.js` files to the repository
3. Go to repository Settings → Pages
4. Select "Deploy from a branch" and choose the main branch
5. Your site will be available at `https://[username].github.io/[repository-name]`

### Option 2: GitHub Gist (Alternative)

1. Create a new GitHub Gist
2. Add `index.html` as the main file
3. The Gist will be available at `https://gist.github.com/[username]/[gist-id]`
4. You can also use services like [Gist.io](https://gist.io) to create a more polished view

## Running Locally

You can view the site locally in two ways:

### Option 1: Open Directly
- Double-click `index.html` or open it in your browser.
- **Note:** Some browsers may block API requests due to CORS when using the `file://` protocol.

### Option 2: Use a Simple Local Server (Recommended)
- Run a local server in your project directory:
  - **Python 3:**
    ```sh
    python3 -m http.server 8000
    ```
    Then open [http://localhost:8000](http://localhost:8000) in your browser.
  - **Node.js (http-server):**
    ```sh
    npx http-server .
    ```
- This ensures all features (like fetching remote JSON) work as expected.

## Data Source

The page fetches test results from:
- Base URL: `https://bundler-test-results.erc4337.io/`
- Versions: v06, v07, v08 (default)
- Endpoint: `/v{version}/history/history.json`

## Customization

### Changing the Back Link

Update the "Back to Documentation" link in `index.html`:

```html
<a href="YOUR_GITBOOK_URL" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
    ← Back to Documentation
</a>
```

### Modifying Colors and Styling

The page uses Tailwind CSS classes. You can customize the appearance by:
1. Modifying the CSS variables in the `<style>` section of `index.html`
2. Changing Tailwind classes throughout the HTML
3. Adding custom CSS rules

### Adding New Features

The JavaScript is modular and well-commented. Key functions:
- `loadTestResults()` - Fetches and processes data
- `renderTables()` - Renders both data tables
- `initializeTheme()` - Sets up dark/light mode
- `initializeVersionSelector()` - Handles version switching

## Browser Compatibility

- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## Performance

- Lightweight: ~50KB total (including Tailwind CSS)
- Fast loading: No build process or dependencies
- Efficient: Minimal DOM manipulation
- Responsive: Optimized for mobile devices

## License

This project is part of the ERC-4337 ecosystem. Please refer to the original project for licensing information.
