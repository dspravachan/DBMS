# 🍽️ MealMatrix v2 — Subscription-Based Smart Meal Delivery Platform

A production-grade backend API for a subscription meal delivery platform. Built with Node.js, Express.js, and MySQL 8.x.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.x |
| Database | MySQL 8.x |
| DB Driver | mysql2 (with promises) |
| Auth | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Validation | express-validator |
| Security | helmet, cors |
| Logging | morgan |
| IDs | uuid v4 |
| Environment | dotenv |

---

## 📁 Project Structure

```
DBMS/
├── database/
│   ├── schema.sql          # Complete MySQL schema (19 tables)
│   └── seed.sql            # Sample data (users, restaurants, foods, plans...)
└── backend/
    ├── package.json
    ├── .env.example
    └── src/
        ├── app.js              # Express app entry point
        ├── config/
        │   └── db.js           # MySQL2 connection pool
        ├── middleware/
        │   ├── auth.js         # JWT verification middleware
        │   └── adminAuth.js    # Admin role check middleware
        └── routes/
            ├── auth.js         # Register, login, profile
            ├── restaurants.js  # Restaurant CRUD
            ├── foods.js        # Food item CRUD
            ├── mealPlans.js    # Meal plan CRUD
            ├── weeklyMenu.js   # Weekly menu management
            ├── subscriptions.js# Subscription lifecycle
            ├── deliveries.js   # Delivery tracking
            ├── cart.js         # Shopping cart
            ├── wishlist.js     # User wishlist
            ├── reviews.js      # Ratings & reviews
            ├── orders.js       # Order management
            ├── payments.js     # Payment processing
            ├── wallet.js       # Digital wallet
            ├── coupons.js      # Coupon management
            ├── memberships.js  # Membership tiers
            └── admin.js        # Admin dashboard & analytics
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8.x running locally
- npm or yarn

### 1. Database Setup

```sql
-- In MySQL Workbench or CLI:
SOURCE c:/Users/User/OneDrive/Desktop/DBMS/database/schema.sql;
SOURCE c:/Users/User/OneDrive/Desktop/DBMS/database/seed.sql;
```

Or via CLI:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
copy .env.example .env

# Edit .env with your MySQL credentials
notepad .env

# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

### 3. Configure Environment Variables

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=mealmatrix_db
JWT_SECRET=mealmatrix_super_secret_jwt_key_2024
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

The API will start at: **http://localhost:5000**

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mealmatrix.com | password |
| User | priya@example.com | password |
| User | rahul@example.com | password |
| User | ananya@example.com | password |
| User | dev@example.com | password |

> **Note:** The seed data uses the bcrypt hash `$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.` which corresponds to the password `"password"` (the well-known Laravel testing hash). For the admin account, update the hash for `admin123` if needed.

---

## 📡 API Documentation

**Base URL:** `http://localhost:5000/api`

**Authentication:** Include `Authorization: Bearer <token>` header for protected routes.

### 🔐 Auth Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | None | Register new user |
| POST | `/auth/login` | None | Login and get JWT |
| GET | `/auth/me` | User | Get current user profile |
| PUT | `/auth/profile` | User | Update profile |

### 🏪 Restaurant Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/restaurants` | None | List all restaurants (`?city=&cuisine_type=&search=`) |
| GET | `/restaurants/:id` | None | Get restaurant + foods + plans |
| POST | `/restaurants` | Admin | Create restaurant |
| PUT | `/restaurants/:id` | Admin | Update restaurant |
| DELETE | `/restaurants/:id` | Admin | Soft delete restaurant |

### 🍔 Food Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/foods` | None | List foods (`?restaurant_id=&category=&search=&is_veg=&is_popular=`) |
| GET | `/foods/popular` | None | Popular food items |
| GET | `/foods/:id` | None | Get food details |
| POST | `/foods` | Admin | Create food item |
| PUT | `/foods/:id` | Admin | Update food item |
| DELETE | `/foods/:id` | Admin | Soft delete food |

### 📋 Meal Plan Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/meal-plans` | None | List plans (`?restaurant_id=&plan_type=&meal_type=&search=`) |
| GET | `/meal-plans/:id` | None | Get plan + weekly menu + reviews |
| POST | `/meal-plans` | Admin | Create meal plan |
| PUT | `/meal-plans/:id` | Admin | Update meal plan |
| DELETE | `/meal-plans/:id` | Admin | Deactivate meal plan |

### 📅 Weekly Menu Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/weekly-menu?meal_plan_id=` | None | Get menu for a plan (required) |
| POST | `/weekly-menu` | Admin | Add menu for a specific day |
| PUT | `/weekly-menu/:id` | Admin | Update menu entry |
| DELETE | `/weekly-menu/:id` | Admin | Delete menu entry |

### 📦 Subscription Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/subscriptions` | User | User's subscriptions |
| GET | `/subscriptions/:id` | User | Subscription detail + deliveries |
| POST | `/subscriptions` | User | Subscribe to a meal plan |
| PUT | `/subscriptions/:id/pause` | User | Pause subscription |
| PUT | `/subscriptions/:id/resume` | User | Resume subscription |
| PUT | `/subscriptions/:id/cancel` | User | Cancel subscription |
| GET | `/subscriptions/admin/all` | Admin | All subscriptions |

