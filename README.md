# LinkPilot - Production URL Shortener

LinkPilot is a full-stack SaaS-style URL shortener built with React, Express, Prisma, PostgreSQL, JWT authentication, QR codes, Swagger documentation, and Docker-ready backend deployment.

## Features

- User registration and login with JWT authentication
- Protected dashboard with persisted login
- Create, search, sort, copy, paginate, and delete short URLs
- Public redirect endpoint with click tracking
- QR code generation for every short link
- Professional analytics page with Chart.js visualization
- Responsive SaaS dashboard UI with loading states and empty states
- Swagger API documentation at `/api-docs`
- Production middleware: Helmet, rate limiting, compression, secure CORS, validation, and request logging
- Deployment-ready configuration for Vercel, Render, Neon, and Docker

## Screenshots

Add screenshots after deployment:

- `screenshots/login.png`
- `screenshots/dashboard.png`
- `screenshots/analytics.png`
- `screenshots/swagger.png`

## Tech Stack

**Frontend**

- React 19
- Vite
- React Router
- Axios
- React Hot Toast
- React Icons
- Chart.js

**Backend**

- Node.js
- Express 5
- Prisma ORM
- PostgreSQL / Neon
- JWT
- bcrypt
- Swagger UI
- Helmet
- Express Rate Limit
- Compression
- Morgan

## Architecture

```text
React + Vite frontend
        |
        | Axios with Bearer token
        v
Express REST API
        |
        | Prisma Client
        v
PostgreSQL / Neon
```

## Folder Structure

```text
URL-Shortener/
  backend/
    prisma/
      schema.prisma
      migrations/
    src/
      config/
      controllers/
      middleware/
      routes/
      services/
      utils/
    Dockerfile
  frontend/
    public/
    src/
      api/
      components/
      pages/
      routes/
      styles/
    vercel.json
  render.yaml
  README.md
```

## Installation

Clone the project and install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Run Prisma migrations:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

Start the backend:

```bash
npm run dev
```

Start the frontend:

```bash
cd ../frontend
npm run dev
```

## Environment Variables

### Backend

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

### Frontend

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## API Documentation

Run the backend and open:

```text
http://localhost:5000/api-docs
```

Main API groups:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/profile`
- `POST /api/url/shorten`
- `GET /api/url/my-urls`
- `GET /api/url/search`
- `GET /api/url/analytics/:id`
- `GET /api/url/qr/:id`
- `DELETE /api/url/:id`
- `GET /:shortCode`

## Deployment

### Frontend - Vercel

1. Import the `frontend` folder as the Vercel project root.
2. Add `VITE_API_BASE_URL=https://your-render-service.onrender.com/api`.
3. Deploy. `frontend/vercel.json` handles SPA refresh routes.

### Backend - Render

1. Create a Render Web Service from the `backend` folder, or use `render.yaml`.
2. Add production environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=7d`
   - `BASE_URL=https://your-render-service.onrender.com`
   - `FRONTEND_URL=https://your-vercel-app.vercel.app`
3. Build command: `npm ci && npx prisma generate`
4. Start command: `npx prisma migrate deploy && npm start`

### Database - Neon

1. Create a Neon PostgreSQL database.
2. Copy the pooled or direct connection string into `DATABASE_URL`.
3. Keep `sslmode=require`.
4. Run Prisma migrations during deployment.

### Docker

Build the backend image:

```bash
cd backend
docker build -t linkpilot-api .
```

Run with environment variables:

```bash
docker run -p 5000:5000 --env-file .env linkpilot-api
```

## Future Improvements

- Add per-day click event tracking for richer analytics charts
- Add custom aliases and expiry controls to the frontend form
- Add user profile settings
- Add team/workspace support
- Add automated backend tests with Supertest
- Add CI checks for lint, build, Prisma validation, and Docker build

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

