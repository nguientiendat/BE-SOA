# Cart Service

Shopping cart service for microservices architecture.

## Cấu trúc

```
cart-service/
├── src/
│   ├── index.js                    # Main application
│   ├── controllers/
│   │   └── cart.controller.js     # Cart operations
│   ├── middleware/
│   │   └── auth.middleware.js     # Authentication
│   ├── models/
│   │   └── cart.model.js          # Cart data model
│   └── routes/
│       └── cart.routes.js         # API endpoints
├── package.json
├── Dockerfile
└── README.md
```

## API Endpoints (TODO)

- `GET /cart` - Get user's cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/update/:itemId` - Update cart item quantity
- `DELETE /cart/remove/:itemId` - Remove item from cart
- `DELETE /cart/clear` - Clear entire cart
- `GET /health` - Health check

## Tính năng (TODO)

- Add products to cart
- Update item quantities
- Remove items from cart
- Clear entire cart
- Calculate total price
- User authentication
- Data persistence

## Dependencies (TODO)

- Express.js
- MongoDB/Mongoose
- JWT authentication
- Shared utilities

## Cài đặt

```bash
cd services/cart-service
npm install
```

## Chạy

```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables (TODO)

```env
PORT=3003
MONGO_URI=mongodb://mongodb:27017/cart_service
JWT_SECRET=your-super-secret-jwt-key-here
```

