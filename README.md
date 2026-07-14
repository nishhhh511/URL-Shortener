# 🚀 LinkPilot - Production URL Shortener

LinkPilot is a production-ready full-stack SaaS-style URL shortener built with React, Express.js, Prisma ORM, PostgreSQL (Neon), JWT authentication, QR code generation, Swagger API documentation, and Docker. It allows users to securely create, manage, and analyze shortened URLs through a modern responsive dashboard.

## 🌐 Live Demo

**Frontend:**  
https://url-shortener-rose-tau.vercel.app

**Backend API:**  
https://urlshortener-pzs7.onrender.com

**Swagger Documentation:**  
https://urlshortener-pzs7.onrender.com/api-docs

---

## ✨ Features

- User registration and login with JWT authentication
- Protected dashboard with persistent login sessions
- Create, search, sort, copy, paginate, and delete short URLs
- Public redirect endpoint with click tracking
- QR code generation for every short URL
- Analytics dashboard with Chart.js visualization
- Responsive SaaS dashboard UI
- Loading states and empty states
- Swagger API documentation
- Secure backend with Helmet, Rate Limiting, Compression, Morgan Logging, Validation and CORS
- Docker-ready backend deployment
- Production deployment using Render, Vercel and Neon

---

## 📸 Screenshots

> Add screenshots after deployment.

- `screenshots/login.png`
- `screenshots/dashboard.png`
- `screenshots/analytics.png`
- `screenshots/swagger.png`

---

## 🛠 Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- React Hot Toast
- React Icons
- Chart.js

### Backend

- Node.js
- Express.js 5
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication
- bcrypt
- Swagger UI
- Helmet
- Express Rate Limit
- Compression
- Morgan

---

## 🏗 Architecture

```text
                React + Vite
             (Vercel Frontend)
                     │
                     │ Axios + JWT
                     ▼
            Express REST API
           (Render Backend)
                     │
                Prisma ORM
                     │
                     ▼
          Neon PostgreSQL Database
```

---

## 📂 Folder Structure

```text
URL-Shortener/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── styles/
│   └── vercel.json
│
├── render.yaml
├── README.md
└── LICENSE
```

---

## ⚙️ Installation

Clone the repository and install dependencies.

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create environment files.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Run Prisma migrations.

```bash
cd backend

npx prisma migrate deploy

npx prisma generate
```

Start the backend.

```bash
npm run dev
```

Start the frontend.

```bash
cd ../frontend

npm run dev
```

---

## 🔑 Environment Variables

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

---

## 📚 API Documentation

### Production

https://urlshortener-pzs7.onrender.com/api-docs

### Local

```text
http://localhost:5000/api-docs
```

### Main API Groups

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/profile`
- `POST /api/url/shorten`
- `GET /api/url/my-urls`
- `GET /api/url/search`
- `GET /api/url/analytics/:id`
- `GET /api/url/qr/:id`
- `PUT /api/url/:id`
- `DELETE /api/url/:id`
- `GET /:shortCode`

---

## ☁️ Deployment

### Frontend — Vercel

1. Import the `frontend` folder as the Vercel project root.
2. Add:

```env
VITE_API_BASE_URL=https://urlshortener-pzs7.onrender.com/api
```

3. Deploy.

`frontend/vercel.json` handles SPA refresh routes.

---

### Backend — Render

Create a Render Web Service from the `backend` folder.

Environment Variables

```env
NODE_ENV=production
DATABASE_URL=<your_neon_database_url>
JWT_SECRET=<your_secret>
JWT_EXPIRES_IN=7d
BASE_URL=https://urlshortener-pzs7.onrender.com
FRONTEND_URL=https://url-shortener-rose-tau.vercel.app
```

Build Command

```bash
npm ci && npx prisma generate
```

Start Command

```bash
npx prisma migrate deploy && npm start
```

---

### Database — Neon

- Create a PostgreSQL database.
- Copy the connection string into `DATABASE_URL`.
- Keep `sslmode=require`.
- Run Prisma migrations during deployment.

---

### Docker

Build the backend image.

```bash
cd backend

docker build -t linkpilot-api .
```

Run the container.

```bash
docker run -p 5000:5000 --env-file .env linkpilot-api
```

---

## 🚀 Future Improvements

- Daily click history analytics
- Custom aliases from the dashboard
- Link expiry controls
- User profile management
- Team workspaces
- Google OAuth Authentication
- CI/CD using GitHub Actions
- Automated backend testing with Supertest
- Custom domains
- Redis caching

---

## 📄 License

This project is licensed under the MIT License.

See the [LICENSE](LICENSE) file for details.
