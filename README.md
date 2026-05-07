# ShopZone - Microservices E-Commerce Platform

A microservice-based e-commerce application built with the MERN stack (MongoDB, Express.js, React, Node.js) for the CTSE Cloud Computing Assignment.

## Architecture

```
                        ┌──────────────┐
                        │  React App   │
                        │  (Frontend)  │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │  API Gateway │
                        │   (Nginx)    │
                        └──────┬───────┘
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼──┐    ┌───────▼───┐    ┌───────▼────┐
     │   User    │    │  Product  │    │   Order    │
     │  Service  │◄───│  Service  │◄───│  Service   │
     │  :5001    │    │  :5002    │    │   :5003    │
     └───────────┘    └───────────┘    └─────┬──────┘
                                             │
                                      ┌──────▼──────┐
                                      │  Payment    │
                                      │  Service    │
                                      │   :5004     │
                                      └─────────────┘
```

## Microservices

| Service | Port | Description | Communicates With |
|---------|------|-------------|-------------------|
| **User Service** | 5001 | Authentication, JWT tokens, user profiles | — (consumed by others) |
| **Product Service** | 5002 | Product catalog CRUD, stock management | User Service (auth) |
| **Order Service** | 5003 | Order creation, tracking, history | User Service (auth), Product Service (stock) |
| **Payment Service** | 5004 | Payment processing (mock), receipts | User Service (auth), Order Service (status) |

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **API Gateway**: Nginx
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **SAST**: SonarCloud
- **Cloud**: AWS ECS (Elastic Container Service), Amazon S3 Static Website Hosting
- **Security**: Helmet.js, CORS, express-rate-limit, express-validator

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MongoDB (or use Docker Compose)

### Run with Docker Compose (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd shopzone

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f
```

Services will be available at:
- API Gateway: http://localhost
- User Service: http://localhost:5001
- Product Service: http://localhost:5002
- Order Service: http://localhost:5003
- Payment Service: http://localhost:5004

### Run Individually (Development)

```bash
# Install dependencies for each service
cd user-service && npm install && cd ..
cd product-service && npm install && cd ..
cd order-service && npm install && cd ..
cd payment-service && npm install && cd ..

# Start each service (in separate terminals)
cd user-service && npm run dev
cd product-service && npm run dev
cd order-service && npm run dev
cd payment-service && npm run dev
```

## API Documentation (Swagger)

Each service has Swagger documentation:
- User Service: http://localhost:5001/api-docs
- Product Service: http://localhost:5002/api-docs
- Order Service: http://localhost:5003/api-docs
- Payment Service: http://localhost:5004/api-docs

## AWS Deployment

### Backend

The backend services are deployed to AWS ECS Fargate and exposed through an Application Load Balancer using path-based routing:

- `/api/users*` -> `user-service`
- `/api/products*` -> `product-service`
- `/api/orders*` -> `order-service`
- `/api/payments*` -> `payment-service`

### Frontend

The frontend is intended to be deployed with Amazon S3 Static Website Hosting for the assignment demo. This keeps the frontend and backend on HTTP and avoids browser mixed-content errors.

1. Copy the example file and set the backend base URL:

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://ctse-project-frontend-tharusha-2026.s3.ap-south-1.amazonaws.com/index.html
```

2. Build the frontend:

```bash
cd frontend
npm ci
npm run build
```

3. Create an S3 bucket, enable Static Website Hosting, and configure:

- Index document: `index.html`
- Error document: `index.html`

4. Upload the contents of `frontend/dist/` to the bucket root.

5. Add a public-read bucket policy for the website bucket.

6. Open the S3 website endpoint and verify:

- registration and login
- product listing
- order placement
- payment flow

## Inter-Service Communication

```
User registers → User Service creates account & returns JWT
User creates product → Product Service calls User Service /verify to validate JWT
User places order → Order Service calls User Service /verify + Product Service /stock
User makes payment → Payment Service calls User Service /verify + Order Service /status
```

## Security Measures

- **JWT Authentication** across all services
- **Helmet.js** for HTTP security headers
- **CORS** configuration
- **Rate Limiting** on API and auth endpoints
- **Input Validation** with express-validator
- **bcrypt** password hashing (12 salt rounds)
- **Non-root Docker user** in containers
- **SonarCloud** SAST analysis in CI/CD pipeline
- **Environment variables** for secrets

## CI/CD Pipeline

Each service has its own GitHub Actions workflow:
1. **Test** → Install deps, lint, run tests
2. **SonarCloud** → Security & code quality scan
3. **Build & Push** → Docker image to Docker Hub
4. **Deploy** → AWS ECS service update

## Environment Variables

Copy `.env.example` to `.env` in each service directory and fill in values:

```bash
cp user-service/.env.example user-service/.env
cp product-service/.env.example product-service/.env
cp order-service/.env.example order-service/.env
cp payment-service/.env.example payment-service/.env
```

## Project Structure

```
shopzone/
├── api-gateway/          # Nginx API Gateway
│   ├── nginx.conf
│   └── Dockerfile
├── user-service/         # User & Auth Service
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── swagger.js
│   ├── Dockerfile
│   └── package.json
├── product-service/      # Product Catalog Service
├── order-service/        # Order Management Service
├── payment-service/      # Payment Processing Service
├── .github/workflows/    # CI/CD Pipelines
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Team Members

| Member | Service | Responsibility |
|--------|---------|---------------|
| Student 1 | User Service | Authentication & user management |
| Student 2 | Product Service | Product catalog & inventory |
| Student 3 | Order Service | Order processing & tracking |
| Student 4 | Payment Service | Payment processing |

## License

This project is for educational purposes - SLIIT CTSE Assignment 2026.
