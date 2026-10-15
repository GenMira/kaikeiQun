# React + TypeScript + Vite

## Routing

React Router handles client-side routing. `src/main.tsx` wraps the app in
`BrowserRouter`, and `src/App.tsx` defines the routes:

- `/`: the existing home screen (`src/pages/HomePage.tsx`)
- `/create`: product registration and editing, with the form on the left and the list on the right
- `/download`: workbook generation, explicit download, and retry on failure
- `*`: a 404 screen with a link back home (`src/pages/NotFoundPage.tsx`)

To add a page, create its component in `src/pages` and add a `Route` in
`src/App.tsx`. Use `Link` or `NavLink` from `react-router` for internal navigation.
The router uses Vite's `BASE_URL` as its basename.

When deploying, configure the hosting server to serve `index.html` for app URLs
so opening or refreshing a nested route works.

`public/_redirects` includes this fallback for hosts that support that file
(such as Netlify and Cloudflare Pages). GitHub Pages does not interpret it:
configure an SPA fallback there, or choose hosting with rewrite support.
For deployment under a subdirectory, set Vite's `base` to the deployed path.

## Product data and downloads

All routes share a header and a project provider. Products and unfinished form
inputs are saved in `sessionStorage` for the current tab, validated on reload,
and retained when returning from the download page. Storage failures display
a warning; the in-memory form remains usable. Reset is an explicit, confirmed
action on the home page.

The create action blocks navigation while a product is still being entered or
edited. The download page uses the existing workbook generator and shares its
pending task across React StrictMode subscriptions. Only the latest product
list is cached; failed tasks can be retried. Blob URLs are released on unmount.
No download starts automatically: users select the save link once ready.

## UI verification

```sh
npm install
npx playwright install chromium
npm run build
npm run lint
npm run test:ui
```

The browser tests cover routing, desktop/mobile layout, add/edit/delete,
unfinished inputs, refresh recovery, storage failures, generation/retry,
StrictMode deduplication, and downloading a workbook with its VBA preserved.
Excel macro execution itself must be verified in desktop Excel separately.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
