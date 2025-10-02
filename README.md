# Rental Platform (WohnmobilTraum)

A comprehensive rental platform for motorhomes, caravans, and vans, built with modern web technologies.

## Overview

This project consists of a full-stack web application with separate frontend and backend components, designed for renting recreational vehicles. The platform supports user authentication, vehicle management, booking systems, payment processing, and administrative features.

## Architecture

- **Frontend**: React application with Vite, Tailwind CSS, and modern UI components
- **Backend**: Node.js/Express API with MongoDB, JWT authentication, and comprehensive security
- **Database**: MongoDB with Mongoose ODM
- **Payments**: Stripe and PayPal integration
- **File Storage**: Cloudinary for image uploads
- **Email**: SendGrid for notifications

## Features

### User Features

- User registration and authentication
- Password reset and email verification
- Vehicle search and filtering
- Detailed vehicle listings with images
- Booking system with date selection
- Payment processing
- User dashboard and profile management

### Agent Features

- Vehicle management (add, edit, delete)
- Booking management
- Earnings tracking
- Profile management

### Admin Features

- User management
- Vehicle oversight
- Booking administration
- System analytics
- Platform settings

## Tech Stack

### Frontend

- React 19
- Vite (build tool)
- React Router DOM
- Tailwind CSS
- Flowbite React
- Axios
- Formik + Yup
- React Hot Toast

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Stripe + PayPal
- Cloudinary
- SendGrid
- Security middleware (Helmet, CORS, rate limiting)

### DevOps

- ESLint
- Jest (testing)
- GitHub Actions (CI/CD)

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/cubek-de/rental-platform.git
   cd rental-platform
   ```

2. Setup Backend:

   ```bash
   cd api
   npm install
   # Create .env file (see api/README.md)
   npm run dev
   ```

3. Setup Frontend (in new terminal):

   ```bash
   cd frontend
   npm install
   # Create .env file (see frontend/README.md)
   npm run dev
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5005

## Project Structure

```
rental-platform/
├── api/                    # Backend API
│   ├── controllers/        # Route handlers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utilities
│   ├── tests/             # Test files
│   └── server.js          # Main server
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   └── utils/         # Utilities
│   └── public/            # Static assets
├── .gitignore             # Root gitignore
└── README.md              # This file
```

## Environment Setup

### Backend (.env)

```
NODE_ENV=development
PORT=5005
MONGO_URI=mongodb://localhost:27017/rental-platform
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
# Add other secrets...
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5005
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Available Scripts

### API

- `npm start` - Production server
- `npm run dev` - Development server
- `npm test` - Run tests
- `npm run lint` - Lint code

### Frontend

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Lint code

## API Documentation

The API endpoints are documented in `api/README.md`. Key endpoints include:

- Authentication: `/api/auth/*`
- Vehicles: `/api/vehicles/*`
- Bookings: `/api/bookings/*`
- Payments: `/api/payments/*`
- Admin: `/api/admin/*`
- Agent: `/api/agent/*`

## Deployment

### Backend

- Deploy to services like Heroku, Railway, or VPS
- Set production environment variables
- Configure MongoDB Atlas for database

### Frontend

- Build with `npm run build`
- Deploy to Netlify, Vercel, or any static hosting
- Configure environment variables for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper commits
4. Ensure tests pass and code is linted
5. Submit a pull request

## Security

- All sensitive data is stored in environment variables
- Input validation and sanitization implemented
- Rate limiting and security headers
- JWT tokens for authentication
- HTTPS required in production

## License

ISC License

## Support

For questions or issues, please create an issue in the repository.
