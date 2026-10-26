# CampusFind

CampusFind is a campus lost and found application built with React, Vite, Express, and MongoDB.

## Requirements

- Node.js 22.12 or newer (Vite 8 requires a supported modern Node release)
- npm
- MongoDB locally, or a MongoDB Atlas connection string

## Setup

1. Copy `.env.example` to `.env` in the project root.
2. Set `MONGODB_URI` to your local MongoDB URI or Atlas connection string. Replace `JWT_SECRET` with a long random value before authentication is added.
3. Install dependencies with `npm install`.
4. Start the API and Vite development server with `npm run dev`.
5. Open the Vite URL printed by its development server. The API health endpoint is `http://127.0.0.1:5000/api/health`.

The API connects to MongoDB before listening. Startup fails with a clear message if the database is unavailable or the connection string is invalid. The Vite development server proxies `/api` requests to the API.

## Current implementation

- React/Vite client scaffold with Tailwind CSS and the agreed UI libraries.
- Express API scaffold with security headers, restricted JSON body size, CORS, and authentication-route rate limiting.
- Mongoose connection bootstrap and a health endpoint.
- No authentication, report persistence, claims, matches, or dashboard analytics are implemented yet. Those will be added in later project stages and use real database data.

## Project layout

```text
client/  React application
server/  Express API and MongoDB connection
.env.example  placeholder environment configuration
```