### 🚚 Delivery Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/deliveries` | User | User's deliveries (`?subscription_id=&status=`) |
| GET | `/deliveries/today` | User | Today's deliveries |
| GET | `/deliveries/admin/all` | Admin | All deliveries (`?date=&status=`) |
| PUT | `/deliveries/:id/status` | Admin | Update delivery status |

### 🛒 Cart Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | User | Get cart with food details + total |
| POST | `/cart` | User | Add/update item in cart |
| DELETE | `/cart/:id` | User | Remove single item |
| DELETE | `/cart` | User | Clear entire cart |

### ❤️ Wishlist Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/wishlist` | User | Get wishlist with food details |
| POST | `/wishlist` | User | Toggle item (add/remove) |
| DELETE | `/wishlist/:id` | User | Remove specific item |

### ⭐ Review Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reviews` | None | Get reviews (`?food_id= / ?restaurant_id= / ?meal_plan_id=`) |
| POST | `/reviews` | User | Submit a review |
| DELETE | `/reviews/:id` | User/Admin | Delete review |

### 🧾 Order Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/orders` | User | Order history |
| GET | `/orders/:id` | User | Order detail + items |
| POST | `/orders` | User | Place order (transactional) |
| PUT | `/orders/:id/status` | Admin | Update order status |
| GET | `/orders/admin/all` | Admin | All orders |

### 💳 Payment Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments` | User | Process a payment |
| GET | `/payments` | User | Payment history |
| GET | `/payments/admin/all` | Admin | All payments |

### 👛 Wallet Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/wallet` | User | Balance + transaction history |
| POST | `/wallet/recharge` | User | Add funds to wallet |
| POST | `/wallet/deduct` | User | Deduct from wallet |

### 🎟️ Coupon Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/coupons` | None | All active coupons |
| POST | `/coupons/validate` | User | Validate coupon + calculate discount |
| POST | `/coupons` | Admin | Create coupon |
| PUT | `/coupons/:id` | Admin | Update coupon |
| DELETE | `/coupons/:id` | Admin | Deactivate coupon |

### 👑 Membership Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/memberships` | None | All membership tiers |
| GET | `/memberships/my` | User | User's active membership |
| POST | `/memberships/purchase` | User | Purchase a membership |
| POST | `/memberships/admin` | Admin | Create membership tier |

### 📊 Admin Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/analytics` | Admin | Full analytics dashboard |
| GET | `/admin/users` | Admin | All users with stats |
| PUT | `/admin/users/:id/toggle` | Admin | Activate/deactivate user |
| GET | `/admin/restaurants` | Admin | All restaurants with stats |

---

## 🗄️ Database Schema (15+ Tables)

| Table | Description |
|-------|-------------|
| `users` | User accounts with role-based access |
| `restaurants` | Restaurant listings |
| `foods` | Menu items per restaurant |
| `meal_plans` | Subscription meal plans |
| `weekly_menu` | Day-wise menu for each plan |
| `subscriptions` | User meal plan subscriptions |
| `deliveries` | Individual meal deliveries |
| `cart` | Shopping cart items |
| `wishlist` | User saved items |
| `ratings` | Reviews for food/restaurant/plan |
| `orders` | One-time food orders |
| `order_items` | Items within an order |
| `coupons` | Discount codes |
| `memberships` | Membership tier definitions |
| `user_memberships` | User-membership mapping |
| `wallet` | User digital wallet |
| `wallet_transactions` | Wallet credit/debit history |
| `payments` | Payment records |
| `offers` | Restaurant-specific offers |

---

## 🔒 Security Features

- JWT tokens with expiration
- bcrypt password hashing (10 rounds)
- Helmet.js security headers
- CORS restricted to frontend URL
- Parameterized SQL queries (no injection risk)
- Role-based access control (user/admin)
- Input validation on all endpoints
- Transaction-based financial operations

---

## 📦 Sample Coupons (from Seed)

| Code | Type | Discount | Min Order | Expires |
|------|------|----------|-----------|---------|
| `WELCOME10` | percent | 10% (max ₹100) | ₹200 | 90 days |
| `DIET20` | percent | 20% (max ₹200) | ₹500 | 60 days |
| `FIRST50` | flat | ₹50 off | ₹300 | 30 days |
| `SAVE100` | flat | ₹100 off | ₹800 | 45 days |
| `WEEKEND15` | percent | 15% (max ₹150) | ₹400 | 120 days |

---

## 🛠️ Development Notes

- All financial operations (orders, subscriptions, wallet) use **MySQL transactions** with `ROLLBACK` on failure
- Restaurant cart validation prevents mixing items from multiple restaurants
- Subscription creation auto-generates individual delivery records for all days
- Membership discounts are automatically applied on subscription creation
- Rating updates propagate to restaurant's average rating field

---

*MealMatrix v2 — Backend API v2.0.0*
