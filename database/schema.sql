-- ============================================================
-- MealMatrix v2 - Complete Database Schema
-- MySQL 8.x Compatible
-- ============================================================

CREATE DATABASE IF NOT EXISTS mealmatrix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mealmatrix_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    phone VARCHAR(20),
    address TEXT,
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_is_active (is_active)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: restaurants
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurants (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    cuisine_type VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0.00,
    delivery_time VARCHAR(50),
    min_order DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    owner_name VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_restaurants_city (city),
    INDEX idx_restaurants_cuisine (cuisine_type),
    INDEX idx_restaurants_is_active (is_active),
    INDEX idx_restaurants_rating (rating)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: foods
-- ============================================================
CREATE TABLE IF NOT EXISTS foods (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id VARCHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100),
    is_veg BOOLEAN NOT NULL DEFAULT TRUE,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    calories INT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_foods_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_foods_restaurant_id (restaurant_id),
    INDEX idx_foods_category (category),
    INDEX idx_foods_is_veg (is_veg),
    INDEX idx_foods_is_popular (is_popular),
    INDEX idx_foods_is_available (is_available)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: meal_plans
-- ============================================================
CREATE TABLE IF NOT EXISTS meal_plans (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id VARCHAR(36) NOT NULL,
    plan_name VARCHAR(150) NOT NULL,
    plan_type ENUM('weekly', 'monthly', 'custom') NOT NULL DEFAULT 'weekly',
    meal_type ENUM('veg', 'non-veg', 'both') NOT NULL DEFAULT 'veg',
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL,
    meals_per_day INT NOT NULL DEFAULT 3,
    delivery_frequency VARCHAR(100) DEFAULT 'Daily',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_meal_plans_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_meal_plans_restaurant_id (restaurant_id),
    INDEX idx_meal_plans_plan_type (plan_type),
    INDEX idx_meal_plans_meal_type (meal_type),
    INDEX idx_meal_plans_is_active (is_active)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: weekly_menu
-- ============================================================
CREATE TABLE IF NOT EXISTS weekly_menu (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    meal_plan_id VARCHAR(36) NOT NULL,
    restaurant_id VARCHAR(36) NOT NULL,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
    breakfast_name VARCHAR(200),
    lunch_name VARCHAR(200),
    dinner_name VARCHAR(200),
    breakfast_calories INT,
    lunch_calories INT,
    dinner_calories INT,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_weekly_menu_meal_plan FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_weekly_menu_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY uq_weekly_menu_plan_day (meal_plan_id, day_of_week),
    INDEX idx_weekly_menu_meal_plan_id (meal_plan_id),
    INDEX idx_weekly_menu_restaurant_id (restaurant_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: coupons
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('percent', 'flat') NOT NULL DEFAULT 'percent',
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0.00,
    max_discount DECIMAL(10,2),
    max_uses INT,
    used_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_coupons_code (code),
    INDEX idx_coupons_is_active (is_active)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: memberships
-- ============================================================
CREATE TABLE IF NOT EXISTS memberships (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL,
    perks JSON,
    subscription_discount INT DEFAULT 0,
    free_deliveries INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_memberships_is_active (is_active)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: user_memberships
-- ============================================================
CREATE TABLE IF NOT EXISTS user_memberships (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    membership_id VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_memberships_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_memberships_membership FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE CASCADE,
    INDEX idx_user_memberships_user_id (user_id),
    INDEX idx_user_memberships_is_active (is_active)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: wallet
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_wallet_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: wallet_transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    wallet_id VARCHAR(36) NOT NULL,
    type ENUM('credit', 'debit') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(500),
    reference_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallet_transactions_wallet FOREIGN KEY (wallet_id) REFERENCES wallet(id) ON DELETE CASCADE,
    INDEX idx_wallet_transactions_wallet_id (wallet_id),
    INDEX idx_wallet_transactions_type (type),
    INDEX idx_wallet_transactions_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36) NULL,
    subscription_id VARCHAR(36) NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
    method ENUM('wallet', 'card', 'upi', 'netbanking') NOT NULL DEFAULT 'wallet',
    transaction_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payments_user_id (user_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_created_at (created_at),
    INDEX idx_payments_order_id (order_id),
    INDEX idx_payments_subscription_id (subscription_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    restaurant_id VARCHAR(36) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','confirmed','preparing','delivered','cancelled') NOT NULL DEFAULT 'pending',
    coupon_id VARCHAR(36) NULL,
    payment_id VARCHAR(36) NULL,
    delivery_address TEXT NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
    INDEX idx_orders_user_id (user_id),
    INDEX idx_orders_restaurant_id (restaurant_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB;

-- Add FK for payments -> orders after orders table is created
ALTER TABLE payments ADD CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- ============================================================
-- TABLE: order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id VARCHAR(36) NOT NULL,
    food_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_food FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
    INDEX idx_order_items_order_id (order_id),
    INDEX idx_order_items_food_id (food_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    restaurant_id VARCHAR(36) NOT NULL,
    meal_plan_id VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'paused', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
    paused_until DATE NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_address TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_subscriptions_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    CONSTRAINT fk_subscriptions_meal_plan FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    INDEX idx_subscriptions_user_id (user_id),
    INDEX idx_subscriptions_status (status),
    INDEX idx_subscriptions_start_date (start_date),
    INDEX idx_subscriptions_end_date (end_date)
) ENGINE=InnoDB;

-- Add FK for payments -> subscriptions after subscriptions table is created
ALTER TABLE payments ADD CONSTRAINT fk_payments_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL;

-- ============================================================
-- TABLE: deliveries
-- ============================================================
CREATE TABLE IF NOT EXISTS deliveries (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    subscription_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    delivery_date DATE NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner') NOT NULL DEFAULT 'lunch',
    delivery_status ENUM('pending', 'preparing', 'out_for_delivery', 'delivered', 'missed') NOT NULL DEFAULT 'pending',
    delivery_time TIME NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_deliveries_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT fk_deliveries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_deliveries_subscription_id (subscription_id),
    INDEX idx_deliveries_user_id (user_id),
    INDEX idx_deliveries_delivery_date (delivery_date),
    INDEX idx_deliveries_delivery_status (delivery_status)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: cart
-- ============================================================
CREATE TABLE IF NOT EXISTS cart (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    food_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_food FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
    UNIQUE KEY uq_cart_user_food (user_id, food_id),
    INDEX idx_cart_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: wishlist
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    food_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_food FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
    UNIQUE KEY uq_wishlist_user_food (user_id, food_id),
    INDEX idx_wishlist_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: ratings
-- ============================================================
CREATE TABLE IF NOT EXISTS ratings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    food_id VARCHAR(36) NULL,
    restaurant_id VARCHAR(36) NULL,
    meal_plan_id VARCHAR(36) NULL,
    stars TINYINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ratings_food FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
    CONSTRAINT fk_ratings_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    CONSTRAINT fk_ratings_meal_plan FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    INDEX idx_ratings_user_id (user_id),
    INDEX idx_ratings_food_id (food_id),
    INDEX idx_ratings_restaurant_id (restaurant_id),
    INDEX idx_ratings_meal_plan_id (meal_plan_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: offers
-- ============================================================
CREATE TABLE IF NOT EXISTS offers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    discount_percent INT NOT NULL DEFAULT 0,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_offers_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_offers_restaurant_id (restaurant_id),
    INDEX idx_offers_is_active (is_active),
    INDEX idx_offers_valid_to (valid_to)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Done - MealMatrix v2 Schema Created
-- ============================================================
