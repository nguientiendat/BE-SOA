# API Gateway v2.0

API Gateway cho kiến trúc microservices với validation và error handling nâng cao.

## Tính năng

- ✅ Proxy requests đến auth-service và product-service
- ✅ Request validation với schema
- ✅ Error handling toàn diện
- ✅ Request logging và monitoring
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Security headers với Helmet
- ✅ Health check endpoints
- ✅ Graceful shutdown

## Cấu trúc

```
gateway/
├── src/
│   ├── index.js                 # Main application
│   ├── routes/
│   │   ├── auth.routes.js       # Auth service routes
│   │   └── product.routes.js    # Product service routes
│   └── middleware/
│       ├── error.middleware.js  # Error handling
│       ├── logger.middleware.js # Request logging
│       └── validation.middleware.js # Request validation
├── package.json
└── README.md
```

## API Endpoints

### Auth Service

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin user (cần token)

### Product Service

- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy sản phẩm theo ID
- `POST /api/products/addproduct` - Thêm sản phẩm (cần admin token)

### System

- `GET /health` - Health check
- `GET /` - API documentation

## Cài đặt

```bash
cd gateway
npm install
```

## Chạy

```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000
AUTH_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
JWT_SECRET=your-super-secret-jwt-key-here
```

## Validation

Gateway tự động validate requests trước khi forward đến services:

### Register Request

```json
{
  "username": "string (3-50 chars)",
  "email": "valid email",
  "password": "string (min 6 chars)",
  "role": "user|admin|moderator (optional)"
}
```

### Login Request

```json
{
  "email": "valid email",
  "password": "string"
}
```

### Add Product Request

```json
{
  "name": "string (1-200 chars)",
  "avatar_url": "valid URL",
  "price": "number (>= 0)",
  "quantity": "number (>= 0)",
  "sold_count": "number (>= 0)",
  "discount": "number (0-100)",
  "days_valid": "number (>= 1)"
}
```

## Error Handling

Gateway xử lý các loại lỗi:

- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Service unavailable (503)
- Timeout errors (504)
- Internal server errors (500)

## Logging

Gateway log tất cả requests và responses:

- Request ID tracking
- Response time measurement
- Error logging
- Service health monitoring

## Security

- Helmet.js cho security headers
- CORS configuration
- Rate limiting
- Request validation
- Input sanitization


