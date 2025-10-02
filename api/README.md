# Rental Platform API

Backend API for the WohnmobilTraum rental platform, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization (JWT)
- Vehicle management
- Booking system
- Payment processing (Stripe, PayPal)
- Admin and agent dashboards
- Email notifications
- File uploads (Cloudinary)
- Security middleware (helmet, rate limiting, sanitization)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Payments**: Stripe, PayPal
- **File Storage**: Cloudinary
- **Email**: SendGrid, Nodemailer
- **Validation**: Joi, Express Validator
- **Security**: Helmet, CORS, HPP, XSS protection
- **Testing**: Jest
- **Linting**: ESLint

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the api directory: `cd api`
3. Install dependencies: `npm install`
4. Copy the environment file: `cp .env.example .env`
5. Fill in your actual values in `.env`
6. Start the development server: `npm run dev`

### Environment Variables

Create a `.env` file in the root of the api directory with the following variables:

```
NODE_ENV=development
PORT=5005
MONGO_URI=mongodb://localhost:27017/rental-platform
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
SENDGRID_API_KEY=your-sendgrid-key
STRIPE_SECRET_KEY=your-stripe-key
PAYPAL_CLIENT_ID=your-paypal-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
```

### Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm run seed`: Seed the database
- `npm test`: Run tests
- `npm run test:watch`: Run tests in watch mode
- `npm run lint`: Lint code
- `npm run lint:fix`: Fix linting issues

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Vehicles

- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create vehicle (agent/admin)
- `GET /api/vehicles/:id` - Get vehicle by ID
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Bookings

- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking

### Payments

- `POST /api/payments/create-session` - Create Stripe session
- `POST /api/payments/webhook` - Stripe webhook

### Admin

- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - Manage users

### Agent

- `GET /api/agent/dashboard` - Agent dashboard
- `GET /api/agent/vehicles` - Agent's vehicles

## Project Structure

```
api/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── seeders/         # Database seeders
├── templates/       # Email templates
├── tests/           # Test files
├── utils/           # Utility functions
├── server.js        # Main server file
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Lint code: `npm run lint`
6. Commit your changes
7. Push to the branch
8. Create a Pull Request

## License

ISC
