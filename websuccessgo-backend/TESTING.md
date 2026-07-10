# Testing Guide - WebSuccessGo Backend

## Quick Start Testing

### 1. Start the Server
```bash
cd websuccessgo-backend
npm run dev
```

### 2. Test Health Endpoint
```bash
curl http://localhost:5000/
```

Expected Response:
```json
{
  "name": "WebSuccessGo API",
  "status": "Running",
  "version": "1.0.0",
  "environment": "development"
}
```

## Manual Testing Flow

### Step 1: Register a User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "customer@test.com",
    "password": "Test@123",
    "phone": "9876543210"
  }'
```

Save the `token` from response for next requests.

### Step 2: Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "Test@123"
  }'
```

### Step 3: Get User Profile
```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 4: Create a Template (Need Admin Account)

First, manually create an admin user in MongoDB:
```javascript
// In MongoDB shell or Compass
db.users.insertOne({
  name: "Admin User",
  email: "admin@test.com",
  password: "$2b$12$...", // Hash of "Admin@123"
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or register and manually change role to 'admin' in database.

Then create template:
```bash
curl -X POST http://localhost:5000/api/templates \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Modern E-commerce Website",
    "category": "ecommerce",
    "price": 25000,
    "features": ["Responsive Design", "Payment Gateway", "Admin Panel"]
  }'
```

### Step 5: Get Templates
```bash
curl http://localhost:5000/api/templates
```

### Step 6: Create an Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "TEMPLATE_ID_FROM_STEP_5",
    "package": "Premium",
    "amount": 35000,
    "details": {
      "businessName": "My Test Business",
      "requirements": "Need a modern responsive website"
    }
  }'
```

Save the `order._id` for payment testing.

### Step 7: Get My Orders
```bash
curl http://localhost:5000/api/orders/mine \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 8: Create Payment (Requires Razorpay Config)

Make sure Razorpay keys are in .env, then:
```bash
curl -X POST http://localhost:5000/api/payments/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID_FROM_STEP_6",
    "amount": 17500
  }'
```

## Testing Validation

### Test Invalid Email
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "invalid-email",
    "password": "Test@123"
  }'
```

Expected: 400 error with validation message

### Test Weak Password
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@test.com",
    "password": "weak"
  }'
```

Expected: 400 error about password requirements

### Test Invalid Phone Number
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@test.com",
    "password": "Test@123",
    "phone": "123"
  }'
```

Expected: 400 error about phone format

## Testing Authorization

### Test Accessing Protected Route Without Token
```bash
curl http://localhost:5000/api/orders/mine
```

Expected: 401 Unauthorized

### Test Accessing Admin Route as Customer
```bash
curl http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

Expected: 403 Forbidden

## Testing Rate Limiting

Run this command 200+ times quickly:
```bash
for i in {1..250}; do
  curl http://localhost:5000/api/templates
done
```

After 200 requests in 15 minutes, you should get 429 error.

## Testing File Upload

### Upload Files to Order
```bash
curl -X POST http://localhost:5000/api/orders/ORDER_ID/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.jpg"
```

### Test Invalid File Type
```bash
curl -X POST http://localhost:5000/api/orders/ORDER_ID/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@/path/to/file.exe"
```

Expected: 400 error about file type

## Testing Pagination

### Get Templates with Pagination
```bash
# Page 1
curl "http://localhost:5000/api/templates?page=1&limit=5"

# Page 2
curl "http://localhost:5000/api/templates?page=2&limit=5"
```

### Get Orders with Filters
```bash
curl "http://localhost:5000/api/orders/mine?status=Order%20Received&paymentStatus=Pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing Search & Filters

### Search Templates
```bash
curl "http://localhost:5000/api/templates?search=ecommerce"
```

### Filter by Category
```bash
curl "http://localhost:5000/api/templates?category=portfolio"
```

### Filter by Price Range
```bash
curl "http://localhost:5000/api/templates?minPrice=10000&maxPrice=30000"
```

## Testing Admin Features

### Get Dashboard Stats
```bash
curl http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Update Order Status
```bash
curl -X PATCH http://localhost:5000/api/admin/orders/ORDER_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Development",
    "note": "Development started, ETA 2 weeks"
  }'
```

### Assign Developer
```bash
# First create a developer user (role: developer)
# Then assign to order
curl -X PATCH http://localhost:5000/api/admin/orders/ORDER_ID/developer \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "developerId": "DEVELOPER_USER_ID"
  }'
```

