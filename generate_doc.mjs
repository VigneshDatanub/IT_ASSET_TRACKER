import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  PageBreak,
  ImageRun,
} from 'docx';
import { writeFileSync } from 'fs';

// ─── Colour palette ───────────────────────────────────────────────
const BLUE       = '1E3A8A'; // heading deep-blue
const LIGHT_BLUE = 'DBEAFE'; // table header background
const GRAY       = '6B7280'; // body text secondary
const WHITE      = 'FFFFFF';
const DARK       = '111827';

// ─── Helper builders ──────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    run: { bold: true, color: BLUE, size: 36 },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 120 },
    run: { bold: true, color: BLUE, size: 28 },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    run: { bold: true, color: BLUE, size: 24 },
  });
}

function body(text, { bold = false, italic = false, color = DARK, size = 22 } = {}) {
  return new Paragraph({
    children: [new TextRun({ text, bold, italic, color, size })],
    spacing: { after: 100 },
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    children: [new TextRun({ text, size: 22, color: DARK })],
    spacing: { after: 60 },
  });
}

function labelValue(label, value) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22, color: DARK }),
      new TextRun({ text: value, size: 22, color: GRAY }),
    ],
    spacing: { after: 80 },
  });
}

function spacer() {
  return new Paragraph({ text: '', spacing: { after: 120 } });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function codeBlock(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Courier New', size: 18, color: '1F2937' })],
    shading: { type: ShadingType.SOLID, color: 'F3F4F6' },
    spacing: { after: 100, before: 60 },
    indent: { left: 360 },
  });
}

function placeholderBox(label) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: 'E5E7EB' },
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `[ SCREENSHOT PLACEHOLDER: ${label} ]`,
                    bold: true,
                    color: '6B7280',
                    size: 22,
                    italics: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '(Paste screenshot here)',
                    color: '9CA3AF',
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function tableFromData(headers, rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h) =>
        new TableCell({
          shading: { type: ShadingType.SOLID, color: LIGHT_BLUE },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: h, bold: true, size: 20, color: BLUE })],
            }),
          ],
        })
    ),
  });

  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: String(cell), size: 20, color: DARK })],
                }),
              ],
            })
        ),
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// ══════════════════════════════════════════════════════════════════
//  DOCUMENT CONTENT
// ══════════════════════════════════════════════════════════════════

