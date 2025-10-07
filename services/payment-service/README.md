# Payment Service

Payment service for microservices architecture.

## Features

- Payment processing
- Payment history
- Payment validation
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
- Payment endpoints will be added here

## Port

Default port: 3004

## Docker

Build and run with Docker:

```bash
docker build -t payment-service .
docker run -p 3004:3004 payment-service
```

