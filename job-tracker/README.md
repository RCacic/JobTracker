# Job Application Tracker

A full-stack web app for tracking job applications during your job hunt. Built with React, Node.js/Express, and MySQL.

![Job Tracker](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MySQL-4A9EFF)

## Features

- **Application Table** — log and manage every job application with status, source, notes and dates
- **Drag & Drop Pipeline** — Kanban board to move applications through stages visually
- **Analytics Dashboard** — conversion funnel, status breakdown, and source performance charts
- **AI Cover Letter Generator** — paste a job description, get a tailored cover letter via Claude AI
- **Activity Timeline** — per-application history log of every stage change
- **JWT Authentication** — secure login and registration

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, CSS-in-JS |
| Backend | Node.js, Express |
| Database | MySQL |
| Auth | JWT (jsonwebtoken), bcryptjs |
| AI | Anthropic Claude API |
| Deploy | Vercel (frontend), Render (backend), PlanetScale (DB) |

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/job-tracker.git
cd job-tracker
```

### 2. Set up the database
```bash
mysql -u root -p < database/schema.sql
```

### 3. Configure the server
```bash
cd server
cp .env.example .env
# Edit .env with your DB credentials and JWT secret
npm install
npm run dev
```

### 4. Start the frontend
```bash
cd ../client
npm install
npm start
```

App runs at `http://localhost:3000`, API at `http://localhost:5000`.

## Deployment

### Frontend → Vercel
1. Push repo to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Set root directory to `client`
4. Add env variable: `REACT_APP_API_URL=https://your-render-url.onrender.com/api`

### Backend → Render
1. Create a new Web Service at [render.com](https://render.com)
2. Set root directory to `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all env variables from `.env.example`

### Database → PlanetScale (free tier)
1. Create database at [planetscale.com](https://planetscale.com)
2. Run `schema.sql` via their console
3. Update `DB_HOST`, `DB_USER`, `DB_PASSWORD` in Render env vars

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/jobs` | Get all jobs (auth required) |
| POST | `/api/jobs` | Create job (auth required) |
| PUT | `/api/jobs/:id` | Update job (auth required) |
| PATCH | `/api/jobs/:id/status` | Update status only |
| DELETE | `/api/jobs/:id` | Delete job (auth required) |

## Author

Ryan Cacic — [LinkedIn](https://www.linkedin.com/in/ryan-cacic26147829a/) — [GitHub](https://github.com/RCacic)
