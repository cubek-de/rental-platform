# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WohnmobilTraum is a full-stack rental platform for motorhomes, caravans, and vans. The application uses a monorepo structure with separate frontend and backend directories.

**Key Technologies:**
- **Backend**: Node.js/Express with MongoDB (Mongoose ODM)
- **Frontend**: React 19 with Vite, React Router v7, Tailwind CSS
- **Real-time**: Socket.io for notifications
- **Payments**: Stripe and PayPal integration
- **File Storage**: Cloudinary for images
- **Email**: SendGrid/Nodemailer

## Development Commands

### Backend (API)

```bash
cd api
npm install              # Install dependencies
npm run dev             # Development server with nodemon (port 5005)
npm start               # Production server
npm test                # Run Jest tests
npm run test:watch      # Watch mode for tests
npm run lint            # Lint code
npm run lint:fix        # Auto-fix linting issues
npm run seed            # Seed database with test data
```

### Frontend

```bash
cd frontend
npm install              # Install dependencies
npm run dev             # Development server (port 5173)
npm run dev:force       # Kill port 5173 process and start
npm run build           # Production build
npm run preview         # Preview production build
npm run lint            # Lint code
```

### Important Ports

- **Frontend**: Always port 5173 (configured in vite.config.js with strictPort: true)
- **Backend**: Port 5005 (default, configurable via PORT env var)

If port 5173 is in use, use `npm run dev:force` to kill the existing process.

## Architecture Overview

### Backend Structure

The API follows a standard MVC pattern with additional layers:

**Models** (`api/models/`):
- `User.model.js` - Three role types: user, agent, admin with granular permissions
- `Vehicle.model.js` - Complex vehicle schema with categories (Wohnmobil, Wohnwagen, Kastenwagen), technical data, equipment, pricing
- `Booking.model.js` - Booking lifecycle with status transitions, payment integration, driver info
- `Notification.model.js` - Real-time notifications system
- `Review.model.js` - Review and rating system

**Controllers** (`api/controllers/`):
- Handle business logic and validation
- Return standardized responses
- Key controllers: auth, vehicle, booking, payment, agent, admin, notification

**Routes** (`api/routes/`):
- RESTful API design
- Protected routes using auth middleware
- Role-based access control (RBAC)

**Middleware** (`api/middleware/`):
- `auth.middleware.js` - JWT authentication, role verification
- `upload.middleware.js` - Cloudinary integration for image uploads

**Utils** (`api/utils/`):
- `sendEmail.js` - Email sending utilities
- `generatePDF.js` / `invoiceGenerator.js` - PDF generation for invoices

**Server Configuration** (`api/server.js`):
- Comprehensive security middleware (helmet, cors, rate limiting, xss-clean, hpp, mongo-sanitize)
- Environment validation using Joi
- Swagger API documentation
- Socket.io integration for real-time features
- MongoDB connection with error handling

### Frontend Structure

**Context Providers** (`frontend/src/context/`):
- `AuthContext.jsx` - Global authentication state, token management, user loading
- `SocketContext.jsx` - Real-time notifications via Socket.io

**Pages** (`frontend/src/pages/`):
- Organized by role: `/user`, `/agent`, `/admin` subdirectories
- Landing pages, vehicle listings, booking flow, dashboards
- Authentication pages (login, register, email verification, password reset)

**Services** (`frontend/src/services/`):
- API abstraction layer with axios
- Centralized API configuration and error handling

**Component Organization**:
- Reusable components in `src/components/`
- Role-specific components: `admin/`, `agent/`, `booking/`
- Shared UI components and layouts

### Key Data Flow Patterns

**Authentication Flow**:
1. User logs in → JWT token stored in localStorage
2. Token attached to all axios requests via interceptor
3. AuthContext manages global user state
4. Protected routes check auth state

**Booking Flow**:
1. User selects vehicle and dates
2. Availability check via API
3. Guest/driver information collection
4. Payment processing (Stripe/PayPal)
5. Booking confirmation with PDF invoice
6. Real-time notification to agent via Socket.io

**Agent/Admin Workflows**:
- Agents: Manage their own vehicles, view bookings, track earnings
- Admins: Full platform oversight, user management, analytics
- Permission-based access control using `permissions` object on User model

### Environment Variables

**Required Backend (.env)**:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend URL (http://localhost:5173 in dev)
- `CLOUDINARY_*` - Cloud storage credentials
- `STRIPE_SECRET_KEY` - Payment processing
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` - Alternative payment
- `SENDGRID_API_KEY` - Email notifications

**Required Frontend (.env)**:
- `VITE_API_URL` - Backend API URL (http://localhost:5005 in dev)
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe client-side key

See `.env.example` files in both directories for complete configuration.

## Testing Strategy

- Backend uses Jest for unit and integration tests
- Tests located in `api/tests/`
- Run single test: `cd api && npx jest path/to/test.js`

## Database

- MongoDB with Mongoose ODM
- Schema validation at model level
- Indexes on frequently queried fields (e.g., booking dates, user roles)
- Virtual fields and methods on models
- Pre-save hooks for password hashing, slug generation

## Security Considerations

- JWT-based authentication with bearer tokens
- Password hashing with bcryptjs
- Input validation with express-validator and Joi
- XSS protection with xss-clean
- MongoDB injection protection with mongo-sanitize
- Rate limiting on all routes
- CORS configured for frontend origin only
- Helmet security headers
- Environment validation on startup (server.js:86)

## Important Notes

- User roles: 'user', 'agent', 'admin' (case-sensitive)
- Vehicle categories: 'Wohnmobil', 'Wohnwagen', 'Kastenwagen' (German)
- All error messages and UI text are in German
- Socket.io namespace: default ('/') with rooms per user
- Image uploads handled via Cloudinary multer middleware
- Payment webhooks configured for Stripe
- Booking statuses: pending, confirmed, cancelled, completed, refunded
- Vehicle approval workflow: agents create vehicles → admin approves
