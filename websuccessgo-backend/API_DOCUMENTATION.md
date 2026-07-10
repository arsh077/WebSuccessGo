# API Documentation - WebSuccessGo

Base URL: `http://localhost:5000` (Development)
Production: `https://api.yourdomain.com`

## Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": {}
}
```

### Error Response
```json
{
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error"
    }
  ]
}
```

## Endpoints

### 1. Authentication & User Management

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "phone": "9876543210"
}
```

**Response (201):**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "customer",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

#### Refresh Token
```http
POST /api/users/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "token": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "customer",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Profile
```http
PATCH /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "9876543211"
}
```

#### Change Password
```http
POST /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "Password@123",
  "newPassword": "NewPassword@123"
}
```

---

### 2. Templates

#### Get All Templates
```http
GET /api/templates?page=1&limit=20&category=ecommerce&minPrice=5000&maxPrice=50000&search=shop
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `search` (optional): Search in title
- `sort` (optional): Sort field (default: -createdAt)

**Response (200):**
```json
{
  "templates": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Modern E-commerce Template",
      "category": "ecommerce",
      "image": "https://example.com/image.jpg",
      "demoLink": "https://demo.example.com",
      "price": 25000,
      "features": ["Responsive", "SEO Optimized", "Fast Loading"],
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### Get Single Template
```http
GET /api/templates/:id
```

#### Create Template (Admin/Manager Only)
```http
POST /api/templates
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Modern Portfolio",
  "category": "portfolio",
  "image": "https://example.com/image.jpg",
  "demoLink": "https://demo.example.com",
  "price": 15000,
  "features": ["Responsive", "Portfolio Gallery", "Contact Form"]
}
```

#### Update Template (Admin/Manager Only)
```http
PATCH /api/templates/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "price": 18000,
  "features": ["Responsive", "Portfolio Gallery", "Contact Form", "Blog"]
}
```

#### Delete Template (Admin Only)
```http
DELETE /api/templates/:id
Authorization: Bearer <admin_token>
```

---

### 3. Orders

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "template": "507f1f77bcf86cd799439011",
  "package": "Premium",
  "amount": 35000,
  "details": {
    "businessName": "My Business",
    "requirements": "Need responsive website with blog"
  }
}
```

**Response (201):**
```json
{
  "message": "Order created successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "orderNumber": "WSG-1705315200000-ABC123DEF",
    "customer": "507f1f77bcf86cd799439011",
    "template": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Modern E-commerce Template",
      "price": 25000
    },
    "package": "Premium",
    "amount": 35000,
    "advancePaid": 0,
    "paymentStatus": "Pending",
    "projectStatus": "Order Received",
    "timeline": [
      {
        "title": "Order Received",
        "description": "Your order has been created successfully.",
        "status": "completed",
        "date": "2024-01-15T10:30:00.000Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get My Orders
```http
GET /api/orders/mine?page=1&limit=10&status=Order%20Received&paymentStatus=Pending
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by project status
- `paymentStatus` (optional): Filter by payment status

#### Get Single Order
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Upload Files to Order
```http
POST /api/orders/:id/files
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [file1.pdf, file2.jpg, ...]
```

**Response (200):**
```json
{
  "message": "Files uploaded successfully",
  "files": [
    "/uploads/1705315200000-document.pdf",
    "https://cloudinary.com/image.jpg"
  ]
}
```

---

### 4. Payments

#### Create Payment
```http
POST /api/payments/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439012",
  "amount": 17500
}
```

**Response (200):**
```json
{
  "gatewayOrder": {
    "id": "order_MNopQrStUvWxYz",
    "entity": "order",
    "amount": 1750000,
    "amount_paid": 0,
    "amount_due": 1750000,
    "currency": "INR",
    "receipt": "WSG-1705315200000-ABC123DEF",
    "status": "created"
  },
  "key": "rzp_test_xxxxxxxxxx",
  "amount": 17500
}
```

#### Verify Payment
```http
POST /api/payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpay_order_id": "order_MNopQrStUvWxYz",
  "razorpay_payment_id": "pay_MNopQrStUvWxYz",
  "razorpay_signature": "signature_here",
  "amount": 17500
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "orderNumber": "WSG-1705315200000-ABC123DEF",
    "advancePaid": 17500,
    "paymentStatus": "Partial Paid",
    "projectStatus": "Requirement Gathering"
  }
}
```

#### Webhook (Razorpay)
```http
POST /api/payments/webhook
Content-Type: application/json
X-Razorpay-Signature: signature_here

{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_MNopQrStUvWxYz",
        "order_id": "order_MNopQrStUvWxYz",
        "amount": 1750000
      }
    }
  }
}
```

---

### 5. Customer Dashboard

#### Get Dashboard Stats
```http
GET /api/customer/dashboard
Authorization: Bearer <customer_token>
```

**Response (200):**
```json
{
  "totalOrders": 5,
  "activeOrders": 3,
  "completedOrders": 2,
  "totalSpent": 87500,
  "pendingPayments": 37500,
  "recentOrders": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "orderNumber": "WSG-1705315200000-ABC123DEF",
      "template": {
        "title": "Modern E-commerce Template",
        "image": "https://example.com/image.jpg"
      },
      "amount": 35000,
      "projectStatus": "In Development",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 6. Admin Routes

All admin routes require `admin` or `manager` role.

#### Get Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "totalOrders": 150,
  "totalRevenue": 3750000,
  "pendingRevenue": 1250000,
  "pendingProjects": 45,
  "completedProjects": 105,
  "totalCustomers": 87,
  "recentOrders": [...]
}
```

#### Get All Orders
```http
GET /api/admin/orders?page=1&limit=20&status=In%20Development&paymentStatus=Paid&developer=507f1f77bcf86cd799439013
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by project status
- `paymentStatus`: Filter by payment status
- `developer`: Filter by assigned developer ID

#### Get All Users
```http
GET /api/admin/users?page=1&limit=20&role=customer
Authorization: Bearer <admin_token>
```

#### Update Project Status
```http
PATCH /api/admin/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "In Development",
  "note": "Development started. ETA: 2 weeks"
}
```

#### Assign Developer
```http
PATCH /api/admin/orders/:id/developer
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "developerId": "507f1f77bcf86cd799439013"
}
```

#### Generate Invoice
```http
POST /api/admin/orders/:id/invoice
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "message": "Invoice generated successfully",
  "invoice": "/invoices/WSG-1705315200000-ABC123DEF.pdf"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (Successful deletion)
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Authentication required)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `409` - Conflict (Duplicate entry)
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

- 100 requests per 15 minutes in production
- 200 requests per 15 minutes in development

When rate limit is exceeded:
```json
{
  "message": "Too many requests, please try again later."
}
```

## Validation Rules

### User Registration
- **name**: 2-50 characters
- **email**: Valid email format
- **password**: Min 8 chars, must have uppercase, lowercase, and number
- **phone**: 10-digit Indian mobile number (optional)

### Order Creation
- **template**: Valid MongoDB ObjectID
- **package**: One of: Basic, Standard, Premium, Enterprise
- **amount**: 0-1,000,000

### Template Creation
- **title**: 3-100 characters
- **category**: 2-50 characters
- **price**: 0-1,000,000
- **features**: Array of strings (max 200 chars each)

## Testing with cURL

### Register & Login
```bash
# Register
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@123","phone":"9876543210"}'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'
```

### Get Templates
```bash
curl http://localhost:5000/api/templates
```

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"template":"TEMPLATE_ID","package":"Premium","amount":35000}'
```

## Postman Collection

Import this into Postman for easy testing:
[Link to Postman collection - can be generated from API]
