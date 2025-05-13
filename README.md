# Store Rating System

A full-stack web application that allows users to submit ratings for stores registered on the platform.

## Tech Stack

- **Backend**: Express.js with Socket.IO for real-time updates
- **Database**: SQLite (with Sequelize ORM)
- **Frontend**: React.js

## User Roles

1. System Administrator
2. Normal User
3. Store Owner

## Setup Instructions

### Prerequisites
- Node.js
- npm or yarn

### Installation

1. Clone the repository
2. Install all dependencies with one command:
   ```
   npm run install-all
   ```
   
   Or install them separately:
   ```
   npm install
   cd backend && npm install
   cd frontend && npm install
   ```

3. Set up the environment variables:
   - Create or update the `backend/.env` file if needed:
     ```
     PORT=5000
     JWT_SECRET=your_jwt_secret_key
     ```
   - The application uses SQLite which doesn't require a separate database server

4. Initialize the database with sample data:
   ```
   npm run init-db
   ```

5. Start both frontend and backend servers with a single command:
   ```
   npm run dev
   ```

   Or start them separately:
   ```
   # Backend
   npm run start-backend
   
   # Frontend
   npm run start-frontend
   ```

6. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Sample User Credentials

1. Admin User:
   - Email: admin@example.com
   - Password: Mobile001@

2. Normal User:
   - Email: user1@example.com
   - Password: User@123
   - Email: user2@example.com
   - Password: User@123

3. Store Owner:
   - Email: owner1@example.com
   - Password: Owner@123
   - Email: owner2@example.com
   - Password: Owner@123
   - Email: owner3@example.com
   - Password: MOBILE001@

## Features

### System Administrator
- Add new stores, normal users, and admin users
- Access dashboard with statistics
- View and filter lists of stores and users

### Normal User
- Sign up and log in
- Update password
- View and search for stores
- Submit and modify ratings

### Store Owner
- Log in and update password
- View users who have submitted ratings
- See average store rating

## Real-Time Updates

The application features real-time updates using Socket.IO:

- When a user submits or updates a rating, the changes are instantly reflected on all connected clients
- Store owners see rating changes in real-time without needing to refresh the page
- Store listings and details are automatically updated across all user sessions
- The application handles socket reconnection and authentication automatically
