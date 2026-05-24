"""Database seed script — creates sample categories, products, and an admin user."""

from app.database.session import SessionLocal, engine, Base
from app.models.models import User, Category, Product, Coupon
from app.auth.hashing import hash_password
from datetime import datetime, timedelta, timezone


def seed():
    """Seed the database with sample data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ── Admin User ──
        if not db.query(User).filter(User.email == "admin@shopvista.com").first():
            admin = User(
                name="Admin",
                email="admin@shopvista.com",
                password_hash=hash_password("admin123"),
                role="admin",
            )
            db.add(admin)

        # ── Demo User ──
        if not db.query(User).filter(User.email == "user@shopvista.com").first():
            demo_user = User(
                name="Demo User",
                email="user@shopvista.com",
                password_hash=hash_password("user123"),
                role="user",
            )
            db.add(demo_user)

        db.flush()

        # ── Categories ──
        categories_data = [
            {"name": "Electronics", "slug": "electronics"},
            {"name": "Clothing", "slug": "clothing"},
            {"name": "Books", "slug": "books"},
            {"name": "Home & Kitchen", "slug": "home-kitchen"},
            {"name": "Sports", "slug": "sports"},
            {"name": "Accessories", "slug": "accessories"},
        ]
        for cat_data in categories_data:
            if not db.query(Category).filter(Category.slug == cat_data["slug"]).first():
                db.add(Category(**cat_data))

        db.flush()

        # Get category IDs
        categories = {c.slug: c.id for c in db.query(Category).all()}

        # ── Products ──
        products_data = [
            {
                "name": "Wireless Noise-Cancelling Headphones",
                "description": "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.",
                "price": 4999.00,
                "stock": 50,
                "category_id": categories.get("electronics"),
                "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                "rating": 4.5,
            },
            {
                "name": "Mechanical Gaming Keyboard",
                "description": "RGB backlit mechanical keyboard with Cherry MX switches, N-key rollover, and aircraft-grade aluminum frame.",
                "price": 3499.00,
                "stock": 35,
                "category_id": categories.get("electronics"),
                "image_url": "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500",
                "rating": 4.7,
            },
            {
                "name": "Ultra-Slim Laptop Stand",
                "description": "Ergonomic aluminum laptop stand with adjustable height. Compatible with 10-17 inch laptops.",
                "price": 1299.00,
                "stock": 80,
                "category_id": categories.get("electronics"),
                "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
                "rating": 4.3,
            },
            {
                "name": "Smartwatch Pro X",
                "description": "Advanced fitness smartwatch with heart rate monitor, GPS, SpO2 sensor, and 7-day battery life.",
                "price": 7999.00,
                "stock": 25,
                "category_id": categories.get("electronics"),
                "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
                "rating": 4.6,
            },
            {
                "name": "Premium Cotton T-Shirt",
                "description": "Ultra-soft 100% organic cotton crew neck tee. Available in multiple colors.",
                "price": 799.00,
                "stock": 200,
                "category_id": categories.get("clothing"),
                "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
                "rating": 4.2,
            },
            {
                "name": "Slim-Fit Denim Jeans",
                "description": "Classic slim-fit jeans with stretch fabric for maximum comfort. Dark indigo wash.",
                "price": 1999.00,
                "stock": 120,
                "category_id": categories.get("clothing"),
                "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
                "rating": 4.4,
            },
            {
                "name": "Winter Puffer Jacket",
                "description": "Lightweight water-resistant puffer jacket with thermal insulation. Perfect for cold weather.",
                "price": 3499.00,
                "stock": 45,
                "category_id": categories.get("clothing"),
                "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
                "rating": 4.1,
            },
            {
                "name": "The Art of Clean Code",
                "description": "A practical guide to writing elegant, maintainable, and efficient code. Must-read for developers.",
                "price": 499.00,
                "stock": 300,
                "category_id": categories.get("books"),
                "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500",
                "rating": 4.8,
            },
            {
                "name": "Minimalist Desk Lamp",
                "description": "Modern LED desk lamp with touch dimming, USB charging port, and adjustable arm.",
                "price": 1599.00,
                "stock": 60,
                "category_id": categories.get("home-kitchen"),
                "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
                "rating": 4.4,
            },
            {
                "name": "Ceramic Coffee Mug Set",
                "description": "Set of 4 handcrafted ceramic coffee mugs. Microwave and dishwasher safe.",
                "price": 899.00,
                "stock": 150,
                "category_id": categories.get("home-kitchen"),
                "image_url": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500",
                "rating": 4.3,
            },
            {
                "name": "Yoga Mat Premium",
                "description": "Extra-thick 6mm non-slip yoga mat with alignment lines. Eco-friendly TPE material.",
                "price": 1299.00,
                "stock": 90,
                "category_id": categories.get("sports"),
                "image_url": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
                "rating": 4.5,
            },
            {
                "name": "Leather Minimalist Wallet",
                "description": "Genuine leather slim wallet with RFID blocking. Holds up to 8 cards and cash.",
                "price": 999.00,
                "stock": 100,
                "category_id": categories.get("accessories"),
                "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500",
                "rating": 4.6,
            },
        ]

        for p_data in products_data:
            if p_data["category_id"] and not db.query(Product).filter(Product.name == p_data["name"]).first():
                db.add(Product(**p_data))

        # ── Coupons ──
        coupons_data = [
            {
                "code": "WELCOME10",
                "discount_type": "percent",
                "discount_value": 10.00,
                "min_order_amount": 500.00,
                "expiry_date": datetime.now(timezone.utc) + timedelta(days=90),
                "is_active": True,
            },
            {
                "code": "FLAT200",
                "discount_type": "flat",
                "discount_value": 200.00,
                "min_order_amount": 1000.00,
                "expiry_date": datetime.now(timezone.utc) + timedelta(days=60),
                "is_active": True,
            },
            {
                "code": "MEGA25",
                "discount_type": "percent",
                "discount_value": 25.00,
                "min_order_amount": 2000.00,
                "expiry_date": datetime.now(timezone.utc) + timedelta(days=30),
                "is_active": True,
            },
        ]
        for c_data in coupons_data:
            if not db.query(Coupon).filter(Coupon.code == c_data["code"]).first():
                db.add(Coupon(**c_data))

        db.commit()
        print("[OK] Database seeded successfully!")
        print("   Admin:  admin@shopvista.com / admin123")
        print("   User:   user@shopvista.com / user123")
        print(f"   Products: {db.query(Product).count()}")
        print(f"   Categories: {db.query(Category).count()}")
        print(f"   Coupons: WELCOME10, FLAT200, MEGA25")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
