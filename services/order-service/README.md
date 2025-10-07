# Order Service

Order service for microservices architecture.

## Features

- Order management
- Order processing
- Order history
- Order status tracking
- Kafka integration for event-driven architecture

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Kafka

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

3. Start the service:

```bash
npm run dev
```

## API Endpoints

- `GET /health` - Health check endpoint
- Order endpoints will be added here

## Port

Default port: 3005

## Docker

Build and run with Docker:

```bash
docker build -t order-service .
docker run -p 3005:3005 order-service
```

