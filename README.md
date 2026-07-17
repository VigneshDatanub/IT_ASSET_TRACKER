# IT Asset Tracker

## Overview
IT Asset Tracker is a production-oriented full stack application for managing IT assets, with role-based access, protected API routes, and a React-based user interface. The implementation is structured for future SAP BTP deployment while also supporting a mock-based local runtime for rapid development.

## Architecture
- Client: React + Vite + React Router + Axios
- Server: Node.js + Express + JWT auth + validation middleware
- Data layer: PostgreSQL schema with a mock repository fallback for local development

## Completed work
- Enterprise folder structure for client and server
- REST API routes for authentication, assets, categories, and maintenance
- Backend models, controllers, services, and middleware
- Mock-mode runtime for local development without PostgreSQL
- Role-based authorization flow for admin, manager, and employee users
- React app shell with protected routes and role-aware navigation
- CRUD workflows for assets and categories
- Regression tests for authentication and CRUD behavior

## Local development
1. Install Node.js and npm.
2. In the Server folder, copy .env.example to .env and adjust the values.
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

## SAP BTP deployment plan
1. Build the frontend with the backend URL configured:
   - cd Client && VITE_API_URL=https://<your-backend-app>.cfapps.<region>.hana.ondemand.com npm run build
2. Deploy the backend to SAP BTP Cloud Foundry using the provided Server/manifest.yml.
3. Deploy the frontend as a static app using Client/manifest.yml.
4. Configure environment variables in BTP for the backend, including JWT_SECRET and the database connection values if PostgreSQL is used.
5. If you want XSUAA-based authentication later, replace the current mock auth flow with the SAP BTP destination and identity service integration.

## Project status
- Backend modules: complete
- Frontend shell and workflows: complete
- Authentication and authorization: complete
- Deployment preparation: scaffolded for SAP BTP Cloud Foundry