### Generate Invoice
```bash
curl -X POST http://localhost:5000/api/admin/orders/ORDER_ID/invoice \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Check `websuccessgo-backend/invoices/` folder for generated PDF.

## Testing Customer Dashboard

```bash
curl http://localhost:5000/api/customer/dashboard \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

## Testing Refresh Token

```bash
curl -X POST http://localhost:5000/api/users/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Testing Password Change

```bash
curl -X POST http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Test@123",
    "newPassword": "NewTest@123"
  }'
```

## Common Test Scenarios

### Scenario 1: Complete Order Flow
1. Register customer → Get token
2. Get templates → Choose one
3. Create order → Get order ID
4. Upload requirements files
5. Make payment → Get Razorpay order
6. (In real app: Complete payment on Razorpay)
7. Verify payment → Order status updated

### Scenario 2: Admin Workflow
1. Login as admin
2. View dashboard stats
3. Get all orders
4. Assign developer to order
5. Update order status
6. Generate invoice

### Scenario 3: Customer Journey
1. Register and login
2. Browse templates
3. Create order
4. View customer dashboard
5. Upload files to order
6. Make payment
7. Track order status

## Environment Testing

### Test with Missing Environment Variables
1. Rename .env temporarily
2. Start server
3. Should fail with clear error message

### Test with Invalid MongoDB URL
1. Set wrong MONGO_URL in .env
2. Start server
3. Should show warning but server stays up

### Test without Razorpay Config
1. Remove Razorpay keys from .env
2. Try to create payment
3. Should get 503 error

## Load Testing (Optional)

Install Apache Bench or similar:
```bash
# Install ab
sudo apt install apache2-utils

# Test 1000 requests with 10 concurrent
ab -n 1000 -c 10 http://localhost:5000/api/templates
```

## Database Testing

### Check Database Connection
```javascript
// In MongoDB shell
use websuccessgo
db.users.find()
db.orders.find()
db.templates.find()
```

### Verify Indexes
```javascript
db.users.getIndexes()
// Should show index on email (unique)

db.orders.getIndexes()
// Should show index on orderNumber (unique)
```

## Logging Testing

### Check Logs
```bash
# View all logs
tail -f websuccessgo-backend/server.log

# View only errors
tail -f websuccessgo-backend/server-error.log

# Check log format
cat websuccessgo-backend/server.log | grep ERROR
```

## Security Testing

### Test SQL Injection (Should be safe with Mongoose)
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com OR 1=1--",
    "password": "anything"
  }'
```

Should not work (Mongoose prevents this).

### Test XSS in Inputs
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"XSS\")</script>",
    "email": "xss@test.com",
    "password": "Test@123"
  }'
```

Input will be escaped by MongoDB.

## Checklist Before Production

- [ ] All environment variables set correctly
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] MongoDB connection works
- [ ] Razorpay credentials configured
- [ ] Cloudinary credentials configured (optional)
- [ ] CORS origins restricted to frontend domain
- [ ] Rate limiting configured properly
- [ ] File upload works (test with images, PDFs)
- [ ] Payment flow works end-to-end
- [ ] Invoice generation works
- [ ] All validation rules working
- [ ] Error messages don't reveal sensitive info
- [ ] Logging is working
- [ ] No console.log statements in code
- [ ] All dependencies updated
- [ ] No security vulnerabilities (npm audit)

## Troubleshooting

### Server won't start
- Check if port 5000 is already in use
- Verify .env file exists and has required variables
- Check MongoDB is running

### Database connection fails
- Verify MongoDB is running: `systemctl status mongodb`
- Check MONGO_URL in .env
- Try connecting with MongoDB Compass

### Payment creation fails
- Verify Razorpay keys are correct
- Check Razorpay dashboard for test/live mode
- Ensure RAZORPAY_KEY and RAZORPAY_SECRET are set

### File upload fails
- Check uploads/ directory exists and is writable
- Verify file size is under 10MB
- Check file type is allowed
- If using Cloudinary, verify credentials

### Token errors
- Check JWT_SECRET is set
- Verify token hasn't expired (24h lifetime)
- Use refresh token to get new access token

## Next Steps

After manual testing:
1. Set up automated testing (Jest, Mocha, or similar)
2. Create integration tests
3. Set up CI/CD pipeline
4. Add performance monitoring
5. Configure error tracking (Sentry, etc.)
