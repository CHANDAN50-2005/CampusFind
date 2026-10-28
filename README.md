# CampusFind

CampusFind is a full-stack campus lost and found application built with React, Vite, Express, and MongoDB.

## Requirements

- Node.js 22.12 or newer
- npm
- MongoDB Community Server locally or MongoDB Atlas
- A replica set is recommended for atomic multi-document claim approval

## Setup

1. Copy .env.example to .env in the project root.
2. Set MONGODB_URI to your local MongoDB URI or Atlas connection string.
3. Generate a strong JWT secret (at least 32 bytes) and set JWT_SECRET. For example:
   node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
4. Install dependencies with npm install.
5. Start the API and web client with npm run dev.
6. Open the Vite URL shown in the terminal.

The server connects to MongoDB before it listens. The Vite dev server proxies API and uploaded-image requests to Express.

## Create an administrator

1. Register a normal CampusFind account.
2. In MongoDB Compass or mongosh, change that account's role using a trusted admin connection:

    use campusfind
    db.users.updateOne(
      { email: "admin@your-campus.edu" },
      { $set: { role: "admin" } }
    )

Public registration always creates a student account. Do not expose database credentials in the client or commit them to Git.

## Features

- Cookie-based JWT authentication with bcrypt password hashing and role checks.
- Lost and found reports with validation, owner-only updates, closure, filters, text search, pagination, and local image uploads.
- Image uploads are limited to 5 MB and JPG, PNG, or WebP. The server checks file signatures and stores files under server/uploads/; this directory is ignored by Git.
- Weighted lost/found suggestions use normalized name, description, category, location, and date similarity. Matches are suggestions, not proof of ownership.
- Ownership claims with private claimant details, owner/admin review, notifications, and a return workflow.
- Database-backed notifications scoped to the signed-in user.
- MongoDB aggregation statistics, category counts, report/recovery trends, and recent reports.
- Compound, owner, category, claim, notification, text, and match uniqueness indexes.
- Admin report moderation, claim overview, and query-plan execution statistics at /api/admin/query-plans.

Claim approval uses a MongoDB transaction when the server supports transactions (replica set or Atlas). A standalone local MongoDB instance falls back to ordered writes with compensating updates so the demo can complete; use a replica set/Atlas when you need transaction-level atomicity.

## API overview

- POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me
- GET/POST /api/items, GET/PATCH/DELETE /api/items/:id, GET /api/items/my
- GET /api/matches, PATCH /api/matches/:id/status
- POST /api/claims, GET /api/claims/my, GET /api/claims/:id, PATCH /api/claims/:id/status
- GET /api/notifications, PATCH /api/notifications/:id/read
- GET /api/dashboard/stats
- Admin: GET /api/admin/items, PATCH /api/admin/items/:id/status, GET /api/admin/claims, GET /api/admin/query-plans

## Project layout

- client/ — React application and UI
- server/ — Express API, Mongoose models, and local media storage
- .env.example — placeholder environment configuration


ok its working i can see a admin area at the end.. again once go along with the project cross check the project and match them the outcomes with the expected outcomes and make sure all thigs are protected ike databases authentication and check for the user endpoints too and when the user inputs he pictures of the lost or the found items report should appear with the image if the user inputs the image