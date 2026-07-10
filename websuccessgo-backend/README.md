# WebSuccessGo Backend API

Professional backend API for WebSuccessGo web development marketplace.

## Features

- 🔐 JWT Authentication with Refresh Tokens
- 👥 Role-based Authorization (Admin, Manager, Developer, Customer)
- 💳 Razorpay Payment Integration
- 📦 Order Management System
- 📄 PDF Invoice Generation
- ☁️ Cloudinary File Upload Support
- 🔒 Security Best Practices
- 📝 Input Validation
- 📊 Logging System
- 🚀 Production Ready

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT
- Razorpay
- Cloudinary
- PDFKit
- Winston Logger
- Joi Validation

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd websuccessgo-backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
- Set a strong JWT_SECRET (minimum 32 characters)
- Configure MongoDB connection URL
- Add Razorpay credentials for payment processing
- Add Cloudinary credentials for file uploads (optional)

4. Start the server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `POST /api/users/refresh-token` - Refresh access token
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password

### Templates
- `GET /api/templates` - Get all templates (with pagination & filters)
- `GET /api/templates/:id` - Get single template
- `POST /api/templates` - Create template (Admin/Manager)
- `PATCH /api/templates/:id` - Update template (Admin/Manager)
- `DELETE /api/templates/:id` - Delete template (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/mine` - Get user's orders (with pagination)
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/files` - Upload files for order

### Payments
- `POST /api/payments/create` - Create Razorpay payment
- `POST /api/payments/verify` - Verify payment signature
- `POST /api/payments/webhook` - Razorpay webhook handler

### Customer Dashboard
- `GET /api/customer/dashboard` - Get customer statistics

### Admin
- `GET /api/admin/dashboard` - Get admin statistics
- `GET /api/admin/orders` - Get all orders (with filters)
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/orders/:id/status` - Update project status
- `PATCH /api/admin/orders/:id/developer` - Assign developer
- `POST /api/admin/orders/:id/invoice` - Generate invoice

## Security Features

- JWT token authentication with 24-hour expiry
- Refresh tokens for extended sessions
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100-200 requests per 15 minutes)
- Helmet security headers
- CORS configuration
- Input validation with Joi
- Role-based access control
- Secure file upload validation
- Environment variable validation at startup

## Validation Rules

### Registration
- Name: 2-50 characters
- Email: Valid email format
- Password: Minimum 8 characters, must contain uppercase, lowercase, and number
- Phone: Valid 10-digit Indian mobile number (optional)

### Order Creation
- Template ID: Valid MongoDB ObjectID
- Package: Basic, Standard, Premium, or Enterprise
- Amount: Positive number, max 1,000,000

## Logging

Logs are stored in:
- `server.log` - All logs
- `server-error.log` - Error logs only

Console logs in development mode for easier debugging.

## File Uploads

Supported file types:
- Images: JPEG, JPG, PNG, WEBP
- Documents: PDF, DOC, DOCX

Storage options:
- **Cloudinary**: If credentials configured (recommended for production)
- **Local Storage**: Fallback option (uploads/ directory)

Max file size: 10MB
Max files per request: 5

## Environment Variables

### Required
- `PORT` - Server port (default: 5000)
- `MONGO_URL` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars recommended)
- `FRONTEND_URL` - Frontend URL for CORS

### Optional
- `RAZORPAY_KEY` - Razorpay Key ID
- `RAZORPAY_SECRET` - Razorpay Key Secret
- `RAZORPAY_WEBHOOK_SECRET` - Razorpay Webhook Secret
- `CLOUD_NAME` - Cloudinary cloud name
- `CLOUD_KEY` - Cloudinary API key
- `CLOUD_SECRET` - Cloudinary API secret
- `NODE_ENV` - Environment (development/production)

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET
3. Configure MongoDB Atlas
4. Set up Cloudinary for file storage
5. Configure Razorpay with production keys
6. Set proper CORS origins
7. Use process manager (PM2 recommended)
8. Set up SSL/HTTPS
9. Configure firewall rules
10. Enable monitoring and logging

## Error Handling

The API uses consistent error responses:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation message"
    }
  ]
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 204: No Content (Delete success)
- 400: Bad Request (Validation error)
- 401: Unauthorized (Auth required)
- 403: Forbidden (Insufficient permissions)
- 404: Not Found
- 409: Conflict (Duplicate entry)
- 429: Too Many Requests (Rate limit)
- 500: Internal Server Error

## License

Private - All Rights Reserved
