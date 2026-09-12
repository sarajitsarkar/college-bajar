# 🎓 College Bajar — Student Rental Marketplace

A full-stack, production-ready rental marketplace for college students.
Students can rent items from each other (calculators, books, lab equipment, etc.) within the college community.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| Auth | JWT + bcrypt |
| Images | Cloudinary |
| Payments | Razorpay (UPI + COD) |

---

## Project Structure

```
college-bajar/
├── backend/         Express API server
├── frontend/        React Vite app
└── README.md
```

---

## Quick Start

### 1. Clone and install

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Cloudinary & Razorpay keys
npm install

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env with your Razorpay key ID
npm install
```

### 2. Seed the database

```bash
cd backend
npm run seed
```

This creates:
- Admin account: `admin@collegebajar.com` / `admin@123`
- 10 default product categories
- Default tiered platform fee rule

### 3. Run in development

**Backend** (terminal 1):
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend** (terminal 2):
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

---

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=...
```

---

## Key Features

- **Student Auth** — Register/login with email or phone (JWT)
- **Marketplace** — Browse, search, filter, sort rental products
- **Privacy** — Owner identity hidden at API + DB level from renters
- **Rental Booking** — Date conflict prevention, min/max rental days
- **Checkout** — UPI (Razorpay) + Cash on Delivery
- **Dynamic Fee** — Admin-configurable tiered/fixed/percentage fee rules
- **Order Lifecycle** — 11 status states from placement to completion
- **My Listings** — List, edit, toggle availability, view incoming orders
- **Dashboard** — Active rentals, listings, earnings, recent orders
- **Admin Panel** — Full platform management (users, products, orders, fees, analytics)

---

## API Base URL

```
http://localhost:5000/api
```

## Default Admin Credentials (after seeding)

```
Email: admin@collegebajar.com
Password: admin@123
```

> ⚠️ Change the admin password after first login in production.

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render / Railway |
| Database | MongoDB Atlas |
| Images | Cloudinary |
| Payments | Razorpay |
