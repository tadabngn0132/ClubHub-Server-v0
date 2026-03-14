# ClubHub Server

REST API backend for GDC - Greenwich Dance Crew management system.

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
- npm

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/clubhub"

# JWT
ACCESS_TOKEN_SECRET='your_access_token_secret'
REFRESH_TOKEN_SECRET='your_refresh_token_secret'

# Google App Config (optional)
GMAIL_ADDRESS='your_gmail_address'
GOOGLE_APP_PASSWORD='your_google_app_password'

# Google OAuth (optional)
GOOGLE_CLIENT_ID='your_google_client_id'
GOOGLE_CLIENT_SECRET ='your_google_client_secret'
GOOGLE_REDIRECT_URL='http://localhost:3000/api/auth/google/callback'
GOOGLE_REFRESH_TOKEN='your_google_access_token_secret'
GOOGLE_ACCESS_TOKEN='your_google_refresh_token_secret'

# Frontend URL
CLIENT_URL=http://localhost:5173

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME='your_cloudinary_cloud_name'
CLOUDINARY_API_KEY='your_cloudinary_api_key'
CLOUDINARY_API_SECRET='your_cloudinary_api_secret'

# Session
SESSION_SECRET='your_random_session_secret'

# Gen AI (optional)
GEMINI_API_KEY='your_gemnini_api_key'
BACKUP_GEMINI_API_KEY='your_backup_gemnini_api_key'
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name="test your first migration"

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
- `/api/tasks` - Task management
- `/api/positions` - Position management
- `/api/departments` - Department management
- `/api/notifications` - Notification management

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
