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
        if not db.query(User).filter(User.email == "admin@foodieexpress.com").first():
            admin = User(
                name="Admin",
                email="admin@foodieexpress.com",
                password_hash=hash_password("admin123"),
                role="admin",
            )
            db.add(admin)

        # ── Demo User ──
        if not db.query(User).filter(User.email == "user@foodieexpress.com").first():
            demo_user = User(
                name="Demo User",
                email="user@foodieexpress.com",
                password_hash=hash_password("user123"),
                role="user",
            )
            db.add(demo_user)

        db.flush()

        # ── Categories ──
        categories_data = [
            {"name": "Burgers", "slug": "burgers"},
            {"name": "Pizza", "slug": "pizza"},
            {"name": "Drinks", "slug": "drinks"},
            {"name": "Desserts", "slug": "desserts"},
            {"name": "Sides", "slug": "sides"},
            {"name": "Salads", "slug": "salads"},
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
                "name": "Classic Cheeseburger",
                "description": "Juicy beef patty with melted cheddar, lettuce, tomato, and our secret sauce on a toasted brioche bun.",
                "price": 299.00,
                "stock": 100,
                "category_id": categories.get("burgers"),
                "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
                "rating": 4.8,
            },
            {
                "name": "Spicy Chicken Burger",
                "description": "Crispy fried chicken breast tossed in spicy buffalo sauce with jalapeños and pepper jack cheese.",
                "price": 349.00,
                "stock": 80,
                "category_id": categories.get("burgers"),
                "image_url": "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500",
                "rating": 4.7,
            },
            {
                "name": "Margherita Pizza",
                "description": "Classic Neapolitan pizza with San Marzano tomato sauce, fresh mozzarella, and basil leaves.",
                "price": 499.00,
                "stock": 50,
                "category_id": categories.get("pizza"),
                "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500",
                "rating": 4.6,
            },
            {
                "name": "Pepperoni Feast",
                "description": "Large pizza loaded with extra mozzarella cheese and double pepperoni.",
                "price": 649.00,
                "stock": 60,
                "category_id": categories.get("pizza"),
                "image_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500",
                "rating": 4.9,
            },
            {
                "name": "Coca-Cola (500ml)",
                "description": "Chilled classic Coca-Cola in a 500ml bottle.",
                "price": 60.00,
                "stock": 200,
                "category_id": categories.get("drinks"),
                "image_url": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500",
                "rating": 4.5,
            },
            {
                "name": "Iced Lemon Tea",
                "description": "Refreshing house-made iced tea with fresh squeezed lemon and mint.",
                "price": 120.00,
                "stock": 100,
                "category_id": categories.get("drinks"),
                "image_url": "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=500",
                "rating": 4.6,
            },
            {
                "name": "Chocolate Fudge Brownie",
                "description": "Warm, gooey chocolate brownie served with a scoop of vanilla ice cream.",
                "price": 199.00,
                "stock": 40,
                "category_id": categories.get("desserts"),
                "image_url": "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500",
                "rating": 4.9,
            },
            {
                "name": "New York Cheesecake",
                "description": "Classic creamy cheesecake with a graham cracker crust and berry compote.",
                "price": 249.00,
                "stock": 30,
                "category_id": categories.get("desserts"),
                "image_url": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500",
                "rating": 4.7,
            },
            {
                "name": "Crispy French Fries",
                "description": "Golden, shoestring fries seasoned with our special salt blend.",
                "price": 149.00,
                "stock": 150,
                "category_id": categories.get("sides"),
                "image_url": "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500",
                "rating": 4.5,
            },
            {
                "name": "Onion Rings",
                "description": "Thick-cut, beer-battered onion rings served with ranch dip.",
                "price": 179.00,
                "stock": 80,
                "category_id": categories.get("sides"),
                "image_url": "https://images.unsplash.com/photo-1639024471283-03518883512d?w=500",
                "rating": 4.6,
            },
            {
                "name": "Caesar Salad",
                "description": "Crisp romaine lettuce, garlic croutons, parmesan cheese and house Caesar dressing.",
                "price": 249.00,
                "stock": 60,
                "category_id": categories.get("salads"),
                "image_url": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500",
                "rating": 4.4,
            },
            {
                "name": "Greek Salad",
                "description": "Fresh cucumbers, tomatoes, red onions, kalamata olives, and feta cheese with vinaigrette.",
                "price": 279.00,
                "stock": 50,
                "category_id": categories.get("salads"),
                "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
                "rating": 4.5,
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
        print("   Admin:  admin@foodieexpress.com / admin123")
        print("   User:   user@foodieexpress.com / user123")
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
