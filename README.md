# Microservice Practice Project

## Description

This is a learning project to explore backend development using a microservices architecture. It simulates a simple bakery e-commerce system, separating core domains—authentication, product catalog, cart, and orders—into individual NestJS services. All services are connected through a central API Gateway. AWS Cognito and DynamoDB are used for authentication and data storage.

## Technologies

* **NestJS** – Backend framework for all services
* **Next.js** – Frontend for customer/admin interaction
* **AWS Cognito** – Authentication and user pool
* **AWS DynamoDB** – NoSQL database for products, carts, and orders
* **TypeScript** – Language used across all services and frontend

## Services

* **API Gateway** (port `3000`) – Routes requests to microservices
* **Auth Service** (port `3002`) – Handles login, register, confirm via Cognito
* **Product Service** (port `3001`) – Manages bakery products
* **Cart Service** (port `3003`) – Manages user cart and checkout
* **Order Service** (port `3004`) – Processes and lists orders
* **Frontend (Next.js)** (port `3005`) – Web interface for users and admin

## Setup

1. **Clone the repo:**

   ```bash
   git clone https://github.com/Kanyapat-samee/microservice_practice.git
   cd microservice_practice
   ```

2. **Install dependencies:**

   ```bash
   # In each service and frontend directory
   npm install
   ```

3. **Set up environment variables:**

   Configure AWS credentials and Cognito details in `.env` files for each service that uses them. Example:

   ```env
   ACCESS_KEY_ID=your-access-key-id
   SECRET_ACCESS_KEY=your-secret-access-key
   REGION=your-region
   COGNITO_USER_POOL_ID=your-user-pool-id
   COGNITO_USER_POOL_CLIENT_ID=your-client-id
   ```

4. **Run services locally:**

   ```bash
   # In each backend service directory
   npm run start:dev

   # In frontend
   PORT=3005 npm run dev
   ```

## Usage

* Access the app at `http://localhost:3005`
* Register, log in, browse products, add to cart, and checkout
* Admins can view dashboard and manage orders
* All API requests are routed through the API Gateway at `http://localhost:3000`

## Project Structure

```
microservice_practice/
├── backend/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── product-service/
│   ├── cart-service/
│   └── order-service/
└── frontend/
```

## Learning Highlights

* Practiced designing and developing a microservices-based backend using NestJS
* Gained experience with AWS services integration: Cognito (auth) and DynamoDB (data)
* Applied separation of scalable architecture design in practice

## Notes

This project is intended for learning purposes.