# ClubHub Server

REST API backend for ClubHub - Student club management system.

## Tech Stack

- **Express 5** - Web framework
- **Prisma** - Modern ORM with PostgreSQL
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google APIs** - Google Workspace integration
- **Nodemailer** - Email service
- **Helmet** - Security headers
- **Express Rate Limit** - API rate limiting

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Getting Started

### Installation
```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/clubhub"

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### Development
```bash
npm run dev
```

Server runs at `http://localhost:3000`

### Production
```bash
npm start
```

## API Endpoints

- `/api/auth` - Authentication (login, register, refresh token)
- `/api/users` - User management
- `/api/activities` - Activity/event management

## Database Schema

View and manage database schema:
```bash
# Open Prisma Studio
npx prisma studio

# View current schema
npx prisma db pull
```

## Security Features

- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Cookie-based authentication
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication

## License

Private