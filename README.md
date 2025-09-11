# NestJS API

A NestJS API project using **MongoDB**.

## Requirements
- Node.js v18 or later  
- MongoDB (local or Atlas)  

## Getting Started

### 1. Clone the repository
    git clone <your-repo-url>
    cd <your-project-folder>

### 2. Install dependencies
    npm install

### 3. Configure environment variables
Create a `.env` file in the project root and fill in the values:

    PORT=3000
    DB_URL=mongodb://localhost:27017/your-db-name
    JWT_SECRET=your_jwt_secret

### 4. Run the application
Development:
    
    npm run start:dev

Production:
    
    npm run build
    npm run start:prod

## Testing
Unit tests:
    
    npm run test

E2E tests:
    
    npm run test:e2e

Lint:
    
    npm run lint

## Notes
- The app will run on http://localhost:3000  
- MongoDB must be running locally or use MongoDB Atlas with your `DB_URL`.  
- Update `JWT_SECRET` with a secure key before deploying to production.  
