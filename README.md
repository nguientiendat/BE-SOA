# Microservices Architecture - E-commerce Platform

Một hệ thống microservices hoàn chỉnh cho nền tảng thương mại điện tử với API Gateway, Auth Service, và Product Service.

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  Auth Service   │    │ Product Service │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 3002)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │    MongoDB      │
                    │   (Port 27017)  │
                    └─────────────────┘
```

## 📁 Cấu trúc dự án

```
server/
├── gateway/                    # API Gateway
│   ├── src/
│   │   ├── index.js           # Main gateway server
│   │   └── routes/
│   │       ├── auth.routes.js # Auth service proxy
│   │       └── product.routes.js # Product service proxy
│   └── package.json
├── services/
│   ├── auth-service/          # Authentication Service
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   └── user.controller.js
│   │   │   ├── middleware/
│   │   │   │   └── auth.middleware.js
│   │   │   ├── models/
│   │   │   │   └── user.model.js
│   │   │   ├── routes/
│   │   │   │   └── user.route.js
│   │   │   └── index.js
│   │   └── package.json
│   └── product-service/       # Product Management Service
│       ├── src/
│       │   ├── controllers/
│       │   │   └── product.controller.js
│       │   ├── middleware/
│       │   │   └── auth.middleware.js
│       │   ├── models/
│       │   │   └── product.model.js
│       │   ├── routes/
│       │   │   └── product.router.js
│       │   └── index.js
│       └── package.json
├── shared/                    # Shared utilities
│   ├── auth/
│   │   ├── jwt.utils.js       # JWT utilities
│   │   ├── auth.middleware.js # Auth middleware
│   │   └── constants.js       # Auth constants
│   └── utils/
│       └── response.js        # Standard response format
├── docker-compose.yml         # Docker orchestration
└── README.md
```

## 🚀 Tính năng chính

### API Gateway

- **Load Balancing**: Phân phối requests đến các services
- **Rate Limiting**: Giới hạn số lượng requests
- **CORS**: Cross-Origin Resource Sharing
- **Security**: Helmet middleware cho bảo mật
- **Logging**: Morgan middleware cho logging
- **Health Check**: Endpoint kiểm tra sức khỏe hệ thống

### Auth Service

- **User Registration**: Đăng ký tài khoản mới
- **User Login**: Đăng nhập với JWT token
- **Profile Management**: Quản lý thông tin cá nhân
- **Role-based Access**: Phân quyền theo vai trò
- **Password Encryption**: Mã hóa mật khẩu với bcrypt

### Product Service

- **Product CRUD**: Thêm, sửa, xóa, xem sản phẩm
- **Role-based Authorization**: Chỉ ADMIN mới có thể thêm sản phẩm
- **Product Search**: Tìm kiếm sản phẩm
- **Inventory Management**: Quản lý tồn kho

### Shared Utilities

- **JWT Management**: Tạo và xác thực JWT tokens
- **Standard Responses**: Format response thống nhất
- **Auth Middleware**: Middleware xác thực tái sử dụng
- **Constants**: Các hằng số chung

## 🛠️ Công nghệ sử dụng

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM cho MongoDB
- **JWT**: JSON Web Tokens cho authentication
- **bcryptjs**: Mã hóa mật khẩu
- **http-proxy-middleware**: Proxy middleware
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

## 📋 API Endpoints

### Authentication (qua Gateway)

```bash
# Đăng ký tài khoản
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // optional, default: "user"
}

# Đăng nhập
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

# Lấy thông tin profile (cần token)
GET /api/auth/profile
Headers: Authorization: Bearer <token>
```

### Products (qua Gateway)

```bash
# Lấy danh sách sản phẩm (public)
GET /api/products

# Lấy sản phẩm theo ID (public)
GET /api/products/:id

# Thêm sản phẩm (chỉ ADMIN)
POST /api/products/addproduct
Headers: Authorization: Bearer <admin_token>
{
  "name": "iPhone 15",
  "avatar_url": "https://example.com/iphone15.jpg",
  "price": 999.99,
  "quantity": 100,
  "sold_count": 0,
  "discount": 0,
  "days_valid": 365
}
```

### Health Checks

```bash
# Gateway health
GET /health

# Auth service health
GET http://localhost:3001/health

# Product service health
GET http://localhost:3002/health
```

## 🔧 Cài đặt và chạy

### Yêu cầu hệ thống

- Node.js >= 18.0.0
- MongoDB >= 5.0
- Docker & Docker Compose (optional)

### Cài đặt thủ công

1. **Clone repository**

```bash
git clone <repository-url>
cd server
```

2. **Cài đặt dependencies**

```bash
# Cài đặt shared utilities
cd shared
npm install

# Cài đặt gateway
cd ../gateway
npm install

# Cài đặt auth service
cd ../services/auth-service
npm install

# Cài đặt product service
cd ../services/product-service
npm install
```

3. **Cấu hình environment variables**

Tạo file `.env` trong mỗi service:

**gateway/.env**

```env
PORT=3000
NODE_ENV=development
AUTH_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
CORS_ORIGIN=http://localhost:3000
```

**services/auth-service/.env**

```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/auth_service
JWT_SECRET=your-super-secret-jwt-key-here
```

**services/product-service/.env**

```env
PORT=3002
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/product_service
```

4. **Khởi động MongoDB**

```bash
# Với MongoDB local
mongod

# Hoặc sử dụng MongoDB Atlas
# Cập nhật MONGO_URI trong .env files
```

5. **Chạy services**

```bash
# Terminal 1: Auth Service
cd services/auth-service
npm run dev

# Terminal 2: Product Service
cd services/product-service
npm run dev

# Terminal 3: API Gateway
cd gateway
npm run dev
```

### Chạy với Docker

```bash
# Build và chạy tất cả services
docker-compose up --build

# Chạy ở background
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

## 🧪 Testing

### Test với Postman

1. **Import Postman Collection** (nếu có)
2. **Test Authentication Flow**:

   - Register user
   - Login để lấy token
   - Test protected endpoints

3. **Test Product Management**:
   - Tạo user ADMIN
   - Login với ADMIN
   - Thêm sản phẩm
   - Test với user thường (sẽ bị từ chối)

### Test với curl

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get products
curl http://localhost:3000/api/products
```

## 🔐 Bảo mật

- **JWT Tokens**: Xác thực và phân quyền
- **Password Hashing**: bcrypt với salt rounds
- **CORS**: Cấu hình cross-origin requests
- **Rate Limiting**: Giới hạn requests per IP
- **Input Validation**: Kiểm tra dữ liệu đầu vào
- **Error Handling**: Xử lý lỗi an toàn
