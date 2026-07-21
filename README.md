# IT Asset Tracker

## Overview
IT Asset Tracker is a full-stack application for managing IT assets with role-based access control, protected API routes, a React-based UI, and SAP BTP deployment readiness. The project supports both local development and an SAP-oriented deployment path.

## Included capabilities
- React + Vite frontend with protected routes and role-based navigation
- Express backend with MVC-style structure, validation, and middleware
- Authentication and authorization flow for admin, asset manager, and user roles
- PostgreSQL schema definitions with mock fallback support for local development
- SAP BTP app router and manifest files for cloud deployment
- Regression tests for core backend behavior

## Verified local status
The current workspace was verified with fresh checks:
- Backend tests: 6/6 passed
- Frontend build: production build completed successfully

## Local development
1. Install Node.js and npm.
2. Copy the environment templates:
   - Server/.env.example -> Server/.env
   - Client/.env.example -> Client/.env
3. Install dependencies:
   - cd Server && npm install
   - cd ../Client && npm install
4. Start the backend:
   - cd Server && npm run dev
5. Start the frontend:
   - cd Client && npm run dev
6. Open the frontend URL shown by Vite and sign in with the seeded demo credentials:
   - admin / admin123
   - manager / manager123
   - employee / employee123

## SAP BTP deployment guidance
1. Build the frontend with the correct backend URL:
   - cd Client && VITE_API_URL=https://it-asset-tracker-api.cfapps.us10-003.hana.ondemand.com npm run build
2. Deploy the backend using the manifest in Server/manifest.yml.
3. Deploy the frontend using the manifest in Client/manifest.yml.
4. Deploy the application router using AppRouter/manifest.yml.
5. Configure the following environment variables in BTP:
   - JWT_SECRET
   - AUTH_MODE=xsuaa
   - DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD or bind a PostgreSQL service
6. Ensure the XSUAA service is bound to the backend and approuter for real SAP authentication.

## Copy-paste SAP BTP deployment checklist
Run the following commands from the project root after replacing the placeholders with your BTP values.

```bash
# 1) Log in and target your BTP org/space
cf login -a https://api.cf.<region>.hana.ondemand.com --sso
cf target -o <your-org> -s <your-space>

# 2) Create the XSUAA service instance
cf create-service xsuaa application it-asset-tracker-xsuaa -c '{"xsappname":"it-asset-tracker-approuter","tenant-mode":"shared"}'

# 3) Build the frontend with the backend URL you will use in production
cd Client
npm install
VITE_API_URL=https://it-asset-tracker-api.cfapps.us10-003.hana.ondemand.com npm run build

# 4) Deploy the backend
cd ../Server
cf push -f manifest.yml

# 5) Deploy the frontend
cd ../Client
cf push -f manifest.yml

# 6) Deploy the application router
cd ../AppRouter
npm install
cf push -f manifest.yml

# 7) Bind XSUAA to the deployed applications
cf bind-service it-asset-tracker-api it-asset-tracker-xsuaa
cf bind-service it-asset-tracker-approuter it-asset-tracker-xsuaa

# 8) Set backend environment variables
cf set-env it-asset-tracker-api JWT_SECRET <strong-secret>
cf set-env it-asset-tracker-api AUTH_MODE xsuaa
cf set-env it-asset-tracker-api NODE_ENV production
cf restage it-asset-tracker-api

# 9) Optional: bind a PostgreSQL service if you want the cloud database path enabled
cf bind-service it-asset-tracker-api <your-postgres-service>
cf restage it-asset-tracker-api
```

After the apps are running, open the approuter URL and verify that login, role-based navigation, and API access all work correctly.

## Current project maturity
- Core app functionality: complete
- Local verification: complete
- SAP deployment readiness: prepared, but the final live deployment still requires your BTP environment details and service bindings

## What is still needed from your side
To complete the live SAP BTP deployment, I need:
- Your BTP subaccount/org/space details
- The XSUAA service instance name or binding information
- The PostgreSQL service instance name (if you want the cloud database path enabled)
- The target URL for the deployed backend and approuter