const doc = new Document({
  creator: 'IT Asset Tracker',
  title: 'IT Asset Tracker – Technical Documentation',
  description: 'Comprehensive technical and functional documentation',
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 22 },
      },
    },
  },
  sections: [
    {
      children: [
        // ─── COVER PAGE ────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 1200, after: 400 },
          children: [
            new TextRun({
              text: 'IT ASSET TRACKER',
              bold: true,
              size: 56,
              color: BLUE,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: 'AssetSphere — Comprehensive Technical & Functional Documentation',
              size: 28,
              color: GRAY,
              italics: true,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: 'Version 1.0  |  July 2026', size: 22, color: GRAY })],
        }),
        spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: 'Prepared for: Internal Review', size: 22, color: GRAY })],
        }),
        pageBreak(),

        // ─── TABLE OF CONTENTS (manual) ────────────────────────────
        h1('Table of Contents'),
        body('1.  Project Overview'),
        body('2.  Technology Stack'),
        body('3.  System Architecture'),
        body('4.  Project Structure'),
        body('5.  Authentication & Authorisation'),
        body('6.  Database Design'),
        body('7.  Backend API – Modules & Endpoints'),
        body('8.  Frontend – Pages & Screens'),
        body('9.  Role-Based Access Control (RBAC)'),
        body('10. Application Flow Walkthrough'),
        body('11. SAP BTP Deployment'),
        body('12. Environment Variables'),
        body('13. Testing'),
        body('14. Demo Credentials'),
        body('15. Screenshots'),
        pageBreak(),

        // ─── 1. PROJECT OVERVIEW ───────────────────────────────────
        h1('1. Project Overview'),
        body(
          'IT Asset Tracker (branded as "AssetSphere") is a full-stack enterprise web application designed to centralise the lifecycle management of all IT hardware and software assets within an organisation. It supports real-time inventory tracking, role-based access control, asset assignment, and service history recording.'
        ),
        spacer(),
        body('Key capabilities:', { bold: true }),
        bullet('Maintain a complete, searchable inventory of IT assets (laptops, monitors, peripherals, software licences, etc.)'),
        bullet('Assign assets to employees and track who holds what equipment at any point in time'),
        bullet('Log and review maintenance / service records for each asset'),
        bullet('Manage asset categories to organise the inventory'),
        bullet('Role-based dashboards tailored to Admin, Asset Manager, and User personas'),
        bullet('Dual authentication support: local JWT (development/mock mode) and SAP XSUAA (production / BTP mode)'),
        bullet('Ready for cloud deployment on SAP Business Technology Platform (BTP) via Cloud Foundry'),
        spacer(),
        labelValue('Application Name', 'AssetSphere / IT Asset Tracker'),
        labelValue('Development Type', 'Full-stack Web Application'),
        labelValue('Backend Tests', '6 / 6 passed'),
        labelValue('Build Status', 'Production build completed successfully'),
        pageBreak(),

        // ─── 2. TECHNOLOGY STACK ───────────────────────────────────
        h1('2. Technology Stack'),
        h2('2.1 Frontend'),
        tableFromData(
          ['Technology', 'Version', 'Purpose'],
          [
            ['React', '18.3.1', 'UI component library'],
            ['Vite', '7.x', 'Build tool & dev server'],
            ['React Router DOM', '6.21.1', 'Client-side routing & protected routes'],
            ['Axios', '1.7.3', 'HTTP client for API calls'],
            ['Vanilla CSS', 'Custom', 'Styling & responsive layout (styles.css)'],
          ]
        ),
        spacer(),
        h2('2.2 Backend'),
        tableFromData(
          ['Technology', 'Version', 'Purpose'],
          [
            ['Node.js', '18+ (ESM)', 'JavaScript runtime'],
            ['Express.js', '4.21.2', 'REST API framework'],
            ['jsonwebtoken', '9.0.2', 'JWT creation & verification'],
            ['bcryptjs', '2.4.3', 'Password hashing'],
            ['@sap/xssec', '4.13.3', 'SAP XSUAA token validation'],
            ['pg (node-postgres)', '8.5.0', 'PostgreSQL client'],
            ['express-validator', '7.0.1', 'Request input validation'],
            ['helmet', '8.1.1', 'HTTP security headers'],
            ['cors', '2.8.5', 'Cross-Origin Resource Sharing'],
            ['morgan', '1.10.1', 'HTTP request logging'],
            ['dotenv', '16.4.1', 'Environment variable management'],
            ['nodemon', '3.1.1', 'Dev auto-restart'],
          ]
        ),
        spacer(),
        h2('2.3 Database'),
        tableFromData(
          ['Technology', 'Purpose'],
          [
            ['PostgreSQL', 'Primary relational database (production)'],
            ['In-memory Mock Repository', 'Local development / mock mode (no DB required)'],
          ]
        ),
        spacer(),
        h2('2.4 Cloud & Infrastructure'),
        tableFromData(
          ['Technology', 'Purpose'],
          [
            ['SAP Business Technology Platform (BTP)', 'Cloud deployment target'],
            ['Cloud Foundry (CF)', 'Container orchestration & app push'],
            ['SAP XSUAA', 'Enterprise identity & OAuth 2.0 authorisation server'],
            ['SAP Application Router (@sap/approuter)', 'Central entry point & route dispatcher'],
          ]
        ),
        pageBreak(),

        // ─── 3. SYSTEM ARCHITECTURE ────────────────────────────────
        h1('3. System Architecture'),
        body(
          'The application follows a classic three-tier web architecture with an additional SAP Application Router layer when deployed to BTP.'
        ),
        spacer(),
        h2('3.1 Architecture Overview'),
        tableFromData(
          ['Layer', 'Component', 'Responsibility'],
          [
            ['Presentation', 'React (Vite SPA)', 'User interface, routing, role-based views'],
            ['API Gateway', 'SAP App Router (BTP only)', 'Route proxy, XSUAA authentication enforcement'],
            ['Application', 'Express.js REST API', 'Business logic, validation, JWT/XSUAA auth'],
            ['Data', 'PostgreSQL', 'Persistent storage of assets, users, maintenance records'],
          ]
        ),
        spacer(),
        h2('3.2 Request Flow (Production – SAP BTP)'),
        body('Browser → App Router → XSUAA Token Validation → Express API → PostgreSQL → Response', { italic: true }),
        spacer(),
        h2('3.3 Request Flow (Local / Mock Mode)'),
        body('Browser → React Dev Server → Express API (JWT) → Mock Repository (in-memory) → Response', { italic: true }),
        pageBreak(),

        // ─── 4. PROJECT STRUCTURE ──────────────────────────────────
        h1('4. Project Structure'),
        h2('4.1 Top-level'),
        codeBlock('IT_ASSET_TRACKER/'),
        codeBlock('├── Client/          # React + Vite frontend'),
        codeBlock('├── Server/          # Express.js REST API'),
        codeBlock('├── AppRouter/       # SAP Application Router (BTP gateway)'),
        codeBlock('└── README.md'),
        spacer(),
        h2('4.2 Client (Frontend)'),
        codeBlock('Client/src/'),
        codeBlock('├── main.jsx               # React root mount'),
        codeBlock('├── App.jsx                # Root component with Router'),
        codeBlock('├── styles.css             # Global CSS design system'),
        codeBlock('├── context/'),
        codeBlock('│   └── AuthContext.jsx    # Auth state (login/logout/user)'),
        codeBlock('├── routes/'),
        codeBlock('│   └── AppRoutes.jsx      # Route definitions & guards'),
        codeBlock('├── layouts/'),
        codeBlock('│   └── MainLayout.jsx     # Sidebar + topbar shell'),
        codeBlock('├── pages/'),
        codeBlock('│   ├── LoginPage.jsx'),
        codeBlock('│   ├── DashboardPage.jsx'),
        codeBlock('│   ├── AssetsPage.jsx'),
        codeBlock('│   ├── MyAssetsPage.jsx'),
        codeBlock('│   ├── CategoriesPage.jsx'),
        codeBlock('│   └── MaintenancePage.jsx'),
        codeBlock('└── components/'),
        codeBlock('    ├── AssetForm.jsx'),
        codeBlock('    └── CategoryForm.jsx'),
        spacer(),
        h2('4.3 Server (Backend)'),
        codeBlock('Server/src/'),
        codeBlock('├── server.js              # Startup, DB init, port binding'),
        codeBlock('├── app.js                 # Express app, middleware, route mounting'),
        codeBlock('├── config/env.js          # Environment variable loader'),
        codeBlock('├── routes/'),
        codeBlock('│   ├── authRoutes.js'),
        codeBlock('│   ├── assetRoutes.js'),
        codeBlock('│   ├── categoryRoutes.js'),
        codeBlock('│   ├── maintenanceRoutes.js'),
        codeBlock('│   └── healthRoutes.js'),
        codeBlock('├── controllers/           # Request handlers'),
        codeBlock('├── models/                # DB query functions'),
        codeBlock('├── services/              # Business logic (assetService)'),
        codeBlock('├── middleware/'),
        codeBlock('│   ├── authMiddleware.js  # JWT + XSUAA token verification'),
        codeBlock('│   ├── authorizeMiddleware.js # Permission checks'),
        codeBlock('│   ├── validateMiddleware.js  # express-validator error handler'),
        codeBlock('│   └── errorHandler.js'),
        codeBlock('├── db/'),
        codeBlock('│   ├── schema.sql         # Table definitions'),
        codeBlock('│   ├── seed.js            # Demo data seeding'),
        codeBlock('│   ├── init.js            # Schema initialisation'),
        codeBlock('│   ├── pool.js            # pg connection pool'),
        codeBlock('│   ├── mockData.js        # In-memory seed data'),
        codeBlock('│   └── mockRepository.js  # In-memory DB operations'),
        codeBlock('└── utils/'),
        codeBlock('    ├── permissions.js     # RBAC permission matrix'),
        codeBlock('    └── asyncHandler.js    # Async error wrapper'),
        pageBreak(),

        // ─── 5. AUTHENTICATION & AUTHORISATION ────────────────────
        h1('5. Authentication & Authorisation'),
        h2('5.1 Dual Authentication Modes'),
        body(
          'The backend supports two authentication strategies, selected via the AUTH_MODE environment variable:'
        ),
        tableFromData(
          ['Mode', 'AUTH_MODE value', 'When to use', 'Token type'],
          [
            ['Mock / JWT', 'mock', 'Local development, testing', 'HS256 JWT (8 h expiry)'],
            ['SAP XSUAA', 'xsuaa', 'SAP BTP production deployment', 'OAuth 2.0 Bearer token issued by XSUAA'],
          ]
        ),
        spacer(),
        h2('5.2 JWT Login Flow (Mock Mode)'),
        bullet('User submits username + password via the Login page'),
        bullet('POST /auth/login → authController.login()'),
        bullet('bcryptjs verifies the password hash from the DB (or mock store)'),
        bullet('jsonwebtoken signs a token with { sub, username, role } and 8 h expiry'),
        bullet('Token stored in localStorage under the key "it-asset-token"'),
        bullet('All subsequent API calls send Authorization: Bearer <token> header'),
        bullet('authMiddleware.js decodes & verifies the token on every protected request'),
        spacer(),
        h2('5.3 XSUAA Flow (Production)'),
        bullet('User is redirected to the SAP Identity Provider via the App Router'),
        bullet('XSUAA issues an OAuth Bearer token after successful login'),
        bullet('App Router forwards the token in the Authorization header to the Express API'),
        bullet('@sap/xssec creates a SecurityContext and extracts scopes & user details'),
        bullet('Role is derived from token scopes (administrator → admin, assetmanager → asset_manager)'),
        bullet('If the user does not exist locally, a shadow record is auto-created in PostgreSQL'),
        pageBreak(),

        // ─── 6. DATABASE DESIGN ────────────────────────────────────
        h1('6. Database Design'),
        h2('6.1 Entity Relationship Summary'),
        body('The PostgreSQL database consists of four core tables:'),
        tableFromData(
          ['Table', 'Description', 'Primary Key'],
          [
            ['users', 'Application users with roles', 'id (SERIAL)'],
            ['categories', 'Asset classification groups', 'id (SERIAL)'],
            ['assets', 'Physical/virtual IT assets', 'id (SERIAL)'],
            ['maintenance_history', 'Service records for assets', 'id (SERIAL)'],
          ]
        ),
        spacer(),
        h2('6.2 Table: users'),
        tableFromData(
          ['Column', 'Type', 'Constraints', 'Description'],
          [
            ['id', 'SERIAL', 'PRIMARY KEY', 'Auto-increment identifier'],
            ['username', 'VARCHAR(100)', 'NOT NULL, UNIQUE', 'Login username'],
            ['email', 'VARCHAR(255)', 'NOT NULL, UNIQUE', 'Email address'],
            ['password_hash', 'VARCHAR(255)', 'NOT NULL', 'bcrypt hashed password'],
            ['role', 'VARCHAR(50)', "DEFAULT 'user'", 'user | asset_manager | admin'],
            ['is_active', 'BOOLEAN', 'DEFAULT TRUE', 'Account status'],
            ['created_at', 'TIMESTAMPTZ', 'DEFAULT NOW()', 'Record creation time'],
            ['updated_at', 'TIMESTAMPTZ', 'DEFAULT NOW()', 'Last update time'],
          ]
        ),
        spacer(),
        h2('6.3 Table: categories'),
        tableFromData(
          ['Column', 'Type', 'Description'],
          [
            ['id', 'SERIAL', 'Primary key'],
            ['name', 'VARCHAR(100) UNIQUE', 'Category name (e.g. Laptop, Monitor)'],
            ['description', 'TEXT', 'Optional description'],
            ['is_active', 'BOOLEAN', 'Soft-delete flag'],
          ]
        ),
        spacer(),
        h2('6.4 Table: assets'),
        tableFromData(
          ['Column', 'Type', 'Description'],
          [
            ['id', 'SERIAL', 'Primary key'],
            ['asset_id', 'VARCHAR(50) UNIQUE', 'Business asset serial / tag number'],
            ['name', 'VARCHAR(200)', 'Human-readable asset name'],
            ['description', 'TEXT', 'Optional notes'],
            ['category_id', 'INT → categories.id', 'FK to categories'],
            ['purchase_date', 'DATE', 'Date of acquisition'],
            ['purchase_cost', 'NUMERIC(12,2)', 'Purchase price'],
            ['status', 'VARCHAR(50)', 'Available | Assigned | Maintenance | Lost | Damaged | Retired | Disposed'],
            ['assigned_to', 'INT → users.id', 'FK to the assigned user (nullable)'],
            ['location', 'VARCHAR(200)', 'Physical location of the asset'],
          ]
        ),
        spacer(),
        h2('6.5 Table: maintenance_history'),
        tableFromData(
          ['Column', 'Type', 'Description'],
          [
            ['id', 'SERIAL', 'Primary key'],
            ['asset_id', 'INT → assets.id', 'FK to asset'],
            ['performed_by', 'INT → users.id', 'User who logged the maintenance'],
            ['maintenance_type', 'VARCHAR(100)', 'Type of service (e.g. Screen Replacement)'],
            ['description', 'TEXT', 'Details of work performed'],
            ['cost', 'NUMERIC(12,2)', 'Repair cost'],
            ['technician', 'VARCHAR(200)', 'Technician name or service vendor'],
            ['completion_date', 'DATE', 'Date the service was completed'],
            ['remarks', 'TEXT', 'Additional notes or final remarks'],
            ['performed_at', 'TIMESTAMPTZ', 'Timestamp of log entry'],
          ]
        ),
        spacer(),
        h2('6.6 Indexes'),
        bullet('idx_assets_status — speeds up status-based filtering'),
        bullet('idx_assets_category_id — speeds up category join'),
        bullet('idx_assets_assigned_to — speeds up user-based asset lookup'),
        bullet('idx_maintenance_asset_id — speeds up maintenance history by asset'),
        pageBreak(),

        // ─── 7. BACKEND API ────────────────────────────────────────
        h1('7. Backend API – Modules & Endpoints'),
        h2('7.1 API Base URL'),
        body('Development: http://localhost:4000'),
        body('Production (BTP): https://it-asset-tracker-api.cfapps.<region>.hana.ondemand.com'),
        spacer(),
        h2('7.2 Authentication Endpoints (/auth)'),
        tableFromData(
          ['Method', 'Endpoint', 'Access', 'Description'],
          [
            ['POST', '/auth/login', 'Public (mock mode only)', 'Authenticate user, return JWT'],
            ['POST', '/auth/register', 'Public (mock mode only)', 'Register new user (role: user)'],
            ['GET', '/auth/me', 'Authenticated', 'Return currently authenticated user'],
            ['GET', '/auth/users', 'asset_manager, admin', 'List all users (for assignment dropdown)'],
          ]
        ),
        spacer(),
        h2('7.3 Asset Endpoints (/assets)'),
        tableFromData(
          ['Method', 'Endpoint', 'Permission', 'Description'],
          [
            ['GET', '/assets', 'view_assets', 'List all assets; supports ?status=, ?categoryId=, ?search= filters'],
            ['GET', '/assets/:id', 'view_assets', 'Get a single asset by database ID'],
            ['POST', '/assets', 'create_asset', 'Register a new asset'],
            ['PUT', '/assets/:id', 'edit_asset', 'Update asset details or status'],
            ['DELETE', '/assets/:id', 'edit_asset', 'Delete an asset record'],
            ['POST', '/assets/:id/assign', 'assign_asset', 'Assign asset to a user'],
            ['GET', '/assets/me/assets', 'view_my_assets', 'Get assets assigned to the current user'],
          ]
        ),
        spacer(),
        h2('7.4 Category Endpoints (/categories)'),
        tableFromData(
          ['Method', 'Endpoint', 'Permission', 'Description'],
          [
            ['GET', '/categories', 'view_assets', 'List all categories'],
            ['GET', '/categories/:id', 'view_assets', 'Get a single category'],
            ['POST', '/categories', 'manage_categories', 'Create a new category (Admin)'],
            ['PUT', '/categories/:id', 'manage_categories', 'Update a category (Admin)'],
            ['DELETE', '/categories/:id', 'manage_categories', 'Delete a category (Admin)'],
          ]
        ),
        spacer(),
        h2('7.5 Maintenance Endpoints (/maintenance)'),
        tableFromData(
          ['Method', 'Endpoint', 'Permission', 'Description'],
          [
            ['GET', '/maintenance', 'view_assets', 'List all maintenance records'],
            ['POST', '/maintenance', 'add_maintenance', 'Log a new maintenance event'],
          ]
        ),
        spacer(),
        h2('7.6 Health Endpoint'),
        tableFromData(
          ['Method', 'Endpoint', 'Description'],
          [['GET', '/health', 'Returns 200 OK with status message — used for liveness probes on BTP']]
        ),
        spacer(),
        h2('7.7 Standard Response Format'),
        codeBlock('{ "success": true,  "data": <payload> }          // Success'),
        codeBlock('{ "success": false, "message": "<error text>" }   // Error'),
        pageBreak(),

        // ─── 8. FRONTEND – PAGES & SCREENS ────────────────────────
        h1('8. Frontend – Pages & Screens'),
        h2('8.1 Login Page (/login)'),
        body('The entry point of the application, accessible without authentication.'),
        spacer(),
        body('Features:', { bold: true }),
        bullet('Split-panel layout: branding/feature banner on the left, form card on the right'),
        bullet('Toggle between Sign In and Register modes'),
        bullet('Animated floating icons (💻 🔒 📦 📊) in the banner panel'),
        bullet('Demo credential hints shown in mock mode'),
        bullet('Loading spinner on form submission'),
        bullet('Error display on invalid credentials'),
        spacer(),
        placeholderBox('Login Page – Sign In View'),
        spacer(),
        placeholderBox('Login Page – Register View'),
        spacer(),

        h2('8.2 Dashboard Page (/)'),
        body('The home screen after login, personalised by the user\'s role.'),
        spacer(),
        body('Admin view includes:', { bold: true }),
        bullet('KPI cards: Total Assets, Available Inventory, Total Capital Cost, In Maintenance'),
        bullet('Trend sparkline graphs on each KPI card'),
        spacer(),
        body('Asset Manager view includes:', { bold: true }),
        bullet('KPI cards: Serials Tracked, Assigned Units (with utilisation %), Pending Service'),
        spacer(),
        body('User view includes:', { bold: true }),
        bullet('My Assigned Assets status, Platform Security status'),
        spacer(),
        body('Shared sections (all roles):', { bold: true }),
        bullet('Asset Status Allocation panel with animated progress bars (Available / Assigned / In Service / Retired)'),
        bullet('Recently Registered Serials table with Asset ID, Name, Category, Cost, Status, Location'),
        spacer(),
        placeholderBox('Dashboard Page – Admin View'),
        spacer(),
        placeholderBox('Dashboard Page – Asset Manager View'),
        spacer(),
        placeholderBox('Dashboard Page – User View'),
        spacer(),

        h2('8.3 Assets Page (/assets)'),
        body('Full asset inventory listing with inline CRUD and workflow actions.'),
        spacer(),
        body('Features:', { bold: true }),
        bullet('Search bar (filters by Asset ID, Name, Description, Location)'),
        bullet('Status dropdown filter (All / Available / Assigned / Maintenance / Lost / Damaged / Retired / Disposed)'),
        bullet('Asset cards showing: Asset ID badge, Name, Description, Category, Assigned To, Location, Purchase Cost, Status badge'),
        bullet('Register Asset button (Admin / Asset Manager only)'),
        bullet('Edit button → opens AssetForm modal'),
        bullet('Assign button (Available assets only) → opens Assign Modal with user dropdown'),
        bullet('Unassign button (Assigned assets) → sets status back to Available'),
        bullet('Service button → opens Maintenance Log Modal'),
        bullet('Delete button with confirmation prompt'),
        spacer(),
        placeholderBox('Assets Page – Asset Grid View'),
        spacer(),
        placeholderBox('Assets Page – Register / Edit Asset Form'),
        spacer(),
        placeholderBox('Assets Page – Assign Asset Modal'),
        spacer(),
        placeholderBox('Assets Page – Log Maintenance Modal'),
        spacer(),

        h2('8.4 My Assets Page (/my-assets)'),
        body('Displays only the assets currently assigned to the logged-in user. Available to all roles.'),
        spacer(),
        placeholderBox('My Assets Page'),
        spacer(),

        h2('8.5 Categories Page (/categories)  —  Admin Only'),
        body('Manage the taxonomy of asset types used throughout the system.'),
        spacer(),
        body('Features:', { bold: true }),
        bullet('Grid of category cards showing: Name, Description, Active/Inactive status badge'),
        bullet('Inline Edit and Delete buttons per card'),
        bullet('CategoryForm component for creating or editing a category'),
        spacer(),
        placeholderBox('Categories Page'),
        spacer(),

        h2('8.6 Maintenance Records Page (/maintenance)  —  Admin & Asset Manager'),
        body('View a log of all maintenance events across all assets.'),
        spacer(),
        body('Features:', { bold: true }),
        bullet('Cards per maintenance record: Asset ID, Maintenance Type, Performed By, Service Date, Completion Date, Cost, Technician/Vendor, Description, Remarks'),
        bullet('Computed status badge: "Completed" (if completion_date ≤ today) or "In Service"'),
        spacer(),
        placeholderBox('Maintenance Records Page'),
        pageBreak(),

        // ─── 9. RBAC ──────────────────────────────────────────────
        h1('9. Role-Based Access Control (RBAC)'),
        h2('9.1 Roles'),
        tableFromData(
          ['Role', 'Description', 'Hierarchy Level'],
          [
            ['user', 'Standard employee – can view assets and see their own assignments', '1 (lowest)'],
            ['asset_manager', 'IT staff – can manage assets, assign, and log maintenance', '2'],
            ['admin', 'Full system access including categories and all management functions', '3 (highest)'],
          ]
        ),
        spacer(),
        h2('9.2 Permission Matrix'),
        tableFromData(
          ['Permission', 'user', 'asset_manager', 'admin'],
          [
            ['view_assets', '✔', '✔', '✔'],
            ['filter_assets', '✔', '✔', '✔'],
            ['view_my_assets', '✔', '✔', '✔'],
            ['create_asset', '✘', '✔', '✔'],
            ['edit_asset', '✘', '✔', '✔'],
            ['assign_asset', '✘', '✔', '✔'],
            ['change_asset_status', '✘', '✔', '✔'],
            ['add_maintenance', '✘', '✔', '✔'],
            ['manage_categories', '✘', '✘', '✔'],
            ['system_configuration', '✘', '✘', '✔'],
          ]
        ),
        spacer(),
        h2('9.3 Route-Level Guards'),
        tableFromData(
          ['Route', 'Allowed Roles'],
          [
            ['/login', 'Public (unauthenticated)'],
            ['/ (Dashboard)', 'All authenticated users'],
            ['/assets', 'user, asset_manager, admin'],
            ['/my-assets', 'user, asset_manager, admin'],
            ['/categories', 'admin only'],
            ['/maintenance', 'asset_manager, admin'],
          ]
        ),
        pageBreak(),

        // ─── 10. APPLICATION FLOW ─────────────────────────────────
        h1('10. Application Flow Walkthrough'),
        h2('10.1 User Authentication Flow'),
        body('Step 1:', { bold: true }),
        body('  User navigates to the application URL. React Router checks AuthContext; no token found → redirect to /login.'),
        spacer(),
        body('Step 2:', { bold: true }),
        body('  User enters credentials and submits the form.'),
        spacer(),
        body('Step 3:', { bold: true }),
        body('  POST /auth/login → server verifies password hash → signs JWT → returns token + user object.'),
        spacer(),
        body('Step 4:', { bold: true }),
        body('  AuthContext.login() stores the token in localStorage, sets user state → React Router redirects to /.'),
        spacer(),
        body('Step 5:', { bold: true }),
        body('  DashboardPage loads; calls GET /assets with Authorization header → renders role-personalised KPI view.'),
        spacer(),

        h2('10.2 Asset Registration Flow (Asset Manager / Admin)'),
        bullet('Navigate to /assets → click "Register Asset"'),
        bullet('AssetForm modal opens with fields: Asset ID, Name, Description, Category, Purchase Date, Cost, Status, Assigned To, Location'),
        bullet('On submit: POST /assets (with validation) → asset saved → grid refreshes'),
        spacer(),

        h2('10.3 Asset Assignment Flow'),
        bullet('On the Assets page, locate an asset with status = Available'),
        bullet('Click "Assign" → Assign Asset modal opens with a dropdown of all users'),
        bullet('Select a user → "Confirm Assignment" → POST /assets/:id/assign { user_id }'),
        bullet('Server calls assetService.assignAsset() which updates status to Assigned and sets assigned_to'),
        bullet('Asset card updates immediately after the grid reloads'),
        spacer(),

        h2('10.4 Maintenance Logging Flow'),
        bullet('On the Assets page, click "Service" on an asset not already retired/in-maintenance'),
        bullet('Maintenance modal opens: Service Type, Description, Cost, Technician, Completion Date, Remarks'),
        bullet('On submit: POST /maintenance → record stored in maintenance_history table'),
        bullet('Navigate to /maintenance to view the full service log'),
        spacer(),

        h2('10.5 Category Management Flow (Admin only)'),
        bullet('Navigate to /categories'),
        bullet('Existing categories displayed as cards'),
        bullet('Create: CategoryForm at the bottom of the page → POST /categories'),
        bullet('Edit: click Edit on a card → form pre-fills → PUT /categories/:id'),
        bullet('Delete: click Delete → DELETE /categories/:id (blocked if assets reference this category)'),
        pageBreak(),

        // ─── 11. SAP BTP DEPLOYMENT ───────────────────────────────
        h1('11. SAP BTP Deployment'),
        h2('11.1 Components Deployed'),
        tableFromData(
          ['Component', 'CF App Name', 'Manifest'],
          [
            ['Express API', 'it-asset-tracker-api', 'Server/manifest.yml'],
            ['React Frontend', 'it-asset-tracker-client', 'Client/manifest.yml'],
            ['Application Router', 'it-asset-tracker-approuter', 'AppRouter/manifest.yml'],
          ]
        ),
        spacer(),
        h2('11.2 AppRouter Routing Rules (xs-app.json)'),
        tableFromData(
          ['Source Pattern', 'Target / LocalDir', 'Auth Type', 'Purpose'],
          [
            ['^/api/(.*)$', 'backend (Express)', 'xsuaa', 'Proxy API calls to Express backend'],
            ['^/assets/(.*)$', 'public/', 'xsuaa', 'Serve static assets (images, icons)'],
            ['^/(.*)$', 'public/index.html', 'xsuaa', 'SPA fallback – all routes serve index.html'],
          ]
        ),
        spacer(),
        h2('11.3 Deployment Steps (Summary)'),
        bullet('1. cf login and target your BTP org/space'),
        bullet('2. Create XSUAA service instance: cf create-service xsuaa application it-asset-tracker-xsuaa'),
        bullet('3. Build the frontend with the production backend URL (VITE_API_URL)'),
        bullet('4. cf push the Express API, React client, and AppRouter using their respective manifest.yml files'),
        bullet('5. Bind the XSUAA service to the API and the AppRouter'),
        bullet('6. Set environment variables: JWT_SECRET, AUTH_MODE=xsuaa, NODE_ENV=production'),
        bullet('7. Optionally bind a PostgreSQL service instance for cloud database'),
        bullet('8. cf restage the API'),
        bullet('9. Access the application via the AppRouter URL and verify login and RBAC'),
        pageBreak(),

        // ─── 12. ENVIRONMENT VARIABLES ────────────────────────────
        h1('12. Environment Variables'),
        h2('12.1 Server (.env)'),
        tableFromData(
          ['Variable', 'Default / Example', 'Description'],
          [
            ['PORT', '4000', 'Port the Express server listens on'],
            ['NODE_ENV', 'development', 'Environment (development / production)'],
            ['AUTH_MODE', 'mock', 'Authentication mode: mock or xsuaa'],
            ['JWT_SECRET', '<strong-random-string>', 'Secret used to sign/verify JWTs'],
            ['DB_HOST', 'localhost', 'PostgreSQL host'],
            ['DB_PORT', '5432', 'PostgreSQL port'],
            ['DB_NAME', 'it_asset_tracker', 'Database name'],
            ['DB_USER', 'postgres', 'Database user'],
            ['DB_PASSWORD', '<password>', 'Database password'],
            ['VCAP_SERVICES', '(auto-injected by BTP)', 'SAP service bindings in JSON (XSUAA, PostgreSQL)'],
          ]
        ),
        spacer(),
        h2('12.2 Client (.env)'),
        tableFromData(
          ['Variable', 'Example', 'Description'],
          [
            ['VITE_API_URL', 'http://localhost:4000', 'Base URL for API calls (dev: direct, prod: /api via approuter)'],
          ]
        ),
        pageBreak(),

        // ─── 13. TESTING ──────────────────────────────────────────
        h1('13. Testing'),
        h2('13.1 Backend Tests'),
        body('Framework: Node.js built-in test runner (node:test)'),
        body('Test command: npm test (from Server/)'),
        body('Results: 6 / 6 tests passing'),
        spacer(),
        h2('13.2 Test Coverage Areas'),
        bullet('Health endpoint returns 200 OK'),
        bullet('Asset listing returns success payload'),
        bullet('Authentication: valid credentials return token'),
        bullet('Authentication: invalid credentials return 401'),
        bullet('Protected endpoint rejected without token'),
        bullet('Asset creation validation (missing required fields returns 400)'),
        spacer(),
        h2('13.3 Frontend Build Verification'),
        body('Command: npm run build (from Client/)'),
        body('Result: Vite production build completed successfully — dist/ directory generated.'),
        pageBreak(),

        // ─── 14. DEMO CREDENTIALS ─────────────────────────────────
        h1('14. Demo Credentials (Mock / Development Mode)'),
        tableFromData(
          ['Username', 'Password', 'Role', 'Access Level'],
          [
            ['admin', 'Admin123!', 'admin', 'Full access – all pages, all CRUD operations'],
            ['manager', 'Manager123!', 'asset_manager', 'Asset & maintenance management, no categories'],
            ['user', 'User123!', 'user', 'View assets, view own assigned assets only'],
          ]
        ),
        spacer(),
        body(
          'Note: These credentials are seeded automatically by Server/src/db/seed.js when the server starts in mock mode. Do not use these in production.',
          { italic: true, color: GRAY }
        ),
        pageBreak(),

        // ─── 15. SCREENSHOTS ──────────────────────────────────────
        h1('15. Screenshots'),
        body('Paste application screenshots in the placeholders below. Use Windows Snipping Tool (Win+Shift+S) or the browser DevTools to capture each screen at 1280×800 or higher resolution.'),
        spacer(),

        h2('15.1 Login Page'),
        placeholderBox('Login Page – Full Screen'),
        spacer(),

        h2('15.2 Dashboard – Admin'),
        placeholderBox('Dashboard Page – Admin (KPI Cards + Status Panel + Recent Assets Table)'),
        spacer(),

        h2('15.3 Dashboard – Asset Manager'),
        placeholderBox('Dashboard Page – Asset Manager View'),
        spacer(),

        h2('15.4 Dashboard – User'),
        placeholderBox('Dashboard Page – Standard User View'),
        spacer(),

        h2('15.5 Assets Page'),
        placeholderBox('Assets Page – Grid View (Status Badges Visible)'),
        spacer(),

        h2('15.6 Register / Edit Asset Form'),
        placeholderBox('Assets Page – Register Asset Form Modal'),
        spacer(),

        h2('15.7 Assign Asset Modal'),
        placeholderBox('Assets Page – Assign Asset to User Modal'),
        spacer(),

        h2('15.8 Log Maintenance Modal'),
        placeholderBox('Assets Page – Log Maintenance / Service Modal'),
        spacer(),

        h2('15.9 My Assets Page'),
        placeholderBox('My Assets Page – Current User Assignment'),
        spacer(),

        h2('15.10 Categories Page'),
        placeholderBox('Categories Page – Admin View with Category Cards'),
        spacer(),

        h2('15.11 Maintenance Records Page'),
        placeholderBox('Maintenance Records Page – Service Log Cards'),
        spacer(),

        // ─── END ──────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 800 },
          children: [
            new TextRun({
              text: '— End of Document —',
              italics: true,
              color: GRAY,
              size: 20,
            }),
          ],
        }),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync('IT_Asset_Tracker_Documentation.docx', buffer);
console.log('✅  IT_Asset_Tracker_Documentation.docx generated successfully!');
