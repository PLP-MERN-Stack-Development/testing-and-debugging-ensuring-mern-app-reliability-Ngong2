**Project**: Testing and Debugging — Ensuring MERN App Reliability

- **Repo:** `https://github.com/PLP-MERN-Stack-Development/testing-and-debugging-ensuring-mern-app-reliability-Ngong2.git`

**Overview**
- **Purpose:** Example MERN app and a comprehensive test-suite demonstrating unit, integration and end-to-end testing strategies and debugging techniques for a MERN stack project.
- **Included apps:**
  - `client/` — React frontend built with Vite, includes components, unit tests (Vitest/Jest + Testing Library), and Cypress E2E tests.
  - `mern-testing/` — Minimal Node/Express backend used during exercises (controllers, models, routes, tests).
  - `example/` — Supporting example content and legacy files.

**Key Features**
- Component-level unit tests (React Testing Library + Vitest/Jest).
- Integration tests for API endpoints (Supertest + Jest).
- End-to-end tests with Cypress (scenarios demonstrating flows, fixtures, and network error handling).
- CI-friendly test config and Vite test setup.

**Prerequisites**
- Node.js (v18+ recommended, v22 tested in this repo)
- npm (or yarn)
- MongoDB (or use `MONGO_URI` to point to a hosted DB; tests may use in-memory server)

**Quick Setup (first time)**
1. Clone the repo:
   - `git clone https://github.com/PLP-MERN-Stack-Development/testing-and-debugging-ensuring-mern-app-reliability-Ngong2.git`
   - `cd testing-and-debugging-ensuring-mern-app-reliability-Ngong2`

2. Install dependencies (client + server):
   - Client:
```powershell
cd client
npm install
```
   - Server (`mern-testing`):
```powershell
cd ../mern-testing
npm install
```

3. Environment variables
   - Client: `client/src/.env` or project root `client/.env` (Vite uses `import.meta.env`):
     - Example: `VITE_API_URL=http://localhost:5001/api`
   - Server: `mern-testing/.env` (create if not present):
     - `PORT=5001`
     - `MONGO_URI=mongodb://localhost:27017/your-db`
     - `JWT_SECRET=your_jwt_secret`

**Run (development)**
- Start backend server:
```powershell
cd mern-testing
npm run dev
```
- Start frontend dev server:
```powershell
cd ../client
npm run dev
```

Open the client at the port Vite reports (default `http://localhost:5173` unless changed).

**Test commands**
- Unit tests (client): uses `vitest`/`jest` depending on config — run from `client/`:
```powershell
cd client
npm test      # or: npx vitest run
```
- Server tests (integration/unit): run from `mern-testing/`:
```powershell
cd mern-testing
npm test
```
- Cypress E2E tests (client):
```powershell
cd client
npx cypress open   # interactive runner
# or headless
npx cypress run
```

**Linting & Formatting**
- Lint (client): `npm run lint` (see `client/package.json`).

**Folder Structure (high-level)**
- `client/` — React app
  - `src/components/` — React components (Login, Register, TaskForm, TaskList, etc.)
  - `src/services/` — API clients (e.g. `api.js`) used by components
  - `cypress/` — E2E tests, fixtures, support commands
  - `src/tests/` — unit & integration tests
- `mern-testing/` — minimal backend used for integration tests and local dev
  - `src/controllers/`, `src/models/`, `src/routes/`, `src/middleware/`

**Common Issues & Troubleshooting**

- Invalid Hook Call / "Hooks can only be called inside the body of a function component"
  - Symptoms: runtime error in console referencing `resolveDispatcher` or `useRef`.
  - Causes:
    - Duplicate copies of `react` / `react-dom` installed (multiple copies cause separate hook dispatchers).
    - Mismatched `react` and `react-dom` versions.
    - Calling hooks outside components or incorrectly mocking React in tests.
  - Fixes:
    - Ensure a single copy of React: run from `client`:
```powershell
npm ls react react-dom
```
    - Add a Vite alias to force a single copy if you have linked packages:
      - In `client/vite.config.js` add `resolve.alias` mapping:
```js
import path from 'path';
resolve: {
  alias: {
    react: path.resolve(__dirname, 'node_modules', 'react'),
    'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom')
  }
}
```
    - Verify `react-router-dom` is installed (used in `App.jsx`):
```powershell
cd client
npm install react-router-dom
```

- Vite pre-bundling or cache issues
  - If Vite shows dependency-scan or pre-bundling errors, try:
```powershell
# from client
Remove-Item -Recurse -Force node_modules\.vite  # Windows PowerShell
npm run dev
```

- Node backend: "Cannot use import statement outside a module"
  - Cause: `package.json` `type` field mismatches file style.
  - Fix: set `"type": "module"` in `mern-testing/package.json` (if using ES imports) or change server files to CommonJS (`require`) or use `.mjs`.

- Missing server dependencies (e.g. `express`)
  - If server fails with `ERR_MODULE_NOT_FOUND: Cannot find package 'express'`, run:
```powershell
cd mern-testing
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
```

- React / JSX parse errors from stray tokens
  - Look for stray code fences or accidental backticks in CSS or JSX files (e.g. `` `css `` at top of `index.css`) — remove them.

**Debugging tips**
- Check browser console and Vite terminal for stack traces — the Vite client provides a fast feedback loop.
- If the app fails to reload on change, stop and restart `npm run dev` after clearing caches.
- For unit tests, prefer mocking API clients (see `client/src/tests/unit/Login.test.jsx` mocking `authAPI`).

**CI / GitHub Actions (Suggested)**
- A simple job should:
  1. Install dependencies for both `client` and `mern-testing`.
  2. Run linters.
  3. Start the server (or use in-memory DB) and run integration tests.
  4. Run unit tests and report coverage.

**Contributing**
- Fork -> create a feature branch -> open PR -> include tests for new behavior.

**Contact / Authors**
- Maintainers: PLP-MERN-Stack-Development

**License**
- Check repository root for license file (no license explicitly added in this template repository).

---
If you want, I can:
- add a `README.md` to the `client/` and `mern-testing/` folders with more focused developer instructions, or
- scaffold GitHub Actions CI steps for this project.
